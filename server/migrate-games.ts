import "dotenv/config";
import { db } from './db';

import { sql } from 'drizzle-orm';

async function main() {
    await db.execute(sql`
    CREATE TABLE IF NOT EXISTS games (
      id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      platform TEXT,
      url TEXT,
      logo_url TEXT,
      display_order INTEGER NOT NULL DEFAULT 0,
      is_active BOOLEAN NOT NULL DEFAULT TRUE
    )
  `);
    console.log('Games table created successfully!');
    process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
