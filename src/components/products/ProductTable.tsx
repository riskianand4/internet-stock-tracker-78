import React, { useState } from 'react';
import { MoreVertical, Edit, Trash2, Eye, ArrowUpDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Product } from '@/types/inventory';

interface ProductTableProps {
  products: Product[];
  selectedProducts: string[];
  onSelectionChange: (selected: string[]) => void;
  onView?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

const ProductTable = ({ products, selectedProducts, onSelectionChange, onView, onEdit, onDelete }: ProductTableProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [productDetail, setProductDetail] = useState<Product | null>(null);
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(products.map(p => p.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedProducts, productId]);
    } else {
      onSelectionChange(selectedProducts.filter(id => id !== productId));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'success';
      case 'low_stock': return 'warning';
      case 'out_of_stock': return 'destructive';
      default: return 'secondary';
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const isAllSelected = products.length > 0 && selectedProducts.length === products.length;
  const isIndeterminate = selectedProducts.length > 0 && selectedProducts.length < products.length;

  // Action handlers
  const handleViewProduct = (product: Product) => {
    if (onView) {
      onView(product);
    } else {
      setProductDetail(product);
      setDetailDialogOpen(true);
    }
  };

  const handleEditProduct = (product: Product) => {
    onEdit?.(product);
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (productToDelete && onDelete) {
      onDelete(productToDelete);
      // Remove from local selection if selected
      if (selectedProducts.includes(productToDelete.id)) {
        onSelectionChange(selectedProducts.filter(id => id !== productToDelete.id));
      }
    }
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  return (
    <Card className="glass overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50">
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="min-w-[200px]">
                <Button variant="ghost" className="h-auto p-0 font-medium">
                  Produk
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="h-auto p-0 font-medium">
                  SKU
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="h-auto p-0 font-medium">
                  Kategori
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button variant="ghost" className="h-auto p-0 font-medium">
                  Harga
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button variant="ghost" className="h-auto p-0 font-medium">
                  Stok
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="h-auto p-0 font-medium">
                  Status
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="h-auto p-0 font-medium">
                  Lokasi
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="h-auto p-0 font-medium">
                  Supplier
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="h-auto p-0 font-medium">
                  Update Terakhir
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const isSelected = selectedProducts.includes(product.id);
              
              return (
                <TableRow 
                  key={product.id} 
                  className={`border-border/50 hover:bg-muted/50 ${isSelected ? 'bg-primary/5' : ''}`}
                >
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => handleSelectProduct(product.id, checked as boolean)}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium">
                          {product.name.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{product.name}</p>
                        {product.description && (
                          <p className="text-xs text-muted-foreground truncate">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {product.sku}
                    </code>
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {product.category}
                    </Badge>
                  </TableCell>
                  
                  <TableCell className="text-right font-medium">
                    {formatCurrency(product.price)}
                  </TableCell>
                  
                  <TableCell className="text-right">
                    <div className="text-right space-y-1">
                      <span className="font-medium">{product.stock}</span>
                      <div className="text-xs text-muted-foreground">
                        min: {product.minStock}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge 
                      variant={getStatusColor(product.status) === 'success' ? 'default' : 'secondary'}
                      className={`text-xs ${
                        getStatusColor(product.status) === 'warning' ? 'bg-warning text-warning-foreground' :
                        getStatusColor(product.status) === 'destructive' ? 'bg-destructive text-destructive-foreground' : ''
                      }`}
                    >
                      {getStatusLabel(product.status)}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {product.location || '-'}
                    </span>
                  </TableCell>
                  
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {product.supplier || '-'}
                    </span>
                  </TableCell>
                  
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {new Date(product.updatedAt).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </TableCell>
                  
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                       <DropdownMenuContent align="end" className="bg-background border shadow-lg z-50">
                         <DropdownMenuItem onClick={() => handleViewProduct(product)}>
                           <Eye className="mr-2 h-4 w-4" />
                           Lihat Detail
                         </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                           <Edit className="mr-2 h-4 w-4" />
                           Edit Produk
                         </DropdownMenuItem>
                         <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick(product)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus Produk
                          </DropdownMenuItem>
                       </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      
      {products.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">
          Tidak ada produk untuk ditampilkan
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus Produk</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus produk "{productToDelete?.name}"? 
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail View Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Produk</DialogTitle>
            <DialogDescription>
              Informasi lengkap produk
            </DialogDescription>
          </DialogHeader>
          {productDetail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nama Produk</label>
                  <p className="font-medium">{productDetail.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">SKU</label>
                  <p className="font-mono text-sm">{productDetail.sku}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Kategori</label>
                  <p>{productDetail.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <Badge 
                    variant={getStatusColor(productDetail.status) === 'success' ? 'default' : 'secondary'}
                    className={`text-xs ${
                      getStatusColor(productDetail.status) === 'warning' ? 'bg-warning text-warning-foreground' :
                      getStatusColor(productDetail.status) === 'destructive' ? 'bg-destructive text-destructive-foreground' : ''
                    }`}
                  >
                    {getStatusLabel(productDetail.status)}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Harga</label>
                  <p className="font-bold">{formatCurrency(productDetail.price)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Stok Saat Ini</label>
                  <p className="font-medium">{productDetail.stock}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Minimum Stok</label>
                  <p className="font-medium">{productDetail.minStock}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Lokasi</label>
                  <p>{productDetail.location || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Supplier</label>
                  <p>{productDetail.supplier || '-'}</p>
                </div>
              </div>
              
              {productDetail.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Deskripsi</label>
                  <p className="text-sm">{productDetail.description}</p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Terakhir Diupdate</label>
                <p className="text-sm">
                  {new Date(productDetail.updatedAt).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setDetailDialogOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ProductTable;