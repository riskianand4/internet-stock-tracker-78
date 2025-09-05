import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MainLayout from '@/components/layout/MainLayout';
import ModernLoginPage from '@/components/auth/ModernLoginPage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Settings, Save, Download, Upload, Database, 
  Shield, Bell, Plug, Eye, Edit, Trash2, RefreshCw
} from 'lucide-react';
import { settingsApi } from '@/services/settingsApi';
import { useApp } from '@/contexts/AppContext';
import ApiConfiguration from '@/components/settings/ApiConfiguration';
import ApiSetupGuide from '@/components/setup/ApiSetupGuide';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';

export default function SettingsPage() {
  const { user, isAuthenticated, isConfigured, isOnline } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('general');
  const [systemSettings, setSystemSettings] = useState<any[]>([]);
  const [backupSettings, setBackupSettings] = useState<any[]>([]);
  const [integrationSettings, setIntegrationSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!isConfigured || !isOnline) return;
      
      setLoading(true);
      try {
        const [system, backup, integration] = await Promise.all([
          settingsApi.getSystemSettings(),
          settingsApi.getBackupSettings(),
          settingsApi.getIntegrationSettings()
        ]);
        setSystemSettings(system);
        setBackupSettings(backup);
        setIntegrationSettings(integration);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [isConfigured, isOnline]);

  const filteredSettings = systemSettings.filter(setting =>
    setting.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    setting.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'general': return 'bg-primary text-primary-foreground';
      case 'inventory': return 'bg-success text-success-foreground';
      case 'notifications': return 'bg-warning text-warning-foreground';
      case 'security': return 'bg-destructive text-destructive-foreground';
      case 'integrations': return 'bg-info text-info-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success text-success-foreground';
      case 'inactive': return 'bg-muted text-muted-foreground';
      case 'error': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (!isAuthenticated || !user) {
    return <ModernLoginPage />;
  }

  return (
    <ErrorBoundary>
      <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div 
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground">Pengaturan Sistem</h1>
            <p className="text-muted-foreground">Konfigurasi sistem, backup, dan integrasi</p>
          </div>
          <div className="flex gap-2">
            <Button>
              <Save className="w-4 h-4 mr-2" />
              Simpan Semua
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Config
            </Button>
          </div>
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="general">Umum</TabsTrigger>
              <TabsTrigger value="api" className="relative">
                API
                {!isConfigured && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-warning rounded-full" />
                )}
              </TabsTrigger>
              <TabsTrigger value="backup">Backup</TabsTrigger>
              <TabsTrigger value="integrations">Integrasi</TabsTrigger>
              <TabsTrigger value="security">Keamanan</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pengaturan Umum</CardTitle>
                  <CardDescription>Konfigurasi dasar sistem</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pengaturan</TableHead>
                        <TableHead>Nilai</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Deskripsi</TableHead>
                        <TableHead>Diperbarui</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSettings.map((setting) => (
                        <TableRow key={setting.id}>
                          <TableCell className="font-medium">{setting.key}</TableCell>
                          <TableCell>
                            {setting.type === 'boolean' ? (
                              <Switch checked={setting.value} disabled={user?.role === 'user'} />
                            ) : (
                              <span className="text-sm">{JSON.stringify(setting.value)}</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={getCategoryColor(setting.category)}>
                              {setting.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-md truncate">{setting.description}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {setting.updatedAt.toLocaleDateString('id-ID')}
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

            <TabsContent value="api" className="space-y-4">
              {!isConfigured || !isOnline ? (
                <ApiSetupGuide onNavigateToSettings={() => setActiveTab('api')} />
              ) : null}
              <ApiConfiguration />
            </TabsContent>

            <TabsContent value="backup" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pengaturan Backup</CardTitle>
                  <CardDescription>Konfigurasi backup otomatis</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead>Tipe</TableHead>
                        <TableHead>Frekuensi</TableHead>
                        <TableHead>Lokasi</TableHead>
                        <TableHead>Backup Terakhir</TableHead>
                        <TableHead>Backup Berikutnya</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {backupSettings.map((backup) => (
                        <TableRow key={backup.id}>
                          <TableCell className="font-medium">{backup.name}</TableCell>
                          <TableCell className="capitalize">{backup.type}</TableCell>
                          <TableCell className="capitalize">{backup.frequency}</TableCell>
                          <TableCell className="capitalize">
                            <Badge variant={backup.location === 'cloud' ? 'default' : 'secondary'}>
                              {backup.location}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {backup.lastBackup?.toLocaleString('id-ID') || '-'}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {backup.nextBackup.toLocaleString('id-ID')}
                          </TableCell>
                          <TableCell>
                            <Switch checked={backup.enabled} disabled={user?.role === 'user'} />
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {(user?.role === 'admin' || user?.role === 'super_admin') && (
                                <>
                                  <Button variant="ghost" size="sm">
                                    <RefreshCw className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </>
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

            <TabsContent value="integrations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Integrasi Sistem</CardTitle>
                  <CardDescription>Konfigurasi integrasi dengan sistem eksternal</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Integrasi</TableHead>
                        <TableHead>Tipe</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Sync Terakhir</TableHead>
                        <TableHead>Endpoint</TableHead>
                        <TableHead>Diaktifkan</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {integrationSettings.map((integration) => (
                        <TableRow key={integration.id}>
                          <TableCell className="font-medium">{integration.name}</TableCell>
                          <TableCell className="capitalize">
                            <Badge variant="outline">{integration.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(integration.status)}>
                              {integration.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {integration.lastSync?.toLocaleString('id-ID') || '-'}
                          </TableCell>
                          <TableCell className="max-w-md truncate text-sm">
                            {integration.endpoint || '-'}
                          </TableCell>
                          <TableCell>
                            <Switch checked={integration.enabled} disabled={user?.role === 'user'} />
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              {(user?.role === 'admin' || user?.role === 'super_admin') && (
                                <>
                                  <Button variant="ghost" size="sm">
                                    <RefreshCw className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </>
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

            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pengaturan Keamanan</CardTitle>
                  <CardDescription>Konfigurasi keamanan sistem</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label>Session Timeout (jam)</Label>
                      <Input type="number" defaultValue="8" disabled={user?.role === 'user'} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Maksimum Percobaan Login</Label>
                      <Input type="number" defaultValue="5" disabled={user?.role === 'user'} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Kebijakan Password</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Switch defaultChecked disabled={user?.role === 'user'} />
                          <Label>Wajib huruf besar</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch defaultChecked disabled={user?.role === 'user'} />
                          <Label>Wajib angka</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch defaultChecked disabled={user?.role === 'user'} />
                          <Label>Wajib karakter khusus</Label>
                        </div>
                      </div>
                    </div>
                  </div>
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