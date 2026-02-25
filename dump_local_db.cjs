const { Client } = require('pg');
const fs = require('fs');

async function dumpData() {
    const client = new Client({ connectionString: 'postgresql://postgres:8125578.Fatih@localhost:5432/talatim_hub' });
    const tables = ['profile', 'social_links', 'sponsors', 'discount_codes', 'games']; // tables derived from schema.ts

    try {
        await client.connect();

        let dumpStr = '';

        for (const table of tables) {
            const res = await client.query(`SELECT * FROM ${table}`);
            if (res.rows.length === 0) continue;

            const columns = Object.keys(res.rows[0]);
            dumpStr += `TRUNCATE TABLE "${table}" CASCADE;\n`;

            for (const row of res.rows) {
                let valuesStr = [];
                for (const col of columns) {
                    let val = row[col];
                    if (val === null) valuesStr.push('NULL');
                    else if (typeof val === 'string') valuesStr.push("'" + val.replace(/'/g, "''") + "'");
                    else if (typeof val === 'object') valuesStr.push("'" + JSON.stringify(val).replace(/'/g, "''") + "'"); // jsonb
                    else valuesStr.push(val);
                }
                dumpStr += `INSERT INTO "${table}" ("${columns.join('","')}") VALUES (${valuesStr.join(',')});\n`;
            }
            dumpStr += '\n';
        }

        fs.writeFileSync('db_dump.sql', dumpStr);
        console.log('✅ Dumped successfully to db_dump.sql');

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await client.end();
    }
}

dumpData();
