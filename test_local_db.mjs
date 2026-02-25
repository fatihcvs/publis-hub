import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: 'postgresql://postgres:8125578.Fatih@localhost:5432/talatim_hub' });
const db = drizzle(pool);

async function main() {
    const res = await pool.query('SELECT id, name FROM sponsors;');
    console.log("=== LOCAL DATABASE UUIDS ===");
    console.log(res.rows);
    pool.end();
}

main().catch(console.error);
