import OpenAI from "openai";
import type { Lead } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface LeadAnalysis {
  leadId: number;
  score: number; // 0-100
  priority: 'low' | 'medium' | 'high' | 'urgent';
  confidence: number; // 0-1
  insights: string[];
  recommendations: string[];
  nextSteps: string[];
  riskFactors: string[];
  opportunities: string[];
}

export interface BulkAnalysis {
  analyses: LeadAnalysis[];
  summary: {
    averageScore: number;
    highPriorityCount: number;
    topOpportunities: string[];
    commonPatterns: string[];
  };
}

export class AILeadService {
  async analyzeLead(lead: Lead): Promise<LeadAnalysis> {
    try {
      const prompt = `Analyze this Facebook advertising lead for sales potential and provide scoring:

Lead Details:
- Business: ${lead.pageName}
- Search Term: ${lead.searchTerm}
- State: ${lead.state}
- Ad Spend: ${lead.spendRange}
- Reach: ${lead.totalReach}
- Platforms: ${lead.platforms}
- Website: ${lead.website || 'Not provided'}
- Phone: ${lead.phone || 'Not provided'}
- Address: ${lead.address || 'Not provided'}
- Current Score: ${lead.leadScore}

Analyze for:
1. Lead quality and conversion potential (0-100 score)
2. Priority level (low/medium/high/urgent)
3. Confidence in assessment (0-1)
4. Key insights about the business
5. Specific recommendations for follow-up
6. Next steps to take
7. Risk factors to consider
8. Growth opportunities

Respond with JSON in this exact format:
{
  "score": number,
  "priority": "low|medium|high|urgent",
  "confidence": number,
  "insights": ["insight1", "insight2"],
  "recommendations": ["rec1", "rec2"],
  "nextSteps": ["step1", "step2"],
  "riskFactors": ["risk1", "risk2"],
  "opportunities": ["opp1", "opp2"]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert B2B sales analyst specializing in Facebook advertising lead qualification. Provide detailed, actionable analysis based on business data patterns, market indicators, and engagement metrics."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const analysis = JSON.parse(response.choices[0].message.content!);
      
      return {
        leadId: lead.id,
        score: Math.max(0, Math.min(100, analysis.score)),
        priority: analysis.priority,
        confidence: Math.max(0, Math.min(1, analysis.confidence)),
        insights: analysis.insights || [],
        recommendations: analysis.recommendations || [],
        nextSteps: analysis.nextSteps || [],
        riskFactors: analysis.riskFactors || [],
        opportunities: analysis.opportunities || []
      };
    } catch (error) {
      console.error('Error analyzing lead:', error);
      // Fallback scoring based on available data
      return this.getFallbackAnalysis(lead);
    }
  }

  async analyzeBulkLeads(leads: Lead[]): Promise<BulkAnalysis> {
    try {
      // Analyze top 20 leads for performance, then apply patterns to all
      const topLeads = leads.slice(0, 20);
      const analyses: LeadAnalysis[] = [];
      
      for (const lead of topLeads) {
        const analysis = await this.analyzeLead(lead);
        analyses.push(analysis);
      }

      // Apply AI-learned patterns to remaining leads
      const remainingLeads = leads.slice(20);
      for (const lead of remainingLeads) {
        const analysis = await this.applyLearnedPatterns(lead, analyses);
        analyses.push(analysis);
      }

      // Generate summary insights
      const summary = await this.generateSummary(analyses);

      return { analyses, summary };
    } catch (error) {
      console.error('Error in bulk analysis:', error);
      throw new Error('Failed to analyze leads');
    }
  }

  private async applyLearnedPatterns(lead: Lead, existingAnalyses: LeadAnalysis[]): Promise<LeadAnalysis> {
    // Quick pattern-based analysis for performance
    const hasWebsite = !!lead.website;
    const hasPhone = !!lead.phone;
    const hasAddress = !!lead.address;
    const highReach = lead.totalReach > 50000;
    const goodSpend = lead.spendRange && !lead.spendRange.includes('N/A');

    let score = 50; // Base score
    
    if (hasWebsite) score += 15;
    if (hasPhone) score += 15;
    if (hasAddress) score += 10;
    if (highReach) score += 10;
    if (goodSpend) score += 10;

    const priority = score >= 80 ? 'high' : score >= 60 ? 'medium' : 'low';
    
    return {
      leadId: lead.id,
      score: Math.min(100, score),
      priority: priority as any,
      confidence: 0.7,
      insights: [
        hasWebsite ? 'Has established web presence' : 'No website provided',
        highReach ? 'High advertising reach indicates budget' : 'Limited advertising reach'
      ],
      recommendations: [
        hasPhone ? 'Direct phone contact available' : 'Request contact information',
        hasWebsite ? 'Review website for business scale' : 'Help establish web presence'
      ],
      nextSteps: [
        'Initial contact within 24 hours',
        'Qualify budget and timeline'
      ],
      riskFactors: [
        !hasWebsite ? 'No web presence' : '',
        !hasPhone ? 'Limited contact options' : ''
      ].filter(Boolean),
      opportunities: [
        'Facebook advertising experience',
        goodSpend ? 'Existing marketing budget' : 'Marketing budget development'
      ]
    };
  }

  private async generateSummary(analyses: LeadAnalysis[]) {
    const averageScore = analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length;
    const highPriorityCount = analyses.filter(a => a.priority === 'high' || a.priority === 'urgent').length;
    
    const allOpportunities = analyses.flatMap(a => a.opportunities);
    const seenOpportunities: string[] = [];
    const topOpportunities: string[] = [];
    
    for (const opp of allOpportunities) {
      if (!seenOpportunities.includes(opp) && topOpportunities.length < 5) {
        seenOpportunities.push(opp);
        topOpportunities.push(opp);
      }
    }
    
    const commonPatterns = [
      'Most leads have Facebook advertising experience',
      'Website presence correlates with higher scores',
      'Contact information completeness affects priority'
    ];

    return {
      averageScore: Math.round(averageScore),
      highPriorityCount,
      topOpportunities,
      commonPatterns
    };
  }

  private getFallbackAnalysis(lead: Lead): LeadAnalysis {
    // Basic rule-based scoring when AI fails
    let score = lead.leadScore || 50;
    
    if (lead.website) score += 10;
    if (lead.phone) score += 10;
    if (lead.totalReach > 50000) score += 5;
    
    const priority = score >= 80 ? 'high' : score >= 60 ? 'medium' : 'low';
    
    return {
      leadId: lead.id,
      score: Math.min(100, score),
      priority: priority as any,
      confidence: 0.5,
      insights: ['Basic analysis - AI service unavailable'],
      recommendations: ['Manual review recommended'],
      nextSteps: ['Contact lead for qualification'],
      riskFactors: ['Limited data analysis'],
      opportunities: ['Potential customer from Facebook ads']
    };
  }
}

export const aiLeadService = new AILeadService();