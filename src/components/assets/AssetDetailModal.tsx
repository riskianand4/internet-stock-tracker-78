import React from 'react';
import { Asset } from '@/types/assets';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  MapPin,
  DollarSign,
  User,
  Package,
  Clock,
  Wrench,
  FileText,
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface AssetDetailModalProps {
  asset: Asset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({
  asset,
  open,
  onOpenChange,
}) => {
  if (!asset) return null;

  const getStatusBadge = (status: Asset['status']) => {
    const variants = {
      available: 'bg-success/10 text-success border-success/20',
      borrowed: 'bg-warning/10 text-warning border-warning/20',
      maintenance: 'bg-destructive/10 text-destructive border-destructive/20',
      damaged: 'bg-muted text-muted-foreground border-muted/50'
    };

    const labels = {
      available: 'Tersedia',
      borrowed: 'Dipinjam',
      maintenance: 'Maintenance',
      damaged: 'Rusak'
    };

    return (
      <Badge variant="outline" className={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const getConditionBadge = (condition: Asset['condition']) => {
    const variants = {
      excellent: 'bg-success/10 text-success border-success/20',
      good: 'bg-success/10 text-success border-success/20',
      fair: 'bg-warning/10 text-warning border-warning/20',
      poor: 'bg-destructive/10 text-destructive border-destructive/20'
    };

    const labels = {
      excellent: 'Sangat Baik',
      good: 'Baik',
      fair: 'Cukup',
      poor: 'Buruk'
    };

    return (
      <Badge variant="outline" className={variants[condition]}>
        {labels[condition]}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Package className="w-6 h-6 text-primary" />
            Detail Asset: {asset.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Informasi Umum</TabsTrigger>
            <TabsTrigger value="borrowing">Riwayat Peminjaman</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Information */}
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Informasi Dasar
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Kode Asset</label>
                      <p className="font-mono text-lg">{asset.code}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Nama Asset</label>
                      <p className="font-medium">{asset.name}</p>
                    </div>
                    
                    {asset.description && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Deskripsi</label>
                        <p className="text-sm">{asset.description}</p>
                      </div>
                    )}
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Kategori</label>
                      <p>{asset.category}</p>
                    </div>
                    
                    <div className="flex gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Status</label>
                        <div className="mt-1">{getStatusBadge(asset.status)}</div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Kondisi</label>
                        <div className="mt-1">{getConditionBadge(asset.condition)}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Financial & Location Info */}
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Keuangan & Lokasi
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Harga Pembelian</label>
                        <p className="font-semibold text-lg">
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }).format(asset.purchasePrice)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Tanggal Pembelian</label>
                        <p>{format(new Date(asset.purchaseDate), 'dd MMMM yyyy', { locale: id })}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Lokasi</label>
                        <p>{asset.location}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">PIC (Penanggung Jawab)</label>
                        <p>{asset.picName || 'Belum ditugaskan'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Current Borrowing Status */}
            {asset.status === 'borrowed' && asset.borrowedBy && (
              <Card className="glass border-warning/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-warning">
                    <Clock className="w-5 h-5" />
                    Status Peminjaman Saat Ini
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Dipinjam oleh</label>
                      <p className="font-medium">{asset.borrowedBy.userName}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Tanggal Pinjam</label>
                      <p>{format(new Date(asset.borrowedBy.borrowDate), 'dd MMMM yyyy HH:mm', { locale: id })}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Tanggal Harus Kembali</label>
                      <p>{format(new Date(asset.borrowedBy.expectedReturnDate), 'dd MMMM yyyy HH:mm', { locale: id })}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <div className="mt-1">
                        {new Date(asset.borrowedBy.expectedReturnDate) < new Date() ? (
                          <Badge variant="destructive">Terlambat</Badge>
                        ) : (
                          <Badge className="bg-warning/10 text-warning border-warning/20">Sedang Dipinjam</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {asset.borrowedBy.notes && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Catatan</label>
                      <p className="text-sm bg-muted/50 p-2 rounded">{asset.borrowedBy.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Separator />
            
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Dibuat: {format(new Date(asset.createdAt), 'dd MMMM yyyy HH:mm', { locale: id })}</p>
              <p>Terakhir diperbarui: {format(new Date(asset.updatedAt), 'dd MMMM yyyy HH:mm', { locale: id })}</p>
            </div>
          </TabsContent>

          <TabsContent value="borrowing" className="space-y-4">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Riwayat Peminjaman
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Riwayat peminjaman akan ditampilkan di sini</p>
                  <p className="text-sm mt-2">Fitur ini akan dikembangkan lebih lanjut</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="w-5 h-5" />
                  Riwayat Maintenance
                </CardTitle>
              </CardHeader>
              <CardContent>
                {asset.maintenanceHistory.length > 0 ? (
                  <div className="space-y-4">
                    {asset.maintenanceHistory.map((maintenance) => (
                      <Card key={maintenance.id} className="border border-border/50">
                        <CardContent className="pt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Jenis Maintenance</label>
                              <p className="capitalize">{maintenance.type}</p>
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Biaya</label>
                              <p className="font-semibold">
                                {new Intl.NumberFormat('id-ID', {
                                  style: 'currency',
                                  currency: 'IDR'
                                }).format(maintenance.cost)}
                              </p>
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Dilakukan oleh</label>
                              <p>{maintenance.performedBy}</p>
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Tanggal</label>
                              <p>{format(new Date(maintenance.performedAt), 'dd MMMM yyyy', { locale: id })}</p>
                            </div>
                            
                            <div className="md:col-span-2">
                              <label className="text-sm font-medium text-muted-foreground">Deskripsi</label>
                              <p className="text-sm bg-muted/50 p-2 rounded mt-1">{maintenance.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Wrench className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Belum ada riwayat maintenance</p>
                    <p className="text-sm mt-2">Asset ini belum pernah menjalani maintenance</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};