
import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import "dotenv/config";
import { registerTools } from "./tools.js";

const userId = process.env.MCP_USER_ID;
if (!userId) {
    console.error("MCP_USER_ID environment variable is not set.");
    process.exit(1);
}

const server = new McpServer({
    name: "hiring-hub-mcp",
    version: "1.0.0",
});

registerTools(server, userId);

const app = express();
let transport: SSEServerTransport | null = null;

app.get("/sse", async (req, res) => {
    console.log("New SSE connection established");
    transport = new SSEServerTransport("/messages", res);
    await server.connect(transport);
});

app.post("/messages", async (req, res) => {
    if (!transport) {
        res.status(400).send("No active transport");
        return;
    }
    await transport.handlePostMessage(req, res);
});

const PORT = parseInt(process.env.MCP_PORT || "3001", 10);
app.listen(PORT, () => {
    console.log(`MCP Remote Server running on port ${PORT}`);
    console.log(`SSE Endpoint: http://localhost:${PORT}/sse`);
    console.log(`Messages Endpoint: http://localhost:${PORT}/messages`);
});
