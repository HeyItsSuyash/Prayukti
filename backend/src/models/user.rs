use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct User {
    pub id: Uuid,
    pub full_name: String,
    pub roll_no: Option<String>,
    pub email: String,
    pub password: String,
    pub role: String,
    pub otp_hash: Option<String>,
    pub otp_expiry: Option<DateTime<Utc>>,
    pub otp_attempts: i32,
    pub otp_resends: i32,
    pub otp_last_resent_at: Option<DateTime<Utc>>,
    pub is_verified: bool,
    pub enrollment_no: Option<String>,
    pub branch: Option<String>,
    pub year: Option<i32>,
    pub semester: Option<i32>,
    pub created_at: Option<DateTime<Utc>>,
}

// User representation returned to the frontend (with MongoDB _id compatibility)
#[derive(Debug, Serialize)]
pub struct UserResponse {
    #[serde(rename = "_id")]
    pub id: String,
    #[serde(rename = "fullName")]
    pub full_name: String,
    #[serde(rename = "rollNo")]
    pub roll_no: Option<String>,
    pub email: String,
    pub role: String,
    #[serde(rename = "enrollmentNo")]
    pub enrollment_no: Option<String>,
    pub branch: Option<String>,
    pub year: Option<i32>,
    pub semester: Option<i32>,
}

impl From<User> for UserResponse {
    fn from(user: User) -> Self {
        Self {
            id: user.id.to_string(),
            full_name: user.full_name,
            roll_no: user.roll_no,
            email: user.email,
            role: user.role,
            enrollment_no: user.enrollment_no,
            branch: user.branch,
            year: user.year,
            semester: user.semester,
        }
    }
}
