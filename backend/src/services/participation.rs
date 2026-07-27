use sqlx::PgPool;
use uuid::Uuid;
use chrono::{Utc, NaiveDate, Duration};
use serde_json::json;

pub async fn log_participation_event(
    db: &PgPool,
    student_id: Uuid,
    event_type: &str,
    details: serde_json::Value,
) -> Result<(), sqlx::Error> {
    let id = Uuid::new_v4();
    sqlx::query(
        "INSERT INTO participation_events (id, student_id, event_type, details) VALUES ($1, $2, $3, $4)"
    )
    .bind(id)
    .bind(student_id)
    .bind(event_type)
    .bind(&details)
    .execute(db)
    .await?;

    // Asynchronously trigger engagement updates for this student (we run it directly here for simplicity)
    if let Some(sub_id_str) = details.get("subject_id").and_then(|v| v.as_str()) {
        if let Ok(subject_id) = Uuid::parse_str(sub_id_str) {
            let db_clone = db.clone();
            tokio::spawn(async move {
                let _ = recalculate_student_scores(&db_clone, student_id, subject_id).await;
            });
        }
    }
    
    Ok(())
}

pub async fn get_engagement_scores(
    db: &PgPool,
    student_id: Uuid,
    subject_id: Uuid,
) -> Result<serde_json::Value, sqlx::Error> {
    let rows = sqlx::query!(
        "SELECT score_type, score, date FROM engagement_scores WHERE student_id = $1 AND subject_id = $2 ORDER BY date DESC LIMIT 30",
        student_id,
        subject_id
    )
    .fetch_all(db)
    .await?;

    let mut daily = Vec::new();
    let mut weekly = Vec::new();
    let mut monthly = Vec::new();

    for r in rows {
        let entry = json!({
            "score": r.score,
            "date": r.date
        });
        match r.score_type.as_str() {
            "daily" => daily.push(entry),
            "weekly" => weekly.push(entry),
            _ => monthly.push(entry),
        }
    }

    Ok(json!({
        "studentId": student_id.to_string(),
        "subjectId": subject_id.to_string(),
        "daily": daily,
        "weekly": weekly,
        "monthly": monthly
    }))
}

async fn recalculate_student_scores(
    db: &PgPool,
    student_id: Uuid,
    subject_id: Uuid,
) -> Result<(), sqlx::Error> {
    let today = Utc::now().date_naive();
    
    // 1. Calculate Daily Score (past 24 hours)
    let daily_events_count: i64 = sqlx::query!(
        "SELECT COUNT(*) FROM participation_events WHERE student_id = $1 AND timestamp >= NOW() - INTERVAL '1 day'",
        student_id
    )
    .fetch_one(db)
    .await?
    .count
    .unwrap_or(0);

    // Score: 10 points per event, cap at 100
    let daily_score = std::cmp::min(daily_events_count * 15 + 20, 100) as i32;

    // Save Daily Score
    save_engagement_score(db, student_id, subject_id, "daily", daily_score, today).await?;

    // 2. Calculate Weekly Score (past 7 days)
    let weekly_events_count: i64 = sqlx::query!(
        "SELECT COUNT(*) FROM participation_events WHERE student_id = $1 AND timestamp >= NOW() - INTERVAL '7 days'",
        student_id
    )
    .fetch_one(db)
    .await?
    .count
    .unwrap_or(0);

    let weekly_score = std::cmp::min(weekly_events_count * 5 + 30, 100) as i32;
    save_engagement_score(db, student_id, subject_id, "weekly", weekly_score, today).await?;

    // 3. Calculate Monthly Score (past 30 days)
    let monthly_events_count: i64 = sqlx::query!(
        "SELECT COUNT(*) FROM participation_events WHERE student_id = $1 AND timestamp >= NOW() - INTERVAL '30 days'",
        student_id
    )
    .fetch_one(db)
    .await?
    .count
    .unwrap_or(0);

    let monthly_score = std::cmp::min(monthly_events_count * 2 + 40, 100) as i32;
    save_engagement_score(db, student_id, subject_id, "monthly", monthly_score, today).await?;

    // 4. Update AI Insights for this student
    update_ai_insights(db, student_id, daily_score, weekly_score, monthly_score).await?;

    Ok(())
}

async fn save_engagement_score(
    db: &PgPool,
    student_id: Uuid,
    subject_id: Uuid,
    score_type: &str,
    score: i32,
    date: NaiveDate,
) -> Result<(), sqlx::Error> {
    sqlx::query(
        r#"
        INSERT INTO engagement_scores (id, student_id, subject_id, score_type, score, date)
        VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5)
        ON CONFLICT (student_id, subject_id, score_type, date)
        DO UPDATE SET score = EXCLUDED.score
        "#
    )
    .bind(student_id)
    .bind(subject_id)
    .bind(score_type)
    .bind(score)
    .bind(date)
    .execute(db)
    .await?;
    Ok(())
}

async fn update_ai_insights(
    db: &PgPool,
    student_id: Uuid,
    daily_score: i32,
    weekly_score: i32,
    monthly_score: i32,
) -> Result<(), sqlx::Error> {
    // Delete past insights for student to keep active ones fresh
    sqlx::query("DELETE FROM ai_insights WHERE student_id = $1").bind(student_id).execute(db).await?;

    // Insight A: Disengaged
    if weekly_score < 45 {
        let msg = format!("Learning alert: Student shows disengaged behavior with a weekly engagement score of {}%. Activity count is low.", weekly_score);
        sqlx::query(
            "INSERT INTO ai_insights (id, student_id, insight_type, message, confidence) VALUES (uuid_generate_v4(), $1, 'disengaged', $2, 0.90)"
        )
        .bind(student_id)
        .bind(msg)
        .execute(db)
        .await?;
    }

    // Insight B: High Performer
    if monthly_score > 85 && daily_score > 70 {
        let msg = format!("Performance commendation: High-performing student profile detected. Engagement index is exceptional ({}%).", monthly_score);
        sqlx::query(
            "INSERT INTO ai_insights (id, student_id, insight_type, message, confidence) VALUES (uuid_generate_v4(), $1, 'high_performer', $2, 0.95)"
        )
        .bind(student_id)
        .bind(msg)
        .execute(db)
        .await?;
    }

    // Insight C: Learning trend
    let trend_msg = if daily_score > weekly_score + 10 {
        "Positive acceleration: Engagement shows an upward trend today. Learning momentum is growing."
    } else if daily_score < weekly_score - 15 {
        "Negative deceleration: Sudden dip in today's engagement. Student may be facing roadblocks."
    } else {
        "Steady state: Stable and consistent interaction profile."
    };

    sqlx::query(
        "INSERT INTO ai_insights (id, student_id, insight_type, message, confidence) VALUES (uuid_generate_v4(), $1, 'learning_trend', $2, 0.80)"
    )
    .bind(student_id)
    .bind(trend_msg)
    .execute(db)
    .await?;

    Ok(())
}

pub async fn get_ai_insights_for_teacher(
    db: &PgPool,
    teacher_id: Uuid,
) -> Result<serde_json::Value, sqlx::Error> {
    let rows = sqlx::query!(
        r#"
        SELECT ai.insight_type, ai.message, ai.confidence, u.full_name, u.roll_no
        FROM ai_insights ai
        JOIN users u ON ai.student_id = u.id
        ORDER BY ai.created_at DESC
        LIMIT 20
        "#
    )
    .fetch_all(db)
    .await?;

    let mut disengaged = Vec::new();
    let mut high_performers = Vec::new();
    let mut trends = Vec::new();

    for r in rows {
        let item = json!({
            "studentName": r.full_name,
            "rollNumber": r.roll_no.unwrap_or_default(),
            "message": r.message,
            "confidence": r.confidence
        });

        match r.insight_type.as_str() {
            "disengaged" | "at_risk" => disengaged.push(item),
            "high_performer" => high_performers.push(item),
            _ => trends.push(item),
        }
    }

    Ok(json!({
        "teacherId": teacher_id.to_string(),
        "disengaged": disengaged,
        "highPerformers": high_performers,
        "trends": trends
    }))
}
