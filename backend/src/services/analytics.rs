use sqlx::{PgPool, Row};
use uuid::Uuid;
use chrono::{Datelike, Utc, TimeZone};
use tracing::info;

use crate::models::analytics::StudentRiskResponse;

pub async fn compute_student_risk(
    db: &PgPool,
    student_id: Uuid,
) -> Result<StudentRiskResponse, sqlx::Error> {
    let now = Utc::now();
    
    // 1. Attendance percentage for current month
    // Determine start of month and end of month dates as YYYY-MM-DD
    let start_of_month_str = format!("{:04}-{:02}-01", now.year(), now.month());
    // Get last day of month
    let next_month = if now.month() == 12 { 1 } else { now.month() + 1 };
    let next_month_year = if now.month() == 12 { now.year() + 1 } else { now.year() };
    let end_of_month_date = Utc.with_ymd_and_hms(next_month_year, next_month, 1, 0, 0, 0)
        .unwrap()
        .checked_sub_signed(chrono::Duration::days(1))
        .unwrap();
    let end_of_month_str = format!("{:04}-{:02}-{:02}", end_of_month_date.year(), end_of_month_date.month(), end_of_month_date.day());

    let attendance_count: i64 = sqlx::query(
        "SELECT COUNT(*) FROM attendance_logs WHERE student_id = $1 AND date >= $2 AND date <= $3"
    )
    .bind(student_id)
    .bind(&start_of_month_str)
    .bind(&end_of_month_str)
    .fetch_one(db)
    .await?
    .get(0);

    let attendance_percentage = (attendance_count as f64 / 26.0) * 100.0;

    // 2. Experiment completion percentage
    let total_experiments: i64 = sqlx::query(
        "SELECT COUNT(*) FROM experiments"
    )
    .fetch_one(db)
    .await?
    .get(0);

    let attempted_experiments: i64 = sqlx::query(
        "SELECT COUNT(DISTINCT experiment_id) FROM experiment_activities WHERE student_id = $1 AND result_generated = TRUE"
    )
    .bind(student_id)
    .fetch_one(db)
    .await?
    .get(0);

    let experiment_completion_percentage = if total_experiments > 0 {
        (attempted_experiments as f64 / total_experiments as f64) * 100.0
    } else {
        0.0
    };

    // 3. Average lab time (minutes)
    let avg_row = sqlx::query(
        "SELECT AVG(session_duration) FROM attendance_logs WHERE student_id = $1 AND session_duration > 0"
    )
    .bind(student_id)
    .fetch_one(db)
    .await?;

    let average_lab_time_minutes = avg_row.get::<Option<f64>, _>(0).unwrap_or(0.0);

    // 4. Determine risk status
    let is_low_attendance = attendance_percentage < 60.0;
    let is_low_completion = experiment_completion_percentage < 50.0;
    let is_low_time = average_lab_time_minutes < 10.0;

    let risk_status = if is_low_attendance && is_low_completion && is_low_time {
        "At Risk".to_string()
    } else if is_low_attendance || is_low_completion || is_low_time {
        "Needs Attention".to_string()
    } else {
        "Good Standing".to_string()
    };

    Ok(StudentRiskResponse {
        attendance_percentage,
        experiment_completion_percentage,
        average_lab_time_minutes,
        risk_status,
    })
}

async fn alert_exists_today(
    db: &PgPool,
    student_id: Uuid,
    alert_type: &str,
    today_start: chrono::DateTime<Utc>,
    today_end: chrono::DateTime<Utc>,
) -> bool {
    let row_res = sqlx::query(
        "SELECT COUNT(*) FROM teacher_alerts WHERE student_id = $1 AND alert_type = $2 AND resolved = FALSE AND created_at >= $3 AND created_at <= $4"
    )
    .bind(student_id)
    .bind(alert_type)
    .bind(today_start)
    .bind(today_end)
    .fetch_one(db)
    .await;

    let count: i64 = match row_res {
        Ok(r) => r.get(0),
        Err(_) => 0,
    };
    count > 0
}

pub async fn check_and_create_alerts(
    db: &PgPool,
    student_id: Uuid,
    session_duration: f64,
) -> Result<(), sqlx::Error> {
    let now = Utc::now();
    let today_start = Utc.with_ymd_and_hms(now.year(), now.month(), now.day(), 0, 0, 0).unwrap();
    let today_end = Utc.with_ymd_and_hms(now.year(), now.month(), now.day(), 23, 59, 59).unwrap();

    // a) Attendance check (current month)
    let start_of_month_str = format!("{:04}-{:02}-01", now.year(), now.month());
    let next_month = if now.month() == 12 { 1 } else { now.month() + 1 };
    let next_month_year = if now.month() == 12 { now.year() + 1 } else { now.year() };
    let end_of_month_date = Utc.with_ymd_and_hms(next_month_year, next_month, 1, 0, 0, 0)
        .unwrap()
        .checked_sub_signed(chrono::Duration::days(1))
        .unwrap();
    let end_of_month_str = format!("{:04}-{:02}-{:02}", end_of_month_date.year(), end_of_month_date.month(), end_of_month_date.day());

    let attendance_count: i64 = sqlx::query(
        "SELECT COUNT(*) FROM attendance_logs WHERE student_id = $1 AND date >= $2 AND date <= $3"
    )
    .bind(student_id)
    .bind(&start_of_month_str)
    .bind(&end_of_month_str)
    .fetch_one(db)
    .await?
    .get(0);

    let attendance_percentage = (attendance_count as f64 / 26.0) * 100.0;

    if attendance_percentage < 50.0 && !alert_exists_today(db, student_id, "LOW_ATTENDANCE", today_start, today_end).await {
        let msg = format!("Student attendance is {:.1}% this month", attendance_percentage);
        let alert_id = Uuid::new_v4();
        sqlx::query(
            "INSERT INTO teacher_alerts (id, student_id, alert_type, message) VALUES ($1, $2, 'LOW_ATTENDANCE', $3)"
        )
        .bind(alert_id)
        .bind(student_id)
        .bind(&msg)
        .execute(db)
        .await?;
        info!("[ALERT] Created LOW_ATTENDANCE alert for student: {}", student_id);
    }

    // b) Missed experiments check
    let total_experiments: i64 = sqlx::query(
        "SELECT COUNT(*) FROM experiments"
    )
    .fetch_one(db)
    .await?
    .get(0);

    let attempted_experiments: i64 = sqlx::query(
        "SELECT COUNT(DISTINCT experiment_id) FROM experiment_activities WHERE student_id = $1"
    )
    .bind(student_id)
    .fetch_one(db)
    .await?
    .get(0);

    let missed = total_experiments - attempted_experiments;

    if missed >= 3 && !alert_exists_today(db, student_id, "MISSED_EXPERIMENTS", today_start, today_end).await {
        let msg = format!("Student has not attempted {} experiments", missed);
        let alert_id = Uuid::new_v4();
        sqlx::query(
            "INSERT INTO teacher_alerts (id, student_id, alert_type, message) VALUES ($1, $2, 'MISSED_EXPERIMENTS', $3)"
        )
        .bind(alert_id)
        .bind(student_id)
        .bind(&msg)
        .execute(db)
        .await?;
        info!("[ALERT] Created MISSED_EXPERIMENTS alert for student: {}", student_id);
    }

    // c) Short session check
    if session_duration < 2.0 && !alert_exists_today(db, student_id, "SHORT_SESSION", today_start, today_end).await {
        let msg = format!("Student login session was only {:.1} minutes", session_duration);
        let alert_id = Uuid::new_v4();
        sqlx::query(
            "INSERT INTO teacher_alerts (id, student_id, alert_type, message) VALUES ($1, $2, 'SHORT_SESSION', $3)"
        )
        .bind(alert_id)
        .bind(student_id)
        .bind(&msg)
        .execute(db)
        .await?;
        info!("[ALERT] Created SHORT_SESSION alert for student: {}", student_id);
    }

    Ok(())
}

pub async fn check_suspicious_activity(
    db: &PgPool,
    log_id: Uuid,
    student_id: Uuid,
    session_duration: f64,
    ip_address: Option<String>,
    date_str: &str,
) -> Result<(), sqlx::Error> {
    // A. Short session
    if session_duration < 2.0 {
        let act_id = Uuid::new_v4();
        sqlx::query(
            "INSERT INTO suspicious_activities (id, student_id, reason, ip_address) VALUES ($1, $2, 'SHORT_SESSION', $3)"
        )
        .bind(act_id)
        .bind(student_id)
        .bind(&ip_address)
        .execute(db)
        .await?;
    }

    // B. Concurrent login (same IP, different session still open)
    if let Some(ref ip) = ip_address {
        let concurrent_count: i64 = sqlx::query(
            "SELECT COUNT(*) FROM attendance_logs WHERE id != $1 AND ip_address = $2 AND logout_time IS NULL"
        )
        .bind(log_id)
        .bind(ip)
        .fetch_one(db)
        .await?
        .get(0);

        if concurrent_count > 0 {
            let act_id = Uuid::new_v4();
            sqlx::query(
                "INSERT INTO suspicious_activities (id, student_id, reason, ip_address) VALUES ($1, $2, 'CONCURRENT_LOGIN', $3)"
            )
            .bind(act_id)
            .bind(student_id)
            .bind(ip)
            .execute(db)
            .await?;
        }
    }

    // C. Short session AND no ExperimentActivity today
    if session_duration < 2.0 {
        let today_start = format!("{} 00:00:00+00", date_str);
        let today_end = format!("{} 23:59:59+00", date_str);

        // Convert strings or timestamp
        let activity_today_count: i64 = sqlx::query(
            "SELECT COUNT(*) FROM experiment_activities WHERE student_id = $1 AND last_run_at >= CAST($2 AS TIMESTAMPTZ) AND last_run_at <= CAST($3 AS TIMESTAMPTZ)"
        )
        .bind(student_id)
        .bind(&today_start)
        .bind(&today_end)
        .fetch_one(db)
        .await?
        .get(0);

        if activity_today_count == 0 {
            let act_id = Uuid::new_v4();
            sqlx::query(
                "INSERT INTO suspicious_activities (id, student_id, reason, ip_address) VALUES ($1, $2, 'NO_EXPERIMENT_RUN', $3)"
            )
            .bind(act_id)
            .bind(student_id)
            .bind(&ip_address)
            .execute(db)
            .await?;
        }
    }

    Ok(())
}
