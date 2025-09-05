import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, BarChart3 } from 'lucide-react';
import ManualStockCount from './ManualStockCount';
import ImportStockCount from './ImportStockCount';
import StockOpnameResult from './StockOpnameResult';
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

const StockOpnameManager = () => {
  const [activeTab, setActiveTab] = useState('manual');
  const [opnameItems, setOpnameItems] = useState<OpnameItem[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { toast } = useToast();

  const startNewSession = () => {
    const newSessionId = `opname-${Date.now()}`;
    setSessionId(newSessionId);
    
    // Initialize with products from localStorage or mock data
    const savedProducts = localStorage.getItem('products');
    const products = savedProducts ? JSON.parse(savedProducts) : [];
    
    const items: OpnameItem[] = products.map((product: any) => ({
      id: `${newSessionId}-${product.id}`,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      systemStock: product.stock,
      physicalStock: null,
      variance: 0,
      location: product.location || 'Main Warehouse',
      counted: false,
    }));
    
    setOpnameItems(items);
    toast({
      title: 'Stock Opname Session Started',
      description: `Session ${newSessionId} created with ${items.length} items`,
    });
  };

  const downloadTemplate = () => {
    const templateData = opnameItems.map(item => ({
      'Product ID': item.productId,
      'SKU': item.sku,
      'Product Name': item.productName,
      'System Stock': item.systemStock,
      'Physical Count': '',
      'Location': item.location,
      'Notes': ''
    }));

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Stock Count Template');
    
    // Add some styling
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + '1';
      if (!ws[address]) continue;
      ws[address].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: 'E2E8F0' } }
      };
    }
    
    XLSX.writeFile(wb, `stock-opname-template-${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: 'Template Downloaded',
      description: 'Excel template has been downloaded successfully',
    });
  };

  const updateOpnameItem = (itemId: string, physicalStock: number) => {
    setOpnameItems(prev => prev.map(item => 
      item.id === itemId 
        ? { 
            ...item, 
            physicalStock,
            variance: physicalStock - item.systemStock,
            counted: true
          }
        : item
    ));
  };

  const importOpnameData = (importedItems: OpnameItem[]) => {
    setOpnameItems(importedItems);
    toast({
      title: 'Data Imported',
      description: `${importedItems.length} items imported successfully`,
    });
    setActiveTab('result');
  };

  const getSessionStats = () => {
    const total = opnameItems.length;
    const counted = opnameItems.filter(item => item.counted).length;
    const withVariance = opnameItems.filter(item => item.variance !== 0).length;
    
    return { total, counted, withVariance };
  };

  const stats = getSessionStats();

  return (
    <div className="space-y-6">
      {/* Session Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Stock Opname Session
          </CardTitle>
          <CardDescription>
            {sessionId ? `Active Session: ${sessionId}` : 'No active session'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            {!sessionId ? (
              <Button onClick={startNewSession}>
                Start New Opname Session
              </Button>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-4 flex-1">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <div className="text-sm text-muted-foreground">Total Items</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.counted}</div>
                    <div className="text-sm text-muted-foreground">Counted</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{stats.withVariance}</div>
                    <div className="text-sm text-muted-foreground">With Variance</div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={downloadTemplate}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Template
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      {sessionId && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="manual">Manual Input</TabsTrigger>
            <TabsTrigger value="import">Import Excel/CSV</TabsTrigger>
            <TabsTrigger value="result">Results & Adjustments</TabsTrigger>
          </TabsList>

          <TabsContent value="manual">
            <ManualStockCount 
              items={opnameItems}
              onUpdateItem={updateOpnameItem}
            />
          </TabsContent>

          <TabsContent value="import">
            <ImportStockCount 
              onImportComplete={importOpnameData}
              existingItems={opnameItems}
            />
          </TabsContent>

          <TabsContent value="result">
            <StockOpnameResult 
              items={opnameItems}
              sessionId={sessionId}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default StockOpnameManager;