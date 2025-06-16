import { users, leads, type User, type InsertUser, type Lead, type InsertLead, type LeadStats, type StateStats } from "@shared/schema";
import leadsData from "../attached_assets/leads4_1750103502675.json";

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
    // Convert JSON data to Lead objects
    (leadsData as any[]).forEach((leadData, index) => {
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
        stopDate: leadData.stop_date || null,
        durationDays: leadData.duration_days || null,
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
    
    // Calculate total spend from spend ranges
    const totalSpend = allLeads.reduce((sum, lead) => {
      const spendParts = lead.spendRange.split('-');
      const spend = parseInt(spendParts[0]) || 0;
      return sum + spend;
    }, 0);

    return {
      totalLeads: allLeads.length,
      totalSpend,
      totalReach: allLeads.reduce((sum, lead) => sum + lead.totalReach, 0),
      highPriority: allLeads.filter(lead => lead.leadPriority === "High").length,
    };
  }

  async getStateStats(): Promise<StateStats[]> {
    const allLeads = Array.from(this.leads.values());
    const stateCounts = new Map<string, number>();
    
    // Extract state from address
    allLeads.forEach(lead => {
      let state = lead.state;
      if (state === "Unknown" && lead.address) {
        // Try to extract Australian state from address
        const australianStates = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];
        const addressParts = lead.address.split(" ");
        for (const part of addressParts) {
          if (australianStates.includes(part)) {
            switch (part) {
              case "NSW": state = "New South Wales"; break;
              case "VIC": state = "Victoria"; break;
              case "QLD": state = "Queensland"; break;
              case "WA": state = "Western Australia"; break;
              case "SA": state = "South Australia"; break;
              case "TAS": state = "Tasmania"; break;
              case "ACT": state = "Australian Capital Territory"; break;
              case "NT": state = "Northern Territory"; break;
            }
            break;
          }
        }
      }
      
      const currentCount = stateCounts.get(state) || 0;
      stateCounts.set(state, currentCount + 1);
    });

    const totalLeads = allLeads.length;
    return Array.from(stateCounts.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / totalLeads) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 states
  }

  async getNewLeads(sinceDate?: string): Promise<Lead[]> {
    const allLeads = Array.from(this.leads.values());
    
    if (!sinceDate) {
      // Return leads from the last 7 days based on start_date
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      return allLeads
        .filter(lead => {
          if (!lead.startDate) return false;
          const leadDate = new Date(lead.startDate);
          return leadDate >= sevenDaysAgo;
        })
        .sort((a, b) => b.leadScore - a.leadScore)
        .slice(0, 10); // Top 10 recent leads
    }
    
    return allLeads
      .filter(lead => {
        if (!lead.startDate) return false;
        return lead.startDate >= sinceDate;
      })
      .sort((a, b) => b.leadScore - a.leadScore);
  }

  async searchLeads(query: string): Promise<Lead[]> {
    if (!query.trim()) return this.getAllLeads();
    
    const allLeads = Array.from(this.leads.values());
    const lowercaseQuery = query.toLowerCase();
    
    return allLeads.filter(lead => 
      lead.pageName.toLowerCase().includes(lowercaseQuery) ||
      lead.searchTerm.toLowerCase().includes(lowercaseQuery) ||
      lead.address.toLowerCase().includes(lowercaseQuery) ||
      lead.website.toLowerCase().includes(lowercaseQuery) ||
      lead.phone.toLowerCase().includes(lowercaseQuery) ||
      lead.state.toLowerCase().includes(lowercaseQuery)
    );
  }

  async filterLeadsByState(state: string): Promise<Lead[]> {
    if (!state || state === "all") return this.getAllLeads();
    
    const allLeads = Array.from(this.leads.values());
    return allLeads.filter(lead => {
      let leadState = lead.state;
      if (leadState === "Unknown" && lead.address) {
        // Try to extract Australian state from address
        const australianStates = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];
        const addressParts = lead.address.split(" ");
        for (const part of addressParts) {
          if (australianStates.includes(part)) {
            switch (part) {
              case "NSW": leadState = "New South Wales"; break;
              case "VIC": leadState = "Victoria"; break;
              case "QLD": leadState = "Queensland"; break;
              case "WA": leadState = "Western Australia"; break;
              case "SA": leadState = "South Australia"; break;
              case "TAS": leadState = "Tasmania"; break;
              case "ACT": leadState = "Australian Capital Territory"; break;
              case "NT": leadState = "Northern Territory"; break;
            }
            break;
          }
        }
      }
      return leadState.toLowerCase().includes(state.toLowerCase());
    });
  }

  async filterLeadsBySearchTerm(searchTerm: string): Promise<Lead[]> {
    if (!searchTerm || searchTerm === "all") return this.getAllLeads();
    
    const allLeads = Array.from(this.leads.values());
    return allLeads.filter(lead => 
      lead.searchTerm.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
}

export const storage = new MemStorage();
