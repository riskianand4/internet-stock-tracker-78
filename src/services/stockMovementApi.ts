import { StockMovement, StockAlert, CostAnalysis, StockVelocity, SupplierPerformance } from '@/types/stock-movement';

export const getStockMovements = async (filters?: any): Promise<StockMovement[]> => {
  return [];
};

export const createStockMovement = async (movement: any): Promise<StockMovement> => {
  throw new Error('Not implemented');
};

export const updateStockMovement = async (id: string, movement: any): Promise<StockMovement> => {
  throw new Error('Not implemented');
};

export const deleteStockMovement = async (id: string): Promise<void> => {
  throw new Error('Not implemented');
};

export const getStockAlerts = async (): Promise<StockAlert[]> => {
  return [];
};

export const createStockAlert = async (alert: any): Promise<StockAlert> => {
  throw new Error('Not implemented');
};

export const updateStockAlert = async (id: string, alert: any): Promise<StockAlert> => {
  throw new Error('Not implemented');
};

export const deleteStockAlert = async (id: string): Promise<void> => {
  throw new Error('Not implemented');
};

export const getCostAnalysis = async (filters?: any): Promise<CostAnalysis[]> => {
  return [];
};

export const getStockVelocityAnalysis = async (filters?: any): Promise<StockVelocity[]> => {
  return [];
};

export const getSupplierPerformance = async (filters?: any): Promise<SupplierPerformance[]> => {
  return [];
};

// Default export for compatibility
export const stockMovementApi = {
  getStockMovements,
  createStockMovement,
  updateStockMovement,
  deleteStockMovement,
  getStockAlerts,
  createStockAlert,
  updateStockAlert,
  deleteStockAlert,
  getCostAnalysis,
  getStockVelocity: getStockVelocityAnalysis, // Add alias for compatibility
  getStockVelocityAnalysis,
  getSupplierPerformance,
};

export default stockMovementApi;