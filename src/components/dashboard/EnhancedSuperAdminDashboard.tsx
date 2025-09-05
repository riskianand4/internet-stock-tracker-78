import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Crown, Users, Database, Settings, Activity, AlertTriangle, TrendingUp, ArrowUpRight, Server, Eye, Lock, Globe, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import WelcomeCard from '@/components/onboarding/WelcomeCard';
import { User } from '@/types/auth';
import { motion } from 'framer-motion';

interface EnhancedSuperAdminDashboardProps {
  user: User;
  onStartTour?: () => void;
}

const EnhancedSuperAdminDashboard: React.FC<EnhancedSuperAdminDashboardProps> = ({ user, onStartTour }) => {

  const systemActions = [
    {
      title: 'User Management',
      description: 'Manage all system users and permissions',
      icon: Users,
      href: '/users',
      color: 'bg-primary/5 hover:bg-primary/10 border-primary/20',
      priority: 'high'
    },
    {
      title: 'Security Center',
      description: 'Security logs, audit trails and access controls',
      icon: Shield,
      href: '/security',
      color: 'bg-destructive/5 hover:bg-destructive/10 border-destructive/20',
      priority: 'critical'
    },
    {
      title: 'Database Health',
      description: 'Monitor database performance and integrity',
      icon: Database,
      href: '/database',
      color: 'bg-success/5 hover:bg-success/10 border-success/20',
      priority: 'medium'
    },
    {
      title: 'Global Analytics',
      description: 'Cross-organization analytics and insights',
      icon: BarChart3,
      href: '/analytics',
      color: 'bg-accent/5 hover:bg-accent/10 border-accent/20',
      priority: 'medium'
    },
    {
      title: 'System Settings',
      description: 'Configure global system parameters',
      icon: Settings,
      href: '/settings',
      color: 'bg-warning/5 hover:bg-warning/10 border-warning/20',
      priority: 'high'
    },
    {
      title: 'Admin Monitor',
      description: 'Monitor admin activities and permissions',
      icon: Eye,
      href: '/admin-monitor',
      color: 'bg-accent/5 hover:bg-accent/10 border-accent/20',
      priority: 'high'
    }
  ];

  const systemMetrics = [
    { label: 'Total Users', value: '247', icon: Users, trend: '+12', status: 'good' },
    { label: 'System Load', value: '23%', icon: Server, trend: '-5%', status: 'excellent' },
    { label: 'Security Alerts', value: '2', icon: AlertTriangle, trend: '-8', status: 'warning' },
    { label: 'Data Integrity', value: '100%', icon: Database, trend: '0%', status: 'excellent' },
    { label: 'Active Admins', value: '8', icon: Shield, trend: '+1', status: 'good' },
    { label: 'Global Locations', value: '3', icon: Globe, trend: '0', status: 'good' }
  ];

  const adminActivities = [
    { 
      admin: 'Admin John',
      action: 'Approved stock adjustment for 50 units', 
      location: 'Banda Aceh Main',
      time: '15 min ago',
      risk: 'low'
    },
    { 
      admin: 'Admin Sarah',
      action: 'Created new vendor: PT Supplier Network', 
      location: 'Banda Aceh Branch',
      time: '1 hour ago',
      risk: 'medium'
    },
    { 
      admin: 'Admin Mike',
      action: 'Modified user permissions for 3 users', 
      location: 'System Wide',
      time: '2 hours ago',
      risk: 'high'
    }
  ];

  const criticalAlerts = [
    { 
      message: 'Multiple failed login attempts detected from IP 192.168.1.100', 
      severity: 'critical', 
      time: '5 min ago',
      action: 'Block IP',
      affected: 'Security System'
    },
    { 
      message: 'Database backup completed successfully', 
      severity: 'success', 
      time: '30 min ago',
      action: 'View Log',
      affected: 'Database System'
    },
    { 
      message: 'Admin John exceeded stock adjustment limits', 
      severity: 'warning', 
      time: '1 hour ago',
      action: 'Review',
      affected: 'Inventory System'
    },
    { 
      message: 'System update available: v2.1.3', 
      severity: 'info', 
      time: '2 hours ago',
      action: 'Update',
      affected: 'System Core'
    }
  ];

  const globalInventoryStats = [
    { location: 'Banda Aceh Main', products: 1247, alerts: 3, health: 98 },
    { location: 'Banda Aceh Branch', products: 892, alerts: 1, health: 99 },
    { location: 'Aceh Besar Warehouse', products: 534, alerts: 5, health: 95 }
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
      critical: 'bg-destructive/10 text-destructive border-destructive/20',
      high: 'bg-warning/10 text-warning border-warning/20',
      medium: 'bg-primary/10 text-primary border-primary/20',
      low: 'bg-success/10 text-success border-success/20'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 98) return 'text-success';
    if (health >= 95) return 'text-primary';
    if (health >= 90) return 'text-warning';
    return 'text-destructive';
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
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Crown className="h-6 w-6 text-accent" />
            Super Admin Command Center
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Activity className="h-4 w-4 mr-2" />
              System Logs
            </Button>
            <Button variant="outline" size="sm">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {systemMetrics.map((metric) => (
            <Card key={metric.label} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <p className={`text-xs ${getStatusColor(metric.status)}`}>
                      {metric.trend} {metric.status}
                    </p>
                  </div>
                  <metric.icon className={`h-8 w-8 ${getStatusColor(metric.status)}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <h2 className="text-xl font-bold mb-4">System Administration</h2>
          <div className="grid grid-cols-1 gap-3">
            {systemActions.map((action) => (
              <motion.div key={action.title} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card className={`cursor-pointer transition-all duration-200 ${action.color}`}>
                  <Link to={action.href}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <action.icon className="h-5 w-5 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-base">{action.title}</CardTitle>
                            <Badge variant="outline" className={getPriorityBadge(action.priority)}>
                              {action.priority}
                            </Badge>
                          </div>
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
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Critical System Alerts
                <Badge variant="destructive" className="ml-auto">
                  {criticalAlerts.filter(a => a.severity === 'critical').length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {criticalAlerts.map((alert, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border">
                    <div className={`w-3 h-3 rounded-full mt-1.5 ${
                      alert.severity === 'critical' ? 'bg-destructive' :
                      alert.severity === 'warning' ? 'bg-warning' :
                      alert.severity === 'success' ? 'bg-success' : 'bg-primary'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alert.message}</p>
                      <div className="flex justify-between items-center mt-2">
                        <div>
                          <p className="text-xs text-muted-foreground">{alert.time}</p>
                          <p className="text-xs text-muted-foreground">Affected: {alert.affected}</p>
                        </div>
                        <Button variant="outline" size="sm" className="text-xs py-1 px-2 h-auto">
                          {alert.action}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/security">
                <Button variant="outline" className="w-full mt-3" size="sm">
                  View Security Center
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Admin Activity Monitor
              </CardTitle>
              <CardDescription>Recent admin actions across all locations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {adminActivities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border">
                    <Shield className="h-4 w-4 mt-1 text-primary" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium">{activity.admin}</p>
                        <Badge variant="outline" className={`text-xs ${getRiskColor(activity.risk)}`}>
                          {activity.risk} risk
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{activity.action}</p>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-muted-foreground">{activity.location}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-3" size="sm">
                View Full Admin Log
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Multi-Location Oversight
              </CardTitle>
              <CardDescription>Global inventory health across all locations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {globalInventoryStats.map((location, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">{location.location}</p>
                        <span className={`text-sm font-bold ${getHealthColor(location.health)}`}>
                          {location.health}%
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{location.products} products</span>
                        <span>{location.alerts} alerts</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 mt-2">
                        <div 
                          className={`h-2 rounded-full ${location.health >= 98 ? 'bg-success' : 
                            location.health >= 95 ? 'bg-primary' : 
                            location.health >= 90 ? 'bg-warning' : 'bg-destructive'}`}
                          style={{ width: `${location.health}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-3" size="sm">
                View Global Dashboard
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Global System Health</CardTitle>
            <CardDescription>Real-time system performance and health monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-success/5 rounded-lg border border-success/20">
                <div className="text-2xl font-bold text-success">99.9%</div>
                <div className="text-sm text-muted-foreground">System Uptime</div>
                <div className="text-xs text-success mt-1">Excellent</div>
              </div>
              <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="text-2xl font-bold text-primary">847ms</div>
                <div className="text-sm text-muted-foreground">Avg Response</div>
                <div className="text-xs text-primary mt-1">Good</div>
              </div>
              <div className="text-center p-4 bg-accent/5 rounded-lg border border-accent/20">
                <div className="text-2xl font-bold text-accent">2.1GB</div>
                <div className="text-sm text-muted-foreground">Memory Usage</div>
                <div className="text-xs text-accent mt-1">Normal</div>
              </div>
              <div className="text-center p-4 bg-warning/5 rounded-lg border border-warning/20">
                <div className="text-2xl font-bold text-warning">1,247</div>
                <div className="text-sm text-muted-foreground">Active Sessions</div>
                <div className="text-xs text-warning mt-1">+15% today</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default EnhancedSuperAdminDashboard;