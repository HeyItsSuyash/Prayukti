use axum::{routing::get, Router, Json};
use serde_json::{json, Value};

pub fn router() -> Router<crate::state::AppState> {
    Router::new()
        .route("/", get(get_settings).post(update_settings))
}

async fn get_settings() -> Json<Value> {
    Json(json!({ "theme": "light", "notifications": true }))
}

async fn update_settings() -> Json<Value> {
    Json(json!({ "message": "Settings updated" }))
}
