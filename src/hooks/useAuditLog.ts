import React, { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

export type AuditAction = 
  | 'CREATE' | 'READ' | 'UPDATE' | 'DELETE'
  | 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED'
  | 'EXPORT' | 'IMPORT' | 'BULK_UPDATE'
  | 'STOCK_ADJUSTMENT' | 'PRICE_CHANGE'
  | 'API_REQUEST' | 'API_ERROR'
  | 'CONFIG_CHANGE' | 'PERMISSION_CHANGE';

const useAuditLog = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLogEntry[]>(() => {
    // Load existing logs from localStorage
    const saved = localStorage.getItem('audit_logs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp),
        }));
      } catch (error) {
        console.error('Failed to load audit logs:', error);
        return [];
      }
    }
    return [];
  });

  // Save logs to localStorage whenever they change
  React.useEffect(() => {
    try {
      localStorage.setItem('audit_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to save audit logs:', error);
    }
  }, [logs]);

  const logAction = useCallback((
    action: AuditAction,
    resource: string,
    details: Record<string, any> = {},
    resourceId?: string
  ) => {
    if (!user) {
      console.warn('Cannot log action: user not authenticated');
      return;
    }

    const logEntry: AuditLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id || 'unknown',
      userName: user.name || 'Unknown User',
      userRole: user.role || 'user',
      action,
      resource,
      resourceId,
      details,
      timestamp: new Date(),
      ipAddress: 'localhost', // In a real app, this would come from server
      userAgent: navigator.userAgent,
      sessionId: sessionStorage.getItem('session_id') || 'no-session',
    };

    setLogs(prevLogs => [logEntry, ...prevLogs.slice(0, 999)]); // Keep last 1000 logs

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Audit Log:', logEntry);
    }

  }, [user]);

  // Specific logging functions for common actions
  const logProductAction = useCallback((
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    productId: string,
    productName: string,
    changes?: Record<string, any>
  ) => {
    logAction(action, 'product', {
      productName,
      changes,
    }, productId);
  }, [logAction]);

  const logStockMovement = useCallback((
    movementType: string,
    productId: string,
    productName: string,
    quantity: number,
    reason: string
  ) => {
    logAction('STOCK_ADJUSTMENT', 'inventory', {
      movementType,
      productName,
      quantity,
      reason,
    }, productId);
  }, [logAction]);

  const logBulkOperation = useCallback((
    operation: string,
    affectedProducts: number,
    details: Record<string, any>
  ) => {
    logAction('BULK_UPDATE', 'products', {
      operation,
      affectedProductsCount: affectedProducts,
      ...details,
    });
  }, [logAction]);

  const logApiRequest = useCallback((
    method: string,
    endpoint: string,
    statusCode: number,
    responseTime: number,
    error?: string
  ) => {
    const action = statusCode >= 400 ? 'API_ERROR' : 'API_REQUEST';
    logAction(action, 'api', {
      method,
      endpoint,
      statusCode,
      responseTime,
      error,
    });
  }, [logAction]);

  const logLogin = useCallback((success: boolean, reason?: string) => {
    logAction(success ? 'LOGIN' : 'LOGIN_FAILED', 'auth', {
      success,
      reason,
    });
  }, [logAction]);

  const logExport = useCallback((
    exportType: string,
    recordCount: number,
    format: string
  ) => {
    logAction('EXPORT', 'data', {
      exportType,
      recordCount,
      format,
    });
  }, [logAction]);

  // Filter and search functions
  const getLogsByUser = useCallback((userId: string) => {
    return logs.filter(log => log.userId === userId);
  }, [logs]);

  const getLogsByAction = useCallback((action: AuditAction) => {
    return logs.filter(log => log.action === action);
  }, [logs]);

  const getLogsByResource = useCallback((resource: string) => {
    return logs.filter(log => log.resource === resource);
  }, [logs]);

  const getLogsByDateRange = useCallback((startDate: Date, endDate: Date) => {
    return logs.filter(log => 
      log.timestamp >= startDate && log.timestamp <= endDate
    );
  }, [logs]);

  const searchLogs = useCallback((query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return logs.filter(log =>
      log.action.toLowerCase().includes(lowercaseQuery) ||
      log.resource.toLowerCase().includes(lowercaseQuery) ||
      log.userName.toLowerCase().includes(lowercaseQuery) ||
      JSON.stringify(log.details).toLowerCase().includes(lowercaseQuery)
    );
  }, [logs]);

  // Statistics
  const getAuditStats = useCallback(() => {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const todayLogs = logs.filter(log => 
      log.timestamp >= yesterday && log.timestamp <= today
    );

    const weekLogs = logs.filter(log => 
      log.timestamp >= lastWeek && log.timestamp <= today
    );

    const errorLogs = logs.filter(log => 
      log.action === 'API_ERROR' || log.action === 'LOGIN_FAILED'
    );

    const actionCounts = logs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalLogs: logs.length,
      todayLogs: todayLogs.length,
      weekLogs: weekLogs.length,
      errorLogs: errorLogs.length,
      actionCounts,
      mostActiveUsers: getMostActiveUsers(),
      recentActivity: logs.slice(0, 10),
    };
  }, [logs]);

  const getMostActiveUsers = useCallback(() => {
    const userCounts = logs.reduce((acc, log) => {
      const key = `${log.userId}-${log.userName}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(userCounts)
      .map(([userInfo, count]) => {
        const [userId, userName] = userInfo.split('-');
        return { userId, userName, actionCount: count };
      })
      .sort((a, b) => b.actionCount - a.actionCount)
      .slice(0, 5);
  }, [logs]);

  // Clean up old logs (keep only last 30 days)
  const cleanupOldLogs = useCallback(() => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const filteredLogs = logs.filter(log => log.timestamp >= thirtyDaysAgo);
    setLogs(filteredLogs);
  }, [logs]);

  // Export logs
  const exportLogs = useCallback((format: 'json' | 'csv' = 'json') => {
    let content: string;
    let mimeType: string;
    let extension: string;

    if (format === 'csv') {
      const headers = [
        'Timestamp', 'User', 'Role', 'Action', 'Resource', 
        'Resource ID', 'Details', 'IP Address'
      ];
      
      const rows = logs.map(log => [
        log.timestamp.toISOString(),
        log.userName,
        log.userRole,
        log.action,
        log.resource,
        log.resourceId || '',
        JSON.stringify(log.details),
        log.ipAddress || ''
      ]);

      content = [headers, ...rows]
        .map(row => row.map(cell => `\"${cell}\"`).join(','))
        .join('\n');
      
      mimeType = 'text/csv';
      extension = 'csv';
    } else {
      content = JSON.stringify(logs, null, 2);
      mimeType = 'application/json';
      extension = 'json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.${extension}`;
    link.click();
    URL.revokeObjectURL(url);

    // Log the export action
    logExport('audit_logs', logs.length, format);
  }, [logs, logExport]);

  return {
    logs,
    logAction,
    logProductAction,
    logStockMovement,
    logBulkOperation,
    logApiRequest,
    logLogin,
    logExport,
    getLogsByUser,
    getLogsByAction,
    getLogsByResource,
    getLogsByDateRange,
    searchLogs,
    getAuditStats,
    cleanupOldLogs,
    exportLogs,
  };
};

export default useAuditLog;
