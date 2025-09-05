export interface Product {
  id: string;
  name: string;
  category: string;
  sku: string;
  productCode: string;
  price: number;
  stock: number;
  minStock: number;
  description?: string;
  image?: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  location?: string;
  supplier?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  type: 'in' | 'out';
  quantity: number;
  reason: string;
  date: Date;
  userId: string;
}

export interface InventoryStats {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  topProducts: Product[];
}