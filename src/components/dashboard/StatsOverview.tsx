import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useHybridInventoryStats } from '@/hooks/useHybridData';
import { useProductManager } from '@/hooks/useProductManager';
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  XCircle,
  DollarSign,
  BarChart3
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const StatsOverview = () => {
  const { data: stats, isLoading, isFromApi } = useHybridInventoryStats();
  const { products } = useProductManager();

  // Use hybrid stats if available, otherwise calculate from products
  const totalProducts = (stats as any)?.totalProducts || products?.length || 0;
  const totalValue = (stats as any)?.totalValue || products?.reduce((sum, product) => sum + (product.price * product.stock), 0) || 0;
  const lowStockCount = (stats as any)?.lowStockCount || products?.filter(p => p.status === 'low_stock').length || 0;
  const outOfStockCount = (stats as any)?.outOfStockCount || products?.filter(p => p.status === 'out_of_stock').length || 0;
  const inStockCount = totalProducts - lowStockCount - outOfStockCount;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-64"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  // Get top products by value
  const topProducts = ((stats as any)?.topProducts || products || [])
    .map(p => ({ ...p, totalValue: p.price * p.stock }))
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 5);

  // Category distribution
  const categoryStats = (products || []).reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const statCards = [
    {
      title: 'Total Produk',
      value: totalProducts.toString(),
      icon: Package,
      description: 'Total item dalam inventory',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Nilai Total Stok',
      value: formatPrice(totalValue),
      icon: DollarSign,
      description: 'Total nilai semua stok',
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Stok Menipis',
      value: lowStockCount.toString(),
      icon: AlertTriangle,
      description: 'Produk dengan stok rendah',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Stok Habis',
      value: outOfStockCount.toString(),
      icon: XCircle,
      description: 'Produk yang habis stok',
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Statistik Inventory</h2>
        <p className="text-muted-foreground">
          Ringkasan status stok dan performa inventory {isFromApi && <Badge variant="secondary" className="ml-2">Live Data</Badge>}
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-medium transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-foreground mt-2">
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products by Value */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span>Top 5 Produk Berdasarkan Nilai</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.id || index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-primary font-bold text-sm">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.stock} unit × {formatPrice(product.price)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">
                      {formatPrice(product.totalValue)}
                    </p>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        product.status === 'in_stock' 
                          ? 'border-success text-success' 
                          : product.status === 'low_stock'
                          ? 'border-warning text-warning'
                          : 'border-destructive text-destructive'
                      }`}
                    >
                      {product.status === 'in_stock' ? 'Tersedia' : 
                       product.status === 'low_stock' ? 'Menipis' : 'Habis'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <span>Distribusi Kategori</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(categoryStats)
                .sort(([,a], [,b]) => b - a)
                .map(([category, count]) => {
                  const percentage = ((count / totalProducts) * 100).toFixed(1);
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">{category}</span>
                        <span className="text-sm text-muted-foreground">
                          {count} produk ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary rounded-full h-2 transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Status Stok</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-success/10 rounded-lg">
              <div className="w-12 h-12 bg-success rounded-full flex items-center justify-center mx-auto mb-3">
                <Package className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-success">{inStockCount}</p>
              <p className="text-sm text-muted-foreground">Produk Tersedia</p>
            </div>
            
            <div className="text-center p-4 bg-warning/10 rounded-lg">
              <div className="w-12 h-12 bg-warning rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-warning">{lowStockCount}</p>
              <p className="text-sm text-muted-foreground">Stok Menipis</p>
            </div>
            
            <div className="text-center p-4 bg-destructive/10 rounded-lg">
              <div className="w-12 h-12 bg-destructive rounded-full flex items-center justify-center mx-auto mb-3">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-destructive">{outOfStockCount}</p>
              <p className="text-sm text-muted-foreground">Stok Habis</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsOverview;