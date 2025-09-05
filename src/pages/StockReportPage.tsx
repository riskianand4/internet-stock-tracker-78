import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ModernLoginPage from '@/components/auth/ModernLoginPage';
import MainLayout from '@/components/layout/MainLayout';
import StockReportsManager from '@/components/reports/StockReportsManager';

const StockReportPage = () => {
  const { user } = useAuth();

  if (!user) {
    return <ModernLoginPage />;
  }

  return (
    <MainLayout>
      <StockReportsManager />
    </MainLayout>
  );
};

export default StockReportPage;