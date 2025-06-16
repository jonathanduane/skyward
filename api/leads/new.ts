import { VercelRequest, VercelResponse } from '@vercel/node';
import { rawLeadsData } from '../../shared/leads-data';

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const leads = rawLeadsData as any[];
    
    // Convert to Lead objects and get recent ones
    const recentLeads = leads
      .map((leadData, index) => ({
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
      }))
      .slice(25, 35); // Get leads 26-35 as "recent"

    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200).json(recentLeads);
  } catch (error) {
    console.error('Error in /api/leads/new:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}