var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/env.ts
import dotenv from "dotenv";
dotenv.config();

// server/index.ts
import dotenv2 from "dotenv";
import express3 from "express";

// server/routes.ts
import express from "express";
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  adminResetPasswordSchema: () => adminResetPasswordSchema,
  affiliates: () => affiliates,
  affiliatesRelations: () => affiliatesRelations,
  changePasswordSchema: () => changePasswordSchema,
  contactMessages: () => contactMessages,
  getAvailableFlavors: () => getAvailableFlavors,
  getAvailableInventory: () => getAvailableInventory,
  getFlavorAvailableInventory: () => getFlavorAvailableInventory,
  getFlavorStockStatus: () => getFlavorStockStatus,
  getLowStockFlavors: () => getLowStockFlavors,
  getOutOfStockFlavors: () => getOutOfStockFlavors,
  getProductStockStatus: () => getProductStockStatus,
  getProductTotalAvailableInventory: () => getProductTotalAvailableInventory,
  getStockStatus: () => getStockStatus,
  homepageContent: () => homepageContent,
  insertAffiliateSchema: () => insertAffiliateSchema,
  insertContactMessageSchema: () => insertContactMessageSchema,
  insertHomepageContentSchema: () => insertHomepageContentSchema,
  insertProductFlavorSchema: () => insertProductFlavorSchema,
  insertProductSchema: () => insertProductSchema,
  insertSaleSchema: () => insertSaleSchema,
  insertUserSchema: () => insertUserSchema,
  isFlavorLowStock: () => isFlavorLowStock,
  isFlavorOutOfStock: () => isFlavorOutOfStock,
  isLowStock: () => isLowStock,
  isOutOfStock: () => isOutOfStock,
  isProductLowStock: () => isProductLowStock,
  isProductOutOfStock: () => isProductOutOfStock,
  productFlavors: () => productFlavors,
  productFlavorsRelations: () => productFlavorsRelations,
  products: () => products,
  productsRelations: () => productsRelations,
  sales: () => sales,
  salesRelations: () => salesRelations,
  updateHomepageContentSchema: () => updateHomepageContentSchema,
  updateProductFlavorSchema: () => updateProductFlavorSchema,
  updateSelfProfileSchema: () => updateSelfProfileSchema,
  updateUserSchema: () => updateUserSchema,
  users: () => users,
  usersRelations: () => usersRelations
});
import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, unique, check } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("sales"),
  // 'admin' | 'sales'
  active: boolean("active").notNull().default(true),
  // Granular permissions
  editInventory: boolean("edit_inventory").notNull().default(false),
  addProduct: boolean("add_product").notNull().default(false),
  deleteItems: boolean("delete_items").notNull().default(false),
  deleteAffiliate: boolean("delete_affiliate").notNull().default(false),
  authorizeAffiliate: boolean("authorize_affiliate").notNull().default(false),
  pauseAffiliate: boolean("pause_affiliate").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
});
var affiliates = pgTable("affiliates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  level: text("level").notNull(),
  // 'agente', 'distribuidor', 'socio'
  discount: decimal("discount", { precision: 5, scale: 2 }).notNull(),
  minimumPurchase: decimal("minimum_purchase", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  // 'pending', 'approved', 'rejected', 'standby'
  password: text("password"),
  // Para login de distribuidores (null si no aprobado)
  message: text("message"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  approvedAt: timestamp("approved_at"),
  approvedBy: varchar("approved_by").references(() => users.id)
});
var products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  puffs: integer("puffs").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  image: text("image"),
  sabores: text("sabores").array().notNull().default(sql`ARRAY[]::text[]`),
  description: text("description"),
  popular: boolean("popular").notNull().default(false),
  active: boolean("active").notNull().default(true),
  showOnHomepage: boolean("show_on_homepage").notNull().default(true),
  // Controls homepage visibility
  inventory: integer("inventory").notNull().default(0),
  // Total stock quantity
  reservedInventory: integer("reserved_inventory").notNull().default(0),
  // Items reserved in orders
  lowStockThreshold: integer("low_stock_threshold").notNull().default(10),
  // Reorder point
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
}, (table) => ({
  inventoryCheck: check("product_inventory_non_negative", sql`inventory >= 0`),
  reservedInventoryCheck: check("product_reserved_inventory_non_negative", sql`reserved_inventory >= 0`),
  priceCheck: check("product_price_positive", sql`price > 0`)
}));
var sales = pgTable("sales", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  affiliateId: varchar("affiliate_id").references(() => affiliates.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 5, scale: 2 }),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  customerName: text("customer_name"),
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone"),
  status: text("status").notNull().default("pending"),
  // 'pending', 'completed', 'cancelled'
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
});
var contactMessages = pgTable("contact_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("unread"),
  // 'unread', 'read', 'replied'
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
});
var homepageContent = pgTable("homepage_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  section: text("section").notNull().unique(),
  // 'navigation', 'hero', 'about', 'products', 'testimonials', 'contact', 'affiliates', 'footer'
  // Core content fields
  title: text("title"),
  subtitle: text("subtitle"),
  description: text("description"),
  buttonText: text("button_text"),
  buttonSecondaryText: text("button_secondary_text"),
  buttonUrl: text("button_url"),
  // JSON fields for complex content structures
  content: text("content"),
  // JSON string for complex nested content
  // Metadata
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at")
});
var productFlavors = pgTable("product_flavors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  // e.g., 'Mango Ice', 'Blueberry'
  inventory: integer("inventory").notNull().default(0),
  // Stock quantity for this flavor
  reservedInventory: integer("reserved_inventory").notNull().default(0),
  // Items reserved in orders
  lowStockThreshold: integer("low_stock_threshold").notNull().default(5),
  // Reorder point for flavor
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
}, (table) => ({
  uniqueProductFlavor: unique().on(table.productId, table.name),
  inventoryCheck: check("inventory_non_negative", sql`inventory >= 0`),
  reservedInventoryCheck: check("reserved_inventory_non_negative", sql`reserved_inventory >= 0`)
}));
var usersRelations = relations(users, ({ many }) => ({
  approvedAffiliates: many(affiliates)
}));
var affiliatesRelations = relations(affiliates, ({ one, many }) => ({
  approvedBy: one(users, {
    fields: [affiliates.approvedBy],
    references: [users.id]
  }),
  sales: many(sales)
}));
var productsRelations = relations(products, ({ many }) => ({
  sales: many(sales),
  flavors: many(productFlavors)
}));
var salesRelations = relations(sales, ({ one }) => ({
  affiliate: one(affiliates, {
    fields: [sales.affiliateId],
    references: [affiliates.id]
  }),
  product: one(products, {
    fields: [sales.productId],
    references: [products.id]
  })
}));
var productFlavorsRelations = relations(productFlavors, ({ one }) => ({
  product: one(products, {
    fields: [productFlavors.productId],
    references: [products.id]
  })
}));
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  active: true,
  editInventory: true,
  addProduct: true,
  deleteItems: true,
  deleteAffiliate: true,
  authorizeAffiliate: true,
  pauseAffiliate: true
});
var updateUserSchema = createInsertSchema(users).pick({
  username: true,
  role: true,
  active: true,
  editInventory: true,
  addProduct: true,
  deleteItems: true,
  deleteAffiliate: true,
  authorizeAffiliate: true,
  pauseAffiliate: true
}).partial();
var updateSelfProfileSchema = createInsertSchema(users).pick({
  username: true
}).partial();
var changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters").regex(/[A-Z]/, "Password must contain at least one uppercase letter").regex(/[a-z]/, "Password must contain at least one lowercase letter").regex(/[0-9]/, "Password must contain at least one number").regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "Password must contain at least one special character"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});
var adminResetPasswordSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters").regex(/[A-Z]/, "Password must contain at least one uppercase letter").regex(/[a-z]/, "Password must contain at least one lowercase letter").regex(/[0-9]/, "Password must contain at least one number").regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "Password must contain at least one special character"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});
var insertAffiliateSchema = createInsertSchema(affiliates).pick({
  name: true,
  email: true,
  phone: true,
  level: true,
  message: true
});
var insertProductSchema = createInsertSchema(products).pick({
  name: true,
  puffs: true,
  price: true,
  image: true,
  sabores: true,
  description: true,
  popular: true,
  active: true,
  showOnHomepage: true,
  inventory: true,
  reservedInventory: true,
  lowStockThreshold: true
});
var insertSaleSchema = createInsertSchema(sales).pick({
  affiliateId: true,
  productId: true,
  quantity: true,
  unitPrice: true,
  discount: true,
  totalAmount: true,
  customerName: true,
  customerEmail: true,
  customerPhone: true
});
var insertContactMessageSchema = createInsertSchema(contactMessages).pick({
  name: true,
  email: true,
  message: true
});
var insertHomepageContentSchema = createInsertSchema(homepageContent).pick({
  section: true,
  title: true,
  subtitle: true,
  description: true,
  buttonText: true,
  buttonSecondaryText: true,
  buttonUrl: true,
  content: true,
  active: true
});
var updateHomepageContentSchema = createInsertSchema(homepageContent).pick({
  title: true,
  subtitle: true,
  description: true,
  buttonText: true,
  buttonSecondaryText: true,
  buttonUrl: true,
  content: true,
  active: true
}).partial();
var insertProductFlavorSchema = createInsertSchema(productFlavors).pick({
  productId: true,
  name: true,
  inventory: true,
  reservedInventory: true,
  lowStockThreshold: true,
  active: true
});
var updateProductFlavorSchema = createInsertSchema(productFlavors).pick({
  name: true,
  inventory: true,
  reservedInventory: true,
  lowStockThreshold: true,
  active: true
}).partial();
function getFlavorAvailableInventory(flavor) {
  return Math.max(0, flavor.inventory - flavor.reservedInventory);
}
function isFlavorOutOfStock(flavor) {
  return !flavor.active || getFlavorAvailableInventory(flavor) === 0;
}
function isFlavorLowStock(flavor) {
  if (!flavor.active) return false;
  const available = getFlavorAvailableInventory(flavor);
  return available <= flavor.lowStockThreshold && available > 0;
}
function getFlavorStockStatus(flavor) {
  if (!flavor.active) return "out_of_stock";
  const available = getFlavorAvailableInventory(flavor);
  if (available === 0) return "out_of_stock";
  if (available <= flavor.lowStockThreshold) return "low_stock";
  return "in_stock";
}
function getAvailableInventory(product) {
  return Math.max(0, product.inventory - product.reservedInventory);
}
function isOutOfStock(product) {
  return getAvailableInventory(product) === 0;
}
function isLowStock(product) {
  return getAvailableInventory(product) <= product.lowStockThreshold && getAvailableInventory(product) > 0;
}
function getStockStatus(product) {
  const available = getAvailableInventory(product);
  if (available === 0) return "out_of_stock";
  if (available <= product.lowStockThreshold) return "low_stock";
  return "in_stock";
}
function getProductTotalAvailableInventory(flavors) {
  return flavors.filter((flavor) => flavor.active).reduce((total, flavor) => total + getFlavorAvailableInventory(flavor), 0);
}
function isProductOutOfStock(flavors) {
  const activeFlavors = flavors.filter((flavor) => flavor.active);
  if (activeFlavors.length === 0) return true;
  return activeFlavors.every((flavor) => isFlavorOutOfStock(flavor));
}
function isProductLowStock(flavors) {
  const activeFlavors = flavors.filter((flavor) => flavor.active);
  if (activeFlavors.length === 0) return false;
  return activeFlavors.some((flavor) => isFlavorLowStock(flavor)) && !isProductOutOfStock(flavors);
}
function getProductStockStatus(flavors) {
  if (isProductOutOfStock(flavors)) return "out_of_stock";
  if (isProductLowStock(flavors)) return "low_stock";
  return "in_stock";
}
function getAvailableFlavors(flavors) {
  return flavors.filter((flavor) => flavor.active && !isFlavorOutOfStock(flavor));
}
function getLowStockFlavors(flavors) {
  return flavors.filter((flavor) => flavor.active && isFlavorLowStock(flavor));
}
function getOutOfStockFlavors(flavors) {
  return flavors.filter((flavor) => flavor.active && isFlavorOutOfStock(flavor));
}

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, desc, sql as sql2, count } from "drizzle-orm";
var DatabaseStorage = class {
  // Users
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || void 0;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async listUsers() {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }
  async updateUser(id, updates) {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }
  async setUserPassword(id, hashedPassword) {
    const [user] = await db.update(users).set({ password: hashedPassword }).where(eq(users.id, id)).returning();
    return user;
  }
  async deleteUser(id) {
    await db.delete(users).where(eq(users.id, id));
  }
  // Affiliates
  async createAffiliate(affiliate) {
    const levelConfig = {
      agente: { discount: "11.00", minimumPurchase: "500.00" },
      distribuidor: { discount: "27.50", minimumPurchase: "1500.00" },
      socio: { discount: "47.50", minimumPurchase: "3500.00" }
    };
    const config = levelConfig[affiliate.level];
    const [newAffiliate] = await db.insert(affiliates).values({
      ...affiliate,
      discount: config.discount,
      minimumPurchase: config.minimumPurchase
    }).returning();
    return newAffiliate;
  }
  async getAffiliates() {
    return await db.select().from(affiliates).orderBy(desc(affiliates.createdAt));
  }
  async getAffiliate(id) {
    const [affiliate] = await db.select().from(affiliates).where(eq(affiliates.id, id));
    return affiliate || void 0;
  }
  async getAffiliateByEmail(email) {
    const [affiliate] = await db.select().from(affiliates).where(eq(affiliates.email, email));
    return affiliate || void 0;
  }
  async updateAffiliateStatus(id, status, approvedBy) {
    const updateData = { status };
    if (status === "approved") {
      updateData.approvedAt = sql2`now()`;
      if (approvedBy) updateData.approvedBy = approvedBy;
    }
    const [affiliate] = await db.update(affiliates).set(updateData).where(eq(affiliates.id, id)).returning();
    return affiliate;
  }
  async updateAffiliatePassword(id, hashedPassword) {
    const [affiliate] = await db.update(affiliates).set({ password: hashedPassword }).where(eq(affiliates.id, id)).returning();
    return affiliate;
  }
  async deleteAffiliate(id) {
    await db.delete(affiliates).where(eq(affiliates.id, id));
  }
  // Products
  async getProducts() {
    return await db.select().from(products).orderBy(desc(products.createdAt));
  }
  async getActiveProducts() {
    const allActiveProducts = await db.select().from(products).where(eq(products.active, true));
    const productsWithAvailability = [];
    for (const product of allActiveProducts) {
      const flavors = await this.getProductFlavors(product.id);
      if (flavors.length > 0) {
        const activeFlavors = flavors.filter((f) => f.active);
        if (activeFlavors.length > 0 && !isProductOutOfStock(activeFlavors)) {
          productsWithAvailability.push(product);
        }
      } else {
        if (getAvailableInventory(product) > 0) {
          productsWithAvailability.push(product);
        }
      }
    }
    return productsWithAvailability;
  }
  async getProduct(id) {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || void 0;
  }
  async createProduct(product) {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }
  async updateProduct(id, product) {
    const [updatedProduct] = await db.update(products).set(product).where(eq(products.id, id)).returning();
    return updatedProduct;
  }
  async deleteProduct(id) {
    await db.delete(productFlavors).where(eq(productFlavors.productId, id));
    await db.delete(products).where(eq(products.id, id));
  }
  // Product Flavors
  async getProductFlavors(productId) {
    return await db.select().from(productFlavors).where(eq(productFlavors.productId, productId)).orderBy(desc(productFlavors.createdAt));
  }
  async getProductFlavor(flavorId) {
    const [flavor] = await db.select().from(productFlavors).where(eq(productFlavors.id, flavorId));
    return flavor || void 0;
  }
  async createProductFlavor(flavor) {
    const [newFlavor] = await db.insert(productFlavors).values(flavor).returning();
    return newFlavor;
  }
  async updateProductFlavor(flavorId, flavor) {
    const [updatedFlavor] = await db.update(productFlavors).set(flavor).where(eq(productFlavors.id, flavorId)).returning();
    return updatedFlavor;
  }
  async deleteProductFlavor(flavorId) {
    await db.delete(productFlavors).where(eq(productFlavors.id, flavorId));
  }
  // Sales
  async createSale(sale) {
    const [newSale] = await db.insert(sales).values(sale).returning();
    return newSale;
  }
  async getSale(id) {
    const [sale] = await db.select().from(sales).where(eq(sales.id, id));
    return sale || void 0;
  }
  async getSales() {
    return await db.select().from(sales).orderBy(desc(sales.createdAt));
  }
  async getSalesByAffiliate(affiliateId) {
    return await db.select().from(sales).where(eq(sales.affiliateId, affiliateId));
  }
  async updateSaleStatus(id, status) {
    const [sale] = await db.update(sales).set({ status }).where(eq(sales.id, id)).returning();
    return sale;
  }
  // Contact Messages
  async createContactMessage(message) {
    const [newMessage] = await db.insert(contactMessages).values(message).returning();
    return newMessage;
  }
  async getContactMessages() {
    return await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  }
  async updateContactMessageStatus(id, status) {
    const [message] = await db.update(contactMessages).set({ status }).where(eq(contactMessages.id, id)).returning();
    return message;
  }
  // Homepage Content
  async getHomepageContent() {
    return await db.select().from(homepageContent).orderBy(desc(homepageContent.createdAt));
  }
  async getHomepageContentBySection(section) {
    const [content] = await db.select().from(homepageContent).where(eq(homepageContent.section, section));
    return content || void 0;
  }
  async createHomepageContent(content) {
    const [newContent] = await db.insert(homepageContent).values(content).returning();
    return newContent;
  }
  async updateHomepageContentBySection(section, content) {
    const updateData = {
      ...content,
      updatedAt: sql2`now()`
    };
    const [updatedContent] = await db.update(homepageContent).set(updateData).where(eq(homepageContent.section, section)).returning();
    return updatedContent;
  }
  // Dashboard Stats
  async getDashboardStats() {
    const [affiliateStats] = await db.select({
      total: count(),
      pending: sql2`count(*) filter (where status = 'pending')`
    }).from(affiliates);
    const [salesStats] = await db.select({
      total: count(),
      revenue: sql2`coalesce(sum(total_amount), 0)`
    }).from(sales);
    const [messageStats] = await db.select({
      unread: sql2`count(*) filter (where status = 'unread')`
    }).from(contactMessages);
    return {
      totalAffiliates: Number(affiliateStats.total),
      pendingAffiliates: Number(affiliateStats.pending),
      totalSales: Number(salesStats.total),
      totalRevenue: salesStats.revenue || "0",
      unreadMessages: Number(messageStats.unread)
    };
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import { eq as eq2 } from "drizzle-orm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import multer from "multer";
import path from "path";
import fs from "fs";
var JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";
if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  console.error("FATAL: JWT_SECRET environment variable must be set for production");
  process.exit(1);
}
if (process.env.NODE_ENV === "production" && JWT_SECRET === "dev-secret-key") {
  console.error("FATAL: Production must use secure JWT_SECRET, not development default");
  process.exit(1);
}
function validatePasswordStrength(password) {
  const errors = [];
  if (password.length < 8) {
    errors.push("La contrase\xF1a debe tener al menos 8 caracteres");
  }
  if (password.length > 100) {
    errors.push("La contrase\xF1a no puede tener m\xE1s de 100 caracteres");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("La contrase\xF1a debe contener al menos una letra may\xFAscula");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("La contrase\xF1a debe contener al menos una letra min\xFAscula");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("La contrase\xF1a debe contener al menos un n\xFAmero");
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("La contrase\xF1a debe contener al menos un car\xE1cter especial");
  }
  const commonPatterns = [
    /123456/,
    /password/,
    /admin/,
    /qwerty/,
    /letmein/,
    /welcome/,
    /monkey/,
    /dragon/,
    /pass/,
    /master/,
    /login/,
    /vapeolo/
  ];
  for (const pattern of commonPatterns) {
    if (pattern.test(password.toLowerCase())) {
      errors.push("La contrase\xF1a no puede contener patrones comunes");
      break;
    }
  }
  return {
    isValid: errors.length === 0,
    errors
  };
}
var failedAttempts = /* @__PURE__ */ new Map();
function checkAndUpdateFailedAttempts(email) {
  const key = email.toLowerCase();
  const attempt = failedAttempts.get(key);
  const now = /* @__PURE__ */ new Date();
  if (!attempt) {
    failedAttempts.set(key, { count: 1, lastAttempt: now });
    return true;
  }
  if (now.getTime() - attempt.lastAttempt.getTime() > 60 * 60 * 1e3) {
    failedAttempts.set(key, { count: 1, lastAttempt: now });
    return true;
  }
  if (attempt.count >= 5) {
    return false;
  }
  failedAttempts.set(key, { count: attempt.count + 1, lastAttempt: now });
  return true;
}
function clearFailedAttempts(email) {
  failedAttempts.delete(email.toLowerCase());
}
var storage_config = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), "public", "uploads", "products");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  }
});
var upload = multer({
  storage: storage_config,
  limits: {
    fileSize: 5 * 1024 * 1024
    // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (JPEG, PNG, WebP) are allowed"));
    }
  }
});
async function registerRoutes(app2) {
  app2.use(express.json());
  app2.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));
  const publicRateLimit = rateLimit({
    windowMs: 15 * 60 * 1e3,
    // 15 minutes
    max: 10,
    // limit each IP to 10 requests per windowMs
    message: { error: "Too many requests, please try again later" }
  });
  const loginRateLimit = rateLimit({
    windowMs: 15 * 60 * 1e3,
    // 15 minutes
    max: 5,
    // limit each IP to 5 login attempts per windowMs
    message: { error: "Too many login attempts, please try again later" },
    standardHeaders: true,
    legacyHeaders: false
  });
  const requireAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Authorization required" });
    }
    const [type, token] = authHeader.split(" ");
    if (type !== "Bearer") {
      return res.status(401).json({ error: "Bearer token required" });
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await storage.getUser(decoded.userId);
      if (!user) {
        return res.status(401).json({ error: "Invalid token" });
      }
      if (!user.active) {
        return res.status(401).json({ error: "Account deactivated" });
      }
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ error: "Invalid token" });
    }
  };
  const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
      const authReq = req;
      if (!authReq.user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      if (!allowedRoles.includes(authReq.user.role)) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }
      next();
    };
  };
  const requirePermission = (...permissions) => {
    return (req, res, next) => {
      const authReq = req;
      if (!authReq.user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      if (authReq.user.role === "admin") {
        return next();
      }
      const hasAllPermissions = permissions.every((permission) => {
        return authReq.user[permission] === true;
      });
      if (!hasAllPermissions) {
        return res.status(403).json({ error: "Insufficient permissions for this operation" });
      }
      next();
    };
  };
  app2.post("/api/affiliates", publicRateLimit, async (req, res) => {
    try {
      const validatedData = insertAffiliateSchema.parse(req.body);
      const affiliate = await storage.createAffiliate(validatedData);
      res.json({ success: true, data: affiliate });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.post("/api/contact", publicRateLimit, async (req, res) => {
    try {
      const validatedData = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(validatedData);
      res.json({ success: true, data: message });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.get("/api/products", async (req, res) => {
    try {
      const availableProducts = await storage.getActiveProducts();
      const homepageProducts = availableProducts.filter((product) => product.showOnHomepage);
      const productsWithFlavors = [];
      for (const product of homepageProducts) {
        const flavors = await storage.getProductFlavors(product.id);
        if (flavors.length === 0) {
          productsWithFlavors.push({
            ...product,
            flavors: []
          });
        } else {
          const activeFlavors = flavors.filter((flavor) => flavor.active);
          const availableFlavors = activeFlavors.filter((flavor) => {
            return !isFlavorOutOfStock(flavor);
          });
          if (availableFlavors.length > 0) {
            productsWithFlavors.push({
              ...product,
              flavors: availableFlavors
              // Only return available flavors
            });
          }
        }
      }
      res.json({ success: true, data: productsWithFlavors });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/orders", publicRateLimit, async (req, res) => {
    try {
      const { cartItems, customerData } = req.body;
      if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
        return res.status(400).json({ error: "Cart items are required" });
      }
      if (!customerData || !customerData.firstName || !customerData.phone) {
        return res.status(400).json({ error: "Customer data is required" });
      }
      const orderItems = [];
      for (const item of cartItems) {
        if (!item.id || !item.flavor || !item.quantity || item.quantity <= 0) {
          return res.status(400).json({ error: "Invalid cart item format" });
        }
        const product = await storage.getProduct(item.id);
        if (!product) {
          return res.status(400).json({ error: `Product not found: ${item.id}` });
        }
        const flavors = await storage.getProductFlavors(product.id);
        const flavor = flavors.find((f) => f.name === item.flavor && f.active);
        if (!flavor) {
          return res.status(400).json({ error: `Flavor not available: ${item.flavor}` });
        }
        const availableInventory = Math.max(0, flavor.inventory - flavor.reservedInventory);
        if (availableInventory < item.quantity) {
          return res.status(400).json({
            error: `Insufficient inventory for ${product.name} - ${flavor.name}. Available: ${availableInventory}, Requested: ${item.quantity}`
          });
        }
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
      const orderTotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
      const saleData = {
        productId: orderItems[0].productId,
        // Use first product as main product
        quantity: orderItems.reduce((sum, item) => sum + item.quantity, 0),
        unitPrice: (orderTotal / orderItems.reduce((sum, item) => sum + item.quantity, 0)).toFixed(2),
        totalAmount: orderTotal.toFixed(2),
        customerName: `${customerData.firstName} ${customerData.lastName}`,
        customerEmail: customerData.email || "",
        customerPhone: customerData.phone,
        discount: "0"
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
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/homepage-content", async (req, res) => {
    try {
      const allContent = await storage.getHomepageContent();
      const activeContent = allContent.filter((content) => content.active);
      const contentMap = activeContent.reduce((acc, content) => {
        acc[content.section] = {
          title: content.title,
          subtitle: content.subtitle,
          description: content.description,
          buttonText: content.buttonText,
          buttonUrl: content.buttonUrl,
          content: content.content
        };
        return acc;
      }, {});
      res.json({ success: true, data: contentMap });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/admin/products/upload-image", requireAuth, requirePermission("addProduct"), upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }
      const imagePath = `products/${req.file.filename}`;
      res.json({
        success: true,
        data: {
          imagePath,
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size
        }
      });
    } catch (error) {
      res.status(400).json({ error: error.message || "Failed to upload image" });
    }
  });
  app2.post("/api/admin/login", loginRateLimit, async (req, res) => {
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
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: "24h" }
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
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/admin/me", requireAuth, async (req, res) => {
    try {
      const user = req.user;
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
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.patch("/api/admin/me", requireAuth, async (req, res) => {
    try {
      const validatedData = updateSelfProfileSchema.parse(req.body);
      const updatedUser = await storage.updateUser(req.user.id, validatedData);
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
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.patch("/api/admin/me/password", requireAuth, async (req, res) => {
    try {
      const validatedData = changePasswordSchema.parse(req.body);
      const isValidPassword = await bcrypt.compare(validatedData.currentPassword, req.user.password);
      if (!isValidPassword) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }
      const passwordValidation = validatePasswordStrength(validatedData.newPassword);
      if (!passwordValidation.isValid) {
        return res.status(400).json({
          error: "Password validation failed",
          details: passwordValidation.errors
        });
      }
      const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10);
      await storage.setUserPassword(req.user.id, hashedPassword);
      res.json({ success: true, data: { message: "Password updated successfully" } });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.get("/api/admin/users", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const users2 = await storage.listUsers();
      const safeUsers = users2.map((user) => ({
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
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/admin/users", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const passwordValidation = validatePasswordStrength(validatedData.password);
      if (!passwordValidation.isValid) {
        return res.status(400).json({
          error: "Password validation failed",
          details: passwordValidation.errors
        });
      }
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
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
    } catch (error) {
      if (error.code === "23505") {
        res.status(400).json({ error: "Username already exists" });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  });
  app2.patch("/api/admin/users/:id", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = updateUserSchema.parse(req.body);
      if (validatedData.active === false) {
        const targetUser = await storage.getUser(id);
        if (targetUser && targetUser.role === "admin") {
          const allUsers = await storage.listUsers();
          const activeAdmins = allUsers.filter((u) => u.role === "admin" && u.active && u.id !== id);
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
    } catch (error) {
      if (error.code === "23505") {
        res.status(400).json({ error: "Username already exists" });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  });
  app2.patch("/api/admin/users/:id/password", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = adminResetPasswordSchema.parse(req.body);
      const passwordValidation = validatePasswordStrength(validatedData.newPassword);
      if (!passwordValidation.isValid) {
        return res.status(400).json({
          error: "Password validation failed",
          details: passwordValidation.errors
        });
      }
      const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10);
      await storage.setUserPassword(id, hashedPassword);
      res.json({ success: true, data: { message: "Password reset successfully" } });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.delete("/api/admin/users/:id", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const { id } = req.params;
      const currentUserId = req.user.id;
      if (id === currentUserId) {
        return res.status(400).json({ error: "No puedes eliminar tu propia cuenta" });
      }
      const userToDelete = await storage.getUser(id);
      if (!userToDelete) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
      const allUsers = await storage.listUsers();
      const activeAdmins = allUsers.filter((user) => user.role === "admin" && user.active);
      if (userToDelete.role === "admin" && userToDelete.active && activeAdmins.length <= 1) {
        return res.status(400).json({ error: "No puedes eliminar el \xFAltimo administrador activo" });
      }
      await storage.deleteUser(id);
      res.json({ success: true, data: { message: "Usuario eliminado exitosamente" } });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.post("/api/auth/distributor/login", loginRateLimit, async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email y contrase\xF1a son requeridos" });
      }
      if (!checkAndUpdateFailedAttempts(email)) {
        return res.status(429).json({ error: "Demasiados intentos fallidos. Intenta de nuevo en una hora." });
      }
      const affiliate = await storage.getAffiliateByEmail(email);
      if (!affiliate) {
        return res.status(401).json({ error: "Credenciales inv\xE1lidas" });
      }
      if (affiliate.status !== "approved") {
        return res.status(401).json({ error: "Tu cuenta a\xFAn no ha sido aprobada" });
      }
      if (!affiliate.password) {
        return res.status(401).json({ error: "Tu cuenta no tiene contrase\xF1a asignada. Contacta al administrador." });
      }
      const isValidPassword = await bcrypt.compare(password, affiliate.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Credenciales inv\xE1lidas" });
      }
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
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/admin/dashboard", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/admin/affiliates", requireAuth, async (req, res) => {
    try {
      const affiliates2 = await storage.getAffiliates();
      res.json({ success: true, data: affiliates2 });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.patch("/api/admin/affiliates/:id/status", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!status || !["pending", "approved", "rejected", "standby"].includes(status)) {
        return res.status(400).json({ error: "Invalid status value" });
      }
      const authReq = req;
      if (authReq.user.role !== "admin") {
        if (status === "approved" && !authReq.user.authorizeAffiliate) {
          return res.status(403).json({ error: "Insufficient permissions to authorize affiliates" });
        }
        if (status === "standby" && !authReq.user.pauseAffiliate) {
          return res.status(403).json({ error: "Insufficient permissions to pause affiliates" });
        }
      }
      const affiliate = await storage.updateAffiliateStatus(id, status, req.user.id);
      res.json({ success: true, data: affiliate });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.patch("/api/admin/affiliates/:id/password", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { password } = req.body;
      if (!password) {
        return res.status(400).json({ error: "Contrase\xF1a es requerida" });
      }
      const validation = validatePasswordStrength(password);
      if (!validation.isValid) {
        return res.status(400).json({
          error: "Contrase\xF1a no cumple con los requisitos de seguridad",
          details: validation.errors
        });
      }
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
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
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.delete("/api/admin/affiliates/:id", requireAuth, requirePermission("deleteAffiliate"), async (req, res) => {
    try {
      const { id } = req.params;
      const affiliate = await storage.getAffiliate(id);
      if (!affiliate) {
        return res.status(404).json({ error: "Affiliate not found" });
      }
      await storage.deleteAffiliate(id);
      res.json({
        success: true,
        message: "Affiliate deleted successfully"
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/admin/products", requireAuth, async (req, res) => {
    try {
      const products3 = await storage.getProducts();
      const productsWithFlavors = [];
      for (const product of products3) {
        const flavors = await storage.getProductFlavors(product.id);
        productsWithFlavors.push({
          ...product,
          flavors
          // Include all flavors for admin view
        });
      }
      res.json({ success: true, data: productsWithFlavors });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/admin/products", requireAuth, requirePermission("addProduct"), async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.json({ success: true, data: product });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.patch("/api/admin/products/:id", requireAuth, requirePermission("editInventory"), async (req, res) => {
    try {
      const { id } = req.params;
      const allowedFields = ["name", "puffs", "price", "image", "sabores", "description", "popular", "active", "inventory", "reservedInventory", "lowStockThreshold"];
      const updateData = Object.keys(req.body).filter((key) => allowedFields.includes(key)).reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: "No valid fields to update" });
      }
      const inventoryFields = ["inventory", "reservedInventory", "lowStockThreshold"];
      const isUpdatingInventory = inventoryFields.some((field) => field in updateData);
      if (isUpdatingInventory) {
        const authReq = req;
        if (authReq.user.role !== "admin" && !authReq.user.editInventory) {
          return res.status(403).json({ error: "Insufficient permissions to edit inventory" });
        }
      }
      if ("inventory" in updateData) {
        if (!Number.isInteger(updateData.inventory) || updateData.inventory < 0) {
          return res.status(400).json({ error: "Inventory must be a non-negative integer" });
        }
      }
      if ("reservedInventory" in updateData) {
        if (!Number.isInteger(updateData.reservedInventory) || updateData.reservedInventory < 0) {
          return res.status(400).json({ error: "Reserved inventory must be a non-negative integer" });
        }
      }
      if ("lowStockThreshold" in updateData) {
        if (!Number.isInteger(updateData.lowStockThreshold) || updateData.lowStockThreshold < 0) {
          return res.status(400).json({ error: "Low stock threshold must be a non-negative integer" });
        }
      }
      if ("inventory" in updateData && "reservedInventory" in updateData) {
        if (updateData.reservedInventory > updateData.inventory) {
          return res.status(400).json({ error: "Reserved inventory cannot exceed total inventory" });
        }
      } else if ("reservedInventory" in updateData) {
        const currentProduct = await storage.getProduct(id);
        if (!currentProduct) {
          return res.status(404).json({ error: "Product not found" });
        }
        if (updateData.reservedInventory > currentProduct.inventory) {
          return res.status(400).json({ error: "Reserved inventory cannot exceed total inventory" });
        }
      } else if ("inventory" in updateData) {
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
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.delete("/api/admin/products/:id", requireAuth, requirePermission("deleteItems"), async (req, res) => {
    try {
      const { id } = req.params;
      const existingProduct = await storage.getProduct(id);
      if (!existingProduct) {
        return res.status(404).json({ error: "Product not found" });
      }
      const sales2 = await storage.getSales();
      const productSales = sales2.filter((sale) => sale.productId === id);
      if (productSales.length > 0) {
        return res.status(400).json({
          error: "Cannot delete product with existing sales. Consider deactivating it instead.",
          suggestion: "Set the product as inactive to hide it from customers while preserving sales history."
        });
      }
      await storage.deleteProduct(id);
      res.json({ success: true, message: "Product and associated flavors deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/admin/products/seed", requireAuth, requirePermission("addProduct"), async (req, res) => {
    try {
      const hardcodedProducts = [
        {
          id: "cyber",
          name: "CYBER",
          puffs: "20,000 Puffs",
          price: "Q240",
          sabores: ["Mango Ice", "Blueberry", "Cola", "Grape", "Sand\xEDa Chill"],
          popular: true,
          description: "Vape premium CYBER con 20,000 puffs y una gran variedad de sabores refrescantes. Ideal para sesiones prolongadas con calidad superior."
        },
        {
          id: "cube",
          name: "CUBE",
          puffs: "20,000 Puffs",
          price: "Q220",
          sabores: ["Strawberry Kiwi", "Menta", "Cola", "Frutas Tropicales", "Pi\xF1a"],
          description: "Vape CUBE con dise\xF1o moderno y 20,000 puffs. Perfecto equilibrio entre sabor y duraci\xF3n con sabores \xFAnicos."
        },
        {
          id: "energy",
          name: "ENERGY",
          puffs: "15,000 Puffs",
          price: "Q170",
          sabores: ["Blue Razz", "Mango Chill", "Fresa", "Cereza", "Uva"],
          description: "Vape ENERGY con 15,000 puffs y sabores intensos. Dise\xF1ado para darte la energ\xEDa que necesitas durante todo el d\xEDa."
        },
        {
          id: "torch",
          name: "TORCH",
          puffs: "6,000 Puffs",
          price: "Q125",
          sabores: ["Menta", "Banana Ice", "Frutos Rojos", "Chicle", "Limonada"],
          description: "Vape TORCH compacto con 6,000 puffs. Perfecto para llevarlo contigo con sabores frescos y vibrantes."
        },
        {
          id: "bar",
          name: "BAR",
          puffs: "800 Puffs",
          price: "Q65",
          sabores: ["Sand\xEDa", "Uva", "Cola", "Mango", "Pi\xF1a Colada"],
          description: "Vape BAR econ\xF3mico con 800 puffs. Ideal para quienes buscan una opci\xF3n accesible sin comprometer la calidad del sabor."
        }
      ];
      const imageMapping = {
        "CYBER": "CYBER_1757558165027.png",
        "CUBE": "CUBE_1757558165026.png",
        "ENERGY": "ENERGY_1757558165028.png",
        "TORCH": "TORCH (1)_1757558165028.png",
        "BAR": "BAR (1)_1757558165026.png"
      };
      const transformedProducts = hardcodedProducts.map((product) => ({
        name: product.name,
        puffs: parseInt(product.puffs.replace(/[,\s]/g, "").replace("Puffs", "")),
        // Convert "20,000 Puffs" to 20000
        price: product.price.replace("Q", ""),
        // Convert "Q240" to "240.00"
        image: imageMapping[product.name] || null,
        // Map product name to image filename
        sabores: product.sabores,
        description: product.description,
        popular: product.popular || false,
        active: true,
        inventory: 100,
        // Default inventory
        reservedInventory: 0,
        // Default reserved
        lowStockThreshold: 10
        // Default threshold
      }));
      const existingProducts = await storage.getProducts();
      const existingNames = new Set(existingProducts.map((p) => p.name));
      let createdCount = 0;
      let skippedCount = 0;
      const results = [];
      for (const productData of transformedProducts) {
        if (existingNames.has(productData.name)) {
          skippedCount++;
          results.push({
            name: productData.name,
            status: "skipped",
            reason: "Product already exists"
          });
        } else {
          try {
            const validatedData = insertProductSchema.parse(productData);
            const product = await storage.createProduct(validatedData);
            createdCount++;
            results.push({
              name: product.name,
              status: "created",
              id: product.id
            });
          } catch (error) {
            results.push({
              name: productData.name,
              status: "error",
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
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/admin/products/:productId/flavors", requireAuth, async (req, res) => {
    try {
      const { productId } = req.params;
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      const flavors = await storage.getProductFlavors(productId);
      res.json({ success: true, data: flavors });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/admin/products/:productId/flavors", requireAuth, requirePermission("editInventory"), async (req, res) => {
    try {
      const { productId } = req.params;
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      const flavorData = { ...req.body, productId };
      const validatedData = insertProductFlavorSchema.parse(flavorData);
      if (typeof validatedData.reservedInventory === "number" && typeof validatedData.inventory === "number") {
        if (validatedData.reservedInventory > validatedData.inventory) {
          return res.status(400).json({ error: "Reserved inventory cannot exceed total inventory" });
        }
      }
      const flavor = await storage.createProductFlavor(validatedData);
      res.json({ success: true, data: flavor });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.patch("/api/admin/flavors/:flavorId", requireAuth, requirePermission("editInventory"), async (req, res) => {
    try {
      const { flavorId } = req.params;
      const existingFlavor = await storage.getProductFlavor(flavorId);
      if (!existingFlavor) {
        return res.status(404).json({ error: "Flavor not found" });
      }
      const validatedData = updateProductFlavorSchema.parse(req.body);
      if ("inventory" in validatedData && "reservedInventory" in validatedData) {
        if (typeof validatedData.reservedInventory === "number" && typeof validatedData.inventory === "number") {
          if (validatedData.reservedInventory > validatedData.inventory) {
            return res.status(400).json({ error: "Reserved inventory cannot exceed total inventory" });
          }
        }
      } else if ("reservedInventory" in validatedData) {
        if (typeof validatedData.reservedInventory === "number") {
          if (validatedData.reservedInventory > existingFlavor.inventory) {
            return res.status(400).json({ error: "Reserved inventory cannot exceed total inventory" });
          }
        }
      } else if ("inventory" in validatedData) {
        if (typeof validatedData.inventory === "number") {
          if (validatedData.inventory < existingFlavor.reservedInventory) {
            return res.status(400).json({ error: "Inventory cannot be less than currently reserved inventory" });
          }
        }
      }
      const flavor = await storage.updateProductFlavor(flavorId, validatedData);
      res.json({ success: true, data: flavor });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.delete("/api/admin/flavors/:flavorId", requireAuth, requirePermission("deleteItems"), async (req, res) => {
    try {
      const { flavorId } = req.params;
      const existingFlavor = await storage.getProductFlavor(flavorId);
      if (!existingFlavor) {
        return res.status(404).json({ error: "Flavor not found" });
      }
      await storage.deleteProductFlavor(flavorId);
      res.json({ success: true, message: "Flavor deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/admin/migrate-flavors", requireAuth, requirePermission("editInventory"), async (req, res) => {
    try {
      console.log("Starting sabores migration...");
      const allProducts = await storage.getProducts();
      console.log(`Found ${allProducts.length} products to process`);
      let totalFlavorsCreated = 0;
      let totalFlavorsSkipped = 0;
      let productsProcessed = 0;
      let productsSkipped = 0;
      const results = [];
      for (const product of allProducts) {
        try {
          const existingFlavors = await storage.getProductFlavors(product.id);
          if (existingFlavors.length > 0) {
            productsSkipped++;
            results.push({
              productId: product.id,
              productName: product.name,
              saboresCount: product.sabores.length,
              flavorsCreated: 0,
              flavorsSkipped: existingFlavors.length,
              status: "skipped",
              reason: "Product already has flavors"
            });
            console.log(`Skipping ${product.name} - already has ${existingFlavors.length} flavors`);
            continue;
          }
          if (!product.sabores || product.sabores.length === 0) {
            productsSkipped++;
            results.push({
              productId: product.id,
              productName: product.name,
              saboresCount: 0,
              flavorsCreated: 0,
              flavorsSkipped: 0,
              status: "skipped",
              reason: "No sabores to migrate"
            });
            console.log(`Skipping ${product.name} - no sabores to migrate`);
            continue;
          }
          const totalInventory = product.inventory || 0;
          const flavorCount = product.sabores.length;
          const baseInventoryPerFlavor = Math.floor(totalInventory / flavorCount);
          const remainder = totalInventory % flavorCount;
          console.log(`Migrating ${product.name}: ${flavorCount} flavors, ${totalInventory} total inventory`);
          console.log(`Base inventory per flavor: ${baseInventoryPerFlavor}, remainder: ${remainder}`);
          let productFlavorsCreated = 0;
          let productFlavorsSkipped = 0;
          for (let i = 0; i < product.sabores.length; i++) {
            const flavorName = product.sabores[i].trim();
            if (!flavorName) {
              console.log(`Skipping empty flavor name for product ${product.name}`);
              continue;
            }
            const flavorInventory = baseInventoryPerFlavor + (i < remainder ? 1 : 0);
            try {
              const existingFlavorCheck = await db.select().from(productFlavors).where(eq2(productFlavors.productId, product.id));
              const duplicateCheck = existingFlavorCheck.find(
                (f) => f.name.toLowerCase().trim() === flavorName.toLowerCase().trim()
              );
              if (duplicateCheck) {
                productFlavorsSkipped++;
                console.log(`Skipping duplicate flavor ${flavorName} for ${product.name}`);
                continue;
              }
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
            } catch (flavorError) {
              console.error(`Error creating flavor ${flavorName} for ${product.name}:`, flavorError);
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
            status: "processed"
          });
          console.log(`Completed ${product.name}: ${productFlavorsCreated} flavors created, ${productFlavorsSkipped} skipped`);
        } catch (productError) {
          console.error(`Error processing product ${product.name}:`, productError);
          results.push({
            productId: product.id,
            productName: product.name,
            saboresCount: product.sabores?.length || 0,
            flavorsCreated: 0,
            flavorsSkipped: 0,
            status: "error",
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
    } catch (error) {
      console.error("Migration failed:", error);
      res.status(500).json({
        error: `Migration failed: ${error.message}`,
        success: false
      });
    }
  });
  app2.get("/api/admin/sales", requireAuth, async (req, res) => {
    try {
      const sales2 = await storage.getSales();
      res.json({ success: true, data: sales2 });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/admin/sales", requireAuth, async (req, res) => {
    try {
      const validatedData = insertSaleSchema.parse(req.body);
      const sale = await storage.createSale(validatedData);
      res.json({ success: true, data: sale });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.patch("/api/admin/sales/:id/status", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!status || !["pending", "completed", "cancelled"].includes(status)) {
        return res.status(400).json({ error: "Invalid status value" });
      }
      const sale = await storage.updateSaleStatus(id, status);
      res.json({ success: true, data: sale });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/admin/messages", requireAuth, async (req, res) => {
    try {
      const messages = await storage.getContactMessages();
      res.json({ success: true, data: messages });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.patch("/api/admin/messages/:id/status", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!status || !["unread", "read", "replied"].includes(status)) {
        return res.status(400).json({ error: "Invalid status value" });
      }
      const message = await storage.updateContactMessageStatus(id, status);
      res.json({ success: true, data: message });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/admin/homepage-content", requireAuth, async (req, res) => {
    try {
      const content = await storage.getHomepageContent();
      res.json({ success: true, data: content });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.patch("/api/admin/homepage-content/:section", requireAuth, async (req, res) => {
    try {
      const { section } = req.params;
      const validSections = ["navigation", "hero", "about", "products", "testimonials", "contact", "affiliates", "footer"];
      if (!validSections.includes(section)) {
        return res.status(400).json({ error: "Invalid section name" });
      }
      const allowedFields = ["title", "subtitle", "description", "buttonText", "buttonSecondaryText", "buttonUrl", "content", "active"];
      const updateData = Object.keys(req.body).filter((key) => allowedFields.includes(key)).reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: "No valid fields to update" });
      }
      const content = await storage.updateHomepageContentBySection(section, updateData);
      res.json({ success: true, data: content });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/admin/homepage-content/seed", requireAuth, async (req, res) => {
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
              login: "Iniciar Sesi\xF3n",
              mobileMenu: "Men\xFA"
            }
          }),
          active: true
        },
        {
          section: "hero",
          title: "VAPEOLO:",
          subtitle: "Donde la experiencia y el sabor se fusionan",
          description: "15 a\xF1os dise\xF1ando los mejores cigarrillos electr\xF3nicos del mercado",
          buttonText: "Ver Productos",
          buttonSecondaryText: "Unirme como Afiliado",
          buttonUrl: "#productos",
          content: JSON.stringify({
            flavors: "M\xE1s de 25 sabores",
            puffs: "Hasta 20,000 puffs",
            shipping: "Env\xEDos a todo el pa\xEDs"
          }),
          active: true
        },
        {
          section: "about",
          title: "\xBFQui\xE9nes somos?",
          subtitle: "VAPEOLO es distribuidora oficial de LAVIE, una marca con m\xE1s de 15 a\xF1os de innovaci\xF3n en dise\xF1o y fabricaci\xF3n de vapes.",
          description: "Nuestra misi\xF3n: redefinir el vapeo en Latinoam\xE9rica",
          buttonText: "",
          buttonSecondaryText: "",
          buttonUrl: "",
          content: JSON.stringify({
            highlights: [
              {
                title: "Presencia en m\xE1s de 10 pa\xEDses",
                description: "Distribuyendo experiencias \xFAnicas a nivel internacional"
              },
              {
                title: "Bater\xEDas de larga duraci\xF3n",
                description: "Tecnolog\xEDa avanzada para m\xE1ximo rendimiento"
              },
              {
                title: "Hasta 20,000 puffs por dispositivo",
                description: "La duraci\xF3n m\xE1s larga del mercado"
              },
              {
                title: "Garant\xEDa de calidad",
                description: "15 a\xF1os de experiencia y excelencia comprobada"
              }
            ],
            stats: {
              experience: "A\xF1os de experiencia",
              flavors: "Sabores disponibles",
              countries: "Pa\xEDses con presencia"
            }
          }),
          active: true
        },
        {
          section: "products",
          title: "Productos",
          subtitle: "Nuestra l\xEDnea de vapes premium",
          description: "Descubre nuestra colecci\xF3n de dispositivos de vapeo",
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
            socialPrompt: "S\xEDguenos en redes sociales",
            socialPlatforms: [
              { platform: "Instagram", handle: "@lavievapes.gt", followers: "45.2K" },
              { platform: "TikTok", handle: "@lavievapes", followers: "32.8K" },
              { platform: "Facebook", handle: "LAVIE Vapes Guatemala", followers: "28.1K" }
            ],
            ctaPrompt: "S\xEDguenos para contenido exclusivo",
            ctaFeatures: "\u{1F4F8} Fotos de clientes \u2022 \u{1F3A5} Reviews y unboxing \u2022 \u{1F381} Promos y giveaways"
          }),
          active: true
        },
        {
          section: "contact",
          title: "Contacto",
          subtitle: "Estamos aqu\xED para ayudarte",
          description: "",
          buttonText: "",
          buttonSecondaryText: "",
          buttonUrl: "",
          content: JSON.stringify({
            formTitle: "Env\xEDanos un mensaje",
            formLabels: {
              name: "Nombre completo",
              email: "Email",
              message: "Mensaje"
            },
            formPlaceholders: {
              name: "Tu nombre",
              email: "tu@email.com",
              message: "\xBFEn qu\xE9 podemos ayudarte?"
            },
            formButton: "Enviar mensaje",
            contactInfo: [
              {
                title: "WhatsApp",
                description: "\xBFDudas? Escr\xEDbenos al instante",
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
                title: "Ubicaci\xF3n",
                description: "Env\xEDos a toda Guatemala",
                value: "Ciudad de Guatemala",
                action: "Ver cobertura"
              }
            ],
            shippingInfo: [
              {
                title: "Env\xEDos a toda Guatemala",
                description: "Entregas en 24-72h h\xE1biles"
              },
              {
                title: "M\xFAltiples m\xE9todos de pago",
                description: "Tarjeta, transferencia, contra entrega"
              },
              {
                title: "Env\xEDo gratis",
                description: "En compras desde Q200"
              }
            ],
            paymentMethods: ["Tarjeta de cr\xE9dito", "Transferencia", "Contra entrega"],
            shippingNotice: "* Contra entrega minimo de Q200 o costo de Q35 por envio"
          }),
          active: true
        },
        {
          section: "affiliates",
          title: "Programa de Afiliaci\xF3n",
          subtitle: "Gana mientras vapeas - \xA1Haz parte de LAVIE!",
          description: "\xBFQuieres ganar dinero vendiendo vapes LAVIE? \xA1\xDAnete a VAPEOLO!",
          buttonText: "",
          buttonSecondaryText: "",
          buttonUrl: "",
          content: JSON.stringify({
            sectionSubtitle: "\xDAnete a nuestro programa de afiliaci\xF3n",
            levels: [
              {
                id: "agente",
                name: "Agente",
                discount: "10% - 12%",
                minimum: "Q500",
                features: [
                  "Descuento del 10% al 12%",
                  "Monto m\xEDnimo de compra: Q500",
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
                  "Monto m\xEDnimo de compra: Q1,500",
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
                  "Monto m\xEDnimo de compra: Q3,500",
                  "Apoyo comercial personalizado",
                  "Beneficios exclusivos y prioridad de stock"
                ]
              }
            ],
            formTitle: "Registrarse como Afiliado",
            formLabels: {
              name: "Nombre completo",
              email: "Email",
              phone: "Tel\xE9fono",
              level: "Nivel de afiliaci\xF3n deseado",
              message: "Mensaje (opcional)"
            },
            formPlaceholders: {
              name: "Tu nombre completo",
              email: "tu@email.com",
              phone: "+502 1234-5678",
              message: "Cu\xE9ntanos sobre tu experiencia en ventas o por qu\xE9 quieres ser parte de LAVIE..."
            },
            formButton: "Enviar Solicitud",
            levelOptions: [
              { label: "Agente (10-12%)", value: "agente" },
              { label: "Distribuidor (25-30%)", value: "distribuidor" },
              { label: "Socio (45-50%)", value: "socio" }
            ],
            messages: {
              success: {
                title: "\xA1Solicitud enviada!",
                description: "Nos pondremos en contacto contigo pronto para revisar tu aplicaci\xF3n."
              },
              error: {
                title: "Error",
                description: "No se pudo enviar la solicitud. Por favor, int\xE9ntalo de nuevo."
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
            brandDescription: "Distribuidora oficial de LAVIE con 15 a\xF1os dise\xF1ando los mejores cigarrillos electr\xF3nicos del mercado. Donde la experiencia y el sabor se fusionan.",
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
                  { name: "Programa de Afiliaci\xF3n", href: "#afiliados" },
                  { name: "Testimonios", href: "#testimonios" },
                  { name: "Contacto", href: "#contacto" }
                ]
              },
              support: {
                title: "Soporte",
                links: [
                  { name: "Env\xEDos y devoluciones", href: "#contacto" },
                  { name: "M\xE9todos de pago", href: "#contacto" },
                  { name: "Preguntas frecuentes", href: "#contacto" },
                  { name: "Soporte t\xE9cnico", href: "#contacto" }
                ]
              }
            },
            copyright: "\xA9 {currentYear} VAPEOLO - Distribuidora oficial LAVIE. Todos los derechos reservados.",
            legalLinks: [
              { name: "T\xE9rminos y Condiciones", href: "#" },
              { name: "Pol\xEDtica de Privacidad", href: "#" },
              { name: "Pol\xEDtica de Cookies", href: "#" }
            ],
            ageWarning: "Este sitio web es solo para mayores de 18 a\xF1os. Los productos de vapeo contienen nicotina, una sustancia qu\xEDmica adictiva."
          }),
          active: true
        }
      ];
      const createdContent = [];
      for (const content of defaultContent) {
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
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/admin/setup", async (req, res) => {
    if (process.env.NODE_ENV === "production") {
      return res.status(404).json({ error: "Not found" });
    }
    try {
      const existingAdmin = await storage.getUserByUsername("admin");
      if (existingAdmin) {
        return res.status(400).json({ error: "Admin already exists" });
      }
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
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express2 from "express";
import fs2 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
dotenv2.config();
var app = express3();
app.use(express3.json());
app.use(express3.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "127.0.0.1"
  }, () => {
    log(`serving on port ${port}`);
  });
})();
