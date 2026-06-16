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
use crate::services::email::send_email;
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

fn is_allowed_domain(email: &str) -> bool {
    let clean = email.to_lowercase();
    let clean = clean.trim();
    clean.ends_with("@mmmut.ac.in")
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

pub async fn signup(
    State(state): State<AppState>,
    Json(payload): Json<RegisterRequest>,
) -> impl IntoResponse {
    let email = payload.email.trim().to_lowercase();
    info!("[AUTH] Registration attempt: {}", email);

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
    info!("TEST OTP: {}", otp);
    let otp_path = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .unwrap()
        .join("otp_test.txt");
    let _ = std::fs::write(otp_path, &otp);
    let otp_expiry = chrono::Utc::now() + chrono::Duration::minutes(10);
    
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
        info!("[AUTH] Updating unverified user: {}", email);
        let update_res = sqlx::query(
            r#"
            UPDATE users
            SET full_name = $1, roll_no = $2, password = $3, otp = $4, otp_expiry = $5, role = $6
            WHERE id = $7
            "#
        )
        .bind(&payload.full_name)
        .bind(&payload.roll_no)
        .bind(&hashed_password)
        .bind(&otp)
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
            INSERT INTO users (id, full_name, roll_no, email, password, role, otp, otp_expiry, is_verified, enrollment_no, branch, year, semester)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, FALSE, $9, $10, $11, $12)
            "#
        )
        .bind(new_id)
        .bind(&payload.full_name)
        .bind(&payload.roll_no)
        .bind(&email)
        .bind(&hashed_password)
        .bind(&role)
        .bind(&otp)
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

    // Send verification email
    let email_html = format!(
        "<h3>Welcome to Prayukti vLAB!</h3><p>Your OTP is: <strong>{}</strong></p><p>It will expire in 10 minutes.</p>",
        otp
    );
    let email_state = state.config.clone();
    let email_to = email.clone();
    tokio::spawn(async move {
        if let Err(e) = send_email(&email_to, "Your OTP for Prayukti vLAB", &email_html, &email_state).await {
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
) -> impl IntoResponse {
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
                Json(json!({ "message": "User not registered" })),
            );
        }
        Err(e) => {
            error!("[AUTH] OTP verification DB lookup failed: {:?}", e);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "message": "Server error during verification" })),
            );
        }
    };

    if user.is_verified {
        return (
            StatusCode::BAD_REQUEST,
            Json(json!({ "message": "User already verified" })),
        );
    }

    let is_otp_valid = user.otp.as_deref() == Some(&payload.otp);
    let is_not_expired = user.otp_expiry.map(|exp| exp > chrono::Utc::now()).unwrap_or(false);

    if !is_otp_valid || !is_not_expired {
        return (
            StatusCode::BAD_REQUEST,
            Json(json!({ "message": "Invalid or expired OTP" })),
        );
    }

    // Set verified, clear OTP
    let update_res = sqlx::query(
        r#"
        UPDATE users
        SET is_verified = TRUE, otp = NULL, otp_expiry = NULL
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
        );
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
            );
        }
    };

    let user_resp: UserResponse = user.into();

    (
        StatusCode::OK,
        Json(json!({
            "message": "Account verified successfully",
            "token": token,
            "user": user_resp
        })),
    )
}

pub async fn signin(
    State(state): State<AppState>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    Json(payload): Json<LoginRequest>,
) -> impl IntoResponse {
    let email = payload.email.trim().to_lowercase();
    info!("[AUTH] Login attempt: {}", email);

    // Mock Auth Bypass
    if state.config.mock_auth {
        if is_allowed_domain(&email) {
            info!("[AUTH] MOCK LOGIN SUCCESS for: {}", email);
            let mock_id = format!("mock_user_id_{}", chrono::Utc::now().timestamp());
            let mock_role = if email.contains("admin") {
                "admin"
            } else if email.contains("teacher") {
                "teacher"
            } else {
                "student"
            };

            let mock_log_id = format!("mock_log_{}", chrono::Utc::now().timestamp());

            let token = match generate_jwt(
                &mock_id,
                &email,
                mock_role,
                Some(&mock_log_id),
                &state.config.jwt_secret,
            ) {
                Ok(t) => t,
                Err(e) => {
                    error!("[AUTH] Mock JWT issuance failed: {:?}", e);
                    return (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        Json(json!({ "message": "Failed to finalize login response" })),
                    );
                }
            };

            return (
                StatusCode::OK,
                Json(json!({
                    "message": "Login successful",
                    "token": token,
                    "user": {
                        "id": mock_id,
                        "fullName": format!("Mock User ({})", mock_role),
                        "rollNo": "MOCK12345",
                        "email": email,
                        "role": mock_role
                    }
                })),
            );
        } else {
            return (
                StatusCode::UNAUTHORIZED,
                Json(json!({ "message": "Mock Auth: Only @mmmut.ac.in emails allowed for bypass" })),
            );
        }
    }

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
                Json(json!({ "message": "User not registered" })),
            );
        }
        Err(e) => {
            error!("[AUTH] Signin DB lookup failed: {:?}", e);
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "message": "Server error during login" })),
            );
        }
    };

    let is_match = verify(&payload.password, &user.password).unwrap_or(false);
    if !is_match {
        info!("[AUTH] Password mismatch: {}", email);
        return (
            StatusCode::BAD_REQUEST,
            Json(json!({ "message": "Invalid password" })),
        );
    }

    if !user.is_verified {
        return (
            StatusCode::FORBIDDEN,
            Json(json!({ "message": "Please verify your email first" })),
        );
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
            );
        }
    };

    let user_resp: UserResponse = user.into();

    (
        StatusCode::OK,
        Json(json!({
            "message": "Login successful",
            "token": token,
            "user": user_resp
        })),
    )
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
                Json(json!({ "message": "User not registered" })),
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

    let otp = generate_otp();
    let otp_expiry = chrono::Utc::now() + chrono::Duration::minutes(10);

    let update_res = sqlx::query(
        r#"
        UPDATE users
        SET otp = $1, otp_expiry = $2
        WHERE id = $3
        "#
    )
    .bind(&otp)
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

    // Send verification email
    let email_html = format!(
        "<h3>New OTP is: <strong>{}</strong></h3><p>It will expire in 10 minutes.</p>",
        otp
    );
    let email_state = state.config.clone();
    let email_to = email.clone();
    tokio::spawn(async move {
        if let Err(e) = send_email(&email_to, "New OTP for Prayukti vLAB", &email_html, &email_state).await {
            error!("[AUTH] Resend OTP email delivery failed: {}", e);
        }
    });

    (
        StatusCode::OK,
        Json(json!({ "message": "OTP resent successfully" })),
    )
}
