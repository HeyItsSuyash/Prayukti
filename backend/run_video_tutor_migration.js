const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function run() {
    const connectionString = "postgresql://neondb_owner:npg_7B3FowhcAuRP@ep-proud-darkness-aqc9efw9.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require";
    const client = new Client({
        connectionString,
        connectionTimeoutMillis: 15000,
    });

    try {
        console.log("Connecting to PostgreSQL for AI Video Tutor migration...");
        await client.connect();
        console.log("Connected! Reading migration file...");
        const migrationPath = path.join(__dirname, 'migrations', '20260607000001_ai_video_tutor.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');
        
        console.log("Running migration...");
        await client.query(sql);
        console.log("AI Video Tutor Migration executed successfully!");
    } catch (e) {
        console.error("Migration failed:", e);
    } finally {
        await client.end();
    }
}

run();
