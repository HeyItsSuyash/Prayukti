use axum::{routing::{get, post, put, patch}, Json, Router};
use sqlx::postgres::PgPoolOptions;
use std::net::SocketAddr;
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;
use tracing::info;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod config;
mod state;
mod services;
mod models;
mod utils;
mod middleware;
mod routes;
mod domains;

use crate::config::Config;
use crate::state::AppState;

#[tokio::main]
async fn main() {
    // Initialize tracing
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "backend_rust=debug,tower_http=info".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    info!("Starting Prayukti-vLAB Rust Backend...");

    // Load configuration
    let config = Config::from_env();
    println!("DATABASE_URL = {}", config.database_url);

    // Setup database connection pool
    info!("Connecting to PostgreSQL pool...");
    let pool = PgPoolOptions::new()
        .max_connections(50) // High-concurrency limit
        .acquire_timeout(std::time::Duration::from_secs(120))
        .connect(&config.database_url)
        .await
        .expect("Failed to connect to PostgreSQL database");

    info!("Running OTP security migration...");
    sqlx::query("ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_hash VARCHAR;").execute(&pool).await.expect("Migration failed (otp_hash)");
    sqlx::query("ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_attempts INT DEFAULT 0 NOT NULL;").execute(&pool).await.expect("Migration failed (otp_attempts)");
    sqlx::query("ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_resends INT DEFAULT 0 NOT NULL;").execute(&pool).await.expect("Migration failed (otp_resends)");
    sqlx::query("ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_last_resent_at TIMESTAMP WITH TIME ZONE;").execute(&pool).await.expect("Migration failed (otp_last_resent_at)");
    sqlx::query("ALTER TABLE users DROP COLUMN IF EXISTS otp;").execute(&pool).await.expect("Migration failed (drop otp)");
    info!("OTP security migration complete.");

    info!("Skipping seed scripts because database is already seeded...");

    let state = AppState {
        db: pool,
        config: config.clone(),
        session_time_map: std::sync::Arc::new(tokio::sync::Mutex::new(std::collections::HashMap::new())),
    };

    let auth_router = Router::new()
        .route("/register", post(routes::auth::signup))
        .route("/signup", post(routes::auth::signup))
        .route("/verify-otp", post(routes::auth::verify_otp))
        .route("/login", post(routes::auth::signin))
        .route("/signin", post(routes::auth::signin))
        .route("/resend-otp", post(routes::auth::resend_otp))
        .route("/logout", post(routes::auth::logout))
        .route("/forgot-password", post(routes::auth::forgot_password))
        .route("/reset-password", post(routes::auth::reset_password));

    let subject_router = Router::new()
        .route("/", get(routes::subject::get_subjects).post(routes::subject::create_subject))
        .route("/create", post(routes::subject::create_subject))
        .route("/seed", post(routes::subject::seed_subjects))
        .route("/:id", put(routes::subject::update_subject).delete(routes::subject::delete_subject));

    let experiment_router = Router::new()
        .route("/", get(routes::experiment::get_experiments).post(routes::experiment::create_experiment))
        .route("/create", post(routes::experiment::create_experiment))
        .route("/seed", post(routes::experiment::seed_experiments))
        .route("/subject/:subject_id", get(routes::experiment::get_experiments_by_subject))
        .route("/:id", get(routes::experiment::get_experiment_by_id).put(routes::experiment::update_experiment).delete(routes::experiment::delete_experiment));

    let code_router = Router::new()
        .route("/run", post(routes::code::run_code))
        .route("/complexity", post(routes::code::analyze_complexity));

    let attendance_router = Router::new()
        .route("/logout", post(routes::attendance::logout_attendance))
        .route("/analytics", get(routes::attendance::get_analytics))
        .route("/report", get(routes::attendance::get_report))
        .route("/alerts", get(routes::attendance::get_alerts))
        .route("/alerts/:id/resolve", patch(routes::attendance::resolve_alert))
        .route("/student/:student_id", get(routes::attendance::get_student_data))
        .route("/log-lab", post(routes::attendance::log_lab));

    // Build routes
    let rate_limit_state = std::sync::Arc::new(tokio::sync::Mutex::new(std::collections::HashMap::new()));
    let sensitive_rate_limit_state = rate_limit_state.clone();

    // Configure CORS
    let cors = CorsLayer::new()
        .allow_origin(vec![
            config.frontend_url.parse::<axum::http::HeaderValue>().unwrap_or_else(|_| "https://mmmut.prayukti.org".parse().unwrap()),
            "http://localhost:3000".parse::<axum::http::HeaderValue>().unwrap(),
            "http://localhost:3001".parse::<axum::http::HeaderValue>().unwrap(),
        ])
        .allow_credentials(true)
        .allow_headers([
            axum::http::header::AUTHORIZATION,
            axum::http::header::ACCEPT,
            axum::http::header::CONTENT_TYPE,
        ])
        .allow_methods([
            axum::http::Method::GET,
            axum::http::Method::POST,
            axum::http::Method::PUT,
            axum::http::Method::PATCH,
            axum::http::Method::DELETE,
            axum::http::Method::OPTIONS,
        ]);

    let app = Router::new()
        .route("/", get(health_check))
        .nest("/api/auth", auth_router.layer(axum::middleware::from_fn_with_state(sensitive_rate_limit_state.clone(), middleware::security::sensitive_rate_limiter)))
        .nest("/api/subjects", subject_router)
        .nest("/api/experiments", experiment_router)
        .nest("/api/code", code_router)
        .nest("/api/attendance", attendance_router)
        .nest("/api/users", routes::users::router().layer(axum::middleware::from_fn_with_state(sensitive_rate_limit_state.clone(), middleware::security::sensitive_rate_limiter)))
        .nest("/api/settings", routes::settings::router())
        .nest("/api/logs", routes::logs::router())
        .nest("/api/resources", routes::resources::router())
        .nest("/api/v2/institutions", domains::institutions::routes::router())
        .nest("/api/classroom", routes::classroom::router())
        .nest("/api/timetable", routes::timetable::router())
        .nest("/api/schedule", routes::schedule::router())
        .nest("/api/announcement", routes::announcement::router())
        .nest("/api/participation", routes::participation::router())
        .nest("/api/knowledge-base", routes::knowledge_base::router())
        .nest("/api/ai-tutor", routes::ai_tutor::router())
        .nest("/api/ai-teacher", routes::ai_teacher::router())
        .nest("/api/classroom-analytics", routes::analytics::router())
        .nest("/api/video-tutor", routes::video_tutor::router())
        .nest("/api/academic-hierarchy", routes::academic_hierarchy::router())
        .nest("/api/public-metrics", routes::public_metrics::router())
        .nest("/api/chat", routes::chat::router())
        .layer(axum::middleware::from_fn_with_state(rate_limit_state, middleware::security::rate_limiter))
        .layer(axum::middleware::from_fn(middleware::security::security_headers))
        .layer(cors)
        .layer(TraceLayer::new_for_http())
        .with_state(state);

    let addr = SocketAddr::from(([0, 0, 0, 0], config.port));
    info!("Server listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app.into_make_service_with_connect_info::<SocketAddr>()).await.unwrap();
}

async fn health_check() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "message": "Prayukti-vLAB Authentication API is running (Rust/Axum)"
    }))
}
