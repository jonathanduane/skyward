import { VercelRequest, VercelResponse } from '@vercel/node';
import { rawLeadsData } from '../../shared/leads-data';

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const leads = rawLeadsData as any[];
    
    // Calculate total spend by parsing spend_range
    const totalSpend = leads.reduce((sum, lead) => {
      const spendRange = lead.spend_range || "0-0";
      const firstNumber = parseInt(spendRange.split('-')[0]) || 0;
      return sum + firstNumber;
    }, 0);

    // Calculate total reach
    const totalReach = leads.reduce((sum, lead) => sum + (lead.total_reach || 0), 0);

    // Count high priority leads
    const highPriority = leads.filter(lead => lead.lead_priority === "High").length;

    const stats = {
      totalLeads: leads.length,
      totalSpend,
      totalReach,
      highPriority
    };

    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error in /api/leads/stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}