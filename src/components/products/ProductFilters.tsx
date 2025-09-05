import React from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface ProductFiltersProps {
  categories: string[];
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  stockRange: [number, number];
  onStockRangeChange: (range: [number, number]) => void;
  onClearFilters: () => void;
}

const ProductFilters = ({
  categories,
  selectedCategories,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  stockRange,
  onStockRangeChange,
  onClearFilters
}: ProductFiltersProps) => {
  const handleCategoryToggle = (category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoryChange(selectedCategories.filter(c => c !== category));
    } else {
      onCategoryChange([...selectedCategories, category]);
    }
  };

  const activeFiltersCount = selectedCategories.length +
    (priceRange[0] > 0 || priceRange[1] < 100000000 ? 1 : 0) +
    (stockRange[0] > 0 || stockRange[1] < 1000 ? 1 : 0);

  return (
    <Card className="glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Filter className="w-4 h-4" />
            Filter Produk
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-xs"
            >
              <X className="w-3 h-3 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Categories */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Kategori</Label>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={category}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => handleCategoryToggle(category)}
                />
                <Label 
                  htmlFor={category} 
                  className="text-sm cursor-pointer flex-1"
                >
                  {category}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Price Range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Rentang Harga</Label>
          <div className="px-2">
            <Slider
              value={priceRange}
              onValueChange={(value) => onPriceRangeChange(value as [number, number])}
              max={100000000}
              min={0}
              step={1000000}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
              }).format(priceRange[0])}
            </span>
            <span>
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
              }).format(priceRange[1])}
            </span>
          </div>
        </div>

        <Separator />

        {/* Stock Range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Rentang Stok</Label>
          <div className="px-2">
            <Slider
              value={stockRange}
              onValueChange={(value) => onStockRangeChange(value as [number, number])}
              max={1000}
              min={0}
              step={10}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{stockRange[0]} unit</span>
            <span>{stockRange[1]} unit</span>
          </div>
        </div>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label className="text-sm font-medium">Filter Aktif</Label>
              <div className="flex flex-wrap gap-1">
                {selectedCategories.map((category) => (
                  <Badge 
                    key={category}
                    variant="secondary" 
                    className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleCategoryToggle(category)}
                  >
                    {category}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
                {(priceRange[0] > 0 || priceRange[1] < 100000000) && (
                  <Badge 
                    variant="secondary" 
                    className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => onPriceRangeChange([0, 100000000])}
                  >
                    Harga: {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                      notation: 'compact'
                    }).format(priceRange[0])} - {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                      notation: 'compact'
                    }).format(priceRange[1])}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                )}
                {(stockRange[0] > 0 || stockRange[1] < 1000) && (
                  <Badge 
                    variant="secondary" 
                    className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => onStockRangeChange([0, 1000])}
                  >
                    Stok: {stockRange[0]} - {stockRange[1]}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductFilters;