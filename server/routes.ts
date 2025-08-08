import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import { aiService } from "./aiService";
import { insertUserProfileSchema, insertIndividualProfileSchema, insertCompanyProfileSchema, insertJobPostingSchema, insertJobApplicationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const profile = await storage.getUserProfile(userId);
      
      res.json({
        ...user,
        profile
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User profile routes
  app.post('/api/profiles', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = insertUserProfileSchema.parse({
        ...req.body,
        userId
      });
      
      const profile = await storage.createUserProfile(profileData);
      res.json(profile);
    } catch (error) {
      console.error("Error creating user profile:", error);
      res.status(400).json({ message: "Failed to create profile" });
    }
  });

  app.put('/api/profiles', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updates = req.body;
      
      const profile = await storage.updateUserProfile(userId, updates);
      res.json(profile);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(400).json({ message: "Failed to update profile" });
    }
  });

  // Individual profile routes
  app.post('/api/individual-profiles', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = insertIndividualProfileSchema.parse({
        ...req.body,
        userId
      });
      
      const profile = await storage.createIndividualProfile(profileData);
      res.json(profile);
    } catch (error) {
      console.error("Error creating individual profile:", error);
      res.status(400).json({ message: "Failed to create individual profile" });
    }
  });

  app.get('/api/individual-profiles/me', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getIndividualProfile(userId);
      res.json(profile);
    } catch (error) {
      console.error("Error fetching individual profile:", error);
      res.status(500).json({ message: "Failed to fetch individual profile" });
    }
  });

  app.put('/api/individual-profiles', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updates = req.body;
      
      const profile = await storage.updateIndividualProfile(userId, updates);
      res.json(profile);
    } catch (error) {
      console.error("Error updating individual profile:", error);
      res.status(400).json({ message: "Failed to update individual profile" });
    }
  });

  // Company profile routes
  app.post('/api/company-profiles', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = insertCompanyProfileSchema.parse({
        ...req.body,
        userId
      });
      
      // Verify business registration number
      const isVerified = await storage.verifyCompany(profileData.businessNumber);
      profileData.isVerified = isVerified;
      
      const profile = await storage.createCompanyProfile(profileData);
      res.json(profile);
    } catch (error) {
      console.error("Error creating company profile:", error);
      res.status(400).json({ message: "Failed to create company profile" });
    }
  });

  app.get('/api/company-profiles/me', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getCompanyProfile(userId);
      res.json(profile);
    } catch (error) {
      console.error("Error fetching company profile:", error);
      res.status(500).json({ message: "Failed to fetch company profile" });
    }
  });

  app.put('/api/company-profiles', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updates = req.body;
      
      const profile = await storage.updateCompanyProfile(userId, updates);
      res.json(profile);
    } catch (error) {
      console.error("Error updating company profile:", error);
      res.status(400).json({ message: "Failed to update company profile" });
    }
  });

  // Business verification route
  app.post('/api/verify-business', isAuthenticated, async (req, res) => {
    try {
      const { businessNumber } = req.body;
      const isVerified = await storage.verifyCompany(businessNumber);
      res.json({ isVerified });
    } catch (error) {
      console.error("Error verifying business:", error);
      res.status(500).json({ message: "Failed to verify business" });
    }
  });

  // AI analysis routes
  app.post('/api/ai/analyze-career', isAuthenticated, async (req, res) => {
    try {
      const { careerText, resumeText } = req.body;
      const analysis = await aiService.analyzeCareerProfile(careerText, resumeText);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing career:", error);
      res.status(500).json({ message: "Failed to analyze career" });
    }
  });

  app.post('/api/ai/analyze-resume-image', isAuthenticated, async (req, res) => {
    try {
      const { base64Image } = req.body;
      const extractedText = await aiService.analyzeResumeImage(base64Image);
      const analysis = await aiService.analyzeCareerProfile(extractedText);
      res.json({ extractedText, analysis });
    } catch (error) {
      console.error("Error analyzing resume image:", error);
      res.status(500).json({ message: "Failed to analyze resume image" });
    }
  });

  app.post('/api/ai/process-voice', isAuthenticated, async (req, res) => {
    try {
      const { transcript } = req.body;
      const processedText = await aiService.processVoiceTranscript(transcript);
      const analysis = await aiService.analyzeCareerProfile(processedText);
      res.json({ processedText, analysis });
    } catch (error) {
      console.error("Error processing voice:", error);
      res.status(500).json({ message: "Failed to process voice input" });
    }
  });

  // Job posting routes
  app.post('/api/jobs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const companyProfile = await storage.getCompanyProfile(userId);
      
      if (!companyProfile) {
        return res.status(400).json({ message: "Company profile required" });
      }

      const jobData = insertJobPostingSchema.parse({
        ...req.body,
        companyId: companyProfile.id
      });
      
      const job = await storage.createJobPosting(jobData);
      res.json(job);
    } catch (error) {
      console.error("Error creating job posting:", error);
      res.status(400).json({ message: "Failed to create job posting" });
    }
  });

  app.get('/api/jobs', async (req, res) => {
    try {
      const { q: query, location, jobType } = req.query;
      const jobs = await storage.searchJobPostings(
        query as string, 
        location as string, 
        jobType as string
      );
      res.json(jobs);
    } catch (error) {
      console.error("Error searching jobs:", error);
      res.status(500).json({ message: "Failed to search jobs" });
    }
  });

  app.get('/api/jobs/recommended', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const jobs = await storage.getRecommendedJobs(userId);
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching recommended jobs:", error);
      res.status(500).json({ message: "Failed to fetch recommended jobs" });
    }
  });

  app.get('/api/jobs/my', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const companyProfile = await storage.getCompanyProfile(userId);
      
      if (!companyProfile) {
        return res.json([]);
      }

      const jobs = await storage.getJobPostingsByCompany(companyProfile.id);
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching company jobs:", error);
      res.status(500).json({ message: "Failed to fetch company jobs" });
    }
  });

  app.get('/api/jobs/:id', async (req, res) => {
    try {
      const job = await storage.getJobPosting(req.params.id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      console.error("Error fetching job:", error);
      res.status(500).json({ message: "Failed to fetch job" });
    }
  });

  app.put('/api/jobs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const companyProfile = await storage.getCompanyProfile(userId);
      const job = await storage.getJobPosting(req.params.id);
      
      if (!job || job.companyId !== companyProfile?.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const updates = req.body;
      const updatedJob = await storage.updateJobPosting(req.params.id, updates);
      res.json(updatedJob);
    } catch (error) {
      console.error("Error updating job:", error);
      res.status(400).json({ message: "Failed to update job" });
    }
  });

  // Job application routes
  app.post('/api/jobs/:jobId/apply', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const individualProfile = await storage.getIndividualProfile(userId);
      
      if (!individualProfile) {
        return res.status(400).json({ message: "Individual profile required" });
      }

      const job = await storage.getJobPosting(req.params.jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      // Calculate AI matching score
      const aiMatch = await aiService.calculateJobMatch(individualProfile, job);

      const applicationData = insertJobApplicationSchema.parse({
        jobId: req.params.jobId,
        applicantId: individualProfile.id,
        coverLetter: req.body.coverLetter,
        matchingScore: aiMatch.matchingScore.toString()
      });
      
      const application = await storage.createJobApplication(applicationData);
      res.json({ ...application, aiMatch });
    } catch (error) {
      console.error("Error creating job application:", error);
      res.status(400).json({ message: "Failed to apply for job" });
    }
  });

  app.get('/api/jobs/:jobId/applications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const companyProfile = await storage.getCompanyProfile(userId);
      const job = await storage.getJobPosting(req.params.jobId);
      
      if (!job || job.companyId !== companyProfile?.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const applications = await storage.getJobApplicationsByJob(req.params.jobId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching job applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.get('/api/applications/my', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const individualProfile = await storage.getIndividualProfile(userId);
      
      if (!individualProfile) {
        return res.json([]);
      }

      const applications = await storage.getJobApplicationsByUser(individualProfile.id);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching user applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  // Saved jobs routes
  app.post('/api/jobs/:jobId/save', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const savedJob = await storage.saveJob(userId, req.params.jobId);
      res.json(savedJob);
    } catch (error) {
      console.error("Error saving job:", error);
      res.status(400).json({ message: "Failed to save job" });
    }
  });

  app.delete('/api/jobs/:jobId/save', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.unsaveJob(userId, req.params.jobId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error unsaving job:", error);
      res.status(400).json({ message: "Failed to unsave job" });
    }
  });

  app.get('/api/saved-jobs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const savedJobs = await storage.getSavedJobs(userId);
      res.json(savedJobs);
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
      res.status(500).json({ message: "Failed to fetch saved jobs" });
    }
  });

  // AI recommendations routes
  app.get('/api/jobs/:jobId/ai-recommendations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const companyProfile = await storage.getCompanyProfile(userId);
      const job = await storage.getJobPosting(req.params.jobId);
      
      if (!job || job.companyId !== companyProfile?.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const recommendations = await storage.getAiRecommendationsByJob(req.params.jobId);
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching AI recommendations:", error);
      res.status(500).json({ message: "Failed to fetch AI recommendations" });
    }
  });

  // Education programs routes
  app.get('/api/education-programs', async (req, res) => {
    try {
      const { q: query } = req.query;
      const programs = await storage.getEducationPrograms(query as string);
      res.json(programs);
    } catch (error) {
      console.error("Error fetching education programs:", error);
      res.status(500).json({ message: "Failed to fetch education programs" });
    }
  });

  // Object storage routes for file uploads
  app.get("/objects/:objectPath(*)", isAuthenticated, async (req: any, res) => {
    const userId = req.user?.claims?.sub;
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
        requestedPermission: ObjectPermission.READ,
      });
      if (!canAccess) {
        return res.sendStatus(401);
      }
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.post("/api/objects/upload", isAuthenticated, async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    res.json({ uploadURL });
  });

  app.put("/api/resume-files", isAuthenticated, async (req: any, res) => {
    if (!req.body.resumeFileURL) {
      return res.status(400).json({ error: "resumeFileURL is required" });
    }

    const userId = req.user?.claims?.sub;

    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.resumeFileURL,
        {
          owner: userId,
          visibility: "private",
        },
      );

      // Update individual profile with resume file URL
      await storage.updateIndividualProfile(userId, {
        resumeFileUrl: objectPath
      });

      res.status(200).json({
        objectPath: objectPath,
      });
    } catch (error) {
      console.error("Error setting resume file:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
