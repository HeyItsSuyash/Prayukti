use std::env;

#[derive(Clone, Debug)]
pub struct Config {
    pub database_url: String,
    pub jwt_secret: String,
    pub port: u16,
    pub email_host: String,
    pub email_port: u16,
    pub email_user: String,
    pub email_pass: String,
    pub mock_auth: bool,
}

impl Config {
    pub fn from_env() -> Self {
        dotenvy::dotenv().ok();
        
        // Automatically check BACKEND_ prefix
        for (key, val) in env::vars() {
            if key.starts_with("BACKEND_") {
                let stripped_key = key.trim_start_matches("BACKEND_");
                env::set_var(stripped_key, val);
            }
        }
        
        let database_url = env::var("DATABASE_URL")
            .expect("DATABASE_URL must be set");
        let jwt_secret = env::var("JWT_SECRET")
            .unwrap_or_else(|_| "fallback_secret_key_1234567890".to_string());
        let port = env::var("PORT")
            .unwrap_or_else(|_| "5000".to_string())
            .parse::<u16>()
            .expect("PORT must be a valid port number");
        let email_host = env::var("EMAIL_HOST").unwrap_or_else(|_| "smtp.gmail.com".to_string());
        let email_port = env::var("EMAIL_PORT")
            .unwrap_or_else(|_| "587".to_string())
            .parse::<u16>()
            .unwrap_or(587);
        let email_user = env::var("EMAIL_USER").unwrap_or_default();
        let email_pass = env::var("EMAIL_PASS").unwrap_or_default();
        let mock_auth = env::var("MOCK_AUTH")
            .unwrap_or_else(|_| "false".to_string())
            .parse::<bool>()
            .unwrap_or(false);

        Self {
            database_url,
            jwt_secret,
            port,
            email_host,
            email_port,
            email_user,
            email_pass,
            mock_auth,
        }
    }
}
