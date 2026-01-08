import { z } from "zod";

export const applicationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  company: z.string().min(1, "Company is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  type: z.string().nullable().optional(), // Full-time, Intern, Contract
  salary: z.string().nullable().optional(),
  applicationDate: z.coerce.date().nullable().optional(),
  status: z.string().default("Saved"), // Saved, Applied, Shortlisted, Interview, Offer, Rejected
  url: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const insertApplicationSchema = applicationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const interviewSchema = z.object({
  id: z.string(),
  applicationId: z.string(), // Changed to string for Firestore
  round: z.string().min(1, "Round is required"), // HR, Technical, Final
  interviewDate: z.coerce.date(),
  mode: z.string().nullable().optional(), // Online, In-person
  link: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  completed: z.boolean().default(false).optional(),
});

export const insertInterviewSchema = interviewSchema.omit({ id: true });

export const recruiterSchema = z.object({
  id: z.string(),
  userId: z.string(),
  company: z.string().nullable().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  linkedin: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const insertRecruiterSchema = recruiterSchema.omit({ id: true });

export const reminderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  applicationId: z.string().nullable().optional(),
  title: z.string().min(1, "Title is required"),
  dueDate: z.coerce.date(),
  completed: z.boolean().default(false).optional(),
});

export const insertReminderSchema = reminderSchema.omit({ id: true });

// Types
export type Application = z.infer<typeof applicationSchema>;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Interview = z.infer<typeof interviewSchema>;
export type InsertInterview = z.infer<typeof insertInterviewSchema>;
export type Recruiter = z.infer<typeof recruiterSchema>;
export type InsertRecruiter = z.infer<typeof insertRecruiterSchema>;
export type Reminder = z.infer<typeof reminderSchema>;
export type InsertReminder = z.infer<typeof insertReminderSchema>;
