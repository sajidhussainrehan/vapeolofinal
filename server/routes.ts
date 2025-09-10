import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertAffiliateSchema, 
  insertProductSchema, 
  insertSaleSchema, 
  insertContactMessageSchema,
  insertUserSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware for JSON parsing
  app.use(express.json());

  // Simple authentication middleware (you may want to enhance this)
  const requireAuth = async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Authorization required" });
    }
    
    // Simple basic auth for demo (enhance with proper JWT/sessions)
    const [type, credentials] = authHeader.split(' ');
    if (type !== 'Basic') {
      return res.status(401).json({ error: "Basic auth required" });
    }
    
    const [username, password] = Buffer.from(credentials, 'base64').toString().split(':');
    const user = await storage.getUserByUsername(username);
    
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    req.user = user;
    next();
  };

  // Public routes (frontend)
  
  // Create affiliate application
  app.post("/api/affiliates", async (req, res) => {
    try {
      const validatedData = insertAffiliateSchema.parse(req.body);
      const affiliate = await storage.createAffiliate(validatedData);
      res.json({ success: true, data: affiliate });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Create contact message
  app.post("/api/contact", async (req, res) => {
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
  
  // Admin login
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // In a real app, you'd generate a JWT token here
      const token = Buffer.from(`${username}:${password}`).toString('base64');
      res.json({ 
        success: true, 
        data: { 
          user: { id: user.id, username: user.username, role: user.role },
          token: `Basic ${token}`
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
      const product = await storage.updateProduct(id, req.body);
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
      const message = await storage.updateContactMessageStatus(id, status);
      res.json({ success: true, data: message });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create initial admin user if none exists
  app.post("/api/admin/setup", async (req, res) => {
    try {
      const existingAdmin = await storage.getUserByUsername("admin");
      if (existingAdmin) {
        return res.status(400).json({ error: "Admin already exists" });
      }

      const validatedData = insertUserSchema.parse({
        username: "admin",
        password: "admin123" // You should change this
      });
      
      const admin = await storage.createUser(validatedData);
      res.json({ success: true, message: "Admin user created", data: admin });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
