
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import "dotenv/config"; // Ensure env vars are loaded
import { registerTools } from "./tools.js";

// Check for MCP_USER_ID
const userId = process.env.MCP_USER_ID;
if (!userId) {
    console.error("MCP_USER_ID environment variable is not set. Please set it to the target user's ID.");
    process.exit(1);
}
//VARUN
// Check for FIREBASE_SERVICE_ACCOUNT (server/firebase.ts should handle this, but good to double check or let it fail there)
if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.warn("FIREBASE_SERVICE_ACCOUNT not set. Firebase might fail to initialize if not completely set up.");
}

const server = new McpServer({
    name: "hiring-hub-mcp",
    version: "1.0.0",
});

registerTools(server, userId);

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Hiring Hub MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
