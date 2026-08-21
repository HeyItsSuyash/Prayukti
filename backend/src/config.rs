use std::env;

#[derive(Clone, Debug)]
pub struct Config {
    pub database_url: String,
    pub jwt_secret: String,
    pub port: u16,
    pub brevo_api_key: String,
    pub email_from_name: String,
    pub email_from_address: String,
    pub otp_expiry_minutes: i64,
    pub otp_length: usize,
    pub otp_max_attempts: i32,
    pub frontend_url: String,
    pub student_frontend_url: String,
    pub teacher_frontend_url: String,
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
            
        let brevo_api_key = env::var("BREVO_API_KEY").unwrap_or_default();
        let email_from_name = env::var("EMAIL_FROM_NAME").unwrap_or_else(|_| "Prayukti vLAB".to_string());
        let email_from_address = env::var("EMAIL_FROM_ADDRESS").unwrap_or_else(|_| "noreply@prayukti.org".to_string());
        
        let otp_expiry_minutes = env::var("OTP_EXPIRY_MINUTES").unwrap_or_else(|_| "5".to_string()).parse::<i64>().unwrap_or(5);
        let otp_length = env::var("OTP_LENGTH").unwrap_or_else(|_| "6".to_string()).parse::<usize>().unwrap_or(6);
        let otp_max_attempts = env::var("OTP_MAX_ATTEMPTS").unwrap_or_else(|_| "5".to_string()).parse::<i32>().unwrap_or(5);
        
        let frontend_url = env::var("FRONTEND_URL")
            .unwrap_or_else(|_| "https://mmmut.prayukti.org".to_string());
        let student_frontend_url = env::var("STUDENT_FRONTEND_URL")
            .unwrap_or_else(|_| frontend_url.clone());
        let teacher_frontend_url = env::var("TEACHER_FRONTEND_URL")
            .unwrap_or_else(|_| "http://localhost:3001".to_string());

        Self {
            database_url,
            jwt_secret,
            port,
            brevo_api_key,
            email_from_name,
            email_from_address,
            otp_expiry_minutes,
            otp_length,
            otp_max_attempts,
            frontend_url,
            student_frontend_url,
            teacher_frontend_url,
        }
    }

    pub fn frontend_origins(&self) -> Vec<String> {
        let mut list = vec![
            self.frontend_url.clone(),
            self.student_frontend_url.clone(),
            self.teacher_frontend_url.clone(),
        ];
        list.retain(|s| !s.trim().is_empty());
        list
    }
}
