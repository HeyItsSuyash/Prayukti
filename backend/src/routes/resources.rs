use axum::{routing::{get, delete}, Router, Json, extract::Path};
use serde_json::{json, Value};

pub fn router() -> Router<crate::state::AppState> {
    Router::new()
        .route("/", get(get_resources).post(create_resource))
        .route("/:id", delete(delete_resource))
}

async fn get_resources() -> Json<Value> {
    Json(json!([]))
}

async fn create_resource() -> Json<Value> {
    Json(json!({ "message": "Resource created" }))
}

async fn delete_resource(Path(id): Path<String>) -> Json<Value> {
    Json(json!({ "message": "Resource deleted", "id": id }))
}
