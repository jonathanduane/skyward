import { users, leads, type User, type InsertUser, type Lead, type InsertLead, type LeadStats, type StateStats } from "@shared/schema";
import * as fs from 'fs';
import * as path from 'path';

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Lead operations
  getAllLeads(): Promise<Lead[]>;
  getLeadById(id: number): Promise<Lead | undefined>;
  getLeadStats(): Promise<LeadStats>;
  getStateStats(): Promise<StateStats[]>;
  getNewLeads(sinceDate?: string): Promise<Lead[]>;
  searchLeads(query: string): Promise<Lead[]>;
  filterLeadsByState(state: string): Promise<Lead[]>;
  filterLeadsBySearchTerm(searchTerm: string): Promise<Lead[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private leads: Map<number, Lead>;
  private currentUserId: number;
  private currentLeadId: number;

  constructor() {
    this.users = new Map();
    this.leads = new Map();
    this.currentUserId = 1;
    this.currentLeadId = 1;
    
    // Load leads data
    this.loadLeadsData();
  }

  private loadLeadsData() {
    try {
      const jsonPath = path.join(process.cwd(), 'attached_assets', 'leads4_1750103502675.json');
      const rawData = fs.readFileSync(jsonPath, 'utf8');
      const rawLeadsData = JSON.parse(rawData) as any[];
      
      // Convert JSON data to Lead objects
      rawLeadsData.forEach((leadData, index) => {
        const lead: Lead = {
          id: index + 1,
          searchTerm: leadData.search_term || "",
          state: leadData.state || "Unknown",
          pageName: leadData.page_name || "",
          pageId: leadData.page_id || "",
          adType: leadData.ad_type || "",
          spendRange: leadData.spend_range || "",
          impressions: leadData.impressions || "",
          totalReach: leadData.total_reach || 0,
          platforms: leadData.platforms || "",
          startDate: leadData.start_date || "",
          stopDate: leadData.stop_date || "",
          durationDays: leadData.duration_days || "",
          fbLink: leadData.fb_link || "",
          adLink: leadData.ad_link || "",
          address: leadData.address || "",
          website: leadData.website || "",
          normalizedWebsite: leadData.normalized_website || "",
          phone: leadData.phone || "",
          leadScore: leadData.lead_score || 0,
          leadPriority: leadData.lead_priority || "",
        };
        this.leads.set(lead.id, lead);
      });
      this.currentLeadId = this.leads.size + 1;
    } catch (error) {
      console.error('Error loading leads data:', error);
      // Initialize with empty data if file loading fails
      this.currentLeadId = 1;
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllLeads(): Promise<Lead[]> {
    return Array.from(this.leads.values());
  }

  async getLeadById(id: number): Promise<Lead | undefined> {
    return this.leads.get(id);
  }

  async getLeadStats(): Promise<LeadStats> {
    const allLeads = Array.from(this.leads.values());
    
    const totalSpend = allLeads.reduce((sum, lead) => {
      const spendRange = lead.spendRange;
      if (spendRange && spendRange !== "N/A" && spendRange.includes('-')) {
        const [min, max] = spendRange.split('-').map(Number);
        return sum + (max || min || 0);
      }
      return sum;
    }, 0);

    return {
      totalLeads: allLeads.length,
      totalSpend,
      totalReach: allLeads.reduce((sum, lead) => sum + lead.totalReach, 0),
      highPriority: allLeads.filter(lead => lead.leadPriority === 'high').length,
    };
  }

  async getStateStats(): Promise<StateStats[]> {
    const allLeads = Array.from(this.leads.values());
    const stateCounts: { [key: string]: number } = {};

    // Count leads by state
    allLeads.forEach(lead => {
      const state = lead.state || 'Unknown';
      stateCounts[state] = (stateCounts[state] || 0) + 1;
    });

    const totalLeads = allLeads.length;
    
    return Object.entries(stateCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / totalLeads) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }

  async getNewLeads(sinceDate?: string): Promise<Lead[]> {
    const allLeads = Array.from(this.leads.values());
    
    if (!sinceDate) {
      // Return the 10 most recent leads by ID (assuming higher ID = newer)
      return allLeads
        .sort((a, b) => b.id - a.id)
        .slice(0, 10);
    }

    // Filter by date if provided
    return allLeads.filter(lead => {
      if (!lead.startDate || lead.startDate === 'N/A') return false;
      return new Date(lead.startDate) >= new Date(sinceDate);
    });
  }

  async searchLeads(query: string): Promise<Lead[]> {
    if (!query) return this.getAllLeads();
    
    const allLeads = Array.from(this.leads.values());
    const lowercaseQuery = query.toLowerCase();
    
    return allLeads.filter(lead =>
      lead.searchTerm.toLowerCase().includes(lowercaseQuery) ||
      lead.pageName.toLowerCase().includes(lowercaseQuery) ||
      lead.state.toLowerCase().includes(lowercaseQuery) ||
      lead.address.toLowerCase().includes(lowercaseQuery) ||
      lead.website.toLowerCase().includes(lowercaseQuery) ||
      lead.phone.toLowerCase().includes(lowercaseQuery)
    );
  }

  async filterLeadsByState(state: string): Promise<Lead[]> {
    if (state === 'all') return this.getAllLeads();
    
    const allLeads = Array.from(this.leads.values());
    return allLeads.filter(lead => lead.state === state);
  }

  async filterLeadsBySearchTerm(searchTerm: string): Promise<Lead[]> {
    if (searchTerm === 'all') return this.getAllLeads();
    
    const allLeads = Array.from(this.leads.values());
    return allLeads.filter(lead => lead.searchTerm === searchTerm);
  }
}

export const storage = new MemStorage();