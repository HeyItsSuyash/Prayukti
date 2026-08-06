use axum::{routing::get, Router, Json, http::StatusCode};
use serde_json::{json, Value};
use crate::middleware::auth::{Claims, require_role};

pub fn router() -> Router<crate::state::AppState> {
    Router::new()
        .route("/", get(get_settings).post(update_settings))
}

type AuthResult<T> = Result<T, (StatusCode, Json<Value>)>;

async fn get_settings(claims: Claims) -> AuthResult<Json<Value>> {
    require_role(&claims, &["admin"])?;
    Ok(Json(json!({ "theme": "light", "notifications": true })))
}

async fn update_settings(claims: Claims) -> AuthResult<Json<Value>> {
    require_role(&claims, &["admin"])?;
    Ok(Json(json!({ "message": "Settings updated" })))
}
