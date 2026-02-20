import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function migrate() {
    console.log('Starting LoL Riot ID tag migration...');

    try {
        // Add Riot ID tag column
        await pool.query(`
      ALTER TABLE profile 
      ADD COLUMN IF NOT EXISTS lol_riot_tag TEXT DEFAULT 'EUW';
    `);

        console.log('✅ LoL Riot ID tag column added successfully');
        console.log('✅ Migration completed!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

migrate();
