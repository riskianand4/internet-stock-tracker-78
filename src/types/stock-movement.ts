export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  reference?: string; // Order ID, Transfer ID, etc.
  location: string;
  warehouse?: string;
  userId: string;
  userName: string;
  timestamp: Date;
  cost?: number;
  unitPrice?: number;
  supplier?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface StockAlert {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  type: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCK' | 'EXPIRING';
  currentStock: number;
  threshold: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

export interface StockVelocity {
  productId: string;
  productName: string;
  productCode: string;
  averageDailyUsage: number;
  averageWeeklyUsage: number;
  averageMonthlyUsage: number;
  velocity: 'FAST' | 'MEDIUM' | 'SLOW' | 'DEAD';
  daysOfSupply: number;
  reorderPoint: number;
  lastMovementDate: Date;
  totalMovements: number;
}

export interface CostAnalysis {
  productId: string;
  productName: string;
  totalCost: number;
  averageCost: number;
  currentValue: number;
  profit: number;
  profitMargin: number;
  turnoverRate: number;
  carryingCost: number;
  lastCostUpdate: Date;
}

export interface SupplierPerformance {
  supplierId: string;
  supplierName: string;
  totalOrders: number;
  onTimeDeliveries: number;
  onTimePercentage: number;
  averageLeadTime: number;
  qualityRating: number;
  totalValue: number;
  lastOrderDate: Date;
  activeProducts: number;
}