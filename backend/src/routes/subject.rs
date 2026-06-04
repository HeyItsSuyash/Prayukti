use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use serde::Deserialize;
use serde_json::json;
use sqlx::PgPool;
use tracing::{error, info};
use uuid::Uuid;

use crate::models::subject::{Subject, SubjectResponse};
use crate::state::AppState;
use crate::middleware::auth::{Claims, require_role};

#[derive(Debug, Deserialize)]
pub struct CreateSubjectRequest {
    pub title: Option<String>,
    pub name: Option<String>, // alias
    pub description: Option<String>,
    pub icon: Option<String>,
    #[serde(rename = "experimentsCount")]
    pub experiments_count: Option<i32>,
    pub slug: Option<String>,
    #[serde(rename = "subject_id")]
    pub subject_id: Option<String>,
    pub branch: Option<String>,
    pub semester: Option<i32>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateSubjectRequest {
    pub title: Option<String>,
    pub name: Option<String>,
    pub description: Option<String>,
    pub icon: Option<String>,
    #[serde(rename = "experimentsCount")]
    pub experiments_count: Option<i32>,
    pub slug: Option<String>,
    #[serde(rename = "subject_id")]
    pub subject_id: Option<String>,
    pub branch: Option<String>,
    pub semester: Option<i32>,
}

// Log action helper
async fn log_activity(
    db: &PgPool,
    action: &str,
    user_name: &str,
    user_role: &str,
    details: &str,
) {
    let res = sqlx::query(
        "INSERT INTO activity_logs (action, user_name, user_role, details) VALUES ($1, $2, $3, $4)"
    )
    .bind(action)
    .bind(user_name)
    .bind(user_role)
    .bind(details)
    .execute(db)
    .await;

    if let Err(e) = res {
        error!("Failed to save activity log: {:?}", e);
    }
}

pub async fn get_subjects(
    State(state): State<AppState>,
) -> impl IntoResponse {
    info!("[SUBJECT] Fetching all subjects");
    let subjects_res = sqlx::query_as::<_, Subject>(
        "SELECT * FROM subjects ORDER BY created_at DESC"
    )
    .fetch_all(&state.db)
    .await;

    match subjects_res {
        Ok(list) => {
            let resp_list: Vec<SubjectResponse> = list.into_iter().map(Into::into).collect();
            (StatusCode::OK, Json(json!(resp_list)))
        }
        Err(e) => {
            error!("[SUBJECT] Failed to get subjects: {:?}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "message": "Failed to fetch subjects" })),
            )
        }
    }
}

pub async fn create_subject(
    State(state): State<AppState>,
    claims: Claims,
    Json(payload): Json<CreateSubjectRequest>,
) -> impl IntoResponse {
    info!("[SUBJECT] Create attempt by user: {}", claims.email);
    if let Err(rejection) = require_role(&claims, &["admin"]) {
        return rejection;
    }

    let title = payload.title.or(payload.name).unwrap_or_default();
    let experiments_count = payload.experiments_count.unwrap_or(0);
    let branch = payload.branch.unwrap_or_else(|| "Common".to_string());
    let semester = payload.semester.unwrap_or(1);

    let id = Uuid::new_v4();

    let insert_res = sqlx::query(
        r#"
        INSERT INTO subjects (id, title, description, icon, slug, subject_id, experiments_count, branch, semester)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
        "#
    )
    .bind(id)
    .bind(&title)
    .bind(&payload.description)
    .bind(&payload.icon)
    .bind(&payload.slug)
    .bind(&payload.subject_id)
    .bind(experiments_count)
    .bind(&branch)
    .bind(semester)
    .fetch_one(&state.db)
    .await;

    match insert_res {
        Ok(subject_row) => {
            let created_subject = Subject {
                id: subject_row.get("id"),
                title: subject_row.get("title"),
                description: subject_row.get("description"),
                icon: subject_row.get("icon"),
                slug: subject_row.get("slug"),
                subject_id: subject_row.get("subject_id"),
                experiments_count: subject_row.get("experiments_count"),
                branch: subject_row.get("branch"),
                semester: subject_row.get("semester"),
                created_at: subject_row.get("created_at"),
            };

            let details = format!("Created subject: {} ({:?})", title, created_subject.slug);
            log_activity(&state.db, "CREATE_SUBJECT", &claims.email, &claims.role, &details).await;

            let resp: SubjectResponse = created_subject.into();
            (StatusCode::CREATED, Json(json!(resp)))
        }
        Err(e) => {
            error!("[SUBJECT] Create Subject SQL failed: {:?}", e);
            (
                StatusCode::BAD_REQUEST,
                Json(json!({ "message": format!("Failed to create subject: {:?}", e) })),
            )
        }
    }
}

pub async fn update_subject(
    State(state): State<AppState>,
    claims: Claims,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateSubjectRequest>,
) -> impl IntoResponse {
    info!("[SUBJECT] Update attempt for subject ID: {}", id);
    if let Err(rejection) = require_role(&claims, &["admin"]) {
        return rejection;
    }

    // Since fields are optional, we dynamically build or perform full update.
    // To be perfectly robust, we can query existing first, merge, and update.
    let existing_res = sqlx::query_as::<_, Subject>(
        "SELECT * FROM subjects WHERE id = $1"
    )
    .bind(id)
    .fetch_optional(&state.db)
    .await;

    let mut existing = match existing_res {
        Ok(Some(s)) => s,
        Ok(None) => {
            return (
                StatusCode::NOT_FOUND,
                Json(json!({ "message": "Subject not found" })),
            );
        }
        Err(e) => {
            error!("[SUBJECT] Update query failed: {:?}", e);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "message": "Server error" })),
            );
        }
    };

    if let Some(title) = payload.title.or(payload.name) {
        existing.title = title;
    }
    if payload.description.is_some() {
        existing.description = payload.description;
    }
    if payload.icon.is_some() {
        existing.icon = payload.icon;
    }
    if let Some(count) = payload.experiments_count {
        existing.experiments_count = count;
    }
    if payload.slug.is_some() {
        existing.slug = payload.slug;
    }
    if payload.subject_id.is_some() {
        existing.subject_id = payload.subject_id;
    }
    if let Some(b) = payload.branch {
        existing.branch = b;
    }
    if let Some(sem) = payload.semester {
        existing.semester = sem;
    }

    let update_res = sqlx::query(
        r#"
        UPDATE subjects
        SET title = $1, description = $2, icon = $3, experiments_count = $4, slug = $5, subject_id = $6, branch = $7, semester = $8
        WHERE id = $9
        "#
    )
    .bind(&existing.title)
    .bind(&existing.description)
    .bind(&existing.icon)
    .bind(existing.experiments_count)
    .bind(&existing.slug)
    .bind(&existing.subject_id)
    .bind(&existing.branch)
    .bind(existing.semester)
    .bind(id)
    .execute(&state.db)
    .await;

    match update_res {
        Ok(_) => {
            let resp: SubjectResponse = existing.into();
            (StatusCode::OK, Json(json!(resp)))
        }
        Err(e) => {
            error!("[SUBJECT] Update failed: {:?}", e);
            (
                StatusCode::BAD_REQUEST,
                Json(json!({ "message": e.to_string() })),
            )
        }
    }
}

pub async fn delete_subject(
    State(state): State<AppState>,
    claims: Claims,
    Path(id): Path<Uuid>,
) -> impl IntoResponse {
    info!("[SUBJECT] Delete attempt for ID: {}", id);
    if let Err(rejection) = require_role(&claims, &["admin"]) {
        return rejection;
    }

    let delete_res = sqlx::query("DELETE FROM subjects WHERE id = $1")
        .bind(id)
        .execute(&state.db)
        .await;

    match delete_res {
        Ok(_) => {
            (StatusCode::OK, Json(json!({ "message": "Subject deleted" })))
        }
        Err(e) => {
            error!("[SUBJECT] Delete failed: {:?}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "message": e.to_string() })),
            )
        }
    }
}

pub async fn seed_subjects(
    State(state): State<AppState>,
    claims: Claims,
) -> impl IntoResponse {
    info!("[SUBJECT] Seed requested by admin: {}", claims.email);
    if let Err(rejection) = require_role(&claims, &["admin"]) {
        return rejection;
    }

    let default_subjects = vec![
        json!({
            "title": "Data Structures and Algorithms",
            "description": "Master arrays, linked lists, trees, and core algorithms with interactive execution.",
            "icon": "dsa",
            "experiments_count": 0,
            "subject_id": "BCS-301",
            "slug": "dsa"
        }),
        json!({
            "title": "Computer Networks",
            "description": "Explore the architecture of the internet, networking protocols, and OSI models.",
            "icon": "cn",
            "experiments_count": 0,
            "slug": "cn",
            "subject_id": "BCS-502"
        }),
        json!({
            "title": "Digital Logic & Design",
            "description": "Master the fundamentals of digital electronics, logic gates, and circuit design.",
            "icon": "dld",
            "experiments_count": 0,
            "slug": "dld",
            "subject_id": "BCS-303"
        }),
        json!({
            "title": "Database Management",
            "description": "Learn to design, query, and manage relational databases using SQL.",
            "icon": "dbms",
            "experiments_count": 0,
            "slug": "dbms",
            "subject_id": "BCS-404"
        }),
        json!({
            "title": "Object Oriented Programming",
            "description": "Learn the principles of encapsulation, inheritance, polymorphism, and abstraction.",
            "icon": "oops",
            "experiments_count": 0,
            "slug": "oops",
            "subject_id": "BCS-405"
        }),
        json!({
            "title": "Microprocessor and Microcontroller",
            "description": "Study the architecture, programming, and interfacing of 8085/8086 microprocessors.",
            "icon": "mpmc",
            "experiments_count": 0,
            "slug": "mpmc",
            "subject_id": "BCS-506"
        }),
        json!({
            "title": "C Programming Lab",
            "description": "Master the foundations of C programming, memory management, and data types.",
            "icon": "c",
            "experiments_count": 0,
            "subject_id": "BCS-107",
            "slug": "c-programming"
        }),
        json!({
            "title": "Design and Analysis of Algorithms",
            "description": "Design and Analysis of Algorithms Virtual Lab",
            "icon": "FlaskConical",
            "experiments_count": 0,
            "slug": "daa",
            "subject_id": "BCS-408"
        }),
    ];

    // Transaction to clear and insert
    let mut tx = match state.db.begin().await {
        Ok(t) => t,
        Err(e) => {
            error!("[SUBJECT] Failed to start seed transaction: {:?}", e);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "message": "DB error starting seed transaction" })),
            );
        }
    };

    if let Err(e) = sqlx::query("DELETE FROM subjects").execute(&mut *tx).await {
        error!("[SUBJECT] Seed delete failed: {:?}", e);
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "message": "DB error clearing subjects" })),
        );
    }

    for sj in default_subjects {
        let title = sj["title"].as_str().unwrap();
        let description = sj["description"].as_str();
        let icon = sj["icon"].as_str();
        let slug = sj["slug"].as_str();
        let subject_id = sj["subject_id"].as_str();

        let id = Uuid::new_v4();
        let insert_res = sqlx::query(
            "INSERT INTO subjects (id, title, description, icon, slug, subject_id) VALUES ($1, $2, $3, $4, $5, $6)"
        )
        .bind(id)
        .bind(title)
        .bind(description)
        .bind(icon)
        .bind(slug)
        .bind(subject_id)
        .execute(&mut *tx)
        .await;

        if let Err(e) = insert_res {
            error!("[SUBJECT] Seed insert failed: {:?}", e);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "message": "DB error during seed insert" })),
            );
        }
    }

    if let Err(e) = tx.commit().await {
        error!("[SUBJECT] Failed to commit seed transaction: {:?}", e);
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "message": "DB error committing seed transaction" })),
        );
    }

    (
        StatusCode::CREATED,
        Json(json!({ "message": "Default subjects seeded successfully" })),
    )
}

// sqlx Helper trait since FromRow requires exact match or Row getters
use sqlx::Row;
