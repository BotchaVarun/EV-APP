import { db } from "./firebase.js";
import {
  type Application,
  type InsertApplication,
  type Interview,
  type InsertInterview,
  type Recruiter,
  type InsertRecruiter,
  type Reminder,
  type InsertReminder
} from "../shared/schema.js";
import { type User } from "../shared/models/auth.js";

export interface IStorage {
  getApplications(userId: string): Promise<Application[]>;
  getApplication(id: string): Promise<Application | undefined>;
  createApplication(app: InsertApplication & { userId: string }): Promise<Application>;
  updateApplication(id: string, app: Partial<InsertApplication>): Promise<Application>;
  deleteApplication(id: string): Promise<void>;

  getInterviews(userId: string, filters?: { startDate?: Date; endDate?: Date }): Promise<Interview[]>;
  getInterview(id: string): Promise<Interview | undefined>;
  createInterview(interview: InsertInterview & { userId?: string }): Promise<Interview>;
  updateInterview(id: string, interview: Partial<InsertInterview>): Promise<Interview>;
  deleteInterview(id: string): Promise<void>;

  getRecruiters(userId: string): Promise<Recruiter[]>;
  getRecruiter(id: string): Promise<Recruiter | undefined>;
  createRecruiter(recruiter: InsertRecruiter & { userId: string }): Promise<Recruiter>;
  updateRecruiter(id: string, recruiter: Partial<InsertRecruiter>): Promise<Recruiter>;
  deleteRecruiter(id: string): Promise<void>;

  getReminders(userId: string): Promise<Reminder[]>;
  getReminder(id: string): Promise<Reminder | undefined>;
  createReminder(reminder: InsertReminder & { userId: string }): Promise<Reminder>;
  updateReminder(id: string, reminder: Partial<InsertReminder>): Promise<Reminder>;
  deleteReminder(id: string): Promise<void>;

  // User methods
  getUser(id: string): Promise<User | undefined>;
  createUser(user: User): Promise<User>;
}

export class FirestoreStorage implements IStorage {
  async getApplications(userId: string): Promise<Application[]> {
    const snapshot = await db.collection("applications")
      .where("userId", "==", userId)
      .orderBy("updatedAt", "desc")
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Application));
  }

  async getApplication(id: string): Promise<Application | undefined> {
    const doc = await db.collection("applications").doc(id).get();
    if (!doc.exists) return undefined;
    return { id: doc.id, ...doc.data() } as Application;
  }

  async createApplication(app: InsertApplication & { userId: string }): Promise<Application> {
    const now = new Date();
    const data = {
      ...app,
      createdAt: now,
      updatedAt: now,
      // Ensure defaults if missing
      status: app.status || "Saved",
      applicationDate: app.applicationDate || now
    };
    // Clean up undefined values as Firestore doesn't like them
    const cleanData = JSON.parse(JSON.stringify(data));
    const ref = await db.collection("applications").add(cleanData);
    return { id: ref.id, ...data } as Application;
  }

  async updateApplication(id: string, app: Partial<InsertApplication>): Promise<Application> {
    const ref = db.collection("applications").doc(id);
    const data = { ...app, updatedAt: new Date() };
    const cleanData = JSON.parse(JSON.stringify(data));
    await ref.update(cleanData);
    const doc = await ref.get();
    return { id: doc.id, ...doc.data() } as Application;
  }

  async deleteApplication(id: string): Promise<void> {
    await db.collection("applications").doc(id).delete();
  }

  async getInterviews(userId: string, filters?: { startDate?: Date; endDate?: Date }): Promise<Interview[]> {
    // Optimization: If interviews have userId, we can query them directly.
    // Since we are migrating, we might check if we can rely on userId.
    // For now, we stick to the reliable applicationId check but add date filtering.

    const apps = await this.getApplications(userId);
    if (apps.length === 0) return [];

    const appIds = apps.map(a => a.id);
    const chunks = [];
    for (let i = 0; i < appIds.length; i += 10) {
      chunks.push(appIds.slice(i, i + 10));
    }

    let allInterviews: Interview[] = [];
    for (const chunk of chunks) {
      let query = db.collection("interviews")
        .where("applicationId", "in", chunk);

      if (filters?.startDate) {
        query = query.where("interviewDate", ">=", filters.startDate);
      }
      if (filters?.endDate) {
        query = query.where("interviewDate", "<=", filters.endDate);
      }

      const snapshot = await query.orderBy("interviewDate", "desc").get();
      allInterviews = allInterviews.concat(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Interview)));
    }

    return allInterviews.sort((a, b) => b.interviewDate.getTime() - a.interviewDate.getTime());
  }

  async getInterview(id: string): Promise<Interview | undefined> {
    const doc = await db.collection("interviews").doc(id).get();
    if (!doc.exists) return undefined;
    return { id: doc.id, ...doc.data() } as Interview;
  }

  async createInterview(interview: InsertInterview & { userId?: string }): Promise<Interview> {
    // We optionally store userId to enable future direct querying optimization
    const cleanData = JSON.parse(JSON.stringify(interview));
    const ref = await db.collection("interviews").add(cleanData);
    return { id: ref.id, ...interview } as Interview;
  }

  async updateInterview(id: string, interview: Partial<InsertInterview>): Promise<Interview> {
    const ref = db.collection("interviews").doc(id);
    const cleanData = JSON.parse(JSON.stringify(interview));
    await ref.update(cleanData);
    const doc = await ref.get();
    return { id: doc.id, ...doc.data() } as Interview;
  }

  async deleteInterview(id: string): Promise<void> {
    await db.collection("interviews").doc(id).delete();
  }

  async getRecruiters(userId: string): Promise<Recruiter[]> {
    const snapshot = await db.collection("recruiters").where("userId", "==", userId).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recruiter));
  }

  async getRecruiter(id: string): Promise<Recruiter | undefined> {
    const doc = await db.collection("recruiters").doc(id).get();
    if (!doc.exists) return undefined;
    return { id: doc.id, ...doc.data() } as Recruiter;
  }

  async createRecruiter(recruiter: InsertRecruiter & { userId: string }): Promise<Recruiter> {
    const cleanData = JSON.parse(JSON.stringify(recruiter));
    const ref = await db.collection("recruiters").add(cleanData);
    return { id: ref.id, ...recruiter } as Recruiter;
  }

  async updateRecruiter(id: string, recruiter: Partial<InsertRecruiter>): Promise<Recruiter> {
    const ref = db.collection("recruiters").doc(id);
    const cleanData = JSON.parse(JSON.stringify(recruiter));
    await ref.update(cleanData);
    const doc = await ref.get();
    return { id: doc.id, ...doc.data() } as Recruiter;
  }

  async deleteRecruiter(id: string): Promise<void> {
    await db.collection("recruiters").doc(id).delete();
  }

  async getReminders(userId: string): Promise<Reminder[]> {
    const snapshot = await db.collection("reminders")
      .where("userId", "==", userId)
      .orderBy("dueDate")
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reminder));
  }

  async getReminder(id: string): Promise<Reminder | undefined> {
    const doc = await db.collection("reminders").doc(id).get();
    if (!doc.exists) return undefined;
    return { id: doc.id, ...doc.data() } as Reminder;
  }

  async createReminder(reminder: InsertReminder & { userId: string }): Promise<Reminder> {
    const cleanData = JSON.parse(JSON.stringify(reminder));
    const ref = await db.collection("reminders").add(cleanData);
    return { id: ref.id, ...reminder } as Reminder;
  }

  async updateReminder(id: string, reminder: Partial<InsertReminder>): Promise<Reminder> {
    const ref = db.collection("reminders").doc(id);
    const cleanData = JSON.parse(JSON.stringify(reminder));
    await ref.update(cleanData);
    const doc = await ref.get();
    return { id: doc.id, ...doc.data() } as Reminder;
  }

  async deleteReminder(id: string): Promise<void> {
    await db.collection("reminders").doc(id).delete();
  }

  async getUser(id: string): Promise<User | undefined> {
    const doc = await db.collection("users").doc(id).get();
    if (!doc.exists) return undefined;
    return { id: doc.id, ...doc.data() } as User;
  }

  async createUser(user: User): Promise<User> {
    const ref = db.collection("users").doc(user.id);
    const cleanData = JSON.parse(JSON.stringify(user));
    await ref.set(cleanData, { merge: true });
    return user;
  }
}

export const storage = new FirestoreStorage();
