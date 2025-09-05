import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, Calendar, DollarSign, Package, Tag, MapPin, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';

export interface SearchFilters {
  query: string;
  category: string;
  status: string[];
  priceRange: [number, number];
  stockRange: [number, number];
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  location: string;
  supplier: string;
  tags: string[];
}

interface AdvancedSearchProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  categories: string[];
  locations: string[];
  suppliers: string[];
  availableTags: string[];
  maxPrice?: number;
  maxStock?: number;
}

const defaultFilters: SearchFilters = {
  query: '',
  category: '',
  status: [],
  priceRange: [0, 10000000],
  stockRange: [0, 1000],
  dateRange: { from: null, to: null },
  location: '',
  supplier: '',
  tags: [],
};

const statusOptions = [
  { value: 'in_stock', label: 'In Stock', color: 'bg-green-500' },
  { value: 'low_stock', label: 'Low Stock', color: 'bg-yellow-500' },
  { value: 'out_of_stock', label: 'Out of Stock', color: 'bg-red-500' },
];

export const AdvancedSearch = ({
  filters,
  onFiltersChange,
  categories = [],
  locations = [],
  suppliers = [],
  availableTags = [],
  maxPrice = 10000000,
  maxStock = 1000,
}: AdvancedSearchProps) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState(filters);

  // Update temp filters when props change
  useEffect(() => {
    setTempFilters(filters);
  }, [filters]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.query) count++;
    if (filters.category) count++;
    if (filters.status.length > 0) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice) count++;
    if (filters.stockRange[0] > 0 || filters.stockRange[1] < maxStock) count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.location) count++;
    if (filters.supplier) count++;
    if (filters.tags.length > 0) count++;
    return count;
  }, [filters, maxPrice, maxStock]);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...tempFilters, [key]: value };
    setTempFilters(newFilters);
  };

  const applyFilters = () => {
    onFiltersChange(tempFilters);
    setIsAdvancedOpen(false);
  };

  const resetFilters = () => {
    const resetFilters = { ...defaultFilters };
    setTempFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const toggleStatus = (status: string) => {
    const newStatus = tempFilters.status.includes(status)
      ? tempFilters.status.filter(s => s !== status)
      : [...tempFilters.status, status];
    updateFilter('status', newStatus);
  };

  const toggleTag = (tag: string) => {
    const newTags = tempFilters.tags.includes(tag)
      ? tempFilters.tags.filter(t => t !== tag)
      : [...tempFilters.tags, tag];
    updateFilter('tags', newTags);
  };

  return (
    <div className="space-y-4">
      {/* Quick Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search products, SKU, description..."
            value={filters.query}
            onChange={(e) => onFiltersChange({ ...filters, query: e.target.value })}
            className="pl-10"
          />
        </div>
        
        <Dialog open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Advanced Search & Filters</DialogTitle>
              <DialogDescription>
                Use advanced filters to find exactly what you're looking for
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Basic Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select 
                    value={tempFilters.category} 
                    onValueChange={(value) => updateFilter('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border shadow-lg z-50">
                      <SelectItem value="">All categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Location</Label>
                  <Select 
                    value={tempFilters.location} 
                    onValueChange={(value) => updateFilter('location', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All locations" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border shadow-lg z-50">
                      <SelectItem value="">All locations</SelectItem>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Supplier</Label>
                  <Select 
                    value={tempFilters.supplier} 
                    onValueChange={(value) => updateFilter('supplier', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All suppliers" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border shadow-lg z-50">
                      <SelectItem value="">All suppliers</SelectItem>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier} value={supplier}>
                          {supplier}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex gap-2 flex-wrap">
                  {statusOptions.map((status) => (
                    <Button
                      key={status.value}
                      variant={tempFilters.status.includes(status.value) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleStatus(status.value)}
                      className="gap-2"
                    >
                      <div className={`w-2 h-2 rounded-full ${status.color}`} />
                      {status.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <Label>Price Range</Label>
                <div className="px-3">
                  <Slider
                    min={0}
                    max={maxPrice}
                    step={10000}
                    value={tempFilters.priceRange}
                    onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{formatCurrency(tempFilters.priceRange[0])}</span>
                  <span>{formatCurrency(tempFilters.priceRange[1])}</span>
                </div>
              </div>

              {/* Stock Range */}
              <div className="space-y-2">
                <Label>Stock Range</Label>
                <div className="px-3">
                  <Slider
                    min={0}
                    max={maxStock}
                    step={1}
                    value={tempFilters.stockRange}
                    onValueChange={(value) => updateFilter('stockRange', value as [number, number])}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{tempFilters.stockRange[0]} units</span>
                  <span>{tempFilters.stockRange[1]} units</span>
                </div>
              </div>

              {/* Tags */}
              {availableTags.length > 0 && (
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex gap-2 flex-wrap">
                    {availableTags.map((tag) => (
                      <Button
                        key={tag}
                        variant={tempFilters.tags.includes(tag) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleTag(tag)}
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={resetFilters}>
                  Reset All Filters
                </Button>
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => setIsAdvancedOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={applyFilters}>
                    Apply Filters
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      <AnimatePresence>
        {activeFiltersCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2"
          >
            {filters.category && (
              <Badge variant="secondary" className="gap-1">
                <Package className="w-3 h-3" />
                {filters.category}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => onFiltersChange({ ...filters, category: '' })}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            )}

            {filters.status.map((status) => (
              <Badge key={status} variant="secondary" className="gap-1">
                {statusOptions.find(s => s.value === status)?.label}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => onFiltersChange({
                    ...filters,
                    status: filters.status.filter(s => s !== status)
                  })}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            ))}

            {filters.location && (
              <Badge variant="secondary" className="gap-1">
                <MapPin className="w-3 h-3" />
                {filters.location}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => onFiltersChange({ ...filters, location: '' })}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            )}

            {filters.supplier && (
              <Badge variant="secondary" className="gap-1">
                <User className="w-3 h-3" />
                {filters.supplier}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => onFiltersChange({ ...filters, supplier: '' })}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            )}

            {filters.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                <Tag className="w-3 h-3" />
                {tag}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => onFiltersChange({
                    ...filters,
                    tags: filters.tags.filter(t => t !== tag)
                  })}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};