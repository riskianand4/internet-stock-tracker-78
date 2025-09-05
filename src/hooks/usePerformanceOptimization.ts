import { useState, useEffect, useCallback } from 'react';

interface UseOptimizedRenderOptions {
  throttleMs?: number;
  debounceMs?: number;
  enableThrottle?: boolean;
  enableDebounce?: boolean;
}

export const useOptimizedRender = (options: UseOptimizedRenderOptions = {}) => {
  const {
    throttleMs = 100,
    debounceMs = 300,
    enableThrottle = true,
    enableDebounce = false,
  } = options;

  const [lastThrottleTime, setLastThrottleTime] = useState(0);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

  // Throttle function
  const throttle = useCallback((fn: () => void) => {
    if (!enableThrottle) {
      fn();
      return;
    }

    const now = Date.now();
    if (now - lastThrottleTime >= throttleMs) {
      setLastThrottleTime(now);
      fn();
    }
  }, [lastThrottleTime, throttleMs, enableThrottle]);

  // Debounce function
  const debounce = useCallback((fn: () => void) => {
    if (!enableDebounce) {
      fn();
      return;
    }

    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const timeout = setTimeout(fn, debounceMs);
    setDebounceTimeout(timeout);
  }, [debounceMs, debounceTimeout, enableDebounce]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [debounceTimeout]);

  return { throttle, debounce };
};

// Hook for optimized scroll handling
export const useOptimizedScroll = (
  callback: (scrollTop: number, scrollHeight: number, clientHeight: number) => void,
  deps: any[] = []
) => {
  const { throttle } = useOptimizedRender({ throttleMs: 16 }); // 60fps

  const handleScroll = useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    throttle(() => {
      callback(target.scrollTop, target.scrollHeight, target.clientHeight);
    });
  }, [throttle, callback, ...deps]);

  return handleScroll;
};

// Hook for optimized resize handling
export const useOptimizedResize = (
  callback: (width: number, height: number) => void,
  deps: any[] = []
) => {
  const { debounce } = useOptimizedRender({ enableDebounce: true, debounceMs: 150 });

  const handleResize = useCallback(() => {
    debounce(() => {
      callback(window.innerWidth, window.innerHeight);
    });
  }, [debounce, callback, ...deps]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  return handleResize;
};

// Hook for intersection observer optimization
export const useIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
) => {
  const [observer, setObserver] = useState<IntersectionObserver | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      const obs = new IntersectionObserver(callback, {
        rootMargin: '50px',
        threshold: 0.1,
        ...options,
      });
      setObserver(obs);

      return () => obs.disconnect();
    }
  }, [callback]);

  const observe = useCallback((element: Element) => {
    if (observer && element) {
      observer.observe(element);
    }
  }, [observer]);

  const unobserve = useCallback((element: Element) => {
    if (observer && element) {
      observer.unobserve(element);
    }
  }, [observer]);

  return { observe, unobserve };
};

// Performance monitoring hook
export const usePerformanceMonitor = (componentName: string) => {
  const startTime = performance.now();

  useEffect(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    if (renderTime > 16) { // Slower than 60fps
      console.warn(`${componentName} render took ${renderTime.toFixed(2)}ms`);
    }
  });

  const measureAsync = useCallback(async (name: string, fn: () => Promise<any>) => {
    const start = performance.now();
    try {
      const result = await fn();
      const end = performance.now();
      console.debug(`${componentName}.${name} took ${(end - start).toFixed(2)}ms`);
      return result;
    } catch (error) {
      const end = performance.now();
      console.error(`${componentName}.${name} failed after ${(end - start).toFixed(2)}ms`, error);
      throw error;
    }
  }, [componentName]);

  return { measureAsync };
};