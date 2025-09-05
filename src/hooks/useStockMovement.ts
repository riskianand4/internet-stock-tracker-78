import { useState, useEffect, useCallback } from 'react';
import { StockMovement } from '@/types/stock-movement';
import { stockMovementApi } from '@/services/stockMovementApi';
import { useToast } from '@/hooks/use-toast';
import { useApi } from '@/contexts/ApiContext';

export const useStockMovement = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { isConfigured, isOnline } = useApi();

  const fetchMovements = useCallback(async () => {
    if (!isConfigured || !isOnline) {
      setMovements([]);
      return;
    }

    setLoading(true);
    try {
      const data = await stockMovementApi.getStockMovements();
      setMovements(data);
    } catch (error) {
      console.error('Failed to fetch stock movements:', error);
      toast({
        title: "Error",
        description: "Failed to fetch stock movements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [isConfigured, isOnline, toast]);

  const addMovement = useCallback(async (movement: Omit<StockMovement, 'id' | 'timestamp'>) => {
    setLoading(true);
    try {
      const newMovement: StockMovement = {
        ...movement,
        id: `mov-${Date.now()}`,
        timestamp: new Date()
      };
      
      setMovements(prev => [newMovement, ...prev]);
      
      toast({
        title: "Stock Movement Recorded",
        description: `${movement.type} movement for ${movement.productName} recorded successfully`,
      });
      
      return newMovement;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record stock movement",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateMovement = useCallback(async (updatedMovement: StockMovement) => {
    setLoading(true);
    try {
      setMovements(prev => 
        prev.map(movement => 
          movement.id === updatedMovement.id ? updatedMovement : movement
        )
      );
      
      toast({
        title: "Stock Movement Updated",
        description: `Movement for ${updatedMovement.productName} updated successfully`,
      });
      
      return updatedMovement;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update stock movement",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteMovement = useCallback(async (movementId: string) => {
    setLoading(true);
    try {
      setMovements(prev => prev.filter(movement => movement.id !== movementId));
      
      toast({
        title: "Stock Movement Deleted",
        description: "Movement deleted successfully",
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete stock movement",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getMovementsByProduct = useCallback((productId: string) => {
    return movements.filter(movement => movement.productId === productId);
  }, [movements]);

  const getMovementsByType = useCallback((type: StockMovement['type']) => {
    return movements.filter(movement => movement.type === type);
  }, [movements]);

  const getMovementsByDateRange = useCallback((startDate: Date, endDate: Date) => {
    return movements.filter(movement => 
      movement.timestamp >= startDate && movement.timestamp <= endDate
    );
  }, [movements]);

  const getMovementStats = useCallback(() => {
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const weekMovements = getMovementsByDateRange(lastWeek, today);
    const monthMovements = getMovementsByDateRange(lastMonth, today);

    return {
      total: movements.length,
      thisWeek: weekMovements.length,
      thisMonth: monthMovements.length,
      inMovements: movements.filter(m => m.type === 'IN').length,
      outMovements: movements.filter(m => m.type === 'OUT').length,
      adjustments: movements.filter(m => m.type === 'ADJUSTMENT').length,
      transfers: movements.filter(m => m.type === 'TRANSFER').length,
    };
  }, [movements, getMovementsByDateRange]);

  return {
    movements,
    loading,
    addMovement,
    updateMovement,
    deleteMovement,
    getMovementsByProduct,
    getMovementsByType,
    getMovementsByDateRange,
    getMovementStats,
  };
};