interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  additionalData?: Record<string, any>;
}

interface AppError {
  message: string;
  code?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: ErrorContext;
  originalError?: Error;
  timestamp: Date;
}

class ErrorHandler {
  private errors: AppError[] = [];
  private readonly MAX_ERRORS = 100;

  logError(error: Error | string, context?: ErrorContext, severity: AppError['severity'] = 'medium'): AppError {
    const appError: AppError = {
      message: typeof error === 'string' ? error : error.message,
      code: error instanceof Error ? error.name : undefined,
      severity,
      context,
      originalError: error instanceof Error ? error : undefined,
      timestamp: new Date(),
    };

    this.errors.unshift(appError);
    
    // Limit array size
    if (this.errors.length > this.MAX_ERRORS) {
      this.errors = this.errors.slice(0, this.MAX_ERRORS);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('App Error:', appError);
    }

    // Report critical errors
    if (severity === 'critical') {
      this.reportCriticalError(appError);
    }

    return appError;
  }

  private reportCriticalError(error: AppError): void {
    // In production, this would send to error reporting service
    console.error('CRITICAL ERROR:', error);
  }

  getErrors(limit?: number): AppError[] {
    return limit ? this.errors.slice(0, limit) : [...this.errors];
  }

  clearErrors(): void {
    this.errors = [];
  }

  getErrorStats() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const recentErrors = this.errors.filter(e => now - e.timestamp.getTime() < oneHour);

    return {
      total: this.errors.length,
      recentHour: recentErrors.length,
      critical: recentErrors.filter(e => e.severity === 'critical').length,
      high: recentErrors.filter(e => e.severity === 'high').length,
    };
  }
}

export const errorHandler = new ErrorHandler();

// Helper functions for common error scenarios
export const handleApiError = (error: Error, endpoint: string, action: string) => {
  return errorHandler.logError(error, {
    component: 'API',
    action: `${action} - ${endpoint}`,
  }, 'high');
};

export const handleComponentError = (error: Error, component: string, action?: string) => {
  return errorHandler.logError(error, {
    component,
    action,
  }, 'medium');
};

export const handleDataError = (error: Error, dataType: string, operation: string) => {
  return errorHandler.logError(error, {
    component: 'DataLayer',
    action: `${operation} ${dataType}`,
  }, 'high');
};

// User-friendly error messages
export const getDisplayError = (error: AppError | Error | string): string => {
  if (typeof error === 'string') return error;
  
  if (error instanceof Error) {
    // Map common error types to user-friendly messages
    if (error.message.includes('Failed to fetch')) {
      return 'Network connection issue. Please check your internet connection.';
    }
    if (error.message.includes('Rate limit')) {
      return 'Too many requests. Please wait a moment and try again.';
    }
    if (error.message.includes('Unauthorized')) {
      return 'Authentication failed. Please check your credentials.';
    }
    return 'An unexpected error occurred. Please try again.';
  }

  if ('message' in error) {
    return getDisplayError(error.message);
  }

  return 'An unexpected error occurred. Please try again.';
};