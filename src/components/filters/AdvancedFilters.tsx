import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Badge } from '@/components/ui/badge';
import { Filter, X, RotateCcw, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DateRange } from 'react-day-picker';

interface FilterValues {
  search: string;
  category: string[];
  priceRange: [number, number];
  stockRange: [number, number];
  dateRange?: DateRange;
  status: string[];
  supplier: string[];
  tags: string[];
}

interface AdvancedFiltersProps {
  onFiltersChange: (filters: FilterValues) => void;
  onReset: () => void;
  className?: string;
}

const defaultFilters: FilterValues = {
  search: '',
  category: [],
  priceRange: [0, 10000000],
  stockRange: [0, 1000],
  dateRange: undefined,
  status: [],
  supplier: [],
  tags: []
};

const categories = [
  'Networking Equipment',
  'Computers & Laptops', 
  'Mobile Devices',
  'Accessories',
  'Storage Devices',
  'Audio & Video'
];

const suppliers = [
  'PT Teknologi Indonesia',
  'CV Digital Solutions',
  'PT Global Tech',
  'UD Komputer Center',
  'PT Network Systems'
];

const statuses = [
  'In Stock',
  'Low Stock',
  'Out of Stock',
  'Discontinued',
  'Coming Soon'
];

const tags = [
  'Popular',
  'New Arrival',
  'Best Seller',
  'On Sale',
  'Premium',
  'Budget Friendly'
];

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({ 
  onFiltersChange, 
  onReset, 
  className = "" 
}) => {
  const [filters, setFilters] = useState<FilterValues>(defaultFilters);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof FilterValues, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleArrayFilterToggle = (key: keyof FilterValues, value: string) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    handleFilterChange(key, newArray);
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    onReset();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.category.length > 0) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000000) count++;
    if (filters.stockRange[0] > 0 || filters.stockRange[1] < 1000) count++;
    if (filters.dateRange?.from || filters.dateRange?.to) count++;
    if (filters.status.length > 0) count++;
    if (filters.supplier.length > 0) count++;
    if (filters.tags.length > 0) count++;
    return count;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle>Advanced Filters</CardTitle>
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFiltersCount()} active
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={getActiveFiltersCount() === 0}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Less' : 'More'} Filters
            </Button>
          </div>
        </div>
        <CardDescription>
          Filter products by various criteria to find exactly what you're looking for
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search Products</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by name, SKU, or description..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category */}
        <div className="space-y-3">
          <Label>Categories</Label>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={category}
                  checked={filters.category.includes(category)}
                  onCheckedChange={() => handleArrayFilterToggle('category', category)}
                />
                <Label htmlFor={category} className="text-sm font-normal cursor-pointer">
                  {category}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-3">
          <Label>Price Range</Label>
          <div className="px-2">
            <Slider
              value={filters.priceRange}
              onValueChange={(value) => handleFilterChange('priceRange', value as [number, number])}
              max={10000000}
              min={0}
              step={100000}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>{formatCurrency(filters.priceRange[0])}</span>
              <span>{formatCurrency(filters.priceRange[1])}</span>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 overflow-hidden"
            >
              {/* Stock Range */}
              <div className="space-y-3">
                <Label>Stock Quantity</Label>
                <div className="px-2">
                  <Slider
                    value={filters.stockRange}
                    onValueChange={(value) => handleFilterChange('stockRange', value as [number, number])}
                    max={1000}
                    min={0}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>{filters.stockRange[0]} units</span>
                    <span>{filters.stockRange[1]} units</span>
                  </div>
                </div>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <Label>Date Range</Label>
              <DatePickerWithRange
                date={filters.dateRange}
                onDateChange={(dateRange) => handleFilterChange('dateRange', dateRange)}
              />
              </div>

              {/* Status */}
              <div className="space-y-3">
                <Label>Stock Status</Label>
                <div className="grid grid-cols-2 gap-2">
                  {statuses.map((status) => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox
                        id={status}
                        checked={filters.status.includes(status)}
                        onCheckedChange={() => handleArrayFilterToggle('status', status)}
                      />
                      <Label htmlFor={status} className="text-sm font-normal cursor-pointer">
                        {status}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suppliers */}
              <div className="space-y-3">
                <Label>Suppliers</Label>
                <div className="space-y-2">
                  {suppliers.map((supplier) => (
                    <div key={supplier} className="flex items-center space-x-2">
                      <Checkbox
                        id={supplier}
                        checked={filters.supplier.includes(supplier)}
                        onCheckedChange={() => handleArrayFilterToggle('supplier', supplier)}
                      />
                      <Label htmlFor={supplier} className="text-sm font-normal cursor-pointer">
                        {supplier}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-3">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={filters.tags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => handleArrayFilterToggle('tags', tag)}
                    >
                      {tag}
                      {filters.tags.includes(tag) && (
                        <X className="h-3 w-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Filters Summary */}
        {getActiveFiltersCount() > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">Active Filters</Label>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {filters.search}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleFilterChange('search', '')}
                  />
                </Badge>
              )}
              {filters.category.map((cat) => (
                <Badge key={cat} variant="secondary" className="flex items-center gap-1">
                  {cat}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleArrayFilterToggle('category', cat)}
                  />
                </Badge>
              ))}
              {(filters.priceRange[0] > 0 || filters.priceRange[1] < 10000000) && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Price: {formatCurrency(filters.priceRange[0])} - {formatCurrency(filters.priceRange[1])}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleFilterChange('priceRange', [0, 10000000])}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};