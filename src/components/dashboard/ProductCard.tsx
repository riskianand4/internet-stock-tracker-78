import React from 'react';
import { Product } from '@/types/inventory';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, MapPin, AlertTriangle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
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
      case 'in_stock': return 'Tersedia';
      case 'low_stock': return 'Menipis';
      case 'out_of_stock': return 'Habis';
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

  return (
    <Card 
      className="cursor-pointer transition-all duration-300 hover:shadow-medium hover:scale-[1.02] bg-card"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-medium text-foreground truncate mb-1">
              {product.name}
            </h3>
            <p className="text-sm text-muted-foreground font-mono">
              {product.sku}
            </p>
          </div>
          <Badge 
            className={`${getStatusColor(product.status)} text-xs font-medium`}
            variant="secondary"
          >
            {getStatusLabel(product.status)}
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Package className="w-4 h-4 mr-2" />
            <span>Stok: {product.stock} unit</span>
            {product.stock <= product.minStock && product.stock > 0 && (
              <AlertTriangle className="w-4 h-4 ml-2 text-warning" />
            )}
          </div>
          
          {product.location && (
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 mr-2" />
              <span className="truncate">{product.location}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-primary">
              {formatPrice(product.price)}
            </p>
            <p className="text-xs text-muted-foreground">
              {product.category}
            </p>
          </div>
          
          <div className="text-right">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <span className="text-primary font-bold text-lg">
                {product.id}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;