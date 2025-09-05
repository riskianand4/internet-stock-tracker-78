import React from 'react';
import { useApp } from '@/contexts/AppContext';
import ModernLoginPage from '@/components/auth/ModernLoginPage';
import MainLayout from '@/components/layout/MainLayout';
import ProductsManager from '@/components/products/ProductsManager';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';

const ProductsPage = () => {
  const { user, isAuthenticated } = useApp();

  if (!isAuthenticated || !user) {
    return <ModernLoginPage />;
  }

  return (
    <ErrorBoundary>
      <MainLayout>
        <ProductsManager />
      </MainLayout>
    </ErrorBoundary>
  );
};

export default ProductsPage;