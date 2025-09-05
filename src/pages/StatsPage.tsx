import React from 'react';
import { useApp } from '@/contexts/AppContext';
import ModernLoginPage from '@/components/auth/ModernLoginPage';
import MainLayout from '@/components/layout/MainLayout';
import AdvancedStatsOverview from '@/components/dashboard/AdvancedStatsOverview';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';

const StatsPage = () => {
  const { user, isAuthenticated } = useApp();

  if (!isAuthenticated || !user) {
    return <ModernLoginPage />;
  }

  return (
    <ErrorBoundary>
      <MainLayout>
        <AdvancedStatsOverview />
      </MainLayout>
    </ErrorBoundary>
  );
};

export default StatsPage;