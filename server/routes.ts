import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // All API routes removed for Vercel deployment - using /api/ serverless functions instead

  const httpServer = createServer(app);
  return httpServer;
}
