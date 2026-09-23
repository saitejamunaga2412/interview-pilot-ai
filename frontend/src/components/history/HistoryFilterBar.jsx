import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { Search, Filter, Download } from 'lucide-react';
import { Button } from '../ui/Button';

export const HistoryFilterBar = ({ 
  searchQuery, 
  setSearchQuery, 
  dateRange, 
  setDateRange,
  onExport 
}) => {
  return (
    <Card className="border-border shadow-sm mb-6 bg-surface">
      <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
        
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search activities, titles, tags..."
            className="w-full pl-9 pr-4 py-2 bg-bg-base border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Date Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative">
             <input 
               type="date"
               value={dateRange.from}
               onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
               className="pl-3 pr-3 py-2 bg-bg-base border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 w-full"
               aria-label="From Date"
             />
          </div>
          <span className="text-text-muted text-sm">to</span>
          <div className="relative">
             <input 
               type="date"
               value={dateRange.to}
               onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
               className="pl-3 pr-3 py-2 bg-bg-base border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 w-full"
               aria-label="To Date"
             />
          </div>
        </div>

        {/* Export */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-4">
           <Button variant="outline" size="sm" onClick={onExport} leftIcon={<Download className="w-4 h-4" />}>
             Export CSV
           </Button>
        </div>

      </CardContent>
    </Card>
  );
};
