import type { Express, Request, Response, NextFunction } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { products, productFlavors } from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import multer from "multer";
import path from "path";
import fs from "fs";
import { 
  insertAffiliateSchema, 
  insertProductSchema, 
  insertSaleSchema, 
  insertContactMessageSchema,
  insertUserSchema,
  updateUserSchema,
  updateSelfProfileSchema,
  changePasswordSchema,
  adminResetPasswordSchema,
  insertHomepageContentSchema,
  insertProductFlavorSchema,
  updateProductFlavorSchema,
  isFlavorOutOfStock,
  type User
} from "@shared/schema";

// Extend Express Request interface to include user property
interface AuthenticatedRequest extends Request {
  user: User;
}

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

// Password validation utilities
interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

function validatePasswordStrength(password: string): PasswordValidationResult {
  const errors: string[] = [];
  
  // Minimum length
  if (password.length < 8) {
    errors.push("La contraseña debe tener al menos 8 caracteres");
  }
  
  // Maximum length for security
  if (password.length > 100) {
    errors.push("La contraseña no puede tener más de 100 caracteres");
  }
  
  // At least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push("La contraseña debe contener al menos una letra mayúscula");
  }
  
  // At least one lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push("La contraseña debe contener al menos una letra minúscula");
  }
  
  // At least one number
  if (!/[0-9]/.test(password)) {
    errors.push("La contraseña debe contener al menos un número");
  }
  
  // At least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("La contraseña debe contener al menos un carácter especial");
  }
  
  // No common patterns
  const commonPatterns = [
    /123456/, /password/, /admin/, /qwerty/, /letmein/, /welcome/,
    /monkey/, /dragon/, /pass/, /master/, /login/, /vapeolo/
  ];
  
  for (const pattern of commonPatterns) {
    if (pattern.test(password.toLowerCase())) {
      errors.push("La contraseña no puede contener patrones comunes");
      break;
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Failed login attempt tracking (in-memory for simplicity, in production use Redis or database)
const failedAttempts = new Map<string, { count: number; lastAttempt: Date }>();

function checkAndUpdateFailedAttempts(email: string): boolean {
  const key = email.toLowerCase();
  const attempt = failedAttempts.get(key);
  const now = new Date();
  
  if (!attempt) {
    failedAttempts.set(key, { count: 1, lastAttempt: now });
    return true; // First attempt, allow
  }
  
  // Reset counter if last attempt was more than 1 hour ago
  if (now.getTime() - attempt.lastAttempt.getTime() > 60 * 60 * 1000) {
    failedAttempts.set(key, { count: 1, lastAttempt: now });
    return true;
  }
  
  // Block if more than 5 attempts in the last hour
  if (attempt.count >= 5) {
    return false;
  }
  
  // Increment counter
  failedAttempts.set(key, { count: attempt.count + 1, lastAttempt: now });
  return true;
}

function clearFailedAttempts(email: string): void {
  failedAttempts.delete(email.toLowerCase());
}

// Multer configuration for file uploads
const storage_config = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'public', 'uploads', 'products');
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage_config,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only image files
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WebP) are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware for JSON parsing
  app.use(express.json());
  
  // Serve static files from uploads directory
  app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

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
  const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
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
      
      if (!user.active) {
        return res.status(401).json({ error: "Account deactivated" });
      }
      
      (req as AuthenticatedRequest).user = user;
      next();
    } catch (error) {
      return res.status(401).json({ error: "Invalid token" });
    }
  };

  // Role-based access control middleware
  const requireRole = (...allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const authReq = req as AuthenticatedRequest;
      if (!authReq.user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      if (!allowedRoles.includes(authReq.user.role)) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }
      
      next();
    };
  };

  // Permission-based access control middleware
  const requirePermission = (...permissions: Array<keyof Pick<User, 'editInventory' | 'addProduct' | 'deleteItems' | 'deleteAffiliate' | 'authorizeAffiliate' | 'pauseAffiliate'>>) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const authReq = req as AuthenticatedRequest;
      if (!authReq.user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      // Admin role bypasses all permission checks
      if (authReq.user.role === 'admin') {
        return next();
      }
      
      // Check if user has all required permissions
      const hasAllPermissions = permissions.every(permission => {
        return authReq.user[permission] === true;
      });
      
      if (!hasAllPermissions) {
        return res.status(403).json({ error: "Insufficient permissions for this operation" });
      }
      
      next();
    };
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

  // Get active products with flavors (public)
  app.get("/api/products", async (req, res) => {
    try {
      // Use the updated storage method that properly handles flavor-level availability
      const availableProducts = await storage.getActiveProducts();
      
      // Filter to only include products that should be shown on homepage
      const homepageProducts = availableProducts.filter(product => product.showOnHomepage);
      
      // Get flavors for each available product and apply server-side filtering
      const productsWithFlavors = [];
      
      for (const product of homepageProducts) {
        const flavors = await storage.getProductFlavors(product.id);
        
        if (flavors.length === 0) {
          // Product without flavors - include for backward compatibility
          // Only if product-level inventory is available (already checked in getActiveProducts)
          productsWithFlavors.push({
            ...product,
            flavors: []
          });
        } else {
          // Product with flavors - apply server-side filtering
          const activeFlavors = flavors.filter(flavor => flavor.active);
          
          // Server-side enforcement: only include flavors with available inventory > 0
          const availableFlavors = activeFlavors.filter(flavor => {
            return !isFlavorOutOfStock(flavor);
          });
          
          // Only include product if it has at least one available flavor
          // (This check should always pass due to getActiveProducts filtering)
          if (availableFlavors.length > 0) {
            productsWithFlavors.push({
              ...product,
              flavors: availableFlavors // Only return available flavors
            });
          }
        }
      }
      
      res.json({ success: true, data: productsWithFlavors });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Place order and deduct inventory (public)
  app.post("/api/orders", publicRateLimit, async (req, res) => {
    try {
      const { cartItems, customerData } = req.body;
      
      if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
        return res.status(400).json({ error: "Cart items are required" });
      }
      
      if (!customerData || !customerData.firstName || !customerData.phone) {
        return res.status(400).json({ error: "Customer data is required" });
      }
      
      // Process each cart item and deduct flavor inventory
      const orderItems = [];
      
      for (const item of cartItems) {
        if (!item.id || !item.flavor || !item.quantity || item.quantity <= 0) {
          return res.status(400).json({ error: "Invalid cart item format" });
        }
        
        // Get product and find the specific flavor
        const product = await storage.getProduct(item.id);
        if (!product) {
          return res.status(400).json({ error: `Product not found: ${item.id}` });
        }
        
        const flavors = await storage.getProductFlavors(product.id);
        const flavor = flavors.find(f => f.name === item.flavor && f.active);
        
        if (!flavor) {
          return res.status(400).json({ error: `Flavor not available: ${item.flavor}` });
        }
        
        // Check if sufficient inventory is available
        const availableInventory = Math.max(0, flavor.inventory - flavor.reservedInventory);
        if (availableInventory < item.quantity) {
          return res.status(400).json({ 
            error: `Insufficient inventory for ${product.name} - ${flavor.name}. Available: ${availableInventory}, Requested: ${item.quantity}` 
          });
        }
        
        // Reserve the inventory by increasing reservedInventory
        await storage.updateProductFlavor(flavor.id, {
          reservedInventory: flavor.reservedInventory + item.quantity
        });
        
        orderItems.push({
          productId: product.id,
          productName: product.name,
          flavorId: flavor.id,
          flavorName: flavor.name,
          quantity: item.quantity,
          unitPrice: parseFloat(product.price),
          totalPrice: parseFloat(product.price) * item.quantity
        });
      }
      
      // Calculate order total
      const orderTotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
      
      // Create a sale record for tracking
      const saleData = {
        productId: orderItems[0].productId, // Use first product as main product
        quantity: orderItems.reduce((sum, item) => sum + item.quantity, 0),
        unitPrice: (orderTotal / orderItems.reduce((sum, item) => sum + item.quantity, 0)).toFixed(2),
        totalAmount: orderTotal.toFixed(2),
        customerName: `${customerData.firstName} ${customerData.lastName}`,
        customerEmail: customerData.email || '',
        customerPhone: customerData.phone,
        discount: '0'
      };
      
      const sale = await storage.createSale(saleData);
      
      res.json({ 
        success: true, 
        data: { 
          orderId: sale.id,
          items: orderItems,
          total: orderTotal,
          message: "Order placed successfully. Inventory has been reserved."
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get homepage content (public)
  app.get("/api/homepage-content", async (req, res) => {
    try {
      const allContent = await storage.getHomepageContent();
      // Filter only active content for public consumption
      const activeContent = allContent.filter(content => content.active);
      
      // Transform to a more convenient object structure for frontend
      const contentMap = activeContent.reduce((acc, content) => {
        acc[content.section] = {
          title: content.title,
          subtitle: content.subtitle,
          description: content.description,
          buttonText: content.buttonText,
          buttonUrl: content.buttonUrl
        };
        return acc;
      }, {} as Record<string, any>);
      
      res.json({ success: true, data: contentMap });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin routes (require authentication)
  
  // Image upload endpoint for products
  app.post("/api/admin/products/upload-image", requireAuth, requirePermission('addProduct'), upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }
      
      // Return the relative path that can be stored in database
      const imagePath = `products/${req.file.filename}`;
      
      res.json({ 
        success: true, 
        data: { 
          imagePath: imagePath,
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size
        } 
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to upload image" });
    }
  });
  
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
          user: { 
            id: user.id, 
            username: user.username, 
            role: user.role,
            editInventory: user.editInventory,
            addProduct: user.addProduct,
            deleteItems: user.deleteItems,
            deleteAffiliate: user.deleteAffiliate,
            authorizeAffiliate: user.authorizeAffiliate,
            pauseAffiliate: user.pauseAffiliate
          },
          token: `Bearer ${token}`
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Profile management routes
  app.get("/api/admin/me", requireAuth, async (req, res) => {
    try {
      const user = (req as AuthenticatedRequest).user;
      res.json({ 
        success: true, 
        data: { 
          id: user.id, 
          username: user.username, 
          role: user.role, 
          active: user.active,
          createdAt: user.createdAt 
        } 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/admin/me", requireAuth, async (req, res) => {
    try {
      // SECURITY: Only allow username updates for self-profile
      // Role and active status can only be modified by admins through /api/admin/users/:id
      const validatedData = updateSelfProfileSchema.parse(req.body);
      const updatedUser = await storage.updateUser((req as AuthenticatedRequest).user.id, validatedData);
      
      res.json({ 
        success: true, 
        data: { 
          id: updatedUser.id, 
          username: updatedUser.username, 
          role: updatedUser.role, 
          active: updatedUser.active,
          createdAt: updatedUser.createdAt 
        } 
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/admin/me/password", requireAuth, async (req, res) => {
    try {
      const validatedData = changePasswordSchema.parse(req.body);
      
      // Verify current password
      const isValidPassword = await bcrypt.compare(validatedData.currentPassword, (req as AuthenticatedRequest).user.password);
      if (!isValidPassword) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }
      
      // Validate new password strength
      const passwordValidation = validatePasswordStrength(validatedData.newPassword);
      if (!passwordValidation.isValid) {
        return res.status(400).json({ 
          error: "Password validation failed", 
          details: passwordValidation.errors 
        });
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10);
      
      // Update password
      await storage.setUserPassword((req as AuthenticatedRequest).user.id, hashedPassword);
      
      res.json({ success: true, data: { message: "Password updated successfully" } });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // User management routes (admin-only)
  app.get("/api/admin/users", requireAuth, requireRole('admin'), async (req, res) => {
    try {
      const users = await storage.listUsers();
      const safeUsers = users.map(user => ({
        id: user.id,
        username: user.username,
        role: user.role,
        active: user.active,
        editInventory: user.editInventory,
        addProduct: user.addProduct,
        deleteItems: user.deleteItems,
        deleteAffiliate: user.deleteAffiliate,
        authorizeAffiliate: user.authorizeAffiliate,
        pauseAffiliate: user.pauseAffiliate,
        createdAt: user.createdAt
      }));
      
      res.json({ success: true, data: safeUsers });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/users", requireAuth, requireRole('admin'), async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Validate password strength
      const passwordValidation = validatePasswordStrength(validatedData.password);
      if (!passwordValidation.isValid) {
        return res.status(400).json({ 
          error: "Password validation failed", 
          details: passwordValidation.errors 
        });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      // Create user
      const newUser = await storage.createUser({
        ...validatedData,
        password: hashedPassword
      });
      
      res.json({ 
        success: true, 
        data: { 
          id: newUser.id, 
          username: newUser.username, 
          role: newUser.role, 
          active: newUser.active,
          editInventory: newUser.editInventory,
          addProduct: newUser.addProduct,
          deleteItems: newUser.deleteItems,
          deleteAffiliate: newUser.deleteAffiliate,
          authorizeAffiliate: newUser.authorizeAffiliate,
          pauseAffiliate: newUser.pauseAffiliate,
          createdAt: newUser.createdAt 
        } 
      });
    } catch (error: any) {
      if (error.code === '23505') { // PostgreSQL unique constraint violation
        res.status(400).json({ error: "Username already exists" });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  });

  app.patch("/api/admin/users/:id", requireAuth, requireRole('admin'), async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = updateUserSchema.parse(req.body);
      
      // Check if trying to deactivate the last admin
      if (validatedData.active === false) {
        const targetUser = await storage.getUser(id);
        if (targetUser && targetUser.role === 'admin') {
          const allUsers = await storage.listUsers();
          const activeAdmins = allUsers.filter(u => u.role === 'admin' && u.active && u.id !== id);
          
          if (activeAdmins.length === 0) {
            return res.status(400).json({ 
              error: "Cannot deactivate the last active admin user" 
            });
          }
        }
      }
      
      const updatedUser = await storage.updateUser(id, validatedData);
      
      res.json({ 
        success: true, 
        data: { 
          id: updatedUser.id, 
          username: updatedUser.username, 
          role: updatedUser.role, 
          active: updatedUser.active,
          editInventory: updatedUser.editInventory,
          addProduct: updatedUser.addProduct,
          deleteItems: updatedUser.deleteItems,
          deleteAffiliate: updatedUser.deleteAffiliate,
          authorizeAffiliate: updatedUser.authorizeAffiliate,
          pauseAffiliate: updatedUser.pauseAffiliate,
          createdAt: updatedUser.createdAt 
        } 
      });
    } catch (error: any) {
      if (error.code === '23505') { // PostgreSQL unique constraint violation
        res.status(400).json({ error: "Username already exists" });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  });

  app.patch("/api/admin/users/:id/password", requireAuth, requireRole('admin'), async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = adminResetPasswordSchema.parse(req.body);
      
      // Validate password strength
      const passwordValidation = validatePasswordStrength(validatedData.newPassword);
      if (!passwordValidation.isValid) {
        return res.status(400).json({ 
          error: "Password validation failed", 
          details: passwordValidation.errors 
        });
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10);
      
      // Update password
      await storage.setUserPassword(id, hashedPassword);
      
      res.json({ success: true, data: { message: "Password reset successfully" } });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Delete user endpoint
  app.delete("/api/admin/users/:id", requireAuth, requireRole('admin'), async (req, res) => {
    try {
      const { id } = req.params;
      const currentUserId = (req as AuthenticatedRequest).user.id;
      
      // Prevent self-deletion
      if (id === currentUserId) {
        return res.status(400).json({ error: "No puedes eliminar tu propia cuenta" });
      }
      
      // Check if user exists
      const userToDelete = await storage.getUser(id);
      if (!userToDelete) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
      
      // Count active admin users
      const allUsers = await storage.listUsers();
      const activeAdmins = allUsers.filter(user => user.role === 'admin' && user.active);
      
      // Prevent deleting the last active admin
      if (userToDelete.role === 'admin' && userToDelete.active && activeAdmins.length <= 1) {
        return res.status(400).json({ error: "No puedes eliminar el último administrador activo" });
      }
      
      // Delete user
      await storage.deleteUser(id);
      
      res.json({ success: true, data: { message: "Usuario eliminado exitosamente" } });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Distributor login (with rate limiting)
  app.post("/api/auth/distributor/login", loginRateLimit, async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email y contraseña son requeridos" });
      }

      // Check for too many failed attempts
      if (!checkAndUpdateFailedAttempts(email)) {
        return res.status(429).json({ error: "Demasiados intentos fallidos. Intenta de nuevo en una hora." });
      }

      const affiliate = await storage.getAffiliateByEmail(email);
      
      if (!affiliate) {
        return res.status(401).json({ error: "Credenciales inválidas" });
      }
      
      if (affiliate.status !== 'approved') {
        return res.status(401).json({ error: "Tu cuenta aún no ha sido aprobada" });
      }

      if (!affiliate.password) {
        return res.status(401).json({ error: "Tu cuenta no tiene contraseña asignada. Contacta al administrador." });
      }
      
      const isValidPassword = await bcrypt.compare(password, affiliate.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Credenciales inválidas" });
      }
      
      // Clear failed attempts on successful login
      clearFailedAttempts(email);
      
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
      if (!status || !["pending", "approved", "rejected", "standby"].includes(status)) {
        return res.status(400).json({ error: "Invalid status value" });
      }
      
      // Check permissions based on status being set
      const authReq = req as AuthenticatedRequest;
      if (authReq.user.role !== 'admin') {
        if (status === 'approved' && !authReq.user.authorizeAffiliate) {
          return res.status(403).json({ error: "Insufficient permissions to authorize affiliates" });
        }
        if (status === 'standby' && !authReq.user.pauseAffiliate) {
          return res.status(403).json({ error: "Insufficient permissions to pause affiliates" });
        }
      }
      
      const affiliate = await storage.updateAffiliateStatus(id, status, (req as any).user.id);
      res.json({ success: true, data: affiliate });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Set affiliate password (admin only)
  app.patch("/api/admin/affiliates/:id/password", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { password } = req.body;
      
      if (!password) {
        return res.status(400).json({ error: "Contraseña es requerida" });
      }
      
      // Validate password strength
      const validation = validatePasswordStrength(password);
      if (!validation.isValid) {
        return res.status(400).json({ 
          error: "Contraseña no cumple con los requisitos de seguridad",
          details: validation.errors 
        });
      }
      
      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      // Update affiliate password
      const affiliate = await storage.updateAffiliatePassword(id, hashedPassword);
      
      res.json({ 
        success: true, 
        data: { 
          id: affiliate.id, 
          name: affiliate.name, 
          email: affiliate.email,
          passwordSet: true 
        } 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete affiliate (admin only)
  app.delete("/api/admin/affiliates/:id", requireAuth, requirePermission('deleteAffiliate'), async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if affiliate exists
      const affiliate = await storage.getAffiliate(id);
      if (!affiliate) {
        return res.status(404).json({ error: "Affiliate not found" });
      }
      
      // Delete affiliate
      await storage.deleteAffiliate(id);
      
      res.json({ 
        success: true, 
        message: "Affiliate deleted successfully" 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Product management
  app.get("/api/admin/products", requireAuth, async (req, res) => {
    try {
      const products = await storage.getProducts();
      
      // Include flavors for each product for admin view
      const productsWithFlavors = [];
      
      for (const product of products) {
        const flavors = await storage.getProductFlavors(product.id);
        productsWithFlavors.push({
          ...product,
          flavors: flavors // Include all flavors for admin view
        });
      }
      
      res.json({ success: true, data: productsWithFlavors });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/products", requireAuth, requirePermission('addProduct'), async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.json({ success: true, data: product });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/admin/products/:id", requireAuth, requirePermission('editInventory'), async (req, res) => {
    try {
      const { id } = req.params;
      
      // Validate product update data - allow partial updates
      const allowedFields = ['name', 'puffs', 'price', 'image', 'sabores', 'description', 'popular', 'active', 'inventory', 'reservedInventory', 'lowStockThreshold'];
      const updateData = Object.keys(req.body)
        .filter(key => allowedFields.includes(key))
        .reduce((obj: any, key) => {
          obj[key] = req.body[key];
          return obj;
        }, {});
      
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: "No valid fields to update" });
      }
      
      // Check editInventory permission if any inventory-related fields are being updated
      const inventoryFields = ['inventory', 'reservedInventory', 'lowStockThreshold'];
      const isUpdatingInventory = inventoryFields.some(field => field in updateData);
      
      if (isUpdatingInventory) {
        const authReq = req as AuthenticatedRequest;
        // Admin role bypasses permission checks
        if (authReq.user.role !== 'admin' && !authReq.user.editInventory) {
          return res.status(403).json({ error: "Insufficient permissions to edit inventory" });
        }
      }
      
      // Validate inventory fields if they are being updated
      if ('inventory' in updateData) {
        if (!Number.isInteger(updateData.inventory) || updateData.inventory < 0) {
          return res.status(400).json({ error: "Inventory must be a non-negative integer" });
        }
      }
      
      if ('reservedInventory' in updateData) {
        if (!Number.isInteger(updateData.reservedInventory) || updateData.reservedInventory < 0) {
          return res.status(400).json({ error: "Reserved inventory must be a non-negative integer" });
        }
      }
      
      if ('lowStockThreshold' in updateData) {
        if (!Number.isInteger(updateData.lowStockThreshold) || updateData.lowStockThreshold < 0) {
          return res.status(400).json({ error: "Low stock threshold must be a non-negative integer" });
        }
      }
      
      // Additional validation: reservedInventory cannot exceed inventory
      if ('inventory' in updateData && 'reservedInventory' in updateData) {
        if (updateData.reservedInventory > updateData.inventory) {
          return res.status(400).json({ error: "Reserved inventory cannot exceed total inventory" });
        }
      } else if ('reservedInventory' in updateData) {
        // If only updating reservedInventory, get current inventory from database
        const currentProduct = await storage.getProduct(id);
        if (!currentProduct) {
          return res.status(404).json({ error: "Product not found" });
        }
        if (updateData.reservedInventory > currentProduct.inventory) {
          return res.status(400).json({ error: "Reserved inventory cannot exceed total inventory" });
        }
      } else if ('inventory' in updateData) {
        // If only updating inventory, ensure it's not less than current reservedInventory
        const currentProduct = await storage.getProduct(id);
        if (!currentProduct) {
          return res.status(404).json({ error: "Product not found" });
        }
        if (updateData.inventory < currentProduct.reservedInventory) {
          return res.status(400).json({ error: "Inventory cannot be less than currently reserved inventory" });
        }
      }
      
      const product = await storage.updateProduct(id, updateData);
      res.json({ success: true, data: product });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/products/:id", requireAuth, requirePermission('deleteItems'), async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verify product exists before deletion
      const existingProduct = await storage.getProduct(id);
      if (!existingProduct) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      // Check if product has any associated sales
      const sales = await storage.getSales();
      const productSales = sales.filter(sale => sale.productId === id);
      
      if (productSales.length > 0) {
        return res.status(400).json({ 
          error: "Cannot delete product with existing sales. Consider deactivating it instead.",
          suggestion: "Set the product as inactive to hide it from customers while preserving sales history."
        });
      }
      
      await storage.deleteProduct(id);
      res.json({ success: true, message: "Product and associated flavors deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Seed hardcoded products from ProductStore.tsx
  app.post("/api/admin/products/seed", requireAuth, requirePermission('addProduct'), async (req, res) => {
    try {
      // Hardcoded product data from ProductStore.tsx
      const hardcodedProducts = [
        {
          id: 'cyber',
          name: 'CYBER',
          puffs: '20,000 Puffs',
          price: 'Q240',
          sabores: ['Mango Ice', 'Blueberry', 'Cola', 'Grape', 'Sandía Chill'],
          popular: true,
          description: 'Vape premium CYBER con 20,000 puffs y una gran variedad de sabores refrescantes. Ideal para sesiones prolongadas con calidad superior.'
        },
        {
          id: 'cube',
          name: 'CUBE',
          puffs: '20,000 Puffs',
          price: 'Q220',
          sabores: ['Strawberry Kiwi', 'Menta', 'Cola', 'Frutas Tropicales', 'Piña'],
          description: 'Vape CUBE con diseño moderno y 20,000 puffs. Perfecto equilibrio entre sabor y duración con sabores únicos.'
        },
        {
          id: 'energy',
          name: 'ENERGY',
          puffs: '15,000 Puffs',
          price: 'Q170',
          sabores: ['Blue Razz', 'Mango Chill', 'Fresa', 'Cereza', 'Uva'],
          description: 'Vape ENERGY con 15,000 puffs y sabores intensos. Diseñado para darte la energía que necesitas durante todo el día.'
        },
        {
          id: 'torch',
          name: 'TORCH',
          puffs: '6,000 Puffs',
          price: 'Q125',
          sabores: ['Menta', 'Banana Ice', 'Frutos Rojos', 'Chicle', 'Limonada'],
          description: 'Vape TORCH compacto con 6,000 puffs. Perfecto para llevarlo contigo con sabores frescos y vibrantes.'
        },
        {
          id: 'bar',
          name: 'BAR',
          puffs: '800 Puffs',
          price: 'Q65',
          sabores: ['Sandía', 'Uva', 'Cola', 'Mango', 'Piña Colada'],
          description: 'Vape BAR económico con 800 puffs. Ideal para quienes buscan una opción accesible sin comprometer la calidad del sabor.'
        }
      ];

      // Image mapping for products
      const imageMapping: Record<string, string> = {
        'CYBER': 'CYBER_1757558165027.png',
        'CUBE': 'CUBE_1757558165026.png', 
        'ENERGY': 'ENERGY_1757558165028.png',
        'TORCH': 'TORCH (1)_1757558165028.png',
        'BAR': 'BAR (1)_1757558165026.png'
      };

      // Transform data to match database schema
      const transformedProducts = hardcodedProducts.map(product => ({
        name: product.name,
        puffs: parseInt(product.puffs.replace(/[,\s]/g, '').replace('Puffs', '')), // Convert "20,000 Puffs" to 20000
        price: product.price.replace('Q', ''), // Convert "Q240" to "240.00"
        image: imageMapping[product.name] || null, // Map product name to image filename
        sabores: product.sabores,
        description: product.description,
        popular: product.popular || false,
        active: true,
        inventory: 100, // Default inventory
        reservedInventory: 0, // Default reserved
        lowStockThreshold: 10 // Default threshold
      }));

      // Check for existing products to avoid duplicates
      const existingProducts = await storage.getProducts();
      const existingNames = new Set(existingProducts.map(p => p.name));

      let createdCount = 0;
      let skippedCount = 0;
      const results = [];

      for (const productData of transformedProducts) {
        if (existingNames.has(productData.name)) {
          skippedCount++;
          results.push({
            name: productData.name,
            status: 'skipped',
            reason: 'Product already exists'
          });
        } else {
          try {
            const validatedData = insertProductSchema.parse(productData);
            const product = await storage.createProduct(validatedData);
            createdCount++;
            results.push({
              name: product.name,
              status: 'created',
              id: product.id
            });
          } catch (error: any) {
            results.push({
              name: productData.name,
              status: 'error',
              reason: error.message
            });
          }
        }
      }

      res.json({
        success: true,
        message: `Seeding completed: ${createdCount} products created, ${skippedCount} skipped`,
        data: {
          created: createdCount,
          skipped: skippedCount,
          total: transformedProducts.length,
          details: results
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Product Flavor management
  app.get("/api/admin/products/:productId/flavors", requireAuth, async (req, res) => {
    try {
      const { productId } = req.params;
      
      // Verify product exists
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      const flavors = await storage.getProductFlavors(productId);
      res.json({ success: true, data: flavors });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/products/:productId/flavors", requireAuth, requirePermission('editInventory'), async (req, res) => {
    try {
      const { productId } = req.params;
      
      // Verify product exists
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      // Validate and create flavor
      const flavorData = { ...req.body, productId };
      const validatedData = insertProductFlavorSchema.parse(flavorData);
      
      // Validate inventory constraints
      if (typeof validatedData.reservedInventory === 'number' && typeof validatedData.inventory === 'number') {
        if (validatedData.reservedInventory > validatedData.inventory) {
          return res.status(400).json({ error: "Reserved inventory cannot exceed total inventory" });
        }
      }
      
      const flavor = await storage.createProductFlavor(validatedData);
      res.json({ success: true, data: flavor });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/admin/flavors/:flavorId", requireAuth, requirePermission('editInventory'), async (req, res) => {
    try {
      const { flavorId } = req.params;
      
      // Verify flavor exists
      const existingFlavor = await storage.getProductFlavor(flavorId);
      if (!existingFlavor) {
        return res.status(404).json({ error: "Flavor not found" });
      }
      
      // Validate update data
      const validatedData = updateProductFlavorSchema.parse(req.body);
      
      // Validate inventory constraints if they are being updated
      if ('inventory' in validatedData && 'reservedInventory' in validatedData) {
        if (typeof validatedData.reservedInventory === 'number' && typeof validatedData.inventory === 'number') {
          if (validatedData.reservedInventory > validatedData.inventory) {
            return res.status(400).json({ error: "Reserved inventory cannot exceed total inventory" });
          }
        }
      } else if ('reservedInventory' in validatedData) {
        if (typeof validatedData.reservedInventory === 'number') {
          if (validatedData.reservedInventory > existingFlavor.inventory) {
            return res.status(400).json({ error: "Reserved inventory cannot exceed total inventory" });
          }
        }
      } else if ('inventory' in validatedData) {
        if (typeof validatedData.inventory === 'number') {
          if (validatedData.inventory < existingFlavor.reservedInventory) {
            return res.status(400).json({ error: "Inventory cannot be less than currently reserved inventory" });
          }
        }
      }
      
      const flavor = await storage.updateProductFlavor(flavorId, validatedData);
      res.json({ success: true, data: flavor });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/admin/flavors/:flavorId", requireAuth, requirePermission('deleteItems'), async (req, res) => {
    try {
      const { flavorId } = req.params;
      
      // Verify flavor exists
      const existingFlavor = await storage.getProductFlavor(flavorId);
      if (!existingFlavor) {
        return res.status(404).json({ error: "Flavor not found" });
      }
      
      await storage.deleteProductFlavor(flavorId);
      res.json({ success: true, message: "Flavor deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Migration endpoint - Convert sabores to product flavors
  app.post("/api/admin/migrate-flavors", requireAuth, requirePermission('editInventory'), async (req, res) => {
    try {
      console.log("Starting sabores migration...");
      
      // Get all existing products
      const allProducts = await storage.getProducts();
      console.log(`Found ${allProducts.length} products to process`);
      
      let totalFlavorsCreated = 0;
      let totalFlavorsSkipped = 0;
      let productsProcessed = 0;
      let productsSkipped = 0;
      const results: Array<{
        productId: string;
        productName: string;
        saboresCount: number;
        flavorsCreated: number;
        flavorsSkipped: number;
        status: 'processed' | 'skipped' | 'error';
        reason?: string;
      }> = [];

      for (const product of allProducts) {
        try {
          // Check if product already has flavors (idempotent check)
          const existingFlavors = await storage.getProductFlavors(product.id);
          
          if (existingFlavors.length > 0) {
            // Product already has flavors, skip it
            productsSkipped++;
            results.push({
              productId: product.id,
              productName: product.name,
              saboresCount: product.sabores.length,
              flavorsCreated: 0,
              flavorsSkipped: existingFlavors.length,
              status: 'skipped',
              reason: 'Product already has flavors'
            });
            console.log(`Skipping ${product.name} - already has ${existingFlavors.length} flavors`);
            continue;
          }

          // Check if product has sabores to migrate
          if (!product.sabores || product.sabores.length === 0) {
            productsSkipped++;
            results.push({
              productId: product.id,
              productName: product.name,
              saboresCount: 0,
              flavorsCreated: 0,
              flavorsSkipped: 0,
              status: 'skipped',
              reason: 'No sabores to migrate'
            });
            console.log(`Skipping ${product.name} - no sabores to migrate`);
            continue;
          }

          // Calculate inventory distribution
          const totalInventory = product.inventory || 0;
          const flavorCount = product.sabores.length;
          const baseInventoryPerFlavor = Math.floor(totalInventory / flavorCount);
          const remainder = totalInventory % flavorCount;

          console.log(`Migrating ${product.name}: ${flavorCount} flavors, ${totalInventory} total inventory`);
          console.log(`Base inventory per flavor: ${baseInventoryPerFlavor}, remainder: ${remainder}`);

          let productFlavorsCreated = 0;
          let productFlavorsSkipped = 0;

          // Create flavor entries for each sabor
          for (let i = 0; i < product.sabores.length; i++) {
            const flavorName = product.sabores[i].trim();
            
            if (!flavorName) {
              console.log(`Skipping empty flavor name for product ${product.name}`);
              continue;
            }

            // Calculate inventory for this flavor (distribute remainder to first N flavors)
            const flavorInventory = baseInventoryPerFlavor + (i < remainder ? 1 : 0);

            try {
              // Check if this exact flavor already exists (extra safety)
              const existingFlavorCheck = await db
                .select()
                .from(productFlavors)
                .where(eq(productFlavors.productId, product.id));
              
              const duplicateCheck = existingFlavorCheck.find(f => 
                f.name.toLowerCase().trim() === flavorName.toLowerCase().trim()
              );

              if (duplicateCheck) {
                productFlavorsSkipped++;
                console.log(`Skipping duplicate flavor ${flavorName} for ${product.name}`);
                continue;
              }

              // Create the flavor entry
              const flavorData = {
                productId: product.id,
                name: flavorName,
                inventory: flavorInventory,
                reservedInventory: 0,
                lowStockThreshold: 10,
                active: true
              };

              const newFlavor = await storage.createProductFlavor(flavorData);
              productFlavorsCreated++;
              console.log(`Created flavor: ${flavorName} with ${flavorInventory} inventory for ${product.name}`);
            } catch (flavorError: any) {
              console.error(`Error creating flavor ${flavorName} for ${product.name}:`, flavorError);
              // Continue with other flavors even if one fails
            }
          }

          productsProcessed++;
          totalFlavorsCreated += productFlavorsCreated;
          totalFlavorsSkipped += productFlavorsSkipped;

          results.push({
            productId: product.id,
            productName: product.name,
            saboresCount: product.sabores.length,
            flavorsCreated: productFlavorsCreated,
            flavorsSkipped: productFlavorsSkipped,
            status: 'processed'
          });

          console.log(`Completed ${product.name}: ${productFlavorsCreated} flavors created, ${productFlavorsSkipped} skipped`);

        } catch (productError: any) {
          console.error(`Error processing product ${product.name}:`, productError);
          results.push({
            productId: product.id,
            productName: product.name,
            saboresCount: product.sabores?.length || 0,
            flavorsCreated: 0,
            flavorsSkipped: 0,
            status: 'error',
            reason: productError.message
          });
        }
      }

      const summary = {
        totalProducts: allProducts.length,
        productsProcessed,
        productsSkipped,
        totalFlavorsCreated,
        totalFlavorsSkipped,
        results
      };

      console.log("Migration completed:", summary);

      res.json({
        success: true,
        message: `Migration completed: ${totalFlavorsCreated} flavors created, ${totalFlavorsSkipped} skipped across ${productsProcessed} products`,
        data: summary
      });

    } catch (error: any) {
      console.error("Migration failed:", error);
      res.status(500).json({ 
        error: `Migration failed: ${error.message}`,
        success: false 
      });
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

  // Homepage content management
  app.get("/api/admin/homepage-content", requireAuth, async (req, res) => {
    try {
      const content = await storage.getHomepageContent();
      res.json({ success: true, data: content });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/admin/homepage-content/:section", requireAuth, async (req, res) => {
    try {
      const { section } = req.params;
      
      // Validate section
      const validSections = ["navigation", "hero", "about", "products", "testimonials", "contact", "affiliates", "footer"];
      if (!validSections.includes(section)) {
        return res.status(400).json({ error: "Invalid section name" });
      }
      
      // Validate update data - allow partial updates for homepage content
      const allowedFields = ['title', 'subtitle', 'description', 'buttonText', 'buttonSecondaryText', 'buttonUrl', 'content', 'active'];
      const updateData = Object.keys(req.body)
        .filter(key => allowedFields.includes(key))
        .reduce((obj: any, key) => {
          obj[key] = req.body[key];
          return obj;
        }, {});
      
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: "No valid fields to update" });
      }
      
      const content = await storage.updateHomepageContentBySection(section, updateData);
      res.json({ success: true, data: content });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Seed homepage content from hardcoded components (DEVELOPMENT ONLY)
  app.post("/api/admin/homepage-content/seed", requireAuth, async (req, res) => {
    try {
      const defaultContent = [
        {
          section: "navigation",
          title: "Navigation",
          subtitle: "Header navigation content",
          description: "",
          buttonText: "",
          buttonSecondaryText: "",
          buttonUrl: "",
          content: JSON.stringify({
            logoAlt: "VAPEOLO",
            menuItems: {
              inicio: "Inicio",
              productos: "Productos",
              afiliados: "Afiliados",
              contacto: "Contacto"
            },
            buttons: {
              cart: "Carrito",
              login: "Iniciar Sesión",
              mobileMenu: "Menú"
            }
          }),
          active: true
        },
        {
          section: "hero",
          title: "VAPEOLO:",
          subtitle: "Donde la experiencia y el sabor se fusionan",
          description: "15 años diseñando los mejores cigarrillos electrónicos del mercado",
          buttonText: "Ver Productos",
          buttonSecondaryText: "Unirme como Afiliado",
          buttonUrl: "#productos",
          content: JSON.stringify({
            flavors: "Más de 25 sabores",
            puffs: "Hasta 20,000 puffs",
            shipping: "Envíos a todo el país"
          }),
          active: true
        },
        {
          section: "about",
          title: "¿Quiénes somos?",
          subtitle: "VAPEOLO es distribuidora oficial de LAVIE, una marca con más de 15 años de innovación en diseño y fabricación de vapes.",
          description: "Nuestra misión: redefinir el vapeo en Latinoamérica",
          buttonText: "",
          buttonSecondaryText: "",
          buttonUrl: "",
          content: JSON.stringify({
            highlights: [
              {
                title: "Presencia en más de 10 países",
                description: "Distribuyendo experiencias únicas a nivel internacional"
              },
              {
                title: "Baterías de larga duración",
                description: "Tecnología avanzada para máximo rendimiento"
              },
              {
                title: "Hasta 20,000 puffs por dispositivo",
                description: "La duración más larga del mercado"
              },
              {
                title: "Garantía de calidad",
                description: "15 años de experiencia y excelencia comprobada"
              }
            ],
            stats: {
              experience: "Años de experiencia",
              flavors: "Sabores disponibles",
              countries: "Países con presencia"
            }
          }),
          active: true
        },
        {
          section: "products",
          title: "Productos",
          subtitle: "Nuestra línea de vapes premium",
          description: "Descubre nuestra colección de dispositivos de vapeo",
          buttonText: "",
          buttonSecondaryText: "",
          buttonUrl: "",
          content: JSON.stringify({
            sectionTitle: "Productos",
            sectionSubtitle: "Encuentra tu vape perfecto",
            labels: {
              popular: "Popular",
              outOfStock: "Agotado",
              lowStock: "Pocas unidades",
              addToCart: "Agregar al carrito",
              selectFlavor: "Seleccionar sabor",
              inStock: "En stock"
            }
          }),
          active: true
        },
        {
          section: "testimonials",
          title: "Testimonios",
          subtitle: "Lo que dicen nuestros clientes y socios",
          description: "",
          buttonText: "",
          buttonSecondaryText: "",
          buttonUrl: "",
          content: JSON.stringify({
            socialPrompt: "Síguenos en redes sociales",
            socialPlatforms: [
              { platform: "Instagram", handle: "@lavievapes.gt", followers: "45.2K" },
              { platform: "TikTok", handle: "@lavievapes", followers: "32.8K" },
              { platform: "Facebook", handle: "LAVIE Vapes Guatemala", followers: "28.1K" }
            ],
            ctaPrompt: "Síguenos para contenido exclusivo",
            ctaFeatures: "📸 Fotos de clientes • 🎥 Reviews y unboxing • 🎁 Promos y giveaways"
          }),
          active: true
        },
        {
          section: "contact",
          title: "Contacto",
          subtitle: "Estamos aquí para ayudarte",
          description: "",
          buttonText: "",
          buttonSecondaryText: "",
          buttonUrl: "",
          content: JSON.stringify({
            formTitle: "Envíanos un mensaje",
            formLabels: {
              name: "Nombre completo",
              email: "Email",
              message: "Mensaje"
            },
            formPlaceholders: {
              name: "Tu nombre",
              email: "tu@email.com",
              message: "¿En qué podemos ayudarte?"
            },
            formButton: "Enviar mensaje",
            contactInfo: [
              {
                title: "WhatsApp",
                description: "¿Dudas? Escríbenos al instante",
                value: "+502 1234-5678",
                action: "Chatear ahora"
              },
              {
                title: "Email",
                description: "Contacto comercial",
                value: "info@lavievapes.gt",
                action: "Enviar email"
              },
              {
                title: "Ubicación",
                description: "Envíos a toda Guatemala",
                value: "Ciudad de Guatemala",
                action: "Ver cobertura"
              }
            ],
            shippingInfo: [
              {
                title: "Envíos a toda Guatemala",
                description: "Entregas en 24-72h hábiles"
              },
              {
                title: "Múltiples métodos de pago",
                description: "Tarjeta, transferencia, contra entrega"
              },
              {
                title: "Envío gratis",
                description: "En compras desde Q200"
              }
            ],
            paymentMethods: ["Tarjeta de crédito", "Transferencia", "Contra entrega"],
            shippingNotice: "* Contra entrega minimo de Q200 o costo de Q35 por envio"
          }),
          active: true
        },
        {
          section: "affiliates",
          title: "Programa de Afiliación",
          subtitle: "Gana mientras vapeas - ¡Haz parte de LAVIE!",
          description: "¿Quieres ganar dinero vendiendo vapes LAVIE? ¡Únete a VAPEOLO!",
          buttonText: "",
          buttonSecondaryText: "",
          buttonUrl: "",
          content: JSON.stringify({
            sectionSubtitle: "Únete a nuestro programa de afiliación",
            levels: [
              {
                id: "agente",
                name: "Agente",
                discount: "10% - 12%",
                minimum: "Q500",
                features: [
                  "Descuento del 10% al 12%",
                  "Monto mínimo de compra: Q500",
                  "Ideal para uso personal",
                  "Acceso a ofertas exclusivas"
                ]
              },
              {
                id: "distribuidor",
                name: "Distribuidor",
                discount: "25% - 30%",
                minimum: "Q1,500",
                features: [
                  "Descuento del 25% al 30%",
                  "Monto mínimo de compra: Q1,500",
                  "Para revendedores activos",
                  "Herramientas de marketing incluidas"
                ]
              },
              {
                id: "socio",
                name: "Socio",
                discount: "45% - 50%",
                minimum: "Q3,500",
                features: [
                  "Descuento del 45% al 50%",
                  "Monto mínimo de compra: Q3,500",
                  "Apoyo comercial personalizado",
                  "Beneficios exclusivos y prioridad de stock"
                ]
              }
            ],
            formTitle: "Registrarse como Afiliado",
            formLabels: {
              name: "Nombre completo",
              email: "Email",
              phone: "Teléfono",
              level: "Nivel de afiliación deseado",
              message: "Mensaje (opcional)"
            },
            formPlaceholders: {
              name: "Tu nombre completo",
              email: "tu@email.com",
              phone: "+502 1234-5678",
              message: "Cuéntanos sobre tu experiencia en ventas o por qué quieres ser parte de LAVIE..."
            },
            formButton: "Enviar Solicitud",
            levelOptions: [
              { label: "Agente (10-12%)", value: "agente" },
              { label: "Distribuidor (25-30%)", value: "distribuidor" },
              { label: "Socio (45-50%)", value: "socio" }
            ],
            messages: {
              success: {
                title: "¡Solicitud enviada!",
                description: "Nos pondremos en contacto contigo pronto para revisar tu aplicación."
              },
              error: {
                title: "Error",
                description: "No se pudo enviar la solicitud. Por favor, inténtalo de nuevo."
              }
            }
          }),
          active: true
        },
        {
          section: "footer",
          title: "Footer",
          subtitle: "Footer content and links",
          description: "",
          buttonText: "",
          buttonSecondaryText: "",
          buttonUrl: "",
          content: JSON.stringify({
            brandName: "VAPEOLO",
            brandDescription: "Distribuidora oficial de LAVIE con 15 años diseñando los mejores cigarrillos electrónicos del mercado. Donde la experiencia y el sabor se fusionan.",
            columns: {
              products: {
                title: "Productos",
                links: [
                  { name: "CYBER - 20,000 Puffs", href: "#productos" },
                  { name: "CUBE - 20,000 Puffs", href: "#productos" },
                  { name: "ENERGY - 15,000 Puffs", href: "#productos" },
                  { name: "TORCH - 6,000 Puffs", href: "#productos" },
                  { name: "BAR - 800 Puffs", href: "#productos" }
                ]
              },
              company: {
                title: "Empresa",
                links: [
                  { name: "Sobre LAVIE", href: "#inicio" },
                  { name: "Programa de Afiliación", href: "#afiliados" },
                  { name: "Testimonios", href: "#testimonios" },
                  { name: "Contacto", href: "#contacto" }
                ]
              },
              support: {
                title: "Soporte",
                links: [
                  { name: "Envíos y devoluciones", href: "#contacto" },
                  { name: "Métodos de pago", href: "#contacto" },
                  { name: "Preguntas frecuentes", href: "#contacto" },
                  { name: "Soporte técnico", href: "#contacto" }
                ]
              }
            },
            copyright: "© {currentYear} VAPEOLO - Distribuidora oficial LAVIE. Todos los derechos reservados.",
            legalLinks: [
              { name: "Términos y Condiciones", href: "#" },
              { name: "Política de Privacidad", href: "#" },
              { name: "Política de Cookies", href: "#" }
            ],
            ageWarning: "Este sitio web es solo para mayores de 18 años. Los productos de vapeo contienen nicotina, una sustancia química adictiva."
          }),
          active: true
        }
      ];

      const createdContent = [];
      for (const content of defaultContent) {
        // Check if content already exists for this section
        const existing = await storage.getHomepageContentBySection(content.section);
        if (!existing) {
          const created = await storage.createHomepageContent(content);
          createdContent.push(created);
        }
      }

      res.json({ 
        success: true, 
        message: `Seeded ${createdContent.length} homepage content sections`,
        data: createdContent
      });
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
