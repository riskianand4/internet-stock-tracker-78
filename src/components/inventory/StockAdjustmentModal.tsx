import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Product } from '@/types/inventory';
import { useToast } from '@/hooks/use-toast';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onAdjustment?: (productId: string, newStock: number, reason: string, notes?: string) => void;
}

const StockAdjustmentModal = ({ isOpen, onClose, product, onAdjustment }: StockAdjustmentModalProps) => {
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract' | 'set'>('add');
  const [quantity, setQuantity] = useState<number>(0);
  const [reason, setReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const { toast } = useToast();

  const reasonOptions = [
    'Pembelian',
    'Penjualan',
    'Kerusakan',
    'Kehilangan',
    'Retur',
    'Transfer',
    'Koreksi Stok',
    'Expired',
    'Lainnya'
  ];

  const calculateNewStock = () => {
    switch (adjustmentType) {
      case 'add':
        return product.stock + quantity;
      case 'subtract':
        return Math.max(0, product.stock - quantity);
      case 'set':
        return Math.max(0, quantity);
      default:
        return product.stock;
    }
  };

  const handleSubmit = () => {
    if (quantity === 0 && adjustmentType !== 'set') {
      toast({
        title: "Error",
        description: "Jumlah adjustment tidak boleh 0",
        variant: "destructive",
      });
      return;
    }

    if (!reason) {
      toast({
        title: "Error", 
        description: "Alasan adjustment harus diisi",
        variant: "destructive",
      });
      return;
    }

    const newStock = calculateNewStock();
    
    // Call the onAdjustment callback
    onAdjustment?.(product.id, newStock, reason, notes);
    
    toast({
      title: "Berhasil",
      description: `Stok ${product.name} berhasil disesuaikan`,
    });

    // Reset form
    setQuantity(0);
    setReason('');
    setNotes('');
    onClose();
  };

  const getAdjustmentIcon = () => {
    switch (adjustmentType) {
      case 'add': return <Plus className="w-4 h-4" />;
      case 'subtract': return <Minus className="w-4 h-4" />;
      case 'set': return <RotateCcw className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'bg-success';
      case 'low_stock': return 'bg-warning';
      case 'out_of_stock': return 'bg-destructive';
      default: return 'bg-secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in_stock': return 'Tersedia';
      case 'low_stock': return 'Stok Menipis';
      case 'out_of_stock': return 'Stok Habis';
      default: return status;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getAdjustmentIcon()}
            Penyesuaian Stok
          </DialogTitle>
          <DialogDescription>
            Sesuaikan stok untuk produk yang dipilih
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{product.name}</h4>
                  <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                </div>
                <Badge className={getStatusColor(product.status)}>
                  {getStatusLabel(product.status)}
                </Badge>
              </div>
              
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Stok Saat Ini:</span>
                <span className="font-bold text-lg">{product.stock}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Stok Minimum:</span>
                <span className="text-sm">{product.minStock}</span>
              </div>
            </CardContent>
          </Card>

          {/* Adjustment Type */}
          <div className="space-y-2">
            <Label>Jenis Penyesuaian</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: 'add', label: 'Tambah', icon: <Plus className="w-4 h-4" /> },
                { type: 'subtract', label: 'Kurang', icon: <Minus className="w-4 h-4" /> },
                { type: 'set', label: 'Set', icon: <RotateCcw className="w-4 h-4" /> }
              ].map((item) => (
                <Button
                  key={item.type}
                  type="button"
                  variant={adjustmentType === item.type ? 'default' : 'outline'}
                  onClick={() => setAdjustmentType(item.type as any)}
                  className="flex items-center gap-2"
                >
                  {item.icon}
                  {item.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label>
              {adjustmentType === 'set' ? 'Stok Baru' : 'Jumlah'}
            </Label>
            <Input
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              placeholder={adjustmentType === 'set' ? 'Masukkan stok baru' : 'Masukkan jumlah'}
            />
          </div>

          {/* Preview */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 bg-muted/50 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Stok Setelah Penyesuaian:</span>
              <span className="font-bold text-lg text-primary">{calculateNewStock()}</span>
            </div>
          </motion.div>

          {/* Reason */}
          <div className="space-y-2">
            <Label>Alasan *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih alasan penyesuaian" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50">
                {reasonOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Catatan (Opsional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tambahkan catatan tambahan..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button type="button" onClick={handleSubmit}>
            Simpan Penyesuaian
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StockAdjustmentModal;