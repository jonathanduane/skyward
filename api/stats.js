// Statistics endpoint for dashboard
const leadsData = [
    {
        "search_term": "coffee shops",
        "state": "Unknown",
        "page_name": "Pianote",
        "page_id": "1014835828594774",
        "ad_type": "Other",
        "spend_range": "7135-7135",
        "impressions": "N/A-N/A",
        "total_reach": 475658,
        "platforms": "facebook, instagram, audience_network, messenger",
        "start_date": "2025-02-04",
        "stop_date": "N/A",
        "duration_days": "N/A",
        "fb_link": "https://facebook.com/1014835828594774",
        "ad_link": "https://www.facebook.com/ads/archive/render_ad/?id=923952306567424&access_token=EAAfSEtp5yhIBO90LJlT7gaTjMQYQoNWocaWbMIFGs6vlYe7VBUZCiPZCI81YObyXhhJWzCqt79ZAuk8My2pkfDxCmNJULXe90ZBmtZC0En66KZAyMHjaehSqOgjZA6oXSZB6Op8S2o1jIuZCIejZAGERHkP3mbnMzTT0lmTMD9fjjUJQKK1u2lsDOtZArZBWmRuZBHtfg76oBqKOnrXqAgQGkxsMZD",
        "address": "852 Beechworth-Wangaratta Rd, Everton Upper VIC 3678, Australia",
        "website": "https://pianopiano.com.au/",
        "normalized_website": "pianopiano.com.au",
        "phone": "(03) 5727 0382",
        "lead_score": 85,
        "lead_priority": "high"
    },
    {
        "search_term": "plumbing services",
        "state": "NSW",
        "page_name": "Elite Plumbing Solutions",
        "page_id": "2047382947291847",
        "ad_type": "Service",
        "spend_range": "2500-3000",
        "impressions": "50000-75000",
        "total_reach": 28475,
        "platforms": "facebook, instagram",
        "start_date": "2025-01-15",
        "stop_date": "2025-02-15",
        "duration_days": "31",
        "fb_link": "https://facebook.com/2047382947291847",
        "ad_link": "https://www.facebook.com/ads/archive/render_ad/?id=847362859473625",
        "address": "123 Main St, Sydney NSW 2000, Australia",
        "website": "https://eliteplumbing.com.au/",
        "normalized_website": "eliteplumbing.com.au",
        "phone": "(02) 9876 5432",
        "lead_score": 92,
        "lead_priority": "high"
    }
];

export default function handler(req, res) {
    try {
        const totalSpend = leadsData.reduce((sum, lead) => {
            const spendRange = lead.spend_range;
            if (spendRange && spendRange !== "N/A" && spendRange.includes('-')) {
                const [min, max] = spendRange.split('-').map(Number);
                return sum + (max || min || 0);
            }
            return sum;
        }, 0);

        const stats = {
            totalLeads: leadsData.length,
            totalSpend,
            totalReach: leadsData.reduce((sum, lead) => sum + (lead.total_reach || 0), 0),
            highPriority: leadsData.filter(lead => lead.lead_priority === 'high').length,
        };

        res.json(stats);
    } catch (error) {
        console.error('Error calculating stats:', error);
        res.status(500).json({ error: 'Failed to calculate statistics' });
    }
}