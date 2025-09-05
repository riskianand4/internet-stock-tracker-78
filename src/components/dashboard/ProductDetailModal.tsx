import React, { useState } from 'react';
import { Product } from '@/types/inventory';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { 
  Package, 
  MapPin, 
  Building2, 
  DollarSign, 
  Calendar,
  Edit,
  Save,
  X
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (product: Product) => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState<Product>(product);

  const canEdit = user?.role === 'admin' || user?.role === 'super_admin';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'bg-success text-success-foreground';
      case 'low_stock': return 'bg-warning text-warning-foreground';
      case 'out_of_stock': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in_stock': return 'Stok Tersedia';
      case 'low_stock': return 'Stok Menipis';
      case 'out_of_stock': return 'Stok Habis';
      default: return status;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(dateObj);
  };

  const handleSave = () => {
    // Update status based on stock levels
    let newStatus: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';
    if (editedProduct.stock === 0) {
      newStatus = 'out_of_stock';
    } else if (editedProduct.stock <= editedProduct.minStock) {
      newStatus = 'low_stock';
    }

    const updatedProduct = {
      ...editedProduct,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    onUpdate(updatedProduct);
    setIsEditing(false);
    toast({
      title: "Produk diperbarui",
      description: `${updatedProduct.name} berhasil diperbarui`,
    });
  };

  const handleCancel = () => {
    setEditedProduct(product);
    setIsEditing(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Detail Produk</span>
            {canEdit && (
              <div className="flex space-x-2">
                {isEditing ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancel}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Batal
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      className="bg-success hover:bg-success/90"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Simpan
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Produk</Label>
                  <Input
                    id="name"
                    value={editedProduct.name}
                    onChange={(e) => setEditedProduct(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
              ) : (
                <h2 className="text-2xl font-bold text-foreground">{product.name}</h2>
              )}
              <p className="text-muted-foreground font-mono mt-1">{product.sku}</p>
            </div>
            <Badge className={`${getStatusColor(product.status)} ml-4`}>
              {getStatusLabel(product.status)}
            </Badge>
          </div>

          <Separator />

          {/* Product Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stock Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center">
                <Package className="w-5 h-5 mr-2 text-primary" />
                Informasi Stok
              </h3>
              
              <div className="space-y-3">
                {isEditing ? (
                  <>
                    <div>
                      <Label htmlFor="stock">Stok Saat Ini</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={editedProduct.stock}
                        onChange={(e) => setEditedProduct(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="minStock">Minimum Stok</Label>
                      <Input
                        id="minStock"
                        type="number"
                        value={editedProduct.minStock}
                        onChange={(e) => setEditedProduct(prev => ({ ...prev, minStock: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Stok Saat Ini:</span>
                      <span className="font-semibold">{product.stock} unit</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Minimum Stok:</span>
                      <span className="font-semibold">{product.minStock} unit</span>
                    </div>
                  </>
                )}
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kategori:</span>
                  <span className="font-semibold">{product.category}</span>
                </div>
              </div>
            </div>

            {/* Price & Location */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-primary" />
                Harga & Lokasi
              </h3>
              
              <div className="space-y-3">
                {isEditing ? (
                  <div>
                    <Label htmlFor="price">Harga</Label>
                    <Input
                      id="price"
                      type="number"
                      value={editedProduct.price}
                      onChange={(e) => setEditedProduct(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                ) : (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Harga:</span>
                    <span className="font-semibold text-primary">{formatPrice(product.price)}</span>
                  </div>
                )}
                
                {isEditing ? (
                  <div>
                    <Label htmlFor="location">Lokasi</Label>
                    <Input
                      id="location"
                      value={editedProduct.location || ''}
                      onChange={(e) => setEditedProduct(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{product.location}</span>
                  </div>
                )}
                
                {product.supplier && (
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{product.supplier}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {(product.description || isEditing) && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold text-foreground mb-3">Deskripsi</h3>
                {isEditing ? (
                  <Textarea
                    value={editedProduct.description || ''}
                    onChange={(e) => setEditedProduct(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Masukkan deskripsi produk..."
                    rows={3}
                  />
                ) : (
                  <p className="text-muted-foreground">{product.description}</p>
                )}
              </div>
            </>
          )}

          <Separator />

          {/* Last Updated */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Terakhir diperbarui: {formatDate(product.updatedAt)}</span>
            </div>
            <Badge variant="outline" className="text-xs">
              ID: {product.id}
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailModal;