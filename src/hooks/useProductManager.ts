import { useState, useCallback } from 'react';
import { useHybridData } from '@/hooks/useHybridData';
import { useApi } from '@/contexts/ApiContext';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  sku: string;
  productCode: string;
  category: string;
  price: number;
  stock: number;
  minStock: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  description?: string;
  location?: string;
  supplier?: string;
  createdAt: string;
  updatedAt: string;
}

export const useProductManager = () => {
  const { apiService, isConfigured, isOnline } = useApi();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Get products using hybrid approach
  const { 
    data: products, 
    refresh: refreshProducts,
    isFromApi 
  } = useHybridData<Product[]>({
    localData: [],
    localFunction: () => {
      const saved = localStorage.getItem('products');
      return saved ? JSON.parse(saved) : [];
    },
    apiFunction: async () => {
      if (!apiService) throw new Error('API service not available');
      return await apiService.getProducts();
    },
    autoRefresh: true,
  });

  const addProduct = useCallback(async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    setIsLoading(true);
    try {
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        ...productData,
        status: productData.stock <= productData.minStock 
          ? 'low_stock' 
          : productData.stock === 0 
          ? 'out_of_stock' 
          : 'in_stock',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (isConfigured && isOnline && apiService) {
        // Use API
        await apiService.createProduct(newProduct);
      } else {
        // Use local storage
        const currentProducts = localStorage.getItem('products');
        const productsArray = currentProducts ? JSON.parse(currentProducts) : [];
        productsArray.push(newProduct);
        localStorage.setItem('products', JSON.stringify(productsArray));
      }

      await refreshProducts();
      
      toast({
        title: 'Product Added',
        description: `${newProduct.name} has been added successfully`,
      });

      return newProduct;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add product. Please try again.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [apiService, isConfigured, isOnline, refreshProducts, toast]);

  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    setIsLoading(true);
    try {
      if (isConfigured && isOnline && apiService) {
        await apiService.updateProduct(id, updates);
      } else {
        const currentProducts = localStorage.getItem('products');
        const productsArray = currentProducts ? JSON.parse(currentProducts) : [];
        const productIndex = productsArray.findIndex((p: Product) => p.id === id);
        
        if (productIndex !== -1) {
          productsArray[productIndex] = {
            ...productsArray[productIndex],
            ...updates,
            updatedAt: new Date().toISOString(),
          };
          localStorage.setItem('products', JSON.stringify(productsArray));
        }
      }

      await refreshProducts();
      
      toast({
        title: 'Product Updated',
        description: 'Product has been updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update product. Please try again.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [apiService, isConfigured, isOnline, refreshProducts, toast]);

  const deleteProduct = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      if (isConfigured && isOnline && apiService) {
        await apiService.deleteProduct(id);
      } else {
        const currentProducts = localStorage.getItem('products');
        const productsArray = currentProducts ? JSON.parse(currentProducts) : [];
        const filteredProducts = productsArray.filter((p: Product) => p.id !== id);
        localStorage.setItem('products', JSON.stringify(filteredProducts));
      }

      await refreshProducts();
      
      toast({
        title: 'Product Deleted',
        description: 'Product has been deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete product. Please try again.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [apiService, isConfigured, isOnline, refreshProducts, toast]);

  return {
    products,
    isLoading,
    isFromApi,
    addProduct,
    updateProduct,
    deleteProduct,
    refreshProducts,
  };
};