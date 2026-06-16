use sqlx::postgres::PgPoolOptions;
use bcrypt::{hash, DEFAULT_COST};
use uuid::Uuid;
use dotenvy::dotenv;
use std::env;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenv().ok();
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    println!("Connecting to database...");
    
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await?;
        
    println!("Connected. Setting up seed users...");

    // Seed student user
    let student_email = "student@mmmut.ac.in";
    let student_exists = sqlx::query!(
        "SELECT id FROM users WHERE email = $1",
        student_email
    )
    .fetch_optional(&pool)
    .await?;

    if student_exists.is_none() {
        println!("Creating student user...");
        let id = Uuid::new_v4();
        let password_hash = hash("Password123!", DEFAULT_COST)?;
        sqlx::query!(
            r#"
            INSERT INTO users (id, full_name, email, password, role, is_verified, roll_no, branch, year, semester)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            "#,
            id,
            "Test Student",
            student_email,
            password_hash,
            "student",
            true,
            "2026STUDENT01",
            "Computer Science",
            2,
            3
        )
        .execute(&pool)
        .await?;
        println!("Student user created: id = {}", id);
    } else {
        println!("Student user already exists.");
    }

    // Seed teacher user
    let teacher_email = "teacher@mmmut.ac.in";
    let teacher_exists = sqlx::query!(
        "SELECT id FROM users WHERE email = $1",
        teacher_email
    )
    .fetch_optional(&pool)
    .await?;

    if teacher_exists.is_none() {
        println!("Creating teacher user...");
        let id = Uuid::new_v4();
        let password_hash = hash("Password123!", DEFAULT_COST)?;
        sqlx::query!(
            r#"
            INSERT INTO users (id, full_name, email, password, role, is_verified, roll_no)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            "#,
            id,
            "Test Teacher",
            teacher_email,
            password_hash,
            "teacher",
            true,
            "2026TEACHER01"
        )
        .execute(&pool)
        .await?;
        println!("Teacher user created: id = {}", id);
    } else {
        println!("Teacher user already exists.");
    }

    // Seed admin user
    let admin_email = "test.admin@mmmut.ac.in";
    let admin_exists = sqlx::query!(
        "SELECT id FROM users WHERE email = $1",
        admin_email
    )
    .fetch_optional(&pool)
    .await?;

    if admin_exists.is_none() {
        println!("Creating admin user...");
        let id = Uuid::new_v4();
        let password_hash = hash("password123", DEFAULT_COST)?;
        sqlx::query!(
            r#"
            INSERT INTO users (id, full_name, email, password, role, is_verified, roll_no)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            "#,
            id,
            "Test Admin",
            admin_email,
            password_hash,
            "admin",
            true,
            "2026ADMIN01"
        )
        .execute(&pool)
        .await?;
        println!("Admin user created: id = {}", id);
    } else {
        println!("Admin user already exists.");
    }

    println!("Seed completed successfully!");
    Ok(())
}
