use axum::{
    http::StatusCode,
    middleware::Next,
    response::Response,
};
use std::sync::Arc;
use tokio::sync::Mutex;
use std::collections::HashMap;
use std::time::{Instant, Duration};

const RATE_LIMIT: usize = 100; // Requests per minute
const RATE_LIMIT_WINDOW: u64 = 60; // Seconds

const SENSITIVE_RATE_LIMIT: usize = 5; // 5 requests per minute
const SENSITIVE_RATE_LIMIT_WINDOW: u64 = 60; // Seconds

type RateLimitState = Arc<Mutex<HashMap<String, (usize, Instant)>>>;

use axum::extract::State;

pub async fn rate_limiter(
    State(state): State<RateLimitState>,
    request: axum::extract::Request,
    next: Next,
) -> Result<Response, StatusCode> {
    let ip = request
        .headers()
        .get("x-forwarded-for")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("unknown")
        .to_string();

    let mut map = state.lock().await;
    let now = Instant::now();
    let window = Duration::from_secs(RATE_LIMIT_WINDOW);

    let (count, last_reset) = map.entry(ip.clone()).or_insert((0, now));

    if now.duration_since(*last_reset) > window {
        *count = 0;
        *last_reset = now;
    }

    *count += 1;

    if *count > RATE_LIMIT {
        return Err(StatusCode::TOO_MANY_REQUESTS);
    }

    drop(map); // Drop lock before next.run()

    Ok(next.run(request).await)
}

pub async fn sensitive_rate_limiter(
    State(state): State<RateLimitState>,
    request: axum::extract::Request,
    next: Next,
) -> Result<Response, StatusCode> {
    let ip = request
        .headers()
        .get("x-forwarded-for")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("unknown")
        .to_string();

    let mut map = state.lock().await;
    let now = Instant::now();
    let window = Duration::from_secs(SENSITIVE_RATE_LIMIT_WINDOW);

    let (count, last_reset) = map.entry(ip.clone()).or_insert((0, now));

    if now.duration_since(*last_reset) > window {
        *count = 0;
        *last_reset = now;
    }

    *count += 1;

    if *count > SENSITIVE_RATE_LIMIT {
        return Err(StatusCode::TOO_MANY_REQUESTS);
    }

    drop(map); // Drop lock before next.run()

    Ok(next.run(request).await)
}

pub async fn security_headers(
    request: axum::extract::Request,
    next: Next,
) -> Response {
    let mut response = next.run(request).await;
    
    let headers = response.headers_mut();
    headers.insert(
        "Strict-Transport-Security",
        "max-age=63072000; includeSubDomains; preload".parse().unwrap(),
    );
    headers.insert(
        "X-Content-Type-Options",
        "nosniff".parse().unwrap(),
    );
    headers.insert(
        "X-Frame-Options",
        "DENY".parse().unwrap(),
    );
    headers.insert(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https: wss:; font-src 'self' data: https:".parse().unwrap(),
    );
    headers.insert(
        "X-XSS-Protection",
        "1; mode=block".parse().unwrap(),
    );

    response
}
