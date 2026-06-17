use axum::{
    extract::{Path, State, Query},
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
use crate::services::knowledge_base;

#[derive(Debug, Deserialize)]
pub struct KbQuery {
    pub subject_id: Uuid,
}

#[derive(Debug, Deserialize)]
pub struct AskQuestionRequest {
    pub subject_id: Uuid,
    pub question: String,
}

#[derive(Debug, Deserialize)]
pub struct ReviewQuestionRequest {
    pub teacher_answer: String,
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(get_approved).post(ask_question))
        .route("/pending", get(get_pending))
        .route("/:id/review", post(review_question))
}

async fn get_approved(
    State(state): State<AppState>,
    Query(query): Query<KbQuery>,
) -> impl IntoResponse {
    match knowledge_base::get_knowledge_base_approved(&state.db, query.subject_id).await {
        Ok(kb) => (StatusCode::OK, Json(kb)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "message": e.to_string() }))).into_response(),
    }
}

async fn get_pending(
    State(state): State<AppState>,
    claims: Claims,
    Query(query): Query<KbQuery>,
) -> impl IntoResponse {
    if let Err(err) = require_role(&claims, &["teacher", "admin"]) {
        return err.into_response();
    }

    match knowledge_base::get_knowledge_base_pending(&state.db, query.subject_id).await {
        Ok(kb) => (StatusCode::OK, Json(kb)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "message": e.to_string() }))).into_response(),
    }
}

async fn ask_question(
    State(state): State<AppState>,
    claims: Claims,
    Json(payload): Json<AskQuestionRequest>,
) -> impl IntoResponse {
    let _ = claims; // session check
    match knowledge_base::submit_student_question(&state.db, payload.subject_id, &payload.question).await {
        Ok(res) => (StatusCode::CREATED, Json(res)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "message": e.to_string() }))).into_response(),
    }
}

async fn review_question(
    State(state): State<AppState>,
    claims: Claims,
    Path(id): Path<Uuid>,
    Json(payload): Json<ReviewQuestionRequest>,
) -> impl IntoResponse {
    if let Err(err) = require_role(&claims, &["teacher", "admin"]) {
        return err.into_response();
    }

    let teacher_id = match Uuid::parse_str(&claims.id) {
        Ok(uid) => uid,
        Err(_) => return (StatusCode::BAD_REQUEST, Json(json!({ "message": "Invalid teacher ID" }))).into_response(),
    };

    match knowledge_base::submit_teacher_review(&state.db, id, teacher_id, &payload.teacher_answer).await {
        Ok(res) => (StatusCode::OK, Json(res)).into_response(),
        Err(e) => (StatusCode::BAD_REQUEST, Json(json!({ "message": e }))).into_response(),
    }
}
