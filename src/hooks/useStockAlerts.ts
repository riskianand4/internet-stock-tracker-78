import { useState, useEffect, useCallback } from 'react';
import { StockAlert } from '@/types/stock-movement';
import { stockMovementApi } from '@/services/stockMovementApi';
import { useToast } from '@/hooks/use-toast';
import { useApi } from '@/contexts/ApiContext';

export const useStockAlerts = () => {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { isConfigured, isOnline } = useApi();

  const fetchAlerts = useCallback(async () => {
    if (!isConfigured || !isOnline) {
      setAlerts([]);
      return;
    }

    setLoading(true);
    try {
      const data = await stockMovementApi.getStockAlerts();
      setAlerts(data);
    } catch (error) {
      console.error('Failed to fetch stock alerts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch stock alerts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [isConfigured, isOnline, toast]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const acknowledgeAlert = useCallback(async (alertId: string, acknowledgedBy: string) => {
    setLoading(true);
    try {
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? {
              ...alert,
              acknowledged: true,
              acknowledgedBy,
              acknowledgedAt: new Date()
            }
          : alert
      ));

      toast({
        title: "Alert Acknowledged",
        description: "Stock alert has been acknowledged successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to acknowledge alert",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createAlert = useCallback(async (alert: Omit<StockAlert, 'id' | 'timestamp'>) => {
    setLoading(true);
    try {
      const newAlert: StockAlert = {
        ...alert,
        id: `alert-${Date.now()}`,
        timestamp: new Date()
      };
      
      setAlerts(prev => [newAlert, ...prev]);
      
      // Show toast notification for critical alerts
      if (alert.severity === 'CRITICAL') {
        toast({
          title: "Critical Stock Alert",
          description: alert.message,
          variant: "destructive",
        });
      }
      
      return newAlert;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create stock alert",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getUnacknowledgedAlerts = useCallback(() => {
    return alerts.filter(alert => !alert.acknowledged);
  }, [alerts]);

  const getAlertsBySeverity = useCallback((severity: StockAlert['severity']) => {
    return alerts.filter(alert => alert.severity === severity);
  }, [alerts]);

  const getCriticalAlerts = useCallback(() => {
    return getAlertsBySeverity('CRITICAL').filter(alert => !alert.acknowledged);
  }, [getAlertsBySeverity]);

  const getAlertStats = useCallback(() => {
    const unacknowledged = getUnacknowledgedAlerts();
    return {
      total: alerts.length,
      unacknowledged: unacknowledged.length,
      critical: getCriticalAlerts().length,
      high: getAlertsBySeverity('HIGH').filter(a => !a.acknowledged).length,
      medium: getAlertsBySeverity('MEDIUM').filter(a => !a.acknowledged).length,
      low: getAlertsBySeverity('LOW').filter(a => !a.acknowledged).length,
    };
  }, [alerts, getUnacknowledgedAlerts, getCriticalAlerts, getAlertsBySeverity]);

  // Auto-generate alerts based on stock levels (simulation)
  useEffect(() => {
    const checkStockLevels = () => {
      // This would normally check against real inventory data
      // For now, we simulate with mock data
    };

    const interval = setInterval(checkStockLevels, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [createAlert]);

  return {
    alerts,
    loading,
    acknowledgeAlert,
    createAlert,
    getUnacknowledgedAlerts,
    getAlertsBySeverity,
    getCriticalAlerts,
    getAlertStats,
  };
};