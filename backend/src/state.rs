use sqlx::PgPool;
use std::sync::Arc;
use std::collections::HashMap;
use tokio::sync::Mutex;
use uuid::Uuid;
use chrono::{DateTime, Utc};
use crate::config::Config;

#[derive(Clone)]
pub struct AppState {
    pub db: PgPool,
    pub config: Config,
    pub session_time_map: Arc<Mutex<HashMap<Uuid, DateTime<Utc>>>>,
}
