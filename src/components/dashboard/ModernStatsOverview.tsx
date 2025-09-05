import React, { useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  AlertTriangle, 
  DollarSign,
  Activity,
  Target,
  Users,
  ShoppingCart,
  Clock
} from 'lucide-react';
import { useHybridProducts } from '@/hooks/useHybridData';

const COLORS = [
  'hsl(217 100% 65%)',  // Primary
  'hsl(142 85% 50%)',   // Success
  'hsl(35 100% 60%)',   // Warning
  'hsl(0 85% 60%)',     // Destructive
  'hsl(260 80% 65%)',   // Accent
];

const ModernStatsOverview = memo(() => {
  const { data: products, isLoading, isFromApi } = useHybridProducts();
  
  const stats = useMemo(() => {
    if (!products || products.length === 0) return null;
    
    // Basic stats
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
    const averageValue = totalValue / totalProducts;
    
    // Status distribution
    const statusDistribution = [
      { name: 'Tersedia', value: products.filter(p => p.status === 'in_stock').length, color: COLORS[1] },
      { name: 'Menipis', value: products.filter(p => p.status === 'low_stock').length, color: COLORS[2] },
      { name: 'Habis', value: products.filter(p => p.status === 'out_of_stock').length, color: COLORS[3] },
    ];

    // Category distribution
    const categoryStats = products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = { count: 0, value: 0 };
      }
      acc[product.category].count += 1;
      acc[product.category].value += product.price * product.stock;
      return acc;
    }, {} as Record<string, { count: number; value: number }>);

    const categoryDistribution = Object.entries(categoryStats).map(([category, data]) => ({
      name: category,
      count: data.count,
      value: data.value,
    }));

    // Mock trend data (last 7 days)
    const trendData = Array.from({ length: 7 }, (_, i) => ({
      day: `Hari ${i + 1}`,
      stock: Math.floor(Math.random() * 100) + 50,
      sales: Math.floor(Math.random() * 50) + 20,
      revenue: Math.floor(Math.random() * 10000000) + 5000000,
    }));

    // Performance metrics
    const performanceData = [
      { metric: 'Efisiensi Stok', value: 87, target: 90 },
      { metric: 'Turnover Rate', value: 73, target: 80 },
      { metric: 'Akurasi Data', value: 94, target: 95 },
      { metric: 'Response Time', value: 82, target: 85 },
    ];

    return {
      totalProducts,
      totalValue,
      averageValue,
      statusDistribution,
      categoryDistribution,
      trendData,
      performanceData,
    };
  }, [products]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getPerformanceColor = (value: number, target: number) => {
    if (value >= target) return 'text-success bg-success/10';
    if (value >= target * 0.8) return 'text-warning bg-warning/10';
    return 'text-destructive bg-destructive/10';
  };

  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isFromApi && (
        <div className="flex justify-end">
          <Badge variant="secondary" className="text-xs bg-success/20 text-success">
            Real-time Data
          </Badge>
        </div>
      )}
      {/* KPI Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="glass hover-lift">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Produk</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">{stats.totalProducts}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-success" />
                  <span className="text-[10px] sm:text-xs text-success">+12% dari bulan lalu</span>
                </div>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-primary/10 text-primary rounded-lg lg:rounded-xl flex items-center justify-center">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Nilai</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalValue)}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span className="text-xs text-success">+8% dari bulan lalu</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-success/10 text-success rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rata-rata Nilai</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.averageValue)}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <TrendingDown className="w-4 h-4 text-warning" />
                  <span className="text-xs text-warning">-2% dari bulan lalu</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Stok Menipis</p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.statusDistribution.find(s => s.name === 'Menipis')?.value || 0}
                </p>
                <div className="flex items-center space-x-1 mt-1">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  <span className="text-xs text-warning">Perlu perhatian</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-warning/10 text-warning rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Pie Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="glass hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-primary" />
                <span>Distribusi Status Stok</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.statusDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={40}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`${value} produk`, 'Jumlah']}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))' 
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center space-x-4 mt-4">
                {stats.statusDistribution.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Distribution Bar Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="glass hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-primary" />
                <span>Distribusi Kategori</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.categoryDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`${value} produk`, 'Jumlah']}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))' 
                      }}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="hsl(217 100% 65%)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Trend Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card className="glass hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span>Analisis Tren (7 Hari Terakhir)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.trendData}>
                  <defs>
                    <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(217 100% 65%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(217 100% 65%)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142 85% 50%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(142 85% 50%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="day" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))' 
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="stock"
                    stroke="hsl(217 100% 65%)"
                    fillOpacity={1}
                    fill="url(#stockGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="hsl(142 85% 50%)"
                    fillOpacity={1}
                    fill="url(#salesGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Performance Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Card className="glass hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-primary" />
              <span>Metrik Performa</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.performanceData.map((metric, index) => (
                <motion.div
                  key={metric.metric}
                  className="space-y-2"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{metric.metric}</span>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getPerformanceColor(metric.value, metric.target)}`}
                    >
                      {metric.value}%
                    </Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full ${
                        metric.value >= metric.target 
                          ? 'bg-success' 
                          : metric.value >= metric.target * 0.8 
                            ? 'bg-warning' 
                            : 'bg-destructive'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${metric.value}%` }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Target: {metric.target}%</span>
                    <span>{metric.value >= metric.target ? '✓' : '⚠'}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
});

ModernStatsOverview.displayName = 'ModernStatsOverview';

export default ModernStatsOverview;