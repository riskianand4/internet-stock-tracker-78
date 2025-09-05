import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useStockMovement } from '@/hooks/useStockMovement';
import { Plus, Minus, RotateCcw, Package } from 'lucide-react';

interface StockTransactionFormProps {
  onTransactionComplete?: () => void;
}

const StockTransactionForm = ({ onTransactionComplete }: StockTransactionFormProps) => {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [transactionType, setTransactionType] = useState<'IN' | 'OUT' | 'ADJUSTMENT'>('IN');
  const [quantity, setQuantity] = useState<number>(0);
  const [reason, setReason] = useState('');
  const [reference, setReference] = useState('');
  const [location, setLocation] = useState('');
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [supplier, setSupplier] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addMovement } = useStockMovement();
  const { toast } = useToast();

  // Mock products - in real app, this would come from API/context
  const products = [
    { id: '1', name: 'Router WiFi AC1200', code: 'RWF-001', currentStock: 25 },
    { id: '2', name: 'Switch 24 Port', code: 'SW24-001', currentStock: 15 },
    { id: '3', name: 'Cable UTP Cat6', code: 'UTP-C6', currentStock: 100 },
    { id: '4', name: 'Access Point', code: 'AP-001', currentStock: 8 },
  ];

  const selectedProductData = products.find(p => p.id === selectedProduct);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct || !quantity || !reason || !location) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const productData = products.find(p => p.id === selectedProduct);
      if (!productData) return;

      // Calculate new stock based on transaction type
      let newStock = productData.currentStock;
      if (transactionType === 'IN') {
        newStock += quantity;
      } else if (transactionType === 'OUT') {
        newStock -= quantity;
      } else {
        // For ADJUSTMENT, quantity can be positive or negative
        newStock = quantity;
      }

      await addMovement({
        productId: selectedProduct,
        productName: productData.name,
        productCode: productData.code,
        type: transactionType,
        quantity: transactionType === 'OUT' ? -quantity : quantity,
        previousStock: productData.currentStock,
        newStock,
        reason,
        reference,
        location,
        warehouse: location,
        userId: 'current-user-id', // Should come from auth context
        userName: 'Current User', // Should come from auth context
        unitPrice: unitPrice > 0 ? unitPrice : undefined,
        supplier: supplier || undefined,
        notes: notes || undefined,
      });

      // Reset form
      setSelectedProduct('');
      setQuantity(0);
      setReason('');
      setReference('');
      setUnitPrice(0);
      setSupplier('');
      setNotes('');
      
      onTransactionComplete?.();

    } catch (error) {
      console.error('Failed to record transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'IN': return <Plus className="w-4 h-4" />;
      case 'OUT': return <Minus className="w-4 h-4" />;
      case 'ADJUSTMENT': return <RotateCcw className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'IN': return 'bg-success/10 text-success border-success/20';
      case 'OUT': return 'bg-warning/10 text-warning border-warning/20';
      case 'ADJUSTMENT': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-muted';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Input Transaksi Stok
        </CardTitle>
        <CardDescription>
          Catat pergerakan stok masuk, keluar, atau adjustment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Transaction Type Selection */}
          <div className="grid grid-cols-3 gap-2">
            {(['IN', 'OUT', 'ADJUSTMENT'] as const).map((type) => (
              <Button
                key={type}
                type="button"
                variant={transactionType === type ? "default" : "outline"}
                onClick={() => setTransactionType(type)}
                className={transactionType === type ? getTransactionColor(type) : ''}
              >
                {getTransactionIcon(type)}
                <span className="ml-2">
                  {type === 'IN' ? 'Masuk' : type === 'OUT' ? 'Keluar' : 'Adjustment'}
                </span>
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product">Produk *</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih produk" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{product.name}</span>
                          <Badge variant="secondary" className="ml-2">
                            Stock: {product.currentStock}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">
                  {transactionType === 'ADJUSTMENT' ? 'Stok Baru' : 'Jumlah'} *
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  placeholder={transactionType === 'ADJUSTMENT' ? 'Stok setelah adjustment' : '0'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Alasan *</Label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih alasan" />
                  </SelectTrigger>
                  <SelectContent>
                    {transactionType === 'IN' && (
                      <>
                        <SelectItem value="purchase">Pembelian</SelectItem>
                        <SelectItem value="return">Retur dari Customer</SelectItem>
                        <SelectItem value="transfer_in">Transfer Masuk</SelectItem>
                        <SelectItem value="adjustment_in">Adjustment Masuk</SelectItem>
                      </>
                    )}
                    {transactionType === 'OUT' && (
                      <>
                        <SelectItem value="sale">Penjualan</SelectItem>
                        <SelectItem value="return_supplier">Retur ke Supplier</SelectItem>
                        <SelectItem value="transfer_out">Transfer Keluar</SelectItem>
                        <SelectItem value="damage">Kerusakan</SelectItem>
                        <SelectItem value="lost">Kehilangan</SelectItem>
                      </>
                    )}
                    {transactionType === 'ADJUSTMENT' && (
                      <>
                        <SelectItem value="stock_opname">Stock Opname</SelectItem>
                        <SelectItem value="correction">Koreksi</SelectItem>
                        <SelectItem value="initial_stock">Stok Awal</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Lokasi/Gudang *</Label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih lokasi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main_warehouse">Gudang Utama</SelectItem>
                    <SelectItem value="store_front">Toko Depan</SelectItem>
                    <SelectItem value="warehouse_b">Gudang B</SelectItem>
                    <SelectItem value="repair_center">Service Center</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reference">Referensi</Label>
                <Input
                  id="reference"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="No. PO, Invoice, Transfer, dll"
                />
              </div>

              {transactionType === 'IN' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="unitPrice">Harga Satuan</Label>
                    <Input
                      id="unitPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(Number(e.target.value))}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supplier">Supplier</Label>
                    <Input
                      id="supplier"
                      value={supplier}
                      onChange={(e) => setSupplier(e.target.value)}
                      placeholder="Nama supplier"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Catatan</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Catatan tambahan..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Current Stock Info */}
          {selectedProductData && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Stok Saat Ini</div>
                  <div className="font-semibold">{selectedProductData.currentStock}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">
                    {transactionType === 'ADJUSTMENT' ? 'Perubahan' : 'Jumlah Transaksi'}
                  </div>
                  <div className="font-semibold">
                    {transactionType === 'OUT' ? '-' : ''}
                    {transactionType === 'ADJUSTMENT' 
                      ? (quantity - selectedProductData.currentStock)
                      : quantity
                    }
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Stok Setelah</div>
                  <div className="font-semibold">
                    {transactionType === 'IN' 
                      ? selectedProductData.currentStock + quantity
                      : transactionType === 'OUT'
                      ? selectedProductData.currentStock - quantity
                      : quantity
                    }
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Total Nilai</div>
                  <div className="font-semibold">
                    {unitPrice > 0 ? `Rp ${(quantity * unitPrice).toLocaleString('id-ID')}` : '-'}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setSelectedProduct('');
                setQuantity(0);
                setReason('');
                setReference('');
                setUnitPrice(0);
                setSupplier('');
                setNotes('');
              }}
            >
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default StockTransactionForm;