import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Package, Users, BarChart3, Settings, AlertTriangle, TrendingUp, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import WelcomeCard from '@/components/onboarding/WelcomeCard';
import { User } from '@/types/auth';
import { motion } from 'framer-motion';

interface AdminDashboardProps {
  user: User;
  onStartTour?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onStartTour }) => {

  const quickActions = [
    {
      title: 'Add New Product',
      description: 'Add products to inventory system',
      icon: Plus,
      href: '/products',
      action: 'add',
      color: 'bg-primary-light hover:bg-primary-light/80 border-primary/20'
    },
    {
      title: 'Stock Management',
      description: 'Adjust stock levels and track movements',
      icon: Package,
      href: '/stock-movement',
      color: 'bg-success-light hover:bg-success-light/80 border-success/20'
    },
    {
      title: 'System Analytics',
      description: 'Monitor system performance and trends',
      icon: BarChart3,
      href: '/analytics',
      color: 'bg-accent-light hover:bg-accent-light/80 border-accent/20'
    },
    {
      title: 'Manage Users',
      description: 'View and manage system users',
      icon: Users,
      href: '/users',
      color: 'bg-warning-light hover:bg-warning-light/80 border-warning/20'
    }
  ];

  const adminStats = [
    { label: 'Total Users', value: '45', icon: Users, trend: '+3', color: 'text-blue-600' },
    { label: 'Products Managed', value: '1,247', icon: Package, trend: '+87', color: 'text-green-600' },
    { label: 'Critical Alerts', value: '8', icon: AlertTriangle, trend: '-2', color: 'text-red-600' },
    { label: 'System Health', value: '98%', icon: TrendingUp, trend: '+1%', color: 'text-purple-600' }
  ];

  const recentAlerts = [
    { message: 'Low stock: Wireless Headphones (5 remaining)', severity: 'high', time: '10 min ago' },
    { message: 'New user registration: John Doe', severity: 'info', time: '1 hour ago' },
    { message: 'Inventory adjustment completed', severity: 'success', time: '2 hours ago' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <WelcomeCard user={user} onStartTour={onStartTour || (() => {})} />
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">System Overview</h2>
          <Link to="/settings">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {adminStats.map((stat) => (
            <Card key={stat.label} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className={`text-xs ${stat.color}`}>{stat.trend} from last month</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <motion.div key={action.title} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card className={`cursor-pointer transition-all duration-200 ${action.color}`}>
                  <Link to={action.href}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <action.icon className="h-5 w-5 mt-0.5" />
                        <div>
                          <CardTitle className="text-base">{action.title}</CardTitle>
                          <CardDescription className="text-xs">{action.description}</CardDescription>
                        </div>
                        <ArrowUpRight className="h-4 w-4 ml-auto text-muted-foreground" />
                      </div>
                    </CardHeader>
                  </Link>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Recent Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentAlerts.map((alert, index) => (
                  <div key={index} className="flex items-start gap-3 p-2 rounded-lg bg-muted/50">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      alert.severity === 'high' ? 'bg-red-500' :
                      alert.severity === 'info' ? 'bg-blue-500' : 'bg-green-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/alerts">
                <Button variant="outline" className="w-full mt-3" size="sm">
                  View All Alerts
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>System Performance</CardTitle>
            <CardDescription>Key metrics and system health indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-success-light rounded-lg">
                <div className="text-2xl font-bold text-success">98.5%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
              <div className="text-center p-4 bg-primary-light rounded-lg">
                <div className="text-2xl font-bold text-primary">1.2s</div>
                <div className="text-sm text-muted-foreground">Avg Response</div>
              </div>
              <div className="text-center p-4 bg-accent-light rounded-lg">
                <div className="text-2xl font-bold text-accent">156</div>
                <div className="text-sm text-muted-foreground">Daily Actions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default AdminDashboard;