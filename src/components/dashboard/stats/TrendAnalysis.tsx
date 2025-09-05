import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatNumber } from '@/lib/formatters';
import { TimeFilter, DateRange } from '../AdvancedStatsOverview';
import { useAnalyticsTrends } from '@/hooks/useAnalyticsData';

interface TrendAnalysisProps {
  timeFilter: TimeFilter;
  dateRange: DateRange;
}

const TrendAnalysis = ({ timeFilter, dateRange }: TrendAnalysisProps) => {
  const { data: rawData, isLoading, isFromApi, error } = useAnalyticsTrends(timeFilter);
  
  const chartData = useMemo(() => {
    if (!rawData || !Array.isArray(rawData)) return [];
    
    return rawData.map(item => ({
      ...item,
      formattedDate: new Date(item.date).toLocaleDateString('id-ID', { 
        day: '2-digit', 
        month: 'short' 
      })
    }));
  }, [rawData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((item: any, index: number) => (
            <p key={index} style={{ color: item.color }} className="text-sm">
              {item.name}: {
                item.dataKey.includes('Value') ? formatCurrency(item.value) : formatNumber(item.value)
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle>Analisis Tren Inventori</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-muted animate-pulse rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-2 h-6 bg-primary rounded-full" />
          Analisis Tren Inventori
          {isFromApi && (
            <Badge variant="secondary" className="text-xs bg-success/20 text-success ml-auto">
              Live Data
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="value" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="value">Nilai Inventori</TabsTrigger>
            <TabsTrigger value="movement">Pergerakan Stok</TabsTrigger>
            <TabsTrigger value="status">Status Stok</TabsTrigger>
          </TabsList>

          <TabsContent value="value" className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
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
                  <Area 
                    type="monotone" 
                    dataKey="totalValue" 
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#valueGradient)"
                    strokeWidth={2}
                    name="Nilai Total"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </TabsContent>

          <TabsContent value="movement" className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="formattedDate" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="stockMovements" 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={2}
                    name="Total Pergerakan"
                    dot={{ fill: 'hsl(var(--accent))' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="salesCount" 
                    stroke="hsl(var(--success))" 
                    strokeWidth={2}
                    name="Penjualan"
                    dot={{ fill: 'hsl(var(--success))' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="restockCount" 
                    stroke="hsl(var(--warning))" 
                    strokeWidth={2}
                    name="Restock"
                    dot={{ fill: 'hsl(var(--warning))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          </TabsContent>

          <TabsContent value="status" className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="lowStockGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--warning))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--warning))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="outStockGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="formattedDate" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="lowStockCount" 
                    stackId="1"
                    stroke="hsl(var(--warning))" 
                    fill="url(#lowStockGradient)"
                    name="Stok Rendah"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="outOfStockCount" 
                    stackId="1"
                    stroke="hsl(var(--destructive))" 
                    fill="url(#outStockGradient)"
                    name="Stok Habis"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TrendAnalysis;