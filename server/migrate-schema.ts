import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function migrate() {
    console.log('Starting migration...');

    try {
        // Add new columns
        await pool.query(`
      ALTER TABLE profile 
      ADD COLUMN IF NOT EXISTS announcement_text TEXT,
      ADD COLUMN IF NOT EXISTS announcement_enabled BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS announcement_color TEXT DEFAULT '#7c3aed',
      ADD COLUMN IF NOT EXISTS cta_button_text TEXT,
      ADD COLUMN IF NOT EXISTS cta_button_url TEXT,
      ADD COLUMN IF NOT EXISTS cta_button_enabled BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS stats_enabled BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS stats_followers TEXT,
      ADD COLUMN IF NOT EXISTS stats_views TEXT;
    `);

        console.log('✅ New columns added successfully');

        // Drop old columns
        await pool.query(`
      ALTER TABLE profile 
      DROP COLUMN IF EXISTS premium_url,
      DROP COLUMN IF EXISTS premium_title,
      DROP COLUMN IF EXISTS premium_description,
      DROP COLUMN IF EXISTS premium_images,
      DROP COLUMN IF EXISTS age_verification_enabled,
      DROP COLUMN IF EXISTS age_verification_url;
    `);

        console.log('✅ Old columns removed successfully');
        console.log('✅ Migration completed!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

migrate();
