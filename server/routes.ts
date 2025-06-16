import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Lead routes
  app.get("/api/leads", async (req, res) => {
    try {
      const { search, state, searchTerm } = req.query;
      
      let leads = await storage.getAllLeads();
      
      if (search) {
        leads = await storage.searchLeads(search as string);
      }
      
      if (state && state !== "all") {
        leads = await storage.filterLeadsByState(state as string);
      }
      
      if (searchTerm && searchTerm !== "all") {
        leads = await storage.filterLeadsBySearchTerm(searchTerm as string);
      }
      
      res.json(leads);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leads" });
    }
  });

  app.get("/api/leads/stats", async (req, res) => {
    try {
      const stats = await storage.getLeadStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch lead stats" });
    }
  });

  app.get("/api/leads/states", async (req, res) => {
    try {
      const stateStats = await storage.getStateStats();
      res.json(stateStats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch state stats" });
    }
  });

  app.get("/api/leads/new", async (req, res) => {
    try {
      const { since } = req.query;
      const newLeads = await storage.getNewLeads(since as string);
      res.json(newLeads);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch new leads" });
    }
  });

  app.get("/api/leads/export", async (req, res) => {
    try {
      const { selected } = req.query;
      let leads = await storage.getAllLeads();
      
      if (selected) {
        const selectedIds = (selected as string).split(',').map(id => parseInt(id));
        leads = leads.filter(lead => selectedIds.includes(lead.id));
      }
      
      // Convert to CSV format
      const csvHeaders = [
        'Search Term', 'State', 'Page Name', 'Page ID', 'Ad Type', 'Spend Range',
        'Impressions', 'Total Reach', 'Platforms', 'Start Date', 'Stop Date',
        'Duration Days', 'FB Link', 'Ad Link', 'Address', 'Website', 'Phone',
        'Lead Score', 'Lead Priority'
      ];
      
      const csvRows = leads.map(lead => [
        lead.searchTerm, lead.state, lead.pageName, lead.pageId, lead.adType,
        lead.spendRange, lead.impressions, lead.totalReach, lead.platforms,
        lead.startDate, lead.stopDate || '', lead.durationDays || '',
        lead.fbLink, lead.adLink, lead.address, lead.website, lead.phone,
        lead.leadScore, lead.leadPriority
      ]);
      
      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
      
      res.contentType('text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="leads.csv"');
      res.send(csvContent);
    } catch (error) {
      res.status(500).json({ error: "Failed to export leads" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
