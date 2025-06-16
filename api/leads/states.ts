import { VercelRequest, VercelResponse } from '@vercel/node';
import { rawLeadsData } from '../../shared/leads-data';

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const leads = rawLeadsData as any[];
    
    // Count leads by state
    const stateCounts = leads.reduce((acc, lead) => {
      const state = lead.state || "Unknown";
      acc[state] = (acc[state] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Convert to array and sort by count
    const stateStats = Object.entries(stateCounts)
      .map(([name, count]) => ({
        name,
        count: count as number,
        percentage: (((count as number) / leads.length) * 100).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count);

    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200).json(stateStats);
  } catch (error) {
    console.error('Error in /api/leads/states:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}