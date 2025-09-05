import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useHybridProducts } from '@/hooks/useHybridData';
import { useCategoryAnalysis } from '@/hooks/useAnalyticsData';
import { formatCurrency, formatNumber } from '@/lib/formatters';
import { TimeFilter, DateRange } from '../AdvancedStatsOverview';

interface CategoryAnalysisProps {
  timeFilter: TimeFilter;
  dateRange: DateRange;
}

const CategoryAnalysis = ({ timeFilter, dateRange }: CategoryAnalysisProps) => {
  const { data: products, isLoading: productsLoading, isFromApi: productsFromApi } = useHybridProducts();
  const { data: categoryTrends, isLoading: trendsLoading, isFromApi: trendsFromApi } = useCategoryAnalysis();
  
  const categoryData = useMemo(() => {
    if (!products || products.length === 0) return [];
    // Calculate category statistics
    interface CategoryStat {
      name: string;
      count: number;
      totalValue: number;
      totalStock: number;
      lowStockCount: number;
      outOfStockCount: number;
    }
    
    const categoryStats: Record<string, CategoryStat> = products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = {
          name: product.category,
          count: 0,
          totalValue: 0,
          totalStock: 0,
          lowStockCount: 0,
          outOfStockCount: 0
        };
      }
      
      acc[product.category].count++;
      acc[product.category].totalValue += product.price * product.stock;
      acc[product.category].totalStock += product.stock;
      
      if (product.status === 'low_stock') acc[product.category].lowStockCount++;
      if (product.status === 'out_of_stock') acc[product.category].outOfStockCount++;
      
      return acc;
    }, {} as Record<string, CategoryStat>);
    
    const totalValue = Object.values(categoryStats).reduce((sum, cat) => sum + cat.totalValue, 0);
    
    return Object.values(categoryStats).map((cat, index) => ({
      ...cat,
      percentage: ((cat.totalValue / Math.max(totalValue, 1)) * 100).toFixed(1),
      color: `hsl(${index * 90}, 70%, 50%)`,
      healthScore: Math.max(0, 100 - (cat.lowStockCount * 10) - (cat.outOfStockCount * 20))
    }));
  }, [products]);

  const trendData = useMemo(() => {
    const trends = categoryTrends || [];
    if (!Array.isArray(trends)) return [];
    
    return trends.slice(-7).map(item => ({
      ...item,
      formattedDate: new Date(item.date).toLocaleDateString('id-ID', { 
        day: '2-digit', 
        month: 'short' 
      })
    }));
  }, [categoryTrends]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((item: any, index: number) => (
            <p key={index} style={{ color: item.color }} className="text-sm">
              {item.name}: {
                item.dataKey === 'totalValue' || item.dataKey === 'value' ? 
                  formatCurrency(item.value) : 
                  formatNumber(item.value)
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (productsLoading || trendsLoading) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle>Analisis Kategori Produk</CardTitle>
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
          <div className="w-2 h-6 bg-accent rounded-full" />
          Analisis Kategori Produk
          {(productsFromApi || trendsFromApi) && (
            <Badge variant="secondary" className="text-xs bg-success/20 text-success ml-auto">
              Live Data
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="distribution" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="distribution">Distribusi Nilai</TabsTrigger>
            <TabsTrigger value="performance">Performa Kategori</TabsTrigger>
            <TabsTrigger value="trends">Tren Kategori</TabsTrigger>
          </TabsList>

          <TabsContent value="distribution" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pie Chart */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-80"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="totalValue"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Category Details */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                {categoryData.map((category, index) => (
                  <div key={category.name} className="p-4 rounded-lg border bg-card/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium text-sm">{category.name}</span>
                      </div>
                      <Badge variant="secondary">{category.percentage}%</Badge>
                    </div>
                    
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Produk: {category.count}</span>
                        <span>Nilai: {formatCurrency(category.totalValue)}</span>
                      </div>
                      <Progress 
                        value={parseFloat(category.percentage)} 
                        className="h-1"
                        style={{
                          background: `${category.color}20`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar 
                    dataKey="count" 
                    fill="hsl(var(--primary))" 
                    name="Jumlah Produk"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="healthScore" 
                    fill="hsl(var(--success))" 
                    name="Health Score"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="formattedDate" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => formatCurrency(value).replace('Rp', 'Rp ')}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar 
                    dataKey="value" 
                    fill="hsl(var(--accent))" 
                    name="Nilai Kategori"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CategoryAnalysis;