use axum::{routing::get, Router, Json};
use serde_json::{json, Value};

pub fn router() -> Router<crate::state::AppState> {
    Router::new()
        .route("/", get(get_logs))
}

async fn get_logs() -> Json<Value> {
    Json(json!([]))
}
