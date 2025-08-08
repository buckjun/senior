import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  decimal,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User types
export const userTypeEnum = pgEnum('user_type', ['individual', 'company']);

// User profiles (extends users table)
export const userProfiles = pgTable("user_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  userType: userTypeEnum("user_type").notNull(),
  phoneNumber: varchar("phone_number"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Individual profiles for job seekers
export const individualProfiles = pgTable("individual_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  birthYear: integer("birth_year"),
  summary: text("summary"), // AI generated summary
  experience: jsonb("experience"), // Array of work experiences
  skills: jsonb("skills"), // Array of skills/keywords
  preferredJobTypes: jsonb("preferred_job_types"), // Array of preferred job types
  preferredLocations: jsonb("preferred_locations"), // Array of preferred work locations
  workTimeFlexibility: boolean("work_time_flexibility").default(true),
  resumeFileUrl: varchar("resume_file_url"),
  aiAnalysis: jsonb("ai_analysis"), // AI analysis results
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Company profiles
export const companyProfiles = pgTable("company_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  companyName: varchar("company_name").notNull(),
  businessNumber: varchar("business_number").notNull(), // 사업자등록번호
  ceoName: varchar("ceo_name").notNull(),
  address: text("address").notNull(),
  businessType: varchar("business_type").notNull(),
  contactPerson: varchar("contact_person").notNull(),
  contactPhone: varchar("contact_phone").notNull(),
  contactEmail: varchar("contact_email").notNull(),
  website: varchar("website"),
  foundedDate: timestamp("founded_date"),
  employeeCount: integer("employee_count"),
  revenue: decimal("revenue"),
  description: text("description"),
  logoUrl: varchar("logo_url"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Job postings
export const jobStatusEnum = pgEnum('job_status', ['active', 'closed', 'draft']);
export const workScheduleEnum = pgEnum('work_schedule', ['flexible', 'fixed']);
export const salaryTypeEnum = pgEnum('salary_type', ['hourly', 'monthly', 'annual']);

export const jobPostings = pgTable("job_postings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").references(() => companyProfiles.id).notNull(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  workSchedule: workScheduleEnum("work_schedule").notNull(),
  salaryType: salaryTypeEnum("salary_type"),
  salaryAmount: decimal("salary_amount"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: jobStatusEnum("status").default('active'),
  requirements: jsonb("requirements"), // Array of requirements
  benefits: jsonb("benefits"), // Array of benefits
  prefersSeniors: boolean("prefers_seniors").default(false),
  viewCount: integer("view_count").default(0),
  applicationCount: integer("application_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Job applications
export const applicationStatusEnum = pgEnum('application_status', ['applied', 'viewed', 'interview_requested', 'interviewed', 'accepted', 'rejected']);

export const jobApplications = pgTable("job_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").references(() => jobPostings.id).notNull(),
  applicantId: varchar("applicant_id").references(() => individualProfiles.id).notNull(),
  status: applicationStatusEnum("status").default('applied'),
  coverLetter: text("cover_letter"),
  matchingScore: decimal("matching_score"), // AI calculated matching score
  appliedAt: timestamp("applied_at").defaultNow(),
  viewedAt: timestamp("viewed_at"),
  respondedAt: timestamp("responded_at"),
});

// Saved jobs (찜한 공고)
export const savedJobs = pgTable("saved_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  jobId: varchar("job_id").references(() => jobPostings.id).notNull(),
  savedAt: timestamp("saved_at").defaultNow(),
});

// AI recommendations for companies
export const aiRecommendations = pgTable("ai_recommendations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").references(() => jobPostings.id).notNull(),
  candidateId: varchar("candidate_id").references(() => individualProfiles.id).notNull(),
  matchingScore: decimal("matching_score").notNull(),
  reasoning: text("reasoning"), // AI explanation for the match
  keyStrengths: jsonb("key_strengths"), // Array of matching strengths
  status: varchar("status").default('pending'), // pending, contacted, dismissed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Education programs
export const educationPrograms = pgTable("education_programs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  provider: varchar("provider").notNull(),
  description: text("description").notNull(),
  duration: varchar("duration"), // e.g., "3개월", "6주"
  isGovernmentFunded: boolean("is_government_funded").default(false),
  targetJobTypes: jsonb("target_job_types"), // Array of job types this helps with
  curriculum: jsonb("curriculum"), // Array of curriculum items
  location: text("location"),
  cost: decimal("cost"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  applicationUrl: varchar("application_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertIndividualProfileSchema = createInsertSchema(individualProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCompanyProfileSchema = createInsertSchema(companyProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertJobPostingSchema = createInsertSchema(jobPostings).omit({
  id: true,
  viewCount: true,
  applicationCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertJobApplicationSchema = createInsertSchema(jobApplications).omit({
  id: true,
  appliedAt: true,
  viewedAt: true,
  respondedAt: true,
});

export const insertAiRecommendationSchema = createInsertSchema(aiRecommendations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
// Include id in UpsertUser for authentication
export type UpsertUser = z.infer<typeof insertUserSchema> & { id: string };
export type User = typeof users.$inferSelect;
export type UserProfile = typeof userProfiles.$inferSelect;
export type IndividualProfile = typeof individualProfiles.$inferSelect;
export type CompanyProfile = typeof companyProfiles.$inferSelect;
export type JobPosting = typeof jobPostings.$inferSelect;
export type JobApplication = typeof jobApplications.$inferSelect;
export type SavedJob = typeof savedJobs.$inferSelect;
export type AiRecommendation = typeof aiRecommendations.$inferSelect;
export type EducationProgram = typeof educationPrograms.$inferSelect;

export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type InsertIndividualProfile = z.infer<typeof insertIndividualProfileSchema>;
export type InsertCompanyProfile = z.infer<typeof insertCompanyProfileSchema>;
export type InsertJobPosting = z.infer<typeof insertJobPostingSchema>;
export type InsertJobApplication = z.infer<typeof insertJobApplicationSchema>;
export type InsertAiRecommendation = z.infer<typeof insertAiRecommendationSchema>;
