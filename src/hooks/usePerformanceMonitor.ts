import { useState, useEffect, useCallback, useRef } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  networkRequests: number;
  errorCount: number;
  userInteractions: number;
  pageLoadTime: number;
  timeToInteractive: number;
}

interface PerformanceAlert {
  type: 'warning' | 'error';
  metric: keyof PerformanceMetrics;
  value: number;
  threshold: number;
  message: string;
  timestamp: Date;
}

const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    networkRequests: 0,
    errorCount: 0,
    userInteractions: 0,
    pageLoadTime: 0,
    timeToInteractive: 0,
  });

  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  
  const renderStartTime = useRef<number>(0);
  const interactionCount = useRef<number>(0);
  const networkRequestCount = useRef<number>(0);
  const errorCount = useRef<number>(0);

  // Performance thresholds
  const thresholds = {
    renderTime: 16, // 60fps = 16.67ms per frame
    memoryUsage: 50, // MB
    networkRequests: 10, // per minute
    errorCount: 5, // per session
    pageLoadTime: 3000, // 3 seconds
    timeToInteractive: 5000, // 5 seconds
  };

  // Start monitoring render performance
  const startRenderMonitoring = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);

  // End monitoring render performance
  const endRenderMonitoring = useCallback(() => {
    if (renderStartTime.current > 0) {
      const renderTime = performance.now() - renderStartTime.current;
      
      setMetrics(prev => ({ ...prev, renderTime }));
      
      if (renderTime > thresholds.renderTime) {
        addAlert('warning', 'renderTime', renderTime, thresholds.renderTime, 
          `Slow render detected: ${renderTime.toFixed(2)}ms`);
      }
      
      renderStartTime.current = 0;
    }
  }, []);

  // Monitor memory usage
  const monitorMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryUsage = memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
      
      setMetrics(prev => ({ ...prev, memoryUsage }));
      
      if (memoryUsage > thresholds.memoryUsage) {
        addAlert('warning', 'memoryUsage', memoryUsage, thresholds.memoryUsage,
          `High memory usage detected: ${memoryUsage.toFixed(2)}MB`);
      }
    }
  }, []);

  // Track network requests
  const trackNetworkRequest = useCallback(() => {
    networkRequestCount.current++;
    setMetrics(prev => ({ ...prev, networkRequests: networkRequestCount.current }));
  }, []);

  // Track errors
  const trackError = useCallback((error: Error) => {
    errorCount.current++;
    setMetrics(prev => ({ ...prev, errorCount: errorCount.current }));
    
    if (errorCount.current > thresholds.errorCount) {
      addAlert('error', 'errorCount', errorCount.current, thresholds.errorCount,
        `High error rate detected: ${errorCount.current} errors`);
    }
    
    console.error('Performance Monitor - Error tracked:', error);
  }, []);

  // Track user interactions
  const trackUserInteraction = useCallback(() => {
    interactionCount.current++;
    setMetrics(prev => ({ ...prev, userInteractions: interactionCount.current }));
  }, []);

  // Add performance alert
  const addAlert = useCallback((
    type: 'warning' | 'error',
    metric: keyof PerformanceMetrics,
    value: number,
    threshold: number,
    message: string
  ) => {
    const alert: PerformanceAlert = {
      type,
      metric,
      value,
      threshold,
      message,
      timestamp: new Date(),
    };
    
    setAlerts(prev => [alert, ...prev.slice(0, 19)]); // Keep only last 20 alerts
  }, []);

  // Measure page load performance
  const measurePageLoad = useCallback(() => {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        const pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
        const timeToInteractive = navigation.domInteractive - navigation.fetchStart;
        
        setMetrics(prev => ({
          ...prev,
          pageLoadTime,
          timeToInteractive,
        }));
        
        if (pageLoadTime > thresholds.pageLoadTime) {
          addAlert('warning', 'pageLoadTime', pageLoadTime, thresholds.pageLoadTime,
            `Slow page load: ${pageLoadTime.toFixed(0)}ms`);
        }
        
        if (timeToInteractive > thresholds.timeToInteractive) {
          addAlert('warning', 'timeToInteractive', timeToInteractive, thresholds.timeToInteractive,
            `Slow time to interactive: ${timeToInteractive.toFixed(0)}ms`);
        }
      }
    }
  }, []);

  // Monitor Web Vitals
  const monitorWebVitals = useCallback(() => {
    // First Contentful Paint (FCP)
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
          const fcp = entry.startTime;
          if (fcp > 1800) { // 1.8s threshold for FCP
            addAlert('warning', 'pageLoadTime', fcp, 1800,
              `Slow First Contentful Paint: ${fcp.toFixed(0)}ms`);
          }
        }
        
        // Largest Contentful Paint (LCP)
        if (entry.entryType === 'largest-contentful-paint') {
          const lcp = entry.startTime;
          if (lcp > 2500) { // 2.5s threshold for LCP
            addAlert('warning', 'pageLoadTime', lcp, 2500,
              `Slow Largest Contentful Paint: ${lcp.toFixed(0)}ms`);
          }
        }
      }
    });
    
    observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
    
    return () => observer.disconnect();
  }, []);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    
    // Set up interval for memory monitoring
    const memoryInterval = setInterval(monitorMemoryUsage, 5000); // Every 5 seconds
    
    // Monitor page load performance
    measurePageLoad();
    
    // Monitor Web Vitals
    const webVitalsCleanup = monitorWebVitals();
    
    // Set up global error tracking
    const handleError = (event: ErrorEvent) => {
      trackError(new Error(event.message));
    };
    
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackError(new Error(event.reason));
    };
    
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    // Track user interactions
    const handleInteraction = () => trackUserInteraction();
    ['click', 'keydown', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, handleInteraction, { passive: true });
    });
    
    return () => {
      clearInterval(memoryInterval);
      webVitalsCleanup();
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      ['click', 'keydown', 'scroll', 'touchstart'].forEach(event => {
        document.removeEventListener(event, handleInteraction);
      });
    };
  }, [monitorMemoryUsage, measurePageLoad, monitorWebVitals, trackError, trackUserInteraction]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  // Get performance score (0-100)
  const getPerformanceScore = useCallback(() => {
    let score = 100;
    
    // Deduct points for poor metrics
    if (metrics.renderTime > thresholds.renderTime) {
      score -= Math.min(30, (metrics.renderTime - thresholds.renderTime) / 2);
    }
    
    if (metrics.memoryUsage > thresholds.memoryUsage) {
      score -= Math.min(25, (metrics.memoryUsage - thresholds.memoryUsage) / 2);
    }
    
    if (metrics.pageLoadTime > thresholds.pageLoadTime) {
      score -= Math.min(25, (metrics.pageLoadTime - thresholds.pageLoadTime) / 100);
    }
    
    if (metrics.errorCount > 0) {
      score -= Math.min(20, metrics.errorCount * 4);
    }
    
    return Math.max(0, Math.round(score));
  }, [metrics]);

  // Get performance grade (A-F)
  const getPerformanceGrade = useCallback(() => {
    const score = getPerformanceScore();
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }, [getPerformanceScore]);

  // Export performance report
  const exportReport = useCallback(() => {
    const report = {
      timestamp: new Date().toISOString(),
      metrics,
      alerts,
      score: getPerformanceScore(),
      grade: getPerformanceGrade(),
      thresholds,
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `performance-report-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [metrics, alerts, getPerformanceScore, getPerformanceGrade]);

  // Clear alerts
  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Auto-start monitoring on mount
  useEffect(() => {
    const cleanup = startMonitoring();
    return cleanup;
  }, [startMonitoring]);

  return {
    metrics,
    alerts,
    isMonitoring,
    startRenderMonitoring,
    endRenderMonitoring,
    trackNetworkRequest,
    trackError,
    trackUserInteraction,
    getPerformanceScore,
    getPerformanceGrade,
    startMonitoring,
    stopMonitoring,
    exportReport,
    clearAlerts,
    thresholds,
  };
};

export default usePerformanceMonitor;