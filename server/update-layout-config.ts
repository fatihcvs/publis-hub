import "dotenv/config";
import { db } from "../server/db";
import { profile } from "../shared/schema";

async function updateLayoutConfig() {
    console.log("Updating layout config to add LoL widget and remove premium/widgets...");

    const newLayoutConfig = [
        { id: "bio", visible: true, width: "full" as const },
        { id: "lol", visible: true, width: "full" as const },
        { id: "kick", visible: true, width: "full" as const },
        { id: "socials", visible: true, width: "full" as const },
        { id: "sponsors", visible: true, width: "full" as const },
        { id: "games", visible: true, width: "full" as const },
        { id: "contact", visible: true, width: "full" as const }
    ];

    await db
        .update(profile)
        .set({ layoutConfig: newLayoutConfig });

    console.log("✅ Layout config updated successfully!");
    process.exit(0);
}

updateLayoutConfig().catch((error) => {
    console.error("❌ Error updating layout config:", error);
    process.exit(1);
});
