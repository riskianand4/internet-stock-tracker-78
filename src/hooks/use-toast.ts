import { toast as sonnerToast } from 'sonner';

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

type ToastFunction = (options: ToastOptions | string) => void;

// Legacy useToast hook for backward compatibility
export const useToast = (): { toast: ToastFunction } => ({
  toast: (options: ToastOptions | string) => {
    if (typeof options === 'string') {
      return sonnerToast(options);
    }

    const { title, description, variant, duration } = options;
    const message = title || description || 'Notification';
    
    if (variant === 'destructive') {
      return sonnerToast.error(message, {
        description: title && description ? description : undefined,
        duration,
      });
    }
    
    return sonnerToast.success(message, {
      description: title && description ? description : undefined,
      duration,
    });
  }
});

export const toast: ToastFunction = (options: ToastOptions | string) => {
  if (typeof options === 'string') {
    return sonnerToast(options);
  }

  const { title, description, variant, duration } = options;
  const message = title || description || 'Notification';
  
  if (variant === 'destructive') {
    return sonnerToast.error(message, {
      description: title && description ? description : undefined,
      duration,
    });
  }
  
  return sonnerToast.success(message, {
    description: title && description ? description : undefined,
    duration,
  });
};
