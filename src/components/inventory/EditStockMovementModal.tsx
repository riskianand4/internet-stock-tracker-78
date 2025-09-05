import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { StockMovement } from '@/types/stock-movement';
import { Plus, Minus, RotateCcw, Package } from 'lucide-react';

interface EditStockMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  movement: StockMovement | null;
  onUpdate?: (updatedMovement: StockMovement) => void;
}

const EditStockMovementModal = ({ isOpen, onClose, movement, onUpdate }: EditStockMovementModalProps) => {
  const [quantity, setQuantity] = useState<number>(0);
  const [reason, setReason] = useState('');
  const [reference, setReference] = useState('');
  const [location, setLocation] = useState('');
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [supplier, setSupplier] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    if (movement) {
      setQuantity(Math.abs(movement.quantity));
      setReason(movement.reason);
      setReference(movement.reference || '');
      setLocation(movement.location);
      setUnitPrice(movement.unitPrice || 0);
      setSupplier(movement.supplier || '');
      setNotes(movement.notes || '');
    }
  }, [movement]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!movement || !quantity || !reason || !location) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate new stock based on transaction type and new quantity
      const quantityDiff = movement.type === 'OUT' ? -quantity : quantity;
      const originalQuantityDiff = movement.quantity;
      const stockAdjustment = quantityDiff - originalQuantityDiff;
      const newStock = movement.newStock + stockAdjustment;

      const updatedMovement: StockMovement = {
        ...movement,
        quantity: movement.type === 'OUT' ? -quantity : quantity,
        newStock,
        reason,
        reference,
        location,
        warehouse: location,
        unitPrice: unitPrice > 0 ? unitPrice : undefined,
        supplier: supplier || undefined,
        notes: notes || undefined,
      };

      onUpdate?.(updatedMovement);
      onClose();

      toast({
        title: "Success",
        description: "Stock movement updated successfully",
      });

    } catch (error) {
      console.error('Failed to update movement:', error);
      toast({
        title: "Error",
        description: "Failed to update stock movement",
        variant: "destructive",
      });
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

  if (!movement) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getTransactionIcon(movement.type)}
            Edit Stock Movement
          </DialogTitle>
          <DialogDescription>
            Edit transaksi pergerakan stok yang sudah tercatat
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Movement Info */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Produk</div>
                <div className="font-semibold">{movement.productName}</div>
                <div className="text-xs text-muted-foreground">{movement.productCode}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Tipe Transaksi</div>
                <Badge className={getTransactionColor(movement.type)}>
                  {movement.type === 'IN' ? 'Masuk' : movement.type === 'OUT' ? 'Keluar' : 'Adjustment'}
                </Badge>
              </div>
              <div>
                <div className="text-muted-foreground">Stok Sebelumnya</div>
                <div className="font-semibold">{movement.previousStock}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Tanggal</div>
                <div className="font-semibold">{new Date(movement.timestamp).toLocaleDateString('id-ID')}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">
                  {movement.type === 'ADJUSTMENT' ? 'Stok Baru' : 'Jumlah'} *
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  placeholder={movement.type === 'ADJUSTMENT' ? 'Stok setelah adjustment' : '0'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Alasan *</Label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih alasan" />
                  </SelectTrigger>
                  <SelectContent>
                    {movement.type === 'IN' && (
                      <>
                        <SelectItem value="purchase">Pembelian</SelectItem>
                        <SelectItem value="return">Retur dari Customer</SelectItem>
                        <SelectItem value="transfer_in">Transfer Masuk</SelectItem>
                        <SelectItem value="adjustment_in">Adjustment Masuk</SelectItem>
                      </>
                    )}
                    {movement.type === 'OUT' && (
                      <>
                        <SelectItem value="sale">Penjualan</SelectItem>
                        <SelectItem value="return_supplier">Retur ke Supplier</SelectItem>
                        <SelectItem value="transfer_out">Transfer Keluar</SelectItem>
                        <SelectItem value="damage">Kerusakan</SelectItem>
                        <SelectItem value="lost">Kehilangan</SelectItem>
                      </>
                    )}
                    {movement.type === 'ADJUSTMENT' && (
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

              {movement.type === 'IN' && (
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

          {/* Stock Calculation Preview */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Stok Sebelumnya</div>
                <div className="font-semibold">{movement.previousStock}</div>
              </div>
              <div>
                <div className="text-muted-foreground">
                  {movement.type === 'ADJUSTMENT' ? 'Perubahan' : 'Jumlah Transaksi'}
                </div>
                <div className="font-semibold">
                  {movement.type === 'OUT' ? '-' : ''}
                  {movement.type === 'ADJUSTMENT' 
                    ? (quantity - movement.previousStock)
                    : quantity
                  }
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Stok Setelah Edit</div>
                <div className="font-semibold">
                  {movement.type === 'IN' 
                    ? movement.previousStock + quantity
                    : movement.type === 'OUT'
                    ? movement.previousStock - quantity
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
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Menyimpan...' : 'Update Movement'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditStockMovementModal;