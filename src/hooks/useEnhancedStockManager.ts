import { useState, useCallback } from 'react';
import { StockMovement, StockAlert } from '@/types/stock-movement';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';
import { safeApiCall } from '@/services/apiResponseHandler';

export const useEnhancedStockManager = () => {
  const { apiService, isConfigured, isOnline } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);

  // Fetch stock movements
  const fetchStockMovements = useCallback(async (filters?: any) => {
    setIsLoading(true);
    try {
      if (isConfigured && isOnline && apiService) {
        const response = await safeApiCall<StockMovement[]>(
          () => apiService.getStockMovements(filters),
          'Failed to fetch stock movements'
        );

        if (response.success && response.data) {
          setMovements(response.data);
          // Save to localStorage as backup
          localStorage.setItem('stockMovements', JSON.stringify(response.data));
          return response.data;
        }
      }
      
      // Fallback to localStorage
      const saved = localStorage.getItem('stockMovements');
      const localMovements = saved ? JSON.parse(saved) : [];
      setMovements(localMovements);
      return localMovements;
    } catch (error) {
      console.error('Error fetching stock movements:', error);
      toast.error('Failed to fetch stock movements. Using local data.');
      
      // Fallback to localStorage
      const saved = localStorage.getItem('stockMovements');
      const localMovements = saved ? JSON.parse(saved) : [];
      setMovements(localMovements);
      return localMovements;
    } finally {
      setIsLoading(false);
    }
  }, [apiService, isConfigured, isOnline]);

  // Create stock movement
  const createStockMovement = useCallback(async (movementData: Omit<StockMovement, 'id'>) => {
    setIsLoading(true);
    try {
      const newMovement: StockMovement = {
        ...movementData,
        id: `movement-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };

      if (isConfigured && isOnline && apiService) {
        const response = await safeApiCall(
          () => apiService.post('/api/stock/movements', newMovement),
          'Failed to create stock movement'
        );

        if (response.success) {
          setMovements(prev => [newMovement, ...prev]);
          
          // Update localStorage
          const currentMovements = localStorage.getItem('stockMovements');
          const movementsArray = currentMovements ? JSON.parse(currentMovements) : [];
          movementsArray.unshift(newMovement);
          localStorage.setItem('stockMovements', JSON.stringify(movementsArray));

          toast.success(`Stock movement for ${movementData.productName} has been recorded`);
          
          return newMovement;
        } else {
          throw new Error(response.error || 'Failed to create stock movement');
        }
      } else {
        // Local storage only
        const currentMovements = localStorage.getItem('stockMovements');
        const movementsArray = currentMovements ? JSON.parse(currentMovements) : [];
        movementsArray.unshift(newMovement);
        localStorage.setItem('stockMovements', JSON.stringify(movementsArray));
        
        setMovements(prev => [newMovement, ...prev]);

        toast.success(`Stock movement for ${movementData.productName} has been saved locally`);

        return newMovement;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create stock movement');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [apiService, isConfigured, isOnline]);

  // Update stock movement
  const updateStockMovement = useCallback(async (id: string, updates: Partial<StockMovement>) => {
    setIsLoading(true);
    try {
      if (isConfigured && isOnline && apiService) {
        const response = await safeApiCall(
          () => apiService.put(`/api/stock/movements/${id}`, updates),
          'Failed to update stock movement'
        );

        if (response.success) {
          setMovements(prev => prev.map(movement => 
            movement.id === id ? { ...movement, ...updates } : movement
          ));

          // Update localStorage
          const currentMovements = localStorage.getItem('stockMovements');
          const movementsArray = currentMovements ? JSON.parse(currentMovements) : [];
          const movementIndex = movementsArray.findIndex((m: StockMovement) => m.id === id);
          
          if (movementIndex !== -1) {
            movementsArray[movementIndex] = { ...movementsArray[movementIndex], ...updates };
            localStorage.setItem('stockMovements', JSON.stringify(movementsArray));
          }

          toast.success('Stock movement has been updated successfully');
        } else {
          throw new Error(response.error || 'Failed to update stock movement');
        }
      } else {
        // Local storage only
        const currentMovements = localStorage.getItem('stockMovements');
        const movementsArray = currentMovements ? JSON.parse(currentMovements) : [];
        const movementIndex = movementsArray.findIndex((m: StockMovement) => m.id === id);
        
        if (movementIndex !== -1) {
          movementsArray[movementIndex] = { ...movementsArray[movementIndex], ...updates };
          localStorage.setItem('stockMovements', JSON.stringify(movementsArray));
          
          setMovements(prev => prev.map(movement => 
            movement.id === id ? { ...movement, ...updates } : movement
          ));

          toast.success('Stock movement has been updated locally');
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update stock movement');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [apiService, isConfigured, isOnline]);

  // Delete stock movement
  const deleteStockMovement = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      if (isConfigured && isOnline && apiService) {
        const response = await safeApiCall(
          () => apiService.delete(`/api/stock/movements/${id}`),
          'Failed to delete stock movement'
        );

        if (response.success) {
          setMovements(prev => prev.filter(movement => movement.id !== id));

          // Update localStorage
          const currentMovements = localStorage.getItem('stockMovements');
          const movementsArray = currentMovements ? JSON.parse(currentMovements) : [];
          const filteredMovements = movementsArray.filter((m: StockMovement) => m.id !== id);
          localStorage.setItem('stockMovements', JSON.stringify(filteredMovements));

          toast.success('Stock movement has been deleted successfully');
        } else {
          throw new Error(response.error || 'Failed to delete stock movement');
        }
      } else {
        // Local storage only
        const currentMovements = localStorage.getItem('stockMovements');
        const movementsArray = currentMovements ? JSON.parse(currentMovements) : [];
        const filteredMovements = movementsArray.filter((m: StockMovement) => m.id !== id);
        localStorage.setItem('stockMovements', JSON.stringify(filteredMovements));
        
        setMovements(prev => prev.filter(movement => movement.id !== id));

        toast.success('Stock movement has been deleted locally');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete stock movement');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [apiService, isConfigured, isOnline]);

  // Fetch stock alerts
  const fetchStockAlerts = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isConfigured && isOnline && apiService) {
        const response = await safeApiCall<StockAlert[]>(
          () => apiService.getStockAlerts(),
          'Failed to fetch stock alerts'
        );

        if (response.success && response.data) {
          setAlerts(response.data);
          // Save to localStorage as backup
          localStorage.setItem('stockAlerts', JSON.stringify(response.data));
          return response.data;
        }
      }
      
      // Fallback to localStorage
      const saved = localStorage.getItem('stockAlerts');
      const localAlerts = saved ? JSON.parse(saved) : [];
      setAlerts(localAlerts);
      return localAlerts;
    } catch (error) {
      console.error('Error fetching stock alerts:', error);
      toast.error('Failed to fetch stock alerts. Using local data.');
      
      // Fallback to localStorage
      const saved = localStorage.getItem('stockAlerts');
      const localAlerts = saved ? JSON.parse(saved) : [];
      setAlerts(localAlerts);
      return localAlerts;
    } finally {
      setIsLoading(false);
    }
  }, [apiService, isConfigured, isOnline]);

  return {
    movements,
    alerts,
    isLoading,
    fetchStockMovements,
    createStockMovement,
    updateStockMovement,
    deleteStockMovement,
    fetchStockAlerts,
    refreshMovements: fetchStockMovements,
    refreshAlerts: fetchStockAlerts,
  };
};