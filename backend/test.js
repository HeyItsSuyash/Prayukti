const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://neondb_owner:npg_7B3FowhcAuRP@ep-proud-darkness-aqc9efw9.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require' });
client.connect().then(() => {
    return client.query('SELECT * FROM users WHERE email = $1', ['test@mmmut.ac.in']);
}).then(res => {
    console.log('User found:', res.rows.length > 0 ? res.rows[0] : 'No');
    client.end();
}).catch(console.error);
