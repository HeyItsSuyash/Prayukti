use sqlx::PgPool;
use uuid::Uuid;
use serde_json::json;

pub async fn solve_doubt(
    db: &PgPool,
    student_id: Uuid,
    subject_id: Uuid,
    message: &str,
) -> Result<serde_json::Value, sqlx::Error> {
    // 1. Retrieve subject syllabus/details
    let subject = sqlx::query!(
        "SELECT title, description FROM subjects WHERE id = $1",
        subject_id
    )
    .fetch_optional(db)
    .await?;

    let subject_title = subject.as_ref().map(|s| s.title.as_str()).unwrap_or("General");
    let subject_desc = subject.as_ref().and_then(|s| s.description.as_ref()).map(|s| s.as_str()).unwrap_or("");

    // 2. Retrieve top experiments for subject to build lab context
    let experiments = sqlx::query!(
        "SELECT name, description, theory FROM experiments WHERE subject_id = $1 LIMIT 3",
        subject_id
    )
    .fetch_all(db)
    .await?;

    let mut lab_context = String::new();
    for exp in experiments {
        lab_context.push_str(&format!(
            "- Experiment: {} (Theory: {})\n",
            exp.name,
            exp.theory.as_ref().map(|t| &t[..std::cmp::min(t.len(), 100)]).unwrap_or("N/A")
        ));
    }

    // 3. Search knowledge base for previous teacher answers
    let kb_items = sqlx::query!(
        "SELECT question, teacher_answer FROM knowledge_base WHERE subject_id = $1 AND status = 'approved' AND teacher_answer IS NOT NULL LIMIT 2",
        subject_id
    )
    .fetch_all(db)
    .await?;

    let mut teacher_context = String::new();
    for kb in kb_items {
        teacher_context.push_str(&format!(
            "- Q: {} -> Answer: {}\n",
            kb.question,
            kb.teacher_answer.as_ref().unwrap()
        ));
    }

    // 4. Construct AI Response
    let response_text = format!(
        "### Prayukti AI Tutor - doubts Solver\n\n**Subject Context**: {} ({})\n\n**Inferred Response**:\nBased on the syllabus and our virtual laboratory manuals, here is a breakdown of your query:\n\n- **Explanation**: The concept relates to fundamental principles of {}.\n- **Lab Relevance**: It plays a key role in the following experiments:\n  {}\n- **Instructor Guidelines**:\n  {}\n\nLet me know if you want me to generate a quick practice quiz or flashcards on this topic!",
        subject_title,
        subject_desc,
        subject_title,
        if lab_context.is_empty() { "No virtual lab experiments found.".to_string() } else { lab_context },
        if teacher_context.is_empty() { "No teacher notes found.".to_string() } else { teacher_context }
    );

    // Save AI Conversation
    let id = Uuid::new_v4();
    sqlx::query!(
        r#"
        INSERT INTO ai_conversations (id, user_id, role, subject_id, message, response)
        VALUES ($1, $2, 'student', $3, $4, $5)
        "#,
        id,
        student_id,
        subject_id,
        message,
        response_text
    )
    .execute(db)
    .await?;

    Ok(json!({
        "conversationId": id.to_string(),
        "response": response_text
    }))
}

pub async fn generate_quiz(
    db: &PgPool,
    subject_id: Uuid,
) -> Result<serde_json::Value, sqlx::Error> {
    let subject = sqlx::query!("SELECT title FROM subjects WHERE id = $1", subject_id)
        .fetch_one(db)
        .await?;

    let questions = vec![
        json!({
            "id": 1,
            "question": format!("Which of the following is a primary objective of the {} laboratory experiments?", subject.title),
            "options": [
                "Theoretical derivations only",
                "Practical implementation & parameter observation",
                "Graphical drawing on paper",
                "None of the above"
            ],
            "correctOption": 1,
            "explanation": "Virtual labs emphasize practical execution, coding, and checking simulated parameters."
        }),
        json!({
            "id": 2,
            "question": "What is the role of an algorithm before writing code templates in these modules?",
            "options": [
                "Slowing down the execution",
                "Structuring logical steps of execution",
                "Compiling dependencies",
                "Providing UI styles"
            ],
            "correctOption": 1,
            "explanation": "Algorithms outline the logic flow of compilation units beforehand."
        }),
        json!({
            "id": 3,
            "question": "Which parameter tracks student consistency in virtual experiments?",
            "options": [
                "Only exam scores",
                "Login session duration, run count and execution results",
                "Mouse movement speed",
                "The number of tabs closed"
            ],
            "correctOption": 1,
            "explanation": "Consistency is tracked via session durations, compiler run counts, and successful compilations."
        }),
        json!({
            "id": 4,
            "question": "How are execution test cases validated in Prayukti VLab?",
            "options": [
                "Manually checked by teacher",
                "Auto-tested by the backend comparison logs",
                "Skipped by default",
                "Sent to email"
            ],
            "correctOption": 1,
            "explanation": "The sandbox compiler auto-compares actual standard output with target testcases."
        }),
        json!({
            "id": 5,
            "question": "What is the primary benefit of the Living Knowledge Base?",
            "options": [
                "It replaces the syllabus entirely",
                "It enables student-teacher feedback cycles that archive reviewed Q&As",
                "It acts as a certificate store",
                "It logs compiler security warnings"
            ],
            "correctOption": 1,
            "explanation": "It helps the entire classroom by caching verified answers from course instructors."
        })
    ];

    Ok(json!({
        "subjectTitle": subject.title,
        "questions": questions
    }))
}

pub async fn generate_flashcards(
    db: &PgPool,
    subject_id: Uuid,
) -> Result<serde_json::Value, sqlx::Error> {
    let subject = sqlx::query!("SELECT title FROM subjects WHERE id = $1", subject_id)
        .fetch_one(db)
        .await?;

    let flashcards = vec![
        json!({
            "id": 1,
            "front": format!("What is the core aim of the {} syllabus?", subject.title),
            "back": "To build practical execution skills, reinforce theoretical knowledge through interactive visual lab models, and gauge execution correctness."
        }),
        json!({
            "id": 2,
            "front": "What does a low AI Tutor confidence score trigger?",
            "back": "It automatically routes the student's question to the subject teacher for review and manual answer, which then archives the question in the Knowledge Base."
        }),
        json!({
            "id": 3,
            "front": "How is student engagement scoring structured?",
            "back": "It scores classroom activity (0-100) dynamically using attendance, live joins, resource views, chatbot logs, and quiz attempts."
        }),
        json!({
            "id": 4,
            "front": "What constitutes a 'Defaulter student' in early warnings?",
            "back": "A student with less than 50% monthly attendance logs, multiple unattempted experiments, or low overall classroom activity."
        }),
        json!({
            "id": 5,
            "front": "What is the goal of AI rescheduling alerts?",
            "back": "To identify slots with high historical student fatigue or low join rates and recommend rescheduling them to prime hours."
        })
    ];

    Ok(json!({
        "subjectTitle": subject.title,
        "flashcards": flashcards
    }))
}

pub async fn generate_notes(
    db: &PgPool,
    subject_id: Uuid,
) -> Result<serde_json::Value, sqlx::Error> {
    let subject = sqlx::query!("SELECT title, description FROM subjects WHERE id = $1", subject_id)
        .fetch_one(db)
        .await?;

    let notes = format!(
        "# Study Notes: {}\n\n### Introduction to {}\n{}\n\n### Key Conceptual Pillars\n\n1. **Theoretical Foundation**\n   - Understanding the core mathematics, models, and protocols.\n   - Building logic sheets and structural diagrams.\n\n2. **Practical Lab Work**\n   - Running code templates, compiling code, and analyzing execution limits.\n   - Validating edge cases through strict test suite assertions.\n\n3. **Continuous Review**\n   - Leveraging Living Knowledge Base QA search fields to answer doubts.\n   - Completing weekly review quizzes generated by the AI Tutor.",
        subject.title,
        subject.title,
        subject.description.unwrap_or_else(|| "Syllabus notes generated automatically by AI.".to_string())
    );

    Ok(json!({
        "subjectTitle": subject.title,
        "notes": notes
    }))
}
