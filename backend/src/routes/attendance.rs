use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use serde::{Deserialize, Serialize};
use serde_json::json;
use sqlx::{PgPool, Row};
use tracing::{error, info};
use uuid::Uuid;
use chrono::{DateTime, Utc, Datelike, TimeZone};

use crate::state::AppState;
use crate::middleware::auth::{Claims, require_role};
use crate::models::analytics::{AttendanceLog, AttendanceLogResponse, TeacherAlertResponse, StudentRiskResponse};
use crate::services::analytics::{compute_student_risk, check_and_create_alerts, check_suspicious_activity};

#[derive(Debug, Deserialize)]
pub struct AnalyticsQuery {
    pub range: Option<String>,
    pub date: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ReportQuery {
    pub month: Option<String>, // YYYY-MM
}

#[derive(Debug, Deserialize)]
pub struct LogLabRequest {
    pub subject: String,
    #[serde(rename = "labId")]
    pub lab_id: String,
}

pub async fn logout_attendance(
    State(state): State<AppState>,
    claims: Claims,
) -> impl IntoResponse {
    info!("[ATTENDANCE] Logout fired for: {}", claims.email);

    let student_id = match Uuid::parse_str(&claims.id) {
        Ok(uid) => uid,
        Err(_) => {
            return (
                StatusCode::BAD_REQUEST,
                Json(json!({ "message": "Invalid student ID format in token" })),
            );
        }
    };

    // Find active log (logout_time IS NULL)
    // First try claims.attendance_log_id
    let mut log_opt = None;
    if let Some(ref log_id_str) = claims.attendance_log_id {
        if let Ok(log_id) = Uuid::parse_str(log_id_str) {
            log_opt = sqlx::query_as::<_, AttendanceLog>(
                "SELECT * FROM attendance_logs WHERE id = $1"
            )
            .bind(log_id)
            .fetch_optional(&state.db)
            .await
            .unwrap_or(None);
        }
    }

    if log_opt.is_none() {
        // Fallback: latest log with logout_time null
        log_opt = sqlx::query_as::<_, AttendanceLog>(
            "SELECT * FROM attendance_logs WHERE student_id = $1 AND logout_time IS NULL ORDER BY login_time DESC LIMIT 1"
        )
        .bind(student_id)
        .fetch_optional(&state.db)
        .await
        .unwrap_or(None);
    }

    let log = match log_opt {
        Some(l) => l,
        None => {
            info!("[ATTENDANCE] No open session found for student: {}", student_id);
            return (StatusCode::OK, Json(json!({ "message": "Logged out" })));
        }
    };

    let now = Utc::now();
    let duration_ms = now.signed_duration_since(log.login_time).num_milliseconds();
    let duration = (duration_ms as f64 / 60000.0 * 10.0).round() / 10.0;

    let activity_score = log.activity_score;
    let mut status = "present";
    if duration < 2.0 {
        status = "absent";
    } else if activity_score < 20 {
        status = "inactive";
    }

    let update_res = sqlx::query(
        "UPDATE attendance_logs SET logout_time = $1, session_duration = $2, status = $3 WHERE id = $4"
    )
    .bind(now)
    .bind(duration)
    .bind(status)
    .bind(log.id)
    .execute(&state.db)
    .await;

    if let Err(e) = update_res {
        error!("[ATTENDANCE] Update logout failed: {:?}", e);
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "message": "Database error during logout" })),
        );
    }

    // Trigger suspicious activity and alert checks in the background (spawn tokio tasks)
    let db_clone = state.db.clone();
    let ip_clone = log.ip_address.clone();
    let date_clone = log.date.clone();
    tokio::spawn(async move {
        if let Err(e) = check_suspicious_activity(&db_clone, log.id, student_id, duration, ip_clone, &date_clone).await {
            error!("[ATTENDANCE] Suspicious check failed: {:?}", e);
        }
    });

    let db_clone2 = state.db.clone();
    tokio::spawn(async move {
        if let Err(e) = check_and_create_alerts(&db_clone2, student_id, duration).await {
            error!("[ATTENDANCE] Alert check failed: {:?}", e);
        }
    });

    (
        StatusCode::OK,
        Json(json!({
            "message": "Logged out successfully",
            "session_duration": duration
        })),
    )
}

pub async fn get_analytics(
    State(state): State<AppState>,
    claims: Claims,
    Query(params): Query<AnalyticsQuery>,
) -> impl IntoResponse {
    info!("[ATTENDANCE] Analytics requested by: {}", claims.email);
    if let Err(rejection) = require_role(&claims, &["teacher", "admin"]) {
        return rejection;
    }

    let range = params.range.unwrap_or_else(|| "daily".to_string());
    let now = Utc::now();
    let target_date = if let Some(ref d_str) = params.date {
        chrono::NaiveDate::parse_from_str(d_str, "%Y-%m-%d")
            .map(|nd| nd.and_hms_opt(0,0,0).unwrap().and_local_timezone(Utc).unwrap())
            .unwrap_or(now)
    } else {
        now
    };

    let (query_start, query_end) = match range.as_str() {
        "daily" => {
            let start = Utc.with_ymd_and_hms(target_date.year(), target_date.month(), target_date.day(), 0, 0, 0).unwrap();
            let end = Utc.with_ymd_and_hms(target_date.year(), target_date.month(), target_date.day(), 23, 59, 59).unwrap();
            (start, end)
        }
        "weekly" => {
            // Monday of target_date week
            let day = target_date.weekday().num_days_from_monday();
            let start = target_date.checked_sub_signed(chrono::Duration::days(day as i64)).unwrap();
            let start = Utc.with_ymd_and_hms(start.year(), start.month(), start.day(), 0, 0, 0).unwrap();
            let end = start.checked_add_signed(chrono::Duration::days(6)).unwrap();
            let end = Utc.with_ymd_and_hms(end.year(), end.month(), end.day(), 23, 59, 59).unwrap();
            (start, end)
        }
        _ => { // monthly
            let start = Utc.with_ymd_and_hms(target_date.year(), target_date.month(), 1, 0, 0, 0).unwrap();
            let next_month = if target_date.month() == 12 { 1 } else { target_date.month() + 1 };
            let next_month_year = if target_date.month() == 12 { target_date.year() + 1 } else { target_date.year() };
            let end = Utc.with_ymd_and_hms(next_month_year, next_month, 1, 0, 0, 0)
                .unwrap()
                .checked_sub_signed(chrono::Duration::days(1))
                .unwrap();
            let end = Utc.with_ymd_and_hms(end.year(), end.month(), end.day(), 23, 59, 59).unwrap();
            (start, end)
        }
    };

    // presentCount
    let present_count_res: Result<i64, _> = sqlx::query(
        "SELECT COUNT(*) FROM attendance_logs WHERE login_time >= $1 AND login_time <= $2"
    )
    .bind(query_start)
    .bind(query_end)
    .fetch_one(&state.db)
    .await
    .map(|r| r.get(0));

    let present_count = present_count_res.unwrap_or(0);

    // totalStudents
    let total_students_res: Result<i64, _> = sqlx::query(
        "SELECT COUNT(*) FROM users WHERE role = 'student'"
    )
    .fetch_one(&state.db)
    .await
    .map(|r| r.get(0));

    let total_students = total_students_res.unwrap_or(0);
    let attendance_rate = if total_students > 0 {
        ((present_count as f64 / total_students as f64) * 100.0).round() as i64
    } else {
        0
    };

    // experimentCompletionRate
    // total distinct students who completed at least one experiment
    let completed_students_res: Result<i64, _> = sqlx::query(
        "SELECT COUNT(DISTINCT student_id) FROM experiment_activities WHERE result_generated = TRUE"
    )
    .fetch_one(&state.db)
    .await
    .map(|r| r.get(0));

    let completed_students = completed_students_res.unwrap_or(0);
    let experiment_completion_rate = if total_students > 0 {
        (completed_students as f64 / total_students as f64) * 100.0
    } else {
        0.0
    };

    // average_lab_time_minutes
    let avg_lab_time_res = sqlx::query(
        "SELECT AVG(session_duration) FROM attendance_logs WHERE login_time >= $1 AND login_time <= $2 AND session_duration > 0"
    )
    .bind(query_start)
    .bind(query_end)
    .fetch_one(&state.db)
    .await;

    let average_lab_time_minutes = avg_lab_time_res
        .map(|r| r.get::<Option<f64>, _>(0).unwrap_or(0.0))
        .unwrap_or(0.0);

    // At risk students computation
    let mut at_risk_students = Vec::new();
    let students_res = sqlx::query(
        "SELECT id, full_name, roll_no FROM users WHERE role = 'student'"
    )
    .fetch_all(&state.db)
    .await;

    if let Ok(students) = students_res {
        for row in students {
            let s_id: Uuid = row.get("id");
            let s_name: String = row.get("full_name");
            let s_roll: Option<String> = row.get("roll_no");

            if let Ok(risk) = compute_student_risk(&state.db, s_id).await {
                if risk.risk_status == "At Risk" {
                    at_risk_students.push(json!({
                        "student_id": s_id.to_string(),
                        "name": s_name,
                        "roll_number": s_roll.unwrap_or_default(),
                        "risk_status": risk.risk_status
                    }));
                }
            }
        }
    }

    (
        StatusCode::OK,
        Json(json!({
            "total_students": total_students,
            "present_count": present_count,
            "attendance_rate_percent": attendance_rate.to_string(),
            "experiment_completion_rate": format!("{:.1}", experiment_completion_rate),
            "average_lab_time_minutes": format!("{:.1}", average_lab_time_minutes),
            "at_risk_students": at_risk_students
        })),
    )
}

pub async fn get_report(
    State(state): State<AppState>,
    claims: Claims,
    Query(params): Query<ReportQuery>,
) -> impl IntoResponse {
    info!("[ATTENDANCE] Report requested by: {}", claims.email);
    if let Err(rejection) = require_role(&claims, &["teacher", "admin"]) {
        return rejection;
    }

    // Parse month YYYY-MM
    let now = Utc::now();
    let month_str = params.month.unwrap_or_else(|| format!("{:04}-{:02}", now.year(), now.month()));
    let parts: Vec<&str> = month_str.split('-').collect();
    let (year, month) = if parts.len() == 2 {
        (parts[0].parse().unwrap_or(now.year()), parts[1].parse().unwrap_or(now.month()))
    } else {
        (now.year(), now.month())
    };

    let start_of_month = Utc.with_ymd_and_hms(year, month, 1, 0, 0, 0).unwrap();
    let next_month = if month == 12 { 1 } else { month + 1 };
    let next_month_year = if month == 12 { year + 1 } else { year };
    let end_of_month = Utc.with_ymd_and_hms(next_month_year, next_month, 1, 0, 0, 0)
        .unwrap()
        .checked_sub_signed(chrono::Duration::days(1))
        .unwrap();

    let students_res = sqlx::query(
        "SELECT id, full_name, roll_no FROM users WHERE role = 'student'"
    )
    .fetch_all(&state.db)
    .await;

    let mut report = Vec::new();

    if let Ok(students) = students_res {
        for row in students {
            let s_id: Uuid = row.get("id");
            let s_name: String = row.get("full_name");
            let s_roll: Option<String> = row.get("roll_no");

            let risk = compute_student_risk(&state.db, s_id).await.unwrap_or(StudentRiskResponse {
                attendance_percentage: 0.0,
                experiment_completion_percentage: 0.0,
                average_lab_time_minutes: 0.0,
                risk_status: "Good Standing".to_string(),
            });

            // Experiments completed count in target month
            let completed_count: i64 = match sqlx::query(
                "SELECT COUNT(*) FROM experiment_activities WHERE student_id = $1 AND result_generated = TRUE AND last_run_at >= $2 AND last_run_at <= $3"
            )
            .bind(s_id)
            .bind(start_of_month)
            .bind(end_of_month)
            .fetch_one(&state.db)
            .await {
                Ok(row) => row.get(0),
                Err(_) => 0,
            };

            report.push(json!({
                "student_name": s_name,
                "roll_number": s_roll.unwrap_or_default(),
                "attendance_percentage": format!("{:.1}", risk.attendance_percentage),
                "experiments_completed": completed_count,
                "average_time_spent": format!("{:.1}", risk.average_lab_time_minutes),
                "risk_status": risk.risk_status
            }));
        }
    }

    (StatusCode::OK, Json(json!(report)))
}

pub async fn get_alerts(
    State(state): State<AppState>,
    claims: Claims,
) -> impl IntoResponse {
    info!("[ATTENDANCE] Fetching alerts requested by: {}", claims.email);
    if let Err(rejection) = require_role(&claims, &["teacher", "admin"]) {
        return rejection;
    }

    // Join with users to populate student info (fullName, rollNo)
    let alerts_res = sqlx::query(
        r#"
        SELECT a.id, a.student_id, a.alert_type, a.message, a.created_at, a.resolved, u.full_name, u.roll_no
        FROM teacher_alerts a
        JOIN users u ON a.student_id = u.id
        WHERE a.resolved = FALSE
        ORDER BY a.created_at DESC
        "#
    )
    .fetch_all(&state.db)
    .await;

    match alerts_res {
        Ok(rows) => {
            let mut list = Vec::new();
            for r in rows {
                let alert_id: Uuid = r.get("id");
                let alert_type: String = r.get("alert_type");
                let message: String = r.get("message");
                let created_at: DateTime<Utc> = r.get("created_at");
                let resolved: bool = r.get("resolved");
                let full_name: String = r.get("full_name");
                let roll_no: Option<String> = r.get("roll_no");

                list.push(TeacherAlertResponse {
                    id: alert_id.to_string(),
                    student_id: json!({
                        "fullName": full_name,
                        "rollNo": roll_no.unwrap_or_default()
                    }),
                    alert_type,
                    message,
                    created_at,
                    resolved,
                });
            }
            (StatusCode::OK, Json(json!(list)))
        }
        Err(e) => {
            error!("[ATTENDANCE] Failed to fetch alerts: {:?}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "message": "Failed to fetch alerts" })),
            )
        }
    }
}

pub async fn resolve_alert(
    State(state): State<AppState>,
    claims: Claims,
    Path(id): Path<Uuid>,
) -> impl IntoResponse {
    info!("[ATTENDANCE] Alert resolution for ID: {} by {}", id, claims.email);
    if let Err(rejection) = require_role(&claims, &["teacher", "admin"]) {
        return rejection;
    }

    let resolve_res = sqlx::query(
        "UPDATE teacher_alerts SET resolved = TRUE WHERE id = $1 RETURNING *"
    )
    .bind(id)
    .fetch_optional(&state.db)
    .await;

    match resolve_res {
        Ok(Some(row)) => {
            let alert_id: Uuid = row.get("id");
            let student_id: Uuid = row.get("student_id");
            let alert_type: String = row.get("alert_type");
            let message: String = row.get("message");
            let created_at: DateTime<Utc> = row.get("created_at");
            let resolved: bool = row.get("resolved");

            (
                StatusCode::OK,
                Json(json!(TeacherAlertResponse {
                    id: alert_id.to_string(),
                    student_id: json!(student_id.to_string()),
                    alert_type,
                    message,
                    created_at,
                    resolved,
                })),
            )
        }
        Ok(None) => {
            (
                StatusCode::NOT_FOUND,
                Json(json!({ "message": "Alert not found" })),
            )
        }
        Err(e) => {
            error!("[ATTENDANCE] Resolve alert failed: {:?}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "message": "Database update failed" })),
            )
        }
    }
}

pub async fn get_student_data(
    State(state): State<AppState>,
    claims: Claims,
    Path(student_id_str): Path<String>,
) -> impl IntoResponse {
    info!("[ATTENDANCE] Fetch student data for ID: {}", student_id_str);

    let student_id = match Uuid::parse_str(&student_id_str) {
        Ok(uid) => uid,
        Err(_) => {
            return (
                StatusCode::BAD_REQUEST,
                Json(json!({ "message": "Invalid student ID format" })),
            );
        }
    };

    // Ownership or role check
    if claims.id != student_id_str && claims.role != "teacher" && claims.role != "admin" {
        return (
            StatusCode::FORBIDDEN,
            Json(json!({ "message": "Not authorized to view this student's data" })),
        );
    }

    let risk_summary = match compute_student_risk(&state.db, student_id).await {
        Ok(summary) => json!(summary),
        Err(e) => {
            error!("[ATTENDANCE] Risk calculation failed: {:?}", e);
            json!({})
        }
    };

    // Fetch recent 10 sessions
    let logs_res = sqlx::query_as::<_, AttendanceLog>(
        "SELECT * FROM attendance_logs WHERE student_id = $1 ORDER BY login_time DESC LIMIT 10"
    )
    .bind(student_id)
    .fetch_all(&state.db)
    .await;

    let logs: Vec<AttendanceLogResponse> = logs_res
        .unwrap_or_default()
        .into_iter()
        .map(Into::into)
        .collect();

    // Fetch experiment activities
    let activities_res = sqlx::query(
        "SELECT * FROM experiment_activities WHERE student_id = $1 ORDER BY last_run_at DESC"
    )
    .bind(student_id)
    .fetch_all(&state.db)
    .await;

    let mut activities = Vec::new();
    if let Ok(rows) = activities_res {
        for r in rows {
            let act_id: Uuid = r.get("id");
            let exp_id: Uuid = r.get("experiment_id");
            let exp_name: Option<String> = r.get("experiment_name");
            let run_count: i32 = r.get("run_count");
            let time_spent: i32 = r.get("time_spent");
            let result_generated: bool = r.get("result_generated");
            let last_run_at: DateTime<Utc> = r.get("last_run_at");

            activities.push(json!({
                "_id": act_id.to_string(),
                "student_id": student_id.to_string(),
                "experiment_id": exp_id.to_string(),
                "experiment_name": exp_name.unwrap_or_default(),
                "run_count": run_count,
                "time_spent": time_spent,
                "result_generated": result_generated,
                "last_run_at": last_run_at,
            }));
        }
    }

    (
        StatusCode::OK,
        Json(json!({
            "risk_summary": risk_summary,
            "logs": logs,
            "experiment_activity": activities
        })),
    )
}

pub async fn log_lab(
    State(state): State<AppState>,
    claims: Claims,
    Json(payload): Json<LogLabRequest>,
) -> impl IntoResponse {
    info!("[ATTENDANCE] log-lab for subject: {} and lab_id: {}", payload.subject, payload.lab_id);

    let student_id = match Uuid::parse_str(&claims.id) {
        Ok(uid) => uid,
        Err(_) => {
            return (
                StatusCode::BAD_REQUEST,
                Json(json!({ "message": "Invalid student ID" })),
            );
        }
    };

    let subject_map = |sub: &str| -> (&str, &str) {
        match sub.to_uppercase().as_str() {
            "DSA" => ("BCS-301", "Data Structures and Algorithms"),
            "CN" => ("BCS-502", "Computer Networks"),
            "DLD" => ("BCS-303", "Digital Logic & Design"),
            "DBMS" => ("BCS-404", "Database Management System"),
            "OOPS" => ("BCS-405", "Object Oriented Programming"),
            "MPMC" => ("BCS-506", "Microprocessor and Microcontroller"),
            "C" => ("BCS-107", "C Programming Lab"),
            "DAA" => ("BCS-408", "Design and Analysis of Algorithms"),
            _ => ("BCS-000", "Unknown"),
        }
    };

    let (target_id, target_name) = subject_map(&payload.subject);

    // Try finding active log
    let mut log_opt = None;
    if let Some(ref log_id_str) = claims.attendance_log_id {
        if let Ok(log_id) = Uuid::parse_str(log_id_str) {
            log_opt = sqlx::query_as::<_, AttendanceLog>(
                "SELECT * FROM attendance_logs WHERE id = $1"
            )
            .bind(log_id)
            .fetch_optional(&state.db)
            .await
            .unwrap_or(None);
        }
    }

    if log_opt.is_none() {
        log_opt = sqlx::query_as::<_, AttendanceLog>(
            "SELECT * FROM attendance_logs WHERE student_id = $1 AND logout_time IS NULL ORDER BY login_time DESC LIMIT 1"
        )
        .bind(student_id)
        .fetch_optional(&state.db)
        .await
        .unwrap_or(None);
    }

    if let Some(mut log) = log_opt {
        let mut current_ids: Vec<String> = if log.subject_id == "BCS-000" {
            Vec::new()
        } else {
            log.subject_id.split(", ").map(String::from).collect()
        };
        let mut current_names: Vec<String> = if log.subject_name == "None" {
            Vec::new()
        } else {
            log.subject_name.split(", ").map(String::from).collect()
        };

        if !current_ids.contains(&target_id.to_string()) {
            current_ids.push(target_id.to_string());
            current_names.push(target_name.to_string());
        }

        let next_ids = if !current_ids.is_empty() { current_ids.join(", ") } else { target_id.to_string() };
        let next_names = if !current_names.is_empty() { current_names.join(", ") } else { target_name.to_string() };

        let update_res = sqlx::query(
            "UPDATE attendance_logs SET subject_id = $1, subject_name = $2, lab_id = $3 WHERE id = $4 RETURNING *"
        )
        .bind(&next_ids)
        .bind(&next_names)
        .bind(&payload.lab_id)
        .bind(log.id)
        .fetch_one(&state.db)
        .await;

        match update_res {
            Ok(row) => {
                log.subject_id = row.get("subject_id");
                log.subject_name = row.get("subject_name");
                log.lab_id = row.get("lab_id");

                let resp: AttendanceLogResponse = log.into();
                (StatusCode::OK, Json(json!({ "message": "Attendance updated", "log": resp })))
            }
            Err(e) => {
                error!("[ATTENDANCE] log-lab update failed: {:?}", e);
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(json!({ "message": "Failed to update lab log in DB" })),
                )
            }
        }
    } else {
        // Create fallback log
        let new_id = Uuid::new_v4();
        let today_str = Utc::now().format("%Y-%m-%d").to_string();
        let insert_res = sqlx::query(
            r#"
            INSERT INTO attendance_logs (id, student_id, student_email, subject_id, subject_name, lab_id, login_time, logout_time, session_duration, status, date)
            VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, NULL, 0.0, 'in_progress', $7)
            RETURNING *
            "#
        )
        .bind(new_id)
        .bind(student_id)
        .bind(&claims.email)
        .bind(target_id)
        .bind(target_name)
        .bind(&payload.lab_id)
        .bind(&today_str)
        .fetch_one(&state.db)
        .await;

        match insert_res {
            Ok(row) => {
                let created_log = AttendanceLog {
                    id: row.get("id"),
                    student_id: row.get("student_id"),
                    student_email: row.get("student_email"),
                    subject_id: row.get("subject_id"),
                    subject_name: row.get("subject_name"),
                    lab_id: row.get("lab_id"),
                    login_time: row.get("login_time"),
                    logout_time: row.get("logout_time"),
                    session_duration: row.get("session_duration"),
                    activity_score: row.get("activity_score"),
                    status: row.get("status"),
                    ip_address: row.get("ip_address"),
                    date: row.get("date"),
                    is_suspicious: row.get("is_suspicious"),
                };
                let resp: AttendanceLogResponse = created_log.into();
                (StatusCode::CREATED, Json(json!({ "message": "New lab attendance logged", "log": resp })))
            }
            Err(e) => {
                error!("[ATTENDANCE] log-lab fallback insert failed: {:?}", e);
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(json!({ "message": "Failed to create fallback lab log in DB" })),
                )
            }
        }
    }
}
