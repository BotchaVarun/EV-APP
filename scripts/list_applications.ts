import "dotenv/config";
import { db } from "../server/firebase";

async function main() {
    try {
        console.log("Fetching applications...");
        const snapshot = await db.collection("applications").get();

        if (snapshot.empty) {
            console.log("No applications found.");
            return;
        }

        console.log(`Found ${snapshot.size} applications:`);
        snapshot.forEach(doc => {
            const data = doc.data();
            console.log(`- [${doc.id}] (User: ${data.userId}) ${data.company} - ${data.title} (${data.status})`);
            if (data.url) console.log(`  URL: ${data.url}`);
            if (data.salary) console.log(`  Salary: ${data.salary}`);
            if (data.location) console.log(`  Location: ${data.location}`);
            console.log("");
        });
    } catch (error) {
        console.error("Error fetching applications:", error);
    } finally {
        process.exit(0);
    }
}

main();
