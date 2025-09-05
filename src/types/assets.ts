export interface Asset {
  id: string;
  name: string;
  category: string;
  code: string; // Unique asset code
  description?: string;
  image?: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  status: 'available' | 'borrowed' | 'maintenance' | 'damaged';
  location: string; // Where the asset is stored
  purchaseDate: Date;
  purchasePrice: number;
  picId?: string; // Person in charge ID
  picName?: string; // Person in charge name
  borrowedBy?: {
    userId: string;
    userName: string;
    borrowDate: Date;
    expectedReturnDate: Date;
    actualReturnDate?: Date;
    notes?: string;
  };
  maintenanceHistory: MaintenanceRecord[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MaintenanceRecord {
  id: string;
  assetId: string;
  type: 'preventive' | 'corrective' | 'inspection';
  description: string;
  cost: number;
  performedBy: string;
  performedAt: Date;
  nextMaintenanceDate?: Date;
}

export interface AssetBorrowRequest {
  assetId: string;
  borrowerUserId: string;
  borrowerUserName: string;
  expectedReturnDate: Date;
  purpose: string;
  notes?: string;
}

export interface AssetStats {
  totalAssets: number;
  totalValue: number;
  availableAssets: number;
  borrowedAssets: number;
  maintenanceAssets: number;
  assetsByCondition: Record<string, number>;
  assetsByCategory: Record<string, number>;
}