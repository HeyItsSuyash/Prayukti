use axum::{
    extract::{Path, State, Query},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post, delete},
    Json, Router,
};
use serde::Deserialize;
use serde_json::json;
use uuid::Uuid;
use chrono::{DateTime, Utc};

use crate::state::AppState;
use crate::middleware::auth::{Claims, require_role};
use crate::services::schedule;

#[derive(Debug, Deserialize)]
pub struct CreateScheduleRequest {
    pub subject_id: Uuid,
    pub class_name: String,
    pub scheduled_time: DateTime<Utc>,
    pub duration_minutes: i32,
    pub room_link: String,
    pub batch: Option<String>,
    pub recurring: bool,
    pub recurring_pattern: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct TimingSuggestionQuery {
    pub subject_id: Uuid,
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(get_schedules).post(create_schedule))
        .route("/:id", delete(delete_schedule))
        .route("/ai-timings", get(get_timing_suggestions))
        .route("/low-attendance", get(get_low_attendance_risks))
}

async fn get_schedules(
    State(state): State<AppState>,
    claims: Claims,
) -> impl IntoResponse {
    let user_id = match Uuid::parse_str(&claims.id) {
        Ok(uid) => uid,
        Err(_) => return (StatusCode::BAD_REQUEST, Json(json!({ "message": "Invalid user ID" }))).into_response(),
    };

    match schedule::get_upcoming_schedules(&state.db, user_id, &claims.role).await {
        Ok(s) => (StatusCode::OK, Json(s)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "message": e.to_string() }))).into_response(),
    }
}

async fn create_schedule(
    State(state): State<AppState>,
    claims: Claims,
    Json(payload): Json<CreateScheduleRequest>,
) -> impl IntoResponse {
    if let Err(err) = require_role(&claims, &["teacher", "admin"]) {
        return err.into_response();
    }

    let teacher_id = match Uuid::parse_str(&claims.id) {
        Ok(uid) => uid,
        Err(_) => return (StatusCode::BAD_REQUEST, Json(json!({ "message": "Invalid teacher ID" }))).into_response(),
    };

    match schedule::create_schedule(
        &state.db,
        payload.subject_id,
        teacher_id,
        &payload.class_name,
        payload.scheduled_time,
        payload.duration_minutes,
        &payload.room_link,
        payload.batch,
        payload.recurring,
        payload.recurring_pattern,
    )
    .await {
        Ok(s) => (StatusCode::CREATED, Json(s)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "message": e.to_string() }))).into_response(),
    }
}

async fn delete_schedule(
    State(state): State<AppState>,
    claims: Claims,
    Path(id): Path<Uuid>,
) -> impl IntoResponse {
    if let Err(err) = require_role(&claims, &["teacher", "admin"]) {
        return err.into_response();
    }

    match schedule::delete_schedule(&state.db, id).await {
        Ok(_) => (StatusCode::OK, Json(json!({ "message": "Schedule deleted successfully" }))).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "message": e.to_string() }))).into_response(),
    }
}

async fn get_timing_suggestions(
    State(state): State<AppState>,
    claims: Claims,
    Query(query): Query<TimingSuggestionQuery>,
) -> impl IntoResponse {
    if let Err(err) = require_role(&claims, &["teacher", "admin"]) {
        return err.into_response();
    }

    match schedule::suggest_optimal_timings(&state.db, query.subject_id).await {
        Ok(sug) => (StatusCode::OK, Json(sug)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "message": e.to_string() }))).into_response(),
    }
}

async fn get_low_attendance_risks(
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

    match schedule::detect_low_attendance_slots(&state.db, teacher_id).await {
        Ok(risks) => (StatusCode::OK, Json(risks)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "message": e.to_string() }))).into_response(),
    }
}
