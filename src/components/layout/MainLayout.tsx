import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { MobileMoreMenu } from './MobileMoreMenu';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, Bell, Search, User, HelpCircle, Wifi } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { QuickSearch } from './QuickSearch';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import NotificationCenter from './NotificationCenter';
import SyncStatusIndicator from './SyncStatusIndicator';
interface MainLayoutProps {
  children: React.ReactNode;
}
export default function MainLayout({
  children
}: MainLayoutProps) {
  const {
    user,
    logout
  } = useAuth();
  const isMobile = useIsMobile();
  const location = useLocation();
  const [showSearch, setShowSearch] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Keyboard shortcut for quick search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-destructive';
      case 'admin':
        return 'bg-warning';
      default:
        return 'bg-success';
    }
  };
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'admin':
        return 'Admin';
      default:
        return 'User';
    }
  };
  // Check if we should show more menu based on route
  useEffect(() => {
    if (location.pathname === '/more') {
      setShowMoreMenu(true);
    }
  }, [location.pathname]);
  const handleMoreMenuClose = () => {
    setShowMoreMenu(false);
    if (location.pathname === '/more') {
      window.history.back();
    }
  };
  if (isMobile) {
    return <div className="min-h-screen flex flex-col w-full bg-background pb-16">
        {/* Mobile Header */}
        <motion.header className="h-12 border-b border-border/50 bg-card/50 backdrop-blur-xl flex items-center justify-between px-4" initial={{
        opacity: 0,
        y: -20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.3
      }}>
          {/* Logo/Brand */}
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <Wifi className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground">Telnet</h1>
            </div>
          </div>

          {/* Mobile Header Actions */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => setShowSearch(true)} className="h-8 w-8 p-0">
              <Search className="h-4 w-4" />
            </Button>
            
            <NotificationCenter />
            <ThemeToggle />
          </div>
        </motion.header>

        {/* Mobile Main Content */}
        <main className="flex-1 p-3 overflow-auto">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.4,
          delay: 0.1
        }} className="h-full">
            {children}
          </motion.div>
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />
        
        {/* Mobile More Menu */}
        <MobileMoreMenu isOpen={showMoreMenu || location.pathname === '/more'} onClose={handleMoreMenuClose} />
        
        {/* Quick Search */}
        <QuickSearch isOpen={showSearch} onClose={() => setShowSearch(false)} />
      </div>;
  }

  // Desktop Layout
  return <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <motion.header className="h-12 sm:h-14 lg:h-16 border-b border-border/50 bg-card/50 backdrop-blur-xl flex items-center justify-between px-2 sm:px-4 lg:px-6" initial={{
          opacity: 0,
          y: -20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.3
        }}>
            <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
              <SidebarTrigger className="lg:hidden p-1 sm:p-2" />
            </div>

            <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
              <Button variant="outline" size="sm" onClick={() => setShowSearch(true)} className="flex items-center gap-2 text-muted-foreground h-8 sm:h-9">
                <Search className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline text-xs sm:text-sm">Search...</span>
              </Button>
              
              <SyncStatusIndicator />
              <NotificationCenter />
              <ThemeToggle />
              
              <Button variant="ghost" size="sm" className="text-muted-foreground h-8 w-8 sm:h-9 sm:w-9 p-1 sm:p-2">
                <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>

              <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
                <motion.div whileHover={{
                scale: 1.05
              }} whileTap={{
                scale: 0.95
              }}>
                  <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-destructive p-1 sm:p-2 h-8 w-8 sm:h-9 sm:w-9">
                    <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.header>

          <main className="flex-1 p-2 sm:p-4 lg:p-6 overflow-auto px-0">
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.4,
            delay: 0.1
          }} className="h-full">
              {children}
            </motion.div>
          </main>
        </div>
      </div>
      <QuickSearch isOpen={showSearch} onClose={() => setShowSearch(false)} />
    </SidebarProvider>;
}