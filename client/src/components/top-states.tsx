import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { StateStats } from "@shared/schema";

export default function TopStates() {
  const { data: stateStats = [], isLoading } = useQuery<StateStats[]>({
    queryKey: ["/api/leads/states"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Australian States</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const colors = [
    "bg-skyward-purple",
    "bg-skyward-light-purple", 
    "bg-skyward-pink",
    "bg-blue-500",
    "bg-green-500"
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Australian States</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stateStats.map((state, index) => (
            <div key={state.name} className="flex items-center justify-between">
              <div className="flex items-center flex-1">
                <div className={`w-3 h-3 ${colors[index]} rounded-full mr-3`}></div>
                <span className="text-sm font-medium text-gray-900">{state.name}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  {state.count} leads
                </span>
                <div className="w-16">
                  <Progress 
                    value={state.percentage} 
                    className="h-2"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
