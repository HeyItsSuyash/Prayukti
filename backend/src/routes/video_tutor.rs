use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use serde::Deserialize;
use serde_json::json;
use uuid::Uuid;

use crate::state::AppState;
use crate::middleware::auth::Claims;
use crate::services::video_tutor;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/generate", post(generate_lesson_handler))
        .route("/lessons", get(get_lessons_handler))
        .route("/lessons/:id", get(get_lesson_handler))
        .route("/lessons/:id/save", post(save_lesson_handler).delete(unsave_lesson_handler))
        .route("/saved", get(get_saved_handler))
        .route("/progress", post(update_progress_handler))
        .route("/interrupt", post(interrupt_handler))
        .route("/analytics", get(get_analytics_handler))
        .route("/history", get(get_history_handler))
}

#[derive(Debug, Deserialize)]
pub struct GenerateRequest {
    pub topic: String,
    pub mode: String,
    pub avatar: String,
    pub voice: String,
    pub language: String,
}

async fn generate_lesson_handler(
    State(state): State<AppState>,
    claims: Claims,
    Json(payload): Json<GenerateRequest>,
) -> impl IntoResponse {
    let student_id = match Uuid::parse_str(&claims.id) {
        Ok(uid) => uid,
        Err(_) => return (StatusCode::BAD_REQUEST, Json(json!({ "message": "Invalid student ID" }))).into_response(),
    };

    match video_tutor::generate_lesson(
        &state.db,
        student_id,
        &payload.topic,
        &payload.mode,
        &payload.avatar,
        &payload.voice,
        &payload.language,
    )
    .await
    {
        Ok(data) => (StatusCode::CREATED, Json(data)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "message": e.to_string() }))).into_response(),
    }
}

async fn get_lessons_handler(
    State(state): State<AppState>,
    claims: Claims,
) -> impl IntoResponse {
    let student_id = match Uuid::parse_str(&claims.id) {
        Ok(uid) => uid,
        Err(_) => return (StatusCode::BAD_REQUEST, Json(json!({ "message": "Invalid student ID" }))).into_response(),
    };

    match video_tutor::get_lessons(&state.db, student_id).await {
        Ok(data) => (StatusCode::OK, Json(data)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "message": e.to_string() }))).into_response(),
    }
}

async fn get_lesson_handler(
    State(state): State<AppState>,
    claims: Claims,
    Path(id): Path<String>,
) -> impl IntoResponse {
    let student_id = match Uuid::parse_str(&claims.id) {
        Ok(uid) => uid,
        Err(_) => return (StatusCode::BAD_REQUEST, Json(json!({ "message": "Invalid student ID" }))).into_response(),
    };

    let lesson_id = match Uuid::parse_str(&id) {
        Ok(lid) => lid,
        Err(_) => return (StatusCode::BAD_REQUEST, Json(json!({ "message": "Invalid lesson ID" }))).into_response(),
    };

    match video_tutor::get_lesson_by_id(&state.db, student_id, lesson_id).await {
        Ok(Some(data)) => (StatusCode::OK, Json(data)).into_response(),
        Ok(None) => (StatusCode::NOT_FOUND, Json(json!({ "message": "Lesson not found" }))).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "message": e.to_string() }))).into_response(),
    }
}

async fn save_lesson_handler(
    State(state): State<AppState>,
    claims: Claims,
    Path(id): Path<String>,
) -> impl IntoResponse {
    let student_id = match Uuid::parse_str(&claims.id) {
        Ok(uid) => uid,
        Err(_) => return (StatusCode::BAD_REQUEST, Json(json!({ "message": "Invalid student ID" }))).into_response(),
    };

    let lesson_id = match Uuid::parse_str(&id) {
        Ok(lid) => lid,
        Err(_) => return (StatusCode::BAD_REQUEST, Json(json!({ "message": "Invalid lesson ID" }))).into_response(),
    };

    match video_tutor::save_lesson(&state.db, student_id, lesson_id).await {
        Ok(_) => (StatusCode::OK, Json(json!({ "message": "Lesson bookmarked successfully" }))).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "message": e.to_string() }))).into_response(),
    }
}

async fn unsave_lesson_handler(
    State(state): State<AppState>,
    claims: Claims,
    Path(id): Path<String>,
) -> impl IntoResponse {
    let student_id = match Uuid::parse_str(&claims.id) {
        Ok(uid) => uid,
        Err(_) => return (StatusCode::BAD_REQUEST, Json(json!({ "message": "Invalid student ID" }))).into_response(),
    };

    let lesson_id = match Uuid::parse_str(&id) {
        Ok(lid) => lid,
        Err(_) => return (StatusCode::BAD_REQUEST, Json(json!({ "message": "Invalid lesson ID" }))).into_response(),
    };

    match video_tutor::unsave_lesson(&state.db, student_id, lesson_id).await {
        Ok(_) => (StatusCode::OK, Json(json!({ "message": "Lesson bookmark removed" }))).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "message": e.to_string() }))).into_response(),
    }
}

async fn get_saved_handler(
    State(state): State<AppState>,
    claims: Claims,
) -> impl IntoResponse {
    let student_id = match Uuid::parse_str(&claims.id) {
        Ok(uid) => uid,
        Err(_) => return (StatusCode::BAD_REQUEST, Json(json!({ "message": "Invalid student ID" }))).into_response(),
    };

    match video_tutor::get_saved_lessons(&state.db, student_id).await {
        Ok(data) => (StatusCode::OK, Json(data)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "message": e.to_string() }))).into_response(),
    }
}

#[derive(Debug, Deserialize)]
pub struct ProgressRequest {
    pub lesson_id: String,
    pub completion_rate: f64,
    pub quiz_score: Option<i32>,
    pub watch_time_seconds: i32,
}

async fn update_progress_handler(
    State(state): State<AppState>,
    claims: Claims,
    Json(payload): Json<ProgressRequest>,
) -> impl IntoResponse {
    let student_id = match Uuid::parse_str(&claims.id) {
        Ok(uid) => uid,
        Err(_) => return (StatusCode::BAD_REQUEST, Json(json!({ "message": "Invalid student ID" }))).into_response(),
    };

    let lesson_id = match Uuid::parse_str(&payload.lesson_id) {
        Ok(lid) => lid,
        Err(_) => return (StatusCode::BAD_REQUEST, Json(json!({ "message": "Invalid lesson ID" }))).into_response(),
    };

    match video_tutor::update_progress(
        &state.db,
        student_id,
        lesson_id,
        payload.completion_rate,
        payload.quiz_score,
        payload.watch_time_seconds,
    )
    .await
    {
        Ok(data) => (StatusCode::OK, Json(data)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "message": e.to_string() }))).into_response(),
    }
}

#[derive(Debug, Deserialize)]
pub struct InterruptRequest {
    pub lesson_id: Option<String>,
    pub query: String,
}

async fn interrupt_handler(
    State(state): State<AppState>,
    claims: Claims,
    Json(payload): Json<InterruptRequest>,
) -> impl IntoResponse {
    let student_id = match Uuid::parse_str(&claims.id) {
        Ok(uid) => uid,
        Err(_) => return (StatusCode::BAD_REQUEST, Json(json!({ "message": "Invalid student ID" }))).into_response(),
    };

    let lesson_id = match payload.lesson_id {
        Some(ref id_str) => match Uuid::parse_str(id_str) {
            Ok(lid) => Some(lid),
            Err(_) => return (StatusCode::BAD_REQUEST, Json(json!({ "message": "Invalid lesson ID" }))).into_response(),
        },
        None => None,
    };

    match video_tutor::process_interrupt(&state.db, student_id, lesson_id, &payload.query).await {
        Ok(data) => (StatusCode::OK, Json(data)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "message": e.to_string() }))).into_response(),
    }
}

async fn get_analytics_handler(
    State(state): State<AppState>,
    claims: Claims,
) -> impl IntoResponse {
    let student_id = match Uuid::parse_str(&claims.id) {
        Ok(uid) => uid,
        Err(_) => return (StatusCode::BAD_REQUEST, Json(json!({ "message": "Invalid student ID" }))).into_response(),
    };

    match video_tutor::get_analytics(&state.db, student_id).await {
        Ok(data) => (StatusCode::OK, Json(data)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "message": e.to_string() }))).into_response(),
    }
}

async fn get_history_handler(
    State(state): State<AppState>,
    claims: Claims,
) -> impl IntoResponse {
    let student_id = match Uuid::parse_str(&claims.id) {
        Ok(uid) => uid,
        Err(_) => return (StatusCode::BAD_REQUEST, Json(json!({ "message": "Invalid student ID" }))).into_response(),
    };

    match video_tutor::get_watch_history(&state.db, student_id).await {
        Ok(data) => (StatusCode::OK, Json(data)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "message": e.to_string() }))).into_response(),
    }
}
