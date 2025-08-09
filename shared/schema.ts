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

// User types
export const userTypeEnum = pgEnum('user_type', ['individual', 'company']);

// User storage table for custom auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(), // 해시된 비밀번호
  name: varchar("name").notNull(),
  phone: varchar("phone"),
  userType: userTypeEnum("user_type").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

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

// Senior reemployment success cases / statistics
export const seniorReemploymentData = pgTable("senior_reemployment_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  // Basic demographics
  age: integer("age").notNull(),
  gender: varchar("gender"), // "남성", "여성"
  region: varchar("region"), // 지역 정보
  educationLevel: varchar("education_level"), // 학력 수준
  
  // Previous career information
  previousIndustry: varchar("previous_industry"), // 이전 업종
  previousPosition: varchar("previous_position"), // 이전 직급/직책
  previousSalary: decimal("previous_salary"), // 이전 연봉
  careerBreakDuration: integer("career_break_duration"), // 경력단절 기간 (개월)
  
  // Reemployment information
  newIndustry: varchar("new_industry"), // 새로운 업종
  newPosition: varchar("new_position"), // 새로운 직급/직책
  newSalary: decimal("new_salary"), // 새로운 연봉
  employmentType: varchar("employment_type"), // "정규직", "계약직", "파트타임", "프리랜서"
  workSchedule: varchar("work_schedule"), // "풀타임", "파트타임", "유연근무"
  
  // Job search process
  jobSearchDuration: integer("job_search_duration"), // 구직기간 (개월)
  jobSearchMethods: jsonb("job_search_methods"), // Array of search methods used
  skillsTraining: jsonb("skills_training"), // Array of training programs attended
  governmentSupport: jsonb("government_support"), // Array of government programs used
  
  // Success factors
  successFactors: jsonb("success_factors"), // Array of factors that helped
  challenges: jsonb("challenges"), // Array of challenges faced
  recommendations: text("recommendations"), // 후배들에게 조언
  
  // Company information
  companySize: varchar("company_size"), // "대기업", "중견기업", "중소기업", "스타트업"
  companyType: varchar("company_type"), // "일반기업", "사회적기업", "정부기관" 등
  
  // Outcome metrics
  jobSatisfaction: integer("job_satisfaction"), // 1-10 점수
  workLifeBalance: integer("work_life_balance"), // 1-10 점수
  salaryChange: decimal("salary_change"), // 연봉 변화율
  
  // Metadata
  dataSource: varchar("data_source").default("excel_import"), // 데이터 출처
  isVerified: boolean("is_verified").default(false), // 검증 여부
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Aggregated statistics for dashboard
export const reemploymentStatistics = pgTable("reemployment_statistics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  category: varchar("category").notNull(), // "age_group", "industry", "region" 등
  categoryValue: varchar("category_value").notNull(), // "50-54", "IT", "서울" 등
  
  // Success metrics
  totalCases: integer("total_cases").default(0),
  successfulReemployments: integer("successful_reemployments").default(0),
  successRate: decimal("success_rate"), // 성공률 (백분율)
  avgJobSearchDuration: decimal("avg_job_search_duration"), // 평균 구직기간
  avgSalaryChange: decimal("avg_salary_change"), // 평균 연봉 변화율
  
  // Popular trends
  topIndustries: jsonb("top_industries"), // 인기 업종 순위
  topPositions: jsonb("top_positions"), // 인기 직책 순위
  topSkills: jsonb("top_skills"), // 필요한 스킬 순위
  
  // Time period
  periodStart: timestamp("period_start"),
  periodEnd: timestamp("period_end"),
  
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

export const insertSeniorReemploymentDataSchema = createInsertSchema(seniorReemploymentData).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReemploymentStatisticsSchema = createInsertSchema(reemploymentStatistics).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Export types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  phone: z.string().optional(),
  userType: z.enum(['individual', 'company']),
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

// Job category insert schemas
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

// New types for reemployment data
export type SeniorReemploymentData = typeof seniorReemploymentData.$inferSelect;
export type ReemploymentStatistics = typeof reemploymentStatistics.$inferSelect;
export type InsertSeniorReemploymentData = z.infer<typeof insertSeniorReemploymentDataSchema>;
export type InsertReemploymentStatistics = z.infer<typeof insertReemploymentStatisticsSchema>;

// Job category types
export type JobCategory = typeof jobCategories.$inferSelect;
export type UserJobCategory = typeof userJobCategories.$inferSelect;
export type Company = typeof companies.$inferSelect;
export type InsertJobCategory = z.infer<typeof insertJobCategorySchema>;
export type InsertUserJobCategory = z.infer<typeof insertUserJobCategorySchema>;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
