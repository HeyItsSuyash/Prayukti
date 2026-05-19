use axum::{
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use regex::Regex;
use serde::{Deserialize, Serialize};
use serde_json::json;
use tracing::{error, info};
use uuid::Uuid;
use chrono::Utc;

use crate::state::AppState;
use crate::middleware::auth::Claims;

#[derive(Debug, Deserialize)]
pub struct RunCodeRequest {
    pub code: String,
    pub language: String,
    pub input: Option<String>,
    #[serde(rename = "experimentId")]
    pub experiment_id: Option<String>,
    #[serde(rename = "experimentName")]
    pub experiment_name: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct Judge0Response {
    pub stdout: Option<String>,
    pub stderr: Option<String>,
    pub compile_output: Option<String>,
    pub status: serde_json::Value,
    pub time: Option<String>,
    pub memory: Option<f64>,
}

#[derive(Debug, Deserialize)]
pub struct InputTestCase {
    pub label: String,
    pub size: String,
    pub input: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct AnalyzeComplexityRequest {
    pub code: String,
    pub language: String,
    pub inputs: Option<Vec<InputTestCase>>,
    pub sizes: Option<Vec<u32>>,
    pub case_type: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct ComplexityStep {
    pub array: Vec<i32>,
    #[serde(rename = "activeIndex")]
    pub active_index: i32,
    #[serde(rename = "outerIndex")]
    pub outer_index: i32,
}

#[derive(Debug, Serialize)]
pub struct ComplexityTestResult {
    #[serde(rename = "inputLabel")]
    pub input_label: String,
    #[serde(rename = "inputSize")]
    pub input_size: String,
    pub size: i32,
    pub time: f64,
    #[serde(rename = "execution_time")]
    pub execution_time: f64,
    pub memory: f64,
    pub comparisons: i32,
    pub shifts: i32,
    pub steps: Vec<ComplexityStep>,
    pub dataset_preview: Vec<i32>,
    pub case_type: String,
    pub status: Option<String>,
    pub stdout: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

fn get_language_id(lang: &str) -> Option<u32> {
    match lang.to_lowercase().as_str() {
        "python" => Some(71),
        "cpp" => Some(54),
        "c" => Some(50),
        "java" => Some(62),
        "javascript" | "js" => Some(63),
        _ => None,
    }
}

pub async fn run_code(
    State(state): State<AppState>,
    claims: Claims,
    Json(payload): Json<RunCodeRequest>,
) -> impl IntoResponse {
    info!("[RUN] Code execution requested by user: {}", claims.email);

    let language_id = match get_language_id(&payload.language) {
        Some(id) => id,
        None => {
            return (
                StatusCode::BAD_REQUEST,
                Json(json!({ "error": format!("Language '{}' is not supported.", payload.language) })),
            );
        }
    };

    // Track experiment run if student and experiment IDs are available
    if let (Some(exp_id_str), Some(exp_name)) = (payload.experiment_id, payload.experiment_name) {
        if let (Ok(student_id), Ok(experiment_id)) = (Uuid::parse_str(&claims.id), Uuid::parse_str(&exp_id_str)) {
            let mut time_spent_inc = 0.0;
            let now = Utc::now();

            let mut timer_map = state.session_time_map.lock().await;
            if let Some(start_time) = timer_map.get(&student_id) {
                let duration = now.signed_duration_since(*start_time);
                time_spent_inc = duration.num_milliseconds() as f64 / 60000.0;
            }
            timer_map.insert(student_id, now);
            drop(timer_map);

            // Atomic upsert into experiment_activities
            let upsert_id = Uuid::new_v4();
            let activity_res = sqlx::query(
                r#"
                INSERT INTO experiment_activities (id, student_id, experiment_id, run_count, time_spent, last_run_at, result_generated, experiment_name)
                VALUES ($1, $2, $3, 1, $4, CURRENT_TIMESTAMP, TRUE, $5)
                ON CONFLICT (student_id, experiment_id)
                DO UPDATE SET
                    run_count = experiment_activities.run_count + 1,
                    time_spent = experiment_activities.time_spent + EXCLUDED.time_spent,
                    last_run_at = EXCLUDED.last_run_at,
                    result_generated = TRUE,
                    experiment_name = EXCLUDED.experiment_name
                "#
            )
            .bind(upsert_id)
            .bind(student_id)
            .bind(experiment_id)
            .bind(time_spent_inc)
            .bind(exp_name)
            .execute(&state.db)
            .await;

            if let Err(e) = activity_res {
                error!("[RUN] Failed to track experiment run in DB: {:?}", e);
            }
        }
    }

    // Call Judge0 submissions endpoint
    let client = reqwest::Client::new();
    let judge0_url = "https://ce.judge0.com/submissions/?base64_encoded=false&wait=true";
    let stdin_str = payload.input.unwrap_or_default();

    let res = client
        .post(judge0_url)
        .json(&json!({
            "source_code": payload.code,
            "language_id": language_id,
            "stdin": stdin_str
        }))
        .send()
        .await;

    match res {
        Ok(response) => {
            if let Ok(result) = response.json::<serde_json::Value>().await {
                let stdout = result.get("stdout").and_then(|v| v.as_str()).map(String::from);
                let stderr = result.get("stderr").and_then(|v| v.as_str()).map(String::from);
                let compile_output = result.get("compile_output").and_then(|v| v.as_str()).map(String::from);
                let status = result.get("status").cloned().unwrap_or(json!({}));
                let time = result.get("time").and_then(|v| v.as_str()).map(String::from);
                let memory = result.get("memory").and_then(|v| v.as_f64());

                let response_data = Judge0Response {
                    stdout,
                    stderr,
                    compile_output,
                    status,
                    time,
                    memory,
                };
                (StatusCode::OK, Json(json!(response_data)))
            } else {
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(json!({ "error": "Invalid response format from Judge0" })),
                )
            }
        }
        Err(e) => {
            error!("[RUN] Judge0 HTTP request failed: {:?}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "error": "Judge0 execution failed", "details": e.to_string() })),
            )
        }
    }
}

pub async fn analyze_complexity(
    State(_state): State<AppState>,
    claims: Claims,
    Json(payload): Json<AnalyzeComplexityRequest>,
) -> impl IntoResponse {
    info!("[COMPLEXITY] Requested by: {}", claims.email);

    let language_id = match get_language_id(&payload.language) {
        Some(id) => id,
        None => {
            return (
                StatusCode::BAD_REQUEST,
                Json(json!({ "error": format!("Language '{}' is not supported.", payload.language) })),
            );
        }
    };

    let mut test_cases = Vec::new();
    if let Some(ref sizes) = payload.sizes {
        for &s in sizes {
            test_cases.push(InputTestCase {
                label: format!("N={}", s),
                size: s.to_string(),
                input: None,
            });
        }
    } else if let Some(inputs) = payload.inputs {
        test_cases = inputs;
    } else {
        return (
            StatusCode::BAD_REQUEST,
            Json(json!({ "error": "Either sizes or inputs are required" })),
        );
    }

    let client = reqwest::Client::new();
    let judge0_url = "https://ce.judge0.com/submissions/?base64_encoded=false&wait=true";
    let mut results = Vec::new();

    for tc in test_cases {
        let size_val: i32 = tc.size.parse().unwrap_or(0);
        let case_type = payload.case_type.clone().unwrap_or_else(|| "average".to_string()).to_lowercase();
        let final_input = if payload.case_type.is_some() {
            tc.size.clone()
        } else {
            tc.input.clone().unwrap_or_default()
        };

        let mut instrumented_code = payload.code.clone();

        // C++ injection if case_type is requested (identical to Node logic)
        if payload.case_type.is_some() {
            let is_snapshot_needed = size_val <= 20;

            // 1. Inject case_type
            if instrumented_code.contains("case_type =") {
                let re = Regex::new(r#"string\s+case_type\s*=\s*".*?"\s*;"#).unwrap();
                instrumented_code = re.replace(&instrumented_code, &format!(r#"string case_type = "{}";"#, case_type)).into_owned();
            } else {
                let re = Regex::new(r"int\s+main\s*\(\s*\)\s*\{").unwrap();
                instrumented_code = re.replace(&instrumented_code, &format!("int main() {{\n    string case_type = \"{}\";", case_type)).into_owned();
            }

            // 2. Remove redundant input reading loops
            let re1 = Regex::new(r"(?s)for\s*\(\s*int\s+i\s*=\s*0\s*;\s*i\s*<\s*n\s*;\s*i\s*\+\+\s*\)\s*\{[\s\S]*?cin\s*>>\s*arr\[i\][\s\S]*?\}").unwrap();
            instrumented_code = re1.replace_all(&instrumented_code, "").into_owned();

            let re2 = Regex::new(r"for\s*\(\s*int\s+i\s*=\s*0\s*;\s*i\s*<\s*n\s*;\s*i\s*\+\+\s*\)\s*cin\s*>>\s*arr\[i\]\s*;").unwrap();
            instrumented_code = re2.replace_all(&instrumented_code, "").into_owned();

            // 3. Dynamic snapshot injection
            let snapshot_inject = if is_snapshot_needed {
                r#"
                cout << "__step__ [";
                for(int k=0; k<n; k++) cout << arr[k] << (k==n-1?"":",");
                cout << "] " << (j+1) << " " << i << endl;
                "#
            } else {
                ""
            };

            let initial_snapshot = if is_snapshot_needed {
                r#"
                cout << "__step__ [";
                for(int k=0; k<n; k++) cout << arr[k] << (k==n-1?"":",");
                cout << "] 0 0" << endl;
                "#
            } else {
                ""
            };

            let re_func = Regex::new(r"void\s+insertionSort\s*\(([^)]+)\)\s*\{").unwrap();
            instrumented_code = re_func.replace(
                &instrumented_code,
                &format!("void insertionSort($1) {{\n    {}", initial_snapshot)
            ).into_owned();

            let re_inner = Regex::new(r"arr\[j\s*\+\s*1\]\s*=\s*key\s*;").unwrap();
            instrumented_code = re_inner.replace(
                &instrumented_code,
                &format!("arr[j + 1] = key;\n    {}", snapshot_inject)
            ).into_owned();
        }

        // Call Judge0
        let res = client
            .post(judge0_url)
            .json(&json!({
                "source_code": instrumented_code,
                "language_id": language_id,
                "stdin": final_input
            }))
            .send()
            .await;

        match res {
            Ok(response) => {
                if let Ok(result) = response.json::<serde_json::Value>().await {
                    let stdout = result.get("stdout").and_then(|v| v.as_str()).unwrap_or("").to_string();
                    let time = result.get("time").and_then(|v| v.as_str()).and_then(|t| t.parse::<f64>().ok()).unwrap_or(0.0);
                    let memory = result.get("memory").and_then(|v| v.as_f64()).unwrap_or(0.0);
                    let status = result.get("status").and_then(|v| v.get("description")).and_then(|v| v.as_str()).map(String::from);

                    // Parse metrics: comparisons and shifts
                    let mut comparisons = 0;
                    let mut shifts = 0;
                    let re_metrics = Regex::new(r"__metrics__ (\d+) (\d+)").unwrap();
                    if let Some(caps) = re_metrics.captures(&stdout) {
                        comparisons = caps[1].parse().unwrap_or(0);
                        shifts = caps[2].parse().unwrap_or(0);
                    }

                    // Parse snapshots
                    let mut steps = Vec::new();
                    let re_step = Regex::new(r"__step__ \[(.*?)\] (\d+)\s*(\d*)").unwrap();
                    for line in stdout.lines() {
                        if line.contains("__step__") {
                            if let Some(caps) = re_step.captures(line) {
                                let array: Vec<i32> = caps[1]
                                    .split(',')
                                    .filter_map(|s| s.trim().parse::<i32>().ok())
                                    .collect();
                                let active_index = caps[2].parse().unwrap_or(0);
                                let outer_index = caps.get(3).and_then(|m| m.as_str().parse::<i32>().ok()).unwrap_or(active_index);
                                
                                steps.push(ComplexityStep {
                                    array,
                                    active_index,
                                    outer_index,
                                });
                            }
                        }
                    }

                    // Clean stdout
                    let stdout_clean = re_metrics.replace_all(&stdout, "").into_owned();
                    let re_step_lines = Regex::new(r"__step__ .*\n?").unwrap();
                    let stdout_clean = re_step_lines.replace_all(&stdout_clean, "").into_owned().trim().to_string();

                    let preview = if !steps.is_empty() {
                        steps[0].array.clone()
                    } else {
                        Vec::new()
                    };

                    results.push(ComplexityTestResult {
                        input_label: tc.label,
                        input_size: tc.size,
                        size: size_val,
                        time,
                        execution_time: time,
                        memory,
                        comparisons,
                        shifts,
                        steps,
                        dataset_preview: preview,
                        case_type: case_type.clone(),
                        status,
                        stdout: stdout_clean,
                        error: None,
                    });
                } else {
                    results.push(ComplexityTestResult {
                        input_label: tc.label,
                        input_size: tc.size,
                        size: size_val,
                        time: 0.0,
                        execution_time: 0.0,
                        memory: 0.0,
                        comparisons: 0,
                        shifts: 0,
                        steps: Vec::new(),
                        dataset_preview: Vec::new(),
                        case_type: "".to_string(),
                        status: Some("Error".to_string()),
                        stdout: "".to_string(),
                        error: Some("Invalid response from Judge0".to_string()),
                    });
                }
            }
            Err(e) => {
                results.push(ComplexityTestResult {
                    input_label: tc.label,
                    input_size: tc.size,
                    size: size_val,
                    time: 0.0,
                    execution_time: 0.0,
                    memory: 0.0,
                    comparisons: 0,
                    shifts: 0,
                    steps: Vec::new(),
                    dataset_preview: Vec::new(),
                    case_type: "".to_string(),
                    status: Some("Error".to_string()),
                    stdout: "".to_string(),
                    error: Some(e.to_string()),
                });
            }
        }
    }

    // Heuristics Big O estimation
    let mut complexity_label = "O(unknown)".to_string();
    if results.len() >= 3 {
        let valid_results: Vec<&ComplexityTestResult> = results.iter().filter(|r| r.status.as_deref() == Some("Accepted")).collect();
        if valid_results.len() >= 3 {
            let mut ratios = Vec::new();
            for i in 1..valid_results.len() {
                let dt = valid_results[i].time / valid_results[i - 1].time;
                let dn = valid_results[i].size as f64 / valid_results[i - 1].size as f64;
                if dt > 0.0 && dn > 0.0 {
                    ratios.push(dt.ln() / dn.ln());
                }
            }
            if !ratios.is_empty() {
                let sum: f64 = ratios.iter().sum();
                let avg_ratio = sum / ratios.len() as f64;

                if avg_ratio < 0.5 {
                    complexity_label = "O(1) or O(log N)".to_string();
                } else if avg_ratio < 1.3 {
                    complexity_label = "O(N)".to_string();
                } else if avg_ratio < 1.8 {
                    complexity_label = "O(N log N)".to_string();
                } else if avg_ratio < 2.5 {
                    complexity_label = "O(N²)".to_string();
                } else {
                    complexity_label = "O(2^N) or O(N³)".to_string();
                }
            }
        }
    }

    // Return plain result array if payload.sizes was used (Phase 4 requirement)
    if payload.sizes.is_some() {
        (StatusCode::OK, Json(json!(results)))
    } else {
        (
            StatusCode::OK,
            Json(json!({
                "results": results,
                "estimatedComplexity": complexity_label
            })),
        )
    }
}
