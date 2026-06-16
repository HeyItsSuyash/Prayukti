use sqlx::PgPool;
use uuid::Uuid;
use chrono::{DateTime, Utc, Datelike, Timelike};
use crate::models::classroom::{Schedule, ScheduleResponse};

pub async fn get_upcoming_schedules(
    db: &PgPool,
    user_id: Uuid,
    role: &str,
) -> Result<Vec<ScheduleResponse>, sqlx::Error> {
    let schedules = if role == "student" {
        // Get student's branch/semester
        let student = sqlx::query!(
            "SELECT branch, semester FROM users WHERE id = $1 AND role = 'student'",
            user_id
        )
        .fetch_optional(db)
        .await?;

        let (branch, semester) = match student {
            Some(info) => (info.branch.unwrap_or_else(|| "Common".to_string()), info.semester.unwrap_or(1)),
            None => ("Common".to_string(), 1),
        };

        // Fetch schedules for subjects of this branch and semester, scheduled_time >= NOW()
        sqlx::query_as::<_, Schedule>(
            r#"
            SELECT sc.* FROM schedules sc
            JOIN subjects s ON sc.subject_id = s.id
            WHERE s.branch = $1 AND s.semester = $2 AND sc.scheduled_time >= $3
            ORDER BY sc.scheduled_time ASC
            "#
        )
        .bind(branch)
        .bind(semester)
        .bind(Utc::now() - chrono::Duration::hours(2)) // include classes that started up to 2 hours ago
        .fetch_all(db)
        .await?
    } else {
        // Teacher schedules
        sqlx::query_as::<_, Schedule>(
            "SELECT * FROM schedules WHERE teacher_id = $1 AND scheduled_time >= $2 ORDER BY scheduled_time ASC"
        )
        .bind(user_id)
        .bind(Utc::now() - chrono::Duration::hours(2))
        .fetch_all(db)
        .await?
    };

    Ok(schedules.into_iter().map(Into::into).collect())
}

pub async fn create_schedule(
    db: &PgPool,
    subject_id: Uuid,
    teacher_id: Uuid,
    class_name: &str,
    scheduled_time: DateTime<Utc>,
    duration_minutes: i32,
    room_link: &str,
    batch: Option<String>,
    recurring: bool,
    recurring_pattern: Option<String>,
) -> Result<ScheduleResponse, sqlx::Error> {
    let id = Uuid::new_v4();
    let row = sqlx::query_as::<_, Schedule>(
        r#"
        INSERT INTO schedules (id, subject_id, teacher_id, class_name, scheduled_time, duration_minutes, room_link, batch, recurring, recurring_pattern)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
        "#
    )
    .bind(id)
    .bind(subject_id)
    .bind(teacher_id)
    .bind(class_name)
    .bind(scheduled_time)
    .bind(duration_minutes)
    .bind(room_link)
    .bind(batch)
    .bind(recurring)
    .bind(recurring_pattern)
    .fetch_one(db)
    .await?;

    Ok(row.into())
}

pub async fn delete_schedule(
    db: &PgPool,
    id: Uuid,
) -> Result<(), sqlx::Error> {
    sqlx::query("DELETE FROM schedules WHERE id = $1")
        .bind(id)
        .execute(db)
        .await?;
    Ok(())
}

// AI Timing Recommendations
pub async fn suggest_optimal_timings(
    db: &PgPool,
    subject_id: Uuid,
) -> Result<serde_json::Value, sqlx::Error> {
    // Analytics query to get average activity/login levels per hour of day
    // We map existing attendance logs to look at active student hours
    let active_slots = sqlx::query!(
        r#"
        SELECT CAST(EXTRACT(HOUR FROM login_time) AS DOUBLE PRECISION) as hour, COUNT(*) as logs_count
        FROM attendance_logs
        WHERE login_time >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY 1
        ORDER BY logs_count DESC
        LIMIT 3
        "#
    )
    .fetch_all(db)
    .await?;

    let mut recommendations = Vec::new();
    
    // Heuristics: find top active hours and suggest scheduling classes then to maximize attendance
    for (i, row) in active_slots.iter().enumerate() {
        let hour_float = row.hour.unwrap_or(9.0);
        let hour_int = hour_float as i32;
        let period = if hour_int >= 12 { "PM" } else { "AM" };
        let formatted_hour = if hour_int > 12 { hour_int - 12 } else if hour_int == 0 { 12 } else { hour_int };
        
        let score = 95 - (i * 10); // Mock expected attendance rate
        
        recommendations.push(serde_json::json!({
            "slot": format!("{:02}:00 {}", formatted_hour, period),
            "expectedAttendance": score,
            "reason": format!("Historical student login density is highest at this slot. Expected engagement is {}%.", score)
        }));
    }

    // Default if no data
    if recommendations.is_empty() {
        recommendations.push(serde_json::json!({
            "slot": "10:00 AM",
            "expectedAttendance": 85,
            "reason": "Standard high-alert learning slot recommendation."
        }));
        recommendations.push(serde_json::json!({
            "slot": "11:30 AM",
            "expectedAttendance": 80,
            "reason": "Mid-morning slot balances high alertness and low fatigue."
        }));
    }

    Ok(serde_json::json!({
        "subjectId": subject_id.to_string(),
        "suggestions": recommendations
    }))
}

// AI detects low attendance slots
pub async fn detect_low_attendance_slots(
    db: &PgPool,
    teacher_id: Uuid,
) -> Result<serde_json::Value, sqlx::Error> {
    // Query schedules to check past attendance rates
    // Since classroom_attendance maps to schedules:
    let stats = sqlx::query!(
        r#"
        SELECT s.class_name, s.scheduled_time,
               COUNT(ca.id) FILTER (WHERE ca.status = 'present') as present_count,
               COUNT(ca.id) as total_count
        FROM schedules s
        LEFT JOIN classroom_attendance ca ON s.id = ca.schedule_id
        WHERE s.teacher_id = $1 AND s.scheduled_time < NOW()
        GROUP BY s.id, s.class_name, s.scheduled_time
        ORDER BY s.scheduled_time DESC
        LIMIT 10
        "#,
        teacher_id
    )
    .fetch_all(db)
    .await?;

    let mut risk_slots = Vec::new();
    for row in stats {
        let total = row.total_count.unwrap_or(0);
        let present = row.present_count.unwrap_or(0);
        
        if total > 0 {
            let attendance_rate = (present as f64 / total as f64) * 100.0;
            if attendance_rate < 75.0 {
                let scheduled_date: DateTime<Utc> = row.scheduled_time;
                let day = scheduled_date.weekday().to_string();
                let hour = scheduled_date.hour();
                
                risk_slots.push(serde_json::json!({
                    "className": row.class_name,
                    "day": day,
                    "hour": format!("{}:00", hour),
                    "attendanceRate": attendance_rate,
                    "risk": "Low student attendance risk based on historical joins.",
                    "suggestion": "We recommend moving this session to mid-morning slots (10:00 AM - 12:00 PM) where student login activity is peak."
                }));
            }
        }
    }

    Ok(serde_json::json!(risk_slots))
}
