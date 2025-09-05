import React from 'react';
import { useApp } from '@/contexts/AppContext';
import ModernLoginPage from '@/components/auth/ModernLoginPage';
import MainLayout from '@/components/layout/MainLayout';
import InventoryOverview from '@/components/inventory/InventoryOverview';
import { motion } from 'framer-motion';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';

const InventoryPage = () => {
  const { user, isAuthenticated } = useApp();

  if (!isAuthenticated || !user) {
    return <ModernLoginPage />;
  }

  const handleStockAdjustment = (productId: string) => {
    // This would open stock adjustment modal or navigate to adjustment form
    console.log('Open stock adjustment for product:', productId);
  };

  return (
    <ErrorBoundary>
      <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div 
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground">Real-time Inventory</h1>
            <p className="text-muted-foreground">Monitor level stok semua produk secara real-time</p>
          </div>
        </motion.div>

        {/* Main Inventory Overview */}
        <InventoryOverview onStockAdjustment={handleStockAdjustment} />
      </div>
    </MainLayout>
    </ErrorBoundary>
  );
};

export default InventoryPage;