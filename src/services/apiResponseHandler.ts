import { ApiResponse } from './apiClient';

export interface StandardApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Handles different API response formats and normalizes them
 */
export const handleApiResponse = <T>(response: any): StandardApiResponse<T> => {
  // If already in correct format
  if (response && typeof response.success === 'boolean') {
    return response as StandardApiResponse<T>;
  }

  // Handle direct data responses (legacy)
  if (response && !response.hasOwnProperty('success')) {
    return {
      success: true,
      data: response as T,
      message: 'Success'
    };
  }

  // Handle error responses
  if (response && response.error) {
    return {
      success: false,
      error: response.error,
      message: response.message || 'Operation failed'
    };
  }

  // Default success response
  return {
    success: true,
    data: response as T,
  };
};

/**
 * Wrapper for API calls with standardized error handling
 */
export const safeApiCall = async <T>(
  apiCall: () => Promise<any>,
  errorMessage = 'Operation failed'
): Promise<StandardApiResponse<T>> => {
  try {
    const response = await apiCall();
    return handleApiResponse<T>(response);
  } catch (error) {
    console.error('API call failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : errorMessage,
      message: errorMessage
    };
  }
};