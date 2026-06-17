const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_7B3FowhcAuRP@ep-proud-darkness-aqc9efw9.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

async function run() {
  await client.connect();
  const sql = fs.readFileSync('./backend/migrations/20260616000000_timetable_module.sql', 'utf8');
  await client.query(sql);
  console.log("Migration applied successfully!");
  await client.end();
}
run().catch(console.error);
