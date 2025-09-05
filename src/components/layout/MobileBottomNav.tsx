import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Package, BarChart3, ArrowUpDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const bottomNavItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
    roles: ['user', 'admin', 'super_admin']
  },
  {
    title: "Products",
    url: "/products", 
    icon: Package,
    roles: ['user', 'admin', 'super_admin']
  },
  {
    title: "Analytics",
    url: "/stats",
    icon: BarChart3,
    roles: ['user', 'admin', 'super_admin']
  },
  {
    title: "Stock Movement",
    url: "/stock-movement",
    icon: ArrowUpDown,
    roles: ['admin', 'super_admin']
  }
];

export function MobileBottomNav() {
  const { user } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  const filteredItems = bottomNavItems.filter(item => 
    item.roles.includes(user?.role || 'user')
  );

  return (
    <motion.nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border/50"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-around px-2 py-1 safe-area-inset-bottom">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.url || 
            (item.url === "/" && currentPath === "/") ||
            (item.title === "More" && currentPath === "/more");

          return (
            <NavLink
              key={item.title}
              to={item.url}
              className="flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1"
            >
              <motion.div
                className={`flex flex-col items-center justify-center space-y-1 transition-colors duration-200 ${
                  isActive 
                    ? 'text-primary' 
                    : 'text-muted-foreground'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <div className={`p-1.5 rounded-lg ${isActive ? 'bg-primary/10' : ''}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-medium truncate max-w-full">
                  {item.title}
                </span>
                {isActive && (
                  <motion.div
                    className="w-1 h-1 bg-primary rounded-full"
                    layoutId="mobileActiveIndicator"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.div>
            </NavLink>
          );
        })}
      </div>
    </motion.nav>
  );
}