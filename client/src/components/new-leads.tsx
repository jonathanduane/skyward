import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import type { Lead } from "@shared/schema";

export default function NewLeads() {
  const { data: newLeads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads/new"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>New Leads Since Last Fetch</CardTitle>
          <p className="text-sm text-gray-500">Loading...</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-5 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Leads Since Last Fetch</CardTitle>
        <p className="text-sm text-gray-500 mt-1">Last updated: 2 hours ago</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {newLeads.slice(0, 3).map((lead) => (
            <div key={lead.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Plus className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{lead.pageName}</p>
                <p className="text-sm text-gray-500">{lead.searchTerm}</p>
                <div className="flex items-center mt-1 space-x-2">
                  <Badge variant={lead.leadPriority === "High" ? "destructive" : "secondary"}>
                    {lead.leadPriority} Priority
                  </Badge>
                  <span className="text-xs text-gray-500">
                    Score: {formatNumber(lead.leadScore)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {newLeads.length > 3 && (
          <div className="mt-6">
            <Button 
              variant="ghost" 
              className="w-full text-skyward-purple hover:text-skyward-light-purple"
            >
              View all new leads
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
