use axum::{
    extract::{Path, State},
    routing::{get, post},
    Json, Router,
};
use serde_json::json;
use uuid::Uuid;

use crate::{
    models::timetable::{Course, Branch, AcademicYear, Semester, Section, CreateSectionRequest},
    state::AppState,
};
use axum::http::StatusCode;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/hierarchy", get(get_hierarchy))
        .route("/courses", get(get_courses).post(create_course))
        .route("/branches", get(get_branches).post(create_branch))
        .route("/sections", post(create_section))
}

// Mock implementation for hierarchy
async fn get_hierarchy(State(_state): State<AppState>) -> Result<Json<serde_json::Value>, StatusCode> {
    Ok(Json(json!({ "message": "Hierarchy tree will be implemented here" })))
}

async fn get_courses(State(state): State<AppState>) -> Result<Json<Vec<Course>>, StatusCode> {
    let courses = sqlx::query_as::<_, Course>(
        "SELECT * FROM courses"
    )
    .fetch_all(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(courses))
}

async fn create_course(
    State(state): State<AppState>,
    Json(payload): Json<Course>,
) -> Result<Json<Course>, StatusCode> {
    let course = sqlx::query_as::<_, Course>(
        "INSERT INTO courses (institution_id, name, code, duration_years) VALUES ($1, $2, $3, $4) RETURNING *"
    )
    .bind(payload.institution_id)
    .bind(payload.name)
    .bind(payload.code)
    .bind(payload.duration_years)
    .fetch_one(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(course))
}

async fn get_branches(State(state): State<AppState>) -> Result<Json<Vec<Branch>>, StatusCode> {
    let branches = sqlx::query_as::<_, Branch>(
        "SELECT * FROM branches"
    )
    .fetch_all(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(branches))
}

async fn create_branch(
    State(state): State<AppState>,
    Json(payload): Json<Branch>,
) -> Result<Json<Branch>, StatusCode> {
    let branch = sqlx::query_as::<_, Branch>(
        "INSERT INTO branches (course_id, name, code) VALUES ($1, $2, $3) RETURNING *"
    )
    .bind(payload.course_id)
    .bind(payload.name)
    .bind(payload.code)
    .fetch_one(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(branch))
}

async fn create_section(
    State(state): State<AppState>,
    Json(payload): Json<CreateSectionRequest>,
) -> Result<Json<Section>, StatusCode> {
    let section = sqlx::query_as::<_, Section>(
        "INSERT INTO sections (semester_id, name, capacity) VALUES ($1, $2, $3) RETURNING *"
    )
    .bind(payload.semester_id)
    .bind(payload.name)
    .bind(payload.capacity.unwrap_or(60))
    .fetch_one(&state.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(section))
}
