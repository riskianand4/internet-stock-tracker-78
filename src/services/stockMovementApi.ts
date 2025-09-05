import { StockMovement, StockAlert, CostAnalysis, StockVelocity, SupplierPerformance } from '@/types/stock-movement';
import { apiClient } from './apiClient';
import { handleApiResponse, safeApiCall } from './apiResponseHandler';

export const getStockMovements = async (filters?: any): Promise<StockMovement[]> => {
  const result = await safeApiCall(async () => {
    const queryParams = filters ? new URLSearchParams(filters).toString() : '';
    const response = await apiClient.get(`/api/stock/movements${queryParams ? `?${queryParams}` : ''}`);
    return response.data || [];
  });
  
  return result.success ? (result.data as StockMovement[]) : [];
};

export const createStockMovement = async (movement: any): Promise<StockMovement> => {
  const result = await safeApiCall(async () => {
    const response = await apiClient.post('/api/stock/movements', movement);
    return response.data;
  });
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to create stock movement');
  }
  return result.data as StockMovement;
};

export const updateStockMovement = async (id: string, movement: any): Promise<StockMovement> => {
  const result = await safeApiCall(async () => {
    const response = await apiClient.put(`/api/stock/movements/${id}`, movement);
    return response.data;
  });
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to update stock movement');
  }
  return result.data as StockMovement;
};

export const deleteStockMovement = async (id: string): Promise<void> => {
  const result = await safeApiCall(async () => {
    await apiClient.delete(`/api/stock/movements/${id}`);
  });
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to delete stock movement');
  }
};

export const getStockAlerts = async (filters?: any): Promise<StockAlert[]> => {
  const result = await safeApiCall(async () => {
    const queryParams = filters ? new URLSearchParams(filters).toString() : '';
    const response = await apiClient.get(`/api/alerts${queryParams ? `?${queryParams}` : ''}`);
    return response.data || [];
  });
  
  return result.success ? (result.data as StockAlert[]) : [];
};

export const createStockAlert = async (alert: any): Promise<StockAlert> => {
  const result = await safeApiCall(async () => {
    const response = await apiClient.post('/api/alerts', alert);
    return response.data;
  });
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to create stock alert');
  }
  return result.data as StockAlert;
};

export const acknowledgeStockAlert = async (id: string): Promise<StockAlert> => {
  const result = await safeApiCall(async () => {
    const response = await apiClient.patch(`/api/alerts/${id}/acknowledge`);
    return response.data;
  });
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to acknowledge alert');
  }
  return result.data as StockAlert;
};

export const updateStockAlert = async (id: string, alert: any): Promise<StockAlert> => {
  const result = await safeApiCall(async () => {
    const response = await apiClient.put(`/api/alerts/${id}`, alert);
    return response.data;
  });
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to update stock alert');
  }
  return result.data as StockAlert;
};

export const deleteStockAlert = async (id: string): Promise<void> => {
  const result = await safeApiCall(async () => {
    await apiClient.delete(`/api/alerts/${id}`);
  });
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to delete stock alert');
  }
};

export const getAlertStats = async (): Promise<any> => {
  const result = await safeApiCall(async () => {
    const response = await apiClient.get('/api/alerts/stats');
    return response.data;
  });
  
  return result.success ? result.data : {
    overview: { total: 0, unacknowledged: 0, critical: 0, high: 0, medium: 0, low: 0, resolved: 0 },
    breakdown: []
  };
};

export const getCostAnalysis = async (filters?: any): Promise<CostAnalysis[]> => {
  const result = await safeApiCall(async () => {
    const queryParams = filters ? new URLSearchParams(filters).toString() : '';
    const response = await apiClient.get(`/api/analytics/cost-analysis${queryParams ? `?${queryParams}` : ''}`);
    return response.data || [];
  });
  
  return result.success ? (result.data as CostAnalysis[]) : [];
};

export const getStockVelocityAnalysis = async (filters?: any): Promise<StockVelocity[]> => {
  const result = await safeApiCall(async () => {
    const queryParams = filters ? new URLSearchParams(filters).toString() : '';
    const response = await apiClient.get(`/api/analytics/stock-velocity${queryParams ? `?${queryParams}` : ''}`);
    return response.data || [];
  });
  
  return result.success ? (result.data as StockVelocity[]) : [];
};

export const getSupplierPerformance = async (filters?: any): Promise<SupplierPerformance[]> => {
  const result = await safeApiCall(async () => {
    const queryParams = filters ? new URLSearchParams(filters).toString() : '';
    const response = await apiClient.get(`/api/analytics/supplier-performance${queryParams ? `?${queryParams}` : ''}`);
    return response.data || [];
  });
  
  return result.success ? (result.data as SupplierPerformance[]) : [];
};

// Default export for compatibility
export const stockMovementApi = {
  getStockMovements,
  createStockMovement,
  updateStockMovement,
  deleteStockMovement,
  getStockAlerts,
  createStockAlert,
  acknowledgeStockAlert,
  updateStockAlert,
  deleteStockAlert,
  getAlertStats,
  getCostAnalysis,
  getStockVelocity: getStockVelocityAnalysis, // Add alias for compatibility
  getStockVelocityAnalysis,
  getSupplierPerformance,
};

export default stockMovementApi;