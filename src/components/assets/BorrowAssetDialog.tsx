import React, { useState, useEffect } from 'react';
import { Asset, AssetBorrowRequest } from '@/types/assets';
import { User } from '@/types/users';
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
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarIcon, User as UserIcon } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import UserApi from '@/services/userApi';

interface BorrowAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Asset | null;
  onBorrow: (request: AssetBorrowRequest) => void;
  loading?: boolean;
}

export const BorrowAssetDialog: React.FC<BorrowAssetDialogProps> = ({
  open,
  onOpenChange,
  asset,
  onBorrow,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    borrowerUserId: '',
    expectedReturnDate: addDays(new Date(), 7), // Default 7 days from now
    purpose: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const users = await UserApi.getAllUsers();
        const available = users.filter(user => 
          user.status === 'active' && 
          user.role !== 'super_admin' &&
          user.id !== asset?.picId
        );
        setAvailableUsers(available);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        setAvailableUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [asset?.picId]);

  const selectedUser = availableUsers.find(user => user.id === formData.borrowerUserId);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.borrowerUserId) {
      newErrors.borrowerUserId = 'Peminjam harus dipilih';
    }
    if (!formData.purpose.trim()) {
      newErrors.purpose = 'Tujuan peminjaman harus diisi';
    }
    if (formData.expectedReturnDate <= new Date()) {
      newErrors.expectedReturnDate = 'Tanggal kembali harus di masa depan';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBorrow = () => {
    if (!asset || !validateForm() || !selectedUser) return;

    const request: AssetBorrowRequest = {
      assetId: asset.id,
      borrowerUserId: formData.borrowerUserId,
      borrowerUserName: selectedUser.name,
      expectedReturnDate: formData.expectedReturnDate,
      purpose: formData.purpose.trim(),
      notes: formData.notes.trim() || undefined,
    };

    onBorrow(request);
    handleReset();
  };

  const handleReset = () => {
    setFormData({
      borrowerUserId: '',
      expectedReturnDate: addDays(new Date(), 7),
      purpose: '',
      notes: '',
    });
    setErrors({});
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      handleReset();
    }
    onOpenChange(newOpen);
  };

  if (!asset) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Pinjam Asset</DialogTitle>
          <DialogDescription>
            Pinjam asset "{asset.name}" untuk penggunaan sementara
          </DialogDescription>
        </DialogHeader>

        {/* Asset Info */}
        <div className="bg-muted/10 rounded-lg p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Asset:</span>
            <span className="font-medium">{asset.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Kode:</span>
            <span className="font-mono text-sm">{asset.code}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">PIC:</span>
            <span className="text-sm">{asset.picName || 'Belum ditugaskan'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Lokasi:</span>
            <span className="text-sm">{asset.location}</span>
          </div>
        </div>

        <div className="grid gap-4 py-4">
          {/* Borrower Selection */}
          <div className="space-y-2">
            <Label htmlFor="borrower">Peminjam *</Label>
            <Select
              value={formData.borrowerUserId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, borrowerUserId: value }))}
            >
              <SelectTrigger className={errors.borrowerUserId ? 'border-destructive' : ''}>
                <SelectValue placeholder="Pilih peminjam">
                  {selectedUser && (
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4" />
                      <span>{selectedUser.name}</span>
                      <span className="text-xs text-muted-foreground">({selectedUser.department})</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {availableUsers.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4" />
                      <div>
                        <div>{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.department} - {user.position}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.borrowerUserId && <p className="text-sm text-destructive">{errors.borrowerUserId}</p>}
          </div>

          {/* Expected Return Date */}
          <div className="space-y-2">
            <Label>Tanggal Rencana Kembali *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.expectedReturnDate && "text-muted-foreground",
                    errors.expectedReturnDate && "border-destructive"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.expectedReturnDate ? (
                    format(formData.expectedReturnDate, "dd MMMM yyyy", { locale: id })
                  ) : (
                    <span>Pilih tanggal</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.expectedReturnDate}
                  onSelect={(date) => date && setFormData(prev => ({ ...prev, expectedReturnDate: date }))}
                  disabled={(date) => date <= new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.expectedReturnDate && <p className="text-sm text-destructive">{errors.expectedReturnDate}</p>}
          </div>

          {/* Purpose */}
          <div className="space-y-2">
            <Label htmlFor="purpose">Tujuan Peminjaman *</Label>
            <Input
              id="purpose"
              value={formData.purpose}
              onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
              placeholder="Contoh: Instalasi di rumah pelanggan"
              className={errors.purpose ? 'border-destructive' : ''}
            />
            {errors.purpose && <p className="text-sm text-destructive">{errors.purpose}</p>}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan Tambahan</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Catatan tambahan (opsional)..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={loading || loadingUsers}
          >
            Batal
          </Button>
          <Button onClick={handleBorrow} disabled={loading || loadingUsers}>
            {loading ? 'Memproses...' : 'Pinjam Asset'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};