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
            sqlx::query_as::<_, Experiment>("SELECT * FROM experiments WHERE subject_id = $1")
                .bind(sub_id)
                .fetch_all(&state.db)
                .await
        } else {
            // Treat sub_id_str as a slug
            sqlx::query_as::<_, Experiment>(
                "SELECT e.* FROM experiments e JOIN subjects s ON e.subject_id = s.id WHERE s.slug = $1"
            )
            .bind(sub_id_str)
            .fetch_all(&state.db)
            .await
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

    let exp_res = if let Ok(exp_id) = Uuid::parse_str(&experiment_id_str) {
        sqlx::query_as::<_, Experiment>("SELECT * FROM experiments WHERE id = $1")
            .bind(exp_id)
            .fetch_optional(&state.db)
            .await
    } else {
        // Fallback to slug lookup if it's not a valid UUID
        sqlx::query_as::<_, Experiment>("SELECT * FROM experiments WHERE slug = $1")
            .bind(&experiment_id_str)
            .fetch_optional(&state.db)
            .await
    };

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

    let get_sub_id_by_slug = |slug: &str| -> Option<Uuid> {
        subjects.iter().find(|s| s.slug.as_deref() == Some(slug)).map(|s| s.id)
    };

    let mut default_experiments = Vec::new();

    // 1. Data Structures & Algorithms (dsa)
    default_experiments.push(json!({
        "subject_slug": "dsa",
        "title": "Reverse an Array",
        "theory": "### Objective\nTo reverse an array in-place.\n\n### Theory\nReversing an array involves swapping elements from both ends moving towards the center.\n\n### Expected Result\nArray is reversed successfully.",
        "algorithm": "1. Start\n2. Use two pointers: start=0, end=n-1\n3. Swap arr[start] and arr[end]\n4. Increment start, decrement end\n5. Repeat until start >= end",
        "code_template": "#include <iostream>\n#include <vector>\n\n// TODO: Implement the reverseArray function\nvoid reverseArray(std::vector<int>& arr) {\n    // Your code here\n}\n\nint main() {\n    std::vector<int> arr = {1, 2, 3, 4, 5};\n    \n    std::cout << \"Original: \";\n    for(int x : arr) std::cout << x << \" \";\n    \n    reverseArray(arr);\n    \n    std::cout << \"\\nReversed: \";\n    for(int x : arr) std::cout << x << \" \";\n    \n    return 0;\n}",
        "language": "cpp",
        "slug": "dsa-exp-1",
        "testcases": [ { "input": "", "output": "Original: 1 2 3 4 5 \nReversed: 5 4 3 2 1 " } ]
    }));
    default_experiments.push(json!({
        "subject_slug": "dsa",
        "title": "Binary Search Implementation",
        "theory": "### Objective\nTo implement binary search.\n\n### Theory\nBinary search targets a sorted array and repeatedly divides the search interval in half.\n\n### Expected Result\nReturns index of target if found, else -1.",
        "algorithm": "1. Set low=0, high=n-1\n2. Mid = (low+high)/2\n3. If target == mid, return mid\n4. If target < mid, high=mid-1\n5. Else low=mid+1",
        "language": "cpp",
        "slug": "dsa-exp-2"
    }));

    // 2. C Programming Lab (c-programming)
    default_experiments.push(json!({
        "subject_slug": "c-programming",
        "title": "Sum of Natural Numbers",
        "theory": "### Objective\nCalculate sum of natural numbers.\n\n### Theory\nCalculate the sum of first N natural numbers using a loop.\n\n### Expected Result\nSum matches formula N*(N+1)/2.",
        "algorithm": "1. Initialize sum = 0.\n2. Loop from 1 to N.\n3. Add counter to sum.\n4. Output sum.",
        "language": "c",
        "slug": "c-exp-1"
    }));

    // 3. Digital Logic & Design (dld)
    default_experiments.push(json!({
        "subject_slug": "dld",
        "title": "Study and Verification of Logic Gates",
        "theory": "### Objective\nVerify OR, AND, NOT, XOR, NAND, NOR, XNOR gates.\n\n### Theory\nLogic gates are the basic building blocks of digital circuits.\n\n### Expected Result\nOutputs match the standard truth tables.",
        "algorithm": "1. Connect inputs to gate.\n2. Observe output indicator.\n3. Map logic truth table.",
        "language": "Universal",
        "slug": "dld-exp-1"
    }));
    default_experiments.push(json!({
        "subject_slug": "dld",
        "title": "Half Adder and Full Adder",
        "theory": "### Objective\nDesign Half Adder and Full Adder circuits.\n\n### Theory\nAdders perform binary arithmetic addition.\n\n### Expected Result\nSum and Carry output matches binary addition.",
        "algorithm": "1. Build Half Adder using XOR and AND.\n2. Build Full Adder using two Half Adders and an OR gate.",
        "language": "Universal",
        "slug": "dld-exp-2"
    }));
    default_experiments.push(json!({
        "subject_slug": "dld",
        "title": "Half Subtractor and Full Subtractor",
        "theory": "### Objective\nDesign subtractor circuits.\n\n### Theory\nSubtractors compute difference and borrow outputs.\n\n### Expected Result\nDifference and Borrow outputs match standard arithmetic.",
        "algorithm": "1. Construct Half Subtractor.\n2. Construct Full Subtractor.",
        "language": "Universal",
        "slug": "dld-exp-3"
    }));
    default_experiments.push(json!({
        "subject_slug": "dld",
        "title": "Code Conversion (Binary to Gray & Gray to Binary)",
        "theory": "### Objective\nDesign 4-bit binary to gray and gray to binary code converters.\n\n### Theory\nCode converters transform binary codes into gray code representations.\n\n### Expected Result\nConverted gray code sequence matches inputs.",
        "algorithm": "1. Connect inputs to XOR gates.\n2. Verify the output bit pattern.",
        "language": "Universal",
        "slug": "dld-exp-4"
    }));
    default_experiments.push(json!({
        "subject_slug": "dld",
        "title": "Combinational Logic Design (SOP & POS)",
        "theory": "### Objective\nDesign and verify combinational logic in SOP and POS forms.\n\n### Theory\nSOP uses sum of products; POS uses product of sums logic configurations.\n\n### Expected Result\nSimplified Boolean expression logic outputs match original truth tables.",
        "algorithm": "1. Simplify Boolean expression.\n2. Set up NAND/NOR logic gate networks.",
        "language": "Universal",
        "slug": "dld-exp-5"
    }));
    default_experiments.push(json!({
        "subject_slug": "dld",
        "title": "Decoder and Encoder Circuits",
        "theory": "### Objective\nRealization of 2:4 Decoder and 4:2 Encoder circuits.\n\n### Theory\nDecoders convert binary input code to active high output lines; encoders perform the reverse.\n\n### Expected Result\nOnly one selected line changes according to input combinations.",
        "algorithm": "1. Connect input switches to decoder logic gates.\n2. Verify active outputs.",
        "language": "Universal",
        "slug": "dld-exp-6"
    }));
    default_experiments.push(json!({
        "subject_slug": "dld",
        "title": "Multiplexer and Demultiplexer",
        "theory": "### Objective\nDesign and verify 4:1 Multiplexer and 1:4 Demultiplexer.\n\n### Theory\nMultiplexer routes one of many data sources; Demultiplexer routes one source to multiple destinations.\n\n### Expected Result\nOutputs follow the select switch combinations.",
        "algorithm": "1. Construct 4:1 Mux circuit.\n2. Connect selection lines and measure output state.",
        "language": "Universal",
        "slug": "dld-exp-7"
    }));
    default_experiments.push(json!({
        "subject_slug": "dld",
        "title": "Comparators (1-bit & 4-bit)",
        "theory": "### Objective\nDesign 1-bit comparator and study 4-bit comparator (IC 7485).\n\n### Theory\nComparators determine if A > B, A < B, or A = B.\n\n### Expected Result\nOutput LEDs show Greater, Lesser, or Equal relationship.",
        "algorithm": "1. Build 1-bit comparator circuit.\n2. Verify state outputs.",
        "language": "Universal",
        "slug": "dld-exp-8"
    }));
    default_experiments.push(json!({
        "subject_slug": "dld",
        "title": "Flip-Flops and Shift Registers",
        "theory": "### Objective\nVerify SR, D, JK, T Flip-Flops and Shift Registers.\n\n### Theory\nFlip-flops are bistable memory elements. Shift registers store and move binary bits.\n\n### Expected Result\nState transitions occur on active clock pulses.",
        "algorithm": "1. Wire latch inputs to clock and feedback gates.\n2. Observe state change.",
        "language": "Universal",
        "slug": "dld-exp-9"
    }));
    default_experiments.push(json!({
        "subject_slug": "dld",
        "title": "Synchronous and Asynchronous Counters",
        "theory": "### Objective\nDesign and verify Asynchronous (Mod-n) and Synchronous counters.\n\n### Theory\nCounters sequence binary counts through sequential flip-flop states.\n\n### Expected Result\nCounter increments or decrements periodically.",
        "algorithm": "1. Connect flip-flop outputs sequentially.\n2. Feed output to logic gates to reset at count boundary.",
        "language": "Universal",
        "slug": "dld-exp-10"
    }));

    // 4. Database Management (dbms)
    default_experiments.push(json!({
        "subject_slug": "dbms",
        "title": "Introduction to DBMS (DDL/DML)",
        "theory": "### Objective\nLearn SQL commands: CREATE, INSERT, SELECT, UPDATE, DELETE.\n\n### Theory\nDBMS manages structured table records using SQL commands.\n\n### Expected Result\nTables created, records inserted, and query matches returned successfully.",
        "algorithm": "1. Write CREATE DATABASE and CREATE TABLE statements.\n2. Use INSERT to add data.\n3. Execute query.",
        "language": "SQL",
        "slug": "dbms-exp-1"
    }));
    default_experiments.push(json!({
        "subject_slug": "dbms",
        "title": "Application Development",
        "theory": "### Objective\nDevelop a database-driven store management system.\n\n### Theory\nDatabase applications implement business logic on top of databases.\n\n### Expected Result\nForm inputs are saved into relational databases with referential integrity.",
        "algorithm": "1. Create master schema.\n2. Configure relationships.\n3. Run transaction forms.",
        "language": "SQL",
        "slug": "dbms-exp-2"
    }));
    default_experiments.push(json!({
        "subject_slug": "dbms",
        "title": "Relational Algebra Operations",
        "theory": "### Objective\nSelect, Project, Union, and Join operations in relational databases.\n\n### Theory\nRelational algebra defines query operations mathematically.\n\n### Expected Result\nExecution matches mathematical set relations.",
        "algorithm": "1. Perform selection.\n2. Perform projections.\n3. Execute JOINs.",
        "language": "SQL",
        "slug": "dbms-exp-3"
    }));
    default_experiments.push(json!({
        "subject_slug": "dbms",
        "title": "Normalization",
        "theory": "### Objective\nNormalize databases to 3NF/BCNF.\n\n### Theory\nNormalization decomposes tables to remove update/insert anomalies.\n\n### Expected Result\nDatabase tables split without information loss.",
        "algorithm": "1. Analyze functional dependencies.\n2. Identify violations.\n3. Decompose tables.",
        "language": "SQL",
        "slug": "dbms-exp-4"
    }));
    default_experiments.push(json!({
        "subject_slug": "dbms",
        "title": "Host Language Integration",
        "theory": "### Objective\nInteract with databases using PL/SQL.\n\n### Theory\nEmbedded SQL/procedures execute database transactions programmatically.\n\n### Expected Result\nResultSet mapped to host variables.",
        "algorithm": "1. Write procedures.\n2. Declare cursor variables.\n3. Bind inputs and execute.",
        "language": "SQL",
        "slug": "dbms-exp-5"
    }));

    // 5. Object Oriented Programming (oops)
    default_experiments.push(json!({
        "subject_slug": "oops",
        "title": "Class and Object Basics",
        "theory": "### Objective\nUnderstand classes and object initialization in Java.\n\n### Theory\nClasses define data fields and actions; objects instantiate these definitions.\n\n### Expected Result\nInstance variables set and methods executed.",
        "algorithm": "1. Define class.\n2. Instantiate object.\n3. Call methods.",
        "language": "java",
        "slug": "oops-exp-1"
    }));
    default_experiments.push(json!({
        "subject_slug": "oops",
        "title": "Implementation of Inheritance",
        "theory": "### Objective\nUnderstand parent-child relationships.\n\n### Theory\nInheritance passes fields and methods to sub-classes using `extends`.\n\n### Expected Result\nSub-class accesses parent attributes.",
        "algorithm": "1. Define base class.\n2. Define derived class.\n3. Instantiate child class.",
        "language": "java",
        "slug": "oops-exp-2"
    }));
    default_experiments.push(json!({
        "subject_slug": "oops",
        "title": "Demonstration of Polymorphism",
        "theory": "### Objective\nExplore method overriding and overloading.\n\n### Theory\nPolymorphism executes matching functions at runtime or compile-time.\n\n### Expected Result\nRuntime dynamic dispatch invokes subclass methods.",
        "algorithm": "1. Overload methods.\n2. Override base methods.\n3. Execute dynamically.",
        "language": "java",
        "slug": "oops-exp-3"
    }));
    default_experiments.push(json!({
        "subject_slug": "oops",
        "title": "Data Encapsulation and Abstraction",
        "theory": "### Objective\nMaster access modifiers and abstract classes.\n\n### Theory\nEncapsulation hides data via private fields. Abstraction defines abstract interfaces.\n\n### Expected Result\nData accessed only through public getters/setters.",
        "algorithm": "1. Use private modifiers.\n2. Create getters/setters.\n3. Create abstract classes.",
        "language": "java",
        "slug": "oops-exp-4"
    }));

    // 6. Microprocessor and Microcontroller (mpmc)
    default_experiments.push(json!({
        "subject_slug": "mpmc",
        "title": "8-bit Addition & Subtraction",
        "theory": "### Objective\nPerform 8-bit arithmetic on 8085/8086.\n\n### Theory\nAssembly instructions load values to registers and compute arithmetic sum.\n\n### Expected Result\nAccumulator contains correct sum.",
        "algorithm": "1. Load registers.\n2. ADD/SUB instructions.\n3. Store result.",
        "language": "Assembly",
        "slug": "mpmc-exp-1"
    }));
    default_experiments.push(json!({
        "subject_slug": "mpmc",
        "title": "Hexadecimal Addition & Subtraction",
        "theory": "### Objective\nPerform hex math.\n\n### Theory\nAssemble hexadecimal operations with register arithmetic.\n\n### Expected Result\nCalculated hex values stored.",
        "algorithm": "1. Set hex inputs.\n2. Add inputs.\n3. Verify output.",
        "language": "Assembly",
        "slug": "mpmc-exp-2"
    }));
    default_experiments.push(json!({
        "subject_slug": "mpmc",
        "title": "Addition & Subtraction of Two BCD Numbers",
        "theory": "### Objective\nAdd BCD numbers.\n\n### Theory\nBinary coded decimal requires decimal adjust instructions like DAA.\n\n### Expected Result\nOutput adjusted to BCD boundaries.",
        "algorithm": "1. Add BCD inputs.\n2. Run DAA instruction.\n3. Save value.",
        "language": "Assembly",
        "slug": "mpmc-exp-3"
    }));
    default_experiments.push(json!({
        "subject_slug": "mpmc",
        "title": "Multiplication & Division of Two 8-bit Numbers",
        "theory": "### Objective\nImplement multiplier.\n\n### Theory\nMultiplication uses repeated addition or register shift techniques.\n\n### Expected Result\nProduct stored in memory location.",
        "algorithm": "1. Initialize counter.\n2. Loop addition.\n3. Decrement counter.",
        "language": "Assembly",
        "slug": "mpmc-exp-4"
    }));
    default_experiments.push(json!({
        "subject_slug": "mpmc",
        "title": "Find Largest & Smallest Number in an Array",
        "theory": "### Objective\nArray search.\n\n### Theory\nArray items are loaded into register and compared sequentially.\n\n### Expected Result\nLargest element returned.",
        "algorithm": "1. Initialize pointer.\n2. Compare values.\n3. Update maximum.",
        "language": "Assembly",
        "slug": "mpmc-exp-5"
    }));
    default_experiments.push(json!({
        "subject_slug": "mpmc",
        "title": "Arrange Array in Ascending Order",
        "theory": "### Objective\nSort array in ascending order.\n\n### Theory\nBubble sort swaps adjacent elements if out of order.\n\n### Expected Result\nSorted array sequence.",
        "algorithm": "1. Set loop counter.\n2. Compare adjacent.\n3. Swap if greater.",
        "language": "Assembly",
        "slug": "mpmc-exp-6"
    }));
    default_experiments.push(json!({
        "subject_slug": "mpmc",
        "title": "Arrange Array in Descending Order",
        "theory": "### Objective\nSort array in descending order.\n\n### Theory\nCompare elements and swap to sort array elements descending.\n\n### Expected Result\nArray in descending order.",
        "algorithm": "1. Set outer/inner loops.\n2. Compare and swap.",
        "language": "Assembly",
        "slug": "mpmc-exp-7"
    }));
    default_experiments.push(json!({
        "subject_slug": "mpmc",
        "title": "Hexadecimal to ASCII & Vice Versa",
        "theory": "### Objective\nCharacter conversion.\n\n### Theory\nConvert hex codes to matching ASCII character values.\n\n### Expected Result\nASCII bytes generated.",
        "algorithm": "1. Mask nibbles.\n2. Add displacement values.\n3. Store output.",
        "language": "Assembly",
        "slug": "mpmc-exp-8"
    }));

    // 7. Operating Systems (os) - Phase 1
    default_experiments.push(json!({
        "subject_slug": "os",
        "title": "FCFS Scheduling",
        "theory": "### Objective\nTo simulate the First-Come First-Served (FCFS) process scheduling algorithm.\n\n### Theory\nFCFS requests the CPU in the order of arrival. It is a non-preemptive scheduling policy.\n\n### Expected Result\nGantt chart visualization and calculation of waiting/turnaround times.",
        "algorithm": "1. Input arrival and burst times.\n2. Sort processes by arrival time.\n3. Compute start and completion times.\n4. Calculate waiting and turnaround times.",
        "language": "Universal",
        "slug": "os-exp-1"
    }));
    default_experiments.push(json!({
        "subject_slug": "os",
        "title": "SJF Scheduling",
        "theory": "### Objective\nTo simulate Shortest Job First (SJF) scheduling.\n\n### Theory\nSJF schedules processes based on the shortest CPU burst time. It can be preemptive or non-preemptive.\n\n### Expected Result\nProcess list execution table sorted by burst time and scheduling gantt chart.",
        "algorithm": "1. Input arrival and burst times.\n2. Pick the process with the shortest burst time first.\n3. Compute completion, waiting, and turnaround times.",
        "language": "Universal",
        "slug": "os-exp-2"
    }));
    default_experiments.push(json!({
        "subject_slug": "os",
        "title": "Priority Scheduling",
        "theory": "### Objective\nTo simulate Priority scheduling.\n\n### Theory\nPriority scheduling schedules the process with the highest priority first.\n\n### Expected Result\nHighest priority processes execute first in the timeline.",
        "algorithm": "1. Input burst time and priority value.\n2. Sort and run based on highest priority.\n3. Compute scheduling statistics.",
        "language": "Universal",
        "slug": "os-exp-3"
    }));
    default_experiments.push(json!({
        "subject_slug": "os",
        "title": "Round Robin Scheduling",
        "theory": "### Objective\nTo simulate Round Robin (RR) scheduling.\n\n### Theory\nRR allocates CPU to each process for a fixed time quantum in a cyclic order.\n\n### Expected Result\nInterleaved execution timeline showing process preemption at quantum boundaries.",
        "algorithm": "1. Set quantum size.\n2. Keep queue of ready processes.\n3. Run process for quantum size, preempt, and append back.",
        "language": "Universal",
        "slug": "os-exp-4"
    }));
    default_experiments.push(json!({
        "subject_slug": "os",
        "title": "First Fit Memory Allocation",
        "theory": "### Objective\nSimulate First Fit memory allocation.\n\n### Theory\nFirst Fit allocates the first memory block that is big enough.\n\n### Expected Result\nProcesses assigned to the first matching memory block, showing internal fragmentation.",
        "algorithm": "1. Scan block list from the beginning.\n2. Allocate first block >= process size.\n3. Keep track of unused block space.",
        "language": "Universal",
        "slug": "os-exp-5"
    }));
    default_experiments.push(json!({
        "subject_slug": "os",
        "title": "Best Fit Memory Allocation",
        "theory": "### Objective\nSimulate Best Fit memory allocation.\n\n### Theory\nBest Fit allocates the block closest in size to minimize remaining space.\n\n### Expected Result\nMinimal internal fragmentation after process allocation.",
        "algorithm": "1. Scan entire block list.\n2. Find block with minimum positive difference between block size and process size.\n3. Allocate block.",
        "language": "Universal",
        "slug": "os-exp-6"
    }));
    default_experiments.push(json!({
        "subject_slug": "os",
        "title": "Worst Fit Memory Allocation",
        "theory": "### Objective\nSimulate Worst Fit memory allocation.\n\n### Theory\nWorst Fit allocates the largest available block, leaving a larger leftover segment.\n\n### Expected Result\nProcesses assigned to the largest available block.",
        "algorithm": "1. Scan entire block list.\n2. Find the block with the maximum size.\n3. Allocate and update block size.",
        "language": "Universal",
        "slug": "os-exp-7"
    }));
    default_experiments.push(json!({
        "subject_slug": "os",
        "title": "Banker's Algorithm",
        "theory": "### Objective\nSimulate deadlock avoidance using Banker's Algorithm.\n\n### Theory\nCheck if resource allocation leaves the system in a safe or unsafe state.\n\n### Expected Result\nNeed matrix computed and a safe sequence of execution outputted.",
        "algorithm": "1. Compute Need = Max - Allocation.\n2. Verify if Need <= Available.\n3. If true, simulate process completion and update safety path.",
        "language": "Universal",
        "slug": "os-exp-8"
    }));
    default_experiments.push(json!({
        "subject_slug": "os",
        "title": "Deadlock Detection",
        "theory": "### Objective\nDetect deadlock state using Resource Allocation Graph.\n\n### Theory\nDeadlock occurs when processes wait cyclically for resources.\n\n### Expected Result\nGraph traversal shows cycle presence indicating deadlock status.",
        "algorithm": "1. Build Resource Allocation Graph.\n2. Perform cycle detection algorithm.\n3. Identify deadlocked processes.",
        "language": "Universal",
        "slug": "os-exp-9"
    }));
    default_experiments.push(json!({
        "subject_slug": "os",
        "title": "Producer Consumer Problem",
        "theory": "### Objective\nSimulate buffer synchronization.\n\n### Theory\nProducer adds items and Consumer removes items from a shared buffer with locking.\n\n### Expected Result\nSynchronization log showing buffer full/empty status updates.",
        "algorithm": "1. Initialize semaphores: empty=n, full=0, mutex=1.\n2. Wait on empty/mutex to produce.\n3. Wait on full/mutex to consume.",
        "language": "Universal",
        "slug": "os-exp-10"
    }));
    default_experiments.push(json!({
        "subject_slug": "os",
        "title": "Readers Writers Problem",
        "theory": "### Objective\nSimulate reader-writer locking.\n\n### Theory\nMultiple readers read simultaneously, but writers get exclusive access.\n\n### Expected Result\nResource state changes showing mutual exclusion for writers.",
        "algorithm": "1. Maintain read_count and mutex locks.\n2. Request write lock if write active.\n3. Allow readers to overlap.",
        "language": "Universal",
        "slug": "os-exp-11"
    }));

    // 8. Computer Networks (cn)
    default_experiments.push(json!({
        "subject_slug": "cn",
        "title": "OSI vs TCP/IP Reference Models",
        "theory": "### Objective\nCompare OSI and TCP/IP layered networking architectures.\n\n### Theory\nOSI has 7 abstraction layers; TCP/IP has 4 practical layers.\n\n### Expected Result\nDetailed description of packet path and protocol headers.",
        "algorithm": "1. Map OSI to TCP/IP corresponding layers.\n2. Inspect encapsulation protocol definitions.",
        "language": "Universal",
        "slug": "cn-exp-1"
    }));
    default_experiments.push(json!({
        "subject_slug": "cn",
        "title": "CSMA/CD Protocol",
        "theory": "### Objective\nSimulate carrier sensing and collision detection in Ethernet.\n\n### Theory\nNodes sense network carrier before transmitting, and use backoff algorithm on collision.\n\n### Expected Result\nTransmitted packets successfully, or retransmitted after collision and backoff.",
        "algorithm": "1. Check if channel is idle.\n2. If idle, transmit packet.\n3. If collision, trigger jam signal and backoff.",
        "language": "Universal",
        "slug": "cn-exp-2"
    }));
    default_experiments.push(json!({
        "subject_slug": "cn",
        "title": "ARP Protocol Simulation",
        "theory": "### Objective\nSimulate address resolution protocol mapping IP to MAC.\n\n### Theory\nARP broadcasts requests to find MAC corresponding to a given target IP.\n\n### Expected Result\nBroadcast ARP request, followed by unicast ARP response.",
        "algorithm": "1. Check cache.\n2. Broadcast ARP request.\n3. Receive unicast ARP reply from target and update table.",
        "language": "Universal",
        "slug": "cn-exp-3"
    }));
    default_experiments.push(json!({
        "subject_slug": "cn",
        "title": "Distance Vector Routing",
        "theory": "### Objective\nSimulate routing table computation using Bellman-Ford algorithm.\n\n### Theory\nRouters periodically share vector tables with direct neighbors.\n\n### Expected Result\nRouting tables converge to short path costs.",
        "algorithm": "1. Update distance matrices: D(x, y) = min{ c(x,v) + D(v,y) }.\n2. Share updates with neighbors.",
        "language": "Universal",
        "slug": "cn-exp-4"
    }));
    default_experiments.push(json!({
        "subject_slug": "cn",
        "title": "Selective Repeat Protocol",
        "theory": "### Objective\nSimulate Selective Repeat ARQ flow control.\n\n### Theory\nReceiver accepts out-of-order packets and requests individual lost packet retransmissions.\n\n### Expected Result\nIndividual negative acknowledgments trigger retransmission of missing frame.",
        "algorithm": "1. Sender window size N.\n2. Send N frames.\n3. Resend only packets that trigger NAK/Timeout.",
        "language": "Universal",
        "slug": "cn-exp-5"
    }));
    default_experiments.push(json!({
        "subject_slug": "cn",
        "title": "Go Back N Protocol",
        "theory": "### Objective\nSimulate sliding window GBN protocol.\n\n### Theory\nSender transmits up to N frames. Packet loss requires retransmitting all frames from the lost frame onwards.\n\n### Expected Result\nACK triggers window slide, while timeout triggers bulk retransmission of outstanding frames.",
        "algorithm": "1. Set sender window size N.\n2. On timeout, resend all frames starting from lost packet index.",
        "language": "Universal",
        "slug": "cn-exp-6"
    }));
    default_experiments.push(json!({
        "subject_slug": "cn",
        "title": "Token Ring Protocol",
        "theory": "### Objective\nSimulate token passing channel access.\n\n### Theory\nA frame-like token circulates ring to grant nodes transmission rights.\n\n### Expected Result\nNodes transmit data only when capturing active token.",
        "algorithm": "1. Pass token around ring.\n2. If node has data, change token status to busy and send data frame.\n3. Release token once data ACK is received.",
        "language": "Universal",
        "slug": "cn-exp-7"
    }));
    default_experiments.push(json!({
        "subject_slug": "cn",
        "title": "Link State Routing",
        "theory": "### Objective\nSimulate link state routing database and Dijkstra updates.\n\n### Theory\nEach router floods link state packets to build complete network topological map.\n\n### Expected Result\nConverged shortest path tree computed dynamically.",
        "algorithm": "1. Flood LSP to all nodes.\n2. Apply Dijkstra algorithm on converged topology database.",
        "language": "Universal",
        "slug": "cn-exp-8"
    }));
    default_experiments.push(json!({
        "subject_slug": "cn",
        "title": "Error Detection and Correction",
        "theory": "### Objective\nImplement CRC and Hamming parity codes.\n\n### Theory\nParity bits or mathematical division polynomial codes detect/correct transmission bit errors.\n\n### Expected Result\nReceiver verifies checksum matches and corrects single-bit failures.",
        "algorithm": "1. Compute CRC or Hamming bits on input binary.\n2. Simulate channel transmission bit-flip.\n3. Detect error at receiver.",
        "language": "Universal",
        "slug": "cn-exp-9"
    }));
    default_experiments.push(json!({
        "subject_slug": "cn",
        "title": "Stop and Wait Protocol",
        "theory": "### Objective\nSimulate basic Stop and Wait ARQ flow control.\n\n### Theory\nSender waits for confirmation acknowledgment before transmitting next frame.\n\n### Expected Result\nFrame transmission timeline showing alternating data and ACK steps.",
        "algorithm": "1. Send single frame.\n2. Wait for ACK.\n3. If timeout before ACK, retransmit frame.",
        "language": "Universal",
        "slug": "cn-exp-11"
    }));

    // 9. Principles of Data Structures (pds)
    default_experiments.push(json!({
        "subject_slug": "pds",
        "title": "Stack Operations",
        "theory": "### Objective\nVerify stack LIFO operations.\n\n### Theory\nStack supports insert/remove from single top end (Last-In First-Out).\n\n### Expected Result\nElements retrieved in reverse order of input.",
        "algorithm": "1. Push items onto stack.\n2. Pop item and read value.\n3. Check overflow/underflow boundaries.",
        "language": "Universal",
        "slug": "pds-exp-1"
    }));
    default_experiments.push(json!({
        "subject_slug": "pds",
        "title": "Queue Operations",
        "theory": "### Objective\nVerify queue FIFO operations.\n\n### Theory\nQueue operates on First-In First-Out basis, inserting at rear and removing from front.\n\n### Expected Result\nElements retrieved in the exact order of input.",
        "algorithm": "1. Enqueue items at rear.\n2. Dequeue items from front.",
        "language": "Universal",
        "slug": "pds-exp-2"
    }));
    default_experiments.push(json!({
        "subject_slug": "pds",
        "title": "Circular Queue",
        "theory": "### Objective\nUnderstand wrap-around memory reuse in queues.\n\n### Theory\nCircular queue links the last position back to the first to avoid unused memory slots.\n\n### Expected Result\nPointers front and rear wrap around count modulo N.",
        "algorithm": "1. Insert item at index (rear + 1) % size.\n2. Remove item at index (front + 1) % size.",
        "language": "Universal",
        "slug": "pds-exp-3"
    }));
    default_experiments.push(json!({
        "subject_slug": "pds",
        "title": "Linked List",
        "theory": "### Objective\nSimulate singly linked list insertions and deletions.\n\n### Theory\nLinked list node contains data field and a pointer link to the next node.\n\n### Expected Result\nTraversal of nodes from head to null prints sequential values.",
        "algorithm": "1. Create node with data and null pointer.\n2. Traverse to insert/delete at target location.\n3. Update node pointers.",
        "language": "Universal",
        "slug": "pds-exp-4"
    }));
    default_experiments.push(json!({
        "subject_slug": "pds",
        "title": "Doubly Linked List",
        "theory": "### Objective\nVerify doubly linked list pointers.\n\n### Theory\nNodes maintain two link pointers: one to the next node and one to the previous node.\n\n### Expected Result\nList traversal works bidirectionally (forward and backward).",
        "algorithm": "1. Allocate node.\n2. Bind next and prev pointers to neighbors.\n3. Update bounds.",
        "language": "Universal",
        "slug": "pds-exp-5"
    }));
    default_experiments.push(json!({
        "subject_slug": "pds",
        "title": "Binary Search Tree",
        "theory": "### Objective\nImplement BST logic.\n\n### Theory\nLeft children values are smaller than root; right children values are larger.\n\n### Expected Result\nInorder traversal outputs sorted values.",
        "algorithm": "1. Compare input with root.\n2. Traverse left if smaller, else right.\n3. Insert at null leaf.",
        "language": "Universal",
        "slug": "pds-exp-6"
    }));
    default_experiments.push(json!({
        "subject_slug": "pds",
        "title": "AVL Tree",
        "theory": "### Objective\nSimulate self-balancing tree search.\n\n### Theory\nAVL balance factor (height difference) must stay within [-1, 1]. Rotations fix violations.\n\n### Expected Result\nAutomatic balancing via LL, RR, LR, or RL rotations upon insertion.",
        "algorithm": "1. Perform standard BST insertion.\n2. Compute heights and find imbalance.\n3. Perform matching node rotations.",
        "language": "Universal",
        "slug": "pds-exp-7"
    }));
    default_experiments.push(json!({
        "subject_slug": "pds",
        "title": "Breadth First Search",
        "theory": "### Objective\nTraverse graph level-by-level.\n\n### Theory\nBFS visits all neighbor vertices at current level before heading to next level, using a queue.\n\n### Expected Result\nTraversal list order matches level-order adjacency list.",
        "algorithm": "1. Initialize visited array and queue.\n2. Enqueue start node and mark visited.\n3. Pop and enqueue unvisited neighbors.",
        "language": "Universal",
        "slug": "pds-exp-8"
    }));
    default_experiments.push(json!({
        "subject_slug": "pds",
        "title": "Depth First Search",
        "theory": "### Objective\nTraverse graph deeply.\n\n### Theory\nDFS explores vertices along each branch as far as possible before backtracking, using recursion/stack.\n\n### Expected Result\nGraph traversed following deep path sequence.",
        "algorithm": "1. Use recursion or stack.\n2. Visit adjacent unvisited node.\n3. Backtrack if no unvisited neighbor exists.",
        "language": "Universal",
        "slug": "pds-exp-9"
    }));
    default_experiments.push(json!({
        "subject_slug": "pds",
        "title": "Shortest Path in Graph",
        "theory": "### Objective\nFind path of minimum weight between nodes.\n\n### Theory\nCalculate cumulative weights along possible edge paths to find short path.\n\n### Expected Result\nReturns shortest path nodes and cumulative weight cost.",
        "algorithm": "1. Initialize distances to infinity.\n2. Update distances using weight matrices.\n3. Output optimal path.",
        "language": "Universal",
        "slug": "pds-exp-10"
    }));

    // 10. Design and Analysis of Algorithms (daa)
    default_experiments.push(json!({
        "subject_slug": "daa",
        "title": "Insertion Sort",
        "theory": "### Objective\nSort array using insertion method.\n\n### Theory\nBuilds sorted array one item at a time by comparison and displacement shift.\n\n### Expected Result\nElements are sorted in ascending order.",
        "algorithm": "1. Iterate from index 1 to n.\n2. Compare element with sorted partition.\n3. Shift elements and insert.",
        "language": "Universal",
        "slug": "daa-exp-1"
    }));
    default_experiments.push(json!({
        "subject_slug": "daa",
        "title": "Quick Sort",
        "theory": "### Objective\nPerform divide and conquer sorting.\n\n### Theory\nQuick Sort selects a pivot, partitions elements, and recursively sorts left and right sub-arrays.\n\n### Expected Result\nElements sorted. Pivot elements placed at their correct sorted positions.",
        "algorithm": "1. Pick pivot.\n2. Partition array: items <= pivot on left, items > pivot on right.\n3. Recursively quicksort partitions.",
        "language": "Universal",
        "slug": "daa-exp-2"
    }));
    default_experiments.push(json!({
        "subject_slug": "daa",
        "title": "Merge Sort",
        "theory": "### Objective\nPerform recursive merge sorting.\n\n### Theory\nSplit array in halves recursively, sort them, and merge back to sorted state.\n\n### Expected Result\nSorted output sequence.\n\n### Procedure\n1. Divide array.\n2. Sort recursively.\n3. Merge sorted halves.",
        "algorithm": "1. Divide array into halves.\n2. Recursively sort halves.\n3. Merge sorted halves using temporary storage.",
        "language": "Universal",
        "slug": "daa-exp-3"
    }));
    default_experiments.push(json!({
        "subject_slug": "daa",
        "title": "Dijkstra Algorithm",
        "theory": "### Objective\nFind single-source shortest path.\n\n### Theory\nDijkstra uses greedy criteria to find minimum path weight to all graph vertices.\n\n### Expected Result\nShortest paths from start node.",
        "algorithm": "1. Initialize distances.\n2. Pick node with minimum distance.\n3. Relax adjacent edges.",
        "language": "Universal",
        "slug": "daa-exp-4"
    }));
    default_experiments.push(json!({
        "subject_slug": "daa",
        "title": "Kruskal Algorithm",
        "theory": "### Objective\nFind Minimum Spanning Tree (MST).\n\n### Theory\nKruskal sorts all edges and greedily adds edges that do not form cycles using Disjoint-Set.\n\n### Expected Result\nMST edges and total weight.",
        "algorithm": "1. Sort edges.\n2. Loop through sorted edges.\n3. Add edge if it does not form a cycle.",
        "language": "Universal",
        "slug": "daa-exp-5"
    }));
    default_experiments.push(json!({
        "subject_slug": "daa",
        "title": "Prim Algorithm",
        "theory": "### Objective\nGrow MST from a start node.\n\n### Theory\nPrim grows MST by adding the minimum weight edge from visited tree to unvisited vertices.\n\n### Expected Result\nFinal connected MST tree.",
        "algorithm": "1. Start with single vertex.\n2. Find minimum weight outgoing edge.\n3. Add target vertex to tree.",
        "language": "Universal",
        "slug": "daa-exp-6"
    }));
    default_experiments.push(json!({
        "subject_slug": "daa",
        "title": "Bellman Ford Algorithm",
        "theory": "### Objective\nFind shortest paths with negative edges.\n\n### Theory\nBellman Ford relaxes all edges |V|-1 times, detecting negative cycles.\n\n### Expected Result\nDistances to all nodes or negative cycle warning.",
        "algorithm": "1. Initialize distances.\n2. Relax all edges |V|-1 times.\n3. Check for negative cycle changes.",
        "language": "Universal",
        "slug": "daa-exp-7"
    }));
    default_experiments.push(json!({
        "subject_slug": "daa",
        "title": "Longest Common Subsequence",
        "theory": "### Objective\nSolve LCS using Dynamic Programming.\n\n### Theory\nCompare strings using table matrix storage to find the longest shared sub-sequence.\n\n### Expected Result\nLCS character sequence length and string.",
        "algorithm": "1. Initialize DP table of size (m+1)x(n+1).\n2. If string chars match: dp[i][j] = dp[i-1][j-1] + 1.\n3. Else take max of left/top.",
        "language": "Universal",
        "slug": "daa-exp-8"
    }));

    // 11. Computer Organization and Architecture (coa)
    default_experiments.push(json!({
        "subject_slug": "coa",
        "title": "Half Adder",
        "theory": "### Objective\nSimulate Half Adder digital design.\n\n### Theory\nHalf adder performs arithmetic addition of two 1-bit inputs A and B.\n\n### Expected Result\nSum = A XOR B, Carry = A AND B.",
        "algorithm": "1. Feed A and B values.\n2. XOR outputs Sum.\n3. AND outputs Carry.",
        "language": "Universal",
        "slug": "coa-exp-1"
    }));
    default_experiments.push(json!({
        "subject_slug": "coa",
        "title": "Full Adder",
        "theory": "### Objective\nSimulate Full Adder digital design.\n\n### Theory\nFull adder computes binary addition on inputs A, B, and Carry-in.\n\n### Expected Result\nSum and Carry output matches binary addition.",
        "algorithm": "1. Implement sum logic using XOR gates.\n2. Implement carry logic using AND/OR gates.",
        "language": "Universal",
        "slug": "coa-exp-2"
    }));
    default_experiments.push(json!({
        "subject_slug": "coa",
        "title": "Decoder",
        "theory": "### Objective\nSimulate 3:8 decoder logic.\n\n### Theory\nDecoder switches one of 2^N output lines to high based on N-bit input codes.\n\n### Expected Result\nOnly the active output line is set.",
        "algorithm": "1. Apply binary input lines.\n2. Evaluate logic gate output states.",
        "language": "Universal",
        "slug": "coa-exp-3"
    }));
    default_experiments.push(json!({
        "subject_slug": "coa",
        "title": "Multiplexer",
        "theory": "### Objective\nSimulate multiplexer data routing.\n\n### Theory\nMux channels one of many inputs to single output line using select codes.\n\n### Expected Result\nOutput state is equal to selected input.",
        "algorithm": "1. Set select switches.\n2. Set data input values.\n3. Verify output.",
        "language": "Universal",
        "slug": "coa-exp-4"
    }));
    default_experiments.push(json!({
        "subject_slug": "coa",
        "title": "Flip Flops",
        "theory": "### Objective\nVerify flip-flop state machines.\n\n### Theory\nSequential flip-flop circuits store state bits triggered on clock pulses.\n\n### Expected Result\nState transitions match the selected flip-flop model.",
        "algorithm": "1. Set inputs.\n2. Toggle clock pulse.\n3. Verify state.",
        "language": "Universal",
        "slug": "coa-exp-5"
    }));
    default_experiments.push(json!({
        "subject_slug": "coa",
        "title": "Arithmetic Logic Unit",
        "theory": "### Objective\nSimulate basic operations inside ALU.\n\n### Theory\nALU processes basic mathematical and logic functions based on opcodes.\n\n### Expected Result\nOutputs match selected operation result.",
        "algorithm": "1. Set operands A and B.\n2. Apply operation selection opcode.\n3. Read output results.",
        "language": "Universal",
        "slug": "coa-exp-6"
    }));
    default_experiments.push(json!({
        "subject_slug": "coa",
        "title": "Register Transfer Operations",
        "theory": "### Objective\nSimulate micro-operations.\n\n### Theory\nRegister transfer language describes register data movements inside CPU.\n\n### Expected Result\nData is transferred cleanly between registers.",
        "algorithm": "1. Select source register.\n2. Set register value.\n3. Trigger transfer pulse.",
        "language": "Universal",
        "slug": "coa-exp-7"
    }));
    default_experiments.push(json!({
        "subject_slug": "coa",
        "title": "Datapath Simulation",
        "theory": "### Objective\nUnderstand CPU instruction cycles.\n\n### Theory\nDatapath coordinates instruction execution cycle: fetch, decode, and execute.\n\n### Expected Result\nInstruction updates PC and execution updates memory/register state.",
        "algorithm": "1. Fetch instruction from memory.\n2. Decode instruction opcode.\n3. Execute register/memory micro-operations.",
        "language": "Universal",
        "slug": "coa-exp-8"
    }));

    // 12. Compiler Design (cd) - Phase 2
    default_experiments.push(json!({
        "subject_slug": "cd",
        "title": "FIRST Set Generation",
        "theory": "### Objective\nGenerate FIRST set of context free grammar.\n\n### Theory\nFIRST(X) is the set of terminals that begin strings derived from X.\n\n### Expected Result\nCalculated terminal set for all grammar symbols.",
        "algorithm": "1. Input grammar rules.\n2. Apply first-set rules.\n3. Compute terminals recursively.",
        "language": "Universal",
        "slug": "cd-exp-1"
    }));
    default_experiments.push(json!({
        "subject_slug": "cd",
        "title": "FOLLOW Set Generation",
        "theory": "### Objective\nGenerate FOLLOW set of grammar.\n\n### Theory\nFOLLOW(A) is the set of terminals that can appear immediately to the right of A.\n\n### Expected Result\nTerminal set corresponding to grammar elements.",
        "algorithm": "1. Run FIRST set calculation.\n2. Apply right-hand side matching rules.\n3. Compute follow boundaries.",
        "language": "Universal",
        "slug": "cd-exp-2"
    }));
    default_experiments.push(json!({
        "subject_slug": "cd",
        "title": "Parse Tree Generation",
        "theory": "### Objective\nVerify derivation tree syntax structure.\n\n### Theory\nParse tree traces steps of string parsing using production grammar.\n\n### Expected Result\nVisual tree diagram matching syntax structure.",
        "algorithm": "1. Input string.\n2. Select parse engine.\n3. Output derivation tree.",
        "language": "Universal",
        "slug": "cd-exp-3"
    }));
    default_experiments.push(json!({
        "subject_slug": "cd",
        "title": "Left Recursion Removal",
        "theory": "### Objective\nRemove left recursive grammar rules.\n\n### Theory\nLeft recursion leads parsers into infinite loops, and must be transformed.\n\n### Expected Result\nOutput grammar with removed recursion.",
        "algorithm": "1. Find rules of form A -> A alpha | beta.\n2. Transform to A -> beta A' and A' -> alpha A' | epsilon.",
        "language": "Universal",
        "slug": "cd-exp-4"
    }));
    default_experiments.push(json!({
        "subject_slug": "cd",
        "title": "Regular Expression to NFA",
        "theory": "### Objective\nConvert regex to matching state machines.\n\n### Theory\nThompson's construction converts regular expressions to non-deterministic finite automata.\n\n### Expected Result\nVisual NFA state diagram.",
        "algorithm": "1. Parse regular expression.\n2. Apply Thompson base structures.\n3. Connect state loops.",
        "language": "Universal",
        "slug": "cd-exp-5"
    }));
    default_experiments.push(json!({
        "subject_slug": "cd",
        "title": "Infix to Postfix Conversion",
        "theory": "### Objective\nConvert arithmetic expression format.\n\n### Theory\nOperators are placed after operands to simplify execution stacks.\n\n### Expected Result\nPostfix string output.",
        "algorithm": "1. Scan string.\n2. Push operands.\n3. Move operators based on precedence hierarchy.",
        "language": "Universal",
        "slug": "cd-exp-6"
    }));
    default_experiments.push(json!({
        "subject_slug": "cd",
        "title": "Three Address Code Generation",
        "theory": "### Objective\nGenerate intermediate compiler instructions.\n\n### Theory\nThree address code limits instructions to at most three memory/register references.\n\n### Expected Result\nSequential instruction list using temp variables.",
        "algorithm": "1. Parse AST syntax tree.\n2. Emit temp variables.\n3. Output code list.",
        "language": "Universal",
        "slug": "cd-exp-7"
    }));

    // 13. Optimization Techniques (ot)
    default_experiments.push(json!({
        "subject_slug": "ot",
        "title": "Fibonacci Search Method",
        "theory": "### Objective\nFind optimum of single-variable function.\n\n### Theory\nFibonacci search narrows down intervals using Fibonacci numbers.\n\n### Expected Result\nMinimal search interval bounds.",
        "algorithm": "1. Compute Fibonacci sequence values.\n2. Reduce search range using sequence intervals.\n3. Output optimum.",
        "language": "Universal",
        "slug": "ot-exp-1"
    }));
    default_experiments.push(json!({
        "subject_slug": "ot",
        "title": "Golden Section Search",
        "theory": "### Objective\nMinimize function values using golden ratio.\n\n### Theory\nGolden ratio splits optimization search intervals to guarantee convergence.\n\n### Expected Result\nOptimized range coordinates.",
        "algorithm": "1. Pick search boundaries.\n2. Split using golden ratio factor.\n3. Narrow search space based on function checks.",
        "language": "Universal",
        "slug": "ot-exp-2"
    }));
    default_experiments.push(json!({
        "subject_slug": "ot",
        "title": "Simplex Method",
        "theory": "### Objective\nOptimize linear programming problem.\n\n### Theory\nSimplex steps along extreme boundary points of a polyhedron to optimize cost functions.\n\n### Expected Result\nSimplex tableau calculations and optimal variables.",
        "algorithm": "1. Convert problem to standard form.\n2. Initialize simplex table.\n3. Perform pivot step modifications.",
        "language": "Universal",
        "slug": "ot-exp-3"
    }));
    default_experiments.push(json!({
        "subject_slug": "ot",
        "title": "Revised Simplex Method",
        "theory": "### Objective\nOptimize matrix linear equations.\n\n### Theory\nRevised simplex uses matrix inversion to speed up column checks.\n\n### Expected Result\nIterative optimal costs calculated.",
        "algorithm": "1. Form matrix bases.\n2. Check reduced cost updates.\n3. Pivot variables.",
        "language": "Universal",
        "slug": "ot-exp-4"
    }));
    default_experiments.push(json!({
        "subject_slug": "ot",
        "title": "Dual Simplex Method",
        "theory": "### Objective\nOptimize dual constraint models.\n\n### Theory\nDual simplex starts from dual-feasible table and moves towards primal feasibility.\n\n### Expected Result\nOptimal primal variables computed.",
        "algorithm": "1. Set dual basis values.\n2. Pick leaving variable first, then entering variable.\n3. Pivot table.",
        "language": "Universal",
        "slug": "ot-exp-5"
    }));
    default_experiments.push(json!({
        "subject_slug": "ot",
        "title": "Transportation Problem",
        "theory": "### Objective\nOptimize shipment cost matrix.\n\n### Theory\nTransportation model routes supply capacities to demands minimizing costs.\n\n### Expected Result\nInitial feasible allocation table and optimal routing cost.",
        "algorithm": "1. Find initial basic feasible solution.\n2. Run MODI test checking optimality.\n3. Shift loop values.",
        "language": "Universal",
        "slug": "ot-exp-6"
    }));

    // 14. Basic Electrical Engineering (bee)
    default_experiments.push(json!({
        "subject_slug": "bee",
        "title": "Kirchhoff's Current and Voltage Laws",
        "theory": "### Objective\nVerify basic network charge conservation.\n\n### Theory\nKirchhoff's Current Law (KCL) says sum of node currents is zero. Kirchhoff's Voltage Law (KVL) says loop voltage sum is zero.\n\n### Expected Result\nMeasured currents and voltages match calculations.",
        "algorithm": "1. Construct multi-loop network.\n2. Measure branch currents and loop voltages.\n3. Sum components.",
        "language": "Universal",
        "slug": "bee-exp-1"
    }));
    default_experiments.push(json!({
        "subject_slug": "bee",
        "title": "Thevenin Theorem",
        "theory": "### Objective\nCompute active linear circuit equivalent models.\n\n### Theory\nLinear network represents as voltage source Vth in series with resistance Rth.\n\n### Expected Result\nLoad current matches computed equivalent model.",
        "algorithm": "1. Remove load resistor.\n2. Measure open-circuit voltage Vth.\n3. Measure/compute equivalent resistance Rth.",
        "language": "Universal",
        "slug": "bee-exp-2"
    }));
    default_experiments.push(json!({
        "subject_slug": "bee",
        "title": "Norton Theorem",
        "theory": "### Objective\nCalculate current equivalent model.\n\n### Theory\nLinear network reduces to current source In in parallel with resistance Rn.\n\n### Expected Result\nEquivalents match Thevenin conversion results.\n\n### Procedure\n1. Short circuit output terminals.\n2. Calculate short-circuit current.",
        "algorithm": "1. Short circuit output terminals.\n2. Calculate short-circuit current In.\n3. Find Norton resistance Rn.",
        "language": "Universal",
        "slug": "bee-exp-3"
    }));
    default_experiments.push(json!({
        "subject_slug": "bee",
        "title": "Superposition Theorem",
        "theory": "### Objective\nAnalyze multi-source electrical linear network outputs.\n\n### Theory\nTotal response is sum of responses from each source acting independently.\n\n### Expected Result\nBranch current matches sum of components.",
        "algorithm": "1. Deactivate all but one source.\n2. Measure branch output value.\n3. Repeat for each source, and add responses.",
        "language": "Universal",
        "slug": "bee-exp-4"
    }));
    default_experiments.push(json!({
        "subject_slug": "bee",
        "title": "Series RLC Circuit",
        "theory": "### Objective\nCalculate series resonance behavior.\n\n### Theory\nResistor, Inductor, and Capacitor values alter phase angle and total impedance.\n\n### Expected Result\nImpedance hits minimum at resonance frequency.",
        "algorithm": "1. Measure currents across frequency spectrum.\n2. Find peak current location indicating resonance.",
        "language": "Universal",
        "slug": "bee-exp-5"
    }));
    default_experiments.push(json!({
        "subject_slug": "bee",
        "title": "Parallel RLC Circuit",
        "theory": "### Objective\nCalculate parallel resonance behavior.\n\n### Theory\nImpedance changes based on parallel RLC combination, hitting maximum at resonance frequency.\n\n### Expected Result\nImpedance and voltage reach maximum peaks at resonance.",
        "algorithm": "1. Measure branch currents.\n2. Calculate network impedance vs frequency.",
        "language": "Universal",
        "slug": "bee-exp-6"
    }));

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
        let slug_sub = ex["subject_slug"].as_str().unwrap();
        let sub_id = match get_sub_id_by_slug(slug_sub) {
            Some(uid) => uid,
            None => {
                info!("[EXPERIMENT] Skipping seeding for experiment '{}' as subject '{}' was not found", ex["title"].as_str().unwrap(), slug_sub);
                continue;
            }
        };

        let title = ex["title"].as_str().unwrap();
        let theory = ex["theory"].as_str();
        let algorithm = ex["algorithm"].as_str();
        let code_template = ex["code_template"].as_str();
        let language = ex["language"].as_str().unwrap_or("Universal");
        let slug = ex["slug"]
            .as_str()
            .map(|s| s.to_string())
            .unwrap_or_else(|| title.to_lowercase().replace(' ', "-"));

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
