import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function migrate() {
    console.log('Starting migration for site branding fields...');

    try {
        // Add new columns
        await pool.query(`
      ALTER TABLE profile 
      ADD COLUMN IF NOT EXISTS site_title TEXT DEFAULT 'Link Hub',
      ADD COLUMN IF NOT EXISTS favicon_url TEXT;
    `);

        console.log('✅ Site branding columns added successfully');
        console.log('✅ Migration completed!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

migrate();
