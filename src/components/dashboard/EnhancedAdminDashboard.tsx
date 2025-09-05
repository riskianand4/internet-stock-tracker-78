import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Package, Users, BarChart3, AlertTriangle, TrendingUp, ArrowUpRight, CheckCircle, Clock, FileText, ShoppingCart, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import WelcomeCard from '@/components/onboarding/WelcomeCard';
import { User } from '@/types/auth';
import { motion } from 'framer-motion';

interface EnhancedAdminDashboardProps {
  user: User;
  onStartTour?: () => void;
}

const EnhancedAdminDashboard: React.FC<EnhancedAdminDashboardProps> = ({ user, onStartTour }) => {
  const quickActions = [
    {
      title: 'Add New Product',
      description: 'Add products to inventory system',
      icon: Plus,
      href: '/products',
      color: 'bg-primary/5 hover:bg-primary/10 border-primary/20'
    },
    {
      title: 'Stock Adjustment',
      description: 'Adjust stock levels and track movements',
      icon: Package,
      href: '/stock-movement',
      color: 'bg-success/5 hover:bg-success/10 border-success/20'
    },
    {
      title: 'Vendor Management',
      description: 'Manage suppliers and purchase orders',
      icon: Truck,
      href: '/vendors',
      color: 'bg-accent/5 hover:bg-accent/10 border-accent/20'
    },
    {
      title: 'Generate Reports',
      description: 'Create inventory and stock reports',
      icon: FileText,
      href: '/stock-report',
      color: 'bg-warning/5 hover:bg-warning/10 border-warning/20'
    }
  ];

  const adminStats = [
    { label: 'Active Users', value: '45', icon: Users, trend: '+3', status: 'good' },
    { label: 'Products Managed', value: '1,247', icon: Package, trend: '+87', status: 'excellent' },
    { label: 'Pending Approvals', value: '12', icon: Clock, trend: '+4', status: 'warning' },
    { label: 'Low Stock Items', value: '8', icon: AlertTriangle, trend: '-2', status: 'critical' }
  ];

  const pendingApprovals = [
    { 
      id: 'SA-001', 
      type: 'Stock Adjustment', 
      product: 'Set Top Box Telnet TV',
      quantity: 50,
      requestedBy: 'John Doe',
      time: '2 hours ago',
      priority: 'high'
    },
    { 
      id: 'SA-002', 
      type: 'Stock Adjustment', 
      product: 'Fiber Optic Cable',
      quantity: -25,
      requestedBy: 'Jane Smith', 
      time: '4 hours ago',
      priority: 'medium'
    },
    { 
      id: 'PO-003', 
      type: 'Purchase Order', 
      product: 'Network Switch',
      quantity: 10,
      requestedBy: 'Admin System',
      time: '1 day ago',
      priority: 'low'
    }
  ];

  const recentActivities = [
    { message: 'Stock adjustment approved for Wireless Router', type: 'success', time: '10 min ago' },
    { message: 'New vendor registration: PT Telnet Suppliers', type: 'info', time: '1 hour ago' },
    { message: 'Low stock alert: Fiber Cable (5 remaining)', type: 'warning', time: '2 hours ago' },
    { message: 'Bulk inventory update completed', type: 'success', time: '3 hours ago' }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-success';
      case 'good': return 'text-primary';
      case 'warning': return 'text-warning';
      case 'critical': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: 'bg-destructive/10 text-destructive border-destructive/20',
      medium: 'bg-warning/10 text-warning border-warning/20',
      low: 'bg-success/10 text-success border-success/20'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'info': return <Package className="h-4 w-4 text-primary" />;
      default: return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
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
          <h2 className="text-2xl font-bold">Admin Control Panel</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
            <Button variant="outline" size="sm">
              <Users className="h-4 w-4 mr-2" />
              Manage Users
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {adminStats.map((stat) => (
            <Card key={stat.label} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className={`text-xs ${getStatusColor(stat.status)}`}>
                      {stat.trend} from last month
                    </p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${getStatusColor(stat.status)}`} />
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
                        <div className="flex-1">
                          <CardTitle className="text-base">{action.title}</CardTitle>
                          <CardDescription className="text-xs">{action.description}</CardDescription>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
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
                <Clock className="h-5 w-5" />
                Pending Approvals
                <Badge variant="destructive" className="ml-auto">
                  {pendingApprovals.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingApprovals.slice(0, 3).map((approval) => (
                  <div key={approval.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium">{approval.product}</p>
                        <Badge variant="outline" className={getPriorityBadge(approval.priority)}>
                          {approval.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {approval.type} • {approval.quantity > 0 ? '+' : ''}{approval.quantity} units
                      </p>
                      <p className="text-xs text-muted-foreground">
                        by {approval.requestedBy} • {approval.time}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" className="text-xs py-1 px-2 h-auto">
                        Approve
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs py-1 px-2 h-auto">
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-3" size="sm">
                View All Approvals
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest admin actions and system events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-2 rounded-lg bg-muted/50">
                    {getActivityIcon(activity.type)}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Inventory Health</CardTitle>
              <CardDescription>Key inventory metrics and health indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-4 bg-success/5 rounded-lg border border-success/20">
                  <div className="text-2xl font-bold text-success">98.5%</div>
                  <div className="text-sm text-muted-foreground">Stock Accuracy</div>
                  <div className="text-xs text-success mt-1">Excellent</div>
                </div>
                <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="text-2xl font-bold text-primary">12.5</div>
                  <div className="text-sm text-muted-foreground">Avg Turnover</div>
                  <div className="text-xs text-primary mt-1">Good</div>
                </div>
                <div className="text-center p-4 bg-warning/5 rounded-lg border border-warning/20">
                  <div className="text-2xl font-bold text-warning">8</div>
                  <div className="text-sm text-muted-foreground">Low Stock</div>
                  <div className="text-xs text-warning mt-1">Need Attention</div>
                </div>
                <div className="text-center p-4 bg-accent/5 rounded-lg border border-accent/20">
                  <div className="text-2xl font-bold text-accent">247</div>
                  <div className="text-sm text-muted-foreground">Active SKUs</div>
                  <div className="text-xs text-accent mt-1">+15 this month</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default EnhancedAdminDashboard;