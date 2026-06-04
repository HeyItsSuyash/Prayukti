use axum::{routing::{get, post}, Router, Json, extract::Path};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

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

async fn get_users() -> Json<Value> {
    Json(json!([]))
}

async fn create_user() -> Json<Value> {
    Json(json!({ "message": "User created" }))
}

async fn get_user(Path(id): Path<String>) -> Json<Value> {
    Json(json!({ "_id": id, "name": "Mock User", "role": "teacher" }))
}

async fn update_user(Path(id): Path<String>) -> Json<Value> {
    Json(json!({ "message": "User updated", "id": id }))
}

async fn delete_user(Path(id): Path<String>) -> Json<Value> {
    Json(json!({ "message": "User deleted", "id": id }))
}

async fn send_email() -> Json<Value> {
    Json(json!({ "message": "Email sent" }))
}
