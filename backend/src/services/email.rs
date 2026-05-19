use lettre::{transport::smtp::authentication::Credentials, Message, SmtpTransport, Transport};
use crate::config::Config;
use tracing::{error, info};

pub async fn send_email(
    to: &str,
    subject: &str,
    body_html: &str,
    config: &Config,
) -> Result<(), String> {
    info!("Sending email to: {}", to);
    if config.email_user.is_empty() || config.email_pass.is_empty() {
        info!("No SMTP credentials. Logging email output to console:\nTo: {}\nSubject: {}\nBody: {}", to, subject, body_html);
        return Ok(());
    }

    let email = Message::builder()
        .from(format!("Prayukti vLAB <{}>", config.email_user).parse().unwrap())
        .to(to.parse().map_err(|e| format!("Invalid recipient: {:?}", e))?)
        .subject(subject)
        .header(lettre::message::header::ContentType::TEXT_HTML)
        .body(body_html.to_string())
        .map_err(|e| format!("Email construction failed: {:?}", e))?;

    let creds = Credentials::new(config.email_user.clone(), config.email_pass.clone());

    let host = config.email_host.clone();
    let port = config.email_port;

    let to_str = to.to_string();

    tokio::task::spawn_blocking(move || {
        let mailer = SmtpTransport::relay(&host)
            .unwrap()
            .port(port)
            .credentials(creds)
            .build();

        match mailer.send(&email) {
            Ok(_) => {
                info!("Email sent successfully to {}", to_str);
                Ok(())
            }
            Err(e) => {
                error!("Could not send email to {}: {:?}", to_str, e);
                Err(format!("Could not send email: {:?}", e))
            }
        }
    })
    .await
    .map_err(|e| format!("Task join failed: {:?}", e))?
}

pub async fn send_welcome_email(
    to: &str,
    full_name: &str,
    password_plain: &str,
    config: &Config,
) -> Result<(), String> {
    let subject = "Welcome to Prayukti vLAB";
    let html = format!(
        r#"<div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #4f46e5;">Welcome, {}!</h2>
            <p>Your account has been created successfully.</p>
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Login Details:</strong></p>
                <p>Email: {}</p>
                <p>Password: {}</p>
            </div>
            <p>Please login and change your password for security.</p>
            <a href="http://localhost:3000/login" style="display: inline-block; padding: 10px 20px; background: #4f46e5; color: white; text-decoration: none; border-radius: 6px;">Login Now</a>
        </div>"#,
        full_name, to, password_plain
    );
    send_email(to, subject, &html, config).await
}

pub async fn send_announcement(
    to: &str,
    title: &str,
    content: &str,
    config: &Config,
) -> Result<(), String> {
    let subject = format!("Announcement: {}", title);
    let html = format!(
        r#"<div style="font-family: sans-serif;"><h3>{}</h3><p>{}</p></div>"#,
        title, content
    );
    send_email(to, &subject, &html, config).await
}
