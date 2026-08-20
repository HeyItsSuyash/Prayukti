use axum::{
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use serde::Deserialize;
use serde_json::json;
use uuid::Uuid;

use crate::state::AppState;
use crate::middleware::auth::{Claims, require_role};

#[derive(Debug, Deserialize)]
pub struct QuestionGenerationRequest {
    pub resource_title: Option<String>,
    pub count: Option<usize>,
    pub question_type: Option<String>,
    pub difficulty: Option<String>,
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/dashboard", get(get_teacher_dashboard))
        .route("/smart-class", post(create_smart_class))
        .route("/announcement", post(create_teacher_announcement))
        .route("/generate-questions", post(generate_questions))
}

async fn get_teacher_dashboard(
    State(state): State<AppState>,
    claims: Claims,
) -> impl IntoResponse {
    if let Err(err) = require_role(&claims, &["teacher", "admin"]) {
        return err.into_response();
    }

    let teacher_id = match Uuid::parse_str(&claims.id) {
        Ok(uid) => uid,
        Err(_) => return (StatusCode::BAD_REQUEST, Json(json!({ "message": "Invalid user ID" }))).into_response(),
    };

    // Dynamic queries using sqlx::query for SQLX_OFFLINE compatibility
    let schedules_count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM schedules WHERE teacher_id = $1")
        .bind(teacher_id)
        .fetch_one(&state.db)
        .await
        .unwrap_or(0);

    let announcements_count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM announcements WHERE teacher_id = $1")
        .bind(teacher_id)
        .fetch_one(&state.db)
        .await
        .unwrap_or(0);

    let resources_count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM classroom_resources")
        .fetch_one(&state.db)
        .await
        .unwrap_or(0);

    let students_count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM users WHERE role = 'student'")
        .fetch_one(&state.db)
        .await
        .unwrap_or(0);

    let upcoming_rows = sqlx::query(
        r#"
        SELECT s.id, s.class_name, s.scheduled_time, s.duration_minutes, s.room_link, sub.title as subject_title
        FROM schedules s
        LEFT JOIN subjects sub ON s.subject_id = sub.id
        WHERE s.teacher_id = $1
        ORDER BY s.scheduled_time DESC
        LIMIT 5
        "#
    )
    .bind(teacher_id)
    .fetch_all(&state.db)
    .await
    .unwrap_or_default();

    use sqlx::Row;
    let upcoming_json: Vec<_> = upcoming_rows.into_iter().map(|r| {
        let id: Uuid = r.get("id");
        let class_name: String = r.get("class_name");
        let scheduled_time: chrono::DateTime<chrono::Utc> = r.get("scheduled_time");
        let duration_minutes: i32 = r.get("duration_minutes");
        let room_link: String = r.get("room_link");
        let subject_title: Option<String> = r.get("subject_title");
        json!({
            "id": id.to_string(),
            "className": class_name,
            "scheduledTime": scheduled_time,
            "durationMinutes": duration_minutes,
            "roomLink": room_link,
            "subjectTitle": subject_title.unwrap_or_else(|| "General".to_string())
        })
    }).collect();

    let announcement_rows = sqlx::query(
        r#"
        SELECT a.id, a.title, a.content, a.created_at, sub.title as subject_title
        FROM announcements a
        LEFT JOIN subjects sub ON a.subject_id = sub.id
        WHERE a.teacher_id = $1
        ORDER BY a.created_at DESC
        LIMIT 5
        "#
    )
    .bind(teacher_id)
    .fetch_all(&state.db)
    .await
    .unwrap_or_default();

    let announcements_json: Vec<_> = announcement_rows.into_iter().map(|r| {
        let id: Uuid = r.get("id");
        let title: String = r.get("title");
        let content: String = r.get("content");
        let created_at: Option<chrono::DateTime<chrono::Utc>> = r.get("created_at");
        let subject_title: Option<String> = r.get("subject_title");
        json!({
            "id": id.to_string(),
            "title": title,
            "content": content,
            "createdAt": created_at,
            "subjectTitle": subject_title.unwrap_or_else(|| "General".to_string())
        })
    }).collect();

    (
        StatusCode::OK,
        Json(json!({
            "stats": {
                "totalSchedules": schedules_count,
                "totalAnnouncements": announcements_count,
                "totalResources": resources_count,
                "totalStudents": students_count
            },
            "upcomingSchedules": upcoming_json,
            "recentAnnouncements": announcements_json
        })),
    ).into_response()
}

#[derive(Debug, Deserialize)]
pub struct CreateSmartClassPayload {
    pub subject_id: Uuid,
    pub class_name: String,
    pub scheduled_time: chrono::DateTime<chrono::Utc>,
    pub duration_minutes: Option<i32>,
    pub room_link: Option<String>,
    pub batch: Option<String>,
    pub recurring: Option<bool>,
}

async fn create_smart_class(
    State(state): State<AppState>,
    claims: Claims,
    Json(payload): Json<CreateSmartClassPayload>,
) -> impl IntoResponse {
    if let Err(err) = require_role(&claims, &["teacher", "admin"]) {
        return err.into_response();
    }

    let teacher_id = match Uuid::parse_str(&claims.id) {
        Ok(uid) => uid,
        Err(_) => return (StatusCode::BAD_REQUEST, Json(json!({ "message": "Invalid teacher ID" }))).into_response(),
    };

    let duration = payload.duration_minutes.unwrap_or(60);
    let room = payload.room_link.unwrap_or_else(|| "https://meet.google.com/prayukti-vlab".to_string());
    let is_recurring = payload.recurring.unwrap_or(false);

    let row = sqlx::query(
        r#"
        INSERT INTO schedules (subject_id, teacher_id, class_name, scheduled_time, duration_minutes, room_link, batch, recurring)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, class_name, scheduled_time, room_link
        "#
    )
    .bind(payload.subject_id)
    .bind(teacher_id)
    .bind(&payload.class_name)
    .bind(payload.scheduled_time)
    .bind(duration)
    .bind(&room)
    .bind(&payload.batch)
    .bind(is_recurring)
    .fetch_one(&state.db)
    .await;

    use sqlx::Row;
    match row {
        Ok(r) => {
            let id: Uuid = r.get("id");
            let class_name: String = r.get("class_name");
            let scheduled_time: chrono::DateTime<chrono::Utc> = r.get("scheduled_time");
            let room_link: String = r.get("room_link");
            (StatusCode::CREATED, Json(json!({
                "id": id.to_string(),
                "className": class_name,
                "scheduledTime": scheduled_time,
                "roomLink": room_link
            }))).into_response()
        },
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "message": e.to_string() }))).into_response(),
    }
}

#[derive(Debug, Deserialize)]
pub struct CreateTeacherAnnouncementPayload {
    pub subject_id: Uuid,
    pub title: String,
    pub content: String,
}

async fn create_teacher_announcement(
    State(state): State<AppState>,
    claims: Claims,
    Json(payload): Json<CreateTeacherAnnouncementPayload>,
) -> impl IntoResponse {
    if let Err(err) = require_role(&claims, &["teacher", "admin"]) {
        return err.into_response();
    }

    let teacher_id = match Uuid::parse_str(&claims.id) {
        Ok(uid) => uid,
        Err(_) => return (StatusCode::BAD_REQUEST, Json(json!({ "message": "Invalid teacher ID" }))).into_response(),
    };

    let row = sqlx::query(
        r#"
        INSERT INTO announcements (teacher_id, subject_id, title, content)
        VALUES ($1, $2, $3, $4)
        RETURNING id, title, content, created_at
        "#
    )
    .bind(teacher_id)
    .bind(payload.subject_id)
    .bind(&payload.title)
    .bind(&payload.content)
    .fetch_one(&state.db)
    .await;

    use sqlx::Row;
    match row {
        Ok(r) => {
            let id: Uuid = r.get("id");
            let title: String = r.get("title");
            let content: String = r.get("content");
            let created_at: Option<chrono::DateTime<chrono::Utc>> = r.get("created_at");
            (StatusCode::CREATED, Json(json!({
                "id": id.to_string(),
                "title": title,
                "content": content,
                "createdAt": created_at
            }))).into_response()
        },
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "message": e.to_string() }))).into_response(),
    }
}

async fn generate_questions(
    _state: State<AppState>,
    claims: Claims,
    Json(payload): Json<QuestionGenerationRequest>,
) -> impl IntoResponse {
    if let Err(err) = require_role(&claims, &["teacher", "admin"]) {
        return err.into_response();
    }

    let count = payload.count.unwrap_or(5);
    let difficulty = payload.difficulty.unwrap_or_else(|| "Medium".to_string());
    let resource_title = payload.resource_title.unwrap_or_else(|| "attached teaching resource".to_string());

    let questions: Vec<_> = (0..count).map(|idx| json!({
        "id": format!("q_{}_{}", chrono::Utc::now().timestamp_millis(), idx),
        "question": format!("[{}] Question {} based on {}: What is the core mechanism of this concept?", difficulty, idx + 1, resource_title),
        "options": [
            "Option A: Primary protocol response",
            "Option B: Secondary state handler",
            "Option C: Asynchronous event queue",
            "Option D: Static buffer allocation"
        ],
        "correctAnswer": "Option A: Primary protocol response",
        "explanation": format!("This question evaluates key concepts extracted from {}.", resource_title),
        "difficulty": difficulty,
        "status": "DRAFT"
    })).collect();

    (StatusCode::OK, Json(json!({
        "resource": resource_title,
        "count": count,
        "type": payload.question_type.unwrap_or_else(|| "MCQ".to_string()),
        "difficulty": difficulty,
        "questions": questions
    }))).into_response()
}
