import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SummaryCards from "@/components/summary-cards";
import TopStates from "@/components/top-states";
import NewLeads from "@/components/new-leads";
import LeadsTable from "@/components/leads-table";
import type { Lead } from "@shared/schema";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("all");
  const [selectedSearchTerm, setSelectedSearchTerm] = useState("all");

  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ["/api/get-leads", { search: searchQuery, state: selectedState, searchTerm: selectedSearchTerm }],
  });

  const handleExport = async (type: 'all' | 'selected', selectedIds?: number[]) => {
    try {
      const params = new URLSearchParams();
      if (type === 'selected' && selectedIds?.length) {
        params.append('selected', selectedIds.join(','));
      }
      
      const response = await fetch(`/api/get-leads/export?${params}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads-${type}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-skyward-purple mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img 
                src="https://skywarddigital.com.au/wp-content/uploads/2023/10/Group-17.svg" 
                alt="Skyward Digital" 
                className="h-8 w-auto mr-4"
              />
              <h1 className="text-xl font-semibold text-gray-900">Facebook Leads Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5 text-gray-500" />
              </Button>
              <div className="h-8 w-8 bg-skyward-purple rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">SD</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <SummaryCards />

        {/* Top States and New Leads */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <TopStates />
          <NewLeads />
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-lg shadow">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <span className="text-skyward-purple mr-2">👥</span>
                All Leads
              </h3>
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleExport('all')}
                  className="bg-skyward-purple hover:bg-skyward-light-purple text-white"
                >
                  Download Full CSV
                </Button>
                <Button
                  onClick={() => handleExport('selected')}
                  className="bg-skyward-light-purple hover:bg-skyward-purple text-white"
                >
                  Download Selected
                </Button>
                <Button
                  onClick={() => handleExport('all')}
                  className="bg-skyward-pink hover:bg-pink-600 text-white"
                >
                  Download All Leads
                </Button>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Search:
                </label>
                <Input
                  id="search"
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="focus:ring-skyward-purple focus:border-skyward-purple"
                />
              </div>

              <div>
                <label htmlFor="states" className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by States:
                </label>
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger className="focus:ring-skyward-purple focus:border-skyward-purple">
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    <SelectItem value="New South Wales">New South Wales</SelectItem>
                    <SelectItem value="Victoria">Victoria</SelectItem>
                    <SelectItem value="Queensland">Queensland</SelectItem>
                    <SelectItem value="Western Australia">Western Australia</SelectItem>
                    <SelectItem value="South Australia">South Australia</SelectItem>
                    <SelectItem value="Tasmania">Tasmania</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="search-terms" className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Search Terms:
                </label>
                <Select value={selectedSearchTerm} onValueChange={setSelectedSearchTerm}>
                  <SelectTrigger className="focus:ring-skyward-purple focus:border-skyward-purple">
                    <SelectValue placeholder="Select Search Terms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Search Terms</SelectItem>
                    <SelectItem value="coffee shops">Coffee Shops</SelectItem>
                    <SelectItem value="chiropractors">Chiropractors</SelectItem>
                    <SelectItem value="Black Friday deals">Black Friday Deals</SelectItem>
                    <SelectItem value="tutoring services">Tutoring Services</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <LeadsTable leads={leads} onExport={handleExport} />
        </div>
      </main>
    </div>
  );
}
