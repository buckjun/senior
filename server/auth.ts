import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as UserType, SignupData, LoginData, signupSchema, loginSchema } from "@shared/schema";
import connectPg from "connect-pg-simple";
import { z } from "zod";

declare global {
  namespace Express {
    interface User extends UserType {}
  }
}

const scryptAsync = promisify(scrypt);

// Password hashing
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  if (!hashed || !salt) return false;
  
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Session store setup
  const PostgresSessionStore = connectPg(session);
  const sessionStore = new PostgresSessionStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    tableName: 'user_sessions' // Use different table name to avoid conflicts
  });

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'dev-secret-key',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Local strategy
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'username',
        passwordField: 'password'
      },
      async (username, password, done) => {
        try {
          const user = await storage.getUserByUsername(username);
          if (!user || !(await comparePasswords(password, user.password))) {
            return done(null, false, { message: "아이디 또는 비밀번호가 일치하지 않습니다." });
          } else {
            return done(null, user);
          }
        } catch (error) {
          return done(error);
        }
      }
    ),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Signup endpoint
  app.post("/api/signup", async (req, res, next) => {
    try {
      // Validate input
      const validationResult = signupSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "입력값 검증에 실패했습니다.",
          errors: validationResult.error.issues 
        });
      }

      const { username, email, password, phoneNumber, userType, firstName, lastName } = validationResult.data;

      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "이미 사용 중인 아이디입니다." });
      }

      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "이미 사용 중인 이메일입니다." });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(password);
      
      const userData: SignupData & { password: string; userType: 'individual' | 'company' } = {
        username,
        email,
        password: hashedPassword,
        phoneNumber,
        firstName,
        lastName,
        userType: userType || 'individual'
      };

      const user = await storage.createUser(userData);

      // Login user immediately after signup
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json({
          message: "회원가입이 완료되었습니다.",
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            userType: user.userType
          }
        });
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "회원가입 중 오류가 발생했습니다." });
    }
  });

  // Login endpoint
  app.post("/api/login", (req, res, next) => {
    // Validate input
    const validationResult = loginSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "입력값 검증에 실패했습니다.",
        errors: validationResult.error.issues 
      });
    }

    passport.authenticate("local", (err: any, user: UserType | false, info: any) => {
      if (err) {
        return res.status(500).json({ message: "로그인 중 오류가 발생했습니다." });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "아이디 또는 비밀번호가 일치하지 않습니다." });
      }

      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "로그인 중 오류가 발생했습니다." });
        }
        res.json({
          message: "로그인되었습니다.",
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            userType: user.userType
          }
        });
      });
    })(req, res, next);
  });

  // Logout endpoint
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      req.session.destroy((err) => {
        if (err) return next(err);
        res.clearCookie('connect.sid');
        res.json({ message: "로그아웃되었습니다." });
      });
    });
  });

  // Get current user endpoint
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    res.json({
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      userType: req.user.userType,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      phoneNumber: req.user.phoneNumber
    });
  });
}

// Middleware to check authentication
export const isAuthenticated = (req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};