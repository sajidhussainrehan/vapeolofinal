import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { 
  insertAffiliateSchema, 
  insertProductSchema, 
  insertSaleSchema, 
  insertContactMessageSchema,
  insertUserSchema 
} from "@shared/schema";

// JWT_SECRET configuration
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";

if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  console.error("FATAL: JWT_SECRET environment variable must be set for production");
  process.exit(1);
}

if (process.env.NODE_ENV === "production" && JWT_SECRET === "dev-secret-key") {
  console.error("FATAL: Production must use secure JWT_SECRET, not development default");
  process.exit(1);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware for JSON parsing
  app.use(express.json());

  // Rate limiting for public routes
  const publicRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    message: { error: "Too many requests, please try again later" }
  });

  // Rate limiting for admin login (more restrictive)
  const loginRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 login attempts per windowMs
    message: { error: "Too many login attempts, please try again later" },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // JWT authentication middleware
  const requireAuth = async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Authorization required" });
    }
    
    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer') {
      return res.status(401).json({ error: "Bearer token required" });
    }
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; username: string };
      const user = await storage.getUser(decoded.userId);
      
      if (!user) {
        return res.status(401).json({ error: "Invalid token" });
      }
      
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ error: "Invalid token" });
    }
  };

  // Public routes (frontend)
  
  // Create affiliate application (with rate limiting)
  app.post("/api/affiliates", publicRateLimit, async (req, res) => {
    try {
      const validatedData = insertAffiliateSchema.parse(req.body);
      const affiliate = await storage.createAffiliate(validatedData);
      res.json({ success: true, data: affiliate });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Create contact message (with rate limiting)
  app.post("/api/contact", publicRateLimit, async (req, res) => {
    try {
      const validatedData = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(validatedData);
      res.json({ success: true, data: message });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get active products (public)
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getActiveProducts();
      res.json({ success: true, data: products });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin routes (require authentication)
  
  // Admin login (with rate limiting)
  app.post("/api/admin/login", loginRateLimit, async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, username: user.username }, 
        JWT_SECRET, 
        { expiresIn: '24h' }
      );
      
      res.json({ 
        success: true, 
        data: { 
          user: { id: user.id, username: user.username, role: user.role },
          token: `Bearer ${token}`
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Distributor login (with rate limiting)
  app.post("/api/auth/distributor/login", loginRateLimit, async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email y contraseña son requeridos" });
      }

      const affiliate = await storage.getAffiliateByEmail(email);
      
      if (!affiliate) {
        return res.status(401).json({ error: "Credenciales inválidas" });
      }
      
      if (affiliate.status !== 'approved') {
        return res.status(401).json({ error: "Tu cuenta aún no ha sido aprobada" });
      }

      if (!affiliate.password) {
        return res.status(401).json({ error: "Tu cuenta no tiene contraseña asignada" });
      }
      
      const isValidPassword = await bcrypt.compare(password, affiliate.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Credenciales inválidas" });
      }
      
      res.json({ 
        success: true, 
        data: {
          id: affiliate.id,
          name: affiliate.name,
          email: affiliate.email,
          phone: affiliate.phone,
          level: affiliate.level,
          discount: affiliate.discount,
          minimumPurchase: affiliate.minimumPurchase,
          status: affiliate.status
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Dashboard stats
  app.get("/api/admin/dashboard", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Affiliate management
  app.get("/api/admin/affiliates", requireAuth, async (req, res) => {
    try {
      const affiliates = await storage.getAffiliates();
      res.json({ success: true, data: affiliates });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/admin/affiliates/:id/status", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      // Validate status update
      if (!status || !["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid status value" });
      }
      
      const affiliate = await storage.updateAffiliateStatus(id, status, (req as any).user.id);
      res.json({ success: true, data: affiliate });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Product management
  app.get("/api/admin/products", requireAuth, async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json({ success: true, data: products });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/products", requireAuth, async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.json({ success: true, data: product });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/admin/products/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Validate product update data - allow partial updates
      const allowedFields = ['name', 'puffs', 'price', 'image', 'sabores', 'description', 'popular', 'active'];
      const updateData = Object.keys(req.body)
        .filter(key => allowedFields.includes(key))
        .reduce((obj: any, key) => {
          obj[key] = req.body[key];
          return obj;
        }, {});
      
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: "No valid fields to update" });
      }
      
      const product = await storage.updateProduct(id, updateData);
      res.json({ success: true, data: product });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Sales management
  app.get("/api/admin/sales", requireAuth, async (req, res) => {
    try {
      const sales = await storage.getSales();
      res.json({ success: true, data: sales });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/sales", requireAuth, async (req, res) => {
    try {
      const validatedData = insertSaleSchema.parse(req.body);
      const sale = await storage.createSale(validatedData);
      res.json({ success: true, data: sale });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/admin/sales/:id/status", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      // Validate status update
      if (!status || !["pending", "completed", "cancelled"].includes(status)) {
        return res.status(400).json({ error: "Invalid status value" });
      }
      
      const sale = await storage.updateSaleStatus(id, status);
      res.json({ success: true, data: sale });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Contact messages management
  app.get("/api/admin/messages", requireAuth, async (req, res) => {
    try {
      const messages = await storage.getContactMessages();
      res.json({ success: true, data: messages });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/admin/messages/:id/status", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      // Validate status update
      if (!status || !["unread", "read", "replied"].includes(status)) {
        return res.status(400).json({ error: "Invalid status value" });
      }
      
      const message = await storage.updateContactMessageStatus(id, status);
      res.json({ success: true, data: message });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create initial admin user (DEVELOPMENT ONLY)
  app.post("/api/admin/setup", async (req, res) => {
    // Block this endpoint in production
    if (process.env.NODE_ENV === "production") {
      return res.status(404).json({ error: "Not found" });
    }

    try {
      const existingAdmin = await storage.getUserByUsername("admin");
      if (existingAdmin) {
        return res.status(400).json({ error: "Admin already exists" });
      }

      // Use password from env or default for development
      const password = process.env.ADMIN_INITIAL_PASSWORD || "admin123";
      const hashedPassword = await bcrypt.hash(password, 10);
      const validatedData = insertUserSchema.parse({
        username: "admin",
        password: hashedPassword
      });
      
      const admin = await storage.createUser(validatedData);
      res.json({ 
        success: true, 
        message: "Admin user created for development", 
        data: { id: admin.id, username: admin.username, role: admin.role }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
