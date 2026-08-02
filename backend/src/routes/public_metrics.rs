use axum::{
    extract::State,
    response::IntoResponse,
    routing::get,
    Json, Router,
};
use serde_json::json;
use tracing::error;

use crate::state::AppState;

pub fn router() -> Router<AppState> {
    Router::new().route("/", get(get_public_metrics))
}

async fn get_public_metrics(State(state): State<AppState>) -> impl IntoResponse {
    let users_count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM users")
        .fetch_one(&state.db)
        .await
        .unwrap_or(0);

    let experiments_count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM experiments")
        .fetch_one(&state.db)
        .await
        .unwrap_or(0);

    Json(json!({
        "total_users": users_count,
        "total_experiments": experiments_count
    }))
}
