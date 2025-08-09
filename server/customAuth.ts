import { Express, RequestHandler } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User } from "@shared/schema";
import connectPg from "connect-pg-simple";

declare global {
  namespace Express {
    interface User extends User {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupCustomAuth(app: Express) {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  app.set("trust proxy", 1);
  app.use(session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: sessionTtl,
    },
  }));

  // 회원가입 API
  app.post("/api/register", async (req, res) => {
    try {
      const { email, password, name, phone, userType } = req.body;

      // 이메일 중복 체크
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "이미 사용 중인 이메일입니다." });
      }

      // 비밀번호 해싱
      const hashedPassword = await hashPassword(password);

      // 사용자 생성
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        name,
        phone: phone || null,
        userType,
        isActive: true,
      });

      // 세션에 사용자 정보 저장
      req.session.userId = user.id;
      
      res.status(201).json({
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "회원가입 중 오류가 발생했습니다." });
    }
  });

  // 로그인 API
  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await storage.getUserByEmail(email);
      if (!user || !user.isActive) {
        return res.status(401).json({ message: "이메일 또는 비밀번호가 잘못되었습니다." });
      }

      const isValidPassword = await comparePasswords(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "이메일 또는 비밀번호가 잘못되었습니다." });
      }

      // 세션에 사용자 정보 저장
      req.session.userId = user.id;

      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "로그인 중 오류가 발생했습니다." });
    }
  });

  // 로그아웃 API
  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "로그아웃 중 오류가 발생했습니다." });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "로그아웃되었습니다." });
    });
  });

  // 현재 사용자 정보 API
  app.get("/api/auth/user", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user || !user.isActive) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType,
      });
    } catch (error) {
      console.error("Auth user error:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}

// 인증 미들웨어
export const requireAuth: RequestHandler = async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ message: "Authentication error" });
  }
};

// 사용자 타입별 인증 미들웨어
export const requireIndividualAuth: RequestHandler = async (req, res, next) => {
  await requireAuth(req, res, () => {
    if (req.user?.userType !== 'individual') {
      return res.status(403).json({ message: "개인 회원만 접근 가능합니다." });
    }
    next();
  });
};

export const requireCompanyAuth: RequestHandler = async (req, res, next) => {
  await requireAuth(req, res, () => {
    if (req.user?.userType !== 'company') {
      return res.status(403).json({ message: "기업 회원만 접근 가능합니다." });
    }
    next();
  });
};

declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}