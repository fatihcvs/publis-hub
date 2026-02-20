import { Client } from 'pg';
import "dotenv/config";

async function main() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error("DATABASE_URL is not defined");
        process.exit(1);
    }

    // Connect to the default 'postgres' database to create the target database
    const connectionString = dbUrl.replace(/\/[^/]+$/, '/postgres');
    const targetDbName = dbUrl.split('/').pop();

    if (!targetDbName) {
        console.error("Could not determine database name from DATABASE_URL");
        process.exit(1);
    }

    const client = new Client({ connectionString });

    try {
        await client.connect();

        // Check if database exists
        const checkRes = await client.query(
            `SELECT 1 FROM pg_database WHERE datname = $1`,
            [targetDbName]
        );

        if (checkRes.rowCount === 0) {
            console.log(`Creating database ${targetDbName}...`);
            // CREATE DATABASE cannot run in a transaction block, so we run it directly
            await client.query(`CREATE DATABASE "${targetDbName}"`);
            console.log(`Database ${targetDbName} created successfully.`);
        } else {
            console.log(`Database ${targetDbName} already exists.`);
        }
    } catch (err) {
        console.error("Error checking/creating database:", err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

main();
