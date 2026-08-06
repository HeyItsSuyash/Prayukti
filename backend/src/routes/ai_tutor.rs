use axum::{
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    routing::post,
    Json, Router,
};
use serde::Deserialize;
use serde_json::json;
use uuid::Uuid;

use crate::state::AppState;
use crate::middleware::auth::Claims;
use crate::services::ai_tutor;
use crate::services::ai_security::AiSecurityService;

#[derive(Debug, Deserialize)]
pub struct AskDoubtRequest {
    pub subject_id: Uuid,
    pub message: String,
}

#[derive(Debug, Deserialize)]
pub struct TutorRequest {
    pub subject_id: Uuid,
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/ask", post(ask_doubt))
        .route("/quiz", post(get_quiz))
        .route("/flashcard", post(get_flashcards))
        .route("/notes", post(get_notes))
}

async fn ask_doubt(
    State(state): State<AppState>,
    claims: Claims,
    Json(payload): Json<AskDoubtRequest>,
) -> impl IntoResponse {
    let student_id = match Uuid::parse_str(&claims.id) {
        Ok(uid) => uid,
        Err(_) => return (StatusCode::BAD_REQUEST, Json(json!({ "message": "Invalid student ID" }))).into_response(),
    };

    if !AiSecurityService::is_prompt_safe(&payload.message) {
        return (StatusCode::FORBIDDEN, Json(json!({ "message": "Malicious prompt detected" }))).into_response();
    }

    match ai_tutor::solve_doubt(&state.db, student_id, payload.subject_id, &payload.message).await {
        Ok(res) => (StatusCode::OK, Json(res)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "message": e.to_string() }))).into_response(),
    }
}

async fn get_quiz(
    State(state): State<AppState>,
    claims: Claims,
    Json(payload): Json<TutorRequest>,
) -> impl IntoResponse {
    let _ = claims;
    match ai_tutor::generate_quiz(&state.db, payload.subject_id).await {
        Ok(quiz) => (StatusCode::OK, Json(quiz)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "message": e.to_string() }))).into_response(),
    }
}

async fn get_flashcards(
    State(state): State<AppState>,
    claims: Claims,
    Json(payload): Json<TutorRequest>,
) -> impl IntoResponse {
    let _ = claims;
    match ai_tutor::generate_flashcards(&state.db, payload.subject_id).await {
        Ok(fc) => (StatusCode::OK, Json(fc)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "message": e.to_string() }))).into_response(),
    }
}

async fn get_notes(
    State(state): State<AppState>,
    claims: Claims,
    Json(payload): Json<TutorRequest>,
) -> impl IntoResponse {
    let _ = claims;
    match ai_tutor::generate_notes(&state.db, payload.subject_id).await {
        Ok(notes) => (StatusCode::OK, Json(notes)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "message": e.to_string() }))).into_response(),
    }
}
