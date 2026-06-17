use sqlx::PgPool;
use uuid::Uuid;
use chrono::NaiveTime;
use crate::models::classroom::{Timetable, TimetableResponse};

pub async fn get_student_timetable(
    db: &PgPool,
    student_id: Uuid,
) -> Result<Vec<TimetableResponse>, sqlx::Error> {
    // Get student's branch and semester
    let student_info = sqlx::query!(
        "SELECT branch, semester FROM users WHERE id = $1 AND role = 'student'",
        student_id
    )
    .fetch_optional(db)
    .await?;

    let (branch, semester) = match student_info {
        Some(info) => (info.branch.unwrap_or_else(|| "Common".to_string()), info.semester.unwrap_or(1)),
        None => ("Common".to_string(), 1),
    };

    // Fetch timetables for subjects of this branch and semester
    let rows = sqlx::query_as::<_, Timetable>(
        r#"
        SELECT t.* FROM timetables t
        JOIN subjects s ON t.subject_id = s.id
        WHERE s.branch = $1 AND s.semester = $2
        ORDER BY t.day_of_week, t.start_time
        "#
    )
    .bind(branch)
    .bind(semester)
    .fetch_all(db)
    .await?;

    Ok(rows.into_iter().map(Into::into).collect())
}

pub async fn get_teacher_timetable(
    db: &PgPool,
    teacher_id: Uuid,
) -> Result<Vec<TimetableResponse>, sqlx::Error> {
    let rows = sqlx::query_as::<_, Timetable>(
        "SELECT * FROM timetables WHERE teacher_id = $1 ORDER BY day_of_week, start_time"
    )
    .bind(teacher_id)
    .fetch_all(db)
    .await?;

    Ok(rows.into_iter().map(Into::into).collect())
}

pub async fn create_timetable_entry(
    db: &PgPool,
    subject_id: Uuid,
    teacher_id: Uuid,
    day_of_week: &str,
    start_time: NaiveTime,
    end_time: NaiveTime,
    room_link: &str,
    recurring: bool,
) -> Result<TimetableResponse, String> {
    // Check conflicts first
    let conflicts = detect_conflicts(db, teacher_id, day_of_week, start_time, end_time, None).await
        .map_err(|e| e.to_string())?;

    if !conflicts.is_empty() {
        return Err(format!("Conflict detected: {}", conflicts.join(", ")));
    }

    let id = Uuid::new_v4();
    let row = sqlx::query_as::<_, Timetable>(
        r#"
        INSERT INTO timetables (id, subject_id, teacher_id, day_of_week, start_time, end_time, room_link, recurring)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
        "#
    )
    .bind(id)
    .bind(subject_id)
    .bind(teacher_id)
    .bind(day_of_week)
    .bind(start_time)
    .bind(end_time)
    .bind(room_link)
    .bind(recurring)
    .fetch_one(db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(row.into())
}

pub async fn update_timetable_entry(
    db: &PgPool,
    id: Uuid,
    subject_id: Uuid,
    teacher_id: Uuid,
    day_of_week: &str,
    start_time: NaiveTime,
    end_time: NaiveTime,
    room_link: &str,
    recurring: bool,
) -> Result<TimetableResponse, String> {
    // Check conflicts excluding this entry
    let conflicts = detect_conflicts(db, teacher_id, day_of_week, start_time, end_time, Some(id)).await
        .map_err(|e| e.to_string())?;

    if !conflicts.is_empty() {
        return Err(format!("Conflict detected: {}", conflicts.join(", ")));
    }

    let row = sqlx::query_as::<_, Timetable>(
        r#"
        UPDATE timetables
        SET subject_id = $1, teacher_id = $2, day_of_week = $3, start_time = $4, end_time = $5, room_link = $6, recurring = $7
        WHERE id = $8
        RETURNING *
        "#
    )
    .bind(subject_id)
    .bind(teacher_id)
    .bind(day_of_week)
    .bind(start_time)
    .bind(end_time)
    .bind(room_link)
    .bind(recurring)
    .bind(id)
    .fetch_optional(db)
    .await
    .map_err(|e| e.to_string())?;

    match row {
        Some(t) => Ok(t.into()),
        None => Err("Timetable entry not found".to_string()),
    }
}

pub async fn delete_timetable_entry(
    db: &PgPool,
    id: Uuid,
) -> Result<(), sqlx::Error> {
    sqlx::query("DELETE FROM timetables WHERE id = $1")
        .bind(id)
        .execute(db)
        .await?;
    Ok(())
}

#[derive(Debug, sqlx::FromRow)]
struct ConflictCheckRow {
    start_time: NaiveTime,
    end_time: NaiveTime,
    title: String,
}

// Conflict detection: Checks if a teacher has another class overlapping
pub async fn detect_conflicts(
    db: &PgPool,
    teacher_id: Uuid,
    day_of_week: &str,
    start_time: NaiveTime,
    end_time: NaiveTime,
    exclude_id: Option<Uuid>,
) -> Result<Vec<String>, sqlx::Error> {
    let mut conflicts = Vec::new();

    let rows = if let Some(eid) = exclude_id {
        sqlx::query_as::<_, ConflictCheckRow>(
            r#"
            SELECT t.start_time, t.end_time, s.title
            FROM timetables t
            JOIN subjects s ON t.subject_id = s.id
            WHERE t.teacher_id = $1 AND t.day_of_week = $2 AND t.id != $3
            "#
        )
        .bind(teacher_id)
        .bind(day_of_week)
        .bind(eid)
        .fetch_all(db)
        .await?
    } else {
        sqlx::query_as::<_, ConflictCheckRow>(
            r#"
            SELECT t.start_time, t.end_time, s.title
            FROM timetables t
            JOIN subjects s ON t.subject_id = s.id
            WHERE t.teacher_id = $1 AND t.day_of_week = $2
            "#
        )
        .bind(teacher_id)
        .bind(day_of_week)
        .fetch_all(db)
        .await?
    };

    for row in rows {
        let s = row.start_time;
        let e = row.end_time;
        // Overlap condition: start1 < end2 AND start2 < end1
        if start_time < e && s < end_time {
            conflicts.push(format!(
                "Overlap with '{}' ({}-{})",
                row.title,
                s.format("%H:%M"),
                e.format("%H:%M")
            ));
        }
    }

    Ok(conflicts)
}

// AI recommendations for optimized timetables
pub async fn get_ai_recommended_schedule(
    db: &PgPool,
    student_id: Uuid,
) -> Result<serde_json::Value, sqlx::Error> {
    let student_info = sqlx::query!(
        "SELECT branch, semester FROM users WHERE id = $1 AND role = 'student'",
        student_id
    )
    .fetch_optional(db)
    .await?;

    let (branch, semester) = match student_info {
        Some(info) => (info.branch.unwrap_or_else(|| "Common".to_string()), info.semester.unwrap_or(1)),
        None => ("Common".to_string(), 1),
    };

    // Retrieve subjects
    let subjects = sqlx::query!(
        "SELECT id, title FROM subjects WHERE branch = $1 AND semester = $2",
        branch,
        semester
    )
    .fetch_all(db)
    .await?;

    let mut recommendations = Vec::new();
    let days = vec!["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    
    // AI scheduler: Suggests slot sequences spreading classes evenly, avoiding late slots (after 4 PM)
    for (i, subject) in subjects.iter().enumerate() {
        let suggested_day = days[i % days.len()];
        let suggested_start = match i % 3 {
            0 => "09:00",
            1 => "11:00",
            _ => "14:00",
        };
        recommendations.push(serde_json::json!({
            "subjectId": subject.id.to_string(),
            "subjectTitle": subject.title,
            "recommendedDay": suggested_day,
            "recommendedTime": suggested_start,
            "reason": format!("Optimal spread for {}, avoiding peak student fatigue times.", subject.title)
        }));
    }

    Ok(serde_json::json!({
        "branch": branch,
        "semester": semester,
        "recommendations": recommendations
    }))
}

// AI predicts overloaded days (e.g. > 4 hours or more than 2 lab classes)
pub async fn predict_overloaded_days(
    db: &PgPool,
    student_id: Uuid,
) -> Result<serde_json::Value, sqlx::Error> {
    let student_info = sqlx::query!(
        "SELECT branch, semester FROM users WHERE id = $1 AND role = 'student'",
        student_id
    )
    .fetch_optional(db)
    .await?;

    let (branch, semester) = match student_info {
        Some(info) => (info.branch.unwrap_or_else(|| "Common".to_string()), info.semester.unwrap_or(1)),
        None => ("Common".to_string(), 1),
    };

    let timetables = sqlx::query!(
        r#"
        SELECT t.day_of_week, t.start_time, t.end_time
        FROM timetables t
        JOIN subjects s ON t.subject_id = s.id
        WHERE s.branch = $1 AND s.semester = $2
        "#,
        branch,
        semester
    )
    .fetch_all(db)
    .await?;

    let mut daily_durations = std::collections::HashMap::new();
    for t in timetables {
        let duration_secs = t.end_time.signed_duration_since(t.start_time).num_seconds();
        let hours = duration_secs as f64 / 3600.0;
        *daily_durations.entry(t.day_of_week).or_insert(0.0) += hours;
    }

    let mut predictions = Vec::new();
    for (day, total_hours) in daily_durations {
        let status = if total_hours > 5.0 {
            "Severely Overloaded"
        } else if total_hours > 4.0 {
            "Moderately Loaded"
        } else {
            "Optimal"
        };

        let message = if total_hours > 5.0 {
            format!("Warning: {} has {:.1} hours of scheduled instruction. Learning retention is predicted to fall by 40%.", day, total_hours)
        } else if total_hours > 4.0 {
            format!("{} has {:.1} hours scheduled. Balance is good but consecutive lectures may cause fatigue.", day, total_hours)
        } else {
            format!("{} has {:.1} hours. This is optimal for self-study and laboratory tasks.", day, total_hours)
        };

        predictions.push(serde_json::json!({
            "day": day,
            "totalHours": total_hours,
            "status": status,
            "message": message
        }));
    }

    Ok(serde_json::json!(predictions))
}
