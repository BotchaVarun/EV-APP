import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Set up authentication
  await setupAuth(app);
  registerAuthRoutes(app);

  // Middleware to ensure user is authenticated
  const requireAuth = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Applications
  app.get(api.applications.list.path, requireAuth, async (req, res) => {
    const apps = await storage.getApplications(req.user!.id);
    res.json(apps);
  });

  app.get(api.applications.get.path, requireAuth, async (req, res) => {
    const app = await storage.getApplication(Number(req.params.id));
    if (!app) return res.status(404).json({ message: "Not found" });
    if (app.userId !== req.user!.id) return res.status(403).json({ message: "Forbidden" });
    res.json(app);
  });

  app.post(api.applications.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.applications.create.input.parse(req.body);
      const app = await storage.createApplication({ ...input, userId: req.user!.id });
      res.status(201).json(app);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.applications.update.path, requireAuth, async (req, res) => {
    const existing = await storage.getApplication(Number(req.params.id));
    if (!existing) return res.status(404).json({ message: "Not found" });
    if (existing.userId !== req.user!.id) return res.status(403).json({ message: "Forbidden" });

    try {
      const input = api.applications.update.input.parse(req.body);
      const updated = await storage.updateApplication(Number(req.params.id), input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.applications.delete.path, requireAuth, async (req, res) => {
    const existing = await storage.getApplication(Number(req.params.id));
    if (!existing) return res.status(404).json({ message: "Not found" });
    if (existing.userId !== req.user!.id) return res.status(403).json({ message: "Forbidden" });

    await storage.deleteApplication(Number(req.params.id));
    res.status(204).send();
  });

  // Interviews
  app.get(api.interviews.list.path, requireAuth, async (req, res) => {
    const interviews = await storage.getInterviews(req.user!.id);
    res.json(interviews);
  });

  app.post(api.interviews.create.path, requireAuth, async (req, res) => {
    // Verify application ownership
    const application = await storage.getApplication(req.body.applicationId);
    if (!application || application.userId !== req.user!.id) {
      return res.status(403).json({ message: "Forbidden - Invalid application" });
    }
    
    try {
      const input = api.interviews.create.input.parse(req.body);
      const interview = await storage.createInterview(input);
      res.status(201).json(interview);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // Recruiters
  app.get(api.recruiters.list.path, requireAuth, async (req, res) => {
    const recruiters = await storage.getRecruiters(req.user!.id);
    res.json(recruiters);
  });

  app.post(api.recruiters.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.recruiters.create.input.parse(req.body);
      const recruiter = await storage.createRecruiter({ ...input, userId: req.user!.id });
      res.status(201).json(recruiter);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // Reminders
  app.get(api.reminders.list.path, requireAuth, async (req, res) => {
    const reminders = await storage.getReminders(req.user!.id);
    res.json(reminders);
  });

  app.post(api.reminders.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.reminders.create.input.parse(req.body);
      const reminder = await storage.createReminder({ ...input, userId: req.user!.id });
      res.status(201).json(reminder);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  return httpServer;
}
