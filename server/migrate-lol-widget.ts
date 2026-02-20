import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function migrate() {
    console.log('Starting LoL widget migration...');

    try {
        // Add LoL widget columns
        await pool.query(`
      ALTER TABLE profile 
      ADD COLUMN IF NOT EXISTS lol_summoner_name TEXT,
      ADD COLUMN IF NOT EXISTS lol_region TEXT DEFAULT 'TR1',
      ADD COLUMN IF NOT EXISTS lol_widget_enabled BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS lol_widget_settings JSONB DEFAULT '{
        "showLastMatches": true,
        "matchCount": 5,
        "showRank": true,
        "showTopChampions": false,
        "showWinrate": true,
        "cardColor": "#7c3aed",
        "accentColor": "#a78bfa"
      }'::jsonb;
    `);

        console.log('✅ LoL widget columns added successfully');
        console.log('✅ Migration completed!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

migrate();
