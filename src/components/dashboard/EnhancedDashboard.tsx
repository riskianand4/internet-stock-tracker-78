import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ModernStatsOverview from './ModernStatsOverview';
import PerformanceMonitor from '../performance/PerformanceMonitor';
import OnboardingFlow from '../onboarding/OnboardingFlow';
import { AdvancedSearch, SearchFilters } from '../advanced/AdvancedSearch';
import { 
  ProductCardSkeleton, 
  StatsCardSkeleton, 
  CardSkeleton 
} from '@/components/ui/loading-skeleton';
import { 
  Package, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  Settings,
  Book,
  HelpCircle
} from 'lucide-react';
import { useHybridProducts } from '@/hooks/useHybridData';

const EnhancedDashboard = () => {
  const { user } = useAuth();
  const { data: products, isLoading: productsLoading, isFromApi } = useHybridProducts();
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    category: '',
    status: [],
    priceRange: [0, 10000000],
    stockRange: [0, 1000],
    dateRange: { from: null, to: null },
    location: '',
    supplier: '',
    tags: [],
  });

  // Check if user is new (for onboarding)
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding && user) {
      setShowOnboarding(true);
    }
  }, [user]);

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
  };

  // Extract unique categories and locations for search filters
  const categories = [...new Set(products.map(p => p.category))];
  const locations = [...new Set(products.map(p => p.location).filter(Boolean))];
  const suppliers = [...new Set(products.map(p => p.supplier).filter(Boolean))];

  // Quick stats calculation
  const quickStats = {
    totalProducts: products.length,
    lowStock: products.filter(p => p.status === 'low_stock').length,
    outOfStock: products.filter(p => p.status === 'out_of_stock').length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0),
  };

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'admin':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  if (isLoading || productsLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-muted animate-pulse rounded" />
            <div className="h-4 w-96 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>

        {/* Quick Stats Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {getWelcomeMessage()}, {user?.name}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your inventory today
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge className={getRoleColor(user?.role || 'user')}>
              {user?.role === 'super_admin' ? 'Super Admin' : 
               user?.role === 'admin' ? 'Admin' : 'User'}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {new Date().toLocaleDateString('id-ID', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Badge>
            {isFromApi && (
              <Badge variant="secondary" className="text-xs bg-success/20 text-success">
                Live Data
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowOnboarding(true)}
            className="gap-2"
          >
            <Book className="w-4 h-4" />
            Quick Tour
          </Button>
          <PerformanceMonitor />
        </div>
      </motion.div>

      {/* Quick Actions & Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Quick Actions & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AdvancedSearch
              filters={searchFilters}
              onFiltersChange={setSearchFilters}
              categories={categories}
              locations={locations}
              suppliers={suppliers}
              availableTags={['Electronics', 'Network', 'Hardware']}
              maxPrice={10000000}
              maxStock={1000}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card className="hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{quickStats.totalProducts}</p>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600">{quickStats.lowStock}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{quickStats.outOfStock}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-lg font-bold">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    notation: 'compact',
                    maximumFractionDigits: 1,
                  }).format(quickStats.totalValue)}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <ModernStatsOverview />
      </motion.div>

      {/* Help & Resources */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Need Help?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Book className="w-6 h-6 mx-auto mb-2 text-primary" />
                <h3 className="font-medium mb-1">Documentation</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Complete guides and tutorials
                </p>
                <Button variant="outline" size="sm">Learn More</Button>
              </div>
              
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
                <h3 className="font-medium mb-1">Community</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Connect with other users
                </p>
                <Button variant="outline" size="sm">Join Community</Button>
              </div>
              
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Settings className="w-6 h-6 mx-auto mb-2 text-primary" />
                <h3 className="font-medium mb-1">Support</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Get help from our team
                </p>
                <Button variant="outline" size="sm">Contact Support</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Onboarding Flow */}
      <OnboardingFlow
        open={showOnboarding}
        onOpenChange={setShowOnboarding}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
};

export default EnhancedDashboard;