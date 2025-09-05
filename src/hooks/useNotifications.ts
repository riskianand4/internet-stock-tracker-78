import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  variant?: 'default' | 'destructive' | 'outline';
}

const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  // Load notifications from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setNotifications(parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        })));
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    }
  }, []);

  // Save notifications to localStorage when they change
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  const addNotification = useCallback((
    type: Notification['type'],
    title: string,
    message: string,
    actions?: NotificationAction[]
  ) => {
    const notification: Notification = {
      id: `notif-${Date.now()}-${Math.random()}`,
      type,
      title,
      message,
      timestamp: new Date(),
      read: false,
      actions,
    };

    setNotifications(prev => [notification, ...prev]);

    // Also show as toast for immediate feedback
    toast({
      title,
      description: message,
      variant: type === 'error' ? 'destructive' : 'default',
    });

    return notification.id;
  }, [toast]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Stock alert notifications
  const notifyStockAlert = useCallback((productName: string, currentStock: number, minStock: number) => {
    const severity = currentStock === 0 ? 'error' : 'warning';
    const title = currentStock === 0 ? 'Out of Stock Alert' : 'Low Stock Alert';
    const message = currentStock === 0 
      ? `${productName} is out of stock!`
      : `${productName} is running low (${currentStock}/${minStock} remaining)`;

    return addNotification(severity, title, message, [
      {
        label: 'View Product',
        action: () => {
          // This would navigate to the product details
          console.log('Navigate to product:', productName);
        },
      },
      {
        label: 'Reorder',
        action: () => {
          // This would open reorder dialog
          console.log('Reorder product:', productName);
        },
        variant: 'default',
      },
    ]);
  }, [addNotification]);

  // API error notifications
  const notifyApiError = useCallback((operation: string, error: string) => {
    return addNotification(
      'error',
      'API Error',
      `Failed to ${operation}: ${error}`,
      [
        {
          label: 'Retry',
          action: () => {
            // This would retry the failed operation
            console.log('Retry operation:', operation);
          },
        },
      ]
    );
  }, [addNotification]);

  // Success notifications
  const notifySuccess = useCallback((title: string, message: string) => {
    return addNotification('success', title, message);
  }, [addNotification]);

  // Info notifications
  const notifyInfo = useCallback((title: string, message: string) => {
    return addNotification('info', title, message);
  }, [addNotification]);

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    // Specific notification helpers
    notifyStockAlert,
    notifyApiError,
    notifySuccess,
    notifyInfo,
  };
};

export default useNotifications;