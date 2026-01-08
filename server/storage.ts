import { db } from "./db";
import {
  applications, interviews, recruiters, reminders,
  type Application, type InsertApplication,
  type Interview, type InsertInterview,
  type Recruiter, type InsertRecruiter,
  type Reminder, type InsertReminder
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getApplications(userId: string): Promise<Application[]>;
  getApplication(id: number): Promise<Application | undefined>;
  createApplication(app: InsertApplication): Promise<Application>;
  updateApplication(id: number, app: Partial<InsertApplication>): Promise<Application>;
  deleteApplication(id: number): Promise<void>;

  getInterviews(userId: string): Promise<Interview[]>;
  createInterview(interview: InsertInterview): Promise<Interview>;
  updateInterview(id: number, interview: Partial<InsertInterview>): Promise<Interview>;
  deleteInterview(id: number): Promise<void>;

  getRecruiters(userId: string): Promise<Recruiter[]>;
  createRecruiter(recruiter: InsertRecruiter): Promise<Recruiter>;
  updateRecruiter(id: number, recruiter: Partial<InsertRecruiter>): Promise<Recruiter>;
  deleteRecruiter(id: number): Promise<void>;

  getReminders(userId: string): Promise<Reminder[]>;
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  updateReminder(id: number, reminder: Partial<InsertReminder>): Promise<Reminder>;
  deleteReminder(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getApplications(userId: string): Promise<Application[]> {
    return await db.select().from(applications).where(eq(applications.userId, userId)).orderBy(desc(applications.updatedAt));
  }

  async getApplication(id: number): Promise<Application | undefined> {
    const [app] = await db.select().from(applications).where(eq(applications.id, id));
    return app;
  }

  async createApplication(app: InsertApplication): Promise<Application> {
    const [newApp] = await db.insert(applications).values(app).returning();
    return newApp;
  }

  async updateApplication(id: number, app: Partial<InsertApplication>): Promise<Application> {
    const [updated] = await db.update(applications).set({ ...app, updatedAt: new Date() }).where(eq(applications.id, id)).returning();
    return updated;
  }

  async deleteApplication(id: number): Promise<void> {
    await db.delete(applications).where(eq(applications.id, id));
  }

  async getInterviews(userId: string): Promise<Interview[]> {
    const result = await db.select({ interview: interviews })
      .from(interviews)
      .innerJoin(applications, eq(interviews.applicationId, applications.id))
      .where(eq(applications.userId, userId))
      .orderBy(desc(interviews.interviewDate));
    return result.map(r => r.interview);
  }

  async createInterview(interview: InsertInterview): Promise<Interview> {
    const [newInterview] = await db.insert(interviews).values(interview).returning();
    return newInterview;
  }

  async updateInterview(id: number, interview: Partial<InsertInterview>): Promise<Interview> {
    const [updated] = await db.update(interviews).set(interview).where(eq(interviews.id, id)).returning();
    return updated;
  }

  async deleteInterview(id: number): Promise<void> {
    await db.delete(interviews).where(eq(interviews.id, id));
  }

  async getRecruiters(userId: string): Promise<Recruiter[]> {
    return await db.select().from(recruiters).where(eq(recruiters.userId, userId));
  }

  async createRecruiter(recruiter: InsertRecruiter): Promise<Recruiter> {
    const [newRecruiter] = await db.insert(recruiters).values(recruiter).returning();
    return newRecruiter;
  }

  async updateRecruiter(id: number, recruiter: Partial<InsertRecruiter>): Promise<Recruiter> {
    const [updated] = await db.update(recruiters).set(recruiter).where(eq(recruiters.id, id)).returning();
    return updated;
  }

  async deleteRecruiter(id: number): Promise<void> {
    await db.delete(recruiters).where(eq(recruiters.id, id));
  }

  async getReminders(userId: string): Promise<Reminder[]> {
    return await db.select().from(reminders).where(eq(reminders.userId, userId)).orderBy(reminders.dueDate);
  }

  async createReminder(reminder: InsertReminder): Promise<Reminder> {
    const [newReminder] = await db.insert(reminders).values(reminder).returning();
    return newReminder;
  }

  async updateReminder(id: number, reminder: Partial<InsertReminder>): Promise<Reminder> {
    const [updated] = await db.update(reminders).set(reminder).where(eq(reminders.id, id)).returning();
    return updated;
  }

  async deleteReminder(id: number): Promise<void> {
    await db.delete(reminders).where(eq(reminders.id, id));
  }
}

export const storage = new DatabaseStorage();
