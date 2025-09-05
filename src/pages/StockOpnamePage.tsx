import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ModernLoginPage from '@/components/auth/ModernLoginPage';
import MainLayout from '@/components/layout/MainLayout';
import StockOpnameManager from '@/components/inventory/StockOpnameManager';

const StockOpnamePage = () => {
  const { user } = useAuth();

  if (!user) {
    return <ModernLoginPage />;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Stock Opname</h1>
          <p className="text-muted-foreground">
            Physical stock count and inventory adjustment
          </p>
        </div>
        <StockOpnameManager />
      </div>
    </MainLayout>
  );
};

export default StockOpnamePage;