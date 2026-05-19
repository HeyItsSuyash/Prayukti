use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct AttendanceLog {
    pub id: Uuid,
    pub student_id: Uuid,
    pub student_email: Option<String>,
    pub subject_id: String,
    pub subject_name: String,
    pub lab_id: Option<String>,
    pub login_time: DateTime<Utc>,
    pub logout_time: Option<DateTime<Utc>>,
    pub session_duration: Option<f64>,
    pub activity_score: i32,
    pub status: String,
    pub ip_address: Option<String>,
    pub date: String,
    pub is_suspicious: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AttendanceLogResponse {
    #[serde(rename = "_id")]
    pub id: String,
    pub student_id: String,
    pub student_email: Option<String>,
    pub subject_id: String,
    pub subject_name: String,
    pub lab_id: Option<String>,
    pub login_time: DateTime<Utc>,
    pub logout_time: Option<DateTime<Utc>>,
    pub session_duration: Option<f64>,
    pub activity_score: i32,
    pub status: String,
    pub ip_address: Option<String>,
    pub date: String,
    pub is_suspicious: bool,
}

impl From<AttendanceLog> for AttendanceLogResponse {
    fn from(log: AttendanceLog) -> Self {
        AttendanceLogResponse {
            id: log.id.to_string(),
            student_id: log.student_id.to_string(),
            student_email: log.student_email,
            subject_id: log.subject_id,
            subject_name: log.subject_name,
            lab_id: log.lab_id,
            login_time: log.login_time,
            logout_time: log.logout_time,
            session_duration: log.session_duration,
            activity_score: log.activity_score,
            status: log.status,
            ip_address: log.ip_address,
            date: log.date,
            is_suspicious: log.is_suspicious,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct SuspiciousActivity {
    pub id: Uuid,
    pub student_id: Uuid,
    pub reason: String,
    pub timestamp: DateTime<Utc>,
    pub ip_address: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct TeacherAlert {
    pub id: Uuid,
    pub student_id: Uuid,
    pub alert_type: String,
    pub message: String,
    pub created_at: DateTime<Utc>,
    pub resolved: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TeacherAlertResponse {
    #[serde(rename = "_id")]
    pub id: String,
    pub student_id: serde_json::Value, // Can be user object or ID string
    pub alert_type: String,
    pub message: String,
    pub created_at: DateTime<Utc>,
    pub resolved: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StudentRiskResponse {
    pub attendance_percentage: f64,
    pub experiment_completion_percentage: f64,
    pub average_lab_time_minutes: f64,
    pub risk_status: String,
}
