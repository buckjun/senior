import {
  users,
  individualProfiles,
  companyProfiles,
  jobCategories,
  userJobCategories,
  companies,
  type User,
  type IndividualProfile,
  type CompanyProfile,
  type JobCategory,
  type UserJobCategory,
  type Company,
  type UpsertUser,
  type InsertIndividualProfile,
  type InsertCompanyProfile,
  type InsertJobCategory,
  type InsertUserJobCategory,
  type InsertCompany,
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

export interface IStorage {
  // User operations (for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Individual profile operations
  getIndividualProfile(userId: string): Promise<IndividualProfile | undefined>;
  createIndividualProfile(profile: InsertIndividualProfile): Promise<IndividualProfile>;
  updateIndividualProfile(userId: string, updates: Partial<InsertIndividualProfile>): Promise<IndividualProfile>;

  // Company operations
  getCompanyProfile(userId: string): Promise<CompanyProfile | undefined>;
  createCompanyProfile(profile: InsertCompanyProfile): Promise<CompanyProfile>;

  // Job category operations
  getAllJobCategories(): Promise<JobCategory[]>;
  getUserJobCategories(userId: string): Promise<UserJobCategory[]>;
  addUserJobCategory(data: InsertUserJobCategory): Promise<UserJobCategory>;
  removeUserJobCategory(userId: string, categoryId: string): Promise<void>;

  // Company recommendations
  getCompanyRecommendations(userId: string): Promise<Company[]>;

  sessionStore: session.SessionStore;
}

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true 
    });
  }

  // User operations (for Replit Auth)
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

  // Individual profile operations
  async getIndividualProfile(userId: string): Promise<IndividualProfile | undefined> {
    const [profile] = await db.select().from(individualProfiles).where(eq(individualProfiles.userId, userId));
    return profile;
  }

  async createIndividualProfile(profileData: InsertIndividualProfile): Promise<IndividualProfile> {
    const [profile] = await db
      .insert(individualProfiles)
      .values(profileData)
      .returning();
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

  // Company operations
  async getCompanyProfile(userId: string): Promise<CompanyProfile | undefined> {
    const [profile] = await db.select().from(companyProfiles).where(eq(companyProfiles.userId, userId));
    return profile;
  }

  async createCompanyProfile(profileData: InsertCompanyProfile): Promise<CompanyProfile> {
    const [profile] = await db
      .insert(companyProfiles)
      .values(profileData)
      .returning();
    return profile;
  }

  // Job category operations
  async getAllJobCategories(): Promise<JobCategory[]> {
    return await db.select().from(jobCategories);
  }

  async getUserJobCategories(userId: string): Promise<UserJobCategory[]> {
    return await db.select().from(userJobCategories).where(eq(userJobCategories.userId, userId));
  }

  async addUserJobCategory(data: InsertUserJobCategory): Promise<UserJobCategory> {
    const [category] = await db
      .insert(userJobCategories)
      .values(data)
      .returning();
    return category;
  }

  async removeUserJobCategory(userId: string, categoryId: string): Promise<void> {
    await db
      .delete(userJobCategories)
      .where(eq(userJobCategories.userId, userId))
      .where(eq(userJobCategories.categoryId, categoryId));
  }

  // Company recommendations
  async getCompanyRecommendations(userId: string): Promise<Company[]> {
    // Simple implementation - in real app would use AI matching
    return await db.select().from(companies).limit(10);
  }
}

export const storage = new DatabaseStorage();