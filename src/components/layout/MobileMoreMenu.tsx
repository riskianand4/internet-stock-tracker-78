import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Brain, 
  Key, 
  FileText, 
  LogOut, 
  User, 
  X,
  Settings as SettingsIcon
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const moreMenuItems = [
  {
    title: "Stock Movement",
    url: "/stock-movement",
    icon: TrendingUp,
    roles: ['admin', 'super_admin']
  },
  {
    title: "Reports", 
    url: "/reports",
    icon: FileText,
    roles: ['user', 'admin', 'super_admin']
  },
  {
    title: "Users",
    url: "/users", 
    icon: Users,
    roles: ['admin', 'super_admin']
  },
  {
    title: "AI Studio",
    url: "/ai-studio",
    icon: Brain,
    roles: ['admin', 'super_admin']
  },
  {
    title: "API Management",
    url: "/api-management",
    icon: Key,
    roles: ['super_admin']
  },
  {
    title: "Settings",
    url: "/settings",
    icon: SettingsIcon,
    roles: ['user', 'admin', 'super_admin']
  }
];

interface MobileMoreMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMoreMenu({ isOpen, onClose }: MobileMoreMenuProps) {
  const { user, logout } = useAuth();

  const filteredItems = moreMenuItems.filter(item => 
    item.roles.includes(user?.role || 'user')
  );

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

  if (!isOpen) return null;

  return (
    <>
      <motion.div
        className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      
      <motion.div
        className="fixed bottom-16 left-0 right-0 z-50 bg-card border-t border-border/50 rounded-t-3xl shadow-strong"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Menu</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* User Profile Section */}
          <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-xl mb-4">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                <User className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <Badge variant="secondary" className={`text-xs ${getRoleBadgeColor(user?.role || '')}`}>
                {getRoleLabel(user?.role || '')}
              </Badge>
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-1 mb-4">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.title}
                  to={item.url}
                  onClick={onClose}
                  className="flex items-center space-x-3 p-3 rounded-xl text-sm font-medium transition-colors hover:bg-muted/50"
                >
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span>{item.title}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Logout Button */}
          <Button
            variant="outline"
            onClick={() => {
              logout();
              onClose();
            }}
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/5"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Logout
          </Button>
        </div>
      </motion.div>
    </>
  );
}