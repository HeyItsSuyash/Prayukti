const { Client } = require('pg');

async function test() {
    const client = new Client({
        connectionString: "postgresql://neondb_owner:npg_7B3FowhcAuRP@ep-proud-darkness-aqc9efw9.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require",
        connectionTimeoutMillis: 5000,
        query_timeout: 5000
    });
    
    try {
        console.log("Connecting...");
        await client.connect();
        console.log("Connected! Querying subjects...");
        const res = await client.query('SELECT * FROM subjects');
        console.log("Subjects:");
        console.table(res.rows.map(r => ({ slug: r.slug, title: r.title })));
        
        const res2 = await client.query('SELECT * FROM experiments');
        console.log("Experiments:");
        console.table(res2.rows.map(r => ({ slug: r.slug, name: r.name })));
    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        await client.end();
    }
}

test();
