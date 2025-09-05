import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, TrendingUp, TrendingDown, Download, RefreshCw } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

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

interface StockOpnameResultProps {
  items: OpnameItem[];
  sessionId: string;
}

const StockOpnameResult = ({ items, sessionId }: StockOpnameResultProps) => {
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const getCountedItems = () => items.filter(item => item.counted);
  const getVarianceItems = () => items.filter(item => item.counted && item.variance !== 0);
  const getPositiveVariance = () => items.filter(item => item.counted && item.variance > 0);
  const getNegativeVariance = () => items.filter(item => item.counted && item.variance < 0);

  const getTotalVarianceValue = () => {
    return getVarianceItems().reduce((total, item) => {
      const avgPrice = 100000; // Mock average price - in real app, get from product data
      return total + (item.variance * avgPrice);
    }, 0);
  };

  const applyAdjustments = async () => {
    setProcessing(true);
    
    try {
      // Get current products
      const savedProducts = localStorage.getItem('products');
      const products = savedProducts ? JSON.parse(savedProducts) : [];
      
      // Apply adjustments
      const adjustedProducts = products.map((product: any) => {
        const opnameItem = items.find(item => item.productId === product.id && item.counted);
        if (opnameItem && opnameItem.physicalStock !== null) {
          return {
            ...product,
            stock: opnameItem.physicalStock,
            lastUpdated: new Date(),
            status: opnameItem.physicalStock <= product.minStock 
              ? 'low_stock' 
              : opnameItem.physicalStock === 0 
              ? 'out_of_stock' 
              : 'in_stock'
          };
        }
        return product;
      });
      
      // Save adjusted products
      localStorage.setItem('products', JSON.stringify(adjustedProducts));
      
      // Create stock movements for adjustments
      const existingMovements = localStorage.getItem('stockMovements');
      const movements = existingMovements ? JSON.parse(existingMovements) : [];
      
      const adjustmentMovements = getVarianceItems().map(item => ({
        id: `adj-${Date.now()}-${item.productId}`,
        productId: item.productId,
        productName: item.productName,
        productCode: item.sku,
        type: 'ADJUSTMENT',
        quantity: Math.abs(item.variance),
        previousStock: item.systemStock,
        newStock: item.physicalStock,
        reason: `Stock Opname Adjustment - Session ${sessionId}`,
        reference: sessionId,
        location: item.location,
        userId: 'current-user',
        userName: 'Current User',
        timestamp: new Date(),
        notes: `Physical count: ${item.physicalStock}, System stock: ${item.systemStock}, Variance: ${item.variance}`
      }));
      
      movements.unshift(...adjustmentMovements);
      localStorage.setItem('stockMovements', JSON.stringify(movements));
      
      toast({
        title: 'Adjustments Applied',
        description: `${adjustmentMovements.length} stock adjustments have been applied successfully`,
      });
      
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to apply stock adjustments. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setProcessing(false);
    }
  };

  const exportResults = () => {
    const exportData = getCountedItems().map(item => ({
      'Product ID': item.productId,
      'SKU': item.sku,
      'Product Name': item.productName,
      'Location': item.location,
      'System Stock': item.systemStock,
      'Physical Count': item.physicalStock,
      'Variance': item.variance,
      'Variance Type': item.variance > 0 ? 'Surplus' : item.variance < 0 ? 'Shortage' : 'Match',
      'Session ID': sessionId,
      'Count Date': new Date().toISOString().split('T')[0]
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Stock Opname Results');
    
    XLSX.writeFile(wb, `stock-opname-results-${sessionId}.xlsx`);
    
    toast({
      title: 'Results Exported',
      description: 'Stock opname results have been exported to Excel',
    });
  };

  const countedItems = getCountedItems();
  const varianceItems = getVarianceItems();
  const positiveVariance = getPositiveVariance();
  const negativeVariance = getNegativeVariance();

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Items Counted</p>
                <p className="text-2xl font-bold">{countedItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Surplus Items</p>
                <p className="text-2xl font-bold text-green-600">{positiveVariance.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Shortage Items</p>
                <p className="text-2xl font-bold text-red-600">{negativeVariance.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <RefreshCw className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Variance</p>
                <p className="text-2xl font-bold">{varianceItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={exportResults} variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Results
        </Button>
        
        {varianceItems.length > 0 && (
          <Button 
            onClick={applyAdjustments} 
            disabled={processing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${processing ? 'animate-spin' : ''}`} />
            Apply All Adjustments ({varianceItems.length})
          </Button>
        )}
      </div>

      {/* Warning for variances */}
      {varianceItems.length > 0 && (
        <Alert>
          <AlertDescription>
            <strong>⚠️ Stock Variances Detected:</strong> {varianceItems.length} items have differences between system and physical count. 
            Review the details below and click "Apply All Adjustments" to update your inventory.
          </AlertDescription>
        </Alert>
      )}

      {/* Results Tables */}
      <Tabs defaultValue="variance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="variance">Variance Items ({varianceItems.length})</TabsTrigger>
          <TabsTrigger value="all">All Counted ({countedItems.length})</TabsTrigger>
          <TabsTrigger value="surplus">Surplus ({positiveVariance.length})</TabsTrigger>
          <TabsTrigger value="shortage">Shortage ({negativeVariance.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="variance">
          <Card>
            <CardHeader>
              <CardTitle>Items with Variance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-right">System</TableHead>
                      <TableHead className="text-right">Physical</TableHead>
                      <TableHead className="text-right">Variance</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {varianceItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No variance items found
                        </TableCell>
                      </TableRow>
                    ) : (
                      varianceItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="font-medium">{item.productName}</div>
                          </TableCell>
                          <TableCell>
                            <code className="text-sm bg-muted px-2 py-1 rounded">{item.sku}</code>
                          </TableCell>
                          <TableCell>{item.location}</TableCell>
                          <TableCell className="text-right font-mono">{item.systemStock}</TableCell>
                          <TableCell className="text-right font-mono">{item.physicalStock}</TableCell>
                          <TableCell className={`text-right font-mono ${
                            item.variance > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {item.variance > 0 ? '+' : ''}{item.variance}
                          </TableCell>
                          <TableCell>
                            <Badge variant={item.variance > 0 ? 'default' : 'destructive'}>
                              {item.variance > 0 ? 'Surplus' : 'Shortage'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Counted Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-right">System</TableHead>
                      <TableHead className="text-right">Physical</TableHead>
                      <TableHead className="text-right">Variance</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {countedItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="font-medium">{item.productName}</div>
                        </TableCell>
                        <TableCell>
                          <code className="text-sm bg-muted px-2 py-1 rounded">{item.sku}</code>
                        </TableCell>
                        <TableCell>{item.location}</TableCell>
                        <TableCell className="text-right font-mono">{item.systemStock}</TableCell>
                        <TableCell className="text-right font-mono">{item.physicalStock}</TableCell>
                        <TableCell className={`text-right font-mono ${
                          item.variance === 0 ? 'text-green-600' : 
                          item.variance > 0 ? 'text-blue-600' : 'text-red-600'
                        }`}>
                          {item.variance > 0 ? '+' : ''}{item.variance}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            item.variance === 0 ? 'default' : 
                            item.variance > 0 ? 'secondary' : 'destructive'
                          }>
                            {item.variance === 0 ? 'Match' : 
                             item.variance > 0 ? 'Surplus' : 'Shortage'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="surplus">
          <Card>
            <CardHeader>
              <CardTitle>Surplus Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-right">System</TableHead>
                      <TableHead className="text-right">Physical</TableHead>
                      <TableHead className="text-right">Surplus</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {positiveVariance.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No surplus items found
                        </TableCell>
                      </TableRow>
                    ) : (
                      positiveVariance.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="font-medium">{item.productName}</div>
                          </TableCell>
                          <TableCell>
                            <code className="text-sm bg-muted px-2 py-1 rounded">{item.sku}</code>
                          </TableCell>
                          <TableCell>{item.location}</TableCell>
                          <TableCell className="text-right font-mono">{item.systemStock}</TableCell>
                          <TableCell className="text-right font-mono">{item.physicalStock}</TableCell>
                          <TableCell className="text-right font-mono text-green-600">
                            +{item.variance}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shortage">
          <Card>
            <CardHeader>
              <CardTitle>Shortage Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-right">System</TableHead>
                      <TableHead className="text-right">Physical</TableHead>
                      <TableHead className="text-right">Shortage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {negativeVariance.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No shortage items found
                        </TableCell>
                      </TableRow>
                    ) : (
                      negativeVariance.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="font-medium">{item.productName}</div>
                          </TableCell>
                          <TableCell>
                            <code className="text-sm bg-muted px-2 py-1 rounded">{item.sku}</code>
                          </TableCell>
                          <TableCell>{item.location}</TableCell>
                          <TableCell className="text-right font-mono">{item.systemStock}</TableCell>
                          <TableCell className="text-right font-mono">{item.physicalStock}</TableCell>
                          <TableCell className="text-right font-mono text-red-600">
                            {item.variance}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StockOpnameResult;