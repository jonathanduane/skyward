import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Users, DollarSign, Eye, Star } from "lucide-react";
import { formatNumber, formatCurrency } from "@/lib/utils";
import type { LeadStats } from "@shared/schema";

export default function SummaryCards() {
  const { data: stats, isLoading } = useQuery<LeadStats>({
    queryKey: ["/api/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-200 rounded-md"></div>
                <div className="ml-5 flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    {
      title: "Total Leads",
      value: formatNumber(stats.totalLeads),
      icon: Users,
      color: "bg-skyward-purple",
    },
    {
      title: "Total Ad Spend",
      value: formatCurrency(stats.totalSpend),
      icon: DollarSign,
      color: "bg-green-500",
    },
    {
      title: "Total Reach",
      value: formatNumber(stats.totalReach),
      icon: Eye,
      color: "bg-blue-500",
    },
    {
      title: "High Priority",
      value: formatNumber(stats.highPriority),
      icon: Star,
      color: "bg-skyward-pink",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className={`flex-shrink-0 w-8 h-8 ${card.color} rounded-md flex items-center justify-center`}>
                <card.icon className="w-4 h-4 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{card.title}</dt>
                  <dd className="text-lg font-medium text-gray-900">{card.value}</dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
