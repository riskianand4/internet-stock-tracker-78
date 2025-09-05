import { useState, useCallback } from 'react';
import { Product } from '@/types/inventory';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';
import { safeApiCall } from '@/services/apiResponseHandler';

export const useEnhancedProductManager = () => {
  const { apiService, isConfigured, isOnline } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  // Fetch products with proper error handling
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await safeApiCall<Product[]>(
        () => apiService.getProducts(),
        'Failed to fetch products'
      );

      if (response.success && response.data) {
        setProducts(response.data);
        return response.data;
      } else {
        // Fallback to localStorage
        const saved = localStorage.getItem('products');
        const localProducts = saved ? JSON.parse(saved) : [];
        setProducts(localProducts);
        return localProducts;
      }
    } catch (error) {
      console.error('Error fetching products:', error);
        toast.error('Failed to fetch products. Using local data.');
      
      // Fallback to localStorage
      const saved = localStorage.getItem('products');
      const localProducts = saved ? JSON.parse(saved) : [];
      setProducts(localProducts);
      return localProducts;
    } finally {
      setIsLoading(false);
    }
  }, [apiService]);

  // Add product with enhanced error handling
  const addProduct = useCallback(async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    setIsLoading(true);
    try {
      const newProduct: Product = {
        id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
        const response = await safeApiCall(
          () => apiService.createProduct(newProduct),
          'Failed to create product'
        );

        if (response.success) {
          // Update local state
          setProducts(prev => [...prev, newProduct]);
          
          // Also save to localStorage as backup
          const currentProducts = localStorage.getItem('products');
          const productsArray = currentProducts ? JSON.parse(currentProducts) : [];
          productsArray.push(newProduct);
          localStorage.setItem('products', JSON.stringify(productsArray));

          toast.success('Product Added', {
            description: `${newProduct.name} has been added successfully`,
          });
          
          return newProduct;
        } else {
          throw new Error(response.error || 'Failed to create product');
        }
      } else {
        // Use local storage only
        const currentProducts = localStorage.getItem('products');
        const productsArray = currentProducts ? JSON.parse(currentProducts) : [];
        productsArray.push(newProduct);
        localStorage.setItem('products', JSON.stringify(productsArray));
        
        setProducts(prev => [...prev, newProduct]);

        toast.success('Product Added Locally', {
          description: `${newProduct.name} has been saved locally`,
        });

        return newProduct;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add product');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [apiService, isConfigured, isOnline]);

  // Update product with enhanced error handling
  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    setIsLoading(true);
    try {
      const updatedData = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      if (isConfigured && isOnline && apiService) {
        const response = await safeApiCall(
          () => apiService.updateProduct(id, updatedData),
          'Failed to update product'
        );

        if (response.success) {
          // Update local state
          setProducts(prev => prev.map(product => 
            product.id === id ? { ...product, ...updatedData } : product
          ));

          // Update localStorage
          const currentProducts = localStorage.getItem('products');
          const productsArray = currentProducts ? JSON.parse(currentProducts) : [];
          const productIndex = productsArray.findIndex((p: Product) => p.id === id);
          
          if (productIndex !== -1) {
            productsArray[productIndex] = { ...productsArray[productIndex], ...updatedData };
            localStorage.setItem('products', JSON.stringify(productsArray));
          }

          toast.success('Product Updated');
        } else {
          throw new Error(response.error || 'Failed to update product');
        }
      } else {
        // Local storage only
        const currentProducts = localStorage.getItem('products');
        const productsArray = currentProducts ? JSON.parse(currentProducts) : [];
        const productIndex = productsArray.findIndex((p: Product) => p.id === id);
        
        if (productIndex !== -1) {
          productsArray[productIndex] = { ...productsArray[productIndex], ...updatedData };
          localStorage.setItem('products', JSON.stringify(productsArray));
          
          setProducts(prev => prev.map(product => 
            product.id === id ? { ...product, ...updatedData } : product
          ));

          toast.success('Product Updated Locally');
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update product');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [apiService, isConfigured, isOnline]);

  // Delete product with enhanced error handling
  const deleteProduct = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      if (isConfigured && isOnline && apiService) {
        const response = await safeApiCall(
          () => apiService.deleteProduct(id),
          'Failed to delete product'
        );

        if (response.success) {
          // Update local state
          setProducts(prev => prev.filter(product => product.id !== id));

          // Update localStorage
          const currentProducts = localStorage.getItem('products');
          const productsArray = currentProducts ? JSON.parse(currentProducts) : [];
          const filteredProducts = productsArray.filter((p: Product) => p.id !== id);
          localStorage.setItem('products', JSON.stringify(filteredProducts));

          toast.success('Product Deleted');
        } else {
          throw new Error(response.error || 'Failed to delete product');
        }
      } else {
        // Local storage only
        const currentProducts = localStorage.getItem('products');
        const productsArray = currentProducts ? JSON.parse(currentProducts) : [];
        const filteredProducts = productsArray.filter((p: Product) => p.id !== id);
        localStorage.setItem('products', JSON.stringify(filteredProducts));
        
        setProducts(prev => prev.filter(product => product.id !== id));

        toast.success('Product Deleted Locally');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete product');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [apiService, isConfigured, isOnline]);

  return {
    products,
    isLoading,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    refreshProducts: fetchProducts,
  };
};