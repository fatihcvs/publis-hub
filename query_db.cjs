const { Client } = require('pg');

async function checkLocalDB() {
    const client = new Client({ connectionString: 'postgresql://postgres:8125578.Fatih@localhost:5432/talatim_hub' });
    try {
        await client.connect();
        const res = await client.query('SELECT name FROM profile');
        console.log('--- LOCAL DATABSE PROFILES ---');
        console.table(res.rows);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

checkLocalDB();
