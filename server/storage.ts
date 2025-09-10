import { 
  users, 
  affiliates, 
  products, 
  sales, 
  contactMessages,
  type User, 
  type InsertUser,
  type Affiliate,
  type InsertAffiliate,
  type Product,
  type InsertProduct,
  type Sale,
  type InsertSale,
  type ContactMessage,
  type InsertContactMessage
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, count } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Affiliates
  createAffiliate(affiliate: InsertAffiliate): Promise<Affiliate>;
  getAffiliates(): Promise<Affiliate[]>;
  getAffiliate(id: string): Promise<Affiliate | undefined>;
  updateAffiliateStatus(id: string, status: string, approvedBy?: string): Promise<Affiliate>;
  
  // Products
  getProducts(): Promise<Product[]>;
  getActiveProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product>;
  
  // Sales
  createSale(sale: InsertSale): Promise<Sale>;
  getSales(): Promise<Sale[]>;
  getSalesByAffiliate(affiliateId: string): Promise<Sale[]>;
  updateSaleStatus(id: string, status: string): Promise<Sale>;
  
  // Contact Messages
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getContactMessages(): Promise<ContactMessage[]>;
  updateContactMessageStatus(id: string, status: string): Promise<ContactMessage>;
  
  // Dashboard Stats
  getDashboardStats(): Promise<{
    totalAffiliates: number;
    pendingAffiliates: number;
    totalSales: number;
    totalRevenue: string;
    unreadMessages: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Affiliates
  async createAffiliate(affiliate: InsertAffiliate): Promise<Affiliate> {
    // Set discount and minimum purchase based on level
    const levelConfig = {
      agente: { discount: "11.00", minimumPurchase: "500.00" },
      distribuidor: { discount: "27.50", minimumPurchase: "1500.00" },
      socio: { discount: "47.50", minimumPurchase: "3500.00" }
    };

    const config = levelConfig[affiliate.level as keyof typeof levelConfig];
    
    const [newAffiliate] = await db
      .insert(affiliates)
      .values({
        ...affiliate,
        discount: config.discount,
        minimumPurchase: config.minimumPurchase,
      })
      .returning();
    return newAffiliate;
  }

  async getAffiliates(): Promise<Affiliate[]> {
    return await db.select().from(affiliates).orderBy(desc(affiliates.createdAt));
  }

  async getAffiliate(id: string): Promise<Affiliate | undefined> {
    const [affiliate] = await db.select().from(affiliates).where(eq(affiliates.id, id));
    return affiliate || undefined;
  }

  async updateAffiliateStatus(id: string, status: string, approvedBy?: string): Promise<Affiliate> {
    const updateData: any = { status };
    if (status === 'approved') {
      updateData.approvedAt = sql`now()`;
      if (approvedBy) updateData.approvedBy = approvedBy;
    }

    const [affiliate] = await db
      .update(affiliates)
      .set(updateData)
      .where(eq(affiliates.id, id))
      .returning();
    return affiliate;
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(desc(products.createdAt));
  }

  async getActiveProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.active, true));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db
      .insert(products)
      .values(product)
      .returning();
    return newProduct;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product> {
    const [updatedProduct] = await db
      .update(products)
      .set(product)
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  // Sales
  async createSale(sale: InsertSale): Promise<Sale> {
    const [newSale] = await db
      .insert(sales)
      .values(sale)
      .returning();
    return newSale;
  }

  async getSales(): Promise<Sale[]> {
    return await db.select().from(sales).orderBy(desc(sales.createdAt));
  }

  async getSalesByAffiliate(affiliateId: string): Promise<Sale[]> {
    return await db.select().from(sales).where(eq(sales.affiliateId, affiliateId));
  }

  async updateSaleStatus(id: string, status: string): Promise<Sale> {
    const [sale] = await db
      .update(sales)
      .set({ status })
      .where(eq(sales.id, id))
      .returning();
    return sale;
  }

  // Contact Messages
  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const [newMessage] = await db
      .insert(contactMessages)
      .values(message)
      .returning();
    return newMessage;
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    return await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  }

  async updateContactMessageStatus(id: string, status: string): Promise<ContactMessage> {
    const [message] = await db
      .update(contactMessages)
      .set({ status })
      .where(eq(contactMessages.id, id))
      .returning();
    return message;
  }

  // Dashboard Stats
  async getDashboardStats() {
    const [affiliateStats] = await db
      .select({ 
        total: count(),
        pending: sql<number>`count(*) filter (where status = 'pending')`
      })
      .from(affiliates);

    const [salesStats] = await db
      .select({ 
        total: count(),
        revenue: sql<string>`coalesce(sum(total_amount), 0)`
      })
      .from(sales);

    const [messageStats] = await db
      .select({ 
        unread: sql<number>`count(*) filter (where status = 'unread')`
      })
      .from(contactMessages);

    return {
      totalAffiliates: Number(affiliateStats.total),
      pendingAffiliates: Number(affiliateStats.pending),
      totalSales: Number(salesStats.total),
      totalRevenue: salesStats.revenue || "0",
      unreadMessages: Number(messageStats.unread),
    };
  }
}

export const storage = new DatabaseStorage();
