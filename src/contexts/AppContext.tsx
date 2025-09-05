import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuthManager } from "@/hooks/useAuthManager";
import { InventoryApiService } from "@/services/inventoryApi";
import { toast } from "sonner";

interface AppConfig {
  apiEnabled: boolean;
  baseURL: string;
  version: string;
}

interface ConnectionStatus {
  isOnline: boolean;
  lastCheck: Date | null;
  error: string | null;
}

interface ConnectionMetrics {
  latency: number | null;
  lastSuccessfulRequest: Date | null;
  consecutiveFailures: number;
  isHealthy: boolean;
}

interface AppContextType {
  // Auth state from useAuthManager
  user: any;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshAuth: () => Promise<boolean>;

  // App configuration
  config: AppConfig;
  setConfig: (config: Partial<AppConfig>) => void;

  // Connection status
  connectionStatus: ConnectionStatus;
  connectionMetrics: ConnectionMetrics;
  testConnection: () => Promise<boolean>;

  // Legacy compatibility properties
  apiService: any;
  isConfigured: boolean;
  isOnline: boolean;
  clearConfig: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const authManager = useAuthManager();

  const [apiService] = useState(() => new InventoryApiService());

  const [config, setConfigState] = useState<AppConfig>({
    apiEnabled: true,
    baseURL: "http://localhost:3001",
    version: "1.0.0",
  });

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isOnline: false,
    lastCheck: null,
    error: null,
  });

  const [connectionMetrics, setConnectionMetrics] = useState<ConnectionMetrics>({
    latency: null,
    lastSuccessfulRequest: null,
    consecutiveFailures: 0,
    isHealthy: false,
  });

  // Sync auth token with API service whenever auth state changes
  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    console.log('🔑 Token sync:', { 
      hasToken: !!token, 
      isAuthenticated: authManager.isAuthenticated,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'none'
    });
    
    if (token && authManager.isAuthenticated) {
      apiService.setToken(token);
      console.log('✅ Token set in API service');
    } else {
      apiService.setToken(null);
      console.log('❌ Token cleared from API service');
    }
  }, [authManager.isAuthenticated, apiService]);

  const setConfig = (newConfig: Partial<AppConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfigState(updatedConfig);
    localStorage.setItem("app-config", JSON.stringify(updatedConfig));
  };

  const testConnection = async (): Promise<boolean> => {
    if (!config.apiEnabled) return false;

    const startTime = performance.now();
    try {
      const response = await apiService.healthCheck();
      const endTime = performance.now();
      const latency = endTime - startTime;
      const isOnline = response.success;
      const now = new Date();

      setConnectionStatus({
        isOnline,
        lastCheck: now,
        error: isOnline ? null : "Health check failed",
      });

      setConnectionMetrics(prev => {
        const isHealthy = isOnline && latency < 5000;
        const consecutiveFailures = isHealthy ? 0 : prev.consecutiveFailures + 1;

        return {
          latency,
          lastSuccessfulRequest: isHealthy ? now : prev.lastSuccessfulRequest,
          consecutiveFailures,
          isHealthy,
        };
      });

      return isOnline;
    } catch (error) {
      setConnectionStatus({
        isOnline: false,
        lastCheck: new Date(),
        error: error instanceof Error ? error.message : "Connection failed",
      });

      setConnectionMetrics(prev => ({
        ...prev,
        latency: null,
        consecutiveFailures: prev.consecutiveFailures + 1,
        isHealthy: false,
      }));

      return false;
    }
  };

  const clearConfig = () => {
    setConfigState({
      apiEnabled: false,
      baseURL: "http://localhost:3001",
      version: "1.0.0",
    });
    localStorage.removeItem("app-config");
  };

  // Centralized connection monitoring - single interval for entire app
  useEffect(() => {
    if (!config.apiEnabled) return;

    // Initial test
    testConnection();

    // Set up monitoring interval - only run once every 60 seconds
    const interval = setInterval(() => {
      testConnection();
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [config.apiEnabled]);

  const value: AppContextType = {
    // Auth methods from useAuthManager
    ...authManager,

    // App configuration
    config,
    setConfig,

    // Connection status
    connectionStatus,
    connectionMetrics,
    testConnection,

    // Legacy compatibility properties
    apiService,
    isConfigured: config.apiEnabled,
    isOnline: connectionStatus.isOnline,
    clearConfig,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
