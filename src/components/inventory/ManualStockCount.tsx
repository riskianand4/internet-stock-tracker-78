import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Check, AlertTriangle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface OpnameItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  systemStock: number;
  physicalStock: number | null;
  variance: number;
  location: string;
  counted: boolean;
}

interface ManualStockCountProps {
  items: OpnameItem[];
  onUpdateItem: (itemId: string, physicalStock: number) => void;
}

const ManualStockCount = ({ items, onUpdateItem }: ManualStockCountProps) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'uncounted' | 'variance'>('all');

  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.productName.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase());

    const matchesFilter = 
      filter === 'all' || 
      (filter === 'uncounted' && !item.counted) ||
      (filter === 'variance' && item.counted && item.variance !== 0);

    return matchesSearch && matchesFilter;
  });

  const handlePhysicalStockChange = (itemId: string, value: string) => {
    const physicalStock = parseInt(value) || 0;
    onUpdateItem(itemId, physicalStock);
  };

  const getVarianceColor = (variance: number) => {
    if (variance === 0) return 'text-green-600';
    if (Math.abs(variance) <= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (item: OpnameItem) => {
    if (!item.counted) return <Badge variant="secondary">Uncounted</Badge>;
    if (item.variance === 0) return <Badge variant="default" className="bg-green-100 text-green-800">Match</Badge>;
    return <Badge variant="destructive">Variance</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manual Stock Count</CardTitle>
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by product name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All ({items.length})
            </Button>
            <Button
              variant={filter === 'uncounted' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('uncounted')}
            >
              Uncounted ({items.filter(i => !i.counted).length})
            </Button>
            <Button
              variant={filter === 'variance' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('variance')}
            >
              Variance ({items.filter(i => i.counted && i.variance !== 0).length})
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">System Stock</TableHead>
                <TableHead className="text-right">Physical Count</TableHead>
                <TableHead className="text-right">Variance</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No items found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium">{item.productName}</div>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-2 py-1 rounded">{item.sku}</code>
                    </TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell className="text-right font-mono">{item.systemStock}</TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        min="0"
                        placeholder="Count..."
                        value={item.physicalStock ?? ''}
                        onChange={(e) => handlePhysicalStockChange(item.id, e.target.value)}
                        className="w-24 text-right"
                      />
                    </TableCell>
                    <TableCell className={`text-right font-mono ${getVarianceColor(item.variance)}`}>
                      {item.counted ? (
                        <div className="flex items-center justify-end gap-1">
                          {item.variance !== 0 && (
                            <AlertTriangle className="h-4 w-4" />
                          )}
                          {item.variance > 0 ? '+' : ''}{item.variance}
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(item)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ManualStockCount;