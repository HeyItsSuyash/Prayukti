use axum::{
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    routing::get,
    Json, Router,
};
use serde_json::json;
use uuid::Uuid;
use chrono::{Utc, Datelike};

use crate::state::AppState;
use crate::middleware::auth::Claims;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/dashboard", get(get_dashboard_data))
}

async fn get_dashboard_data(
    State(state): State<AppState>,
    claims: Claims,
) -> impl IntoResponse {
    let user_id = match Uuid::parse_str(&claims.id) {
        Ok(uid) => uid,
        Err(_) => return (StatusCode::BAD_REQUEST, Json(json!({ "message": "Invalid user ID" }))).into_response(),
    };

    if claims.role == "student" {
        // Retrieve student's branch/semester
        let student = sqlx::query!(
            "SELECT branch, semester FROM users WHERE id = $1 AND role = 'student'",
            user_id
        )
        .fetch_optional(&state.db)
        .await;

        let (branch, semester) = match student {
            Ok(Some(info)) => (info.branch.unwrap_or_else(|| "Common".to_string()), info.semester.unwrap_or(1)),
            _ => ("Common".to_string(), 1),
        };

        // 1. Fetch today's classes
        let classes_today = sqlx::query!(
            r#"
            SELECT sc.id, sc.class_name, sc.scheduled_time, sc.room_link, u.full_name as teacher_name
            FROM schedules sc
            JOIN subjects s ON sc.subject_id = s.id
            JOIN users u ON sc.teacher_id = u.id
            WHERE s.branch = $1 AND s.semester = $2 
              AND sc.scheduled_time >= CURRENT_DATE 
              AND sc.scheduled_time < CURRENT_DATE + INTERVAL '1 day'
            ORDER BY sc.scheduled_time ASC
            "#,
            branch,
            semester
        )
        .fetch_all(&state.db)
        .await
        .unwrap_or_default();

        let classes_json: Vec<_> = classes_today.into_iter().map(|c| json!({
            "id": c.id.to_string(),
            "className": c.class_name,
            "scheduledTime": c.scheduled_time,
            "roomLink": c.room_link,
            "teacherName": c.teacher_name
        })).collect();

        // 2. Fetch pending tasks (exams assigned but not submitted)
        let pending_exams = sqlx::query!(
            r#"
            SELECT COUNT(*) as count FROM exams e
            JOIN exam_assigned_students eas ON e.id = eas.exam_id
            LEFT JOIN exam_sessions es ON e.id = es.exam_id AND es.student_id = $1
            WHERE eas.student_id = $1 AND e.status = 'active' AND (es.status IS NULL OR es.status = 'in_progress')
            "#,
            user_id
        )
        .fetch_one(&state.db)
        .await
        .map(|r| r.count.unwrap_or(0))
        .unwrap_or(0);

        // 3. Fetch latest announcements
        let announcements = sqlx::query!(
            r#"
            SELECT a.id, a.title, a.content, a.created_at, u.full_name as teacher_name
            FROM announcements a
            JOIN users u ON a.teacher_id = u.id
            JOIN user_assigned_subjects us ON a.subject_id = us.subject_id
            WHERE us.user_id = $1
            ORDER BY a.created_at DESC
            LIMIT 3
            "#,
            user_id
        )
        .fetch_all(&state.db)
        .await
        .unwrap_or_default();

        let announcements_json: Vec<_> = announcements.into_iter().map(|a| json!({
            "id": a.id.to_string(),
            "title": a.title,
            "content": a.content,
            "createdAt": a.created_at,
            "teacherName": a.teacher_name
        })).collect();

        // 4. Fetch engagement rating
        let latest_score = sqlx::query!(
            "SELECT score FROM engagement_scores WHERE student_id = $1 AND score_type = 'weekly' ORDER BY date DESC LIMIT 1",
            user_id
        )
        .fetch_optional(&state.db)
        .await
        .unwrap_or_default()
        .map(|r| r.score)
        .unwrap_or(75);

        // 5. Fetch classroom attendance percentage
        let total_classes = sqlx::query!(
            "SELECT COUNT(DISTINCT schedule_id) as count FROM classroom_attendance WHERE student_id = $1",
            user_id
        )
        .fetch_one(&state.db)
        .await
        .map(|r| r.count.unwrap_or(0))
        .unwrap_or(0);

        let present_classes = sqlx::query!(
            "SELECT COUNT(DISTINCT schedule_id) as count FROM classroom_attendance WHERE student_id = $1 AND status = 'present'",
            user_id
        )
        .fetch_one(&state.db)
        .await
        .map(|r| r.count.unwrap_or(0))
        .unwrap_or(0);

        let attendance_rate = if total_classes > 0 {
            (present_classes as f64 / total_classes as f64) * 100.0
        } else {
            80.0 // fallback default
        };

        (StatusCode::OK, Json(json!({
            "classesToday": classes_json,
            "pendingExams": pending_exams,
            "announcements": announcements_json,
            "engagementScore": latest_score,
            "attendanceRate": format!("{:.1}%", attendance_rate)
        }))).into_response()

    } else {
        // Teacher dashboard Overview
        let classes_today = sqlx::query!(
            r#"
            SELECT sc.id, sc.class_name, sc.scheduled_time, sc.room_link, s.title as subject_title
            FROM schedules sc
            JOIN subjects s ON sc.subject_id = s.id
            WHERE sc.teacher_id = $1 AND sc.scheduled_time >= CURRENT_DATE AND sc.scheduled_time < CURRENT_DATE + INTERVAL '1 day'
            ORDER BY sc.scheduled_time ASC
            "#,
            user_id
        )
        .fetch_all(&state.db)
        .await
        .unwrap_or_default();

        let classes_json: Vec<_> = classes_today.into_iter().map(|c| json!({
            "id": c.id.to_string(),
            "className": c.class_name,
            "scheduledTime": c.scheduled_time,
            "roomLink": c.room_link,
            "subjectTitle": c.subject_title
        })).collect();

        let total_students = sqlx::query!("SELECT COUNT(*) as count FROM users WHERE role = 'student'")
            .fetch_one(&state.db)
            .await
            .map(|r| r.count.unwrap_or(0))
            .unwrap_or(0);

        let active_students_count = sqlx::query!(
            "SELECT COUNT(DISTINCT student_id) as count FROM participation_events WHERE timestamp >= NOW() - INTERVAL '1 day'"
        )
        .fetch_one(&state.db)
        .await
        .map(|r| r.count.unwrap_or(0))
        .unwrap_or(0);

        let announcements = sqlx::query!(
            "SELECT id, title, created_at FROM announcements WHERE teacher_id = $1 ORDER BY created_at DESC LIMIT 3",
            user_id
        )
        .fetch_all(&state.db)
        .await
        .unwrap_or_default();

        let announcements_json: Vec<_> = announcements.into_iter().map(|a| json!({
            "id": a.id.to_string(),
            "title": a.title,
            "createdAt": a.created_at
        })).collect();

        (StatusCode::OK, Json(json!({
            "classesToday": classes_json,
            "totalStudents": total_students,
            "activeStudentsToday": active_students_count,
            "announcements": announcements_json
        }))).into_response()
    }
}
