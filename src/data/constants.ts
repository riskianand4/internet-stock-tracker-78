// Constants that will be replaced with API data later

export const PRODUCT_VELOCITY = [
  { productId: '1', name: 'Product A', dailyMovement: 10, daysUntilOutOfStock: 15, turnoverRate: 12 },
  { productId: '2', name: 'Product B', dailyMovement: 8, daysUntilOutOfStock: 25, turnoverRate: 8 },
  { productId: '3', name: 'Product C', dailyMovement: 15, daysUntilOutOfStock: 8, turnoverRate: 20 },
  { productId: '4', name: 'Product D', dailyMovement: 5, daysUntilOutOfStock: 45, turnoverRate: 4 },
  { productId: '5', name: 'Product E', dailyMovement: 12, daysUntilOutOfStock: 20, turnoverRate: 10 },
];

export const DUMMY_PRODUCTS = [
  { id: '1', name: 'Product A', category: 'Electronics', price: 1000000, stock: 150 },
  { id: '2', name: 'Product B', category: 'Electronics', price: 1500000, stock: 200 },
  { id: '3', name: 'Product C', category: 'Electronics', price: 2000000, stock: 120 },
  { id: '4', name: 'Product D', category: 'Furniture', price: 500000, stock: 80 },
  { id: '5', name: 'Product E', category: 'Furniture', price: 750000, stock: 240 },
];

export const STOCK_ALERTS = [
  { 
    id: '1', 
    type: 'critical', 
    message: 'Product A stock is critically low', 
    priority: 'high',
    actionRequired: true,
    product: { name: 'Product A', sku: 'PA001' },
    timestamp: new Date().toISOString()
  },
  { 
    id: '2', 
    type: 'warning', 
    message: 'Product B is out of stock', 
    priority: 'critical',
    actionRequired: true,
    product: { name: 'Product B', sku: 'PB002' },
    timestamp: new Date().toISOString()
  },
  { 
    id: '3', 
    type: 'info', 
    message: 'Time to reorder Product C', 
    priority: 'medium',
    actionRequired: false,
    product: { name: 'Product C', sku: 'PC003' },
    timestamp: new Date().toISOString()
  },
];