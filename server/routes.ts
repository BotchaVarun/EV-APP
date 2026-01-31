import type { Express, Request, Response, NextFunction } from "express";
import { type Server } from "http";
import { type IStorage, storage } from "./storage.js";
import { api } from "../shared/routes.js";
import { z } from "zod";
import admin from "firebase-admin";
import { auth } from "./firebase.js";
import { DecodedIdToken } from "firebase-admin/auth";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: DecodedIdToken;
    }
  }
}

export function registerRoutes(
  httpServer: Server,
  app: Express
): Server {

  // Middleware to verify Firebase ID Token
  const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized - No token provided" });
    }

    const idToken = authHeader.split("Bearer ")[1];
    try {
      const decodedToken = await auth.verifyIdToken(idToken);
      req.user = decodedToken;
      next();
    } catch (error) {
      console.error("Error verifying token:", error);
      res.status(401).json({ message: "Unauthorized - Invalid token" });
    }
  };

  // Health Check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      firebase_apps: admin.apps.length,
      // Don't expose sensitive info, just check if credential exists
      has_credential: !!process.env.FIREBASE_SERVICE_ACCOUNT
    });
  });

  // Applications
  app.get(api.applications.list.path, requireAuth, async (req, res) => {
    const apps = await storage.getApplications(req.user!.uid);
    res.json(apps);
  });

  app.get(api.applications.get.path, requireAuth, async (req, res) => {
    // Use string IDs
    const app = await storage.getApplication(req.params.id);
    if (!app) return res.status(404).json({ message: "Not found" });
    if (app.userId !== req.user!.uid) return res.status(403).json({ message: "Forbidden" });
    res.json(app);
  });

  app.post(api.applications.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.applications.create.input.parse(req.body);
      // userId from token
      const app = await storage.createApplication({ ...input, userId: req.user!.uid });
      res.status(201).json(app);
    } catch (err) {
      console.error(err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.put(api.applications.update.path, requireAuth, async (req, res) => {
    const existing = await storage.getApplication(req.params.id);
    if (!existing) return res.status(404).json({ message: "Not found" });
    if (existing.userId !== req.user!.uid) return res.status(403).json({ message: "Forbidden" });

    try {
      const input = api.applications.update.input.parse(req.body);
      const updated = await storage.updateApplication(req.params.id, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.applications.delete.path, requireAuth, async (req, res) => {
    const existing = await storage.getApplication(req.params.id);
    if (!existing) return res.status(404).json({ message: "Not found" });
    if (existing.userId !== req.user!.uid) return res.status(403).json({ message: "Forbidden" });

    await storage.deleteApplication(req.params.id);
    res.status(204).send();
  });

  // Interviews
  app.get(api.interviews.list.path, requireAuth, async (req, res) => {
    const start = req.query.start ? new Date(req.query.start as string) : undefined;
    const end = req.query.end ? new Date(req.query.end as string) : undefined;

    // Validate dates if provided
    if ((req.query.start && isNaN(start!.getTime())) || (req.query.end && isNaN(end!.getTime()))) {
      return res.status(400).json({ message: "Invalid date format for start or end parameters" });
    }

    const interviews = await storage.getInterviews(req.user!.uid, { startDate: start, endDate: end });
    res.json(interviews);
  });

  app.post(api.interviews.create.path, requireAuth, async (req, res) => {
    // Verify application ownership
    const application = await storage.getApplication(req.body.applicationId);
    if (!application || application.userId !== req.user!.uid) {
      return res.status(403).json({ message: "Forbidden - Invalid application" });
    }

    try {
      const input = api.interviews.create.input.parse(req.body);
      const interview = await storage.createInterview({ ...input, userId: req.user!.uid });
      res.status(201).json(interview);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.interviews.update.path, requireAuth, async (req, res) => {
    const existing = await storage.getInterview(req.params.id);
    if (!existing) return res.status(404).json({ message: "Not found" });

    // Check application ownership
    const application = await storage.getApplication(existing.applicationId);
    if (!application || application.userId !== req.user!.uid) {
      return res.status(403).json({ message: "Forbidden" });
    }

    try {
      const input = api.interviews.update.input.parse(req.body);
      const updated = await storage.updateInterview(req.params.id, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.interviews.delete.path, requireAuth, async (req, res) => {
    const existing = await storage.getInterview(req.params.id);
    if (!existing) return res.status(404).json({ message: "Not found" });

    // Check application ownership
    const application = await storage.getApplication(existing.applicationId);
    if (!application || application.userId !== req.user!.uid) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await storage.deleteInterview(req.params.id);
    res.status(204).send();
  });

  // Recruiters
  app.get(api.recruiters.list.path, requireAuth, async (req, res) => {
    const recruiters = await storage.getRecruiters(req.user!.uid);
    res.json(recruiters);
  });

  app.post(api.recruiters.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.recruiters.create.input.parse(req.body);
      const recruiter = await storage.createRecruiter({ ...input, userId: req.user!.uid });
      res.status(201).json(recruiter);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.recruiters.update.path, requireAuth, async (req, res) => {
    const existing = await storage.getRecruiter(req.params.id);
    if (!existing) return res.status(404).json({ message: "Not found" });
    if (existing.userId !== req.user!.uid) return res.status(403).json({ message: "Forbidden" });

    try {
      const input = api.recruiters.update.input.parse(req.body);
      const updated = await storage.updateRecruiter(req.params.id, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.recruiters.delete.path, requireAuth, async (req, res) => {
    const existing = await storage.getRecruiter(req.params.id);
    if (!existing) return res.status(404).json({ message: "Not found" });
    if (existing.userId !== req.user!.uid) return res.status(403).json({ message: "Forbidden" });

    await storage.deleteRecruiter(req.params.id);
    res.status(204).send();
  });

  // Reminders
  app.get(api.reminders.list.path, requireAuth, async (req, res) => {
    const reminders = await storage.getReminders(req.user!.uid);
    res.json(reminders);
  });

  app.post(api.reminders.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.reminders.create.input.parse(req.body);
      const reminder = await storage.createReminder({ ...input, userId: req.user!.uid });
      res.status(201).json(reminder);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.reminders.update.path, requireAuth, async (req, res) => {
    const existing = await storage.getReminder(req.params.id);
    if (!existing) return res.status(404).json({ message: "Not found" });
    if (existing.userId !== req.user!.uid) return res.status(403).json({ message: "Forbidden" });

    try {
      const input = api.reminders.update.input.parse(req.body);
      const updated = await storage.updateReminder(req.params.id, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.reminders.delete.path, requireAuth, async (req, res) => {
    const existing = await storage.getReminder(req.params.id);
    if (!existing) return res.status(404).json({ message: "Not found" });
    if (existing.userId !== req.user!.uid) return res.status(403).json({ message: "Forbidden" });

    await storage.deleteReminder(req.params.id);
    res.status(204).send();
  });

  return httpServer;
}
