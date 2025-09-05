import React, { useState } from 'react';
import { Asset } from '@/types/assets';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useEnhancedAssetManager } from '@/hooks/useEnhancedAssetManager';

interface AddAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => void;
  loading?: boolean;
}

const assetCategories = [
  'Tools',
  'Power Tools', 
  'Testing Equipment',
  'Safety Equipment',
  'Power Equipment',
  'Network Equipment',
  'Measuring Tools',
  'Vehicle',
  'Computer Equipment',
  'Other'
];

const conditions: Asset['condition'][] = ['excellent', 'good', 'fair', 'poor'];
const statuses: Asset['status'][] = ['available', 'maintenance', 'damaged'];

export const AddAssetDialog: React.FC<AddAssetDialogProps> = ({
  open,
  onOpenChange,
  onSave,
  loading = false,
}) => {
  const { addAsset, isLoading: assetLoading } = useEnhancedAssetManager();
  const isProcessing = loading || assetLoading;
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    code: '',
    description: '',
    condition: 'excellent' as Asset['condition'],
    status: 'available' as Asset['status'],
    location: '',
    purchaseDate: new Date(),
    purchasePrice: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nama asset harus diisi';
    }
    if (!formData.category.trim()) {
      newErrors.category = 'Kategori harus dipilih';
    }
    if (!formData.code.trim()) {
      newErrors.code = 'Kode asset harus diisi';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Lokasi harus diisi';
    }
    if (!formData.purchasePrice || isNaN(Number(formData.purchasePrice)) || Number(formData.purchasePrice) <= 0) {
      newErrors.purchasePrice = 'Harga pembelian harus berupa angka yang valid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'> = {
      name: formData.name.trim(),
      category: formData.category,
      code: formData.code.trim(),
      description: formData.description.trim() || undefined,
      condition: formData.condition,
      status: formData.status,
      location: formData.location.trim(),
      purchaseDate: formData.purchaseDate,
      purchasePrice: Number(formData.purchasePrice),
      maintenanceHistory: [],
    };

    try {
      if (onSave) {
        onSave(asset);
      } else {
        await addAsset(asset);
      }
      handleReset();
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      category: '',
      code: '',
      description: '',
      condition: 'excellent',
      status: 'available',
      location: '',
      purchaseDate: new Date(),
      purchasePrice: '',
    });
    setErrors({});
  };

  const getConditionLabel = (condition: Asset['condition']) => {
    const labels = {
      excellent: 'Sangat Baik',
      good: 'Baik',
      fair: 'Cukup',
      poor: 'Buruk'
    };
    return labels[condition];
  };

  const getStatusLabel = (status: Asset['status']) => {
    const labels = {
      available: 'Tersedia',
      maintenance: 'Maintenance',
      damaged: 'Rusak',
      borrowed: 'Dipinjam' // won't be used in this form
    };
    return labels[status];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Asset Baru</DialogTitle>
          <DialogDescription>
            Tambahkan asset baru ke dalam sistem inventory
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Asset *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Contoh: Palu Besar"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Kode Asset *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                placeholder="Contoh: TL-001"
                className={errors.code ? 'border-destructive' : ''}
              />
              {errors.code && <p className="text-sm text-destructive">{errors.code}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Kategori *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                <SelectValue placeholder="Pilih kategori asset" />
              </SelectTrigger>
              <SelectContent>
                {assetCategories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Deskripsi detail asset..."
              rows={3}
            />
          </div>

          {/* Status and Condition */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="condition">Kondisi</Label>
              <Select
                value={formData.condition}
                onValueChange={(value: Asset['condition']) => setFormData(prev => ({ ...prev, condition: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {conditions.map(condition => (
                    <SelectItem key={condition} value={condition}>
                      {getConditionLabel(condition)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: Asset['status']) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {getStatusLabel(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Lokasi *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Contoh: Gudang A - Rak 1"
              className={errors.location ? 'border-destructive' : ''}
            />
            {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
          </div>

          {/* Purchase Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tanggal Pembelian</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.purchaseDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.purchaseDate ? (
                      format(formData.purchaseDate, "dd MMMM yyyy", { locale: id })
                    ) : (
                      <span>Pilih tanggal</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.purchaseDate}
                    onSelect={(date) => date && setFormData(prev => ({ ...prev, purchaseDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Harga Pembelian (Rp) *</Label>
              <Input
                id="purchasePrice"
                type="number"
                value={formData.purchasePrice}
                onChange={(e) => setFormData(prev => ({ ...prev, purchasePrice: e.target.value }))}
                placeholder="0"
                min="0"
                className={errors.purchasePrice ? 'border-destructive' : ''}
              />
              {errors.purchasePrice && <p className="text-sm text-destructive">{errors.purchasePrice}</p>}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              handleReset();
              onOpenChange(false);
            }}
            disabled={isProcessing}
          >
            Batal
          </Button>
          <Button onClick={handleSave} disabled={isProcessing}>
            {isProcessing ? 'Menyimpan...' : 'Simpan Asset'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};