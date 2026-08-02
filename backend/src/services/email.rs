use reqwest::Client;
use serde_json::json;
use tracing::{error, info};
use chrono::Datelike;
use crate::config::Config;

pub struct EmailService;

impl EmailService {
    pub async fn send_email(
        to: &str,
        subject: &str,
        body_html: &str,
        body_text: Option<&str>,
        config: &Config,
    ) -> Result<(), String> {
        info!("Sending email via Brevo to: {}", to);
        if config.brevo_api_key.is_empty() {
            info!("No BREVO_API_KEY found. Logging email output to console:\nTo: {}\nSubject: {}\nBody: {}", to, subject, body_html);
            return Ok(());
        }

        let client = Client::new();
        let payload = json!({
            "sender": {
                "name": config.email_from_name,
                "email": config.email_from_address
            },
            "to": [
                {
                    "email": to
                }
            ],
            "subject": subject,
            "htmlContent": body_html,
            "textContent": body_text.unwrap_or("Please view this email in an HTML-compatible client.")
        });

        let res = client
            .post("https://api.brevo.com/v3/smtp/email")
            .header("api-key", &config.brevo_api_key)
            .header("Content-Type", "application/json")
            .header("Accept", "application/json")
            .json(&payload)
            .send()
            .await;

        match res {
            Ok(response) => {
                if response.status().is_success() {
                    info!("[EMAIL] Email sent successfully to {}", to);
                    Ok(())
                } else {
                    let err_text = response.text().await.unwrap_or_default();
                    error!("[EMAIL] Brevo API error sending to {}: {}", to, err_text);
                    Err(format!("Brevo API error: {}", err_text))
                }
            }
            Err(e) => {
                error!("[EMAIL] HTTP request failed when sending to {}: {:?}", to, e);
                Err(format!("HTTP request failed: {:?}", e))
            }
        }
    }

    pub async fn send_otp_email(to: &str, otp: &str, config: &Config) -> Result<(), String> {
        let subject = "Your Verification Code - Prayukti vLAB";
        let html = format!(
            r#"
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #14D98F; border-radius: 12px; background-color: #021D24;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #ffffff; margin: 0;">Prayukti <span style="color: #14D98F; font-weight: 300;">vLAB</span></h2>
                </div>
                <h3 style="color: #ffffff; font-size: 20px; margin-bottom: 15px;">Verify your email address</h3>
                <p style="color: #94a3b8; font-size: 16px; line-height: 1.5; margin-bottom: 25px;">
                    Please use the verification code below to complete your sign in. This code will expire in {} minutes.
                </p>
                <div style="background-color: #084738; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 25px; border: 1px dashed #14D98F;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #14D98F;">{}</span>
                </div>
                <p style="color: #64748b; font-size: 14px; line-height: 1.5;">
                    If you didn't request this code, you can safely ignore this email. Someone else might have typed your email address by mistake.
                </p>
                <hr style="border: none; border-top: 1px solid #084738; margin: 30px 0;" />
                <p style="color: #475569; font-size: 12px; text-align: center;">
                    &copy; {} Prayukti vLAB. All rights reserved.
                </p>
            </div>
            "#,
            config.otp_expiry_minutes,
            otp,
            chrono::Utc::now().year()
        );
        let text = format!("Your Prayukti vLAB verification code is: {}. It expires in {} minutes.", otp, config.otp_expiry_minutes);
        
        Self::send_email(to, subject, &html, Some(&text), config).await
    }
}
