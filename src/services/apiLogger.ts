interface ApiLogEntry {
  id: string;
  timestamp: Date;
  method: string;
  endpoint: string;
  statusCode: number;
  responseTime: number;
  apiKeyName: string;
  ipAddress: string;
  userAgent: string;
  requestSize?: number;
  responseSize?: number;
  error?: string;
}

interface SecurityEvent {
  id: string;
  timestamp: Date;
  type: 'rate_limit_exceeded' | 'invalid_api_key' | 'unauthorized_access' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  ipAddress: string;
  apiKeyName?: string;
  metadata: Record<string, any>;
}

class ApiLogger {
  private logs: ApiLogEntry[] = [];
  private securityEvents: SecurityEvent[] = [];
  private rateLimitTracker: Map<string, { count: number; resetTime: number }> = new Map();
  private readonly MAX_LOGS = 1000;
  private readonly MAX_SECURITY_EVENTS = 500;

  constructor() {
    this.loadFromStorage();
    // Cleanup old entries every hour
    setInterval(() => this.cleanup(), 60 * 60 * 1000);
  }

  private loadFromStorage(): void {
    try {
      const savedLogs = localStorage.getItem('api-logs');
      if (savedLogs) {
        const parsed = JSON.parse(savedLogs);
        this.logs = parsed.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }));
      }

      const savedEvents = localStorage.getItem('security-events');
      if (savedEvents) {
        const parsed = JSON.parse(savedEvents);
        this.securityEvents = parsed.map((event: any) => ({
          ...event,
          timestamp: new Date(event.timestamp)
        }));
      }
    } catch (error) {
      console.error('Failed to load API logs from storage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('api-logs', JSON.stringify(this.logs));
      localStorage.setItem('security-events', JSON.stringify(this.securityEvents));
    } catch (error) {
      console.error('Failed to save API logs to storage:', error);
    }
  }

  private cleanup(): void {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    
    // Keep only last 24 hours of logs
    this.logs = this.logs.filter(log => log.timestamp.getTime() > oneDayAgo);
    
    // Keep only last 7 days of security events
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    this.securityEvents = this.securityEvents.filter(event => event.timestamp.getTime() > oneWeekAgo);
    
    // Limit array sizes
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(-this.MAX_LOGS);
    }
    
    if (this.securityEvents.length > this.MAX_SECURITY_EVENTS) {
      this.securityEvents = this.securityEvents.slice(-this.MAX_SECURITY_EVENTS);
    }
    
    this.saveToStorage();
  }

  logApiRequest(
    method: string,
    endpoint: string,
    statusCode: number,
    responseTime: number,
    apiKeyName: string = 'Unknown',
    options: {
      requestSize?: number;
      responseSize?: number;
      error?: string;
    } = {}
  ): void {
    const logEntry: ApiLogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      method: method.toUpperCase(),
      endpoint,
      statusCode,
      responseTime,
      apiKeyName,
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent,
      ...options
    };

    this.logs.unshift(logEntry);
    
    // Check for potential security issues
    this.checkForSecurityIssues(logEntry);
    
    // Limit array size
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(0, this.MAX_LOGS);
    }
    
    this.saveToStorage();
  }

  logSecurityEvent(
    type: SecurityEvent['type'],
    severity: SecurityEvent['severity'],
    description: string,
    metadata: Record<string, any> = {},
    apiKeyName?: string
  ): void {
    const event: SecurityEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type,
      severity,
      description,
      ipAddress: this.getClientIP(),
      apiKeyName,
      metadata
    };

    this.securityEvents.unshift(event);
    
    // Limit array size
    if (this.securityEvents.length > this.MAX_SECURITY_EVENTS) {
      this.securityEvents = this.securityEvents.slice(0, this.MAX_SECURITY_EVENTS);
    }
    
    this.saveToStorage();
    
    // Trigger alerts for high/critical severity events
    if (severity === 'high' || severity === 'critical') {
      this.triggerSecurityAlert(event);
    }
  }

  private checkForSecurityIssues(log: ApiLogEntry): void {
    // Check for failed authentication
    if (log.statusCode === 401) {
      this.logSecurityEvent(
        'invalid_api_key',
        'medium',
        `Failed authentication attempt on ${log.endpoint}`,
        { method: log.method, endpoint: log.endpoint },
        log.apiKeyName
      );
    }

    // Check for potential abuse (too many requests)
    if (log.statusCode === 429) {
      this.logSecurityEvent(
        'rate_limit_exceeded',
        'medium',
        `Rate limit exceeded for ${log.apiKeyName}`,
        { endpoint: log.endpoint, method: log.method },
        log.apiKeyName
      );
    }

    // Check for server errors
    if (log.statusCode >= 500) {
      this.logSecurityEvent(
        'suspicious_activity',
        'low',
        `Server error on ${log.endpoint}`,
        { statusCode: log.statusCode, error: log.error },
        log.apiKeyName
      );
    }

    // Check for unusual response times
    if (log.responseTime > 5000) {
      this.logSecurityEvent(
        'suspicious_activity',
        'low',
        `Unusually slow response time: ${log.responseTime}ms`,
        { endpoint: log.endpoint, responseTime: log.responseTime },
        log.apiKeyName
      );
    }
  }

  private triggerSecurityAlert(event: SecurityEvent): void {
    // In a real implementation, this would send notifications
    console.warn('Security Alert:', event);
    
    // Could integrate with notification services here
    // For now, we'll just store it and let the UI handle display
  }

  private getClientIP(): string {
    // In a real browser environment, we can't get the real IP
    // This would be handled by the backend in a real implementation
    return '192.168.1.' + Math.floor(Math.random() * 255);
  }

  checkRateLimit(apiKeyName: string, limit: number = 1000): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const hourInMs = 60 * 60 * 1000;
    const resetTime = Math.ceil(now / hourInMs) * hourInMs;
    
    const tracker = this.rateLimitTracker.get(apiKeyName);
    
    if (!tracker || tracker.resetTime <= now) {
      // Reset or initialize rate limit
      this.rateLimitTracker.set(apiKeyName, { count: 1, resetTime });
      return { allowed: true, remaining: limit - 1, resetTime };
    }
    
    if (tracker.count >= limit) {
      // Rate limit exceeded
      this.logSecurityEvent(
        'rate_limit_exceeded',
        'medium',
        `Rate limit exceeded for API key: ${apiKeyName}`,
        { limit, count: tracker.count },
        apiKeyName
      );
      return { allowed: false, remaining: 0, resetTime: tracker.resetTime };
    }
    
    // Increment counter
    tracker.count++;
    this.rateLimitTracker.set(apiKeyName, tracker);
    
    return { allowed: true, remaining: limit - tracker.count, resetTime: tracker.resetTime };
  }

  getLogs(filters: {
    startDate?: Date;
    endDate?: Date;
    method?: string;
    statusCode?: number;
    apiKeyName?: string;
    limit?: number;
  } = {}): ApiLogEntry[] {
    let filteredLogs = [...this.logs];
    
    if (filters.startDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.startDate!);
    }
    
    if (filters.endDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.endDate!);
    }
    
    if (filters.method) {
      filteredLogs = filteredLogs.filter(log => log.method === filters.method!.toUpperCase());
    }
    
    if (filters.statusCode) {
      filteredLogs = filteredLogs.filter(log => log.statusCode === filters.statusCode!);
    }
    
    if (filters.apiKeyName) {
      filteredLogs = filteredLogs.filter(log => log.apiKeyName.includes(filters.apiKeyName!));
    }
    
    if (filters.limit) {
      filteredLogs = filteredLogs.slice(0, filters.limit);
    }
    
    return filteredLogs;
  }

  getSecurityEvents(filters: {
    startDate?: Date;
    endDate?: Date;
    type?: SecurityEvent['type'];
    severity?: SecurityEvent['severity'];
    limit?: number;
  } = {}): SecurityEvent[] {
    let filteredEvents = [...this.securityEvents];
    
    if (filters.startDate) {
      filteredEvents = filteredEvents.filter(event => event.timestamp >= filters.startDate!);
    }
    
    if (filters.endDate) {
      filteredEvents = filteredEvents.filter(event => event.timestamp <= filters.endDate!);
    }
    
    if (filters.type) {
      filteredEvents = filteredEvents.filter(event => event.type === filters.type!);
    }
    
    if (filters.severity) {
      filteredEvents = filteredEvents.filter(event => event.severity === filters.severity!);
    }
    
    if (filters.limit) {
      filteredEvents = filteredEvents.slice(0, filters.limit);
    }
    
    return filteredEvents;
  }

  getStats(timeRange: 'hour' | 'day' | 'week' = 'day') {
    const now = Date.now();
    const ranges = {
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000
    };
    
    const cutoff = now - ranges[timeRange];
    const recentLogs = this.logs.filter(log => log.timestamp.getTime() > cutoff);
    const recentEvents = this.securityEvents.filter(event => event.timestamp.getTime() > cutoff);
    
    return {
      totalRequests: recentLogs.length,
      successfulRequests: recentLogs.filter(log => log.statusCode < 400).length,
      failedRequests: recentLogs.filter(log => log.statusCode >= 400).length,
      averageResponseTime: recentLogs.length > 0 
        ? recentLogs.reduce((sum, log) => sum + log.responseTime, 0) / recentLogs.length 
        : 0,
      securityEvents: recentEvents.length,
      criticalEvents: recentEvents.filter(event => event.severity === 'critical').length,
      topEndpoints: this.getTopEndpoints(recentLogs),
      statusCodeDistribution: this.getStatusCodeDistribution(recentLogs)
    };
  }

  private getTopEndpoints(logs: ApiLogEntry[]) {
    const endpointCounts = logs.reduce((acc, log) => {
      acc[log.endpoint] = (acc[log.endpoint] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(endpointCounts)
      .map(([endpoint, count]) => ({ endpoint, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private getStatusCodeDistribution(logs: ApiLogEntry[]) {
    const statusCounts = logs.reduce((acc, log) => {
      acc[log.statusCode] = (acc[log.statusCode] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    return Object.entries(statusCounts)
      .map(([code, count]) => ({ code: parseInt(code), count }))
      .sort((a, b) => b.count - a.count);
  }

  exportLogs(format: 'json' | 'csv' = 'json', filters: any = {}) {
    const logs = this.getLogs(filters);
    
    if (format === 'csv') {
      const headers = ['timestamp', 'method', 'endpoint', 'statusCode', 'responseTime', 'apiKeyName', 'ipAddress'];
      const csvContent = [
        headers.join(','),
        ...logs.map(log => [
          log.timestamp.toISOString(),
          log.method,
          log.endpoint,
          log.statusCode,
          log.responseTime,
          log.apiKeyName,
          log.ipAddress
        ].join(','))
      ].join('\n');
      
      return csvContent;
    }
    
    return JSON.stringify(logs, null, 2);
  }
}

// Singleton instance
export const apiLogger = new ApiLogger();
