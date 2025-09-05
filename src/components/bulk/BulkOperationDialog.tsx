import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Package, 
  DollarSign, 
  Tag, 
  Archive, 
  Download, 
  Upload,
  CheckCircle,
  AlertTriangle 
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useProductManager } from '@/hooks/useProductManager';
import { useToast } from '@/hooks/use-toast';

const bulkOperationSchema = z.discriminatedUnion('operation', [
  z.object({
    operation: z.literal('stock_adjustment'),
    adjustmentType: z.enum(['add', 'subtract', 'set']),
    value: z.number().min(0, 'Value must be positive'),
  }),
  z.object({
    operation: z.literal('price_update'),
    priceType: z.enum(['increase', 'decrease', 'set']),
    value: z.number().min(0, 'Value must be positive'),
    isPercentage: z.boolean().default(false),
  }),
  z.object({
    operation: z.literal('category_change'),
    newCategory: z.string().min(1, 'Category is required'),
  }),
  z.object({
    operation: z.literal('status_change'),
    newStatus: z.enum(['in_stock', 'low_stock', 'out_of_stock']),
  }),
  z.object({
    operation: z.literal('export'),
    format: z.enum(['csv', 'xlsx']),
  }),
]);

type BulkOperationFormData = z.infer<typeof bulkOperationSchema>;

interface BulkOperationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProductIds: string[];
  selectedProducts: any[];
}

const categories = [
  'Network Equipment',
  'Cables & Connectors',
  'Access Points',
  'Servers & Storage',
  'Security Equipment',
  'Power & UPS',
  'Tools & Accessories'
];

const BulkOperationDialog = ({ 
  open, 
  onOpenChange, 
  selectedProductIds,
  selectedProducts
}: BulkOperationDialogProps) => {
  const { updateProduct, isLoading } = useProductManager();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{ success: number; failed: number } | null>(null);

  const form = useForm<BulkOperationFormData>({
    resolver: zodResolver(bulkOperationSchema),
    defaultValues: {
      operation: 'stock_adjustment' as const,
    },
  });

  const operationType = form.watch('operation');

  const onSubmit = async (data: BulkOperationFormData) => {
    if (selectedProductIds.length === 0) {
      toast({
        title: 'No products selected',
        description: 'Please select at least one product to perform bulk operations.',
        variant: 'destructive',
      });
      return;
    }

    setProcessing(true);
    setProgress(0);
    setResults(null);

    let successCount = 0;
    let failedCount = 0;

    try {
      // Handle export operations
      if (data.operation === 'export') {
        const exportData = selectedProducts.map(product => ({
          'Name': product.name,
          'SKU': product.sku,
          'Category': product.category,
          'Price': product.price,
          'Stock': product.stock,
          'Min Stock': product.minStock,
          'Status': product.status,
          'Location': product.location || '',
          'Supplier': product.supplier || '',
          'Description': product.description || '',
        }));

        const headers = Object.keys(exportData[0] || {}).join(',');
        const rows = exportData.map(row => Object.values(row).join(','));
        const csvContent = [headers, ...rows].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `bulk-export-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();

        setProgress(100);
        toast({
          title: 'Export Complete',
          description: `Exported ${selectedProducts.length} products successfully`,
        });
        onOpenChange(false);
        return;
      }

      // Process each selected product
      for (let i = 0; i < selectedProductIds.length; i++) {
        const productId = selectedProductIds[i];
        const product = selectedProducts.find(p => p.id === productId);
        
        if (!product) {
          failedCount++;
          continue;
        }

        try {
          let updates: any = {};

          switch (data.operation) {
            case 'stock_adjustment':
              if (data.operation === 'stock_adjustment') {
                switch (data.adjustmentType) {
                  case 'add':
                    updates.stock = product.stock + data.value;
                    break;
                  case 'subtract':
                    updates.stock = Math.max(0, product.stock - data.value);
                    break;
                  case 'set':
                    updates.stock = data.value;
                    break;
                }
                // Update status based on new stock level
                updates.status = updates.stock <= product.minStock 
                  ? 'low_stock' 
                  : updates.stock === 0 
                  ? 'out_of_stock' 
                  : 'in_stock';
              }
              break;

            case 'price_update':
              if (data.operation === 'price_update') {
                switch (data.priceType) {
                  case 'increase':
                    updates.price = data.isPercentage
                      ? product.price * (1 + data.value / 100)
                      : product.price + data.value;
                    break;
                  case 'decrease':
                    updates.price = data.isPercentage
                      ? product.price * (1 - data.value / 100)
                      : Math.max(0, product.price - data.value);
                    break;
                  case 'set':
                    updates.price = data.value;
                    break;
                }
              }
              break;

            case 'category_change':
              if (data.operation === 'category_change') {
                updates.category = data.newCategory;
              }
              break;

            case 'status_change':
              if (data.operation === 'status_change') {
                updates.status = data.newStatus;
              }
              break;
          }

          await updateProduct(productId, updates);
          successCount++;
        } catch (error) {
          console.error(`Failed to update product ${product.name}:`, error);
          failedCount++;
        }

        setProgress((i + 1) / selectedProductIds.length * 100);
      }

      setResults({ success: successCount, failed: failedCount });

      if (successCount > 0) {
        toast({
          title: 'Bulk Operation Complete',
          description: `Successfully updated ${successCount} products${failedCount > 0 ? `, ${failedCount} failed` : ''}`,
        });
      }

      if (failedCount === selectedProductIds.length) {
        toast({
          title: 'Operation Failed',
          description: 'All bulk operations failed. Please check your data and try again.',
          variant: 'destructive',
        });
      }

    } catch (error) {
      toast({
        title: 'Bulk Operation Failed',
        description: 'An unexpected error occurred during bulk operation.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const resetDialog = () => {
    form.reset();
    setProgress(0);
    setResults(null);
    setProcessing(false);
  };

  const handleClose = (open: boolean) => {
    if (!processing) {
      onOpenChange(open);
      if (!open) {
        resetDialog();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Bulk Operations
          </DialogTitle>
          <DialogDescription>
            Perform operations on {selectedProductIds.length} selected product{selectedProductIds.length !== 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        {processing && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Processing...</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
            
            {results && (
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">{results.success} successful</span>
                </div>
                {results.failed > 0 && (
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">{results.failed} failed</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {!processing && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="operation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Operation Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select operation type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-popover border border-border shadow-lg z-50">
                        <SelectItem value="stock_adjustment">Stock Adjustment</SelectItem>
                        <SelectItem value="price_update">Price Update</SelectItem>
                        <SelectItem value="category_change">Category Change</SelectItem>
                        <SelectItem value="status_change">Status Change</SelectItem>
                        <SelectItem value="export">Export Data</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Stock Adjustment Fields */}
              {operationType === 'stock_adjustment' && (
                <>
                  <FormField
                    control={form.control}
                    name="adjustmentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adjustment Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select adjustment type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-popover border border-border shadow-lg z-50">
                            <SelectItem value="add">Add to Current Stock</SelectItem>
                            <SelectItem value="subtract">Subtract from Current Stock</SelectItem>
                            <SelectItem value="set">Set Exact Stock Level</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock Value</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter stock value"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {/* Price Update Fields */}
              {operationType === 'price_update' && (
                <>
                  <FormField
                    control={form.control}
                    name="priceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price Update Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select price adjustment" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-popover border border-border shadow-lg z-50">
                            <SelectItem value="increase">Increase Price</SelectItem>
                            <SelectItem value="decrease">Decrease Price</SelectItem>
                            <SelectItem value="set">Set Exact Price</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price Value</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter price value"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {/* Category Change Fields */}
              {operationType === 'category_change' && (
                <FormField
                  control={form.control}
                  name="newCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-popover border border-border shadow-lg z-50">
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Status Change Fields */}
              {operationType === 'status_change' && (
                <FormField
                  control={form.control}
                  name="newStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-popover border border-border shadow-lg z-50">
                          <SelectItem value="in_stock">In Stock</SelectItem>
                          <SelectItem value="low_stock">Low Stock</SelectItem>
                          <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Export Fields */}
              {operationType === 'export' && (
                <FormField
                  control={form.control}
                  name="format"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Export Format</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select format" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-popover border border-border shadow-lg z-50">
                          <SelectItem value="csv">CSV File</SelectItem>
                          <SelectItem value="xlsx">Excel File (XLSX)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={processing}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={processing || isLoading}>
                  {processing ? 'Processing...' : 'Execute Operation'}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BulkOperationDialog;