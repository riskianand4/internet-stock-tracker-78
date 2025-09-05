import { useState, useEffect } from 'react';
import { Product } from '@/types/inventory';
import { Asset } from '@/types/assets';
import { User, UserActivity } from '@/types/users';
import { StockMovement, StockAlert } from '@/types/stock-movement';
import * as ProductApi from '@/services/productApi';
import * as AssetApi from '@/services/assetApi';
import * as UserApi from '@/services/userApi';
import { InventoryApiService } from '@/services/inventoryApi';

// Initialize the API service
const apiService = new InventoryApiService();

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await ProductApi.getAllProducts();
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading, error, refetch: () => window.location.reload() };
};

export const useAssets = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await AssetApi.getAllAssets();
        setAssets(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch assets');
        console.error('Error fetching assets:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

  return { assets, loading, error, refetch: () => window.location.reload() };
};

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await UserApi.getAllUsers();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch users');
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, loading, error, refetch: () => window.location.reload() };
};

export const useInventoryStats = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getInventoryStats();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch inventory stats');
        console.error('Error fetching inventory stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error, refetch: () => window.location.reload() };
};

export const useStockMovements = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovements = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getStockMovements();
        if (response?.success && Array.isArray(response.data)) {
          setMovements(response.data as StockMovement[]);
        } else {
          setMovements([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch stock movements');
        console.error('Error fetching stock movements:', err);
        setMovements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMovements();
  }, []);

  return { movements, loading, error, refetch: () => window.location.reload() };
};

export const useStockAlerts = () => {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getStockAlerts();
        if (response?.success && Array.isArray(response.data)) {
          setAlerts(response.data as StockAlert[]);
        } else {
          setAlerts([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch stock alerts');
        console.error('Error fetching stock alerts:', err);
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  return { alerts, loading, error, refetch: () => window.location.reload() };
};