export interface AnalyticsOverview {
  totalProducts: number;
  totalValue: number;
  totalValueGrowth: number;
  lowStockCount: number;
  outOfStockCount: number;
  stockMovements: number;
  avgDailyMovements: number;
  turnoverRate: number;
  stockHealth: number;
}

export interface TrendData {
  date: string;
  totalProducts: number;
  totalValue: number;
  stockMovements: number;
  lowStockCount: number;
  outOfStockCount: number;
  salesCount: number;
  restockCount: number;
  formattedDate?: string;
}

export interface CategoryData {
  category: string;
  date: string;
  value: number;
  volume: number;
  trend: 'up' | 'down' | 'stable';
}

export interface VelocityData {
  productId: string;
  productName: string;
  category: string;
  dailyMovement: number;
  monthlyMovement: number;
  turnoverRate: number;
  daysUntilOutOfStock: number;
  reorderRecommended: boolean;
  seasonalIndex: number;
}

export interface SmartInsight {
  id: number;
  type: 'opportunity' | 'alert' | 'insight' | 'performance' | 'recommendation' | 'trend';
  title: string;
  message: string;
  impact: 'critical' | 'high' | 'medium' | 'low';
  timeframe: string;
  actionable: boolean;
  data?: any;
}

export interface StockAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  productId: string;
  productName: string;
  message: string;
  priority: number;
  timestamp: Date;
  actionRequired: boolean;
}