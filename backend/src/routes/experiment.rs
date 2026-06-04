use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use serde::Deserialize;
use serde_json::json;
use sqlx::{PgPool, Row};
use tracing::{error, info};
use uuid::Uuid;

use crate::models::experiment::{Experiment, ExperimentResponse, TestcaseResponse};
use crate::models::subject::{Subject, SubjectResponse};
use crate::state::AppState;
use crate::middleware::auth::{Claims, require_role};

#[derive(Debug, Deserialize)]
pub struct GetExperimentsQuery {
    #[serde(rename = "subjectId")]
    pub subject_id: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateExperimentRequest {
    pub title: Option<String>,
    pub name: Option<String>, // alias
    #[serde(rename = "subjectId")]
    pub subject_id: Option<String>,
    pub subject: Option<String>, // alias
    pub theory: Option<String>,
    pub algorithm: Option<String>,
    #[serde(rename = "codeTemplate")]
    pub code_template: Option<String>,
    pub language: Option<String>,
    pub testcases: Option<Vec<TestcaseResponse>>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateExperimentRequest {
    pub title: Option<String>,
    pub name: Option<String>,
    #[serde(rename = "subjectId")]
    pub subject_id: Option<String>,
    pub subject: Option<String>,
    pub theory: Option<String>,
    pub algorithm: Option<String>,
    #[serde(rename = "codeTemplate")]
    pub code_template: Option<String>,
    pub language: Option<String>,
    pub testcases: Option<Vec<TestcaseResponse>>,
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

// Helper to populate and format ExperimentResponse from raw database objects
async fn get_populated_experiment(
    db: &PgPool,
    exp: Experiment,
    populate_subject: bool,
) -> Result<ExperimentResponse, sqlx::Error> {
    // 1. Fetch test cases
    let testcases_rows = sqlx::query(
        "SELECT input, output FROM experiment_testcases WHERE experiment_id = $1"
    )
    .bind(exp.id)
    .fetch_all(db)
    .await?;

    let testcases: Vec<TestcaseResponse> = testcases_rows
        .into_iter()
        .map(|r| TestcaseResponse {
            input: r.get::<Option<String>, _>("input").unwrap_or_default(),
            output: r.get::<Option<String>, _>("output").unwrap_or_default(),
        })
        .collect();

    // 2. Fetch subject details if requested
    let subject_val = if populate_subject {
        let sub_res = sqlx::query_as::<_, Subject>(
            "SELECT * FROM subjects WHERE id = $1"
        )
        .bind(exp.subject_id)
        .fetch_optional(db)
        .await?;

        match sub_res {
            Some(s) => {
                let s_resp: SubjectResponse = s.into();
                serde_json::to_value(s_resp).unwrap_or(json!(exp.subject_id.to_string()))
            }
            None => json!(exp.subject_id.to_string()),
        }
    } else {
        json!(exp.subject_id.to_string())
    };

    Ok(ExperimentResponse {
        id: exp.id.to_string(),
        name: exp.name.clone(),
        title: exp.name,
        subject: subject_val,
        subject_id: exp.subject_id.to_string(),
        slug: exp.slug,
        r#type: exp.r#type,
        difficulty: exp.difficulty,
        status: exp.status,
        description: exp.description,
        estimated_time: exp.estimated_time,
        prerequisites: exp.prerequisites.unwrap_or_default(),
        thumbnail_url: exp.thumbnail_url,
        theory: exp.theory,
        algorithm: exp.algorithm,
        code_template: exp.code_template,
        language: exp.language,
        testcases,
    })
}

pub async fn get_experiments(
    State(state): State<AppState>,
    Query(params): Query<GetExperimentsQuery>,
) -> impl IntoResponse {
    info!("[EXPERIMENT] Fetching experiments (params: {:?})", params);

    let query_res = if let Some(ref sub_id_str) = params.subject_id {
        if let Ok(sub_id) = Uuid::parse_str(sub_id_str) {
            sqlx::query_as::<_, Experiment>(
                "SELECT * FROM experiments WHERE subject_id = $1"
            )
            .bind(sub_id)
            .fetch_all(&state.db)
            .await
        } else {
            return (
                StatusCode::BAD_REQUEST,
                Json(json!({ "message": "Invalid subjectId format" })),
            );
        }
    } else {
        sqlx::query_as::<_, Experiment>("SELECT * FROM experiments")
            .fetch_all(&state.db)
            .await
    };

    match query_res {
        Ok(list) => {
            let mut resp_list = Vec::new();
            for exp in list {
                // Populate subject by default as populate('subject') was called in Node
                if let Ok(populated) = get_populated_experiment(&state.db, exp, true).await {
                    resp_list.push(populated);
                }
            }
            (StatusCode::OK, Json(json!(resp_list)))
        }
        Err(e) => {
            error!("[EXPERIMENT] Failed to fetch experiments: {:?}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "message": "Failed to fetch experiments" })),
            )
        }
    }
}

pub async fn get_experiments_by_subject(
    State(state): State<AppState>,
    Path(subject_id_str): Path<String>,
) -> impl IntoResponse {
    info!("[EXPERIMENT] Fetching experiments for subject ID: {}", subject_id_str);

    let sub_id = match Uuid::parse_str(&subject_id_str) {
        Ok(uid) => uid,
        Err(_) => {
            return (
                StatusCode::BAD_REQUEST,
                Json(json!({ "message": "Invalid subjectId format" })),
            );
        }
    };

    let query_res = sqlx::query_as::<_, Experiment>(
        "SELECT * FROM experiments WHERE subject_id = $1 ORDER BY created_at ASC"
    )
    .bind(sub_id)
    .fetch_all(&state.db)
    .await;

    match query_res {
        Ok(list) => {
            let mut resp_list = Vec::new();
            for exp in list {
                if let Ok(populated) = get_populated_experiment(&state.db, exp, false).await {
                    resp_list.push(populated);
                }
            }
            (StatusCode::OK, Json(json!(resp_list)))
        }
        Err(e) => {
            error!("[EXPERIMENT] Failed to fetch experiments: {:?}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "message": "Failed to fetch experiments" })),
            )
        }
    }
}

pub async fn get_experiment_by_id(
    State(state): State<AppState>,
    Path(experiment_id_str): Path<String>,
) -> impl IntoResponse {
    info!("[EXPERIMENT] Fetching experiment by ID: {}", experiment_id_str);

    let exp_id = match Uuid::parse_str(&experiment_id_str) {
        Ok(uid) => uid,
        Err(_) => {
            return (
                StatusCode::BAD_REQUEST,
                Json(json!({ "message": "Invalid experiment ID format" })),
            );
        }
    };

    let exp_res = sqlx::query_as::<_, Experiment>(
        "SELECT * FROM experiments WHERE id = $1"
    )
    .bind(exp_id)
    .fetch_optional(&state.db)
    .await;

    match exp_res {
        Ok(Some(exp)) => {
            match get_populated_experiment(&state.db, exp, false).await {
                Ok(populated) => (StatusCode::OK, Json(json!(populated))),
                Err(e) => {
                    error!("[EXPERIMENT] Population failed: {:?}", e);
                    (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        Json(json!({ "message": "Failed to construct response" })),
                    )
                }
            }
        }
        Ok(None) => {
            (
                StatusCode::NOT_FOUND,
                Json(json!({ "message": "Experiment not found" })),
            )
        }
        Err(e) => {
            error!("[EXPERIMENT] Fetch by ID failed: {:?}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "message": "Server error while fetching experiment" })),
            )
        }
    }
}

pub async fn create_experiment(
    State(state): State<AppState>,
    claims: Claims,
    Json(payload): Json<CreateExperimentRequest>,
) -> impl IntoResponse {
    info!("[EXPERIMENT] Create attempt by user: {}", claims.email);
    if let Err(rejection) = require_role(&claims, &["admin"]) {
        return rejection;
    }

    let name = payload.name.or(payload.title).unwrap_or_default();
    let sub_id_str = payload.subject_id.or(payload.subject).unwrap_or_default();
    let sub_id = match Uuid::parse_str(&sub_id_str) {
        Ok(uid) => uid,
        Err(_) => {
            return (
                StatusCode::BAD_REQUEST,
                Json(json!({ "message": "Invalid or missing subjectId" })),
            );
        }
    };

    let exp_id = Uuid::new_v4();
    // Generate clean slug from name
    let slug = name.to_lowercase().replace(' ', "-");

    let mut tx = match state.db.begin().await {
        Ok(t) => t,
        Err(e) => {
            error!("[EXPERIMENT] Transaction begin failed: {:?}", e);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "message": "Database transaction error" })),
            );
        }
    };

    let insert_res = sqlx::query(
        r#"
        INSERT INTO experiments (id, name, subject_id, slug, theory, algorithm, code_template, language)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
        "#
    )
    .bind(exp_id)
    .bind(&name)
    .bind(sub_id)
    .bind(&slug)
    .bind(&payload.theory)
    .bind(&payload.algorithm)
    .bind(&payload.code_template)
    .bind(&payload.language)
    .fetch_one(&mut *tx)
    .await;

    let created_exp = match insert_res {
        Ok(row) => {
            Experiment {
                id: row.get("id"),
                name: row.get("name"),
                subject_id: row.get("subject_id"),
                slug: row.get("slug"),
                r#type: row.get("type"),
                difficulty: row.get("difficulty"),
                status: row.get("status"),
                description: row.get("description"),
                estimated_time: row.get("estimated_time"),
                prerequisites: row.get("prerequisites"),
                thumbnail_url: row.get("thumbnail_url"),
                theory: row.get("theory"),
                algorithm: row.get("algorithm"),
                code_template: row.get("code_template"),
                language: row.get("language"),
                created_at: row.get("created_at"),
            }
        }
        Err(e) => {
            error!("[EXPERIMENT] Insert experiment failed: {:?}", e);
            return (
                StatusCode::BAD_REQUEST,
                Json(json!({ "message": format!("Failed to create experiment: {:?}", e) })),
            );
        }
    };

    // Insert testcases
    if let Some(tcs) = payload.testcases {
        for tc in tcs {
            let tc_id = Uuid::new_v4();
            let tc_res = sqlx::query(
                "INSERT INTO experiment_testcases (id, experiment_id, input, output) VALUES ($1, $2, $3, $4)"
            )
            .bind(tc_id)
            .bind(exp_id)
            .bind(&tc.input)
            .bind(&tc.output)
            .execute(&mut *tx)
            .await;

            if let Err(e) = tc_res {
                error!("[EXPERIMENT] Insert testcase failed: {:?}", e);
                return (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(json!({ "message": "Failed to create testcase" })),
                );
            }
        }
    }

    if let Err(e) = tx.commit().await {
        error!("[EXPERIMENT] Transaction commit failed: {:?}", e);
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "message": "Database transaction commit error" })),
        );
    }

    let details = format!("Created experiment: {}", name);
    log_activity(&state.db, "CREATE_EXPERIMENT", &claims.email, &claims.role, &details).await;

    // Retrieve full populated response
    match get_populated_experiment(&state.db, created_exp, true).await {
        Ok(pop) => (StatusCode::CREATED, Json(json!(pop))),
        Err(e) => (StatusCode::CREATED, Json(json!({ "message": format!("Created, but failed to fetch populated payload: {:?}", e) }))),
    }
}

pub async fn update_experiment(
    State(state): State<AppState>,
    claims: Claims,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateExperimentRequest>,
) -> impl IntoResponse {
    info!("[EXPERIMENT] Update attempt for experiment ID: {}", id);
    if let Err(rejection) = require_role(&claims, &["admin"]) {
        return rejection;
    }

    let existing_res = sqlx::query_as::<_, Experiment>(
        "SELECT * FROM experiments WHERE id = $1"
    )
    .bind(id)
    .fetch_optional(&state.db)
    .await;

    let mut existing = match existing_res {
        Ok(Some(e)) => e,
        Ok(None) => {
            return (
                StatusCode::NOT_FOUND,
                Json(json!({ "message": "Experiment not found" })),
            );
        }
        Err(e) => {
            error!("[EXPERIMENT] Query failed: {:?}", e);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "message": "Server error" })),
            );
        }
    };

    if let Some(name) = payload.name.or(payload.title) {
        existing.name = name;
    }
    if let Some(sub_str) = payload.subject_id.or(payload.subject) {
        if let Ok(sub_uid) = Uuid::parse_str(&sub_str) {
            existing.subject_id = sub_uid;
        }
    }
    if payload.theory.is_some() {
        existing.theory = payload.theory;
    }
    if payload.algorithm.is_some() {
        existing.algorithm = payload.algorithm;
    }
    if payload.code_template.is_some() {
        existing.code_template = payload.code_template;
    }
    if payload.language.is_some() {
        existing.language = payload.language;
    }

    let mut tx = match state.db.begin().await {
        Ok(t) => t,
        Err(e) => {
            error!("[EXPERIMENT] Transaction begin failed: {:?}", e);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "message": "Database transaction error" })),
            );
        }
    };

    let update_res = sqlx::query(
        r#"
        UPDATE experiments
        SET name = $1, subject_id = $2, theory = $3, algorithm = $4, code_template = $5, language = $6
        WHERE id = $7
        "#
    )
    .bind(&existing.name)
    .bind(existing.subject_id)
    .bind(&existing.theory)
    .bind(&existing.algorithm)
    .bind(&existing.code_template)
    .bind(&existing.language)
    .bind(id)
    .execute(&mut *tx)
    .await;

    if let Err(e) = update_res {
        error!("[EXPERIMENT] Update failed: {:?}", e);
        return (
            StatusCode::BAD_REQUEST,
            Json(json!({ "message": e.to_string() })),
        );
    }

    if let Some(tcs) = payload.testcases {
        // Clear existing test cases
        if let Err(e) = sqlx::query("DELETE FROM experiment_testcases WHERE experiment_id = $1")
            .bind(id)
            .execute(&mut *tx)
            .await
        {
            error!("[EXPERIMENT] Delete testcases failed: {:?}", e);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "message": "Failed to clear existing testcases" })),
            );
        }

        // Write new test cases
        for tc in tcs {
            let tc_id = Uuid::new_v4();
            let tc_res = sqlx::query(
                "INSERT INTO experiment_testcases (id, experiment_id, input, output) VALUES ($1, $2, $3, $4)"
            )
            .bind(tc_id)
            .bind(id)
            .bind(&tc.input)
            .bind(&tc.output)
            .execute(&mut *tx)
            .await;

            if let Err(e) = tc_res {
                error!("[EXPERIMENT] Insert testcase failed: {:?}", e);
                return (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(json!({ "message": "Failed to update testcase" })),
                );
            }
        }
    }

    if let Err(e) = tx.commit().await {
        error!("[EXPERIMENT] Transaction commit failed: {:?}", e);
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "message": "Database transaction commit error" })),
        );
    }

    match get_populated_experiment(&state.db, existing, true).await {
        Ok(pop) => (StatusCode::OK, Json(json!(pop))),
        Err(e) => (StatusCode::OK, Json(json!({ "message": format!("Updated, but failed to fetch populated payload: {:?}", e) }))),
    }
}

pub async fn delete_experiment(
    State(state): State<AppState>,
    claims: Claims,
    Path(id): Path<Uuid>,
) -> impl IntoResponse {
    info!("[EXPERIMENT] Delete attempt for ID: {}", id);
    if let Err(rejection) = require_role(&claims, &["admin"]) {
        return rejection;
    }

    let delete_res = sqlx::query("DELETE FROM experiments WHERE id = $1")
        .bind(id)
        .execute(&state.db)
        .await;

    match delete_res {
        Ok(_) => {
            (StatusCode::OK, Json(json!({ "message": "Experiment deleted" })))
        }
        Err(e) => {
            error!("[EXPERIMENT] Delete failed: {:?}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "message": e.to_string() })),
            )
        }
    }
}

pub async fn seed_experiments(
    State(state): State<AppState>,
    claims: Claims,
) -> impl IntoResponse {
    info!("[EXPERIMENT] Seeding default experiments");
    if let Err(rejection) = require_role(&claims, &["admin"]) {
        return rejection;
    }

    // Fetch subjects first to resolve subject_ids
    let subjects = match sqlx::query_as::<_, Subject>("SELECT * FROM subjects").fetch_all(&state.db).await {
        Ok(list) => list,
        Err(e) => {
            error!("[EXPERIMENT] Seed failed to retrieve subjects: {:?}", e);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "message": "Failed to read subjects for seeding" })),
            );
        }
    };

    let find_id = |keyword: &str| -> Option<Uuid> {
        subjects.iter().find(|s| s.title.to_lowercase().contains(&keyword.to_lowercase())).map(|s| s.id)
    };

    let dsa_id = find_id("Data Structures");
    let c_id = find_id("C Programming");
    let cn_id = find_id("Computer Networks");
    let dbms_id = find_id("Database");
    let dld_id = find_id("Digital Logic");
    let oops_id = find_id("Object Oriented");
    let mpmc_id = find_id("Microprocessor");

    let mut default_experiments = Vec::new();

    if let Some(sub_id) = dsa_id {
        default_experiments.push(json!({
            "subject_id": sub_id.to_string(),
            "title": "Reverse an Array",
            "theory": "Reversing an array involves swapping elements from both ends moving towards the center.",
            "algorithm": "1. Start\n2. Use two pointers: start=0, end=n-1\n3. Swap arr[start] and arr[end]\n4. Increment start, decrement end\n5. Repeat until start >= end",
            "code_template": "#include <iostream>\n#include <vector>\n\n// TODO: Implement the reverseArray function\nvoid reverseArray(std::vector<int>& arr) {\n    // Your code here\n}\n\nint main() {\n    std::vector<int> arr = {1, 2, 3, 4, 5};\n    \n    std::cout << \"Original: \";\n    for(int x : arr) std::cout << x << \" \";\n    \n    reverseArray(arr);\n    \n    std::cout << \"\\nReversed: \";\n    for(int x : arr) std::cout << x << \" \";\n    \n    return 0;\n}",
            "language": "cpp",
            "testcases": [ { "input": "", "output": "Original: 1 2 3 4 5 \nReversed: 5 4 3 2 1 " } ]
        }));
        default_experiments.push(json!({
            "subject_id": sub_id.to_string(),
            "title": "Binary Search Implementation",
            "theory": "Binary search targets a sorted array and repeatedly divides the search interval in half.",
            "algorithm": "1. Set low=0, high=n-1\nMid = (low+high)/2\n4. If target < mid, high=mid-1\n5. Else low=mid+1",
            "language": "cpp"
        }));
    }

    if let Some(sub_id) = c_id {
        default_experiments.push(json!({
            "subject_id": sub_id.to_string(),
            "title": "Sum of Natural Numbers",
            "theory": "Calculate the sum of first N natural numbers using a loop.",
            "language": "c"
        }));
    }

    if let Some(sub_id) = cn_id {
        default_experiments.push(json!({
            "subject_id": sub_id.to_string(),
            "title": "OSI vs TCP/IP Reference Models",
            "theory": "OSI has 7 layers, TCP/IP has 4.",
            "language": "Universal"
        }));
    }

    if let Some(sub_id) = dbms_id {
        default_experiments.push(json!({
            "subject_id": sub_id.to_string(),
            "title": "Introduction to DBMS (DDL/DML)",
            "theory": "Learn SQL commands: CREATE, INSERT, SELECT, UPDATE, DELETE.",
            "language": "SQL"
        }));
    }

    if let Some(sub_id) = dld_id {
        default_experiments.push(json!({
            "subject_id": sub_id.to_string(),
            "title": "Study and Verification of Logic Gates",
            "theory": "Verify AND, OR, NOT, NAND, NOR, XOR gates using truth tables.",
            "language": "Universal"
        }));
    }

    if let Some(sub_id) = oops_id {
        default_experiments.push(json!({
            "subject_id": sub_id.to_string(),
            "title": "Class and Object Basics",
            "theory": "Understand encapsulation and how objects are instantiated from classes in Java.",
            "language": "java"
        }));
    }

    if let Some(sub_id) = mpmc_id {
        default_experiments.push(json!({
            "subject_id": sub_id.to_string(),
            "title": "8-bit Addition & Subtraction",
            "theory": "Write 8085 assembly code to add two 8-bit numbers stored in memory.",
            "language": "Assembly"
        }));
    }

    let mut tx = match state.db.begin().await {
        Ok(t) => t,
        Err(e) => {
            error!("[EXPERIMENT] Seed transaction begin failed: {:?}", e);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "message": "Database transaction error" })),
            );
        }
    };

    // Clear existing test cases and experiments
    if let Err(e) = sqlx::query("DELETE FROM experiment_testcases").execute(&mut *tx).await {
        error!("[EXPERIMENT] Seed delete testcases failed: {:?}", e);
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "message": "Failed to clear existing testcases during seed" })),
        );
    }

    if let Err(e) = sqlx::query("DELETE FROM experiments").execute(&mut *tx).await {
        error!("[EXPERIMENT] Seed delete experiments failed: {:?}", e);
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "message": "Failed to clear existing experiments during seed" })),
        );
    }

    let mut inserted_count = 0;
    for ex in default_experiments {
        let sub_id = Uuid::parse_str(ex["subject_id"].as_str().unwrap()).unwrap();
        let title = ex["title"].as_str().unwrap();
        let theory = ex["theory"].as_str();
        let algorithm = ex["algorithm"].as_str();
        let code_template = ex["code_template"].as_str();
        let language = ex["language"].as_str().unwrap_or("Universal");
        let slug = title.to_lowercase().replace(' ', "-");

        let exp_id = Uuid::new_v4();

        let insert_res = sqlx::query(
            r#"
            INSERT INTO experiments (id, name, subject_id, slug, theory, algorithm, code_template, language)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            "#
        )
        .bind(exp_id)
        .bind(title)
        .bind(sub_id)
        .bind(&slug)
        .bind(theory)
        .bind(algorithm)
        .bind(code_template)
        .bind(language)
        .execute(&mut *tx)
        .await;

        if let Err(e) = insert_res {
            error!("[EXPERIMENT] Seed insert experiment failed: {:?}", e);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "message": format!("Failed to insert experiment: {:?}", e) })),
            );
        }

        if let Some(tcs) = ex["testcases"].as_array() {
            for tc in tcs {
                let tc_id = Uuid::new_v4();
                let tc_input = tc["input"].as_str();
                let tc_output = tc["output"].as_str();
                
                let tc_res = sqlx::query(
                    "INSERT INTO experiment_testcases (id, experiment_id, input, output) VALUES ($1, $2, $3, $4)"
                )
                .bind(tc_id)
                .bind(exp_id)
                .bind(tc_input)
                .bind(tc_output)
                .execute(&mut *tx)
                .await;

                if let Err(e) = tc_res {
                    error!("[EXPERIMENT] Seed insert testcase failed: {:?}", e);
                    return (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        Json(json!({ "message": "Failed to insert testcase during seed" })),
                    );
                }
            }
        }
        inserted_count += 1;
    }

    if let Err(e) = tx.commit().await {
        error!("[EXPERIMENT] Seed transaction commit failed: {:?}", e);
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "message": "Failed to commit seeded data" })),
        );
    }

    (
        StatusCode::CREATED,
        Json(json!({ "message": "Experiments seeded correctly", "count": inserted_count })),
    )
}
