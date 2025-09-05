import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Calendar, Filter, TrendingUp, TrendingDown, Package, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { useApi } from '@/contexts/ApiContext';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
const StockReportsManager = () => {
  const { apiService, isConfigured, isOnline } = useApi();
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [reportType, setReportType] = useState('summary');
  const [products, setProducts] = useState<any[]>([]);
  const [stockMovements, setStockMovements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data from backend
  useEffect(() => {
    const loadData = async () => {
      if (!isConfigured || !isOnline || !apiService) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const [productsResponse, movementsResponse] = await Promise.all([
          apiService.getProducts(),
          apiService.request('/api/stock/movements')
        ]);

        if (productsResponse?.success) {
          setProducts(productsResponse.data || []);
        }
        if (movementsResponse?.success) {
          setStockMovements(movementsResponse.data || []);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        toast({
          title: "Error",
          description: "Failed to load stock data. Please check your API configuration.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isConfigured, isOnline, apiService, toast]);

  // Generate stock report data
  const stockReportData = useMemo(() => {
    return products.map(product => {
      const movements = stockMovements.filter(m => m.productId === product.id);
      const stockIn = movements.filter(m => m.type === 'in').reduce((sum, m) => sum + m.quantity, 0);
      const stockOut = movements.filter(m => m.type === 'out').reduce((sum, m) => sum + Math.abs(m.quantity), 0);
      const adjustments = movements.filter(m => m.type === 'adjustment').reduce((sum, m) => sum + m.quantity, 0);
      return {
        ...product,
        stockIn,
        stockOut,
        adjustments,
        initialStock: product.stock - stockIn + stockOut - adjustments,
        finalStock: product.stock,
        turnover: stockOut > 0 ? stockOut / product.stock * 100 : 0
      };
    });
  }, [products, stockMovements]);

  // Filter by category and location
  const filteredData = useMemo(() => {
    let filtered = stockReportData;
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(item => item.location === selectedLocation);
    }
    return filtered;
  }, [stockReportData, selectedCategory, selectedLocation]);

  // Get unique categories and locations
  const categories = useMemo(() => {
    return ['all', ...Array.from(new Set(products.map(p => p.category)))];
  }, [products]);
  const locations = useMemo(() => {
    return ['all', ...Array.from(new Set(products.map(p => p.location).filter(Boolean)))];
  }, [products]);

  // Summary statistics
  const summaryStats = useMemo(() => {
    const totalValue = filteredData.reduce((sum, item) => sum + item.price * item.finalStock, 0);
    const totalStockIn = filteredData.reduce((sum, item) => sum + item.stockIn, 0);
    const totalStockOut = filteredData.reduce((sum, item) => sum + item.stockOut, 0);
    const averageTurnover = filteredData.length > 0 ? filteredData.reduce((sum, item) => sum + item.turnover, 0) / filteredData.length : 0;
    return {
      totalItems: filteredData.length,
      totalValue,
      totalStockIn,
      totalStockOut,
      averageTurnover
    };
  }, [filteredData]);
  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData.map(item => ({
      'Kode': item.sku,
      'Nama Barang': item.name,
      'Kategori': item.category,
      'Harga Beli': item.price * 0.8,
      // Assuming 20% margin
      'Harga Jual': item.price,
      'Satuan': 'pcs',
      'Stok Awal': item.initialStock,
      'Barang Masuk': item.stockIn,
      'Barang Keluar': item.stockOut,
      'Penyesuaian': item.adjustments,
      'Stok Akhir': item.finalStock,
      'Nilai Stok': item.price * item.finalStock,
      'Perputaran (%)': item.turnover.toFixed(2),
      'Lokasi': item.location || '-',
      'Status': item.status
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Stok');

    // Add summary sheet
    const summaryWS = XLSX.utils.json_to_sheet([{
      'Metrik': 'Total Item',
      'Nilai': summaryStats.totalItems
    }, {
      'Metrik': 'Total Nilai Stok',
      'Nilai': summaryStats.totalValue
    }, {
      'Metrik': 'Total Barang Masuk',
      'Nilai': summaryStats.totalStockIn
    }, {
      'Metrik': 'Total Barang Keluar',
      'Nilai': summaryStats.totalStockOut
    }, {
      'Metrik': 'Rata-rata Perputaran (%)',
      'Nilai': summaryStats.averageTurnover.toFixed(2)
    }]);
    XLSX.utils.book_append_sheet(workbook, summaryWS, 'Ringkasan');
    XLSX.writeFile(workbook, `Laporan_Stok_${new Date().toISOString().split('T')[0]}.xlsx`);
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'bg-success';
      case 'low_stock':
        return 'bg-warning';
      case 'out_of_stock':
        return 'bg-destructive';
      default:
        return 'bg-secondary';
    }
  };
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'Tersedia';
      case 'low_stock':
        return 'Stok Menipis';
      case 'out_of_stock':
        return 'Stok Habis';
      default:
        return status;
    }
  };
  return <div className="min-h-screen bg-muted/10 p-6 px-0">
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
              <FileText className="w-8 h-8" />
              Laporan Stok Barang
            </h1>
            <p className="text-muted-foreground mt-1">
              Laporan komprehensif pergerakan dan status stok inventory
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleExportExcel}>
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[{
          label: 'Total Item',
          value: summaryStats.totalItems.toLocaleString(),
          icon: Package,
          color: 'primary'
        }, {
          label: 'Nilai Total Stok',
          value: new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
          }).format(summaryStats.totalValue),
          icon: TrendingUp,
          color: 'success'
        }, {
          label: 'Barang Masuk',
          value: summaryStats.totalStockIn.toLocaleString(),
          icon: TrendingUp,
          color: 'info'
        }, {
          label: 'Barang Keluar',
          value: summaryStats.totalStockOut.toLocaleString(),
          icon: TrendingDown,
          color: 'warning'
        }, {
          label: 'Perputaran Rata-rata',
          value: `${summaryStats.averageTurnover.toFixed(1)}%`,
          icon: AlertCircle,
          color: 'accent'
        }].map((stat, index) => <motion.div key={stat.label} initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: index * 0.1
        }}>
              <Card className="glass hover-lift">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-${stat.color}/10`}>
                      <stat.icon className={`w-5 h-5 text-${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <p className={`text-sm font-bold text-${stat.color}`}>
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>)}
        </div>

        {/* Filters */}
        <Card className="glass">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4">
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger className="w-48 bg-background">
                    <SelectValue placeholder="Jenis Laporan" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg">
                    <SelectItem value="summary">Ringkasan Stok</SelectItem>
                    <SelectItem value="movement">Pergerakan Stok</SelectItem>
                    <SelectItem value="analysis">Analisis Stok</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-40 bg-background">
                    <SelectValue placeholder="Periode" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg">
                    <SelectItem value="daily">Harian</SelectItem>
                    <SelectItem value="weekly">Mingguan</SelectItem>
                    <SelectItem value="monthly">Bulanan</SelectItem>
                    <SelectItem value="yearly">Tahunan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48 bg-background">
                    <SelectValue placeholder="Kategori" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg">
                    <SelectItem value="all">Semua Kategori</SelectItem>
                    {categories.slice(1).map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="w-48 bg-background">
                    <SelectValue placeholder="Lokasi" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg">
                    <SelectItem value="all">Semua Lokasi</SelectItem>
                    {locations.slice(1).map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stock Report Table */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Laporan Stok Barang
              <Badge variant="secondary">{filteredData.length} item</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span>Loading stock data...</span>
              </div>
            ) : !isConfigured ? (
              <div className="text-center p-8 text-muted-foreground">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="mb-2">API not configured</p>
                <p className="text-sm">Please configure your API settings to load stock data.</p>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No stock data available</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="min-w-[1200px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama Barang</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead className="text-right">Harga</TableHead>
                    <TableHead className="text-center">Stok Awal</TableHead>
                    <TableHead className="text-center">Masuk</TableHead>
                    <TableHead className="text-center">Keluar</TableHead>
                    <TableHead className="text-center">Stok Akhir</TableHead>
                    <TableHead className="text-right">Nilai Stok</TableHead>
                    <TableHead className="text-center">Perputaran</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map(item => <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.location}</p>
                        </div>
                      </TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0
                    }).format(item.price)}
                      </TableCell>
                      <TableCell className="text-center">{item.initialStock}</TableCell>
                      <TableCell className="text-center text-success">{item.stockIn}</TableCell>
                      <TableCell className="text-center text-warning">{item.stockOut}</TableCell>
                      <TableCell className="text-center font-medium">{item.finalStock}</TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0
                    }).format(item.price * item.finalStock)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={item.turnover > 50 ? "default" : "secondary"}>
                          {item.turnover.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(item.status)}>
                          {getStatusLabel(item.status)}
                        </Badge>
                      </TableCell>
                    </TableRow>)}
                </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>;
};
export default StockReportsManager;