use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct Experiment {
    pub id: Uuid,
    pub name: String,
    pub subject_id: Uuid,
    pub slug: String,
    pub r#type: String,
    pub difficulty: String,
    pub status: String,
    pub description: Option<String>,
    pub estimated_time: Option<String>,
    pub prerequisites: Option<Vec<String>>,
    pub thumbnail_url: Option<String>,
    pub theory: Option<String>,
    pub algorithm: Option<String>,
    pub code_template: Option<String>,
    pub language: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct ExperimentTestcase {
    pub id: Uuid,
    pub experiment_id: Uuid,
    pub input: Option<String>,
    pub output: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TestcaseResponse {
    pub input: String,
    pub output: String,
}

#[derive(Debug, Serialize)]
pub struct ExperimentResponse {
    #[serde(rename = "_id")]
    pub id: String,
    pub name: String,
    pub title: String, // alias for frontend compatibility
    pub subject: serde_json::Value, // Can be String (UUID) or SubjectResponse
    #[serde(rename = "subjectId")]
    pub subject_id: String,
    pub slug: String,
    pub r#type: String,
    pub difficulty: String,
    pub status: String,
    pub description: Option<String>,
    #[serde(rename = "estimatedTime")]
    pub estimated_time: Option<String>,
    pub prerequisites: Vec<String>,
    #[serde(rename = "thumbnailUrl")]
    pub thumbnail_url: Option<String>,
    pub theory: Option<String>,
    pub algorithm: Option<String>,
    #[serde(rename = "codeTemplate")]
    pub code_template: Option<String>,
    pub language: Option<String>,
    pub testcases: Vec<TestcaseResponse>,
}
