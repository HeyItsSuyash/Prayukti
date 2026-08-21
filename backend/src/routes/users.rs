use axum::{routing::{get, post}, extract::State, Router, Json, extract::Path};
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

async fn get_users(State(state): State<crate::state::AppState>, claims: Claims) -> AuthResult<Json<Value>> {
    require_role(&claims, &["admin", "teacher"])?;

    let users = sqlx::query_as::<_, crate::models::user::User>(
        "SELECT id, full_name, roll_no, email, password, role, otp_hash, otp_expiry, otp_attempts, otp_resends, otp_last_resent_at, is_verified, enrollment_no, branch, year, semester, created_at FROM users ORDER BY created_at DESC"
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": e.to_string() }))))?;

    let user_responses: Vec<crate::models::user::UserResponse> = users.into_iter().map(Into::into).collect();
    Ok(Json(json!(user_responses)))
}

async fn create_user(claims: Claims) -> AuthResult<Json<Value>> {
    require_role(&claims, &["admin"])?;
    Ok(Json(json!({ "message": "User created" })))
}

async fn get_user(State(state): State<crate::state::AppState>, claims: Claims, Path(id): Path<String>) -> AuthResult<Json<Value>> {
    require_role(&claims, &["admin", "teacher"])?;
    
    let user_uuid = uuid::Uuid::parse_str(&id)
        .map_err(|_| (StatusCode::BAD_REQUEST, Json(json!({ "error": "Invalid user ID" }))))?;

    let user = sqlx::query_as::<_, crate::models::user::User>(
        "SELECT id, full_name, roll_no, email, password, role, otp_hash, otp_expiry, otp_attempts, otp_resends, otp_last_resent_at, is_verified, enrollment_no, branch, year, semester, created_at FROM users WHERE id = $1"
    )
    .bind(user_uuid)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, Json(json!({ "error": e.to_string() }))))?;

    match user {
        Some(u) => {
            let resp: crate::models::user::UserResponse = u.into();
            Ok(Json(json!(resp)))
        },
        None => Err((StatusCode::NOT_FOUND, Json(json!({ "error": "User not found" })))),
    }
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
