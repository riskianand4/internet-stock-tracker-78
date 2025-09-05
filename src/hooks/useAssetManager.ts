// Placeholder component for Asset Manager
import { useState, useCallback, useEffect } from 'react';
import { Asset, AssetBorrowRequest, AssetStats, MaintenanceRecord } from '@/types/assets';
import { useDataPersistence } from '@/hooks/useDataPersistence';
import useAuditLog from '@/hooks/useAuditLog';
import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/contexts/ApiContext';
import { toast } from 'sonner';

export const useAssetManager = () => {
  const { logAction } = useAuditLog();
  const { user } = useAuth();
  const { apiService, isConfigured } = useApi();
  const [assets, setAssets] = useState<Asset[]>([]);
  
  const { data: assetsData, updateData: updateAssetsData } = useDataPersistence<Asset[]>(
    [],
    {
      key: 'assets_data',
      version: 1,
      enableCompression: true,
      syncAcrossTabs: true,
    }
  );

  const [loading, setLoading] = useState(false);

  // Add new asset (Admin+ only)
  const addAsset = useCallback(async (asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      toast.error('Akses ditolak');
      return;
    }

    setLoading(true);
    try {
      const newAsset: Asset = {
        ...asset,
        id: `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        maintenanceHistory: []
      };

      setAssets(prev => [...prev, newAsset]);
      
      logAction('CREATE', 'asset', {
        assetName: asset.name,
        assetCode: asset.code,
        category: asset.category
      }, newAsset.id);

      toast.success('Asset berhasil ditambahkan');
    } catch (error) {
      toast.error('Gagal menambahkan asset');
    } finally {
      setLoading(false);
    }
  }, [user, setAssets, logAction]);

  // Update asset (Admin+ only)
  const updateAsset = useCallback(async (assetId: string, updates: Partial<Asset>) => {
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      toast.error('Akses ditolak');
      return;
    }

    setLoading(true);
    try {
      setAssets(prev => prev.map(asset => 
        asset.id === assetId 
          ? { ...asset, ...updates, updatedAt: new Date() }
          : asset
      ));

      logAction('UPDATE', 'asset', {
        changes: updates
      }, assetId);

      toast.success('Asset berhasil diperbarui');
    } catch (error) {
      toast.error('Gagal memperbarui asset');
    } finally {
      setLoading(false);
    }
  }, [user, setAssets, logAction]);

  // Assign PIC (Super Admin only)
  const assignPIC = useCallback(async (assetId: string, picId: string, picName: string) => {
    if (!user || user.role !== 'super_admin') {
      toast.error('Hanya Super Admin yang dapat menugaskan PIC');
      return;
    }

    setLoading(true);
    try {
      setAssets(prev => prev.map(asset => 
        asset.id === assetId 
          ? { ...asset, picId, picName, updatedAt: new Date() }
          : asset
      ));

      logAction('UPDATE', 'asset', {
        action: 'assign_pic',
        picId,
        picName
      }, assetId);

      toast.success('PIC berhasil ditugaskan');
    } catch (error) {
      toast.error('Gagal menugaskan PIC');
    } finally {
      setLoading(false);
    }
  }, [user, setAssets, logAction]);

  // Borrow asset (Admin+ only)
  const borrowAsset = useCallback(async (borrowRequest: AssetBorrowRequest) => {
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      toast.error('Akses ditolak');
      return;
    }

    const asset = assets.find(a => a.id === borrowRequest.assetId);
    if (!asset) {
      toast.error('Asset tidak ditemukan');
      return;
    }

    if (!asset.picId) {
      toast.error('Asset belum memiliki PIC, tidak bisa dipinjam');
      return;
    }

    if (asset.status !== 'available') {
      toast.error('Asset tidak tersedia untuk dipinjam');
      return;
    }

    setLoading(true);
    try {
      setAssets(prev => prev.map(a => 
        a.id === borrowRequest.assetId 
          ? { 
              ...a, 
              status: 'borrowed' as const,
              borrowedBy: {
                userId: borrowRequest.borrowerUserId,
                userName: borrowRequest.borrowerUserName,
                borrowDate: new Date(),
                expectedReturnDate: borrowRequest.expectedReturnDate,
                notes: borrowRequest.notes
              },
              updatedAt: new Date()
            }
          : a
      ));

      logAction('UPDATE', 'asset', {
        action: 'borrow',
        borrowerUserId: borrowRequest.borrowerUserId,
        borrowerUserName: borrowRequest.borrowerUserName,
        expectedReturnDate: borrowRequest.expectedReturnDate,
        purpose: borrowRequest.purpose
      }, borrowRequest.assetId);

      toast.success('Asset berhasil dipinjam');
    } catch (error) {
      toast.error('Gagal meminjam asset');
    } finally {
      setLoading(false);
    }
  }, [user, assets, setAssets, logAction]);

  // Return asset (Admin+ only)
  const returnAsset = useCallback(async (assetId: string, notes?: string) => {
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      toast.error('Akses ditolak');
      return;
    }

    const asset = assets.find(a => a.id === assetId);
    if (!asset || asset.status !== 'borrowed') {
      toast.error('Asset tidak dalam status dipinjam');
      return;
    }

    setLoading(true);
    try {
      setAssets(prev => prev.map(a => 
        a.id === assetId 
          ? { 
              ...a, 
              status: 'available' as const,
              borrowedBy: asset.borrowedBy ? {
                ...asset.borrowedBy,
                actualReturnDate: new Date(),
                notes: notes || asset.borrowedBy.notes
              } : undefined,
              updatedAt: new Date()
            }
          : a
      ));

      logAction('UPDATE', 'asset', {
        action: 'return',
        borrowerUserId: asset.borrowedBy?.userId,
        borrowerUserName: asset.borrowedBy?.userName,
        returnNotes: notes
      }, assetId);

      toast.success('Asset berhasil dikembalikan');
    } catch (error) {
      toast.error('Gagal mengembalikan asset');
    } finally {
      setLoading(false);
    }
  }, [user, assets, setAssets, logAction]);

  // Add maintenance record (Admin+ only)
  const addMaintenanceRecord = useCallback(async (assetId: string, maintenance: Omit<MaintenanceRecord, 'id' | 'assetId'>) => {
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      toast.error('Akses ditolak');
      return;
    }

    setLoading(true);
    try {
      const newMaintenance: MaintenanceRecord = {
        ...maintenance,
        id: `maint-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        assetId
      };

      setAssets(prev => prev.map(asset => 
        asset.id === assetId 
          ? { 
              ...asset, 
              maintenanceHistory: [...asset.maintenanceHistory, newMaintenance],
              updatedAt: new Date()
            }
          : asset
      ));

      logAction('CREATE', 'maintenance', {
        assetId,
        maintenanceType: maintenance.type,
        cost: maintenance.cost,
        performedBy: maintenance.performedBy
      });

      toast.success('Record maintenance berhasil ditambahkan');
    } catch (error) {
      toast.error('Gagal menambahkan record maintenance');
    } finally {
      setLoading(false);
    }
  }, [user, setAssets, logAction]);

  // Delete asset (Admin+ only)
  const deleteAsset = useCallback(async (assetId: string) => {
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      toast.error('Akses ditolak');
      return;
    }

    const asset = assets.find(a => a.id === assetId);
    if (asset?.status === 'borrowed') {
      toast.error('Tidak dapat menghapus asset yang sedang dipinjam');
      return;
    }

    setLoading(true);
    try {
      setAssets(prev => prev.filter(asset => asset.id !== assetId));
      
      logAction('DELETE', 'asset', {
        assetName: asset?.name,
        assetCode: asset?.code
      }, assetId);

      toast.success('Asset berhasil dihapus');
    } catch (error) {
      toast.error('Gagal menghapus asset');
    } finally {
      setLoading(false);
    }
  }, [user, assets, setAssets, logAction]);

  // Get asset statistics
  const getAssetStats = useCallback((): AssetStats => {
    const totalAssets = assets.length;
    const totalValue = assets.reduce((sum, asset) => sum + asset.purchasePrice, 0);
    const availableAssets = assets.filter(a => a.status === 'available').length;
    const borrowedAssets = assets.filter(a => a.status === 'borrowed').length;
    const maintenanceAssets = assets.filter(a => a.status === 'maintenance').length;

    const assetsByCondition = assets.reduce((acc, asset) => {
      acc[asset.condition] = (acc[asset.condition] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const assetsByCategory = assets.reduce((acc, asset) => {
      acc[asset.category] = (acc[asset.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalAssets,
      totalValue,
      availableAssets,
      borrowedAssets,
      maintenanceAssets,
      assetsByCondition,
      assetsByCategory
    };
  }, [assets]);

  // Filter assets
  const getAssetsByStatus = useCallback((status: Asset['status']) => {
    return assets.filter(asset => asset.status === status);
  }, [assets]);

  const getAssetsByPIC = useCallback((picId: string) => {
    return assets.filter(asset => asset.picId === picId);
  }, [assets]);

  const getOverdueAssets = useCallback(() => {
    const now = new Date();
    return assets.filter(asset => 
      asset.status === 'borrowed' && 
      asset.borrowedBy && 
      asset.borrowedBy.expectedReturnDate < now &&
      !asset.borrowedBy.actualReturnDate
    );
  }, [assets]);

  // Get asset by ID
  const getAssetById = useCallback((assetId: string) => {
    return assets.find(asset => asset.id === assetId);
  }, [assets]);

  // Fetch/refresh assets from API
  const fetchAssets = useCallback(async () => {
    // This would normally fetch from API
    // For now, just return current assets
    return assets;
  }, [assets]);

  return {
    assets,
    stats: getAssetStats(),
    borrowRequests: [], // This would come from API
    maintenanceRecords: [], // This would come from API
    isLoading: loading,
    addAsset,
    updateAsset,
    deleteAsset,
    borrowAsset,
    returnAsset,
    assignPIC,
    scheduleMaintenanceRecord: async () => {}, // Not implemented yet
    updateMaintenanceRecord: async () => {}, // Not implemented yet
    deleteMaintenanceRecord: async () => {}, // Not implemented yet
    getAssetById,
    refreshAssets: fetchAssets,
    getAssetsByStatus,
    getAssetsByPIC,
    getOverdueAssets,
  };
};
