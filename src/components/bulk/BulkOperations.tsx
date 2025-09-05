import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CheckSquare, Square, Play, Pause, Download, Trash2, Edit, Package, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/hooks/use-toast';

interface BulkItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  status: string;
}

interface BulkOperationsProps {
  items: BulkItem[];
  selectedItems: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  onBulkOperation: (operation: string, data?: any) => Promise<void>;
  className?: string;
}

type BulkOperation = 'update_stock' | 'update_price' | 'update_category' | 'update_status' | 'delete' | 'export';

export const BulkOperations: React.FC<BulkOperationsProps> = ({
  items,
  selectedItems,
  onSelectionChange,
  onBulkOperation,
  className = ""
}) => {
  const [operation, setOperation] = useState<BulkOperation | ''>('');
  const [operationData, setOperationData] = useState<any>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  const selectedCount = selectedItems.length;
  const totalItems = items.length;

  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(items.map(item => item.id));
    }
  };

  const simulateProgress = async (steps: string[]) => {
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(steps[i]);
      setProgress(((i + 1) / steps.length) * 100);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const handleBulkOperation = async () => {
    if (!operation || selectedCount === 0) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const steps = [
        'Validating selection...',
        'Processing items...',
        'Updating database...',
        'Finalizing changes...'
      ];

      await simulateProgress(steps);
      await onBulkOperation(operation, operationData);

      toast({
        description: `Successfully processed ${selectedCount} items`
      });
      setOperation('');
      setOperationData({});
      onSelectionChange([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process bulk operation",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setCurrentStep('');
    }
  };

  const renderOperationForm = () => {
    switch (operation) {
      case 'update_stock':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Stock Adjustment</Label>
              <Select onValueChange={(value) => setOperationData({ ...operationData, adjustmentType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select adjustment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="set">Set to specific value</SelectItem>
                  <SelectItem value="increase">Increase by amount</SelectItem>
                  <SelectItem value="decrease">Decrease by amount</SelectItem>
                  <SelectItem value="percentage">Adjust by percentage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Value</Label>
              <Input
                type="number"
                placeholder="Enter value"
                value={operationData.value || ''}
                onChange={(e) => setOperationData({ ...operationData, value: e.target.value })}
              />
            </div>
          </div>
        );

      case 'update_price':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Price Adjustment</Label>
              <Select onValueChange={(value) => setOperationData({ ...operationData, priceType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select price adjustment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="set">Set to specific price</SelectItem>
                  <SelectItem value="increase">Increase by amount</SelectItem>
                  <SelectItem value="decrease">Decrease by amount</SelectItem>
                  <SelectItem value="percentage">Adjust by percentage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Value (IDR)</Label>
              <Input
                type="number"
                placeholder="Enter price value"
                value={operationData.priceValue || ''}
                onChange={(e) => setOperationData({ ...operationData, priceValue: e.target.value })}
              />
            </div>
          </div>
        );

      case 'update_category':
        return (
          <div className="space-y-2">
            <Label>New Category</Label>
            <Select onValueChange={(value) => setOperationData({ ...operationData, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="networking">Networking Equipment</SelectItem>
                <SelectItem value="computers">Computers & Laptops</SelectItem>
                <SelectItem value="mobile">Mobile Devices</SelectItem>
                <SelectItem value="accessories">Accessories</SelectItem>
                <SelectItem value="storage">Storage Devices</SelectItem>
                <SelectItem value="audio-video">Audio & Video</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case 'update_status':
        return (
          <div className="space-y-2">
            <Label>New Status</Label>
            <Select onValueChange={(value) => setOperationData({ ...operationData, status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="discontinued">Discontinued</SelectItem>
                <SelectItem value="coming_soon">Coming Soon</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case 'export':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select onValueChange={(value) => setOperationData({ ...operationData, format: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel (XLSX)</SelectItem>
                  <SelectItem value="pdf">PDF Report</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-details"
                checked={operationData.includeDetails || false}
                onCheckedChange={(checked) => 
                  setOperationData({ ...operationData, includeDetails: checked })
                }
              />
              <Label htmlFor="include-details">Include detailed information</Label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getOperationTitle = () => {
    switch (operation) {
      case 'update_stock': return 'Update Stock Levels';
      case 'update_price': return 'Update Prices';
      case 'update_category': return 'Update Categories';
      case 'update_status': return 'Update Status';
      case 'delete': return 'Delete Items';
      case 'export': return 'Export Data';
      default: return 'Select Operation';
    }
  };

  const isOperationReady = () => {
    if (!operation || selectedCount === 0) return false;
    
    switch (operation) {
      case 'update_stock':
        return operationData.adjustmentType && operationData.value;
      case 'update_price':
        return operationData.priceType && operationData.priceValue;
      case 'update_category':
        return operationData.category;
      case 'update_status':
        return operationData.status;
      case 'export':
        return operationData.format;
      case 'delete':
        return true;
      default:
        return false;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Bulk Operations
        </CardTitle>
        <CardDescription>
          Perform operations on multiple items at once to save time
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Selection Summary */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="flex items-center gap-2"
            >
              {selectedItems.length === items.length ? (
                <CheckSquare className="h-4 w-4" />
              ) : (
                <Square className="h-4 w-4" />
              )}
              {selectedItems.length === items.length ? 'Deselect All' : 'Select All'}
            </Button>
            <div className="text-sm">
              <Badge variant="secondary">
                {selectedCount} of {totalItems} selected
              </Badge>
            </div>
          </div>
          {selectedCount > 0 && (
            <div className="text-sm text-muted-foreground">
              Ready for bulk operations
            </div>
          )}
        </div>

        {/* Operation Selection */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Select Operation</Label>
            <Select value={operation} onValueChange={(value) => setOperation(value as BulkOperation)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose operation type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="update_stock">Update Stock Levels</SelectItem>
                <SelectItem value="update_price">Update Prices</SelectItem>
                <SelectItem value="update_category">Change Category</SelectItem>
                <SelectItem value="update_status">Update Status</SelectItem>
                <SelectItem value="export">Export Selected</SelectItem>
                <SelectItem value="delete">Delete Items</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <AnimatePresence>
            {operation && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{getOperationTitle()}</CardTitle>
                    <CardDescription>
                      Configure the operation for {selectedCount} selected items
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {renderOperationForm()}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress Indicator */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between text-sm">
                <span>{currentStep}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {operation === 'delete' ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  disabled={!isOperationReady() || isProcessing}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete {selectedCount} Items
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    Confirm Deletion
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {selectedCount} selected items? 
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleBulkOperation} className="bg-destructive hover:bg-destructive/90">
                    Delete Items
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <Button 
              onClick={handleBulkOperation}
              disabled={!isOperationReady() || isProcessing}
              className="flex items-center gap-2"
            >
              {isProcessing ? (
                <Pause className="h-4 w-4" />
              ) : operation === 'export' ? (
                <Download className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isProcessing ? 'Processing...' : 
               operation === 'export' ? `Export ${selectedCount} Items` : 
               `Apply to ${selectedCount} Items`}
            </Button>
          )}
          
          <Button 
            variant="outline" 
            onClick={() => {
              setOperation('');
              setOperationData({});
              onSelectionChange([]);
            }}
            disabled={isProcessing}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};