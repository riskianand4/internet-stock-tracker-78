import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ModernLoginPage from '@/components/auth/ModernLoginPage';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Home, Package, BarChart3, TrendingUp, Archive, AlertTriangle, 
  FileText, Users, Settings, Database, Shield, Brain, Key, 
  Search, BookOpen, Info, Zap, Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageDoc {
  id: string;
  title: string;
  path: string;
  icon: React.ComponentType<any>;
  category: string;
  roles: string[];
  description: string;
  features: string[];
  useCases: string[];
  howToUse: string[];
  tips: string[];
}

const DocumentationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  if (!user) {
    return <ModernLoginPage />;
  }

  const pageDocumentation: PageDoc[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      path: '/',
      icon: Home,
      category: 'overview',
      roles: ['user', 'admin', 'super_admin'],
      description: 'Halaman utama yang menampilkan ringkasan lengkap dari seluruh sistem inventori. Dashboard memberikan gambaran cepat tentang kondisi stok, statistik penting, dan akses cepat ke fitur-fitur utama.',
      features: [
        'Statistik stok real-time (total produk, nilai inventori, stok rendah)',
        'Grafik tren penjualan dan pergerakan stok',
        'Produk dengan stok rendah dan habis',
        'Notifikasi dan alert penting',
        'Quick actions untuk operasi sehari-hari',
        'Widget analytics dan insights',
        'Recent activities dan stock movements'
      ],
      useCases: [
        'Melihat kondisi inventori secara keseluruhan setiap pagi',
        'Monitoring KPI dan target operasional',
        'Identifikasi cepat masalah stok atau alert',
        'Akses cepat ke fitur yang sering digunakan',
        'Review performa harian/mingguan'
      ],
      howToUse: [
        '1. Login ke sistem menggunakan kredensial yang diberikan',
        '2. Dashboard akan menampilkan overview lengkap saat pertama kali masuk',
        '3. Perhatikan card statistik di bagian atas untuk info cepat',
        '4. Gunakan grafik untuk melihat tren dan pattern',
        '5. Check bagian alert untuk masalah yang perlu perhatian',
        '6. Gunakan quick actions untuk operasi cepat',
        '7. Filter data berdasarkan periode waktu yang diinginkan'
      ],
      tips: [
        'Bookmark dashboard sebagai halaman utama',
        'Set refresh otomatis untuk data real-time',
        'Perhatikan alert merah yang memerlukan tindakan segera',
        'Gunakan widget favorit untuk monitoring KPI'
      ]
    },
    {
      id: 'products',
      title: 'Products',
      path: '/products',
      icon: Package,
      category: 'inventory',
      roles: ['user', 'admin', 'super_admin'],
      description: 'Pusat manajemen produk yang komprehensif untuk mengelola seluruh katalog inventori. Halaman ini memungkinkan penambahan, pengeditan, pencarian, dan pengelolaan detail produk dengan fitur-fitur canggih.',
      features: [
        'Daftar produk lengkap dengan search dan filter',
        'Tambah produk baru dengan form detail',
        'Edit informasi produk (nama, harga, kategori, dll)',
        'Upload dan manajemen gambar produk',
        'Kategori dan sub-kategori produk',
        'Barcode dan SKU management',
        'Bulk operations (import/export Excel)',
        'Product status tracking',
        'Supplier information',
        'Stock level indicators'
      ],
      useCases: [
        'Menambahkan produk baru yang akan dijual',
        'Update harga produk secara berkala',
        'Mengorganisir produk berdasarkan kategori',
        'Import produk dalam jumlah besar via Excel',
        'Mencari produk specific dengan filter',
        'Mengelola informasi supplier',
        'Update stock minimum untuk auto-reorder'
      ],
      howToUse: [
        '1. Klik menu "Products" di sidebar',
        '2. Gunakan search bar untuk mencari produk tertentu',
        '3. Apply filter berdasarkan kategori, status, atau supplier',
        '4. Klik "Add Product" untuk menambah produk baru',
        '5. Isi form dengan informasi lengkap produk',
        '6. Upload gambar produk untuk identifikasi visual',
        '7. Set minimum stock level untuk alert otomatis',
        '8. Save dan produk akan masuk ke sistem',
        '9. Gunakan bulk actions untuk operasi massal'
      ],
      tips: [
        'Gunakan SKU yang konsisten untuk tracking',
        'Set foto produk yang jelas untuk identifikasi',
        'Update harga secara berkala sesuai market',
        'Gunakan kategori yang terorganisir untuk pencarian mudah',
        'Set minimum stock yang realistis untuk business continuity'
      ]
    },
    {
      id: 'analytics',
      title: 'Analytics & Stats',
      path: '/stats',
      icon: BarChart3,
      category: 'reporting',
      roles: ['user', 'admin', 'super_admin'],
      description: 'Pusat analisis data dan pelaporan yang memberikan insights mendalam tentang performa inventori, tren penjualan, dan metrics bisnis penting untuk pengambilan keputusan strategis.',
      features: [
        'Dashboard analytics dengan multiple charts',
        'Sales performance analysis',
        'Inventory turnover reports',
        'Product performance ranking',
        'Trend analysis (daily, weekly, monthly)',
        'Comparative analysis antar periode',
        'Forecasting dan demand prediction',
        'Cost analysis dan profit margins',
        'Supplier performance metrics',
        'Custom date range filtering'
      ],
      useCases: [
        'Analisis performa penjualan bulanan',
        'Identifikasi produk best seller dan slow moving',
        'Perencanaan inventory untuk periode mendatang',
        'Evaluasi supplier performance',
        'Monitoring ROI dan profit margins',
        'Seasonal analysis untuk planning',
        'Budget planning dan forecasting'
      ],
      howToUse: [
        '1. Akses menu "Analytics" dari sidebar',
        '2. Pilih periode analisis yang diinginkan',
        '3. Gunakan filter untuk focus pada area tertentu',
        '4. Review charts dan graphs untuk insights',
        '5. Compare data dengan periode sebelumnya',
        '6. Export reports untuk presentation',
        '7. Set up alerts untuk metrics penting',
        '8. Gunakan forecasting untuk planning'
      ],
      tips: [
        'Compare data YoY untuk trend jangka panjang',
        'Focus pada metrics yang actionable',
        'Set target untuk monitoring performance',
        'Use forecasting untuk inventory planning',
        'Regular review untuk continuous improvement'
      ]
    },
    {
      id: 'stock-movement',
      title: 'Stock Movement',
      path: '/stock-movement',
      icon: TrendingUp,
      category: 'inventory',
      roles: ['admin', 'super_admin'],
      description: 'Sistem tracking komprehensif untuk semua pergerakan stok masuk dan keluar. Memberikan audit trail lengkap dan analisis velocity stok untuk optimasi inventory management.',
      features: [
        'Real-time stock movement tracking',
        'IN/OUT/ADJUSTMENT/TRANSFER logging',
        'Detailed transaction history',
        'Stock velocity analysis',
        'Movement categorization dan filtering',
        'User activity tracking',
        'Cost impact analysis',
        'Location-based movements',
        'Batch processing untuk bulk movements',
        'Export detailed reports'
      ],
      useCases: [
        'Tracking semua perubahan stok secara detail',
        'Audit untuk compliance dan verification',
        'Analisis pattern pergerakan stok',
        'Identifikasi fast/slow moving items',
        'Monitoring user activities',
        'Investigating discrepancies',
        'Supplier delivery verification'
      ],
      howToUse: [
        '1. Akses "Stock Movement" dari menu utama',
        '2. View real-time movements di dashboard',
        '3. Filter berdasarkan type, date, atau product',
        '4. Click individual movement untuk detail',
        '5. Analyze velocity patterns untuk insights',
        '6. Export data untuk external analysis',
        '7. Set up alerts untuk unusual movements',
        '8. Review audit trail untuk compliance'
      ],
      tips: [
        'Regular monitoring untuk detect anomalies',
        'Use velocity analysis untuk reorder optimization',
        'Track seasonal patterns untuk forecasting',
        'Monitor high-value items closely',
        'Maintain audit trail untuk accountability'
      ]
    },
    {
      id: 'stock-opname',
      title: 'Stock Opname',
      path: '/stock-opname',
      icon: Archive,
      category: 'inventory',
      roles: ['admin', 'super_admin'],
      description: 'Sistem stock taking fisik yang komprehensif untuk verifikasi dan adjustment stok. Mendukung input manual dan import data untuk proses stock opname yang efisien dan akurat.',
      features: [
        'Physical stock count sessions',
        'Manual input per-item counting',
        'Excel/CSV import untuk bulk counting',
        'System vs physical stock comparison',
        'Variance detection dan analysis',
        'Automatic adjustment generation',
        'Multi-location support',
        'Count validation dan approval workflow',
        'Detailed variance reports',
        'Historical opname tracking'
      ],
      useCases: [
        'Stock taking bulanan atau tahunan',
        'Cycle counting untuk high-value items',
        'Reconciliation setelah audit',
        'Verification setelah major movements',
        'Compliance dengan regulasi accounting',
        'Inventory accuracy improvement',
        'Loss prevention dan shrinkage detection'
      ],
      howToUse: [
        '1. Start new opname session dari dashboard',
        '2. Download template Excel untuk physical count',
        '3. Lakukan physical counting di warehouse',
        '4. Input hasil count manual atau upload Excel',
        '5. Review variance report yang generated',
        '6. Approve adjustments yang diperlukan',
        '7. Apply adjustments ke system inventory',
        '8. Generate final opname report',
        '9. Archive session untuk record keeping'
      ],
      tips: [
        'Plan opname saat inventory movement minimal',
        'Use mobile devices untuk real-time input',
        'Double-check high-variance items',
        'Schedule regular cycle counts',
        'Train staff untuk accurate counting procedures'
      ]
    },
    {
      id: 'alerts',
      title: 'Alerts & Notifications',
      path: '/alerts',
      icon: AlertTriangle,
      category: 'monitoring',
      roles: ['user', 'admin', 'super_admin'],
      description: 'Sistem notifikasi cerdas yang memberikan peringatan real-time untuk kondisi kritis inventori, membantu mencegah stockout dan mengoptimalkan operational efficiency.',
      features: [
        'Real-time stock level alerts',
        'Low stock dan out-of-stock warnings',
        'Expiry date notifications',
        'Unusual movement alerts',
        'System health monitoring',
        'Custom alert thresholds',
        'Multi-channel notifications (email, SMS, push)',
        'Alert prioritization dan categorization',
        'Acknowledgment tracking',
        'Alert history dan analytics'
      ],
      useCases: [
        'Monitoring stock levels untuk prevent stockouts',
        'Early warning untuk expired products',
        'Detection unusual activities atau fraud',
        'System maintenance notifications',
        'Performance threshold breaches',
        'Compliance deadline reminders',
        'Emergency response coordination'
      ],
      howToUse: [
        '1. Configure alert thresholds di settings',
        '2. Set notification preferences (email/SMS)',
        '3. Monitor alert dashboard secara regular',
        '4. Acknowledge alerts setelah ditindaklanjuti',
        '5. Review alert history untuk patterns',
        '6. Adjust thresholds based on experience',
        '7. Set up escalation rules untuk critical alerts',
        '8. Use mobile app untuk alerts on-the-go'
      ],
      tips: [
        'Set realistic thresholds untuk minimize false alarms',
        'Configure different thresholds untuk different product types',
        'Use alert analytics untuk optimize settings',
        'Train team untuk proper alert response procedures',
        'Regular review dan tuning alert configurations'
      ]
    },
    {
      id: 'reports',
      title: 'Reports',
      path: '/reports',
      icon: FileText,
      category: 'reporting',
      roles: ['user', 'admin', 'super_admin'],
      description: 'Generator laporan lengkap untuk berbagai kebutuhan bisnis dan compliance. Menyediakan template reports siap pakai dan custom report builder untuk analisis mendalam.',
      features: [
        'Pre-built report templates',
        'Custom report builder',
        'Scheduled report generation',
        'Multi-format export (PDF, Excel, CSV)',
        'Interactive report dashboard',
        'Drill-down capabilities',
        'Comparative reporting',
        'Automated report distribution',
        'Report sharing dan collaboration',
        'Historical report archive'
      ],
      useCases: [
        'Monthly inventory valuation reports',
        'Compliance reporting untuk auditor',
        'Performance reports untuk management',
        'Operational reports untuk daily operations',
        'Financial reports untuk accounting',
        'Supplier performance evaluations',
        'Customer analysis reports'
      ],
      howToUse: [
        '1. Choose report type dari template library',
        '2. Set parameters dan filters',
        '3. Select date range dan scope',
        '4. Preview report sebelum generate',
        '5. Generate dan download hasil report',
        '6. Schedule recurring reports jika diperlukan',
        '7. Share reports dengan stakeholders',
        '8. Archive important reports untuk future reference'
      ],
      tips: [
        'Use templates untuk common reports',
        'Schedule reports untuk regular updates',
        'Customize reports untuk specific needs',
        'Archive historical reports untuk trend analysis',
        'Set up automated distribution untuk key stakeholders'
      ]
    },
    {
      id: 'users',
      title: 'User Management',
      path: '/users',
      icon: Users,
      category: 'administration',
      roles: ['admin', 'super_admin'],
      description: 'Sistem manajemen user yang komprehensif untuk mengatur akses, roles, dan permissions. Mendukung multi-level authorization dan user activity monitoring.',
      features: [
        'User registration dan profile management',
        'Role-based access control (RBAC)',
        'Permission matrix management',
        'User activity monitoring',
        'Session management',
        'Password policy enforcement',
        'Account lockout protection',
        'Bulk user operations',
        'User group management',
        'Audit trail untuk user activities'
      ],
      useCases: [
        'Onboarding karyawan baru',
        'Managing user roles dan permissions',
        'Monitoring user activities untuk security',
        'Compliance dengan data protection regulations',
        'User access reviews dan certifications',
        'Incident response dan investigation',
        'Organization restructuring support'
      ],
      howToUse: [
        '1. Access User Management dari admin menu',
        '2. Click "Add User" untuk user baru',
        '3. Set appropriate role dan permissions',
        '4. Configure password requirements',
        '5. Monitor user activities regularly',
        '6. Review dan update permissions periodically',
        '7. Handle access requests dan approvals',
        '8. Maintain user database integrity'
      ],
      tips: [
        'Follow principle of least privilege',
        'Regular access reviews untuk security',
        'Use strong password policies',
        'Monitor for unusual user activities',
        'Maintain updated contact information'
      ]
    },
    {
      id: 'settings',
      title: 'System Settings',
      path: '/settings',
      icon: Settings,
      category: 'administration',
      roles: ['admin', 'super_admin'],
      description: 'Pusat konfigurasi sistem yang memungkinkan customization berbagai aspek aplikasi, dari appearance hingga business rules dan integration settings.',
      features: [
        'System configuration management',
        'Business rules customization',
        'Theme dan appearance settings',
        'Notification preferences',
        'Integration configurations',
        'Backup dan restore settings',
        'Performance tuning options',
        'Security policy management',
        'Localization settings',
        'Feature toggles'
      ],
      useCases: [
        'Initial system setup dan configuration',
        'Customizing business rules sesuai company policy',
        'Integration dengan external systems',
        'Performance optimization',
        'Security policy enforcement',
        'Localization untuk multi-region operations',
        'Feature management untuk different user groups'
      ],
      howToUse: [
        '1. Navigate ke Settings dari admin panel',
        '2. Review current configurations',
        '3. Modify settings sesuai requirements',
        '4. Test changes di staging environment',
        '5. Apply changes ke production',
        '6. Monitor system performance setelah changes',
        '7. Document configuration changes',
        '8. Schedule regular settings review'
      ],
      tips: [
        'Test all changes di staging environment first',
        'Document all configuration changes',
        'Regular backup sebelum major changes',
        'Monitor system performance after modifications',
        'Keep settings documentation up-to-date'
      ]
    },
    {
      id: 'ai-studio',
      title: 'AI Studio',
      path: '/ai-studio',
      icon: Brain,
      category: 'advanced',
      roles: ['admin', 'super_admin'],
      description: 'Platform AI canggih untuk predictive analytics, automated insights, dan intelligent automation. Menggunakan machine learning untuk optimasi inventory dan business intelligence.',
      features: [
        'Demand forecasting dengan AI',
        'Automated anomaly detection',
        'Intelligent reorder recommendations',
        'Predictive maintenance alerts',
        'Smart pricing optimization',
        'Customer behavior analysis',
        'Seasonal pattern recognition',
        'Natural language query processing',
        'Automated report generation',
        'AI-powered insights dashboard'
      ],
      useCases: [
        'Forecasting demand untuk inventory planning',
        'Detecting fraud atau unusual patterns',
        'Optimizing reorder points dan quantities',
        'Predictive maintenance untuk equipment',
        'Dynamic pricing untuk maximize profit',
        'Customer segmentation untuk targeted marketing',
        'Automated insights untuk decision making'
      ],
      howToUse: [
        '1. Access AI Studio dari advanced menu',
        '2. Configure AI models sesuai business needs',
        '3. Train models dengan historical data',
        '4. Validate model accuracy dan performance',
        '5. Deploy models untuk production use',
        '6. Monitor model performance regularly',
        '7. Retrain models dengan new data',
        '8. Use AI insights untuk strategic decisions'
      ],
      tips: [
        'Ensure high-quality training data',
        'Regular model validation dan tuning',
        'Start dengan simple use cases',
        'Monitor model drift over time',
        'Combine AI insights dengan domain expertise'
      ]
    },
    {
      id: 'api-management',
      title: 'API Management',
      path: '/api-management',
      icon: Key,
      category: 'technical',
      roles: ['super_admin'],
      description: 'Platform manajemen API untuk integrasi sistem, monitoring API usage, dan security management. Menyediakan tools untuk developers dan system integrators.',
      features: [
        'API key generation dan management',
        'API usage monitoring dan analytics',
        'Rate limiting dan throttling',
        'API security policies',
        'Developer portal dan documentation',
        'API versioning management',
        'Integration testing tools',
        'Error tracking dan logging',
        'Performance monitoring',
        'Webhook management'
      ],
      useCases: [
        'Integrating dengan external systems',
        'Providing API access untuk third parties',
        'Monitoring API performance dan usage',
        'Managing API security dan access control',
        'Developer onboarding dan support',
        'API lifecycle management',
        'Troubleshooting integration issues'
      ],
      howToUse: [
        '1. Access API Management dari super admin menu',
        '2. Generate API keys untuk applications',
        '3. Configure rate limits dan security policies',
        '4. Monitor API usage dan performance',
        '5. Manage API documentation',
        '6. Handle developer requests dan support',
        '7. Troubleshoot integration issues',
        '8. Plan API versioning dan updates'
      ],
      tips: [
        'Implement proper API security practices',
        'Monitor API usage patterns regularly',
        'Maintain comprehensive API documentation',
        'Plan API versioning strategy carefully',
        'Provide good developer support'
      ]
    }
  ];

  const categories = [
    { id: 'all', label: 'Semua Halaman', count: pageDocumentation.length },
    { id: 'overview', label: 'Overview', count: pageDocumentation.filter(p => p.category === 'overview').length },
    { id: 'inventory', label: 'Inventory', count: pageDocumentation.filter(p => p.category === 'inventory').length },
    { id: 'reporting', label: 'Reporting', count: pageDocumentation.filter(p => p.category === 'reporting').length },
    { id: 'monitoring', label: 'Monitoring', count: pageDocumentation.filter(p => p.category === 'monitoring').length },
    { id: 'administration', label: 'Administration', count: pageDocumentation.filter(p => p.category === 'administration').length },
    { id: 'advanced', label: 'Advanced', count: pageDocumentation.filter(p => p.category === 'advanced').length },
    { id: 'technical', label: 'Technical', count: pageDocumentation.filter(p => p.category === 'technical').length }
  ];

  const filteredDocs = pageDocumentation.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const hasAccess = doc.roles.includes(user?.role || 'user');
    
    return matchesSearch && matchesCategory && hasAccess;
  });

  const getRoleBadgeColor = (roles: string[]) => {
    if (roles.includes('super_admin')) return 'destructive';
    if (roles.includes('admin')) return 'secondary';
    return 'default';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'overview': return Home;
      case 'inventory': return Package;
      case 'reporting': return FileText;
      case 'monitoring': return AlertTriangle;
      case 'administration': return Settings;
      case 'advanced': return Brain;
      case 'technical': return Key;
      default: return BookOpen;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-primary" />
              Dokumentasi Sistem
            </h1>
            <p className="text-muted-foreground mt-2">
              Panduan lengkap penggunaan setiap fitur dan halaman dalam sistem inventori
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari dokumentasi halaman..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="flex items-center gap-2"
                  >
                    {React.createElement(getCategoryIcon(category.id), { className: 'h-4 w-4' })}
                    {category.label} ({category.count})
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documentation Grid */}
        <div className="grid gap-6">
          {filteredDocs.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Tidak ada hasil ditemukan</h3>
                <p className="text-muted-foreground">
                  Coba ubah kata kunci pencarian atau filter kategori
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredDocs.map((doc) => {
              const IconComponent = doc.icon;
              return (
                <Card key={doc.id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <IconComponent className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{doc.title}</CardTitle>
                          <CardDescription className="text-sm text-muted-foreground">
                            {doc.path}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={getRoleBadgeColor(doc.roles)}>
                          {doc.roles.includes('super_admin') ? 'Super Admin' : 
                           doc.roles.includes('admin') ? 'Admin+' : 'All Users'}
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => navigate(doc.path)}
                          className="flex items-center gap-2"
                        >
                          <Zap className="h-4 w-4" />
                          Buka Halaman
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="overview" className="space-y-4">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="features">Fitur</TabsTrigger>
                        <TabsTrigger value="usage">Cara Pakai</TabsTrigger>
                        <TabsTrigger value="tips">Tips</TabsTrigger>
                      </TabsList>

                      <TabsContent value="overview" className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Info className="h-4 w-4" />
                            Deskripsi
                          </h4>
                          <p className="text-muted-foreground leading-relaxed">
                            {doc.description}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Use Cases Utama
                          </h4>
                          <div className="grid gap-2">
                            {doc.useCases.map((useCase, index) => (
                              <div key={index} className="flex items-start gap-2 p-3 bg-muted/50 rounded-md">
                                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                                <span className="text-sm">{useCase}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="features" className="space-y-3">
                        <h4 className="font-semibold">Fitur Lengkap:</h4>
                        <div className="grid gap-2">
                          {doc.features.map((feature, index) => (
                            <div key={index} className="flex items-start gap-3 p-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                              <span className="text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="usage" className="space-y-3">
                        <h4 className="font-semibold">Langkah-langkah Penggunaan:</h4>
                        <div className="space-y-3">
                          {doc.howToUse.map((step, index) => (
                            <div key={index} className="flex gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md">
                              <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center flex-shrink-0 font-semibold">
                                {index + 1}
                              </div>
                              <span className="text-sm">{step}</span>
                            </div>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="tips" className="space-y-3">
                        <h4 className="font-semibold">Tips & Best Practices:</h4>
                        <div className="grid gap-3">
                          {doc.tips.map((tip, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-md border-l-4 border-yellow-400">
                              <span className="text-yellow-600 text-lg">💡</span>
                              <span className="text-sm">{tip}</span>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default DocumentationPage;