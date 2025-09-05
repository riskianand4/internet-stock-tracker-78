import React, { useState } from 'react';
import { Asset } from '@/types/assets';
import { useAuth } from '@/contexts/AuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  MoreHorizontal,
  Search,
  Filter,
  Edit,
  Trash2,
  UserPlus,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface AssetTableProps {
  assets: Asset[];
  onEdit?: (asset: Asset) => void;
  onDelete?: (assetId: string) => void;
  onAssignPIC?: (asset: Asset) => void;
  onBorrow?: (asset: Asset) => void;
  onReturn?: (asset: Asset) => void;
  onViewDetails?: (asset: Asset) => void;
}

export const AssetTable: React.FC<AssetTableProps> = ({
  assets,
  onEdit,
  onDelete,
  onAssignPIC,
  onBorrow,
  onReturn,
  onViewDetails,
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [deleteAssetId, setDeleteAssetId] = useState<string | null>(null);

  // Filter assets based on search and filters
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = 
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.picName && asset.picName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || asset.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

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

  const canEdit = user?.role === 'admin' || user?.role === 'super_admin';
  const canAssignPIC = user?.role === 'super_admin';

  const uniqueCategories = [...new Set(assets.map(asset => asset.category))];

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle>Daftar Asset</CardTitle>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Cari asset..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="available">Tersedia</SelectItem>
              <SelectItem value="borrowed">Dipinjam</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="damaged">Rusak</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {uniqueCategories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border border-border/50">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode Asset</TableHead>
                <TableHead>Nama Asset</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Kondisi</TableHead>
                <TableHead>PIC</TableHead>
                <TableHead>Lokasi</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    Tidak ada asset yang ditemukan
                  </TableCell>
                </TableRow>
              ) : (
                filteredAssets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell className="font-medium">{asset.code}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{asset.name}</div>
                        {asset.description && (
                          <div className="text-sm text-muted-foreground">{asset.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{asset.category}</TableCell>
                    <TableCell>{getStatusBadge(asset.status)}</TableCell>
                    <TableCell>{getConditionBadge(asset.condition)}</TableCell>
                    <TableCell>
                      {asset.picName ? (
                        <span className="text-sm">{asset.picName}</span>
                      ) : (
                        <Badge variant="outline" className="bg-muted/10 text-muted-foreground">
                          Belum Ditugaskan
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {asset.location}
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR'
                      }).format(asset.purchasePrice)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-background border-border shadow-lg z-50">
                          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                          
                          <DropdownMenuItem onClick={() => onViewDetails?.(asset)}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Detail
                          </DropdownMenuItem>

                          {canEdit && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => onEdit?.(asset)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>

                              {canAssignPIC && (
                                <DropdownMenuItem onClick={() => onAssignPIC?.(asset)}>
                                  <UserPlus className="mr-2 h-4 w-4" />
                                  Tugaskan PIC
                                </DropdownMenuItem>
                              )}

                              {asset.status === 'available' && asset.picId && (
                                <DropdownMenuItem onClick={() => onBorrow?.(asset)}>
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  Pinjam Asset
                                </DropdownMenuItem>
                              )}

                              {asset.status === 'borrowed' && (
                                <DropdownMenuItem onClick={() => onReturn?.(asset)}>
                                  <RotateCcw className="mr-2 h-4 w-4" />
                                  Kembalikan Asset
                                </DropdownMenuItem>
                              )}

                              {asset.status !== 'borrowed' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => setDeleteAssetId(asset.id)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Hapus
                                  </DropdownMenuItem>
                                </>
                              )}
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteAssetId} onOpenChange={() => setDeleteAssetId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Asset</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus asset ini? Tindakan ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (deleteAssetId) {
                    onDelete?.(deleteAssetId);
                    setDeleteAssetId(null);
                  }
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};