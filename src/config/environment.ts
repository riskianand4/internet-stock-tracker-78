// Environment configuration for frontend
interface EnvironmentConfig {
  API_BASE_URL: string;
  IS_DEVELOPMENT: boolean;
  VERSION: string;
}

const getEnvironmentConfig = (): EnvironmentConfig => {
  // Default to development values if not configured
  const isDevelopment = import.meta.env.MODE === 'development';
  
  // Ensure consistent port usage between frontend and backend
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
  
  return {
    API_BASE_URL: baseURL,
    IS_DEVELOPMENT: isDevelopment,
    VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  };
};

export const ENV = getEnvironmentConfig();

export const API_ENDPOINTS = {
  HEALTH: '/health',
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    VERIFY: '/api/auth/verify',
  },
  PRODUCTS: '/api/products',
  ANALYTICS: '/api/analytics',
  STOCK: '/api/stock',
  ASSETS: '/api/assets',
  USERS: '/api/users',
  REPORTS: '/api/reports',
  AI: '/api/ai',
  EXTERNAL: {
    PRODUCTS: '/api/external/products',
    ANALYTICS: '/api/external/analytics',
    HEALTH: '/api/external/health',
    DOCS: '/api/external/docs',
  },
} as const;

export default ENV;