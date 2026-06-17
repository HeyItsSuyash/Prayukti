const { Client } = require('pg');

async function test() {
    const client = new Client({
        connectionString: "postgresql://neondb_owner:npg_7B3FowhcAuRP@ep-proud-darkness-aqc9efw9.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require"
    });
    
    try {
        await client.connect();
        
        const tables = ['participation_events', 'engagement_scores', 'ai_insights', 'ai_conversations', 'announcements'];
        for (const t of tables) {
            const res = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${t}'`);
            console.log(`Columns for ${t}:`);
            console.table(res.rows);
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}

test();
