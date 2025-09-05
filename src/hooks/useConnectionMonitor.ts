// Simplified hook that just returns connection data from AppContext
// No more intervals or monitoring - everything is centralized in AppContext
import { useApp } from '@/contexts/AppContext';

export const useConnectionMonitor = () => {
  const { connectionStatus, connectionMetrics, testConnection } = useApp();

  return {
    connectionStatus,
    metrics: connectionMetrics,
    testConnection,
    measureLatency: async () => connectionMetrics.latency,
  };
};