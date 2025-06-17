import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Loader2, TrendingUp, Users, AlertTriangle, Target } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface LeadAnalysis {
  leadId: number;
  score: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  confidence: number;
  insights: string[];
  recommendations: string[];
  nextSteps: string[];
  riskFactors: string[];
  opportunities: string[];
}

interface BulkAnalysis {
  analyses: LeadAnalysis[];
  summary: {
    averageScore: number;
    highPriorityCount: number;
    topOpportunities: string[];
    commonPatterns: string[];
  };
}

interface BulkAIAnalysisProps {
  onAnalysisComplete?: (analysis: BulkAnalysis) => void;
}

export default function BulkAIAnalysis({ onAnalysisComplete }: BulkAIAnalysisProps) {
  const [analysis, setAnalysis] = useState<BulkAnalysis | null>(null);

  const bulkAnalyzeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/ai/analyze-bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to analyze leads');
      }
      return response.json();
    },
    onSuccess: (data: BulkAnalysis) => {
      setAnalysis(data);
      onAnalysisComplete?.(data);
    },
  });

  const handleBulkAnalyze = () => {
    setAnalysis(null);
    bulkAnalyzeMutation.mutate();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const priorityDistribution = analysis ? {
    urgent: analysis.analyses.filter(a => a.priority === 'urgent').length,
    high: analysis.analyses.filter(a => a.priority === 'high').length,
    medium: analysis.analyses.filter(a => a.priority === 'medium').length,
    low: analysis.analyses.filter(a => a.priority === 'low').length,
  } : { urgent: 0, high: 0, medium: 0, low: 0 };

  const topLeads = analysis ? 
    analysis.analyses
      .sort((a, b) => b.score - a.score)
      .slice(0, 10) : [];

  return (
    <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-black dark:text-white">
          <Brain className="h-5 w-5 text-salmon-500" />
          Bulk AI Analysis
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          Analyze all leads with AI to get insights and recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!analysis && (
          <div className="text-center">
            <Button 
              onClick={handleBulkAnalyze} 
              disabled={bulkAnalyzeMutation.isPending}
              className="bg-salmon-500 hover:bg-salmon-600 text-white"
              size="lg"
            >
              {bulkAnalyzeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing 123 leads...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Analyze All Leads with AI
                </>
              )}
            </Button>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              This will analyze all 123 leads and provide comprehensive insights
            </p>
          </div>
        )}

        {bulkAnalyzeMutation.isPending && (
          <div className="text-center space-y-4">
            <div className="animate-pulse">
              <Brain className="h-12 w-12 text-salmon-500 mx-auto mb-4" />
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              AI is analyzing your leads... This may take a few minutes.
            </p>
            <Progress value={33} className="w-full max-w-md mx-auto" />
          </div>
        )}

        {analysis && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-black dark:text-white">{analysis.summary.averageScore}</div>
                  <Progress value={analysis.summary.averageScore} className="h-2 mt-2" />
                </CardContent>
              </Card>

              <Card className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">High Priority</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-black dark:text-white">{analysis.summary.highPriorityCount}</div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">leads need immediate attention</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Analyzed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-black dark:text-white">{analysis.analyses.length}</div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">leads processed</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Confidence</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-black dark:text-white">
                    {Math.round((analysis.analyses.reduce((sum, a) => sum + a.confidence, 0) / analysis.analyses.length) * 100)}%
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">average confidence</p>
                </CardContent>
              </Card>
            </div>

            {/* Priority Distribution */}
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                  <Users className="h-4 w-4 text-blue-500" />
                  Priority Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <Badge className="bg-red-500 text-white mb-2">Urgent</Badge>
                    <div className="text-2xl font-bold text-black dark:text-white">{priorityDistribution.urgent}</div>
                  </div>
                  <div className="text-center">
                    <Badge className="bg-orange-500 text-white mb-2">High</Badge>
                    <div className="text-2xl font-bold text-black dark:text-white">{priorityDistribution.high}</div>
                  </div>
                  <div className="text-center">
                    <Badge className="bg-yellow-500 text-white mb-2">Medium</Badge>
                    <div className="text-2xl font-bold text-black dark:text-white">{priorityDistribution.medium}</div>
                  </div>
                  <div className="text-center">
                    <Badge className="bg-green-500 text-white mb-2">Low</Badge>
                    <div className="text-2xl font-bold text-black dark:text-white">{priorityDistribution.low}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Analysis */}
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800">
                <TabsTrigger value="summary" className="text-black dark:text-white">Summary</TabsTrigger>
                <TabsTrigger value="top-leads" className="text-black dark:text-white">Top Leads</TabsTrigger>
                <TabsTrigger value="opportunities" className="text-black dark:text-white">Opportunities</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                        <Target className="h-4 w-4 text-blue-500" />
                        Common Patterns
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysis.summary.commonPatterns.map((pattern, index) => (
                          <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                            <span className="w-2 h-2 bg-salmon-500 rounded-full mt-2 flex-shrink-0"></span>
                            {pattern}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        Top Opportunities
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysis.summary.topOpportunities.map((opportunity, index) => (
                          <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                            <TrendingUp className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                            {opportunity}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="top-leads" className="space-y-4">
                <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-black dark:text-white">Top 10 Leads by AI Score</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Highest scoring leads based on AI analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {topLeads.map((lead, index) => (
                        <div key={lead.leadId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="bg-salmon-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </span>
                            <div>
                              <div className="font-medium text-black dark:text-white">Lead #{lead.leadId}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                Score: {lead.score} • Confidence: {Math.round(lead.confidence * 100)}%
                              </div>
                            </div>
                          </div>
                          <Badge className={`${getPriorityColor(lead.priority)} text-white capitalize`}>
                            {lead.priority}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="opportunities" className="space-y-4">
                <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      Market Opportunities
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Key opportunities identified across all leads
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analysis.summary.topOpportunities.map((opportunity, index) => (
                        <div key={index} className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="flex items-start gap-2">
                            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                            <div className="text-sm text-green-800 dark:text-green-200">{opportunity}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {bulkAnalyzeMutation.isError && (
          <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-4 w-4" />
                Failed to analyze leads. Please try again.
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}