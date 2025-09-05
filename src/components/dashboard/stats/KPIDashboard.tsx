import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Package, DollarSign, AlertTriangle, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, formatNumber, calculateGrowthRate } from '@/lib/formatters';
import { TimeFilter, DateRange } from '../AdvancedStatsOverview';
import { useAnalyticsOverview } from '@/hooks/useAnalyticsData';
import type { AnalyticsOverview } from '@/types/analytics';

interface KPIDashboardProps {
  timeFilter: TimeFilter;
  dateRange: DateRange;
}

const KPIDashboard = ({ timeFilter, dateRange }: KPIDashboardProps) => {
  const { data: analytics, isLoading, isFromApi, error } = useAnalyticsOverview(timeFilter);

  // Provide default values if analytics data is not available
  const safeAnalytics: AnalyticsOverview = analytics || {
    totalProducts: 0,
    totalValue: 0,
    totalValueGrowth: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    stockMovements: 0,
    avgDailyMovements: 0,
    turnoverRate: 0,
    stockHealth: 0
  };

  const kpiCards = [
    {
      title: 'Total Produk',
      value: safeAnalytics.totalProducts,
      format: 'number',
      icon: Package,
      color: 'primary',
      subtitle: 'Produk Aktif'
    },
    {
      title: 'Nilai Total Inventori',
      value: safeAnalytics.totalValue,
      format: 'currency',
      icon: DollarSign,
      color: 'success',
      growth: safeAnalytics.totalValueGrowth,
      subtitle: `${safeAnalytics.totalValueGrowth > 0 ? 'Naik' : 'Turun'} dari periode sebelumnya`
    },
    {
      title: 'Pergerakan Stok',
      value: safeAnalytics.stockMovements,
      format: 'number',
      icon: BarChart3,
      color: 'accent',
      subtitle: `${formatNumber(safeAnalytics.avgDailyMovements)} per hari rata-rata`
    },
    {
      title: 'Status Stok',
      value: safeAnalytics.stockHealth,
      format: 'percentage',
      icon: AlertTriangle,
      color: safeAnalytics.stockHealth > 80 ? 'success' : safeAnalytics.stockHealth > 60 ? 'warning' : 'destructive',
      subtitle: `${safeAnalytics.lowStockCount} rendah, ${safeAnalytics.outOfStockCount} habis`
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {kpiCards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="relative overflow-hidden group hover-lift glass">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <card.icon className={`w-5 h-5 text-${card.color}`} />
                  {isFromApi && (
                    <Badge variant="secondary" className="text-xs bg-success/20 text-success">
                      Live
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">
                    {card.format === 'currency' ? formatCurrency(card.value) :
                     card.format === 'percentage' ? `${Math.round(card.value)}%` :
                     formatNumber(card.value)}
                  </span>
                  {card.growth !== undefined && (
                    <Badge 
                      variant={card.growth > 0 ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {card.growth > 0 ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {Math.abs(card.growth)}%
                    </Badge>
                  )}
                </div>
                
                {card.format === 'percentage' && (
                  <Progress 
                    value={card.value} 
                    className={`h-2 bg-${card.color}-light`}
                  />
                )}
                
                <p className="text-xs text-muted-foreground">
                  {card.subtitle}
                </p>
              </div>
            </CardContent>
            
            {/* Hover effect overlay */}
            <div className={`absolute inset-0 bg-${card.color}/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default KPIDashboard;