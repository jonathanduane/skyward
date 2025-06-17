import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { aiLeadService } from "./ai-service";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for local development
  app.get("/api/data", async (req, res) => {
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

  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getLeadStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });

  app.get("/api/states", async (req, res) => {
    try {
      const stateStats = await storage.getStateStats();
      res.json(stateStats);
    } catch (error) {
      console.error('Error fetching state stats:', error);
      res.status(500).json({ error: 'Failed to fetch state stats' });
    }
  });

  app.get("/api/recent", async (req, res) => {
    try {
      const newLeads = await storage.getNewLeads();
      res.json(newLeads);
    } catch (error) {
      console.error('Error fetching new leads:', error);
      res.status(500).json({ error: 'Failed to fetch new leads' });
    }
  });

  // AI Analysis endpoints
  app.post("/api/ai/analyze-lead/:id", async (req, res) => {
    try {
      const leadId = parseInt(req.params.id);
      const lead = await storage.getLeadById(leadId);
      
      if (!lead) {
        return res.status(404).json({ error: 'Lead not found' });
      }

      const analysis = await aiLeadService.analyzeLead(lead);
      res.json(analysis);
    } catch (error) {
      console.error('Error analyzing lead:', error);
      res.status(500).json({ error: 'Failed to analyze lead' });
    }
  });

  app.post("/api/ai/analyze-bulk", async (req, res) => {
    try {
      const leads = await storage.getAllLeads();
      const bulkAnalysis = await aiLeadService.analyzeBulkLeads(leads);
      res.json(bulkAnalysis);
    } catch (error) {
      console.error('Error in bulk analysis:', error);
      res.status(500).json({ error: 'Failed to analyze leads' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
