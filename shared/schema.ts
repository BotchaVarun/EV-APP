import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { users } from "./models/auth";

export * from "./models/auth";

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  company: text("company").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  location: text("location"),
  type: text("type"), // Full-time, Intern, Contract
  salary: text("salary"),
  applicationDate: timestamp("application_date").defaultNow(),
  status: text("status").notNull().default("Saved"), // Saved, Applied, Shortlisted, Interview, Offer, Rejected
  url: text("url"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const interviews = pgTable("interviews", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").references(() => applications.id).notNull(),
  round: text("round").notNull(), // HR, Technical, Final
  interviewDate: timestamp("interview_date").notNull(),
  mode: text("mode"), // Online, In-person
  link: text("link"),
  notes: text("notes"),
  completed: boolean("completed").default(false),
});

export const recruiters = pgTable("recruiters", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  company: text("company"),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  linkedin: text("linkedin"),
  notes: text("notes"),
});

export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  applicationId: integer("application_id").references(() => applications.id),
  title: text("title").notNull(),
  dueDate: timestamp("due_date").notNull(),
  completed: boolean("completed").default(false),
});

// Relations
export const applicationsRelations = relations(applications, ({ one, many }) => ({
  user: one(users, { fields: [applications.userId], references: [users.id] }),
  interviews: many(interviews),
  reminders: many(reminders),
}));

export const interviewsRelations = relations(interviews, ({ one }) => ({
  application: one(applications, { fields: [interviews.applicationId], references: [applications.id] }),
}));

export const remindersRelations = relations(reminders, ({ one }) => ({
  application: one(applications, { fields: [reminders.applicationId], references: [applications.id] }),
}));

// Schemas
export const insertApplicationSchema = createInsertSchema(applications).omit({ id: true, createdAt: true, updatedAt: true });
export const insertInterviewSchema = createInsertSchema(interviews).omit({ id: true });
export const insertRecruiterSchema = createInsertSchema(recruiters).omit({ id: true });
export const insertReminderSchema = createInsertSchema(reminders).omit({ id: true });

// Types
export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Interview = typeof interviews.$inferSelect;
export type InsertInterview = z.infer<typeof insertInterviewSchema>;
export type Recruiter = typeof recruiters.$inferSelect;
export type InsertRecruiter = z.infer<typeof insertRecruiterSchema>;
export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = z.infer<typeof insertReminderSchema>;
