import "dotenv/config";
import { db } from "../server/db";
import { profile } from "../shared/schema";

async function checkLayout() {
    const result = await db.select().from(profile).limit(1);
    console.log("Current layout config:");
    console.log(JSON.stringify(result[0].layoutConfig, null, 2));
    process.exit(0);
}

checkLayout().catch(console.error);
