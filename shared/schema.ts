import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table (admins)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("admin"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Affiliates table
export const affiliates = pgTable("affiliates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  level: text("level").notNull(), // 'agente', 'distribuidor', 'socio'
  discount: decimal("discount", { precision: 5, scale: 2 }).notNull(),
  minimumPurchase: decimal("minimum_purchase", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // 'pending', 'approved', 'rejected'
  password: text("password"), // Para login de distribuidores (null si no aprobado)
  message: text("message"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  approvedAt: timestamp("approved_at"),
  approvedBy: varchar("approved_by").references(() => users.id),
});

// Products table
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  puffs: integer("puffs").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  image: text("image"),
  sabores: text("sabores").array().notNull().default(sql`ARRAY[]::text[]`),
  description: text("description"),
  popular: boolean("popular").notNull().default(false),
  active: boolean("active").notNull().default(true),
  inventory: integer("inventory").notNull().default(0), // Total stock quantity
  reservedInventory: integer("reserved_inventory").notNull().default(0), // Items reserved in orders
  lowStockThreshold: integer("low_stock_threshold").notNull().default(10), // Reorder point
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Sales table
export const sales = pgTable("sales", {
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
  status: text("status").notNull().default("pending"), // 'pending', 'completed', 'cancelled'
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Contact messages table
export const contactMessages = pgTable("contact_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("unread"), // 'unread', 'read', 'replied'
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Homepage content table
export const homepageContent = pgTable("homepage_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  section: text("section").notNull().unique(), // 'hero', 'about', 'testimonials', 'contact'
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  description: text("description"),
  buttonText: text("button_text"),
  buttonUrl: text("button_url"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at"),
});

// Product flavors table
export const productFlavors = pgTable("product_flavors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id),
  name: text("name").notNull(), // e.g., 'Mango Ice', 'Blueberry'
  inventory: integer("inventory").notNull().default(0), // Stock quantity for this flavor
  reservedInventory: integer("reserved_inventory").notNull().default(0), // Items reserved in orders
  lowStockThreshold: integer("low_stock_threshold").notNull().default(5), // Reorder point for flavor
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  approvedAffiliates: many(affiliates),
}));

export const affiliatesRelations = relations(affiliates, ({ one, many }) => ({
  approvedBy: one(users, {
    fields: [affiliates.approvedBy],
    references: [users.id],
  }),
  sales: many(sales),
}));

export const productsRelations = relations(products, ({ many }) => ({
  sales: many(sales),
  flavors: many(productFlavors),
}));

export const salesRelations = relations(sales, ({ one }) => ({
  affiliate: one(affiliates, {
    fields: [sales.affiliateId],
    references: [affiliates.id],
  }),
  product: one(products, {
    fields: [sales.productId],
    references: [products.id],
  }),
}));

export const productFlavorsRelations = relations(productFlavors, ({ one }) => ({
  product: one(products, {
    fields: [productFlavors.productId],
    references: [products.id],
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertAffiliateSchema = createInsertSchema(affiliates).pick({
  name: true,
  email: true,
  phone: true,
  level: true,
  message: true,
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  puffs: true,
  price: true,
  image: true,
  sabores: true,
  description: true,
  popular: true,
  active: true,
  inventory: true,
  reservedInventory: true,
  lowStockThreshold: true,
});

export const insertSaleSchema = createInsertSchema(sales).pick({
  affiliateId: true,
  productId: true,
  quantity: true,
  unitPrice: true,
  discount: true,
  totalAmount: true,
  customerName: true,
  customerEmail: true,
  customerPhone: true,
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).pick({
  name: true,
  email: true,
  message: true,
});

export const insertHomepageContentSchema = createInsertSchema(homepageContent).pick({
  section: true,
  title: true,
  subtitle: true,
  description: true,
  buttonText: true,
  buttonUrl: true,
  active: true,
});

export const updateHomepageContentSchema = createInsertSchema(homepageContent).pick({
  title: true,
  subtitle: true,
  description: true,
  buttonText: true,
  buttonUrl: true,
  active: true,
}).partial();

export const insertProductFlavorSchema = createInsertSchema(productFlavors).pick({
  productId: true,
  name: true,
  inventory: true,
  reservedInventory: true,
  lowStockThreshold: true,
  active: true,
});

export const updateProductFlavorSchema = createInsertSchema(productFlavors).pick({
  name: true,
  inventory: true,
  reservedInventory: true,
  lowStockThreshold: true,
  active: true,
}).partial();

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Affiliate = typeof affiliates.$inferSelect;
export type InsertAffiliate = z.infer<typeof insertAffiliateSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Sale = typeof sales.$inferSelect;
export type InsertSale = z.infer<typeof insertSaleSchema>;

export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;

export type HomepageContent = typeof homepageContent.$inferSelect;
export type InsertHomepageContent = z.infer<typeof insertHomepageContentSchema>;
export type UpdateHomepageContent = z.infer<typeof updateHomepageContentSchema>;

export type ProductFlavor = typeof productFlavors.$inferSelect;
export type InsertProductFlavor = z.infer<typeof insertProductFlavorSchema>;
export type UpdateProductFlavor = z.infer<typeof updateProductFlavorSchema>;

// API Response types
export type ApiResponse<T> = {
  success: true;
  data: T;
} | {
  error: string;
};

export type HomepageContentResponse = ApiResponse<{
  hero: HomepageContent | null;
  about: HomepageContent | null;
  testimonials: HomepageContent | null;
  contact: HomepageContent | null;
}>;

// Utility functions for inventory calculations

// Flavor-level inventory functions
export function getFlavorAvailableInventory(flavor: ProductFlavor): number {
  return Math.max(0, flavor.inventory - flavor.reservedInventory);
}

export function isFlavorOutOfStock(flavor: ProductFlavor): boolean {
  return !flavor.active || getFlavorAvailableInventory(flavor) === 0;
}

export function isFlavorLowStock(flavor: ProductFlavor): boolean {
  if (!flavor.active) return false;
  const available = getFlavorAvailableInventory(flavor);
  return available <= flavor.lowStockThreshold && available > 0;
}

export function getFlavorStockStatus(flavor: ProductFlavor): 'out_of_stock' | 'low_stock' | 'in_stock' {
  if (!flavor.active) return 'out_of_stock';
  const available = getFlavorAvailableInventory(flavor);
  if (available === 0) return 'out_of_stock';
  if (available <= flavor.lowStockThreshold) return 'low_stock';
  return 'in_stock';
}

// Product-level inventory functions (legacy - for backward compatibility)
export function getAvailableInventory(product: Product): number {
  return Math.max(0, product.inventory - product.reservedInventory);
}

export function isOutOfStock(product: Product): boolean {
  return getAvailableInventory(product) === 0;
}

export function isLowStock(product: Product): boolean {
  return getAvailableInventory(product) <= product.lowStockThreshold && getAvailableInventory(product) > 0;
}

export function getStockStatus(product: Product): 'out_of_stock' | 'low_stock' | 'in_stock' {
  const available = getAvailableInventory(product);
  if (available === 0) return 'out_of_stock';
  if (available <= product.lowStockThreshold) return 'low_stock';
  return 'in_stock';
}

// Product-level functions that work with flavors
export function getProductTotalAvailableInventory(flavors: ProductFlavor[]): number {
  return flavors
    .filter(flavor => flavor.active)
    .reduce((total, flavor) => total + getFlavorAvailableInventory(flavor), 0);
}

export function isProductOutOfStock(flavors: ProductFlavor[]): boolean {
  const activeFlavors = flavors.filter(flavor => flavor.active);
  if (activeFlavors.length === 0) return true;
  return activeFlavors.every(flavor => isFlavorOutOfStock(flavor));
}

export function isProductLowStock(flavors: ProductFlavor[]): boolean {
  const activeFlavors = flavors.filter(flavor => flavor.active);
  if (activeFlavors.length === 0) return false;
  return activeFlavors.some(flavor => isFlavorLowStock(flavor)) && !isProductOutOfStock(flavors);
}

export function getProductStockStatus(flavors: ProductFlavor[]): 'out_of_stock' | 'low_stock' | 'in_stock' {
  if (isProductOutOfStock(flavors)) return 'out_of_stock';
  if (isProductLowStock(flavors)) return 'low_stock';
  return 'in_stock';
}

export function getAvailableFlavors(flavors: ProductFlavor[]): ProductFlavor[] {
  return flavors.filter(flavor => flavor.active && !isFlavorOutOfStock(flavor));
}

export function getLowStockFlavors(flavors: ProductFlavor[]): ProductFlavor[] {
  return flavors.filter(flavor => flavor.active && isFlavorLowStock(flavor));
}

export function getOutOfStockFlavors(flavors: ProductFlavor[]): ProductFlavor[] {
  return flavors.filter(flavor => flavor.active && isFlavorOutOfStock(flavor));
}
