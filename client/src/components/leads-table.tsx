import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Phone, Globe, Facebook } from "lucide-react";
import { formatNumber, formatPhone, getSearchTermColor, getPlatformBadges } from "@/lib/utils";
import type { Lead } from "@shared/schema";

interface LeadsTableProps {
  leads: Lead[];
  onExport: (type: 'all' | 'selected', selectedIds?: number[]) => void;
}

export default function LeadsTable({ leads, onExport }: LeadsTableProps) {
  const [selectedLeads, setSelectedLeads] = useState<Set<number>>(new Set());
  const [sortField, setSortField] = useState<keyof Lead>('leadScore');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(new Set(leads.map(lead => lead.id)));
    } else {
      setSelectedLeads(new Set());
    }
  };

  const handleSelectLead = (leadId: number, checked: boolean) => {
    const newSelected = new Set(selectedLeads);
    if (checked) {
      newSelected.add(leadId);
    } else {
      newSelected.delete(leadId);
    }
    setSelectedLeads(newSelected);
  };

  const handleSort = (field: keyof Lead) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedLeads = [...leads].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    const aStr = String(aValue).toLowerCase();
    const bStr = String(bValue).toLowerCase();
    
    if (sortDirection === 'asc') {
      return aStr.localeCompare(bStr);
    } else {
      return bStr.localeCompare(aStr);
    }
  });

  const SortableHeader = ({ field, children }: { field: keyof Lead; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-gray-100"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center">
        {children}
        <span className="ml-1 text-xs">
          {sortField === field ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
        </span>
      </div>
    </TableHead>
  );

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedLeads.size === leads.length && leads.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <SortableHeader field="searchTerm">Search Term</SortableHeader>
            <SortableHeader field="state">State</SortableHeader>
            <SortableHeader field="pageName">Page Name</SortableHeader>
            <SortableHeader field="spendRange">Spend Range</SortableHeader>
            <SortableHeader field="totalReach">Reach</SortableHeader>
            <SortableHeader field="platforms">Platforms</SortableHeader>
            <SortableHeader field="startDate">Start Date</SortableHeader>
            <TableHead>FB</TableHead>
            <TableHead>Ad</TableHead>
            <SortableHeader field="address">Address</SortableHeader>
            <SortableHeader field="website">Website</SortableHeader>
            <SortableHeader field="phone">Phone</SortableHeader>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedLeads.map((lead) => (
            <TableRow key={lead.id} className="hover:bg-gray-50">
              <TableCell>
                <Checkbox
                  checked={selectedLeads.has(lead.id)}
                  onCheckedChange={(checked) => handleSelectLead(lead.id, checked as boolean)}
                />
              </TableCell>
              <TableCell>
                <Badge className={`${getSearchTermColor(lead.searchTerm)} text-white`}>
                  {lead.searchTerm}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-gray-900">
                {lead.state}
              </TableCell>
              <TableCell className="text-sm font-medium text-gray-900">
                {lead.pageName}
              </TableCell>
              <TableCell className="text-sm text-gray-900">
                {lead.spendRange}
              </TableCell>
              <TableCell className="text-sm text-gray-900">
                {formatNumber(lead.totalReach)}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {getPlatformBadges(lead.platforms).map((platform, index) => (
                    <Badge key={index} variant="secondary" className={platform.color}>
                      {platform.name}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-sm text-gray-900">
                {lead.startDate}
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" asChild>
                  <a href={lead.fbLink} target="_blank" rel="noopener noreferrer">
                    <Facebook className="h-4 w-4 text-blue-600" />
                  </a>
                </Button>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" asChild>
                  <a href={lead.adLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 text-skyward-purple" />
                  </a>
                </Button>
              </TableCell>
              <TableCell className="text-sm text-gray-900 max-w-xs truncate">
                {lead.address}
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" asChild>
                  <a href={lead.website} target="_blank" rel="noopener noreferrer" className="flex items-center text-skyward-purple hover:text-skyward-light-purple">
                    <Globe className="h-4 w-4 mr-1" />
                    {lead.normalizedWebsite}
                  </a>
                </Button>
              </TableCell>
              <TableCell>
                {lead.phone && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={`tel:${lead.phone}`} className="flex items-center text-green-600 hover:text-green-900">
                      <Phone className="h-4 w-4 mr-1" />
                      {formatPhone(lead.phone)}
                    </a>
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <Button variant="outline">Previous</Button>
          <Button variant="outline">Next</Button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to{" "}
              <span className="font-medium">{Math.min(10, leads.length)}</span> of{" "}
              <span className="font-medium">{formatNumber(leads.length)}</span> results
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">Previous</Button>
            <Button className="bg-skyward-purple text-white" size="sm">1</Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">3</Button>
            <span className="text-sm text-gray-500">...</span>
            <Button variant="outline" size="sm">
              {Math.ceil(leads.length / 10)}
            </Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
