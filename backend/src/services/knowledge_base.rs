use sqlx::PgPool;
use uuid::Uuid;
use crate::models::classroom::{KnowledgeBase, KnowledgeBaseResponse};

pub async fn get_knowledge_base_approved(
    db: &PgPool,
    subject_id: Uuid,
) -> Result<Vec<KnowledgeBaseResponse>, sqlx::Error> {
    let rows = sqlx::query_as::<_, KnowledgeBase>(
        "SELECT * FROM knowledge_base WHERE subject_id = $1 AND status = 'approved' ORDER BY updated_at DESC"
    )
    .bind(subject_id)
    .fetch_all(db)
    .await?;

    Ok(rows.into_iter().map(Into::into).collect())
}

pub async fn get_knowledge_base_pending(
    db: &PgPool,
    subject_id: Uuid,
) -> Result<Vec<KnowledgeBaseResponse>, sqlx::Error> {
    let rows = sqlx::query_as::<_, KnowledgeBase>(
        "SELECT * FROM knowledge_base WHERE subject_id = $1 AND status = 'pending_review' ORDER BY created_at ASC"
    )
    .bind(subject_id)
    .fetch_all(db)
    .await?;

    Ok(rows.into_iter().map(Into::into).collect())
}

pub async fn submit_student_question(
    db: &PgPool,
    subject_id: Uuid,
    question: &str,
) -> Result<KnowledgeBaseResponse, sqlx::Error> {
    // 1. Check if similar approved question already exists in DB
    let similar = sqlx::query_as::<_, KnowledgeBase>(
        r#"
        SELECT * FROM knowledge_base 
        WHERE subject_id = $1 AND status = 'approved' AND (question ILIKE $2 OR question ILIKE $3)
        LIMIT 1
        "#
    )
    .bind(subject_id)
    .bind(format!("%{}%", question))
    .bind(question)
    .fetch_optional(db)
    .await?;

    if let Some(kb) = similar {
        // Return existing approved Q&A immediately
        return Ok(kb.into());
    }

    // 2. Generate Simulated AI response & confidence score
    // Heuristic: compute question complexity. If it contains words like 'why', 'explain in detail', or is very long, AI confidence is low.
    let question_len = question.len();
    let contains_complex_keyword = question.contains("why") || question.contains("explain") || question.contains("how does") || question.contains("compare");
    
    let confidence_score = if contains_complex_keyword {
        0.65 // low confidence -> forces teacher review
    } else if question_len < 15 {
        0.50 // too short/ambiguous -> teacher review
    } else {
        0.85 // standard question -> AI answers and auto-approves
    };

    let ai_answer = if confidence_score >= 0.75 {
        format!(
            "**Prayukti AI Tutor**: Based on the syllabus for this course, the answer to **'{}'** relates directly to your laboratory concepts. Here is a brief explanation: \n\n1. This concept enables key virtual experiment workflows. \n2. Make sure to check the lab manual for code implementation details.",
            question
        )
    } else {
        "**AI Assistant**: I have parsed the query but my confidence is low. I am routing this question to your subject instructor for review. You will receive an notification when they answer!".to_string()
    };

    let status = if confidence_score >= 0.75 {
        "approved"
    } else {
        "pending_review"
    };

    let id = Uuid::new_v4();
    let row = sqlx::query_as::<_, KnowledgeBase>(
        r#"
        INSERT INTO knowledge_base (id, subject_id, question, ai_answer, confidence_score, status)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
        "#
    )
    .bind(id)
    .bind(subject_id)
    .bind(question)
    .bind(&ai_answer)
    .bind(confidence_score)
    .bind(status)
    .fetch_one(db)
    .await?;

    Ok(row.into())
}

pub async fn submit_teacher_review(
    db: &PgPool,
    id: Uuid,
    teacher_id: Uuid,
    teacher_answer: &str,
) -> Result<KnowledgeBaseResponse, String> {
    let row = sqlx::query_as::<_, KnowledgeBase>(
        r#"
        UPDATE knowledge_base
        SET teacher_answer = $1, reviewed_by = $2, status = 'approved', confidence_score = 1.0, updated_at = NOW()
        WHERE id = $3
        RETURNING *
        "#,
    )
    .bind(teacher_answer)
    .bind(teacher_id)
    .bind(id)
    .fetch_optional(db)
    .await
    .map_err(|e| e.to_string())?;

    match row {
        Some(kb) => Ok(kb.into()),
        None => Err("Question not found in Knowledge Base".to_string()),
    }
}
