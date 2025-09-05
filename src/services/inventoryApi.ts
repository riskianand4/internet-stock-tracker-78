// Legacy inventory API compatibility layer
import { apiClient } from './apiClient';

export class InventoryApiService {
  async healthCheck() {
    try {
      const response = await apiClient.healthCheck();
      console.log('🩺 Health check response:', response);
      
      // Backend returns {status: "OK", timestamp: "...", uptime: ..., version: "..."} 
      // ApiClient wraps it in ApiResponse format
      const isHealthy = response && (
        response.success === true || 
        (response as any).status === 'OK'
      );
      
      return {
        success: isHealthy,
        data: response,
        message: isHealthy ? 'Backend is healthy' : 'Backend health check failed'
      };
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Health check failed',
        message: 'Cannot connect to backend'
      };
    }
  }

  async getProducts(params?: any) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    
    console.log('🔄 Fetching products from API:', `/api/products${queryString}`);
    
    try {
      const response = await apiClient.get(`/api/products${queryString}`);
      console.log('📦 Raw API response:', response);
      
      // Backend returns { success: true, data: [...], pagination: {...} }
      if (response && response.success && response.data && Array.isArray(response.data)) {
        console.log('✅ Processing', response.data.length, 'products from API');
        
        const products = (response.data as any[]).map((product: any) => ({
          id: product.id || product._id,
          name: product.name,
          sku: product.sku,
          productCode: product.sku, // Use SKU as product code
          category: product.category,
          price: product.price,
          stock: product.stock?.current || product.stock || 0,
          minStock: product.stock?.minimum || product.minStock || 0,
          maxStock: product.stock?.maximum || product.maxStock || 0,
          status: product.stockStatus || product.status || 'active',
          description: product.description || '',
          location: product.location?.warehouse || product.location || '',
          supplier: product.supplier?.name || product.supplier || '',
          unit: product.unit || 'pcs',
          barcode: product.barcode || '',
          tags: product.tags || [],
          costPrice: product.costPrice || 0,
          profitMargin: product.profitMargin || 0,
          images: product.images || [],
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        }));
        
        console.log('🎯 Transformed products:', products);
        
        return {
          success: true,
          data: products,
          pagination: (response as any).pagination
        };
      }
      
      console.warn('⚠️ Unexpected response format:', response);
      return {
        success: false,
        data: [],
        error: 'Invalid response format'
      };
      
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Failed to fetch products'
      };
    }
  }

  async createProduct(data: any) {
    const response = await apiClient.post('/api/products', data);
    return response;
  }

  async updateProduct(id: string, data: any) {
    const response = await apiClient.put(`/api/products/${id}`, data);
    return response;
  }

  async deleteProduct(id: string) {
    const response = await apiClient.delete(`/api/products/${id}`);
    return response;
  }

  async getAnalyticsOverview() {
    const response = await apiClient.get('/api/analytics/overview');
    return response;
  }

  async getAnalyticsTrends(params?: any) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    const response = await apiClient.get(`/api/analytics/trends${queryString}`);
    return response;
  }

  async getCategoryAnalysis(params?: any) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    const response = await apiClient.get(`/api/analytics/category-analysis${queryString}`);
    return response;
  }

  async getStockVelocity(params?: any) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    const response = await apiClient.get(`/api/analytics/stock-velocity${queryString}`);
    return response;
  }

  async getSmartInsights(params?: any) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    const response = await apiClient.get(`/api/analytics/insights${queryString}`);
    return response;
  }

  async getStockAlerts() {
    const response = await apiClient.get('/api/analytics/alerts');
    return response;
  }

  async getStockMovements(params?: any) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    const response = await apiClient.get(`/api/stock/movements${queryString}`);
    return response;
  }

  async getInventoryStats() {
    const response = await apiClient.get('/api/analytics/overview');
    return response;
  }

  setToken(token: string | null) {
    apiClient.setToken(token);
  }

  getToken() {
    return apiClient.getToken();
  }

  // Generic request methods for compatibility across hooks/services
  async request(endpoint: string) {
    return apiClient.get(endpoint);
  }
  async get(endpoint: string) {
    return apiClient.get(endpoint);
  }
  async post(endpoint: string, data?: any) {
    return apiClient.post(endpoint, data);
  }
  async put(endpoint: string, data?: any) {
    return apiClient.put(endpoint, data);
  }
  async delete(endpoint: string) {
    return apiClient.delete(endpoint);
  }
}

export const initializeApiService = () => new InventoryApiService();
export const getApiService = () => new InventoryApiService();
export default InventoryApiService;