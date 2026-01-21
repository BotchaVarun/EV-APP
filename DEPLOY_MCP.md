# Deploying Hiring Hub MCP Server to the Cloud

This guide explains how to deploy your MCP Remote Server to a cloud provider (like Railway, Render, Fly.io, or Google Cloud Run) and connect it to Claude Desktop.

## 1. Docker Deployment

The project includes a `Dockerfile` configured to run the MCP Remote Server.

### Steps:
1.  **Push your code** to a Git repository (GitHub/GitLab).
2.  **Connect your repository** to a cloud provider (e.g., Railway, Render).
3.  **Configure the Build/Start Command**:
    *   Docker build uses the `Dockerfile` automatically.
    *   The default CMD is `npx tsx mcp-server/remote.ts`.

## 2. Environment Variables

You **MUST** set the following environment variables in your cloud provider's dashboard:

| Variable | Description |
| :--- | :--- |
| `MCP_USER_ID` | The Firestore User ID. Set this to: `FmZfeSN4RdTIgnRgarrdt2NCk073` |
| `FIREBASE_SERVICE_ACCOUNT` | The **JSON content** of your service account key. |
| `MCP_PORT` | (Optional) Port to run on. Defaults to `3001`. |

**Important for `FIREBASE_SERVICE_ACCOUNT`:**
Copy the *entire content* of your `mcp-server/firebase-service-account.json` file and paste it as the value for this environment variable. Do not just paste the path.

## 3. Connecting Claude Desktop

Once deployed, your server will have a public URL (e.g., `https://hiring-hub-mcp.onrender.com`).

You cannot connect Claude Desktop directly to a remote URL without a local bridge because Claude only supports local processes.

### A. Run the Bridge Locally

You need to update your local `mcp-server/proxy.ts` to point to your **Cloud URL** instead of `localhost:3001`.

1.  Open `mcp-server/proxy.ts` on your local machine.
2.  Update the URL:
    ```typescript
    // Replace with your actual cloud URL
    const transportToRemote = new SSEClientTransport(
        new URL("https://your-app-url.com/sse")
    );
    ```
3.  Update `claude_desktop_config.json` to run this local proxy:

```json
{
  "mcpServers": {
    "hiring-hub-cloud": {
      "command": "npx",
      "args": ["tsx", "C:/path/to/your/mcp-server/proxy.ts"]
    }
  }
}
```

(Note: Ensure you use the full absolute path to `proxy.ts` and that you have `npm` installed and configured in your path, or use the full path to `tsx` as before).

### B. Summary of Architecture

`[Claude Desktop]` <--(Stdio)--> `[Local Proxy Script]` <--(HTTPS/SSE)--> `[Cloud MCP Server]` <--(Firestore)--> `[Database]`

This allows Claude to securely access your cloud-hosted tools.
