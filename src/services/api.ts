// Legacy API compatibility layer
import { apiClient } from './apiClient';

// Re-export for backward compatibility
export { apiClient as apiService };
export default apiClient;