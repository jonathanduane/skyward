import { VercelRequest, VercelResponse } from '@vercel/node';
import { rawLeadsData } from '../shared/leads-data';
import type { Lead } from '../shared/schema';

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Convert raw data to Lead objects
    const leads: Lead[] = (rawLeadsData as any[]).map((leadData, index) => ({
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
    }));

    // Apply filters
    let filteredLeads = leads;

    if (req.query.search) {
      const searchTerm = req.query.search.toString().toLowerCase();
      filteredLeads = filteredLeads.filter(lead =>
        lead.pageName.toLowerCase().includes(searchTerm) ||
        lead.address.toLowerCase().includes(searchTerm) ||
        lead.website.toLowerCase().includes(searchTerm) ||
        lead.searchTerm.toLowerCase().includes(searchTerm)
      );
    }

    if (req.query.state && req.query.state !== 'all') {
      filteredLeads = filteredLeads.filter(lead => lead.state === req.query.state);
    }

    if (req.query.searchTerm && req.query.searchTerm !== 'all') {
      filteredLeads = filteredLeads.filter(lead => lead.searchTerm === req.query.searchTerm);
    }

    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200).json(filteredLeads);
  } catch (error) {
    console.error('Error in /api/leads:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}