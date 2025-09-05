import React, { useState } from 'react';
import { motion } from 'framer-motion';
import MainLayout from '@/components/layout/MainLayout';
import ModernLoginPage from '@/components/auth/ModernLoginPage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, Plus, Download, Upload, AlertTriangle, Bell, 
  BellOff, Eye, Edit, Trash2, Filter, Settings, CheckCircle, Clock
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';

// Mock system alerts data
const mockSystemAlerts = [
  {
    id: 'sys-1',
    type: 'system',
    severity: 'high',
    title: 'Database Connection Issue',
    message: 'Database connection pool approaching maximum capacity',
    timestamp: new Date('2024-01-18T14:30:00'),
    isRead: false,
    isResolved: false,
    category: 'system_health'
  },
  {
    id: 'sys-2',
    type: 'security',
    severity: 'critical',
    title: 'Multiple Failed Login Attempts',
    message: 'User admin@telnet.co.id has 5 failed login attempts in the last 10 minutes',
    timestamp: new Date('2024-01-18T13:45:00'),
    isRead: true,
    isResolved: false,
    category: 'security'
  },
  {
    id: 'sys-3',
    type: 'performance',
    severity: 'medium',
    title: 'API Response Time Degradation',
    message: 'Average API response time has increased by 40% in the last hour',
    timestamp: new Date('2024-01-18T12:20:00'),
    isRead: true,
    isResolved: true,
    category: 'performance'
  }
];

export default function AlertsPage() {
  const { user, isAuthenticated } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);

  const [stockAlerts, setStockAlerts] = useState<any[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<any[]>([]);

  const allAlerts = [
    ...stockAlerts.map(alert => ({
      ...alert,
      title: `Stock Alert: ${alert.productName}`,
      timestamp: alert.date,
      category: 'inventory'
    })),
    ...mockSystemAlerts
  ];

  const filteredAlerts = allAlerts.filter(alert => {
    const matchesSearch = 
      alert.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = selectedSeverity === 'all' || alert.severity === selectedSeverity;
    const matchesType = selectedType === 'all' || alert.type === selectedType;
    const matchesReadStatus = !showOnlyUnread || !alert.isRead;
    return matchesSearch && matchesSeverity && matchesType && matchesReadStatus;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-warning text-warning-foreground';
      case 'medium': return 'bg-primary text-primary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'low_stock': return 'bg-warning text-warning-foreground';
      case 'out_of_stock': return 'bg-destructive text-destructive-foreground';
      case 'system': return 'bg-primary text-primary-foreground';
      case 'security': return 'bg-destructive text-destructive-foreground';
      case 'performance': return 'bg-info text-info-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const totalAlerts = allAlerts.length;
  const unreadAlerts = allAlerts.filter(alert => !alert.isRead).length;
  const criticalAlerts = allAlerts.filter(alert => alert.severity === 'critical').length;
  const resolvedAlerts = allAlerts.filter(alert => alert.isResolved).length;

  if (!isAuthenticated || !user) {
    return <ModernLoginPage />;
  }

  return (
    <ErrorBoundary>
      <MainLayout>
      <div className="mobile-responsive-spacing">
        {/* Header */}
        <motion.div 
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div>
            <h1 className="mobile-responsive-text font-bold text-foreground">Peringatan & Notifikasi</h1>
            <p className="text-muted-foreground text-sm md:text-base">Monitor alert sistem dan konfigurasi notifikasi</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Buat Alert
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Buat Alert Baru</DialogTitle>
                  <DialogDescription>Buat custom alert atau reminder</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="alertType">Tipe Alert</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tipe alert" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="system">System Alert</SelectItem>
                        <SelectItem value="inventory">Inventory Alert</SelectItem>
                        <SelectItem value="reminder">Reminder</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="severity">Severity</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tingkat severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="title">Judul Alert</Label>
                    <Input id="title" placeholder="Masukkan judul alert" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="message">Pesan</Label>
                    <Textarea id="message" placeholder="Deskripsi detail alert..." />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Batal</Button>
                  <Button>Buat Alert</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Pengaturan
            </Button>
          </div>
        </motion.div>

        {/* Overview Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="bg-primary/10 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Alert</CardTitle>
              <Bell className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{totalAlerts}</div>
              <p className="text-xs text-muted-foreground">Total alert aktif</p>
            </CardContent>
          </Card>

          <Card className="bg-warning/10 border-warning/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Belum Dibaca</CardTitle>
              <BellOff className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{unreadAlerts}</div>
              <p className="text-xs text-muted-foreground">Alert belum dibaca</p>
            </CardContent>
          </Card>

          <Card className="bg-destructive/10 border-destructive/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kritikal</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{criticalAlerts}</div>
              <p className="text-xs text-muted-foreground">Alert critical</p>
            </CardContent>
          </Card>

          <Card className="bg-success/10 border-success/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Diselesaikan</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{resolvedAlerts}</div>
              <p className="text-xs text-muted-foreground">Alert diselesaikan</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search and Filters */}
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Cari alert berdasarkan judul atau pesan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-muted/50"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:flex lg:flex-wrap gap-2 md:gap-4">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value="low_stock">Low Stock</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Severity</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2 col-span-2 md:col-span-1 lg:w-auto">
              <Switch
                id="unread-only"
                checked={showOnlyUnread}
                onCheckedChange={setShowOnlyUnread}
              />
              <Label htmlFor="unread-only" className="text-sm">Belum dibaca saja</Label>
            </div>
          </div>
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Tabs defaultValue="alerts" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="alerts">Peringatan</TabsTrigger>
              <TabsTrigger value="settings">Pengaturan Notifikasi</TabsTrigger>
            </TabsList>

            <TabsContent value="alerts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Daftar Alert</CardTitle>
                  <CardDescription>
                    Alert sistem, stok, dan notifikasi lainnya
                    {filteredAlerts.length !== totalAlerts && (
                      <span className="ml-2 text-primary">
                        ({filteredAlerts.length} dari {totalAlerts} alert)
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Tipe</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Judul</TableHead>
                        <TableHead>Pesan</TableHead>
                        <TableHead>Waktu</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAlerts.map((alert) => (
                        <TableRow key={alert.id} className={!alert.isRead ? 'bg-muted/30' : ''}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {!alert.isRead && <div className="w-2 h-2 bg-primary rounded-full"></div>}
                              {alert.isResolved ? (
                                <CheckCircle className="w-4 h-4 text-success" />
                              ) : (
                                <Clock className="w-4 h-4 text-warning" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getTypeColor(alert.type)}>
                              {alert.type.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getSeverityColor(alert.severity)}>
                              {alert.severity}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium max-w-xs truncate">
                            {alert.title || `${alert.type} Alert`}
                          </TableCell>
                          <TableCell className="max-w-md truncate">
                            {alert.message}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {alert.timestamp.toLocaleString('id-ID')}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  console.log('View alert:', alert);
                                  // Mark as read and show alert details
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              {!alert.isRead && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    console.log('Mark as read:', alert);
                                    // Mark alert as read
                                  }}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              )}
                              {(user?.role === 'admin' || user?.role === 'super_admin') && !alert.isResolved && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    console.log('Edit/resolve alert:', alert);
                                    // Open edit/resolve dialog
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pengaturan Notifikasi</CardTitle>
                  <CardDescription>Konfigurasi preferensi notifikasi</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Tipe</TableHead>
                        <TableHead>Frekuensi</TableHead>
                        <TableHead>Threshold</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {notificationSettings.map((setting) => (
                        <TableRow key={setting.id}>
                          <TableCell className="capitalize font-medium">
                            {setting.category.replace('_', ' ')}
                          </TableCell>
                          <TableCell className="capitalize">
                            <Badge variant="outline">
                              {setting.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="capitalize">{setting.frequency}</TableCell>
                          <TableCell>{setting.threshold || '-'}</TableCell>
                          <TableCell>
                            <Switch
                              checked={setting.enabled}
                              disabled={user?.role === 'user'}
                            />
                          </TableCell>
                          <TableCell>
                            {(user?.role === 'admin' || user?.role === 'super_admin') && (
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </MainLayout>
    </ErrorBoundary>
  );
}