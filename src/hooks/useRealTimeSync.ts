// Simplified real-time sync using new connection monitor
import { useConnectionMonitor } from './useConnectionMonitor';

export const useRealTimeSync = (options: any = {}) => {
  const { connectionStatus, metrics } = useConnectionMonitor();

  return {
    syncStatus: connectionStatus.isOnline ? 'success' : 'error',
    lastSyncTime: connectionStatus.lastCheck,
    errorCount: metrics.consecutiveFailures,
    manualSync: async () => true,
    isRealTimeEnabled: connectionStatus.isOnline,
    lastKnownGoodData: null,
    consecutiveErrors: metrics.consecutiveFailures,
  };
};