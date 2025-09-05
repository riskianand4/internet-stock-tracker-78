import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, Edit, Trash2, Eye, Package, MapPin, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Product } from '@/types/inventory';

interface ProductCardProps {
  product: Product;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onView?: (product: Product) => void;
  onEdit?: (product: Product) => void;
}

const ProductCard = ({ product, isSelected, onSelect, onView, onEdit }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

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

  const stockPercentage = (product.stock / (product.minStock * 3)) * 100;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative"
    >
      <Card className="glass hover-lift border-border/50 overflow-hidden group">
        {/* Header with checkbox and menu */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            className="bg-background/80 backdrop-blur-sm"
          />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background border shadow-lg z-50">
              <DropdownMenuItem onClick={() => onView?.(product)}>
                <Eye className="mr-2 h-4 w-4" />
                Lihat Detail
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(product)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Produk
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus Produk
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Product Image/Icon */}
        <div className="h-40 bg-primary/10 flex items-center justify-center">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Package className="w-16 h-16 text-muted-foreground/50" />
          )}
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Product Name and SKU */}
          <div>
            <h3 className="font-semibold text-sm line-clamp-2 mb-1">
              {product.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              SKU: {product.sku}
            </p>
          </div>

          {/* Category and Status */}
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              {product.category}
            </Badge>
            <Badge 
              variant={getStatusColor(product.status) === 'success' ? 'default' : 'secondary'}
              className={`text-xs ${
                getStatusColor(product.status) === 'warning' ? 'bg-warning text-warning-foreground' :
                getStatusColor(product.status) === 'destructive' ? 'bg-destructive text-destructive-foreground' : ''
              }`}
            >
              {getStatusLabel(product.status)}
            </Badge>
          </div>

          {/* Price */}
          <div className="text-lg font-bold text-primary">
            {new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0
            }).format(product.price)}
          </div>

          {/* Stock Information */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Stok:</span>
              <span className="font-medium">
                {product.stock} / min: {product.minStock}
              </span>
            </div>
            
            <Progress 
              value={Math.min(stockPercentage, 100)} 
              className="h-1.5"
            />
          </div>

          {/* Location and Last Updated */}
          <div className="space-y-1 text-xs text-muted-foreground">
            {product.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{product.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>
                {new Date(product.updatedAt).toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>

          {/* Supplier */}
          {product.supplier && (
            <div className="pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                Supplier: <span className="font-medium">{product.supplier}</span>
              </p>
            </div>
          )}

          {/* Action Buttons - Show on Hover */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ 
              opacity: isHovered ? 1 : 0, 
              height: isHovered ? 'auto' : 0 
            }}
            transition={{ duration: 0.2 }}
            className="flex gap-2 pt-2 border-t border-border/50 overflow-hidden"
          >
            <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => onView?.(product)}>
              <Eye className="w-3 h-3 mr-1" />
              Detail
            </Button>
            <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => onEdit?.(product)}>
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </Button>
          </motion.div>
        </CardContent>

        {/* Stock Alert Indicator */}
        {product.status === 'low_stock' && (
          <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-warning" />
        )}
        {product.status === 'out_of_stock' && (
          <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-destructive" />
        )}
      </Card>
    </motion.div>
  );
};

export default ProductCard;