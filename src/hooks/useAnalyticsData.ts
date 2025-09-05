import { useHybridData } from '@/hooks/useHybridData';
import { useApi } from '@/contexts/ApiContext';
import type { AnalyticsOverview, TrendData, CategoryData, VelocityData, SmartInsight, StockAlert } from '@/types/analytics';

// Hook for analytics overview/KPI data
export function useAnalyticsOverview(timeFilter: string = 'month'): ReturnType<typeof useHybridData<AnalyticsOverview>> {
  return useHybridData<AnalyticsOverview>({
    localData: {
      totalProducts: 0,
      totalValue: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      stockMovements: 0,
      avgDailyMovements: 0,
      turnoverRate: 0,
      stockHealth: 100
    },
    localFunction: () => ({
      totalProducts: 0,
      totalValue: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      stockMovements: 0,
      avgDailyMovements: 0,
      turnoverRate: 0,
      stockHealth: 100
    }),
    apiFunction: async () => {
      const { getApiService } = await import('@/services/inventoryApi');
      const service = getApiService();
      if (service) {
        return service.getAnalyticsOverview();
      }
      throw new Error('API service not available');
    },
    autoRefresh: true,
  });
}

// Hook for trend analysis data
export function useAnalyticsTrends(timeFilter: string = 'month'): ReturnType<typeof useHybridData<TrendData[]>> {
  return useHybridData<TrendData[]>({
    localData: [],
    localFunction: () => [],
    apiFunction: async () => {
      const { getApiService } = await import('@/services/inventoryApi');
      const service = getApiService();
      if (service) {
        return service.getAnalyticsTrends({ timeFilter });
      }
      throw new Error('API service not available');
    },
    autoRefresh: true,
  });
}

// Hook for category analysis data
export function useCategoryAnalysis(): ReturnType<typeof useHybridData<CategoryData[]>> {
  return useHybridData<CategoryData[]>({
    localData: [],
    localFunction: () => [],
    apiFunction: async () => {
      const { getApiService } = await import('@/services/inventoryApi');
      const service = getApiService();
      if (service) {
        return service.getCategoryAnalysis();
      }
      throw new Error('API service not available');
    },
    autoRefresh: true,
  });
}

// Hook for stock velocity data
export function useStockVelocity(): ReturnType<typeof useHybridData<VelocityData[]>> {
  return useHybridData<VelocityData[]>({
    localData: [],
    localFunction: () => [],
    apiFunction: async () => {
      const { getApiService } = await import('@/services/inventoryApi');
      const service = getApiService();
      if (service) {
        return service.getStockVelocity();
      }
      throw new Error('API service not available');
    },
    autoRefresh: true,
  });
}

// Hook for stock alerts data
export function useStockAlerts(): ReturnType<typeof useHybridData<StockAlert[]>> {
  return useHybridData<StockAlert[]>({
    localData: [],
    localFunction: () => [],
    apiFunction: async () => {
      const { getApiService } = await import('@/services/inventoryApi');
      const service = getApiService();
      if (service) {
        return service.getStockAlerts();
      }
      throw new Error('API service not available');
    },
    autoRefresh: true,
  });
}

// Hook for smart insights data
export function useSmartInsights(timeFilter: string = 'month'): ReturnType<typeof useHybridData<SmartInsight[]>> {
  return useHybridData<SmartInsight[]>({
    localData: [],
    localFunction: () => [],
    apiFunction: async () => {
      const { getApiService } = await import('@/services/inventoryApi');
      const service = getApiService();
      if (service) {
        return service.getSmartInsights({ timeFilter });
      }
      throw new Error('API service not available');
    },
    autoRefresh: true,
  });
}