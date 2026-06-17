use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

// 1. Video Lesson Model
#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct VideoLesson {
    pub id: Uuid,
    pub student_id: Uuid,
    pub topic: String,
    pub mode: String,
    pub avatar: String,
    pub voice: String,
    pub language: String,
    pub duration_seconds: i32,
    pub status: String,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct VideoLessonResponse {
    #[serde(rename = "_id")]
    pub id: String,
    pub student_id: String,
    pub topic: String,
    pub mode: String,
    pub avatar: String,
    pub voice: String,
    pub language: String,
    pub duration_seconds: i32,
    pub status: String,
    pub created_at: Option<DateTime<Utc>>,
    pub is_saved: bool,
    pub completion_rate: f64,
}

impl From<VideoLesson> for VideoLessonResponse {
    fn from(l: VideoLesson) -> Self {
        Self {
            id: l.id.to_string(),
            student_id: l.student_id.to_string(),
            topic: l.topic,
            mode: l.mode,
            avatar: l.avatar,
            voice: l.voice,
            language: l.language,
            duration_seconds: l.duration_seconds,
            status: l.status,
            created_at: l.created_at,
            is_saved: false,
            completion_rate: 0.0,
        }
    }
}

// 2. Lesson Script Model
#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct LessonScript {
    pub id: Uuid,
    pub lesson_id: Uuid,
    pub section_name: String,
    pub narration_text: String,
    pub avatar_animation: String,
    pub sequence_order: i32,
}

// 3. Lesson Slide Model
#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct LessonSlide {
    pub id: Uuid,
    pub lesson_id: Uuid,
    pub title: String,
    pub bullet_points: Vec<String>,
    pub duration_seconds: i32,
    pub sequence_order: i32,
}

// 4. Lesson Diagram Model
#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct LessonDiagram {
    pub id: Uuid,
    pub lesson_id: Uuid,
    pub diagram_type: String,
    pub mermaid_code: String,
    pub sequence_order: i32,
}

// 5. Lesson Animation Model
#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct LessonAnimation {
    pub id: Uuid,
    pub lesson_id: Uuid,
    pub animation_type: String,
    pub config_json: serde_json::Value,
    pub sequence_order: i32,
}

// 6. Lesson Quiz Model
#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
#[serde(rename_all = "camelCase")]
pub struct LessonQuiz {
    pub id: Uuid,
    pub lesson_id: Uuid,
    pub question: String,
    pub options: Vec<String>,
    pub correct_option: i32,
    pub explanation: String,
}

// 7. Learning Profile Model
#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct LearningProfile {
    pub id: Uuid,
    pub student_id: Uuid,
    pub weak_topics: Vec<String>,
    pub strong_topics: Vec<String>,
    pub learning_speed: String,
    pub last_updated: Option<DateTime<Utc>>,
}

// 8. Student Progress Model
#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
#[serde(rename_all = "camelCase")]
pub struct StudentProgress {
    pub id: Uuid,
    pub student_id: Uuid,
    pub lesson_id: Uuid,
    pub completion_rate: f64,
    pub quiz_score: Option<i32>,
    pub watch_time_seconds: i32,
    pub last_watched: Option<DateTime<Utc>>,
}

// 9. Video Watch History Model
#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct VideoWatchHistory {
    pub id: Uuid,
    pub student_id: Uuid,
    pub lesson_id: Uuid,
    pub watched_at: Option<DateTime<Utc>>,
}

// 10. Saved Lesson Model
#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct SavedLesson {
    pub student_id: Uuid,
    pub lesson_id: Uuid,
    pub saved_at: Option<DateTime<Utc>>,
}

// 11. AI Interaction Model
#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct AiInteraction {
    pub id: Uuid,
    pub student_id: Uuid,
    pub lesson_id: Option<Uuid>,
    pub query: String,
    pub response: String,
    pub interaction_type: String,
    pub created_at: Option<DateTime<Utc>>,
}

// Full Lesson Response Payload
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct CompleteLessonPayload {
    pub lesson: VideoLessonResponse,
    pub scripts: Vec<LessonScript>,
    pub slides: Vec<LessonSlide>,
    pub diagrams: Vec<LessonDiagram>,
    pub animations: Vec<LessonAnimation>,
    pub quizzes: Vec<LessonQuiz>,
    pub progress: Option<StudentProgress>,
}
