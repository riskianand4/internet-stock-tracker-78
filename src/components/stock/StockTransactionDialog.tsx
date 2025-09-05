import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { useEnhancedStockManager } from '@/hooks/useEnhancedStockManager';
import { StockMovement } from '@/types/stock-movement';
import { TrendingUp, TrendingDown, ArrowUpDown } from 'lucide-react';

const stockTransactionSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  productName: z.string().min(1, 'Product name is required'),
  productCode: z.string().min(1, 'Product code is required'),
  type: z.enum(['IN', 'OUT', 'ADJUSTMENT'], {
    required_error: 'Transaction type is required',
  }),
  quantity: z.number().min(1, 'Quantity must be greater than 0'),
  previousStock: z.number().min(0, 'Previous stock cannot be negative'),
  reason: z.string().min(1, 'Reason is required'),
  reference: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  warehouse: z.string().optional(),
  cost: z.number().optional(),
  unitPrice: z.number().optional(),
  supplier: z.string().optional(),
  notes: z.string().optional(),
});

type StockTransactionFormData = z.infer<typeof stockTransactionSchema>;

interface StockTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId?: string;
  productName?: string;
  productCode?: string;
  currentStock?: number;
}

const transactionTypes = [
  { value: 'IN', label: 'Stock In', icon: TrendingUp, description: 'Add stock' },
  { value: 'OUT', label: 'Stock Out', icon: TrendingDown, description: 'Remove stock' },
  { value: 'ADJUSTMENT', label: 'Adjustment', icon: ArrowUpDown, description: 'Adjust stock' },
];

const StockTransactionDialog: React.FC<StockTransactionDialogProps> = ({
  open,
  onOpenChange,
  productId = '',
  productName = '',
  productCode = '',
  currentStock = 0,
}) => {
  const { createStockMovement, isLoading } = useEnhancedStockManager();
  
  const form = useForm<StockTransactionFormData>({
    resolver: zodResolver(stockTransactionSchema),
    defaultValues: {
      productId,
      productName,
      productCode,
      type: 'IN',
      quantity: 1,
      previousStock: currentStock,
      reason: '',
      reference: '',
      location: '',
      warehouse: '',
      cost: 0,
      unitPrice: 0,
      supplier: '',
      notes: '',
    },
  });

  const watchType = form.watch('type');
  const watchQuantity = form.watch('quantity');

  const calculateNewStock = () => {
    const quantity = watchQuantity || 0;
    const previous = currentStock;
    
    switch (watchType) {
      case 'IN':
        return previous + quantity;
      case 'OUT':
        return Math.max(0, previous - quantity);
      case 'ADJUSTMENT':
        return quantity; // For adjustment, quantity is the new total
      default:
        return previous;
    }
  };

  const onSubmit = async (data: StockTransactionFormData) => {
    try {
      const movement: Omit<StockMovement, 'id'> = {
        productId: data.productId,
        productName: data.productName,
        productCode: data.productCode,
        type: data.type,
        quantity: data.quantity,
        previousStock: data.previousStock,
        newStock: calculateNewStock(),
        reason: data.reason,
        reference: data.reference || '',
        location: data.location,
        warehouse: data.warehouse || '',
        timestamp: new Date(),
        userId: 'current-user',
        userName: 'Current User',
        cost: data.cost,
        unitPrice: data.unitPrice,
        supplier: data.supplier || '',
        notes: data.notes || '',
      };
      
      await createStockMovement(movement);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const getReasonPlaceholder = () => {
    switch (watchType) {
      case 'IN':
        return 'e.g., Purchase order, Return from customer';
      case 'OUT':
        return 'e.g., Sale, Damage, Lost';
      case 'ADJUSTMENT':
        return 'e.g., Stock count correction, System error';
      default:
        return 'Enter reason for stock movement';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Stock Transaction
          </DialogTitle>
          <DialogDescription>
            Record a stock movement for {productName || 'selected product'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Product Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="productName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="productCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Code</FormLabel>
                    <FormControl>
                      <Input {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Transaction Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction Type *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select transaction type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {transactionTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              <div>
                                <div className="font-medium">{type.label}</div>
                                <div className="text-xs text-muted-foreground">{type.description}</div>
                              </div>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Stock Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Current Stock</Label>
                <Input value={currentStock} disabled />
              </div>

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {watchType === 'ADJUSTMENT' ? 'New Stock Level' : 'Quantity'} *
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label>New Stock Level</Label>
                <Input value={calculateNewStock()} disabled />
              </div>
            </div>

            {/* Reason and Reference */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason *</FormLabel>
                    <FormControl>
                      <Input placeholder={getReasonPlaceholder()} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., PO-001, SO-123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location and Warehouse */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Main Warehouse, Store A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="warehouse"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Warehouse</FormLabel>
                    <FormControl>
                      <Input placeholder="Specific warehouse section" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Cost Information */}
            {watchType === 'IN' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="unitPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Price (IDR)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Cost (IDR)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="supplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier</FormLabel>
                      <FormControl>
                        <Input placeholder="Supplier name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional notes..."
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Recording...' : 'Record Transaction'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default StockTransactionDialog;