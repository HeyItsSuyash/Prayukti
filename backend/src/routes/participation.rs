use axum::{
    extract::{State, Query},
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
use crate::services::participation;

#[derive(Debug, Deserialize)]
pub struct LogEventRequest {
    pub event_type: String,
    pub details: serde_json::Value,
}

#[derive(Debug, Deserialize)]
pub struct ScoreQuery {
    pub subject_id: Uuid,
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/event", post(log_event))
        .route("/score", get(get_scores))
        .route("/ai-insights", get(get_insights))
}

async fn log_event(
    State(state): State<AppState>,
    claims: Claims,
    Json(payload): Json<LogEventRequest>,
) -> impl IntoResponse {
    let student_id = match Uuid::parse_str(&claims.id) {
        Ok(uid) => uid,
        Err(_) => return (StatusCode::BAD_REQUEST, Json(json!({ "message": "Invalid user ID" }))).into_response(),
    };

    match participation::log_participation_event(&state.db, student_id, &payload.event_type, payload.details).await {
        Ok(_) => (StatusCode::CREATED, Json(json!({ "message": "Event logged successfully" }))).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "message": e.to_string() }))).into_response(),
    }
}

async fn get_scores(
    State(state): State<AppState>,
    claims: Claims,
    Query(query): Query<ScoreQuery>,
) -> impl IntoResponse {
    let student_id = match Uuid::parse_str(&claims.id) {
        Ok(uid) => uid,
        Err(_) => return (StatusCode::BAD_REQUEST, Json(json!({ "message": "Invalid user ID" }))).into_response(),
    };

    match participation::get_engagement_scores(&state.db, student_id, query.subject_id).await {
        Ok(scores) => (StatusCode::OK, Json(scores)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "message": e.to_string() }))).into_response(),
    }
}

async fn get_insights(
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

    match participation::get_ai_insights_for_teacher(&state.db, teacher_id).await {
        Ok(ins) => (StatusCode::OK, Json(ins)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "message": e.to_string() }))).into_response(),
    }
}
