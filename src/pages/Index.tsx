import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ModernLoginPage from '@/components/auth/ModernLoginPage';
import MainLayout from '@/components/layout/MainLayout';
import UserDashboard from '@/components/dashboard/UserDashboard';
import EnhancedAdminDashboard from '@/components/dashboard/EnhancedAdminDashboard';
import EnhancedSuperAdminDashboard from '@/components/dashboard/EnhancedSuperAdminDashboard';
import OnboardingTour from '@/components/onboarding/OnboardingTour';
import AIAssistant from '@/components/ai/AIAssistant';
import { ErrorBoundary } from '@/components/ui/error-boundary';

const Index = () => {
  const { user } = useAuth();
  const [showTour, setShowTour] = useState(false);

  if (!user) {
    return <ModernLoginPage />;
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'user':
        return <UserDashboard user={user} onStartTour={() => setShowTour(true)} />;
      case 'admin':
        return <EnhancedAdminDashboard user={user} onStartTour={() => setShowTour(true)} />;
      case 'super_admin':
        return <EnhancedSuperAdminDashboard user={user} onStartTour={() => setShowTour(true)} />;
      default:
        return <UserDashboard user={user} onStartTour={() => setShowTour(true)} />;
    }
  };

  return (
    <ErrorBoundary>
      <MainLayout>
        {renderDashboard()}
      </MainLayout>
      <OnboardingTour 
        isOpen={showTour} 
        onClose={() => setShowTour(false)} 
        user={user} 
      />
      <AIAssistant />
    </ErrorBoundary>
  );
};

export default Index;
