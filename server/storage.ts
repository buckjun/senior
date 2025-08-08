import {
  users,
  userProfiles,
  individualProfiles,
  companyProfiles,
  jobPostings,
  jobApplications,
  savedJobs,
  aiRecommendations,
  educationPrograms,
  type User,
  type UpsertUser,
  type UserProfile,
  type IndividualProfile,
  type CompanyProfile,
  type JobPosting,
  type JobApplication,
  type SavedJob,
  type AiRecommendation,
  type EducationProgram,
  type InsertUserProfile,
  type InsertIndividualProfile,
  type InsertCompanyProfile,
  type InsertJobPosting,
  type InsertJobApplication,
  type InsertAiRecommendation,
  seniorReemploymentData,
  reemploymentStatistics,
  type SeniorReemploymentData,
  type ReemploymentStatistics,
  type InsertSeniorReemploymentData,
  type InsertReemploymentStatistics,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, like, or } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // User profile operations
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  updateUserProfile(userId: string, updates: Partial<InsertUserProfile>): Promise<UserProfile>;

  // Individual profile operations
  createIndividualProfile(profile: InsertIndividualProfile): Promise<IndividualProfile>;
  getIndividualProfile(userId: string): Promise<IndividualProfile | undefined>;
  updateIndividualProfile(userId: string, updates: Partial<InsertIndividualProfile>): Promise<IndividualProfile>;

  // Company profile operations
  createCompanyProfile(profile: InsertCompanyProfile): Promise<CompanyProfile>;
  getCompanyProfile(userId: string): Promise<CompanyProfile | undefined>;
  getCompanyProfileById(id: string): Promise<CompanyProfile | undefined>;
  updateCompanyProfile(userId: string, updates: Partial<InsertCompanyProfile>): Promise<CompanyProfile>;
  verifyCompany(businessNumber: string): Promise<boolean>;

  // Job posting operations
  createJobPosting(job: InsertJobPosting): Promise<JobPosting>;
  getJobPosting(id: string): Promise<JobPosting | undefined>;
  getJobPostingsByCompany(companyId: string): Promise<JobPosting[]>;
  updateJobPosting(id: string, updates: Partial<InsertJobPosting>): Promise<JobPosting>;
  searchJobPostings(query?: string, location?: string, jobType?: string): Promise<JobPosting[]>;
  getRecommendedJobs(userId: string): Promise<JobPosting[]>;

  // Job application operations
  createJobApplication(application: InsertJobApplication): Promise<JobApplication>;
  getJobApplicationsByJob(jobId: string): Promise<JobApplication[]>;
  getJobApplicationsByUser(applicantId: string): Promise<JobApplication[]>;
  updateJobApplicationStatus(id: string, status: string): Promise<JobApplication>;

  // Saved jobs operations
  saveJob(userId: string, jobId: string): Promise<SavedJob>;
  unsaveJob(userId: string, jobId: string): Promise<void>;
  getSavedJobs(userId: string): Promise<SavedJob[]>;

  // AI recommendations operations
  createAiRecommendation(recommendation: InsertAiRecommendation): Promise<AiRecommendation>;
  getAiRecommendationsByJob(jobId: string): Promise<AiRecommendation[]>;
  updateAiRecommendationStatus(id: string, status: string): Promise<AiRecommendation>;

  // Education programs operations
  getEducationPrograms(query?: string): Promise<EducationProgram[]>;
  
  // Senior reemployment data operations
  createSeniorReemploymentData(data: InsertSeniorReemploymentData): Promise<SeniorReemploymentData>;
  getSeniorReemploymentData(filters?: {
    age?: number;
    region?: string;
    industry?: string;
    limit?: number;
  }): Promise<SeniorReemploymentData[]>;
  createReemploymentStatistics(stats: InsertReemploymentStatistics): Promise<ReemploymentStatistics>;
  getReemploymentStatistics(category?: string): Promise<ReemploymentStatistics[]>;
  bulkCreateSeniorReemploymentData(dataArray: InsertSeniorReemploymentData[]): Promise<SeniorReemploymentData[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // User profile operations
  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const [userProfile] = await db
      .insert(userProfiles)
      .values(profile)
      .returning();
    return userProfile;
  }

  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId));
    return profile;
  }

  async updateUserProfile(userId: string, updates: Partial<InsertUserProfile>): Promise<UserProfile> {
    const [profile] = await db
      .update(userProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userProfiles.userId, userId))
      .returning();
    return profile;
  }

  // Individual profile operations
  async createIndividualProfile(profile: InsertIndividualProfile): Promise<IndividualProfile> {
    const [individualProfile] = await db
      .insert(individualProfiles)
      .values(profile)
      .returning();
    return individualProfile;
  }

  async getIndividualProfile(userId: string): Promise<IndividualProfile | undefined> {
    const [profile] = await db
      .select()
      .from(individualProfiles)
      .where(eq(individualProfiles.userId, userId));
    return profile;
  }

  async updateIndividualProfile(userId: string, updates: Partial<InsertIndividualProfile>): Promise<IndividualProfile> {
    const [profile] = await db
      .update(individualProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(individualProfiles.userId, userId))
      .returning();
    return profile;
  }

  // Company profile operations
  async createCompanyProfile(profile: InsertCompanyProfile): Promise<CompanyProfile> {
    const [companyProfile] = await db
      .insert(companyProfiles)
      .values(profile)
      .returning();
    return companyProfile;
  }

  async getCompanyProfile(userId: string): Promise<CompanyProfile | undefined> {
    const [profile] = await db
      .select()
      .from(companyProfiles)
      .where(eq(companyProfiles.userId, userId));
    return profile;
  }

  async getCompanyProfileById(id: string): Promise<CompanyProfile | undefined> {
    const [profile] = await db
      .select()
      .from(companyProfiles)
      .where(eq(companyProfiles.id, id));
    return profile;
  }

  async updateCompanyProfile(userId: string, updates: Partial<InsertCompanyProfile>): Promise<CompanyProfile> {
    const [profile] = await db
      .update(companyProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(companyProfiles.userId, userId))
      .returning();
    return profile;
  }

  async verifyCompany(businessNumber: string): Promise<boolean> {
    // This would integrate with Korean business registration API
    // For now, return true for any 10-digit number
    const cleanNumber = businessNumber.replace(/[^0-9]/g, '');
    return cleanNumber.length === 10;
  }

  // Job posting operations
  async createJobPosting(job: InsertJobPosting): Promise<JobPosting> {
    const [jobPosting] = await db
      .insert(jobPostings)
      .values(job)
      .returning();
    return jobPosting;
  }

  async getJobPosting(id: string): Promise<JobPosting | undefined> {
    const [job] = await db
      .select()
      .from(jobPostings)
      .where(eq(jobPostings.id, id));
    return job;
  }

  async getJobPostingsByCompany(companyId: string): Promise<JobPosting[]> {
    const jobs = await db
      .select()
      .from(jobPostings)
      .where(eq(jobPostings.companyId, companyId))
      .orderBy(desc(jobPostings.createdAt));
    return jobs;
  }

  async updateJobPosting(id: string, updates: Partial<InsertJobPosting>): Promise<JobPosting> {
    const [job] = await db
      .update(jobPostings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(jobPostings.id, id))
      .returning();
    return job;
  }

  async searchJobPostings(query?: string, location?: string, jobType?: string): Promise<JobPosting[]> {
    const conditions = [eq(jobPostings.status, 'active')];

    if (query) {
      conditions.push(
        or(
          like(jobPostings.title, `%${query}%`),
          like(jobPostings.description, `%${query}%`)
        )!
      );
    }

    if (location) {
      conditions.push(like(jobPostings.location, `%${location}%`));
    }

    const jobs = await db
      .select()
      .from(jobPostings)
      .where(and(...conditions))
      .orderBy(desc(jobPostings.createdAt))
      .limit(50);
    
    return jobs;
  }

  async getRecommendedJobs(userId: string): Promise<JobPosting[]> {
    // This would use AI matching logic
    // For now, return recent jobs that prefer seniors
    const jobs = await db
      .select()
      .from(jobPostings)
      .where(
        and(
          eq(jobPostings.status, 'active'),
          eq(jobPostings.prefersSeniors, true)
        )
      )
      .orderBy(desc(jobPostings.createdAt))
      .limit(10);
    
    return jobs;
  }

  // Job application operations
  async createJobApplication(application: InsertJobApplication): Promise<JobApplication> {
    const [jobApplication] = await db
      .insert(jobApplications)
      .values(application)
      .returning();
    
    // Update application count
    await db
      .update(jobPostings)
      .set({
        applicationCount: sql`${jobPostings.applicationCount} + 1`
      })
      .where(eq(jobPostings.id, application.jobId));
    
    return jobApplication;
  }

  async getJobApplicationsByJob(jobId: string): Promise<JobApplication[]> {
    const applications = await db
      .select()
      .from(jobApplications)
      .where(eq(jobApplications.jobId, jobId))
      .orderBy(desc(jobApplications.appliedAt));
    return applications;
  }

  async getJobApplicationsByUser(applicantId: string): Promise<JobApplication[]> {
    const applications = await db
      .select()
      .from(jobApplications)
      .where(eq(jobApplications.applicantId, applicantId))
      .orderBy(desc(jobApplications.appliedAt));
    return applications;
  }

  async updateJobApplicationStatus(id: string, status: string): Promise<JobApplication> {
    const [application] = await db
      .update(jobApplications)
      .set({ 
        status: status as any,
        respondedAt: new Date()
      })
      .where(eq(jobApplications.id, id))
      .returning();
    return application;
  }

  // Saved jobs operations
  async saveJob(userId: string, jobId: string): Promise<SavedJob> {
    const [savedJob] = await db
      .insert(savedJobs)
      .values({ userId, jobId })
      .onConflictDoNothing()
      .returning();
    return savedJob;
  }

  async unsaveJob(userId: string, jobId: string): Promise<void> {
    await db
      .delete(savedJobs)
      .where(
        and(
          eq(savedJobs.userId, userId),
          eq(savedJobs.jobId, jobId)
        )
      );
  }

  async getSavedJobs(userId: string): Promise<SavedJob[]> {
    const saved = await db
      .select()
      .from(savedJobs)
      .where(eq(savedJobs.userId, userId))
      .orderBy(desc(savedJobs.savedAt));
    return saved;
  }

  // AI recommendations operations
  async createAiRecommendation(recommendation: InsertAiRecommendation): Promise<AiRecommendation> {
    const [aiRecommendation] = await db
      .insert(aiRecommendations)
      .values(recommendation)
      .returning();
    return aiRecommendation;
  }

  async getAiRecommendationsByJob(jobId: string): Promise<AiRecommendation[]> {
    const recommendations = await db
      .select()
      .from(aiRecommendations)
      .where(eq(aiRecommendations.jobId, jobId))
      .orderBy(desc(aiRecommendations.matchingScore));
    return recommendations;
  }

  async updateAiRecommendationStatus(id: string, status: string): Promise<AiRecommendation> {
    const [recommendation] = await db
      .update(aiRecommendations)
      .set({ 
        status,
        updatedAt: new Date()
      })
      .where(eq(aiRecommendations.id, id))
      .returning();
    return recommendation;
  }

  // Education programs operations
  async getEducationPrograms(query?: string): Promise<EducationProgram[]> {
    const conditions = [eq(educationPrograms.isActive, true)];

    if (query) {
      conditions.push(
        or(
          like(educationPrograms.title, `%${query}%`),
          like(educationPrograms.description, `%${query}%`)
        )!
      );
    }

    const programs = await db
      .select()
      .from(educationPrograms)
      .where(and(...conditions))
      .orderBy(desc(educationPrograms.createdAt))
      .limit(20);
    
    return programs;
  }

  // Senior reemployment data operations
  async createSeniorReemploymentData(data: InsertSeniorReemploymentData): Promise<SeniorReemploymentData> {
    const [reemploymentData] = await db
      .insert(seniorReemploymentData)
      .values(data)
      .returning();
    return reemploymentData;
  }

  async getSeniorReemploymentData(filters?: {
    age?: number;
    region?: string;
    industry?: string;
    limit?: number;
  }): Promise<SeniorReemploymentData[]> {
    const conditions = [];

    if (filters?.age) {
      conditions.push(eq(seniorReemploymentData.age, filters.age));
    }

    if (filters?.region) {
      conditions.push(like(seniorReemploymentData.region, `%${filters.region}%`));
    }

    if (filters?.industry) {
      conditions.push(
        or(
          like(seniorReemploymentData.previousIndustry, `%${filters.industry}%`),
          like(seniorReemploymentData.newIndustry, `%${filters.industry}%`)
        )!
      );
    }

    let query = db.select().from(seniorReemploymentData);

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const data = await query
      .orderBy(desc(seniorReemploymentData.createdAt))
      .limit(filters?.limit || 100);

    return data;
  }

  async createReemploymentStatistics(stats: InsertReemploymentStatistics): Promise<ReemploymentStatistics> {
    const [statistics] = await db
      .insert(reemploymentStatistics)
      .values(stats)
      .returning();
    return statistics;
  }

  async getReemploymentStatistics(category?: string): Promise<ReemploymentStatistics[]> {
    let query = db.select().from(reemploymentStatistics);

    if (category) {
      query = query.where(eq(reemploymentStatistics.category, category)) as any;
    }

    const stats = await query
      .orderBy(desc(reemploymentStatistics.createdAt));

    return stats;
  }

  async bulkCreateSeniorReemploymentData(dataArray: InsertSeniorReemploymentData[]): Promise<SeniorReemploymentData[]> {
    if (dataArray.length === 0) return [];

    // Batch insert in chunks of 100 to avoid database limits
    const chunkSize = 100;
    const results: SeniorReemploymentData[] = [];

    for (let i = 0; i < dataArray.length; i += chunkSize) {
      const chunk = dataArray.slice(i, i + chunkSize);
      const chunkResults = await db
        .insert(seniorReemploymentData)
        .values(chunk)
        .returning();
      results.push(...chunkResults);
    }

    return results;
  }
}

export const storage = new DatabaseStorage();
