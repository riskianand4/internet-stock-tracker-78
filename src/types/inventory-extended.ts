export interface StockMovement {
  id: string;
  productId: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  reference?: string;
  date: Date;
  userId: string;
  userName: string;
  notes?: string;
  location: string;
}

export interface StockAlert {
  id: string;
  productId: string;
  productName: string;
  type: 'low_stock' | 'out_of_stock' | 'expired' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  threshold?: number;
  currentValue?: number;
  date: Date;
  isRead: boolean;
  isResolved: boolean;
}

export interface InventoryAudit {
  id: string;
  date: Date;
  type: 'full' | 'cycle' | 'spot';
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  location: string;
  auditorId: string;
  auditorName: string;
  expectedItems: number;
  actualItems: number;
  discrepancies: number;
  notes?: string;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  capacity: number;
  currentOccupancy: number;
  managerId: string;
  status: 'active' | 'inactive' | 'maintenance';
}