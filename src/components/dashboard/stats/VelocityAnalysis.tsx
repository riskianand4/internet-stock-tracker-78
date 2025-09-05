import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Zap, AlertTriangle, TrendingUp, Package } from 'lucide-react';
import { useHybridProducts } from '@/hooks/useHybridData';
import { useStockVelocity } from '@/hooks/useAnalyticsData';
import { formatNumber } from '@/lib/formatters';
import { TimeFilter, DateRange } from '../AdvancedStatsOverview';

interface VelocityAnalysisProps {
  timeFilter: TimeFilter;
  dateRange: DateRange;
}

const VelocityAnalysis = ({ timeFilter, dateRange }: VelocityAnalysisProps) => {
  const { data: products, isLoading: productsLoading } = useHybridProducts();
  const { data: rawVelocityData, isLoading: velocityLoading, isFromApi } = useStockVelocity();
  const [sortBy, setSortBy] = useState<'turnoverRate' | 'monthlyMovement' | 'daysUntilOutOfStock'>('turnoverRate');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const velocityData = useMemo(() => {
    const sourceData = rawVelocityData || [];
    if (!products || products.length === 0 || !Array.isArray(sourceData)) return [];
    
    // Filter by category if selected
    const filtered = filterCategory === 'all' ? 
      sourceData : 
      sourceData.filter(v => {
        const product = products.find(p => p.id === v.productId);
        return product?.category === filterCategory;
      });
    
    // Sort by selected criteria
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'turnoverRate':
          return b.turnoverRate - a.turnoverRate;
        case 'monthlyMovement':
          return b.monthlyMovement - a.monthlyMovement;
        case 'daysUntilOutOfStock':
          return a.daysUntilOutOfStock - b.daysUntilOutOfStock;
        default:
          return 0;
      }
    });
  }, [rawVelocityData, products, sortBy, filterCategory]);

  const categories = useMemo(() => {
    if (!products) return ['all'];
    const cats = Array.from(new Set(products.map(item => item.category)));
    return ['all', ...cats];
  }, [products]);

  const scatterData = useMemo(() => {
    const sourceData = rawVelocityData || [];
    if (!Array.isArray(sourceData)) return [];
    
    return sourceData.map(item => ({
      x: item.monthlyMovement,
      y: item.turnoverRate,
      z: item.daysUntilOutOfStock,
      name: item.productName,
      category: item.category,
      reorderRecommended: item.reorderRecommended
    }));
  }, [rawVelocityData]);

  const getVelocityColor = (rate: number) => {
    if (rate > 50) return 'success';
    if (rate > 20) return 'warning';
    return 'destructive';
  };

  const getDaysColor = (days: number) => {
    if (days < 7) return 'destructive';
    if (days < 14) return 'warning';
    return 'success';
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border rounded-lg p-3 shadow-lg max-w-xs">
          <p className="font-medium mb-2">{data.name}</p>
          <div className="space-y-1 text-xs">
            <p>Kategori: {data.category}</p>
            <p>Pergerakan Bulanan: {formatNumber(data.x)} unit</p>
            <p>Tingkat Turnover: {data.y.toFixed(1)}%</p>
            <p>Hari hingga Habis: {data.z} hari</p>
            {data.reorderRecommended && (
              <Badge variant="destructive" className="text-xs">
                Perlu Reorder
              </Badge>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  if (productsLoading || velocityLoading) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle>Analisis Velocity Produk</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-2 h-6 bg-success rounded-full" />
          Analisis Velocity Produk
          {isFromApi && (
            <Badge variant="secondary" className="text-xs bg-success/20 text-success ml-auto">
              Live Data
            </Badge>
          )}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {categories.slice(1).map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="turnoverRate">Turnover Rate</SelectItem>
              <SelectItem value="monthlyMovement">Pergerakan</SelectItem>
              <SelectItem value="daysUntilOutOfStock">Hari Tersisa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Scatter Plot */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="h-80"
        >
          <h3 className="text-sm font-medium mb-4">Korelasi Pergerakan vs Turnover Rate</h3>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                type="number" 
                dataKey="x" 
                name="Pergerakan Bulanan"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="Turnover Rate"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Scatter 
                name="Produk" 
                data={scatterData} 
                fill="hsl(var(--primary))"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Velocity Table */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Detail Kecepatan Produk</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {velocityData.slice(0, 10).map((item, index) => (
              <motion.div
                key={item.productId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{item.productName}</span>
                    </div>
                    {item.reorderRecommended && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Reorder
                      </Badge>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {item.category}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Turnover Rate:</span>
                      <span className={`font-medium text-${getVelocityColor(item.turnoverRate)}`}>
                        {item.turnoverRate}%
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(item.turnoverRate, 100)} 
                      className="h-1"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pergerakan/Bulan:</span>
                      <span className="font-medium">{formatNumber(item.monthlyMovement)}</span>
                    </div>
                    <Progress 
                      value={(item.monthlyMovement / 100) * 100} 
                      className="h-1"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hari Tersisa:</span>
                      <span className={`font-medium text-${getDaysColor(item.daysUntilOutOfStock)}`}>
                        {item.daysUntilOutOfStock} hari
                      </span>
                    </div>
                    <Progress 
                      value={Math.min((30 - item.daysUntilOutOfStock) / 30 * 100, 100)} 
                      className="h-1"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VelocityAnalysis;