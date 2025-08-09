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
  businessNumber: varchar("business_number").notNull(),
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

// Job categories for 5060 generation
export const jobCategories = pgTable("job_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull().unique(),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  description: varchar("description", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// User selected job categories (max 2)
export const userJobCategories = pgTable("user_job_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  categoryId: varchar("category_id").notNull().references(() => jobCategories.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Companies table from CSV data
export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyName: varchar("company_name", { length: 200 }).notNull(),
  jobTitle: varchar("job_title", { length: 300 }).notNull(),
  location: varchar("location", { length: 100 }),
  education: varchar("education", { length: 50 }),
  experience: varchar("experience", { length: 100 }),
  category: varchar("category", { length: 100 }).notNull(), // 분야
  deadline: varchar("deadline", { length: 50 }),
  employmentType: varchar("employment_type", { length: 50 }), // 고용형태
  companySize: varchar("company_size", { length: 50 }), // 기업규모
  salary: integer("salary"), // 급여(만원)
  skills: varchar("skills", { length: 1000 }), // 관련 기술/자격증
  sourceFile: varchar("source_file", { length: 100 }), // 원본 CSV 파일명
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
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

export const insertJobCategorySchema = createInsertSchema(jobCategories).omit({
  id: true,
  createdAt: true,
});

export const insertUserJobCategorySchema = createInsertSchema(userJobCategories).omit({
  id: true,
  createdAt: true,
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
});

// Export types for Replit Auth
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type IndividualProfile = typeof individualProfiles.$inferSelect;
export type CompanyProfile = typeof companyProfiles.$inferSelect;
export type JobCategory = typeof jobCategories.$inferSelect;
export type UserJobCategory = typeof userJobCategories.$inferSelect;
export type Company = typeof companies.$inferSelect;

export type InsertIndividualProfile = z.infer<typeof insertIndividualProfileSchema>;
export type InsertCompanyProfile = z.infer<typeof insertCompanyProfileSchema>;
export type InsertJobCategory = z.infer<typeof insertJobCategorySchema>;
export type InsertUserJobCategory = z.infer<typeof insertUserJobCategorySchema>;
export type InsertCompany = z.infer<typeof insertCompanySchema>;