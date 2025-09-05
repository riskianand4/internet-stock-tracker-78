import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ModernLoginPage from '@/components/auth/ModernLoginPage';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Shield, Users, Activity, AlertTriangle, Clock, Filter, Download, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

const AdminMonitorPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  if (!user) {
    return <ModernLoginPage />;
  }

  if (user.role !== 'super_admin') {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <Card className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You don't have permission to access this page.</p>
          </Card>
        </div>
      </MainLayout>
    );
  }

  const adminActivities = [
    {
      id: 'ACT-001',
      admin: 'Admin John',
      userId: 'ADM-001',
      action: 'Approved stock adjustment for Set Top Box Telnet TV',
      type: 'stock_adjustment',
      details: { quantity: 50, product: 'Set Top Box Telnet TV', reason: 'Physical count adjustment' },
      timestamp: '2024-01-15 14:30:00',
      location: 'Banda Aceh Main',
      ipAddress: '192.168.1.100',
      risk: 'medium',
      status: 'completed'
    },
    {
      id: 'ACT-002',
      admin: 'Admin Sarah',
      userId: 'ADM-002', 
      action: 'Created new vendor: PT Supplier Network',
      type: 'vendor_management',
      details: { vendorName: 'PT Supplier Network', contact: 'vendor@supplier.co.id' },
      timestamp: '2024-01-15 13:15:00',
      location: 'Banda Aceh Branch',
      ipAddress: '192.168.1.101',
      risk: 'low',
      status: 'completed'
    },
    {
      id: 'ACT-003',
      admin: 'Admin Mike',
      userId: 'ADM-003',
      action: 'Modified user permissions for 3 users',
      type: 'user_management',
      details: { affectedUsers: ['USR-001', 'USR-002', 'USR-003'], changes: 'Added inventory_read permission' },
      timestamp: '2024-01-15 12:45:00',
      location: 'System Wide',
      ipAddress: '192.168.1.102',
      risk: 'high',
      status: 'completed'
    },
    {
      id: 'ACT-004',
      admin: 'Admin Lisa',
      userId: 'ADM-004',
      action: 'Attempted bulk product update',
      type: 'bulk_operation',
      details: { productCount: 150, operation: 'price_update', status: 'failed' },
      timestamp: '2024-01-15 11:20:00',
      location: 'Banda Aceh Main',
      ipAddress: '192.168.1.103',
      risk: 'medium',
      status: 'failed'
    }
  ];

  const adminStats = [
    { label: 'Active Admins', value: '8', change: '+1', status: 'good' },
    { label: 'Today Actions', value: '247', change: '+15%', status: 'excellent' },
    { label: 'Failed Actions', value: '3', change: '-2', status: 'warning' },
    { label: 'High Risk Actions', value: '12', change: '+4', status: 'critical' }
  ];

  const adminPermissions = [
    {
      admin: 'Admin John',
      role: 'Inventory Admin',
      permissions: ['stock_read', 'stock_write', 'product_manage', 'vendor_read'],
      lastLogin: '2024-01-15 14:30:00',
      status: 'active',
      location: 'Banda Aceh Main'
    },
    {
      admin: 'Admin Sarah',
      role: 'Vendor Admin', 
      permissions: ['vendor_read', 'vendor_write', 'purchase_orders', 'reports_basic'],
      lastLogin: '2024-01-15 13:15:00',
      status: 'active',
      location: 'Banda Aceh Branch'
    },
    {
      admin: 'Admin Mike',
      role: 'User Admin',
      permissions: ['user_read', 'user_write', 'permission_manage', 'audit_read'],
      lastLogin: '2024-01-15 12:45:00',
      status: 'active',
      location: 'System Wide'
    }
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium': return 'bg-warning/10 text-warning border-warning/20';
      case 'low': return 'bg-success/10 text-success border-success/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-success';
      case 'failed': return 'text-destructive';
      case 'pending': return 'text-warning';
      default: return 'text-muted-foreground';
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'stock_adjustment': return <Activity className="h-4 w-4" />;
      case 'vendor_management': return <Users className="h-4 w-4" />;
      case 'user_management': return <Shield className="h-4 w-4" />;
      case 'bulk_operation': return <AlertTriangle className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <motion.div 
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Eye className="h-8 w-8 text-primary" />
              Admin Activity Monitor
            </h1>
            <p className="text-muted-foreground">Monitor and audit all admin activities across the system</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {adminStats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className={`text-xs ${stat.status === 'excellent' ? 'text-success' : 
                      stat.status === 'good' ? 'text-primary' :
                      stat.status === 'warning' ? 'text-warning' : 'text-destructive'}`}>
                      {stat.change} from yesterday
                    </p>
                  </div>
                  <Shield className={`h-8 w-8 ${stat.status === 'excellent' ? 'text-success' : 
                    stat.status === 'good' ? 'text-primary' :
                    stat.status === 'warning' ? 'text-warning' : 'text-destructive'}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="activities" className="space-y-4">
          <TabsList>
            <TabsTrigger value="activities">Recent Activities</TabsTrigger>
            <TabsTrigger value="permissions">Admin Permissions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="activities" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Admin Activity Log</CardTitle>
                    <CardDescription>Real-time monitoring of all admin actions</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search activities..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 w-64"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {adminActivities.map((activity) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        {getActionIcon(activity.type)}
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-foreground">{activity.admin}</p>
                              <Badge variant="outline" className={getRiskColor(activity.risk)}>
                                {activity.risk} risk
                              </Badge>
                              <Badge variant="outline" className={getStatusColor(activity.status)}>
                                {activity.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{activity.action}</p>
                          </div>
                          <div className="text-right text-xs text-muted-foreground">
                            <p>{activity.timestamp}</p>
                            <p>{activity.location}</p>
                          </div>
                        </div>
                        
                        <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                          <p><strong>Details:</strong> {JSON.stringify(activity.details)}</p>
                          <p><strong>IP:</strong> {activity.ipAddress}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Admin Permissions Overview</CardTitle>
                <CardDescription>Current permissions and access levels for all admins</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {adminPermissions.map((admin) => (
                    <motion.div
                      key={admin.admin}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border rounded-lg space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{admin.admin}</h3>
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                          {admin.status}
                        </Badge>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Role</p>
                        <p className="text-sm">{admin.role}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Location</p>
                        <p className="text-sm">{admin.location}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Last Login</p>
                        <p className="text-xs">{admin.lastLogin}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Permissions</p>
                        <div className="flex flex-wrap gap-1">
                          {admin.permissions.map((permission) => (
                            <Badge key={permission} variant="secondary" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <Button variant="outline" size="sm" className="w-full">
                        Manage Permissions
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Action Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Stock Adjustments</span>
                      <span className="font-medium">45%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '45%' }} />
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">User Management</span>
                      <span className="font-medium">30%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-success h-2 rounded-full" style={{ width: '30%' }} />
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Vendor Management</span>
                      <span className="font-medium">25%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-warning h-2 rounded-full" style={{ width: '25%' }} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Risk Level Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-success/5 rounded-lg border border-success/20">
                      <div className="text-2xl font-bold text-success">156</div>
                      <div className="text-xs text-muted-foreground">Low Risk</div>
                    </div>
                    <div className="p-3 bg-warning/5 rounded-lg border border-warning/20">
                      <div className="text-2xl font-bold text-warning">48</div>
                      <div className="text-xs text-muted-foreground">Medium Risk</div>
                    </div>
                    <div className="p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                      <div className="text-2xl font-bold text-destructive">12</div>
                      <div className="text-xs text-muted-foreground">High Risk</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default AdminMonitorPage;