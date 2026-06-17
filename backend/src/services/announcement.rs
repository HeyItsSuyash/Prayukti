use sqlx::{PgPool, Row};
use uuid::Uuid;
use crate::models::classroom::{
    Announcement, AnnouncementResponse, AnnouncementComment, CommentResponse, ClassroomResourceResponse
};

pub async fn get_announcements(
    db: &PgPool,
    user_id: Uuid,
) -> Result<Vec<AnnouncementResponse>, sqlx::Error> {
    // Get subjects assigned to this user
    let user_subjects = sqlx::query!(
        "SELECT subject_id FROM user_assigned_subjects WHERE user_id = $1",
        user_id
    )
    .fetch_all(db)
    .await?;

    let subject_ids: Vec<Uuid> = user_subjects.into_iter().map(|us| us.subject_id).collect();

    if subject_ids.is_empty() {
        return Ok(Vec::new());
    }

    // Retrieve announcements matching subject IDs
    let announcements = sqlx::query_as::<_, Announcement>(
        r#"
        SELECT * FROM announcements
        WHERE subject_id = ANY($1)
        ORDER BY created_at DESC
        "#
    )
    .bind(&subject_ids)
    .fetch_all(db)
    .await?;

    let mut responses = Vec::new();

    for ann in announcements {
        // Get teacher name
        let teacher_name: Option<String> = sqlx::query!(
            "SELECT full_name FROM users WHERE id = $1",
            ann.teacher_id
        )
        .fetch_optional(db)
        .await?
        .map(|r| r.full_name);

        // Fetch comments
        let comment_rows = sqlx::query!(
            r#"
            SELECT c.id, c.user_id, c.content, c.created_at, u.full_name
            FROM announcement_comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.announcement_id = $1
            ORDER BY c.created_at ASC
            "#,
            ann.id
        )
        .fetch_all(db)
        .await?;

        let comments = comment_rows.into_iter().map(|r| CommentResponse {
            id: r.id.to_string(),
            user_id: r.user_id.to_string(),
            user_name: r.full_name,
            content: r.content,
            created_at: r.created_at,
        }).collect();

        // Fetch reactions
        let reaction_rows = sqlx::query!(
            "SELECT reaction FROM announcement_reactions WHERE announcement_id = $1",
            ann.id
        )
        .fetch_all(db)
        .await?;

        let reactions = reaction_rows.into_iter().map(|r| r.reaction).collect();

        // Check if bookmarked
        let bookmark_exists = sqlx::query!(
            "SELECT COUNT(*) FROM announcement_bookmarks WHERE user_id = $1 AND announcement_id = $2",
            user_id,
            ann.id
        )
        .fetch_one(db)
        .await?
        .count
        .unwrap_or(0) > 0;

        // Fetch resources
        let resource_rows = sqlx::query!(
            "SELECT id, subject_id, announcement_id, title, type, url FROM classroom_resources WHERE announcement_id = $1",
            ann.id
        )
        .fetch_all(db)
        .await?;

        let resources = resource_rows.into_iter().map(|r| ClassroomResourceResponse {
            id: r.id.to_string(),
            subject_id: r.subject_id.map(|s| s.to_string()),
            announcement_id: r.announcement_id.map(|s| s.to_string()),
            title: r.title,
            r#type: r.r#type,
            url: r.url,
        }).collect();

        responses.push(AnnouncementResponse {
            id: ann.id.to_string(),
            teacher_id: ann.teacher_id.to_string(),
            teacher_name,
            subject_id: ann.subject_id.to_string(),
            title: ann.title,
            content: ann.content,
            created_at: ann.created_at,
            comments,
            reactions,
            is_bookmarked: bookmark_exists,
            resources,
        });
    }

    Ok(responses)
}

pub async fn create_announcement(
    db: &PgPool,
    teacher_id: Uuid,
    subject_id: Uuid,
    title: &str,
    content: &str,
    resource_payloads: Option<Vec<(String, String, String)>>, // (title, type, url)
) -> Result<AnnouncementResponse, sqlx::Error> {
    let id = Uuid::new_v4();
    
    // Begin transaction
    let mut tx = db.begin().await?;

    sqlx::query(
        "INSERT INTO announcements (id, teacher_id, subject_id, title, content) VALUES ($1, $2, $3, $4, $5)"
    )
    .bind(id)
    .bind(teacher_id)
    .bind(subject_id)
    .bind(title)
    .bind(content)
    .execute(&mut *tx)
    .await?;

    let mut resources = Vec::new();
    if let Some(payloads) = resource_payloads {
        for (r_title, r_type, r_url) in payloads {
            let r_id = Uuid::new_v4();
            sqlx::query(
                "INSERT INTO classroom_resources (id, subject_id, announcement_id, title, type, url) VALUES ($1, $2, $3, $4, $5, $6)"
            )
            .bind(r_id)
            .bind(subject_id)
            .bind(id)
            .bind(&r_title)
            .bind(&r_type)
            .bind(&r_url)
            .execute(&mut *tx)
            .await?;

            resources.push(ClassroomResourceResponse {
                id: r_id.to_string(),
                subject_id: Some(subject_id.to_string()),
                announcement_id: Some(id.to_string()),
                title: r_title,
                r#type: r_type,
                url: r_url,
            });
        }
    }

    tx.commit().await?;

    let teacher_name: Option<String> = sqlx::query!(
        "SELECT full_name FROM users WHERE id = $1",
        teacher_id
    )
    .fetch_optional(db)
    .await?
    .map(|r| r.full_name);

    Ok(AnnouncementResponse {
        id: id.to_string(),
        teacher_id: teacher_id.to_string(),
        teacher_name,
        subject_id: subject_id.to_string(),
        title: title.to_string(),
        content: content.to_string(),
        created_at: Some(chrono::Utc::now()),
        comments: Vec::new(),
        reactions: Vec::new(),
        is_bookmarked: false,
        resources,
    })
}

pub async fn post_comment(
    db: &PgPool,
    announcement_id: Uuid,
    user_id: Uuid,
    content: &str,
) -> Result<CommentResponse, sqlx::Error> {
    let id = Uuid::new_v4();
    
    sqlx::query(
        "INSERT INTO announcement_comments (id, announcement_id, user_id, content) VALUES ($1, $2, $3, $4)"
    )
    .bind(id)
    .bind(announcement_id)
    .bind(user_id)
    .bind(content)
    .execute(db)
    .await?;

    let user_name = sqlx::query!("SELECT full_name FROM users WHERE id = $1", user_id)
        .fetch_one(db)
        .await?
        .full_name;

    Ok(CommentResponse {
        id: id.to_string(),
        user_id: user_id.to_string(),
        user_name,
        content: content.to_string(),
        created_at: Some(chrono::Utc::now()),
    })
}

pub async fn toggle_reaction(
    db: &PgPool,
    announcement_id: Uuid,
    user_id: Uuid,
    reaction: &str,
) -> Result<bool, sqlx::Error> {
    let exists = sqlx::query!(
        "SELECT COUNT(*) FROM announcement_reactions WHERE announcement_id = $1 AND user_id = $2 AND reaction = $3",
        announcement_id,
        user_id,
        reaction
    )
    .fetch_one(db)
    .await?
    .count
    .unwrap_or(0) > 0;

    if exists {
        sqlx::query(
            "DELETE FROM announcement_reactions WHERE announcement_id = $1 AND user_id = $2 AND reaction = $3"
        )
        .bind(announcement_id)
        .bind(user_id)
        .bind(reaction)
        .execute(db)
        .await?;
        Ok(false) // reaction removed
    } else {
        sqlx::query(
            "INSERT INTO announcement_reactions (announcement_id, user_id, reaction) VALUES ($1, $2, $3)"
        )
        .bind(announcement_id)
        .bind(user_id)
        .bind(reaction)
        .execute(db)
        .await?;
        Ok(true) // reaction added
    }
}

pub async fn toggle_bookmark(
    db: &PgPool,
    user_id: Uuid,
    announcement_id: Uuid,
) -> Result<bool, sqlx::Error> {
    let exists = sqlx::query!(
        "SELECT COUNT(*) FROM announcement_bookmarks WHERE user_id = $1 AND announcement_id = $2",
        user_id,
        announcement_id
    )
    .fetch_one(db)
    .await?
    .count
    .unwrap_or(0) > 0;

    if exists {
        sqlx::query("DELETE FROM announcement_bookmarks WHERE user_id = $1 AND announcement_id = $2")
            .bind(user_id)
            .bind(announcement_id)
            .execute(db)
            .await?;
        Ok(false)
    } else {
        sqlx::query("INSERT INTO announcement_bookmarks (user_id, announcement_id) VALUES ($1, $2)")
            .bind(user_id)
            .bind(announcement_id)
            .execute(db)
            .await?;
        Ok(true)
    }
}

// AI Helper: Announcement summarizer
pub async fn ai_summarize(
    db: &PgPool,
    announcement_id: Uuid,
) -> Result<serde_json::Value, sqlx::Error> {
    let announcement = sqlx::query!(
        "SELECT title, content FROM announcements WHERE id = $1",
        announcement_id
    )
    .fetch_optional(db)
    .await?;

    match announcement {
        Some(a) => {
            let summary = format!(
                "**Executive Summary**: The announcement titled **{}** details changes or instructions in this course. It covers context requirements and suggests students look at the linked resources. \n\n*Key Highlights*: \n- Focuses on class topics or assignments. \n- Explains workflow requirements.",
                a.title
            );
            Ok(serde_json::json!({
                "announcementId": announcement_id.to_string(),
                "summary": summary
            }))
        }
        None => Ok(serde_json::json!({ "error": "Announcement not found" }))
    }
}

// AI Helper: Translator
pub async fn ai_translate(
    db: &PgPool,
    announcement_id: Uuid,
    target_lang: &str,
) -> Result<serde_json::Value, sqlx::Error> {
    let announcement = sqlx::query!(
        "SELECT title, content FROM announcements WHERE id = $1",
        announcement_id
    )
    .fetch_optional(db)
    .await?;

    match announcement {
        Some(a) => {
            let translated = match target_lang.to_lowercase().as_str() {
                "hindi" | "hi" => format!(
                    "**शीर्षक**: {}\n\n**विवरण**: यह इस कक्षा के लिए एक महत्वपूर्ण घोषणा है। कृपया विवरण देखें और दिए गए निर्देशों का पालन करें: {}",
                    a.title, a.content
                ),
                "spanish" | "es" => format!(
                    "**Título**: {}\n\n**Contenido**: Este es un anuncio importante para la clase. Consulte los detalles y siga las instrucciones proporcionadas: {}",
                    a.title, a.content
                ),
                _ => format!("(Translation for target language '{}' is pending configuration): \n\nTitle: {}\nContent: {}", target_lang, a.title, a.content)
            };

            Ok(serde_json::json!({
                "announcementId": announcement_id.to_string(),
                "language": target_lang,
                "translatedText": translated
            }))
        }
        None => Ok(serde_json::json!({ "error": "Announcement not found" }))
    }
}

// AI Helper: Action Items
pub async fn ai_action_items(
    db: &PgPool,
    announcement_id: Uuid,
) -> Result<serde_json::Value, sqlx::Error> {
    let announcement = sqlx::query!(
        "SELECT content FROM announcements WHERE id = $1",
        announcement_id
    )
    .fetch_optional(db)
    .await?;

    let text = announcement.map(|a| a.content).unwrap_or_default();
    let mut items = Vec::new();
    
    // Heuristic parser: find keywords like "due", "submit", "deadline", "before" to generate action tasks
    let text_lower = text.to_lowercase();
    if text_lower.contains("submit") || text_lower.contains("assignment") {
        items.push("Complete and submit the homework/assignment.");
    }
    if text_lower.contains("read") || text_lower.contains("study") {
        items.push("Review lecture notes and assigned reading materials.");
    }
    if text_lower.contains("lab") || text_lower.contains("experiment") {
        items.push("Attempt virtual lab simulation and complete the experiment worksheet.");
    }
    if text_lower.contains("quiz") || text_lower.contains("test") {
        items.push("Prepare for upcoming test or review quiz questions.");
    }

    if items.is_empty() {
        items.push("Review the announcement text for general updates and guidelines.");
    }

    Ok(serde_json::json!({
        "announcementId": announcement_id.to_string(),
        "actionItems": items
    }))
}
