import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for local development
  app.get("/api/get-leads", async (req, res) => {
    try {
      const { search, state, searchTerm } = req.query;
      
      let leads = await storage.getAllLeads();
      
      if (search) {
        leads = await storage.searchLeads(search as string);
      }
      
      if (state && state !== 'all') {
        leads = leads.filter(lead => lead.state === state);
      }
      
      if (searchTerm && searchTerm !== 'all') {
        leads = leads.filter(lead => lead.searchTerm === searchTerm);
      }
      
      res.json(leads);
    } catch (error) {
      console.error('Error fetching leads:', error);
      res.status(500).json({ error: 'Failed to fetch leads' });
    }
  });

  app.get("/api/get-stats", async (req, res) => {
    try {
      const stats = await storage.getLeadStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });

  app.get("/api/get-states", async (req, res) => {
    try {
      const stateStats = await storage.getStateStats();
      res.json(stateStats);
    } catch (error) {
      console.error('Error fetching state stats:', error);
      res.status(500).json({ error: 'Failed to fetch state stats' });
    }
  });

  app.get("/api/get-new", async (req, res) => {
    try {
      const newLeads = await storage.getNewLeads();
      res.json(newLeads);
    } catch (error) {
      console.error('Error fetching new leads:', error);
      res.status(500).json({ error: 'Failed to fetch new leads' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
