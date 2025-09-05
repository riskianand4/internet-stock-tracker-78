import React from 'react';
import { Calendar, Clock, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { TimeFilter, DateRange } from '../AdvancedStatsOverview';

interface StatsFiltersProps {
  timeFilter: TimeFilter;
  onTimeFilterChange: (filter: TimeFilter) => void;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

const StatsFilters = ({
  timeFilter,
  onTimeFilterChange,
  dateRange,
  onDateRangeChange
}: StatsFiltersProps) => {
  const handleQuickFilter = (days: number) => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - days);
    
    onDateRangeChange({ from, to });
    
    if (days === 7) onTimeFilterChange('week');
    else if (days === 30) onTimeFilterChange('month');
    else if (days === 90) onTimeFilterChange('quarter');
    else if (days === 365) onTimeFilterChange('year');
  };

  return (
    <Card className="p-3 sm:p-4 md:p-6 glass">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
        {/* Time Period Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground hidden sm:inline">
              Periode:
            </span>
          </div>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {[
              { label: '7 Hari', value: 'week', days: 7 },
              { label: '30 Hari', value: 'month', days: 30 },
              { label: '3 Bulan', value: 'quarter', days: 90 },
              { label: '1 Tahun', value: 'year', days: 365 }
            ].map((period) => (
              <Button
                key={period.value}
                variant={timeFilter === period.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleQuickFilter(period.days)}
                className="relative overflow-hidden transition-all duration-300 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 min-w-0 flex-shrink-0"
              >
                <span className="truncate">{period.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Date Range & Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "justify-start text-left font-normal text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 w-full sm:w-auto min-w-0",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <Calendar className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate">
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        <span className="hidden sm:inline">
                          {format(dateRange.from, "dd MMM")} - {format(dateRange.to, "dd MMM yyyy")}
                        </span>
                        <span className="sm:hidden">
                          {format(dateRange.from, "dd/MM")} - {format(dateRange.to, "dd/MM/yy")}
                        </span>
                      </>
                    ) : (
                      format(dateRange.from, "dd MMM yyyy")
                    )
                  ) : (
                    <span>Pilih tanggal</span>
                  )}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={{
                  from: dateRange?.from,
                  to: dateRange?.to
                }}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    onDateRangeChange({ from: range.from, to: range.to });
                    onTimeFilterChange('custom');
                  }
                }}
                numberOfMonths={2}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 flex-1 sm:flex-none">
              <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="hidden sm:inline">Filter Lanjut</span>
              <span className="sm:hidden">Filter</span>
            </Button>
            <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 flex-1 sm:flex-none">
              <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="hidden sm:inline">Export Data</span>
              <span className="sm:hidden">Export</span>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StatsFilters;