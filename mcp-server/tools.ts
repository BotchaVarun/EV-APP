
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { storage } from "../server/storage.js";

export function registerTools(server: McpServer, userId: string) {
    // Resources

    // List applications
    server.resource(
        "applications",
        "applications://list",
        async (uri) => {
            const apps = await storage.getApplications(userId);
            return {
                contents: [
                    {
                        uri: uri.href,
                        text: JSON.stringify(apps, null, 2),
                        mimeType: "application/json",
                    },
                ],
            };
        }
    );

    // Tools

    // Add Application
    server.registerTool(
        "add_application",
        {
            description: "Add a new job application.",
            inputSchema: z.object({
                company: z.string().min(1),
                title: z.string().min(1),
                description: z.string().optional(),
                status: z.enum(["Saved", "Applied", "Shortlisted", "Interview", "Offer", "Rejected"]).optional(),
                url: z.string().url().optional(),
                location: z.string().optional(),
                type: z.string().optional(),
                salary: z.string().optional(),
            }),
        },
        async (args) => {
            const appData = {
                ...args,
                userId: userId,
                status: args.status || "Saved",
                // Add other defaults or optional fields handling if needed
            };

            const newApp = await storage.createApplication(appData);
            return {
                content: [
                    {
                        type: "text",
                        text: `Application added for ${newApp.company} (${newApp.title}) with ID: ${newApp.id}`,
                    },
                ],
            };
        }
    );

    // Update Application (Status/Notes etc)
    server.registerTool(
        "update_application",
        {
            description: "Update an existing application.",
            inputSchema: z.object({
                id: z.string(),
                status: z.enum(["Saved", "Applied", "Shortlisted", "Interview", "Offer", "Rejected"]).optional(),
                notes: z.string().optional(),
                // Add other fields as needed
            }),
        },
        async (args) => {
            const { id, ...updates } = args;
            const existing = await storage.getApplication(id);
            if (!existing) {
                throw new Error(`Application with ID ${id} not found.`);
            }
            // Security check: ensure it belongs to the user
            if (existing.userId !== userId) {
                throw new Error(`Application with ID ${id} does not belong to the current user.`);
            }

            const updated = await storage.updateApplication(id, updates);
            return {
                content: [
                    {
                        type: "text",
                        text: `Application ${id} updated. Status: ${updated.status}`,
                    },
                ],
            };
        }
    );

    // Search Applications
    server.registerTool(
        "search_applications",
        {
            description: "Search applications by company or title.",
            inputSchema: z.object({
                query: z.string(),
            }),
        },
        async ({ query }) => {
            const apps = await storage.getApplications(userId);
            const lowerQuery = query.toLowerCase();
            const filtered = apps.filter(app =>
                app.company.toLowerCase().includes(lowerQuery) ||
                app.title.toLowerCase().includes(lowerQuery)
            );

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(filtered, null, 2)
                    }
                ]
            }
        }
    );

    // Delete Application
    server.registerTool(
        "delete_application",
        {
            description: "Delete an application by ID.",
            inputSchema: z.object({
                id: z.string(),
            }),
        },
        async ({ id }) => {
            const existing = await storage.getApplication(id);
            if (!existing) {
                throw new Error(`Application with ID ${id} not found.`);
            }
            if (existing.userId !== userId) {
                throw new Error(`Application with ID ${id} does not belong to the current user.`);
            }
            await storage.deleteApplication(id);
            return {
                content: [
                    {
                        type: "text",
                        text: `Application ${id} deleted.`
                    }
                ]
            }
        }
    );
}
