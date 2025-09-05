import { useState, useEffect, useCallback } from 'react';
import { useErrorHandler } from '@/hooks/useErrorHandler';

interface PersistenceOptions {
  key: string;
  version?: number;
  enableCompression?: boolean;
  syncAcrossTabs?: boolean;
}

interface PersistedData<T> {
  data: T;
  timestamp: number;
  version: number;
}

export function useDataPersistence<T>(
  initialData: T,
  options: PersistenceOptions
) {
  const { key, version = 1, enableCompression = false, syncAcrossTabs = true } = options;
  const { logError } = useErrorHandler('DataPersistence');
  
  const [data, setData] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed: PersistedData<T> = JSON.parse(stored);
        
        // Check version compatibility
        if (parsed.version === version) {
          return parsed.data;
        } else {
          // Version mismatch, clear old data
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      logError(error instanceof Error ? error : new Error('Failed to load persisted data'), 'loadData', false);
      localStorage.removeItem(key); // Clean up corrupted data
    }
    return initialData;
  });

  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  // Save data to localStorage
  const persistData = useCallback((newData: T) => {
    try {
      const persistedData: PersistedData<T> = {
        data: newData,
        timestamp: Date.now(),
        version,
      };

      const serialized = JSON.stringify(persistedData);
      localStorage.setItem(key, serialized);
      setLastSynced(new Date());
    } catch (error) {
      logError(
        error instanceof Error ? error : new Error('Failed to persist data'),
        'persistData',
        true
      );
    }
  }, [key, version, logError]);

  // Update data and persist
  const updateData = useCallback((newData: T | ((prev: T) => T)) => {
    setData(prevData => {
      const updatedData = typeof newData === 'function' 
        ? (newData as (prev: T) => T)(prevData)
        : newData;
      
      persistData(updatedData);
      return updatedData;
    });
  }, [persistData]);

  // Clear persisted data
  const clearData = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setData(initialData);
      setLastSynced(null);
    } catch (error) {
      logError(
        error instanceof Error ? error : new Error('Failed to clear persisted data'),
        'clearData',
        true
      );
    }
  }, [key, initialData, logError]);

  // Check if data exists in storage
  const hasPersistedData = useCallback(() => {
    try {
      return localStorage.getItem(key) !== null;
    } catch {
      return false;
    }
  }, [key]);

  // Sync across tabs
  useEffect(() => {
    if (!syncAcrossTabs) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          const parsed: PersistedData<T> = JSON.parse(e.newValue);
          if (parsed.version === version) {
            setData(parsed.data);
            setLastSynced(new Date(parsed.timestamp));
          }
        } catch (error) {
          logError(
            error instanceof Error ? error : new Error('Failed to sync data across tabs'),
            'storageSync',
            false
          );
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, version, syncAcrossTabs, logError]);

  // Auto-persist on data changes
  useEffect(() => {
    if (data !== initialData) {
      persistData(data);
    }
  }, [data, persistData, initialData]);

  return {
    data,
    updateData,
    clearData,
    hasPersistedData,
    lastSynced,
    isStale: lastSynced ? Date.now() - lastSynced.getTime() > 5 * 60 * 1000 : false, // 5 minutes
  };
}

// Specialized hook for API cache
export function useApiCache<T>(
  cacheKey: string,
  defaultValue: T,
  ttl: number = 5 * 60 * 1000 // 5 minutes
) {
  const { data, updateData, clearData, lastSynced } = useDataPersistence(defaultValue, {
    key: `api-cache-${cacheKey}`,
    version: 1,
    syncAcrossTabs: false,
  });

  const isExpired = lastSynced ? Date.now() - lastSynced.getTime() > ttl : true;

  const setCache = useCallback((newData: T) => {
    updateData(newData);
  }, [updateData]);

  const getCache = useCallback((): T | null => {
    if (isExpired) {
      clearData();
      return null;
    }
    return data;
  }, [data, isExpired, clearData]);

  return {
    cache: data,
    setCache,
    getCache,
    clearCache: clearData,
    isExpired,
    lastUpdated: lastSynced,
  };
}