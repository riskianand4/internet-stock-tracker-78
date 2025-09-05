import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import ModernLoginPage from '@/components/auth/ModernLoginPage';
import MainLayout from '@/components/layout/MainLayout';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Plus, 
  TrendingUp,
  AlertCircle,
  Clock,
  DollarSign,
  Activity
} from 'lucide-react';
import { useEnhancedAssetManager } from '@/hooks/useEnhancedAssetManager';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';
import { LoadingOverlay } from '@/components/ui/loading-states';
import { AssetTable } from '@/components/assets/AssetTable';
import { AddAssetDialog } from '@/components/assets/AddAssetDialog';
import { BorrowAssetDialog } from '@/components/assets/BorrowAssetDialog';
import { AssignPICDialog } from '@/components/assets/AssignPICDialog';
import { AssetDetailModal } from '@/components/assets/AssetDetailModal';
import { EditAssetDialog } from '@/components/assets/EditAssetDialog';
import { Asset } from '@/types/assets';

const AssetsPage = () => {
  const { user, isAuthenticated } = useApp();

  if (!isAuthenticated || !user) {
    return <ModernLoginPage />;
  }

  const {
    assets,
    isLoading,
    addAsset,
    updateAsset,
    borrowAsset,
    returnAsset,
    deleteAsset,
    fetchAssets
  } = useEnhancedAssetManager();

  // Calculate stats from assets
  const stats = React.useMemo(() => {
    const totalAssets = assets.length;
    const totalValue = assets.reduce((sum, asset) => sum + asset.purchasePrice, 0);
    const availableAssets = assets.filter(a => a.status === 'available').length;
    const borrowedAssets = assets.filter(a => a.status === 'borrowed').length;
    const maintenanceAssets = assets.filter(a => a.status === 'maintenance').length;

    return {
      totalAssets,
      totalValue,
      availableAssets,
      borrowedAssets,
      maintenanceAssets,
    };
  }, [assets]);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showBorrowDialog, setShowBorrowDialog] = useState(false);
  const [showAssignPICDialog, setShowAssignPICDialog] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Get overdue assets (assets that should have been returned)
  const overdueAssets = assets.filter(asset => {
    return asset.status === 'borrowed' && 
           asset.borrowedBy?.expectedReturnDate && 
           new Date(asset.borrowedBy.expectedReturnDate) < new Date();
  });

  const canEdit = user.role === 'admin' || user.role === 'super_admin';

  const handleBorrowAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setShowBorrowDialog(true);
  };

  const handleAssignPIC = (asset: Asset) => {
    setSelectedAsset(asset);
    setShowAssignPICDialog(true);
  };

  const assignPIC = async (assetId: string, picId: string, picName: string) => {
    try {
      await updateAsset(assetId, { picId, picName });
    } catch (error) {
      console.error('Failed to assign PIC:', error);
    }
  };

  const handleReturnAsset = async (asset: Asset) => {
    await returnAsset(asset.id);
  };

  const handleViewDetails = (asset: Asset) => {
    setSelectedAsset(asset);
    setShowDetailModal(true);
  };

  const handleEdit = (asset: Asset) => {
    setSelectedAsset(asset);
    setShowEditDialog(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <ErrorBoundary>
      <MainLayout>
        <div className="space-y-6 p-4 sm:p-6 pb-20 relative">
          <LoadingOverlay show={isLoading} text="Loading assets..." />
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
          {/* Header */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold text-foreground">Asset Management</h1>
              <p className="text-muted-foreground">Kelola asset jangka panjang perusahaan</p>
            </div>
            
            {canEdit && (
              <Button onClick={() => setShowAddDialog(true)} className="glass">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Asset
              </Button>
            )}
          </motion.div>

          {/* Stats Cards */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <Card className="glass">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Asset</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalAssets}</div>
                <p className="text-xs text-muted-foreground">
                  Total item asset
                </p>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nilai Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                  }).format(stats.totalValue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total nilai asset
                </p>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tersedia</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">{stats.availableAssets}</div>
                <p className="text-xs text-muted-foreground">
                  Siap digunakan
                </p>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dipinjam</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">{stats.borrowedAssets}</div>
                <p className="text-xs text-muted-foreground">
                  Sedang digunakan
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Alerts */}
          {overdueAssets.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card className="glass border-warning/20 bg-warning/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-warning">
                    <AlertCircle className="w-5 h-5" />
                    Peringatan Keterlambatan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Ada {overdueAssets.length} asset yang terlambat dikembalikan:
                  </p>
                  <div className="space-y-2">
                    {overdueAssets.slice(0, 3).map((asset) => (
                      <div key={asset.id} className="flex items-center justify-between p-2 bg-background/50 rounded">
                        <div>
                          <span className="font-medium">{asset.name}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            - Dipinjam oleh {asset.borrowedBy?.userName}
                          </span>
                        </div>
                        <Badge variant="destructive">
                          Terlambat {Math.ceil((new Date().getTime() - new Date(asset.borrowedBy?.expectedReturnDate).getTime()) / (1000 * 60 * 60 * 24))} hari
                        </Badge>
                      </div>
                    ))}
                  </div>
                  {overdueAssets.length > 3 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Dan {overdueAssets.length - 3} asset lainnya...
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Assets Table */}
          <motion.div variants={itemVariants}>
            <AssetTable
              assets={assets}
              onEdit={canEdit ? handleEdit : undefined}
              onDelete={canEdit ? deleteAsset : undefined}
              onAssignPIC={user.role === 'super_admin' ? handleAssignPIC : undefined}
              onBorrow={canEdit ? handleBorrowAsset : undefined}
              onReturn={canEdit ? handleReturnAsset : undefined}
              onViewDetails={handleViewDetails}
            />
          </motion.div>
          </motion.div>
        </div>

        {/* Dialogs */}
        <AddAssetDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onSave={addAsset}
          loading={isLoading}
        />

        <BorrowAssetDialog
          open={showBorrowDialog}
          onOpenChange={setShowBorrowDialog}
          asset={selectedAsset}
          onBorrow={borrowAsset}
          loading={isLoading}
        />

        <AssignPICDialog
          open={showAssignPICDialog}
          onOpenChange={setShowAssignPICDialog}
          asset={selectedAsset}
          onAssign={assignPIC}
          loading={isLoading}
        />

        <AssetDetailModal
          asset={selectedAsset}
          open={showDetailModal}
          onOpenChange={setShowDetailModal}
        />

        <EditAssetDialog
          asset={selectedAsset}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSave={updateAsset}
          loading={isLoading}
        />
      </MainLayout>
    </ErrorBoundary>
  );
};

export default AssetsPage;