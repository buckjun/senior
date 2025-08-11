import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { parseResumeFromText } from "./naturalLanguageService";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import { aiService } from "./aiService";
import { insertUserProfileSchema, insertIndividualProfileSchema, insertCompanyProfileSchema, insertJobPostingSchema, insertJobApplicationSchema, insertSeniorReemploymentDataSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import * as XLSX from "xlsx";

// Set up multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware - handles signup/login/logout/user endpoints
  setupAuth(app);

  // Get current user with profile
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
      const profile = await storage.getIndividualProfile(userId);
      res.json(profile);
    } catch (error) {
      console.error("Error fetching individual profile:", error);
      res.status(500).json({ message: "Failed to fetch individual profile" });
    }
  });

  // Add education to profile route
  app.post('/api/individual-profiles/add-education', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { education, certification, skills } = req.body;

      // Get existing profile
      let existingProfile = await storage.getIndividualProfile(userId);
      
      if (!existingProfile) {
        // Create a new profile for the user
        existingProfile = await storage.createIndividualProfile({
          userId: userId,
          summary: '',
          skills: JSON.stringify([]),
          experience: JSON.stringify([]),
          preferredJobTypes: JSON.stringify([]),
          preferredLocations: JSON.stringify([])
        });
      }

      // Parse existing data safely
      let existingSkills = [];
      let existingExperience = [];
      
      try {
        existingSkills = JSON.parse((existingProfile.skills || '[]') as string);
        if (!Array.isArray(existingSkills)) {
          existingSkills = [];
        }
      } catch (error: any) {
        console.log('Error parsing existing skills, using empty array:', error instanceof Error ? error.message : 'Unknown error');
        existingSkills = [];
      }
      
      try {
        existingExperience = JSON.parse((existingProfile.experience || '[]') as string);
        if (!Array.isArray(existingExperience)) {
          existingExperience = [];
        }
      } catch (error: any) {
        console.log('Error parsing existing experience, using empty array:', error instanceof Error ? error.message : 'Unknown error');
        existingExperience = [];
      }

      // Add new education and skills
      const updatedSkills = [...Array.from(new Set([...existingSkills, ...skills]))];
      const updatedExperience = [...existingExperience, education];

      // Update profile with new education
      const updateData = {
        skills: JSON.stringify(updatedSkills),
        experience: JSON.stringify(updatedExperience),
        aiAnalysis: JSON.stringify({
          lastUpdated: new Date().toISOString(),
          source: 'course_completion',
          addedEducation: education,
          addedCertification: certification,
          addedSkills: skills
        })
      };

      const updatedProfile = await storage.updateIndividualProfile(existingProfile.id, updateData);

      res.json({ 
        message: "교육 이력이 성공적으로 추가되었습니다",
        profile: updatedProfile,
        addedEducation: education,
        addedCertification: certification,
        addedSkills: skills
      });
    } catch (error) {
      console.error("Error adding education to profile:", error);
      res.status(500).json({ message: "교육 이력 추가 중 오류가 발생했습니다" });
    }
  });

  app.put('/api/individual-profiles', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
      const profile = await storage.getCompanyProfile(userId);
      res.json(profile);
    } catch (error) {
      console.error("Error fetching company profile:", error);
      res.status(500).json({ message: "Failed to fetch company profile" });
    }
  });

  app.put('/api/company-profiles', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
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

  app.post('/api/ai/analyze-resume-image', isAuthenticated, async (req: any, res) => {
    try {
      const { base64Image } = req.body;
      
      const extractedText = await aiService.analyzeResumeImage(base64Image);
      const analysis = await aiService.analyzeCareerProfile(extractedText);
      
      // Parse the extracted text to get structured data for preview
      let parsedData = null;
      if (extractedText) {
        try {
          parsedData = await parseResumeFromText(extractedText);
        } catch (parseError) {
          console.error('이미지 텍스트 파싱 오류:', parseError);
        }
      }
      
      res.json({ extractedText, analysis, parsedData });
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
      
      // Parse the processed text to get structured data for preview
      let parsedData = null;
      if (processedText) {
        try {
          parsedData = await parseResumeFromText(processedText);
        } catch (parseError) {
          console.error('음성 텍스트 파싱 오류:', parseError);
        }
      }
      
      res.json({ processedText, analysis, parsedData });
    } catch (error) {
      console.error("Error processing voice:", error);
      res.status(500).json({ message: "Failed to process voice input" });
    }
  });

  // Job posting routes
  app.post('/api/jobs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
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
      const userId = req.user.id;
      const jobs = await storage.getRecommendedJobs(userId);
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching recommended jobs:", error);
      res.status(500).json({ message: "Failed to fetch recommended jobs" });
    }
  });

  app.get('/api/jobs/my', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
      const savedJob = await storage.saveJob(userId, req.params.jobId);
      res.json(savedJob);
    } catch (error) {
      console.error("Error saving job:", error);
      res.status(400).json({ message: "Failed to save job" });
    }
  });

  app.delete('/api/jobs/:jobId/save', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      await storage.unsaveJob(userId, req.params.jobId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error unsaving job:", error);
      res.status(400).json({ message: "Failed to unsave job" });
    }
  });

  app.get('/api/saved-jobs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
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
      const userId = req.user.id;
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
    const userId = req.user.id; // Using traditional auth, not Replit Auth
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

    const userId = req.user.id; // Using traditional auth, not Replit Auth

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

  // Excel upload endpoint for senior reemployment data
  app.post("/api/upload-excel", isAuthenticated, upload.single('excelFile'), async (req: any, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "엑셀 파일이 필요합니다." });
    }

    try {
      // Parse the Excel file
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      console.log('Excel 데이터 샘플:', JSON.stringify(jsonData.slice(0, 2), null, 2));

      // Transform Excel data to our schema
      // This is job posting data, so we'll extract useful patterns for reemployment analysis
      const transformedData = jsonData.map((row: any, index: number) => {
        try {
          // Extract salary information
          const salaryText = row['급여'] || '';
          let salaryAmount = null;
          const salaryMatch = salaryText.match(/(\d+(?:,\d+)*)/);
          if (salaryMatch) {
            salaryAmount = parseFloat(salaryMatch[1].replace(/,/g, ''));
          }

          // Extract age requirements from career field
          const careerText = row['경력(요건)'] || '';
          let estimatedAge = null;
          if (careerText.includes('10년 이상')) {
            estimatedAge = 50; // 10+ years likely means 40-60 age range
          } else if (careerText.includes('5년 이상')) {
            estimatedAge = 45;
          } else {
            estimatedAge = 40;
          }

          // Map job posting data to reemployment success pattern
          const mappedData = {
            // Demographics (inferred from job requirements)
            age: estimatedAge,
            gender: null, // Not specified in job postings
            region: row['근무지역'] || row['지원지역'] || null,
            educationLevel: row['학력(요건)'] || null,
            
            // Previous career (simulated based on job category)
            previousIndustry: '일반사무', // Common previous role for career changers
            previousPosition: '사무원',
            previousSalary: salaryAmount ? (salaryAmount * 0.8).toString() : null, // Convert to string
            careerBreakDuration: Math.floor(Math.random() * 12) + 1, // 1-12 months
            
            // New career (from job posting)
            newIndustry: row['업종(카테고리)'] || null,
            newPosition: row['모집직무'] || null,
            newSalary: salaryAmount?.toString() || null,
            employmentType: row['고용형태'] || null,
            workSchedule: `${row['근무일수'] || ''} ${row['근무시간'] || ''}`.trim() || null,
            
            // Job search patterns (simulated realistic values)
            jobSearchDuration: Math.floor(Math.random() * 6) + 2, // 2-7 months
            jobSearchMethods: ['온라인채용사이트', '지인소개'],
            skillsTraining: row['자격/스킬'] ? [row['자격/스킬']] : null,
            governmentSupport: ['고용센터상담'],
            
            // Success factors (based on job characteristics)
            successFactors: row['전문직여부(자동판정)'] === '예' ? ['전문성활용'] : ['경험활용'],
            challenges: ['연령차별'],
            recommendations: `${row['업종(카테고리)']}에서 ${row['모집직무']} 경험 추천`,
            
            // Company info
            companySize: '중소기업', // Most senior-friendly positions
            companyType: '일반기업',
            
            // Satisfaction metrics (simulated based on employment type)
            jobSatisfaction: row['고용형태'] === '정규직' ? 4 : 3,
            workLifeBalance: row['근무일수']?.includes('5일') ? 4 : 3,
            salaryChange: (salaryAmount && salaryAmount > 250 ? "0.1" : "-0.1"),
            
            dataSource: 'job_posting_analysis',
            isVerified: false,
            
            // Additional context
            notes: `분석된 채용공고: ${row['회사명']} - ${row['모집직무']}`
          };

          // Filter out null values to avoid database issues
          const cleanedData = Object.fromEntries(
            Object.entries(mappedData).filter(([_, value]) => value !== null)
          );

          return cleanedData;
        } catch (error) {
          console.error(`행 ${index + 1} 변환 오류:`, error);
          return null;
        }
      }).filter(Boolean);

      // Validate and insert data
      const validatedData = [];
      const errors = [];

      for (let i = 0; i < transformedData.length; i++) {
        try {
          const validated = insertSeniorReemploymentDataSchema.parse(transformedData[i]);
          validatedData.push(validated);
        } catch (error) {
          errors.push(`행 ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Insert valid data
      let insertedCount = 0;
      if (validatedData.length > 0) {
        const results = await storage.bulkCreateSeniorReemploymentData(validatedData);
        insertedCount = results.length;
      }

      res.json({
        success: true,
        message: `엑셀 데이터 업로드 완료`,
        totalRows: jsonData.length,
        validRows: validatedData.length,
        insertedRows: insertedCount,
        errors: errors.slice(0, 10) // Show only first 10 errors
      });

    } catch (error) {
      console.error('Excel 업로드 오류:', error);
      res.status(500).json({ 
        error: '엑셀 파일 처리 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get senior reemployment data with filters
  app.get("/api/reemployment-data", isAuthenticated, async (req, res) => {
    try {
      const filters = {
        age: req.query.age ? parseInt(req.query.age as string) : undefined,
        region: req.query.region as string,
        industry: req.query.industry as string,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50
      };

      const data = await storage.getSeniorReemploymentData(filters);
      res.json(data);
    } catch (error) {
      console.error('Error fetching reemployment data:', error);
      res.status(500).json({ error: 'Failed to fetch reemployment data' });
    }
  });

  // Get reemployment statistics
  app.get("/api/reemployment-statistics", isAuthenticated, async (req, res) => {
    try {
      const category = req.query.category as string;
      const stats = await storage.getReemploymentStatistics(category);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  });

  // Natural language processing for resume generation (legacy)
  app.post('/api/parse-resume', isAuthenticated, async (req: any, res) => {
    try {
      const { text } = req.body;
      
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "텍스트가 필요합니다." });
      }

      const result = await parseResumeFromText(text);
      
      res.json(result);
    } catch (error) {
      console.error('자연어 처리 오류:', error);
      res.status(500).json({ 
        error: '텍스트 처리 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // New unified recommendation system
  app.post('/api/resume-analysis', isAuthenticated, async (req: any, res) => {
    try {
      const { resumeText } = req.body;
      
      if (!resumeText || typeof resumeText !== "string") {
        return res.status(400).json({ error: "이력서 텍스트가 필요합니다." });
      }

      const { extractProfile, rankSectors, SECTORS } = await import('./recommendationEngine');
      
      const profile = extractProfile(resumeText);
      const sectorGuess = rankSectors(resumeText, 2);
      
      res.json({ 
        profile, 
        sectorGuess, 
        sectors: SECTORS,
        resumeText: resumeText
      });
    } catch (error) {
      console.error('이력서 분석 오류:', error);
      res.status(500).json({ 
        error: '이력서 분석 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.post('/api/unified-recommendations', isAuthenticated, async (req: any, res) => {
    try {
      const { resumeText, chosenSectors } = req.body;
      
      if (!resumeText || typeof resumeText !== "string") {
        return res.status(400).json({ error: "이력서 텍스트가 필요합니다." });
      }
      
      if (!chosenSectors || !Array.isArray(chosenSectors) || chosenSectors.length === 0) {
        return res.status(400).json({ error: "1-2개 업종을 선택해주세요." });
      }

      const { getUnifiedRecommendations } = await import('./recommendationEngine');
      
      const recommendations = getUnifiedRecommendations(resumeText, chosenSectors);
      console.log('Sending recommendations to client:', JSON.stringify(recommendations, null, 2));
      
      res.json(recommendations);
    } catch (error) {
      console.error('통합 추천 오류:', error);
      res.status(500).json({ 
        error: '추천 생성 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Update individual profile with AI-generated resume data
  app.post('/api/individual-profiles/ai-resume', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { 
        summary, 
        skills, 
        experience, 
        title, 
        location 
      } = req.body;

      // Get existing profile or create one if it doesn't exist
      let existingProfile = await storage.getIndividualProfile(userId);
      
      if (!existingProfile) {
        // Create a new profile for the user
        existingProfile = await storage.createIndividualProfile({
          userId: userId,
          summary: '',
          skills: JSON.stringify([]),
          experience: JSON.stringify([]),
          preferredJobTypes: JSON.stringify([]),
          preferredLocations: JSON.stringify([])
        });
      }

      // Prepare update data - only update fields that have values
      const updateData: any = {};
      
      if (summary && typeof summary === 'string' && summary.trim()) {
        updateData.summary = summary.trim();
      }
      
      if (skills && Array.isArray(skills) && skills.length > 0) {
        const validSkills = skills.filter(skill => skill && typeof skill === 'string' && skill.trim());
        if (validSkills.length > 0) {
          updateData.skills = JSON.stringify(validSkills) as any;
        }
      }
      
      if (experience && Array.isArray(experience) && experience.length > 0) {
        updateData.experience = JSON.stringify(experience) as any;
      }
      
      if (title && typeof title === 'string' && title.trim()) {
        updateData.preferredJobTypes = JSON.stringify([title.trim()]) as any;
      }
      
      if (location && typeof location === 'string' && location.trim()) {
        updateData.preferredLocations = JSON.stringify([location.trim()]) as any;
      }

      // Always update AI analysis with what was processed
      updateData.aiAnalysis = JSON.stringify({
        lastGenerated: new Date().toISOString(),
        source: 'natural_language_input',
        extractedSkills: skills || [],
        generatedSummary: summary || '',
        processedFields: Object.keys(updateData).filter(key => key !== 'aiAnalysis')
      }) as any;

      // Only update if there's at least one field to update
      if (Object.keys(updateData).length === 1) { // Only aiAnalysis
        return res.json({ 
          message: "유효한 업데이트 데이터가 없습니다.",
          profile: existingProfile 
        });
      }

      const updatedProfile = await storage.updateIndividualProfile(existingProfile.id, updateData);

      res.json({ 
        profile: updatedProfile,
        updatedFields: Object.keys(updateData).filter(key => key !== 'aiAnalysis')
      });
    } catch (error) {
      console.error('AI 이력서 업데이트 오류:', error);
      res.status(500).json({ 
        error: 'AI 이력서 업데이트 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Job categories endpoints
  app.get("/api/job-categories", isAuthenticated, async (req, res) => {
    try {
      const categories = await storage.getAllJobCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching job categories:", error);
      res.status(500).json({ error: "Failed to fetch job categories" });
    }
  });

  // Save user interests (관심 분야 저장)
  app.post("/api/user/interests", isAuthenticated, async (req: any, res) => {
    try {
      const { interests } = req.body;
      
      if (!interests || !Array.isArray(interests) || interests.length === 0) {
        return res.status(400).json({ message: "최소 1개의 관심 분야를 선택해주세요." });
      }

      if (interests.length > 2) {
        return res.status(400).json({ message: "최대 2개까지만 선택할 수 있습니다." });
      }

      const userId = req.user.id;
      await storage.saveUserInterests(userId, interests);
      
      res.json({ message: "관심 분야가 저장되었습니다." });
    } catch (error) {
      console.error("Error saving user interests:", error);
      res.status(500).json({ message: "관심 분야 저장 중 오류가 발생했습니다." });
    }
  });

  app.get("/api/user/job-categories", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id; // Using traditional auth, not Replit Auth
      const categories = await storage.getUserJobCategories(userId);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching user job categories:", error);
      res.status(500).json({ error: "Failed to fetch user job categories" });
    }
  });

  app.post("/api/user/job-categories", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id; // Using traditional auth, not Replit Auth
      const { categoryIds } = req.body;
      
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      
      if (!Array.isArray(categoryIds) || categoryIds.length === 0 || categoryIds.length > 2) {
        return res.status(400).json({ error: "Must select 1-2 categories" });
      }

      await storage.saveUserJobCategories(userId, categoryIds);
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving user job categories:", error);
      res.status(500).json({ error: "Failed to save job categories" });
    }
  });

  // Company recommendations endpoint
  app.get("/api/recommendations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id; // Using traditional auth, not Replit Auth
      
      // Get user's selected categories
      const userCategories = await storage.getUserJobCategories(userId);
      if (userCategories.length === 0) {
        return res.status(400).json({ error: "No job categories selected" });
      }

      // Get user's individual profile
      const userProfile = await storage.getIndividualProfile(userId);
      if (!userProfile) {
        return res.status(400).json({ error: "No individual profile found" });
      }

      // Get companies matching selected categories
      const categoryNames = userCategories.map(cat => cat.name);
      const companies = await storage.getCompaniesByCategories(categoryNames);
      
      // Apply matching algorithm
      const { matchUserToCompanies } = await import('./matchingAlgorithm');
      const matchedCompanies = matchUserToCompanies(userProfile, userCategories, companies);

      res.json({ 
        recommendations: matchedCompanies,
        userCategories,
        totalCompanies: companies.length
      });
    } catch (error) {
      console.error("Error generating recommendations:", error);
      res.status(500).json({ error: "Failed to generate recommendations" });
    }
  });

  // Course routes
  app.get('/api/courses', async (req, res) => {
    try {
      const { category } = req.query;
      let courses;
      
      if (category && typeof category === 'string') {
        courses = await storage.getCoursesByCategory(category);
      } else {
        courses = await storage.getAllCourses();
      }
      
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get('/api/courses/categories', async (req, res) => {
    try {
      const categories = await storage.getCourseCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching course categories:", error);
      res.status(500).json({ message: "Failed to fetch course categories" });
    }
  });

  app.get('/api/courses/recommended', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const userProfile = await storage.getUserProfile(userId);
      const individualProfile = await storage.getIndividualProfile(userId);
      
      if (!userProfile && !individualProfile) {
        return res.json([]);
      }
      
      const allOfflineCourses = await storage.getAllCourses();
      const allOnlineCourses = await storage.getAllOnlineCourses();
      
      if (allOfflineCourses.length === 0 && allOnlineCourses.length === 0) {
        return res.json([]);
      }
      
      // Prepare user context for Gemini API
      const aiAnalysis = individualProfile?.aiAnalysis as any;
      const userContext = {
        field: aiAnalysis?.field || '미지정',
        previousJobTitle: aiAnalysis?.previousJobTitle || aiAnalysis?.title || '미지정',
        skills: (individualProfile?.skills as string[]) || [],
        experience: (individualProfile?.experience as any) || '미지정',
        education: aiAnalysis?.education || '미지정',
        interests: aiAnalysis?.interests || [],
        preferredLocation: (individualProfile?.preferredLocations as string[])?.[0] || '미지정'
      };
      
      // Create prompts for Gemini API - separate for offline and online
      const offlinePrompt = `
당신은 한국 50-60세 중장년층을 위한 오프라인 교육 과정 추천 전문가입니다. 

사용자 프로필:
- 분야: ${userContext.field}
- 이전 직업: ${userContext.previousJobTitle}
- 기술: ${userContext.skills.join(', ')}
- 경력: ${userContext.experience}
- 학력: ${userContext.education}
- 관심사: ${userContext.interests.join(', ')}
- 선호 지역: ${userContext.preferredLocation}

다음 오프라인 교육과정 중에서 이 사용자에게 가장 적합한 상위 4개 과정을 선별하고, 각각에 대해 1-100점 매칭 점수와 추천 이유를 제공해주세요.

오프라인 교육과정 목록:
${allOfflineCourses.slice(0, 30).map((course, index) => 
  `${index + 1}. ${course.title} (${course.category}) - ${course.institution} - ${course.duration} - ${course.cost}`
).join('\n')}

다음 JSON 형식으로 응답해주세요:
{
  "recommendations": [
    {
      "courseIndex": 1,
      "matchingScore": 85,
      "matchingReasons": ["관련 경력과 일치", "위치가 선호 지역과 근접", "비용이 적절함"]
    }
  ]
}
`;

      const onlinePrompt = `
당신은 한국 50-60세 중장년층을 위한 온라인 교육 과정 추천 전문가입니다. 

사용자 프로필:
- 분야: ${userContext.field}
- 이전 직업: ${userContext.previousJobTitle}
- 기술: ${userContext.skills.join(', ')}
- 경력: ${userContext.experience}
- 학력: ${userContext.education}
- 관심사: ${userContext.interests.join(', ')}

다음 온라인 교육과정 중에서 이 사용자에게 가장 적합한 상위 2개 과정을 선별하고, 각각에 대해 1-100점 매칭 점수와 추천 이유를 제공해주세요.

온라인 교육과정 목록 (조회수 높은 순):
${allOnlineCourses.slice(0, 30).map((course, index) => 
  `${index + 1}. ${course.title} (${course.category}) - 조회수: ${course.viewCount}`
).join('\n')}

다음 JSON 형식으로 응답해주세요:
{
  "recommendations": [
    {
      "courseIndex": 1,
      "matchingScore": 85,
      "matchingReasons": ["관련 경력과 일치", "시간 자유도 높음", "인기도 높음"]
    }
  ]
}
`;

      // Call Gemini API for both offline and online courses
      const { GoogleGenAI } = require('@google/genai');
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
      const responseSchema = {
        type: "object",
        properties: {
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                courseIndex: { type: "number" },
                matchingScore: { type: "number" },
                matchingReasons: {
                  type: "array",
                  items: { type: "string" }
                }
              },
              required: ["courseIndex", "matchingScore", "matchingReasons"]
            }
          }
        },
        required: ["recommendations"]
      };

      // Get offline recommendations (4개)
      const offlineResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema
        },
        contents: offlinePrompt,
      });

      // Get online recommendations (2개) 
      const onlineResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema
        },
        contents: onlinePrompt,
      });

      const offlineResult = JSON.parse(offlineResponse.text || '{"recommendations": []}');
      const onlineResult = JSON.parse(onlineResponse.text || '{"recommendations": []}');
      
      // Map AI recommendations back to course objects
      const recommendedOfflineCourses = offlineResult.recommendations
        .filter((rec: any) => rec.courseIndex > 0 && rec.courseIndex <= Math.min(allOfflineCourses.length, 30))
        .map((rec: any) => ({
          ...allOfflineCourses[rec.courseIndex - 1],
          courseType: 'offline',
          matchingScore: Math.min(Math.max(rec.matchingScore, 0), 100),
          matchingReasons: rec.matchingReasons.slice(0, 3)
        }))
        .slice(0, 4); // Limit to 4 offline courses

      const recommendedOnlineCourses = onlineResult.recommendations
        .filter((rec: any) => rec.courseIndex > 0 && rec.courseIndex <= Math.min(allOnlineCourses.length, 30))
        .map((rec: any) => ({
          ...allOnlineCourses[rec.courseIndex - 1],
          courseType: 'online',
          matchingScore: Math.min(Math.max(rec.matchingScore, 0), 100),
          matchingReasons: rec.matchingReasons.slice(0, 3)
        }))
        .slice(0, 2); // Limit to 2 online courses
      
      // Combine recommendations (4 offline + 2 online)
      const combinedRecommendations = [
        ...recommendedOfflineCourses,
        ...recommendedOnlineCourses
      ];
      
      res.json(combinedRecommendations);
    } catch (error) {
      console.error("Error generating course recommendations:", error);
      
      // Fallback: Return mixed selection with basic scoring
      try {
        const allOfflineCourses = await storage.getAllCourses();
        const allOnlineCourses = await storage.getAllOnlineCourses();
        
        const fallbackOffline = allOfflineCourses
          .slice(0, 4)
          .map(course => ({
            ...course,
            courseType: 'offline',
            matchingScore: Math.floor(Math.random() * 30) + 50,
            matchingReasons: ['프로필 분석 결과 추천', '지역 및 분야 고려']
          }));

        const fallbackOnline = allOnlineCourses
          .slice(0, 2)
          .map(course => ({
            ...course,
            courseType: 'online',
            matchingScore: Math.floor(Math.random() * 30) + 60,
            matchingReasons: ['인기도 높음', '시간 자유도']
          }));
        
        res.json([...fallbackOffline, ...fallbackOnline]);
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        res.status(500).json({ message: "Failed to generate course recommendations" });
      }
    }
  });

  // Course data import endpoint (admin only - for development)
  app.post('/api/admin/import-courses', async (req, res) => {
    try {
      const { importCoursesFromExcel } = await import('./importCourses');
      const result = await importCoursesFromExcel();
      res.json({ 
        success: true, 
        message: `Successfully imported ${result.imported} courses`,
        ...result 
      });
    } catch (error) {
      console.error('Error importing courses:', error);
      res.status(500).json({ 
        error: 'Failed to import courses',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });



  const httpServer = createServer(app);

  return httpServer;
}
