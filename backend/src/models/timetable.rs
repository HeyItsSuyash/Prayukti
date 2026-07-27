use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{DateTime, Utc, NaiveDate, NaiveTime};

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct Institution {
    pub id: Uuid,
    pub name: String,
    pub code: String,
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct Course {
    pub id: Uuid,
    pub institution_id: Uuid,
    pub name: String,
    pub code: Option<String>,
    pub duration_years: i32,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct Branch {
    pub id: Uuid,
    pub course_id: Uuid,
    pub name: String,
    pub code: String,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct AcademicYear {
    pub id: Uuid,
    pub branch_id: Uuid,
    pub year_name: String,
    pub start_date: Option<NaiveDate>,
    pub end_date: Option<NaiveDate>,
    pub is_active: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct Semester {
    pub id: Uuid,
    pub academic_year_id: Uuid,
    pub semester_number: i32,
    pub name: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct Section {
    pub id: Uuid,
    pub semester_id: Uuid,
    pub name: String,
    pub capacity: Option<i32>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct Classroom {
    pub id: Uuid,
    pub building: Option<String>,
    pub room_number: String,
    pub capacity: i32,
    pub is_lab: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct FacultyAssignment {
    pub id: Uuid,
    pub faculty_id: Uuid,
    pub subject_id: Uuid,
    pub section_id: Uuid,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct Timetable {
    pub id: Uuid,
    pub section_id: Uuid,
    pub status: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct TimetableSlot {
    pub id: Uuid,
    pub timetable_id: Uuid,
    pub faculty_assignment_id: Option<Uuid>,
    pub classroom_id: Option<Uuid>,
    pub day_of_week: Option<String>,
    pub start_time: NaiveTime,
    pub end_time: NaiveTime,
    pub is_lab_session: Option<bool>,
}

// Request Models

#[derive(Debug, Deserialize)]
pub struct CreateSectionRequest {
    pub semester_id: Uuid,
    pub name: String,
    pub capacity: Option<i32>,
}

#[derive(Debug, Deserialize)]
pub struct AssignFacultyRequest {
    pub faculty_id: Uuid,
    pub subject_id: Uuid,
    pub section_id: Uuid,
}

#[derive(Debug, Deserialize)]
pub struct CreateTimetableSlotRequest {
    pub timetable_id: Uuid,
    pub faculty_assignment_id: Uuid,
    pub classroom_id: Uuid,
    pub day_of_week: String,
    pub start_time: String, // Parsing from string to NaiveTime needed in handler
    pub end_time: String,
    pub is_lab_session: bool,
}
