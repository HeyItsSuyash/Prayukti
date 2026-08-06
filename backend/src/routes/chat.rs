use axum::{
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    routing::post,
    Json, Router,
};
use serde::{Deserialize, Serialize};
use serde_json::json;

use crate::state::AppState;
use crate::middleware::auth::Claims;

#[derive(Debug, Deserialize)]
pub struct ChatRequest {
    pub message: String,
    pub subject: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct ChatResponse {
    pub response: String,
}

#[derive(Debug, Serialize)]
struct GroqMessage {
    role: String,
    content: String,
}

#[derive(Debug, Serialize)]
struct GroqRequest {
    model: String,
    messages: Vec<GroqMessage>,
    temperature: f32,
    max_tokens: u32,
    top_p: f32,
    stream: bool,
}

#[derive(Debug, Deserialize)]
struct GroqResponse {
    choices: Vec<GroqChoice>,
}

#[derive(Debug, Deserialize)]
struct GroqChoice {
    message: GroqChoiceMessage,
}

#[derive(Debug, Deserialize)]
struct GroqChoiceMessage {
    content: String,
}

pub fn router() -> Router<AppState> {
    Router::new().route("/", post(chat_handler))
}

async fn chat_handler(
    State(state): State<AppState>,
    claims: Claims,
    Json(payload): Json<ChatRequest>,
) -> impl IntoResponse {
    let _ = claims; // User must be authenticated

    let groq_api_key = std::env::var("GROQ_API_KEY").unwrap_or_default();
    if groq_api_key.is_empty() {
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "error": "Groq API key not configured" })),
        )
            .into_response();
    }

    let message = payload.message.trim();
    if message.is_empty() {
        return (
            StatusCode::BAD_REQUEST,
            Json(json!({ "error": "Message must be a non-empty string" })),
        )
            .into_response();
    }
    if message.len() > 2000 {
        return (
            StatusCode::BAD_REQUEST,
            Json(json!({ "error": "Message is too long (max 2000 characters)" })),
        )
            .into_response();
    }

    let subject_context = payload.subject.unwrap_or_else(|| "General".to_string());
    let subject_context = subject_context.trim();

    let system_prompt = format!(
        "You are a helpful and knowledgeable Lab Assistant for the subject \"{}\". \
Your goal is to help students understand concepts related to {}. \

Formatting Guidelines:
- **Structure**: Organize your response into clear sections with descriptive headers if needed.
- **Highlighting**: Use **bolding** for key terms, definitions, and critical concepts.
- **Clarity**: Use bullet points or numbered lists for steps, items, or multiple points.
- **Conciseness**: Keep your answers accurate and easy to understand for engineering students.

If the question is not related to {} or engineering, politely redirect them to the subject matter. \
If the user asks about your underlying model, or asks any irrelevant question not related to learning, you MUST respond by starting your message with the exact word \"[FLAGGED]\" followed by a polite refusal.",
        subject_context, subject_context, subject_context
    );

    let groq_req = GroqRequest {
        model: "llama-3.3-70b-versatile".to_string(),
        messages: vec![
            GroqMessage {
                role: "system".to_string(),
                content: system_prompt,
            },
            GroqMessage {
                role: "user".to_string(),
                content: message.to_string(),
            },
        ],
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 1.0,
        stream: false,
    };

    let client = reqwest::Client::new();
    let res = client
        .post("https://api.groq.com/openai/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", groq_api_key))
        .json(&groq_req)
        .send()
        .await;

    match res {
        Ok(response) => {
            if !response.status().is_success() {
                let error_text = response.text().await.unwrap_or_default();
                tracing::error!("Groq API Error Response: {}", error_text);
                return (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(json!({ "error": "Failed to fetch response from AI provider" })),
                )
                    .into_response();
            }

            match response.json::<GroqResponse>().await {
                Ok(data) => {
                    let bot_response = data
                        .choices
                        .first()
                        .map(|c| c.message.content.clone())
                        .unwrap_or_else(|| "I'm having trouble processing that right now. Please try again.".to_string());
                    
                    (StatusCode::OK, Json(ChatResponse { response: bot_response.trim().to_string() })).into_response()
                }
                Err(e) => {
                    tracing::error!("Groq API parse error: {:?}", e);
                    (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        Json(json!({ "error": "Failed to parse AI response" })),
                    )
                        .into_response()
                }
            }
        }
        Err(e) => {
            tracing::error!("Chat API Error: {:?}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "error": "Failed to fetch response from AI provider", "details": e.to_string() })),
            )
                .into_response()
        }
    }
}
