import React, { memo, useMemo, useState } from 'react';
// @ts-ignore - react-window types issue
import { FixedSizeList } from 'react-window';
import { motion } from 'framer-motion';
import { Product } from '@/types/inventory';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit, Trash2, Eye } from 'lucide-react';

interface VirtualizedTableProps {
  products: Product[];
  selectedProducts: string[];
  onSelectionChange: (selected: string[]) => void;
  onView?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  height?: number;
}

interface TableRowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    products: Product[];
    selectedProducts: string[];
    onSelectionChange: (selected: string[]) => void;
    onView?: (product: Product) => void;
    onEdit?: (product: Product) => void;
    onDeleteClick?: (product: Product) => void;
  };
}

// Status configuration function
const getStatusConfig = (status: string) => {
  switch (status) {
    case 'in_stock':
      return { variant: 'default', label: 'Tersedia', className: 'bg-success text-success-foreground' };
    case 'low_stock':
      return { variant: 'secondary', label: 'Stok Menipis', className: 'bg-warning text-warning-foreground' };
    case 'out_of_stock':
      return { variant: 'secondary', label: 'Stok Habis', className: 'bg-destructive text-destructive-foreground' };
    default:
      return { variant: 'secondary', label: status, className: '' };
  }
};

// Currency formatter function
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value);
};

// Date formatter function
const formatDate = (date: string | Date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

// Table row component with memo
const TableRow = memo<TableRowProps>(({ index, style, data }) => {
  const { products, selectedProducts, onSelectionChange, onView, onEdit, onDeleteClick } = data;
  const product = products[index];
  const isSelected = selectedProducts.includes(product.id);
  const statusConfig = getStatusConfig(product.status);

  const handleSelect = (checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedProducts, product.id]);
    } else {
      onSelectionChange(selectedProducts.filter(id => id !== product.id));
    }
  };

  const handleView = () => onView?.(product);
  const handleEdit = () => onEdit?.(product);
  const handleDelete = () => onDeleteClick?.(product);

  return (
    <div 
      style={style} 
      className={`flex items-center border-b border-border/50 hover:bg-muted/50 transition-colors ${
        isSelected ? 'bg-primary/5' : ''
      }`}
    >
      {/* Mobile-optimized layout */}
      <div className="flex w-full p-2 sm:p-4">
        {/* Selection checkbox */}
        <div className="flex items-center mr-2 sm:mr-4">
          <Checkbox
            checked={isSelected}
            onCheckedChange={handleSelect}
          />
        </div>

        {/* Mobile layout */}
        <div className="flex-1 sm:hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-medium">
                  {product.name.charAt(0)}
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{product.name}</p>
                <p className="text-xs text-muted-foreground">{product.sku}</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background border shadow-lg z-50">
                <DropdownMenuItem onClick={handleView}>
                  <Eye className="mr-2 h-4 w-4" />
                  Lihat Detail
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <Badge 
                variant={statusConfig.variant as any}
                className={`text-xs ${statusConfig.className}`}
              >
                {statusConfig.label}
              </Badge>
              <span className="text-muted-foreground">{product.stock} unit</span>
            </div>
            <span className="font-medium">{formatCurrency(product.price)}</span>
          </div>
        </div>

        {/* Desktop layout */}
        <div className="hidden sm:flex flex-1 items-center space-x-4">
          {/* Product Info */}
          <div className="flex items-center space-x-3 min-w-0 flex-1">
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

          {/* SKU */}
          <div className="w-24">
            <code className="text-xs bg-muted px-2 py-1 rounded">
              {product.sku}
            </code>
          </div>

          {/* Category */}
          <div className="w-24">
            <Badge variant="outline" className="text-xs">
              {product.category}
            </Badge>
          </div>

          {/* Price */}
          <div className="w-32 text-right font-medium">
            {formatCurrency(product.price)}
          </div>

          {/* Stock */}
          <div className="w-20 text-right">
            <div className="space-y-1">
              <span className="font-medium">{product.stock}</span>
              <div className="text-xs text-muted-foreground">
                min: {product.minStock}
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="w-28">
            <Badge 
              variant={statusConfig.variant as any}
              className={`text-xs ${statusConfig.className}`}
            >
              {statusConfig.label}
            </Badge>
          </div>

          {/* Location */}
          <div className="w-24 text-sm text-muted-foreground truncate">
            {product.location || '-'}
          </div>

          {/* Last Updated */}
          <div className="w-24 text-xs text-muted-foreground">
            {formatDate(product.updatedAt)}
          </div>

          {/* Actions */}
          <div className="w-8">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background border shadow-lg z-50">
                <DropdownMenuItem onClick={handleView}>
                  <Eye className="mr-2 h-4 w-4" />
                  Lihat Detail
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
});

TableRow.displayName = 'TableRow';

// Loading skeleton
const TableRowSkeleton = memo(() => (
  <div className="flex items-center p-4 border-b border-border/50">
    <Skeleton className="w-4 h-4 mr-4" />
    <div className="flex items-center space-x-3 flex-1">
      <Skeleton className="w-10 h-10 rounded-lg" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
    <div className="hidden sm:flex space-x-4">
      <Skeleton className="w-20 h-4" />
      <Skeleton className="w-16 h-4" />
      <Skeleton className="w-20 h-4" />
      <Skeleton className="w-16 h-4" />
    </div>
  </div>
));

TableRowSkeleton.displayName = 'TableRowSkeleton';

// Main virtualized table component
export const VirtualizedProductTable = memo<VirtualizedTableProps>(({
  products,
  selectedProducts,
  onSelectionChange,
  onView,
  onEdit,
  onDelete,
  height = 600
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (productToDelete && onDelete) {
      onDelete(productToDelete);
    }
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };
  // Memoized data for virtual list
  const itemData = useMemo(() => ({
    products,
    selectedProducts,
    onSelectionChange,
    onView,
    onEdit,
    onDeleteClick: handleDeleteClick,
  }), [products, selectedProducts, onSelectionChange, onView, onEdit]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(products.map(p => p.id));
    } else {
      onSelectionChange([]);
    }
  };

  const isAllSelected = products.length > 0 && selectedProducts.length === products.length;
  const isIndeterminate = selectedProducts.length > 0 && selectedProducts.length < products.length;

  if (products.length === 0) {
    return (
      <Card className="glass p-8 text-center">
        <p className="text-muted-foreground">Tidak ada produk untuk ditampilkan</p>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="glass overflow-hidden">
        {/* Header - visible on desktop only */}
        <div className="hidden sm:flex items-center border-b border-border/50 p-4 space-x-4">
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={handleSelectAll}
          />
          <div className="flex-1 text-sm font-medium">Produk</div>
          <div className="w-24 text-sm font-medium">SKU</div>
          <div className="w-24 text-sm font-medium">Kategori</div>
          <div className="w-32 text-sm font-medium text-right">Harga</div>
          <div className="w-20 text-sm font-medium text-right">Stok</div>
          <div className="w-28 text-sm font-medium">Status</div>
          <div className="w-24 text-sm font-medium">Lokasi</div>
          <div className="w-24 text-sm font-medium">Update</div>
          <div className="w-8"></div>
        </div>

        {/* Mobile header */}
        <div className="sm:hidden flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={isAllSelected}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm font-medium">
              {selectedProducts.length > 0 ? `${selectedProducts.length} dipilih` : 'Pilih Semua'}
            </span>
          </div>
          <span className="text-sm text-muted-foreground">
            {products.length} produk
          </span>
        </div>

        {/* Virtualized content */}
        <FixedSizeList
          height={height}
          itemCount={products.length}
          itemSize={80}
          itemData={itemData}
          overscanCount={5}
        >
          {TableRow}
        </FixedSizeList>

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
      </Card>
    </motion.div>
  );
});

VirtualizedProductTable.displayName = 'VirtualizedProductTable';

export default VirtualizedProductTable;