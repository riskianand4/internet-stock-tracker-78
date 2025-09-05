export interface Order {
  id: string;
  orderNumber: string;
  type: 'purchase' | 'sales';
  supplierId?: string;
  supplierName?: string;
  customerId?: string;
  customerName?: string;
  status: 'draft' | 'pending' | 'approved' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  orderDate: Date;
  expectedDate?: Date;
  deliveredDate?: Date;
  notes?: string;
  createdBy: string;
  approvedBy?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
  paymentTerms: string;
  status: 'active' | 'inactive';
  rating: number;
  totalOrders: number;
  totalValue: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  type: 'individual' | 'corporate';
  status: 'active' | 'inactive';
  totalOrders: number;
  totalValue: number;
}