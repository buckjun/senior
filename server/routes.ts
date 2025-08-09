import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware for Replit Auth
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Individual profile routes
  app.get('/api/individual-profiles/me', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getIndividualProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Individual profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching individual profile:", error);
      res.status(500).json({ message: "Failed to fetch individual profile" });
    }
  });

  app.post('/api/individual-profiles', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = {
        ...req.body,
        userId,
      };
      const profile = await storage.createIndividualProfile(profileData);
      res.status(201).json(profile);
    } catch (error) {
      console.error("Error creating individual profile:", error);
      res.status(500).json({ message: "Failed to create individual profile" });
    }
  });

  app.put('/api/individual-profiles', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.updateIndividualProfile(userId, req.body);
      res.json(profile);
    } catch (error) {
      console.error("Error updating individual profile:", error);
      res.status(500).json({ message: "Failed to update individual profile" });
    }
  });

  // Company profile routes
  app.get('/api/company-profiles/me', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getCompanyProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Company profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching company profile:", error);
      res.status(500).json({ message: "Failed to fetch company profile" });
    }
  });

  app.post('/api/company-profiles', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = {
        ...req.body,
        userId,
      };
      const profile = await storage.createCompanyProfile(profileData);
      res.status(201).json(profile);
    } catch (error) {
      console.error("Error creating company profile:", error);
      res.status(500).json({ message: "Failed to create company profile" });
    }
  });

  // Job category routes
  app.get('/api/job-categories', async (req, res) => {
    try {
      const categories = await storage.getAllJobCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching job categories:", error);
      res.status(500).json({ message: "Failed to fetch job categories" });
    }
  });

  app.get('/api/user/job-categories', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const categories = await storage.getUserJobCategories(userId);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching user job categories:", error);
      res.status(500).json({ message: "Failed to fetch user job categories" });
    }
  });

  app.post('/api/user/job-categories', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { categoryId } = req.body;
      const category = await storage.addUserJobCategory({ userId, categoryId });
      res.status(201).json(category);
    } catch (error) {
      console.error("Error adding user job category:", error);
      res.status(500).json({ message: "Failed to add user job category" });
    }
  });

  // Company recommendations
  app.get('/api/recommendations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const recommendations = await storage.getCompanyRecommendations(userId);
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  // Business verification (NTS API)
  app.post('/api/verify-business', async (req, res) => {
    try {
      const { businessNumber, ceoName, companyName } = req.body;
      
      if (!businessNumber || !ceoName || !companyName) {
        return res.status(400).json({ message: "모든 필드를 입력해주세요." });
      }

      const response = await fetch('https://api.odcloud.kr/api/nts-businessman/v1/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Infuser ${process.env.NTS_API_KEY}`
        },
        body: JSON.stringify({
          b_no: [businessNumber.replace(/-/g, '')]
        })
      });

      if (!response.ok) {
        return res.status(500).json({ message: "사업자등록번호 조회에 실패했습니다." });
      }

      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        const businessInfo = data.data[0];
        if (businessInfo.b_stt_cd === "01") {
          res.json({ 
            isValid: true, 
            message: "유효한 사업자등록번호입니다.",
            businessInfo: businessInfo
          });
        } else {
          res.json({ 
            isValid: false, 
            message: "휴업 또는 폐업된 사업자등록번호입니다." 
          });
        }
      } else {
        res.json({ 
          isValid: false, 
          message: "존재하지 않는 사업자등록번호입니다." 
        });
      }
    } catch (error) {
      console.error("Business verification error:", error);
      res.status(500).json({ message: "사업자등록번호 조회 중 오류가 발생했습니다." });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}