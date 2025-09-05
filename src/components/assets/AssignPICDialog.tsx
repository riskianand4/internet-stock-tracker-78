import React, { useState, useEffect } from 'react';
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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User as UserIcon, Shield, Badge as BadgeIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import UserApi from '@/services/userApi';

interface AssignPICDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Asset | null;
  onAssign: (assetId: string, picId: string, picName: string) => void;
  loading?: boolean;
}

export const AssignPICDialog: React.FC<AssignPICDialogProps> = ({
  open,
  onOpenChange,
  asset,
  onAssign,
  loading = false,
}) => {
  const [selectedPICId, setSelectedPICId] = useState<string>('');

  const [availablePICs, setAvailablePICs] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const users = await UserApi.getAllUsers();
        const pics = users.filter(user => 
          user.status === 'active' && 
          (user.role === 'admin' || user.role === 'user')
        );
        setAvailablePICs(pics);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        setAvailablePICs([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  const selectedPIC = availablePICs.find(user => user.id === selectedPICId);

  const handleAssign = () => {
    if (!asset || !selectedPIC) return;

    onAssign(asset.id, selectedPIC.id, selectedPIC.name);
    handleReset();
  };

  const handleReset = () => {
    setSelectedPICId(asset?.picId || '');
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && asset) {
      setSelectedPICId(asset.picId || '');
    } else if (!newOpen) {
      handleReset();
    }
    onOpenChange(newOpen);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-warning/10 text-warning border-warning/20';
      default:
        return 'bg-success/10 text-success border-success/20';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      default:
        return 'Staff';
    }
  };

  if (!asset) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Tugaskan PIC Asset
          </DialogTitle>
          <DialogDescription>
            Pilih Person in Charge (PIC) untuk asset "{asset.name}"
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
            <span className="text-sm text-muted-foreground">Kategori:</span>
            <span className="text-sm">{asset.category}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">PIC Saat Ini:</span>
            <span className="text-sm">
              {asset.picName ? (
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  {asset.picName}
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-muted/10 text-muted-foreground">
                  Belum Ditugaskan
                </Badge>
              )}
            </span>
          </div>
        </div>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="pic">Pilih PIC Baru</Label>
            <Select
              value={selectedPICId}
              onValueChange={setSelectedPICId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Person in Charge">
                  {selectedPIC && (
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4" />
                      <span>{selectedPIC.name}</span>
                      <Badge variant="outline" className={getRoleColor(selectedPIC.role)}>
                        {getRoleLabel(selectedPIC.role)}
                      </Badge>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {availablePICs.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center gap-3 py-2">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <UserIcon className="w-4 h-4 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.department} - {user.position}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                      <Badge variant="outline" className={getRoleColor(user.role)}>
                        {getRoleLabel(user.role)}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPIC && (
            <div className="bg-primary/5 rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-sm">Informasi PIC Terpilih:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Nama:</span>
                  <div className="font-medium">{selectedPIC.name}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Role:</span>
                  <div>
                    <Badge variant="outline" className={getRoleColor(selectedPIC.role)}>
                      {getRoleLabel(selectedPIC.role)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Department:</span>
                  <div className="font-medium">{selectedPIC.department}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Position:</span>
                  <div className="font-medium">{selectedPIC.position}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {asset.picId && selectedPICId === asset.picId && (
          <div className="bg-warning/10 text-warning rounded-lg p-3 text-sm">
            <BadgeIcon className="inline w-4 h-4 mr-1" />
            PIC yang dipilih sama dengan PIC saat ini
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={loading || loadingUsers}
          >
            Batal
          </Button>
          <Button 
            onClick={handleAssign} 
            disabled={loading || loadingUsers || !selectedPICId}
          >
            {loading ? 'Menugaskan...' : 'Tugaskan PIC'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};