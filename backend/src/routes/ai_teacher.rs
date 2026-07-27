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
use crate::middleware::auth::{Claims, require_role};
use crate::services::ai_teacher;

#[derive(Debug, Deserialize)]
pub struct LessonPlanRequest {
    pub subject_id: Uuid,
    pub topic: String,
}

#[derive(Debug, Deserialize)]
pub struct AssignmentRequest {
    pub subject_id: Uuid,
    pub topic: String,
    pub difficulty: String,
}

#[derive(Debug, Deserialize)]
pub struct LabSheetRequest {
    pub subject_id: Uuid,
    pub experiment_name: String,
}

#[derive(Debug, Deserialize)]
pub struct PptRequest {
    pub topic: String,
}

#[derive(Debug, Deserialize)]
pub struct QuestionBankRequest {
    pub subject_id: Uuid,
    pub topic: String,
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/lesson-plan", post(get_lesson_plan))
        .route("/assignments", post(get_assignments))
        .route("/lab-sheets", post(get_lab_sheets))
        .route("/ppt-outlines", post(get_ppt_outlines))
        .route("/question-banks", post(get_question_banks))
        .route("/class-summary", get(get_class_summary))
        .route("/topic-difficulty/:subject_id", get(get_topic_difficulty))
}

async fn get_lesson_plan(
    State(state): State<AppState>,
    claims: Claims,
    Json(payload): Json<LessonPlanRequest>,
) -> impl IntoResponse {
    if let Err(err) = require_role(&claims, &["teacher", "admin"]) {
        return err.into_response();
    }

    match ai_teacher::generate_lesson_plan(&state.db, payload.subject_id, &payload.topic).await {
        Ok(res) => (StatusCode::OK, Json(res)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "message": e.to_string() }))).into_response(),
    }
}

async fn get_assignments(
    State(state): State<AppState>,
    claims: Claims,
    Json(payload): Json<AssignmentRequest>,
) -> impl IntoResponse {
    if let Err(err) = require_role(&claims, &["teacher", "admin"]) {
        return err.into_response();
    }

    match ai_teacher::generate_assignments(&state.db, payload.subject_id, &payload.topic, &payload.difficulty).await {
        Ok(res) => (StatusCode::OK, Json(res)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "message": e.to_string() }))).into_response(),
    }
}

async fn get_lab_sheets(
    State(state): State<AppState>,
    claims: Claims,
    Json(payload): Json<LabSheetRequest>,
) -> impl IntoResponse {
    if let Err(err) = require_role(&claims, &["teacher", "admin"]) {
        return err.into_response();
    }

    match ai_teacher::generate_lab_sheets(&state.db, payload.subject_id, &payload.experiment_name).await {
        Ok(res) => (StatusCode::OK, Json(res)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "message": e.to_string() }))).into_response(),
    }
}

async fn get_ppt_outlines(
    State(state): State<AppState>,
    claims: Claims,
    Json(payload): Json<PptRequest>,
) -> impl IntoResponse {
    if let Err(err) = require_role(&claims, &["teacher", "admin"]) {
        return err.into_response();
    }

    let _ = state;
    match ai_teacher::generate_ppt_outlines(&payload.topic).await {
        Ok(res) => (StatusCode::OK, Json(res)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "message": e.to_string() }))).into_response(),
    }
}

async fn get_question_banks(
    State(state): State<AppState>,
    claims: Claims,
    Json(payload): Json<QuestionBankRequest>,
) -> impl IntoResponse {
    if let Err(err) = require_role(&claims, &["teacher", "admin"]) {
        return err.into_response();
    }

    match ai_teacher::generate_question_banks(&state.db, payload.subject_id, &payload.topic).await {
        Ok(res) => (StatusCode::OK, Json(res)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "message": e.to_string() }))).into_response(),
    }
}

async fn get_class_summary(
    State(state): State<AppState>,
    claims: Claims,
) -> impl IntoResponse {
    if let Err(err) = require_role(&claims, &["teacher", "admin"]) {
        return err.into_response();
    }

    let teacher_id = match Uuid::parse_str(&claims.id) {
        Ok(uid) => uid,
        Err(_) => return (StatusCode::BAD_REQUEST, Json(json!({ "message": "Invalid teacher ID" }))).into_response(),
    };

    match ai_teacher::get_class_performance_summary(&state.db, teacher_id).await {
        Ok(res) => (StatusCode::OK, Json(res)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "message": e.to_string() }))).into_response(),
    }
}

async fn get_topic_difficulty(
    State(state): State<AppState>,
    claims: Claims,
    Path(subject_id): Path<Uuid>,
) -> impl IntoResponse {
    if let Err(err) = require_role(&claims, &["teacher", "admin"]) {
        return err.into_response();
    }

    match ai_teacher::get_topic_difficulty_analysis(&state.db, subject_id).await {
        Ok(res) => (StatusCode::OK, Json(res)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "message": e.to_string() }))).into_response(),
    }
}
