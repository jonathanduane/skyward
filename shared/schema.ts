import { pgTable, text, serial, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  searchTerm: text("search_term").notNull(),
  state: text("state").notNull(),
  pageName: text("page_name").notNull(),
  pageId: text("page_id").notNull(),
  adType: text("ad_type").notNull(),
  spendRange: text("spend_range").notNull(),
  impressions: text("impressions").notNull(),
  totalReach: integer("total_reach").notNull(),
  platforms: text("platforms").notNull(),
  startDate: text("start_date").notNull(),
  stopDate: text("stop_date"),
  durationDays: text("duration_days"),
  fbLink: text("fb_link").notNull(),
  adLink: text("ad_link").notNull(),
  address: text("address").notNull(),
  website: text("website").notNull(),
  normalizedWebsite: text("normalized_website").notNull(),
  phone: text("phone").notNull(),
  leadScore: real("lead_score").notNull(),
  leadPriority: text("lead_priority").notNull(),
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

// Statistics types
export type LeadStats = {
  totalLeads: number;
  totalSpend: number;
  totalReach: number;
  highPriority: number;
};

export type StateStats = {
  name: string;
  count: number;
  percentage: number;
};

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
