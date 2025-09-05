// Simple mock services to avoid API response wrapper issues
import { Product } from '@/types/inventory';

export const getAllProducts = async (): Promise<Product[]> => {
  // Mock data - in real app this would call API
  return [];
};

export const getProductById = async (id: string): Promise<Product> => {
  throw new Error('Not implemented');
};

export const createProduct = async (product: any): Promise<Product> => {
  throw new Error('Not implemented');
};

export const updateProduct = async (id: string, product: any): Promise<Product> => {
  throw new Error('Not implemented');
};

export const deleteProduct = async (id: string): Promise<void> => {
  throw new Error('Not implemented');
};

export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  return [];
};

export const searchProducts = async (query: string): Promise<Product[]> => {
  return [];
};

export const getLowStockProducts = async (): Promise<Product[]> => {
  return [];
};

export const getOutOfStockProducts = async (): Promise<Product[]> => {
  return [];
};

export const updateProductStock = async (id: string, stock: number): Promise<Product> => {
  throw new Error('Not implemented');
};

export default {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  searchProducts,
  getLowStockProducts,
  getOutOfStockProducts,
  updateProductStock,
};