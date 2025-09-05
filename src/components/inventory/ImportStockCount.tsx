import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';

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

interface ImportError {
  row: number;
  field: string;
  message: string;
}

interface ImportStockCountProps {
  onImportComplete: (items: OpnameItem[]) => void;
  existingItems: OpnameItem[];
}

const ImportStockCount = ({ onImportComplete, existingItems }: ImportStockCountProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [importData, setImportData] = useState<any[]>([]);
  const [errors, setErrors] = useState<ImportError[]>([]);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const validateImportData = (data: any[]): ImportError[] => {
    const errors: ImportError[] = [];
    
    data.forEach((row, index) => {
      const rowNum = index + 2; // +2 because Excel is 1-indexed and has header
      
      if (!row['Product ID'] && !row['SKU']) {
        errors.push({
          row: rowNum,
          field: 'Product ID/SKU',
          message: 'Either Product ID or SKU is required'
        });
      }
      
      if (row['Physical Count'] === undefined || row['Physical Count'] === '') {
        errors.push({
          row: rowNum,
          field: 'Physical Count',
          message: 'Physical count is required'
        });
      } else if (isNaN(Number(row['Physical Count'])) || Number(row['Physical Count']) < 0) {
        errors.push({
          row: rowNum,
          field: 'Physical Count',
          message: 'Physical count must be a non-negative number'
        });
      }
    });
    
    return errors;
  };

  const processImportData = (data: any[]): OpnameItem[] => {
    const processedItems: OpnameItem[] = [];
    
    data.forEach((row, index) => {
      const productId = row['Product ID'];
      const sku = row['SKU'];
      
      // Find existing item by Product ID or SKU
      const existingItem = existingItems.find(item => 
        item.productId === productId || item.sku === sku
      );
      
      if (existingItem) {
        const physicalStock = Number(row['Physical Count']);
        processedItems.push({
          ...existingItem,
          physicalStock,
          variance: physicalStock - existingItem.systemStock,
          counted: true
        });
      }
    });
    
    // Include uncounted items from existing items
    existingItems.forEach(item => {
      if (!processedItems.find(p => p.id === item.id)) {
        processedItems.push(item);
      }
    });
    
    return processedItems;
  };

  const handleFileUpload = useCallback(async (file: File) => {
    setProcessing(true);
    setErrors([]);
    
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(worksheet);
      
      const validationErrors = validateImportData(data);
      
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        setImportData(data);
        return;
      }
      
      const processedItems = processImportData(data);
      setImportData(data);
      
      toast({
        title: 'File Processed',
        description: `${data.length} rows processed successfully`,
      });
      
    } catch (error) {
      toast({
        title: 'Import Error',
        description: 'Failed to process the file. Please check the format.',
        variant: 'destructive'
      });
    } finally {
      setProcessing(false);
    }
  }, [existingItems, toast]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, [handleFileUpload]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const confirmImport = () => {
    if (errors.length > 0) {
      toast({
        title: 'Cannot Import',
        description: 'Please fix all errors before importing',
        variant: 'destructive'
      });
      return;
    }
    
    const processedItems = processImportData(importData);
    onImportComplete(processedItems);
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Stock Count Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Drop your Excel/CSV file here</h3>
            <p className="text-muted-foreground mb-4">
              Or click to browse and select a file
            </p>
            <Input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileInput}
              className="max-w-xs mx-auto"
              disabled={processing}
            />
            <p className="text-sm text-muted-foreground mt-2">
              Supported formats: Excel (.xlsx, .xls) and CSV (.csv)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Validation Errors */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-2">Found {errors.length} validation errors:</div>
            <ul className="list-disc list-inside space-y-1">
              {errors.slice(0, 5).map((error, index) => (
                <li key={index} className="text-sm">
                  Row {error.row}, {error.field}: {error.message}
                </li>
              ))}
              {errors.length > 5 && (
                <li className="text-sm">...and {errors.length - 5} more errors</li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Import Preview */}
      {importData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Import Preview</span>
              <div className="flex items-center gap-2">
                {errors.length === 0 ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Ready to Import
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.length} Errors
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border max-h-96 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Row</TableHead>
                    <TableHead>Product ID</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Physical Count</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importData.slice(0, 10).map((row, index) => {
                    const rowErrors = errors.filter(e => e.row === index + 2);
                    const hasErrors = rowErrors.length > 0;
                    
                    return (
                      <TableRow key={index} className={hasErrors ? 'bg-red-50' : ''}>
                        <TableCell>{index + 2}</TableCell>
                        <TableCell>{row['Product ID'] || '-'}</TableCell>
                        <TableCell>{row['SKU'] || '-'}</TableCell>
                        <TableCell>{row['Product Name'] || '-'}</TableCell>
                        <TableCell>{row['Physical Count']}</TableCell>
                        <TableCell>
                          {hasErrors ? (
                            <Badge variant="destructive">Error</Badge>
                          ) : (
                            <Badge variant="default" className="bg-green-100 text-green-800">Valid</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {importData.length > 10 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        ...and {importData.length - 10} more rows
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            <div className="flex justify-end mt-4">
              <Button 
                onClick={confirmImport}
                disabled={errors.length > 0 || importData.length === 0}
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Import {importData.length} Items
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImportStockCount;