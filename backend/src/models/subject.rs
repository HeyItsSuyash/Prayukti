use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct Subject {
    pub id: Uuid,
    pub title: String,
    pub description: Option<String>,
    pub icon: Option<String>,
    pub slug: Option<String>,
    pub subject_id: Option<String>,
    pub experiments_count: i32,
    pub branch: String,
    pub semester: i32,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SubjectResponse {
    #[serde(rename = "_id")]
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub icon: Option<String>,
    pub slug: Option<String>,
    #[serde(rename = "subject_id")]
    pub subject_id: Option<String>,
    #[serde(rename = "experimentsCount")]
    pub experiments_count: i32,
    pub branch: String,
    pub semester: i32,
}

impl From<Subject> for SubjectResponse {
    fn from(s: Subject) -> Self {
        Self {
            id: s.id.to_string(),
            title: s.title,
            description: s.description,
            icon: s.icon,
            slug: s.slug,
            subject_id: s.subject_id,
            experiments_count: s.experiments_count,
            branch: s.branch,
            semester: s.semester,
        }
    }
}
