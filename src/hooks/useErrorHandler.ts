import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { errorHandler, handleApiError, handleComponentError, getDisplayError } from '@/services/errorHandler';

export const useErrorHandler = (component?: string) => {
  const { toast } = useToast();

  const logError = useCallback((
    error: Error | string,
    action?: string,
    showToast: boolean = true
  ) => {
    const appError = handleComponentError(
      error instanceof Error ? error : new Error(error),
      component || 'Unknown',
      action
    );

    if (showToast) {
      toast({
        title: 'Error',
        description: getDisplayError(appError),
        variant: 'destructive',
      });
    }

    return appError;
  }, [component, toast]);

  const logApiError = useCallback((
    error: Error,
    endpoint: string,
    action: string,
    showToast: boolean = true
  ) => {
    const appError = handleApiError(error, endpoint, action);

    if (showToast) {
      toast({
        title: 'API Error',
        description: getDisplayError(appError),
        variant: 'destructive',
      });
    }

    return appError;
  }, [toast]);

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    action: string,
    fallback?: T
  ): Promise<T | undefined> => {
    try {
      return await asyncFn();
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), action);
      return fallback;
    }
  }, [logError]);

  return {
    logError,
    logApiError,
    handleAsyncError,
    getErrorStats: () => errorHandler.getErrorStats(),
    clearErrors: () => errorHandler.clearErrors(),
  };
};