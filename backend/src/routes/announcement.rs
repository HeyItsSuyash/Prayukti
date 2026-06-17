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
use crate::services::announcement;

#[derive(Debug, Deserialize)]
pub struct CreateAnnouncementRequest {
    pub subject_id: Uuid,
    pub title: String,
    pub content: String,
    pub resources: Option<Vec<(String, String, String)>>, // Array of (title, type, url)
}

#[derive(Debug, Deserialize)]
pub struct CommentRequest {
    pub content: String,
}

#[derive(Debug, Deserialize)]
pub struct ReactRequest {
    pub reaction: String,
}

#[derive(Debug, Deserialize)]
pub struct TranslateQuery {
    pub lang: String,
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(get_announcements).post(create_announcement))
        .route("/:id/comment", post(comment_on_announcement))
        .route("/:id/react", post(react_to_announcement))
        .route("/:id/bookmark", post(bookmark_announcement))
        .route("/:id/summarize", get(summarize_announcement))
        .route("/:id/translate", get(translate_announcement))
        .route("/:id/action-items", get(action_items_announcement))
}

async fn get_announcements(
    State(state): State<AppState>,
    claims: Claims,
) -> impl IntoResponse {
    let user_id = match Uuid::parse_str(&claims.id) {
        Ok(uid) => uid,
        Err(_) => return (StatusCode::BAD_REQUEST, Json(json!({ "message": "Invalid user ID in token" }))).into_response(),
    };

    match announcement::get_announcements(&state.db, user_id).await {
        Ok(ann) => (StatusCode::OK, Json(ann)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "message": e.to_string() }))).into_response(),
    }
}

async fn create_announcement(
    State(state): State<AppState>,
    claims: Claims,
    Json(payload): Json<CreateAnnouncementRequest>,
) -> impl IntoResponse {
    if let Err(err) = require_role(&claims, &["teacher", "admin"]) {
        return err.into_response();
    }

    let teacher_id = match Uuid::parse_str(&claims.id) {
        Ok(uid) => uid,
        Err(_) => return (StatusCode::BAD_REQUEST, Json(json!({ "message": "Invalid teacher ID" }))).into_response(),
    };

    match announcement::create_announcement(
        &state.db,
        teacher_id,
        payload.subject_id,
        &payload.title,
        &payload.content,
        payload.resources,
    )
    .await {
        Ok(ann) => (StatusCode::CREATED, Json(ann)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "message": e.to_string() }))).into_response(),
    }
}

async fn comment_on_announcement(
    State(state): State<AppState>,
    claims: Claims,
    Path(id): Path<Uuid>,
    Json(payload): Json<CommentRequest>,
) -> impl IntoResponse {
    let user_id = match Uuid::parse_str(&claims.id) {
        Ok(uid) => uid,
        Err(_) => return (StatusCode::BAD_REQUEST, Json(json!({ "message": "Invalid user ID" }))).into_response(),
    };

    match announcement::post_comment(&state.db, id, user_id, &payload.content).await {
        Ok(comment) => (StatusCode::CREATED, Json(comment)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "message": e.to_string() }))).into_response(),
    }
}

async fn react_to_announcement(
    State(state): State<AppState>,
    claims: Claims,
    Path(id): Path<Uuid>,
    Json(payload): Json<ReactRequest>,
) -> impl IntoResponse {
    let user_id = match Uuid::parse_str(&claims.id) {
        Ok(uid) => uid,
        Err(_) => return (StatusCode::BAD_REQUEST, Json(json!({ "message": "Invalid user ID" }))).into_response(),
    };

    match announcement::toggle_reaction(&state.db, id, user_id, &payload.reaction).await {
        Ok(added) => (StatusCode::OK, Json(json!({ "added": added }))).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "message": e.to_string() }))).into_response(),
    }
}

async fn bookmark_announcement(
    State(state): State<AppState>,
    claims: Claims,
    Path(id): Path<Uuid>,
) -> impl IntoResponse {
    let user_id = match Uuid::parse_str(&claims.id) {
        Ok(uid) => uid,
        Err(_) => return (StatusCode::BAD_REQUEST, Json(json!({ "message": "Invalid user ID" }))).into_response(),
    };

    match announcement::toggle_bookmark(&state.db, user_id, id).await {
        Ok(bookmarked) => (StatusCode::OK, Json(json!({ "bookmarked": bookmarked }))).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "message": e.to_string() }))).into_response(),
    }
}

async fn summarize_announcement(
    State(state): State<AppState>,
    claims: Claims,
    Path(id): Path<Uuid>,
) -> impl IntoResponse {
    let _ = claims; // valid session check
    match announcement::ai_summarize(&state.db, id).await {
        Ok(sum) => (StatusCode::OK, Json(sum)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "message": e.to_string() }))).into_response(),
    }
}

async fn translate_announcement(
    State(state): State<AppState>,
    claims: Claims,
    Path(id): Path<Uuid>,
    Query(query): Query<TranslateQuery>,
) -> impl IntoResponse {
    let _ = claims;
    match announcement::ai_translate(&state.db, id, &query.lang).await {
        Ok(t) => (StatusCode::OK, Json(t)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "message": e.to_string() }))).into_response(),
    }
}

async fn action_items_announcement(
    State(state): State<AppState>,
    claims: Claims,
    Path(id): Path<Uuid>,
) -> impl IntoResponse {
    let _ = claims;
    match announcement::ai_action_items(&state.db, id).await {
        Ok(act) => (StatusCode::OK, Json(act)).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "message": e.to_string() }))).into_response(),
    }
}
