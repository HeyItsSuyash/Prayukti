use axum::{routing::{get, post}, Router, Json, extract::Path};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use crate::middleware::auth::{Claims, require_role};
use axum::http::StatusCode;

#[derive(Serialize, Deserialize)]
pub struct User {
    pub _id: String,
    pub name: String,
    pub email: String,
    pub role: String,
}

pub fn router() -> Router<crate::state::AppState> {
    Router::new()
        .route("/:id", get(get_user).put(update_user).delete(delete_user))
        .route("/send-email", post(send_email))
        .route("/", get(get_users).post(create_user))
}

type AuthResult<T> = Result<T, (StatusCode, Json<Value>)>;

async fn get_users(claims: Claims) -> AuthResult<Json<Value>> {
    require_role(&claims, &["admin", "teacher"])?;
    Ok(Json(json!([])))
}

async fn create_user(claims: Claims) -> AuthResult<Json<Value>> {
    require_role(&claims, &["admin"])?;
    Ok(Json(json!({ "message": "User created" })))
}

async fn get_user(claims: Claims, Path(id): Path<String>) -> AuthResult<Json<Value>> {
    require_role(&claims, &["admin", "teacher"])?;
    Ok(Json(json!({ "_id": id, "name": "Mock User", "role": "teacher" })))
}

async fn update_user(claims: Claims, Path(id): Path<String>) -> AuthResult<Json<Value>> {
    require_role(&claims, &["admin"])?;
    Ok(Json(json!({ "message": "User updated", "id": id })))
}

async fn delete_user(claims: Claims, Path(id): Path<String>) -> AuthResult<Json<Value>> {
    require_role(&claims, &["admin"])?;
    Ok(Json(json!({ "message": "User deleted", "id": id })))
}

async fn send_email(claims: Claims) -> AuthResult<Json<Value>> {
    require_role(&claims, &["admin"])?;
    // Only authenticated admins can send email, rate limiting is added centrally
    Ok(Json(json!({ "message": "Email sent" })))
}
