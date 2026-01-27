
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

async function main() {
    // 1. Connect to the Remote SSE Server acting as a Client
    const transportToRemote = new SSEClientTransport(
        new URL("https://ev-app-c32j.onrender.com/sse")
    );

    const client = new Client(
        {
            name: "hiring-hub-proxy",
            version: "1.0.0",
        },
        {
            capabilities: {
                sampling: {},
            },
        }
    );

    await client.connect(transportToRemote);
    console.error("Connected to remote MCP server via SSE");

    // 2. Create a Local Server for Claude to talk to
    const localServer = new McpServer({
        name: "hiring-hub-proxy-server",
        version: "1.0.0",
    });

    // 3. Discover tools from Remote and register them on Local
    // Note: In a real generic proxy, we'd list tools dynamically. 
    // For this specific use case, we know the tools, or we can fetch them.
    const { tools } = await client.listTools();

    for (const tool of tools) {
        localServer.registerTool(
            tool.name,
            tool.description ? { description: tool.description, inputSchema: tool.inputSchema as any } : { inputSchema: tool.inputSchema as any },
            async (args: any) => {
                // Forward the call to the remote server
                const result = await client.callTool({
                    name: tool.name,
                    arguments: args,
                });
                return result as any;
            }
        );
    }

    // 4. Discover resources from Remote and register them
    const { resources } = await client.listResources();
    for (const resource of resources) {
        localServer.resource(
            resource.name,
            resource.uri,
            async (uri) => {
                const result = await client.readResource({ uri: uri.href });
                return {
                    contents: result.contents as any
                };
            }
        );
    }

    // 5. Connect Local Server to Stdio (for Claude)
    const transportToClaude = new StdioServerTransport();
    await localServer.connect(transportToClaude);
    console.error("Proxy server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in proxy:", error);
    process.exit(1);
});
