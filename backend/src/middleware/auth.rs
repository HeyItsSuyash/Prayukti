use axum::{
    async_trait,
    extract::{FromRequestParts, FromRef},
    http::request::Parts,
};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use tracing::{error, warn};

use crate::state::AppState;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    pub id: String,
    pub email: String,
    pub role: String,
    pub attendance_log_id: Option<String>,
    pub exp: usize,
}

pub fn generate_jwt(
    id: &str,
    email: &str,
    role: &str,
    attendance_log_id: Option<&str>,
    secret: &str,
) -> Result<String, String> {
    let expiration = chrono::Utc::now()
        .checked_add_signed(chrono::Duration::hours(24))
        .expect("valid timestamp")
        .timestamp() as usize;

    let claims = Claims {
        id: id.to_string(),
        email: email.to_string(),
        role: role.to_string(),
        attendance_log_id: attendance_log_id.map(|s| s.to_string()),
        exp: expiration,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .map_err(|e| format!("Token generation failed: {:?}", e))
}

#[async_trait]
impl<S> FromRequestParts<S> for Claims
where
    S: Send + Sync,
    AppState: axum::extract::FromRef<S>,
{
    type Rejection = (axum::http::StatusCode, axum::Json<serde_json::Value>);

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let app_state = AppState::from_ref(state);

        // 1. Try Authorization header
        let auth_header = parts
            .headers
            .get(axum::http::header::AUTHORIZATION)
            .and_then(|value| value.to_str().ok());

        let token = match auth_header {
            Some(auth_data) => {
                if auth_data.starts_with("Bearer ") {
                    auth_data.trim_start_matches("Bearer ")
                } else {
                    auth_data
                }
            }
            None => {
                warn!("Authorization header missing or invalid");
                return Err((
                    axum::http::StatusCode::UNAUTHORIZED,
                    axum::Json(serde_json::json!({ "message": "Not authorized, token missing" })),
                ));
            }
        };

        // 2. Decode & Validate Token
        match decode::<Claims>(
            token,
            &DecodingKey::from_secret(app_state.config.jwt_secret.as_bytes()),
            &Validation::default(),
        ) {
            Ok(token_data) => Ok(token_data.claims),
            Err(err) => {
                error!("JWT validation failed: {:?}", err);
                Err((
                    axum::http::StatusCode::UNAUTHORIZED,
                    axum::Json(serde_json::json!({ "message": "Not authorized, token failed validation" })),
                ))
            }
        }
    }
}

pub fn require_role(
    claims: &Claims,
    allowed_roles: &[&str],
) -> Result<(), (axum::http::StatusCode, axum::Json<serde_json::Value>)> {
    if !allowed_roles.contains(&claims.role.as_str()) {
        return Err((
            axum::http::StatusCode::FORBIDDEN,
            axum::Json(serde_json::json!({
                "message": format!("Role ({}) is not allowed to access this resource", claims.role)
            })),
        ));
    }
    Ok(())
}
