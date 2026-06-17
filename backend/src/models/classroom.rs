use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc, NaiveTime, NaiveDate};

// 1. Timetable Model
#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct Timetable {
    pub id: Uuid,
    pub subject_id: Uuid,
    pub teacher_id: Uuid,
    pub day_of_week: String,
    pub start_time: NaiveTime,
    pub end_time: NaiveTime,
    pub room_link: String,
    pub recurring: bool,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct TimetableResponse {
    #[serde(rename = "_id")]
    pub id: String,
    pub subject_id: String,
    pub teacher_id: String,
    pub day_of_week: String,
    pub start_time: String,
    pub end_time: String,
    pub room_link: String,
    pub recurring: bool,
}

impl From<Timetable> for TimetableResponse {
    fn from(t: Timetable) -> Self {
        Self {
            id: t.id.to_string(),
            subject_id: t.subject_id.to_string(),
            teacher_id: t.teacher_id.to_string(),
            day_of_week: t.day_of_week,
            start_time: t.start_time.format("%H:%M").to_string(),
            end_time: t.end_time.format("%H:%M").to_string(),
            room_link: t.room_link,
            recurring: t.recurring,
        }
    }
}

// 2. Schedule (Live Class) Model
#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct Schedule {
    pub id: Uuid,
    pub subject_id: Uuid,
    pub teacher_id: Uuid,
    pub class_name: String,
    pub scheduled_time: DateTime<Utc>,
    pub duration_minutes: i32,
    pub room_link: String,
    pub batch: Option<String>,
    pub recurring: bool,
    pub recurring_pattern: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ScheduleResponse {
    #[serde(rename = "_id")]
    pub id: String,
    pub subject_id: String,
    pub teacher_id: String,
    pub class_name: String,
    pub scheduled_time: DateTime<Utc>,
    pub duration_minutes: i32,
    pub room_link: String,
    pub batch: Option<String>,
    pub recurring: bool,
    pub recurring_pattern: Option<String>,
}

impl From<Schedule> for ScheduleResponse {
    fn from(s: Schedule) -> Self {
        Self {
            id: s.id.to_string(),
            subject_id: s.subject_id.to_string(),
            teacher_id: s.teacher_id.to_string(),
            class_name: s.class_name,
            scheduled_time: s.scheduled_time,
            duration_minutes: s.duration_minutes,
            room_link: s.room_link,
            batch: s.batch,
            recurring: s.recurring,
            recurring_pattern: s.recurring_pattern,
        }
    }
}

// 3. Classroom Attendance Model
#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct ClassroomAttendance {
    pub id: Uuid,
    pub student_id: Uuid,
    pub subject_id: Uuid,
    pub schedule_id: Option<Uuid>,
    pub status: String,
    pub join_time: Option<DateTime<Utc>>,
    pub leave_time: Option<DateTime<Utc>>,
    pub date: NaiveDate,
    pub is_auto: bool,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ClassroomAttendanceResponse {
    #[serde(rename = "_id")]
    pub id: String,
    pub student_id: String,
    pub subject_id: String,
    pub schedule_id: Option<String>,
    pub status: String,
    pub join_time: Option<DateTime<Utc>>,
    pub leave_time: Option<DateTime<Utc>>,
    pub date: NaiveDate,
    pub is_auto: bool,
}

impl From<ClassroomAttendance> for ClassroomAttendanceResponse {
    fn from(a: ClassroomAttendance) -> Self {
        Self {
            id: a.id.to_string(),
            student_id: a.student_id.to_string(),
            subject_id: a.subject_id.to_string(),
            schedule_id: a.schedule_id.map(|s| s.to_string()),
            status: a.status,
            join_time: a.join_time,
            leave_time: a.leave_time,
            date: a.date,
            is_auto: a.is_auto,
        }
    }
}

// 4. Announcement Model
#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct Announcement {
    pub id: Uuid,
    pub teacher_id: Uuid,
    pub subject_id: Uuid,
    pub title: String,
    pub content: String,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AnnouncementResponse {
    #[serde(rename = "_id")]
    pub id: String,
    pub teacher_id: String,
    pub teacher_name: Option<String>,
    pub subject_id: String,
    pub title: String,
    pub content: String,
    pub created_at: Option<DateTime<Utc>>,
    pub comments: Vec<CommentResponse>,
    pub reactions: Vec<String>,
    pub is_bookmarked: bool,
    pub resources: Vec<ClassroomResourceResponse>,
}

// 5. Comment Model
#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct AnnouncementComment {
    pub id: Uuid,
    pub announcement_id: Uuid,
    pub user_id: Uuid,
    pub content: String,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct CommentResponse {
    #[serde(rename = "_id")]
    pub id: String,
    pub user_id: String,
    pub user_name: String,
    pub content: String,
    pub created_at: Option<DateTime<Utc>>,
}

// 6. Reaction / Bookmark models do not need complex rows, they are simple mappings
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ReactionRequest {
    pub reaction: String,
}

// 7. Classroom Resource Model
#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct ClassroomResource {
    pub id: Uuid,
    pub subject_id: Option<Uuid>,
    pub announcement_id: Option<Uuid>,
    pub title: String,
    pub r#type: String, // 'pdf', 'notes', 'link', 'video'
    pub url: String,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ClassroomResourceResponse {
    #[serde(rename = "_id")]
    pub id: String,
    pub subject_id: Option<String>,
    pub announcement_id: Option<String>,
    pub title: String,
    pub r#type: String,
    pub url: String,
}

impl From<ClassroomResource> for ClassroomResourceResponse {
    fn from(r: ClassroomResource) -> Self {
        Self {
            id: r.id.to_string(),
            subject_id: r.subject_id.map(|s| s.to_string()),
            announcement_id: r.announcement_id.map(|s| s.to_string()),
            title: r.title,
            r#type: r.r#type,
            url: r.url,
        }
    }
}

// 8. AI Conversation Model
#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct AiConversation {
    pub id: Uuid,
    pub user_id: Uuid,
    pub role: String,
    pub subject_id: Option<Uuid>,
    pub message: String,
    pub response: String,
    pub feedback_score: Option<i32>,
    pub created_at: Option<DateTime<Utc>>,
}

// 9. Living Knowledge Base Model
#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct KnowledgeBase {
    pub id: Uuid,
    pub subject_id: Uuid,
    pub question: String,
    pub ai_answer: String,
    pub teacher_answer: Option<String>,
    pub reviewed_by: Option<Uuid>,
    pub confidence_score: f64,
    pub status: String,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct KnowledgeBaseResponse {
    #[serde(rename = "_id")]
    pub id: String,
    pub subject_id: String,
    pub question: String,
    pub ai_answer: String,
    pub teacher_answer: Option<String>,
    pub reviewed_by: Option<String>,
    pub confidence_score: f64,
    pub status: String,
    pub created_at: Option<DateTime<Utc>>,
}

impl From<KnowledgeBase> for KnowledgeBaseResponse {
    fn from(k: KnowledgeBase) -> Self {
        Self {
            id: k.id.to_string(),
            subject_id: k.subject_id.to_string(),
            question: k.question,
            ai_answer: k.ai_answer,
            teacher_answer: k.teacher_answer,
            reviewed_by: k.reviewed_by.map(|u| u.to_string()),
            confidence_score: k.confidence_score,
            status: k.status,
            created_at: k.created_at,
        }
    }
}

// 10. Participation Event Model
#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct ParticipationEvent {
    pub id: Uuid,
    pub student_id: Uuid,
    pub event_type: String,
    pub details: Option<serde_json::Value>,
    pub timestamp: Option<DateTime<Utc>>,
}

// 11. Engagement Score Model
#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct EngagementScore {
    pub id: Uuid,
    pub student_id: Uuid,
    pub subject_id: Uuid,
    pub score_type: String,
    pub score: i32,
    pub date: NaiveDate,
    pub created_at: Option<DateTime<Utc>>,
}

// 12. AI Insight Model
#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct AiInsight {
    pub id: Uuid,
    pub student_id: Uuid,
    pub insight_type: String,
    pub message: String,
    pub confidence: f64,
    pub created_at: Option<DateTime<Utc>>,
}
