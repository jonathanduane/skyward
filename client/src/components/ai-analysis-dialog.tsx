import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Loader2, Brain, Target, AlertTriangle, TrendingUp, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Lead } from "@shared/schema";

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

interface AIAnalysisDialogProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AIAnalysisDialog({ lead, open, onOpenChange }: AIAnalysisDialogProps) {
  const [analysis, setAnalysis] = useState<LeadAnalysis | null>(null);
  const queryClient = useQueryClient();

  const analyzeMutation = useMutation({
    mutationFn: async (leadId: number) => {
      const response = await fetch(`/api/ai/analyze-lead/${leadId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to analyze lead');
      }
      return response.json();
    },
    onSuccess: (data: LeadAnalysis) => {
      setAnalysis(data);
    },
  });

  const handleAnalyze = () => {
    if (lead) {
      setAnalysis(null);
      analyzeMutation.mutate(lead.id);
    }
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

  const getPriorityTextColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 dark:text-red-400';
      case 'high': return 'text-orange-600 dark:text-orange-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-black">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-black dark:text-white">
            <Brain className="h-5 w-5 text-salmon-500" />
            AI Lead Analysis
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            {lead ? `Analyzing ${lead.pageName} - ${lead.searchTerm}` : 'Select a lead to analyze'}
          </DialogDescription>
        </DialogHeader>

        {lead && (
          <div className="space-y-6">
            {/* Lead Summary */}
            <Card className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg text-black dark:text-white">{lead.pageName}</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  {lead.searchTerm} • {lead.state} • Reach: {lead.totalReach?.toLocaleString()}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Analysis Button */}
            {!analysis && (
              <div className="text-center">
                <Button 
                  onClick={handleAnalyze} 
                  disabled={analyzeMutation.isPending}
                  className="bg-salmon-500 hover:bg-salmon-600 text-white"
                >
                  {analyzeMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing with AI...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Analyze Lead with AI
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Analysis Results */}
            {analysis && (
              <div className="space-y-4">
                {/* Score and Priority */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">AI Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1">
                          <Progress value={analysis.score} className="h-3" />
                        </div>
                        <span className="text-2xl font-bold text-black dark:text-white">{analysis.score}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Priority</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge className={`${getPriorityColor(analysis.priority)} text-white capitalize`}>
                        {analysis.priority}
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Confidence</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-2">
                        <Progress value={analysis.confidence * 100} className="h-3" />
                        <span className="text-lg font-semibold text-black dark:text-white">
                          {Math.round(analysis.confidence * 100)}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Analysis Details */}
                <Tabs defaultValue="insights" className="w-full">
                  <TabsList className="grid w-full grid-cols-5 bg-gray-100 dark:bg-gray-800">
                    <TabsTrigger value="insights" className="text-black dark:text-white">Insights</TabsTrigger>
                    <TabsTrigger value="recommendations" className="text-black dark:text-white">Recommendations</TabsTrigger>
                    <TabsTrigger value="next-steps" className="text-black dark:text-white">Next Steps</TabsTrigger>
                    <TabsTrigger value="risks" className="text-black dark:text-white">Risks</TabsTrigger>
                    <TabsTrigger value="opportunities" className="text-black dark:text-white">Opportunities</TabsTrigger>
                  </TabsList>

                  <TabsContent value="insights" className="space-y-3">
                    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                          <Target className="h-4 w-4 text-blue-500" />
                          Key Insights
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {analysis.insights.map((insight, index) => (
                            <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              {insight}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="recommendations" className="space-y-3">
                    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                          <Brain className="h-4 w-4 text-salmon-500" />
                          AI Recommendations
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {analysis.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                              <CheckCircle className="h-4 w-4 text-salmon-500 mt-0.5 flex-shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="next-steps" className="space-y-3">
                    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Next Steps
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ol className="space-y-2">
                          {analysis.nextSteps.map((step, index) => (
                            <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                              <span className="bg-salmon-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                                {index + 1}
                              </span>
                              {step}
                            </li>
                          ))}
                        </ol>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="risks" className="space-y-3">
                    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          Risk Factors
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {analysis.riskFactors.map((risk, index) => (
                            <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                              {risk}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="opportunities" className="space-y-3">
                    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          Growth Opportunities
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {analysis.opportunities.map((opp, index) => (
                            <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                              <TrendingUp className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              {opp}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {/* Error State */}
            {analyzeMutation.isError && (
              <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <AlertTriangle className="h-4 w-4" />
                    Failed to analyze lead. Please try again.
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}