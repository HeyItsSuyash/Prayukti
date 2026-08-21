use axum::{
    extract::{ConnectInfo, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use bcrypt::{hash, verify, DEFAULT_COST};
use serde::Deserialize;
use serde_json::json;
use sqlx::PgPool;
use std::net::SocketAddr;
use tracing::{error, info};
use uuid::Uuid;

use crate::models::user::{User, UserResponse};
use crate::state::AppState;
use crate::utils::generate_otp;
use crate::services::email::EmailService;
use crate::middleware::auth::generate_jwt;

#[derive(Debug, Deserialize)]
pub struct RegisterRequest {
    #[serde(rename = "fullName")]
    pub full_name: String,
    pub email: String,
    pub password: String,
    #[serde(rename = "rollNo")]
    pub roll_no: Option<String>,
    pub role: Option<String>,
    #[serde(rename = "enrollmentNo")]
    pub enrollment_no: Option<String>,
    pub branch: Option<String>,
    pub year: Option<i32>,
    pub semester: Option<i32>,
}

#[derive(Debug, Deserialize)]
pub struct VerifyOtpRequest {
    pub email: String,
    pub otp: String,
}

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Deserialize)]
pub struct ResendOtpRequest {
    pub email: String,
}

#[derive(Debug, Deserialize)]
pub struct ForgotPasswordRequest {
    pub email: String,
}

#[derive(Debug, Deserialize)]
pub struct ResetPasswordRequest {
    pub email: String,
    pub otp: String,
    pub new_password: String,
}

fn is_allowed_domain(email: &str) -> bool {
    let clean = email.to_lowercase();
    let clean = clean.trim();
    clean.ends_with("@mmmut.ac.in") || clean.ends_with("@mmut.ac.in")
}

// Helper to record login attendance session
async fn create_attendance_log(
    db: &PgPool,
    student_id: Uuid,
    student_email: &str,
    ip_address: Option<String>,
) -> Result<Uuid, String> {
    let today = chrono::Utc::now().format("%Y-%m-%d").to_string();
    let log_id = Uuid::new_v4();

    sqlx::query(
        r#"
        INSERT INTO attendance_logs (id, student_id, student_email, login_time, date, status, ip_address)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4, 'in_progress', $5)
        "#
    )
    .bind(log_id)
    .bind(student_id)
    .bind(student_email)
    .bind(today)
    .bind(ip_address)
    .execute(db)
    .await
    .map_err(|e| format!("Database error during attendance logging: {:?}", e))?;

    Ok(log_id)
}

fn validate_password(password: &str) -> Result<(), &'static str> {
    if password.len() < 8 {
        return Err("Password must be at least 8 characters long");
    }
    let has_number = password.chars().any(|c| c.is_ascii_digit());
    let has_letter = password.chars().any(|c| c.is_ascii_alphabetic());
    if !has_number || !has_letter {
        return Err("Password must contain at least one letter and one number");
    }
    Ok(())
}

pub async fn signup(
    State(state): State<AppState>,
    Json(payload): Json<RegisterRequest>,
) -> impl IntoResponse {
    let email = payload.email.trim().to_lowercase();
    info!("[AUTH] Registration attempt: {}", email);

    if let Err(msg) = validate_password(&payload.password) {
        return (
            StatusCode::BAD_REQUEST,
            Json(json!({ "message": msg })),
        );
    }

    if !is_allowed_domain(&email) {
        info!("[AUTH] Domain blocked: {}", email);
        return (
            StatusCode::BAD_REQUEST,
            Json(json!({ "message": "Only @mmmut.ac.in emails are allowed" })),
        );
    }

    // Check if user already exists
    let existing_user = sqlx::query_as::<_, User>(
        "SELECT * FROM users WHERE email = $1"
    )
    .bind(&email)
    .fetch_optional(&state.db)
    .await;

    let user_exists = match existing_user {
        Ok(Some(user)) => {
            if user.is_verified {
                info!("[AUTH] User already verified: {}", email);
                return (
                    StatusCode::BAD_REQUEST,
                    Json(json!({ "message": "User already registered" })),
                );
            }
            Some(user)
        }
        Ok(None) => None,
        Err(e) => {
            error!("[AUTH] Signup DB lookup error: {:?}", e);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "message": "Server error during registration" })),
            );
        }
    };

    let otp = generate_otp();
    let otp_expiry = chrono::Utc::now() + chrono::Duration::minutes(state.config.otp_expiry_minutes);
    
    let otp_hash = match hash(&otp, DEFAULT_COST) {
        Ok(h) => h,
        Err(e) => {
            error!("[AUTH] OTP hashing failed: {:?}", e);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "message": "Server error during registration" })),
            );
        }
    };
    
    let hashed_password = match hash(&payload.password, DEFAULT_COST) {
        Ok(h) => h,
        Err(e) => {
            error!("[AUTH] Password hashing failed: {:?}", e);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "message": "Server error during registration" })),
            );
        }
    };

    let role = payload.role.unwrap_or_else(|| "student".to_string());

    if let Some(user) = user_exists {
        // Enforce 30 second cooldown for re-registration
        if let Some(last_resent) = user.otp_last_resent_at {
            if chrono::Utc::now() < last_resent + chrono::Duration::seconds(30) {
                return (
                    StatusCode::TOO_MANY_REQUESTS,
                    Json(json!({ "message": "Please wait 30 seconds before requesting a new OTP" })),
                );
            }
        }

        info!("[AUTH] Updating unverified user: {}", email);
        let update_res = sqlx::query(
            r#"
            UPDATE users
            SET full_name = $1, roll_no = $2, password = $3, otp_hash = $4, otp_expiry = $5, role = $6, otp_attempts = 0, otp_last_resent_at = CURRENT_TIMESTAMP
            WHERE id = $7
            "#
        )
        .bind(&payload.full_name)
        .bind(&payload.roll_no)
        .bind(&hashed_password)
        .bind(&otp_hash)
        .bind(otp_expiry)
        .bind(&role)
        .bind(user.id)
        .execute(&state.db)
        .await;

        if let Err(e) = update_res {
            error!("[AUTH] User update failed: {:?}", e);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "message": "Server error during registration" })),
            );
        }
    } else {
        info!("[AUTH] Creating new user: {}", email);
        let new_id = Uuid::new_v4();
        let insert_res = sqlx::query(
            r#"
            INSERT INTO users (id, full_name, roll_no, email, password, role, otp_hash, otp_expiry, otp_attempts, is_verified, enrollment_no, branch, year, semester, otp_last_resent_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, FALSE, $9, $10, $11, $12, CURRENT_TIMESTAMP)
            "#
        )
        .bind(new_id)
        .bind(&payload.full_name)
        .bind(&payload.roll_no)
        .bind(&email)
        .bind(&hashed_password)
        .bind(&role)
        .bind(&otp_hash)
        .bind(otp_expiry)
        .bind(&payload.enrollment_no)
        .bind(&payload.branch)
        .bind(payload.year)
        .bind(payload.semester)
        .execute(&state.db)
        .await;

        if let Err(e) = insert_res {
            error!("[AUTH] User insert failed: {:?}", e);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "message": "Server error during registration" })),
            );
        }
    }

    let email_state = state.config.clone();
    let email_to = email.clone();
    tokio::spawn(async move {
        if let Err(e) = EmailService::send_otp_email(&email_to, &otp, &email_state).await {
            error!("[AUTH] Signup email delivery failed: {}", e);
        }
    });

    (
        StatusCode::CREATED,
        Json(json!({ "message": "Registration successful. Please verify your OTP." })),
    )
}

pub async fn verify_otp(
    State(state): State<AppState>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    Json(payload): Json<VerifyOtpRequest>,
) -> axum::response::Response {
    let email = payload.email.trim().to_lowercase();
    info!("[AUTH] OTP verification attempt: {}", email);

    let user_res = sqlx::query_as::<_, User>(
        "SELECT * FROM users WHERE email = $1"
    )
    .bind(&email)
    .fetch_optional(&state.db)
    .await;

    let mut user = match user_res {
        Ok(Some(u)) => u,
        Ok(None) => {
            return (
                StatusCode::NOT_FOUND,
                Json(json!({ "message": "User does not exist in database" })),
            ).into_response();
        }
        Err(e) => {
            error!("[AUTH] OTP verification DB lookup failed: {:?}", e);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "message": "Server error during verification" })),
            ).into_response();
        }
    };

    if user.is_verified {
        return (
            StatusCode::BAD_REQUEST,
            Json(json!({ "message": "User already verified" })),
        ).into_response();
    }

    if user.otp_attempts >= state.config.otp_max_attempts {
        return (
            StatusCode::FORBIDDEN,
            Json(json!({ "message": "Too many failed attempts. Please request a new OTP." })),
        ).into_response();
    }

    let is_otp_valid = match user.otp_hash {
        Some(ref hash_val) => verify(payload.otp.trim(), hash_val).unwrap_or(false),
        None => false,
    };
    
    let is_not_expired = user.otp_expiry.map(|exp| exp > chrono::Utc::now()).unwrap_or(false);

    if !is_otp_valid || !is_not_expired {
        // Increment attempt counter
        let _ = sqlx::query("UPDATE users SET otp_attempts = otp_attempts + 1 WHERE id = $1")
            .bind(user.id)
            .execute(&state.db)
            .await;
            
        return (
            StatusCode::BAD_REQUEST,
            Json(json!({ "message": "Invalid or expired OTP" })),
        ).into_response();
    }

    // Set verified, clear OTP
    let update_res = sqlx::query(
        r#"
        UPDATE users
        SET is_verified = TRUE, otp_hash = NULL, otp_expiry = NULL
        WHERE id = $1
        "#
    )
    .bind(user.id)
    .execute(&state.db)
    .await;

    if let Err(e) = update_res {
        error!("[AUTH] Verification DB update failed: {:?}", e);
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "message": "Server error during verification" })),
        ).into_response();
    }

    user.is_verified = true;

    // Log the user's login attendance session (verify_otp auto-login)
    let ip_str = Some(addr.ip().to_string());
    let attendance_log_id = match create_attendance_log(&state.db, user.id, &user.email, ip_str).await {
        Ok(id) => Some(id),
        Err(e) => {
            error!("[AUTH] Failed to log attendance during OTP login: {}", e);
            None
        }
    };

    // Generate JWT token
    let token = match generate_jwt(
        &user.id.to_string(),
        &user.email,
        &user.role,
        attendance_log_id.map(|uid| uid.to_string()).as_deref(),
        &state.config.jwt_secret,
    ) {
        Ok(t) => t,
        Err(e) => {
            error!("[AUTH] JWT issuance failed: {:?}", e);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "message": "Failed to finalize login response" })),
            ).into_response();
        }
    };

    let user_resp: UserResponse = user.into();

    use axum::http::header::{SET_COOKIE, HeaderValue};

    let is_https = state.config.student_frontend_url.starts_with("https") || state.config.teacher_frontend_url.starts_with("https");
    let cookie_val = if is_https {
        format!(
            "vlab_access_token={}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=86400",
            token
        )
    } else {
        format!(
            "vlab_access_token={}; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400",
            token
        )
    };

    let mut response = (StatusCode::OK, Json(json!({
        "message": "Account verified successfully",
        "token": token,
        "user": user_resp
    }))).into_response();

    if let Ok(hv) = HeaderValue::from_str(&cookie_val) {
        response.headers_mut().insert(SET_COOKIE, hv);
    }

    response
}

pub async fn signin(
    State(state): State<AppState>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    Json(payload): Json<LoginRequest>,
) -> axum::response::Response {
    let email = payload.email.trim().to_lowercase();
    info!("[AUTH] Login attempt: {}", email);

    // Normal DB login flow

    // Normal DB login flow
    let user_res = sqlx::query_as::<_, User>(
        "SELECT * FROM users WHERE email = $1"
    )
    .bind(&email)
    .fetch_optional(&state.db)
    .await;

    let user = match user_res {
        Ok(Some(u)) => u,
        Ok(None) => {
            return (
                StatusCode::NOT_FOUND,
                Json(json!({ "message": "User does not exist in database" })),
            ).into_response();
        }
        Err(e) => {
            error!("[AUTH] Signin DB lookup failed: {:?}", e);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "message": "Server error during login" })),
            ).into_response();
        }
    };

    let is_match = verify(&payload.password, &user.password).unwrap_or(false);
    if !is_match {
        info!("[AUTH] Password mismatch: {}", email);
        return (
            StatusCode::BAD_REQUEST,
            Json(json!({ "message": "Invalid password" })),
        ).into_response();
    }

    if !user.is_verified {
        return (
            StatusCode::FORBIDDEN,
            Json(json!({ "message": "Please verify your email first" })),
        ).into_response();
    }

    // Log the user's login attendance session
    let ip_str = Some(addr.ip().to_string());
    let attendance_log_id = match create_attendance_log(&state.db, user.id, &user.email, ip_str).await {
        Ok(id) => Some(id),
        Err(e) => {
            error!("[AUTH] Failed to log attendance during login: {}", e);
            None
        }
    };

    // Generate JWT token
    let token = match generate_jwt(
        &user.id.to_string(),
        &user.email,
        &user.role,
        attendance_log_id.map(|uid| uid.to_string()).as_deref(),
        &state.config.jwt_secret,
    ) {
        Ok(t) => t,
        Err(e) => {
            error!("[AUTH] JWT issuance failed: {:?}", e);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "message": "Failed to finalize login response" })),
            ).into_response();
        }
    };

    let user_resp: UserResponse = user.into();

    use axum::http::header::{SET_COOKIE, HeaderValue};

    let is_https = state.config.student_frontend_url.starts_with("https") || state.config.teacher_frontend_url.starts_with("https");
    let cookie_val = if is_https {
        format!(
            "vlab_access_token={}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=86400",
            token
        )
    } else {
        format!(
            "vlab_access_token={}; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400",
            token
        )
    };

    let mut response = (StatusCode::OK, Json(json!({
        "message": "Login successful",
        "token": token,
        "user": user_resp
    }))).into_response();

    if let Ok(hv) = HeaderValue::from_str(&cookie_val) {
        response.headers_mut().insert(SET_COOKIE, hv);
    }

    response
}

pub async fn resend_otp(
    State(state): State<AppState>,
    Json(payload): Json<ResendOtpRequest>,
) -> impl IntoResponse {
    let email = payload.email.trim().to_lowercase();
    info!("[AUTH] Resend OTP request: {}", email);

    let user_res = sqlx::query_as::<_, User>(
        "SELECT * FROM users WHERE email = $1"
    )
    .bind(&email)
    .fetch_optional(&state.db)
    .await;

    let user = match user_res {
        Ok(Some(u)) => u,
        Ok(None) => {
            return (
                StatusCode::NOT_FOUND,
                Json(json!({ "message": "User does not exist in database" })),
            );
        }
        Err(e) => {
            error!("[AUTH] Resend OTP DB lookup failed: {:?}", e);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "message": "Server error" })),
            );
        }
    };

    if user.is_verified {
        return (
            StatusCode::BAD_REQUEST,
            Json(json!({ "message": "User already verified" })),
        );
    }

    // Rate limiting: 30 seconds cooldown
    if let Some(last_resent) = user.otp_last_resent_at {
        if chrono::Utc::now() < last_resent + chrono::Duration::seconds(30) {
            return (
                StatusCode::TOO_MANY_REQUESTS,
                Json(json!({ "message": "Please wait 30 seconds before requesting another OTP" })),
            );
        }
    }

    // Limit to 2 resends
    if user.otp_resends >= 2 {
        return (
            StatusCode::TOO_MANY_REQUESTS,
            Json(json!({ "message": "Maximum tries limit reached, kindly try again tomorrow." })),
        );
    }

    let otp = generate_otp();
    let otp_expiry = chrono::Utc::now() + chrono::Duration::minutes(state.config.otp_expiry_minutes);
    
    let otp_hash = match hash(&otp, DEFAULT_COST) {
        Ok(h) => h,
        Err(e) => {
            error!("[AUTH] OTP hashing failed: {:?}", e);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "message": "Server error" })),
            );
        }
    };

    let update_res = sqlx::query(
        r#"
        UPDATE users
        SET otp_hash = $1, otp_expiry = $2, otp_attempts = 0, otp_resends = otp_resends + 1, otp_last_resent_at = CURRENT_TIMESTAMP
        WHERE id = $3
        "#
    )
    .bind(&otp_hash)
    .bind(otp_expiry)
    .bind(user.id)
    .execute(&state.db)
    .await;

    if let Err(e) = update_res {
        error!("[AUTH] Resend OTP DB update failed: {:?}", e);
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "message": "Server error" })),
        );
    }

    let email_state = state.config.clone();
    let email_to = email.clone();
    tokio::spawn(async move {
        if let Err(e) = EmailService::send_otp_email(&email_to, &otp, &email_state).await {
            error!("[AUTH] Resend OTP email delivery failed: {}", e);
        }
    });

    (
        StatusCode::OK,
        Json(json!({ "message": "OTP resent successfully" })),
    )
}

pub async fn logout(State(state): State<AppState>) -> impl IntoResponse {
    use axum::http::header::{SET_COOKIE, HeaderValue};
    use axum::response::Response;

    let is_https = state.config.student_frontend_url.starts_with("https") || state.config.teacher_frontend_url.starts_with("https");
    let cookie_val = if is_https {
        "vlab_access_token=; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=0"
    } else {
        "vlab_access_token=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0"
    };

    let mut response = Json(json!({
        "message": "Logged out successfully"
    })).into_response();

    if let Ok(hv) = HeaderValue::from_str(cookie_val) {
        response.headers_mut().insert(SET_COOKIE, hv);
    }

    (StatusCode::OK, response)
}

pub async fn forgot_password(
    State(state): State<AppState>,
    Json(payload): Json<ForgotPasswordRequest>,
) -> impl IntoResponse {
    let email = payload.email.trim().to_lowercase();
    info!("[AUTH] Forgot password request: {}", email);

    let user_res = sqlx::query_as::<_, User>(
        "SELECT * FROM users WHERE email = $1"
    )
    .bind(&email)
    .fetch_optional(&state.db)
    .await;

    let user = match user_res {
        Ok(Some(u)) => u,
        Ok(None) => {
            return (
                StatusCode::NOT_FOUND,
                Json(json!({ "message": "User does not exist in database" })),
            );
        }
        Err(e) => {
            error!("[AUTH] Forgot password DB lookup failed: {:?}", e);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "message": "Server error" })),
            );
        }
    };

    // Rate limiting: 30 seconds cooldown
    if let Some(last_resent) = user.otp_last_resent_at {
        if chrono::Utc::now() < last_resent + chrono::Duration::seconds(30) {
            return (
                StatusCode::TOO_MANY_REQUESTS,
                Json(json!({ "message": "Please wait 30 seconds before requesting another OTP" })),
            );
        }
    }

    let otp = generate_otp();
    let otp_expiry = chrono::Utc::now() + chrono::Duration::minutes(state.config.otp_expiry_minutes);
    
    let otp_hash = match hash(&otp, DEFAULT_COST) {
        Ok(h) => h,
        Err(e) => {
            error!("[AUTH] OTP hashing failed: {:?}", e);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "message": "Server error" })),
            );
        }
    };

    let update_res = sqlx::query(
        r#"
        UPDATE users
        SET otp_hash = $1, otp_expiry = $2, otp_attempts = 0, otp_resends = otp_resends + 1, otp_last_resent_at = CURRENT_TIMESTAMP
        WHERE id = $3
        "#
    )
    .bind(&otp_hash)
    .bind(otp_expiry)
    .bind(user.id)
    .execute(&state.db)
    .await;

    if let Err(e) = update_res {
        error!("[AUTH] Forgot password DB update failed: {:?}", e);
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "message": "Server error" })),
        );
    }

    let email_state = state.config.clone();
    let email_to = email.clone();
    tokio::spawn(async move {
        if let Err(e) = EmailService::send_password_reset_email(&email_to, &otp, &email_state).await {
            error!("[AUTH] Forgot password email delivery failed: {}", e);
        }
    });

    (
        StatusCode::OK,
        Json(json!({ "message": "If that email is registered, you will receive a reset OTP shortly." })),
    )
}

pub async fn reset_password(
    State(state): State<AppState>,
    Json(payload): Json<ResetPasswordRequest>,
) -> axum::response::Response {
    let email = payload.email.trim().to_lowercase();
    info!("[AUTH] Reset password attempt: {}", email);

    if let Err(msg) = validate_password(&payload.new_password) {
        return (
            StatusCode::BAD_REQUEST,
            Json(json!({ "message": msg })),
        ).into_response();
    }

    let user_res = sqlx::query_as::<_, User>(
        "SELECT * FROM users WHERE email = $1"
    )
    .bind(&email)
    .fetch_optional(&state.db)
    .await;

    let user = match user_res {
        Ok(Some(u)) => u,
        Ok(None) => {
            return (
                StatusCode::NOT_FOUND,
                Json(json!({ "message": "User not registered" })),
            ).into_response();
        }
        Err(e) => {
            error!("[AUTH] Reset password DB lookup failed: {:?}", e);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "message": "Server error" })),
            ).into_response();
        }
    };

    if user.otp_attempts >= state.config.otp_max_attempts {
        return (
            StatusCode::FORBIDDEN,
            Json(json!({ "message": "Too many failed attempts. Please request a new OTP." })),
        ).into_response();
    }

    let is_otp_valid = match user.otp_hash {
        Some(ref hash_val) => verify(payload.otp.trim(), hash_val).unwrap_or(false),
        None => false,
    };
    
    let is_not_expired = user.otp_expiry.map(|exp| exp > chrono::Utc::now()).unwrap_or(false);

    if !is_otp_valid || !is_not_expired {
        let _ = sqlx::query("UPDATE users SET otp_attempts = otp_attempts + 1 WHERE id = $1")
            .bind(user.id)
            .execute(&state.db)
            .await;
            
        return (
            StatusCode::BAD_REQUEST,
            Json(json!({ "message": "Invalid or expired OTP" })),
        ).into_response();
    }

    let hashed_password = match hash(&payload.new_password, DEFAULT_COST) {
        Ok(h) => h,
        Err(e) => {
            error!("[AUTH] Password hashing failed: {:?}", e);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "message": "Server error" })),
            ).into_response();
        }
    };

    let update_res = sqlx::query(
        r#"
        UPDATE users
        SET password = $1, otp_hash = NULL, otp_expiry = NULL
        WHERE id = $2
        "#
    )
    .bind(&hashed_password)
    .bind(user.id)
    .execute(&state.db)
    .await;

    if let Err(e) = update_res {
        error!("[AUTH] Password reset DB update failed: {:?}", e);
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "message": "Server error" })),
        ).into_response();
    }

    (
        StatusCode::OK,
        Json(json!({ "message": "Password reset successfully. You can now login with your new password." })),
    ).into_response()
}
