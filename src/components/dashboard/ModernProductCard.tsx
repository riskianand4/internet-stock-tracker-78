import React, { memo, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Product } from '@/types/inventory';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, MapPin, TrendingUp, TrendingDown, AlertTriangle, Wifi, Router, Server, Cable } from 'lucide-react';

interface ModernProductCardProps {
  product: Product;
  onClick: () => void;
}

// Icon selector function (not memoized due to React.memo limitations)
const getProductIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'router': return Router;
    case 'server': return Server;
    case 'kabel': return Cable;
    case 'modem': return Wifi;
    default: return Package;
  }
};

const ModernProductCard = memo<ModernProductCardProps>(({
  product,
  onClick
}) => {
  const Icon = getProductIcon(product.category);
  
  // Memoized configurations
  const statusConfig = useMemo(() => {
    switch (product.status) {
      case 'in_stock':
        return {
          color: 'text-success bg-success/10 border-success/20',
          label: 'Tersedia',
          indicatorClass: 'bg-success'
        };
      case 'low_stock':
        return {
          color: 'text-warning bg-warning/10 border-warning/20',
          label: 'Menipis',
          indicatorClass: 'bg-warning'
        };
      case 'out_of_stock':
        return {
          color: 'text-destructive bg-destructive/10 border-destructive/20',
          label: 'Habis',
          indicatorClass: 'bg-destructive'
        };
      default:
        return {
          color: 'text-muted-foreground bg-muted/10 border-muted/20',
          label: product.status,
          indicatorClass: 'bg-muted'
        };
    }
  }, [product.status]);

  const formatPrice = useCallback((price: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }, []);

  const stockTrend = useMemo(() => {
    return product.stock > 50 ? 'up' : product.stock < 20 ? 'down' : 'stable';
  }, [product.stock]);

  const handleClick = useCallback(() => {
    onClick();
  }, [onClick]);
  return (
    <motion.div 
      className="group relative w-full" 
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <Card className="relative overflow-hidden border-border/50 bg-card hover:shadow-strong transition-all duration-300 cursor-pointer hover-lift touch-manipulation">
        {/* Status Indicator */}
        <div className={`absolute top-0 left-0 w-full h-1 ${statusConfig.indicatorClass}`} />

        <CardContent className="p-4 sm:p-6" onClick={handleClick}>
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center ${statusConfig.color}`}>
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate text-sm sm:text-base">{product.name}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{product.sku}</p>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className={`text-xs border ${statusConfig.color}`}>
              {statusConfig.label}
            </Badge>
            
            {/* Stock Trend - Responsive */}
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {stockTrend === 'up' && <TrendingUp className="w-3 h-3 text-success" />}
              {stockTrend === 'down' && <TrendingDown className="w-3 h-3 text-destructive" />}
              <span>{product.stock} unit</span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{product.location}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-base sm:text-lg font-bold text-foreground">{formatPrice(product.price)}</span>
              <Badge variant="secondary" className="text-xs">
                {product.category}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

ModernProductCard.displayName = 'ModernProductCard';
export default ModernProductCard;