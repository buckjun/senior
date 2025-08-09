import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupCustomAuth, requireAuth, requireIndividualAuth, requireCompanyAuth } from "./customAuth";
import { parseResumeFromText } from "./naturalLanguageService";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import { aiService } from "./aiService";
import { verifyBusinessRegistration } from "./ntsApi";
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
  // Setup custom authentication
  setupCustomAuth(app);

  // Note: Auth routes (/api/register, /api/login, /api/logout, /api/auth/user) are handled by setupCustomAuth

  // User profile routes
  app.post('/api/profiles', requireAuth, async (req: any, res) => {
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

  app.put('/api/profiles', requireAuth, async (req: any, res) => {
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
  app.post('/api/individual-profiles', requireIndividualAuth, async (req: any, res) => {
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

  app.get('/api/individual-profiles/me', requireIndividualAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const profile = await storage.getIndividualProfile(userId);
      res.json(profile);
    } catch (error) {
      console.error("Error fetching individual profile:", error);
      res.status(500).json({ message: "Failed to fetch individual profile" });
    }
  });

  app.put('/api/individual-profiles', requireIndividualAuth, async (req: any, res) => {
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
  app.post('/api/company-profiles', requireCompanyAuth, async (req: any, res) => {
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

  app.get('/api/company-profiles/me', requireCompanyAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const profile = await storage.getCompanyProfile(userId);
      res.json(profile);
    } catch (error) {
      console.error("Error fetching company profile:", error);
      res.status(500).json({ message: "Failed to fetch company profile" });
    }
  });

  app.put('/api/company-profiles', requireCompanyAuth, async (req: any, res) => {
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
  app.post('/api/verify-business', requireAuth, async (req, res) => {
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
  app.post('/api/ai/analyze-career', requireAuth, async (req, res) => {
    try {
      const { careerText, resumeText } = req.body;
      const analysis = await aiService.analyzeCareerProfile(careerText, resumeText);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing career:", error);
      res.status(500).json({ message: "Failed to analyze career" });
    }
  });

  app.post('/api/ai/analyze-resume-image', requireAuth, async (req, res) => {
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

  app.post('/api/ai/process-voice', requireAuth, async (req, res) => {
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
  app.post('/api/jobs', requireCompanyAuth, async (req: any, res) => {
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

  app.get('/api/jobs/recommended', requireIndividualAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const jobs = await storage.getRecommendedJobs(userId);
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching recommended jobs:", error);
      res.status(500).json({ message: "Failed to fetch recommended jobs" });
    }
  });

  app.get('/api/jobs/my', requireCompanyAuth, async (req: any, res) => {
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

  app.put('/api/jobs/:id', requireCompanyAuth, async (req: any, res) => {
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
  app.post('/api/jobs/:jobId/apply', requireIndividualAuth, async (req: any, res) => {
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

  app.get('/api/jobs/:jobId/applications', requireCompanyAuth, async (req: any, res) => {
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

  app.get('/api/applications/my', requireIndividualAuth, async (req: any, res) => {
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
  app.post('/api/jobs/:jobId/save', requireIndividualAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const savedJob = await storage.saveJob(userId, req.params.jobId);
      res.json(savedJob);
    } catch (error) {
      console.error("Error saving job:", error);
      res.status(400).json({ message: "Failed to save job" });
    }
  });

  app.delete('/api/jobs/:jobId/save', requireIndividualAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      await storage.unsaveJob(userId, req.params.jobId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error unsaving job:", error);
      res.status(400).json({ message: "Failed to unsave job" });
    }
  });

  app.get('/api/saved-jobs', requireIndividualAuth, async (req: any, res) => {
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
  app.get('/api/jobs/:jobId/ai-recommendations', requireAuth, async (req: any, res) => {
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
  app.get("/objects/:objectPath(*)", requireAuth, async (req: any, res) => {
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

  app.post("/api/objects/upload", requireAuth, async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    res.json({ uploadURL });
  });

  app.put("/api/resume-files", requireAuth, async (req: any, res) => {
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

  // Excel upload endpoint for senior reemployment data
  app.post("/api/upload-excel", requireAuth, upload.single('excelFile'), async (req: any, res) => {
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
  app.get("/api/reemployment-data", requireAuth, async (req, res) => {
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
  app.get("/api/reemployment-statistics", requireAuth, async (req, res) => {
    try {
      const category = req.query.category as string;
      const stats = await storage.getReemploymentStatistics(category);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  });

  // Business registration verification endpoint
  app.post('/api/verify-business', async (req, res) => {
    try {
      const { businessNumber } = req.body;
      
      if (!businessNumber) {
        return res.status(400).json({ 
          valid: false, 
          status: 'unknown',
          errorMessage: '사업자등록번호를 입력해주세요.' 
        });
      }

      const result = await verifyBusinessRegistration(businessNumber);
      res.json(result);
    } catch (error) {
      console.error('사업자등록번호 검증 오류:', error);
      res.status(500).json({ 
        valid: false, 
        status: 'unknown',
        errorMessage: '검증 중 오류가 발생했습니다.' 
      });
    }
  });

  // Natural language processing for resume generation
  app.post('/api/parse-resume', requireAuth, async (req: any, res) => {
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

  // Update individual profile with AI-generated resume data
  app.post('/api/individual-profiles/ai-resume', requireIndividualAuth, async (req: any, res) => {
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
  app.get("/api/job-categories", requireAuth, async (req, res) => {
    try {
      const categories = await storage.getAllJobCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching job categories:", error);
      res.status(500).json({ error: "Failed to fetch job categories" });
    }
  });

  app.get("/api/user/job-categories", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const categories = await storage.getUserJobCategories(userId);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching user job categories:", error);
      res.status(500).json({ error: "Failed to fetch user job categories" });
    }
  });

  app.post("/api/user/job-categories", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { categoryIds } = req.body;
      
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
  app.get("/api/recommendations", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      
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

  const httpServer = createServer(app);

  return httpServer;
}
