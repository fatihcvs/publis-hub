import "dotenv/config";
import { db } from './db';
import { sql } from 'drizzle-orm';

async function main() {
    await db.execute(sql`
    ALTER TABLE profile ADD COLUMN IF NOT EXISTS riot_api_key TEXT
  `);
    console.log('riotApiKey column added to profile table!');
    process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
