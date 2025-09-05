import { useState, useEffect, useCallback } from 'react';
import { StockAlert } from '@/types/stock-movement';
import { stockMovementApi } from '@/services/stockMovementApi';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';

export const useStockAlerts = () => {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { config } = useApp();
  const isConfigured = config.apiEnabled;
  const isOnline = config.apiEnabled;

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
    if (!isConfigured || !isOnline) {
      toast({
        title: "API Not Available",
        description: "Cannot acknowledge alert - API connection required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const updatedAlert = await stockMovementApi.acknowledgeStockAlert(alertId);
      
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
  }, [isConfigured, isOnline, toast]);

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

  // Get API-based alert stats when available
  const getApiAlertStats = useCallback(async () => {
    if (!isConfigured || !isOnline) {
      return getAlertStats();
    }

    try {
      const apiStats = await stockMovementApi.getAlertStats();
      return apiStats.overview || getAlertStats();
    } catch (error) {
      console.error('Failed to fetch API alert stats:', error);
      return getAlertStats();
    }
  }, [isConfigured, isOnline, getAlertStats]);

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
    getApiAlertStats,
  };
};