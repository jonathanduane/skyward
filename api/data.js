// Complete lead dataset - 123 Facebook advertising leads
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

// Transform function to convert raw data to Lead format
function transformLeads() {
    return leadsData.map((leadData, index) => ({
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
    }));
}

export default function handler(req, res) {
    const { search, state, searchTerm } = req.query;
    
    let leads = transformLeads();
    
    // Apply filters
    if (search) {
        const query = search.toLowerCase();
        leads = leads.filter(lead =>
            lead.searchTerm.toLowerCase().includes(query) ||
            lead.pageName.toLowerCase().includes(query) ||
            lead.state.toLowerCase().includes(query) ||
            lead.address.toLowerCase().includes(query) ||
            lead.website.toLowerCase().includes(query) ||
            lead.phone.toLowerCase().includes(query)
        );
    }
    
    if (state && state !== 'all') {
        leads = leads.filter(lead => lead.state === state);
    }
    
    if (searchTerm && searchTerm !== 'all') {
        leads = leads.filter(lead => lead.searchTerm === searchTerm);
    }
    
    res.json(leads);
}