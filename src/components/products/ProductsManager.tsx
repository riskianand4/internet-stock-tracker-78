import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Grid, List, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductCard from './ProductCard';
import ProductTable from './ProductTable';
import AddProductDialog from './AddProductDialog';
import ProductDetailModal from './ProductDetailModal';
import ProductFilters from './ProductFilters';
import { useProductManager } from '@/hooks/useProductManager';
import { Product } from '@/types/inventory';
import * as XLSX from 'xlsx';
export type ViewMode = 'grid' | 'table';
export type SortOption = 'name' | 'price' | 'stock' | 'category' | 'updated';
const ProductsManager = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');

  // Use product manager hook for API data
  const { 
    products, 
    isLoading, 
    isFromApi, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    refreshProducts 
  } = useProductManager();

  // Get unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category)));
    return ['all', ...cats];
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(product => product.name.toLowerCase().includes(searchQuery.toLowerCase()) || product.sku.toLowerCase().includes(searchQuery.toLowerCase()) || product.category.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(product => product.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return b.price - a.price;
        case 'stock':
          return b.stock - a.stock;
        case 'category':
          return a.category.localeCompare(b.category);
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        default:
          return 0;
      }
    });
    return filtered;
  }, [searchQuery, categoryFilter, statusFilter, sortBy]);
  const handleBulkAction = (action: string) => {
    if (selectedProducts.length === 0) return;
    switch (action) {
      case 'delete':
        // In a real app, this would call an API
        console.log(`Menghapus ${selectedProducts.length} produk:`, selectedProducts);
        setSelectedProducts([]);
        // Show success toast
        break;
      case 'export':
        // Export selected products to Excel
        const selectedData = products.filter(p => selectedProducts.includes(p.id));
        exportToExcel(selectedData, `Produk_Terpilih_${new Date().toISOString().split('T')[0]}.xlsx`);
        break;
      case 'category':
        // In a real app, this would open a category selection dialog
        console.log(`Mengubah kategori untuk ${selectedProducts.length} produk`);
        break;
    }
  };
  const exportToExcel = (data: Product[], filename: string) => {
    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(data.map(product => ({
      'SKU': product.sku,
      'Nama Produk': product.name,
      'Kategori': product.category,
      'Harga': product.price,
      'Stok': product.stock,
      'Stok Minimum': product.minStock,
      'Status': product.status,
      'Lokasi': product.location || '-',
      'Supplier': product.supplier || '-',
      'Terakhir Update': new Date(product.updatedAt).toLocaleDateString('id-ID')
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Produk');
    XLSX.writeFile(workbook, filename);
  };
  const handleExport = () => {
    exportToExcel(filteredProducts, `Semua_Produk_${new Date().toISOString().split('T')[0]}.xlsx`);
  };
  const handleImport = () => {
    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls,.csv';
    input.onchange = e => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = event => {
        try {
          const data = event.target?.result;
          const workbook = XLSX.read(data, {
            type: 'binary'
          });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          console.log('Data imported:', jsonData);
          // In a real app, this would process and save the imported data
        } catch (error) {
          console.error('Error importing file:', error);
        }
      };
      reader.readAsBinaryString(file);
    };
    input.click();
  };
  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setModalMode('view');
    setIsDetailModalOpen(true);
  };
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setModalMode('edit');
    setIsDetailModalOpen(true);
  };
  const stats = useMemo(() => ({
    total: products.length,
    inStock: products.filter(p => p.status === 'in_stock').length,
    lowStock: products.filter(p => p.status === 'low_stock').length,
    outOfStock: products.filter(p => p.status === 'out_of_stock').length,
    totalValue: products.reduce((sum, p) => sum + p.price * p.stock, 0)
  }), [products]);
  return <div className="min-h-screen bg-muted/10 mobile-responsive-padding py-3 md:py-6">
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} className="max-w-7xl mx-auto mobile-responsive-spacing">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="mobile-responsive-text font-bold text-primary">
              Manajemen Produk
            </h1>
            <p className="text-muted-foreground text-sm md:text-base mt-1">
              Kelola inventory dan produk ISP Anda
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <Button variant="outline" onClick={handleImport} size="sm" className="flex-1 md:flex-none">
              <Upload className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline ml-2">Import</span>
            </Button>
            <Button variant="outline" onClick={handleExport} size="sm" className="flex-1 md:flex-none">
              <Download className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline ml-2">Export</span>
            </Button>
            <Button onClick={() => setIsAddDialogOpen(true)} size="sm" className="flex-1 md:flex-none">
              <Plus className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline ml-2">Tambah</span>
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[{
          label: 'Total Produk',
          value: stats.total,
          color: 'primary'
        }, {
          label: 'Stok Tersedia',
          value: stats.inStock,
          color: 'success'
        }, {
          label: 'Stok Menipis',
          value: stats.lowStock,
          color: 'warning'
        }, {
          label: 'Stok Habis',
          value: stats.outOfStock,
          color: 'destructive'
        }, {
          label: 'Nilai Total',
          value: new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
          }).format(stats.totalValue),
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
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                  <p className={`text-lg font-bold text-${stat.color}`}>
                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                  </p>
                </CardContent>
              </Card>
            </motion.div>)}
        </div>

        {/* Search and Filters */}
        <Card className="glass">
          <CardContent className="p-3 md:p-6">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input placeholder="Cari produk, SKU, atau kategori..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:flex lg:flex-wrap gap-2 md:gap-3">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full lg:w-48">
                    <SelectValue placeholder="Kategori" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg z-50">
                    <SelectItem value="all">Semua Kategori</SelectItem>
                    {categories.slice(1).map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full lg:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg z-50">
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="in_stock">Tersedia</SelectItem>
                    <SelectItem value="low_stock">Stok Menipis</SelectItem>
                    <SelectItem value="out_of_stock">Stok Habis</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                  <SelectTrigger className="w-full lg:w-40">
                    <SelectValue placeholder="Urutkan" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-lg z-50">
                    <SelectItem value="name">Nama</SelectItem>
                    <SelectItem value="price">Harga</SelectItem>
                    <SelectItem value="stock">Stok</SelectItem>
                    <SelectItem value="category">Kategori</SelectItem>
                    <SelectItem value="updated">Terakhir Update</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-1 border rounded-lg p-1 col-span-2 md:col-span-1 lg:w-auto">
                  <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('grid')} className="flex-1 lg:flex-none">
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button variant={viewMode === 'table' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('table')} className="flex-1 lg:flex-none">
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Results info */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-4">
              <p className="text-sm text-muted-foreground">
                Menampilkan {filteredProducts.length} dari {products.length} produk
                {isFromApi && <span className="ml-2 text-primary">(dari API)</span>}
              </p>
              
              {selectedProducts.length > 0 && <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {selectedProducts.length} dipilih
                  </Badge>
                  <Select onValueChange={handleBulkAction}>
                    <SelectTrigger className="w-full md:w-40">
                      <SelectValue placeholder="Aksi Bulk" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border shadow-lg z-50">
                      <SelectItem value="delete">Hapus</SelectItem>
                      <SelectItem value="export">Export</SelectItem>
                      <SelectItem value="category">Ubah Kategori</SelectItem>
                    </SelectContent>
                  </Select>
                </div>}
            </div>
          </CardContent>
        </Card>

        {/* Products Display */}
        <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} transition={{
        delay: 0.2
      }}>
          {viewMode === 'grid' ? <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 snap-x snap-mandatory md:snap-none">
              {filteredProducts.map((product, index) => <motion.div key={product.id} initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: index * 0.05
          }} className="flex-shrink-0 w-64 md:w-auto snap-start md:snap-align-none">
                  <ProductCard product={product} isSelected={selectedProducts.includes(product.id)} onSelect={selected => {
              if (selected) {
                setSelectedProducts(prev => [...prev, product.id]);
              } else {
                setSelectedProducts(prev => prev.filter(id => id !== product.id));
              }
            }} onView={handleViewProduct} onEdit={handleEditProduct} />
                </motion.div>)}
            </div> : <ProductTable products={filteredProducts} selectedProducts={selectedProducts} onSelectionChange={setSelectedProducts} onView={handleViewProduct} onEdit={handleEditProduct} />}

          {filteredProducts.length === 0 && <Card className="glass">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">Tidak ada produk ditemukan</h3>
                <p className="text-muted-foreground mb-4">
                  Coba ubah filter atau kata kunci pencarian Anda
                </p>
                <Button variant="outline" onClick={() => {
              setSearchQuery('');
              setCategoryFilter('all');
              setStatusFilter('all');
            }}>
                  Reset Filter
                </Button>
              </CardContent>
            </Card>}
        </motion.div>

        {/* Add Product Dialog */}
        <AddProductDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />

        {/* Product Detail Modal */}
        <ProductDetailModal product={selectedProduct} open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen} mode={modalMode} onModeChange={setModalMode} />
      </motion.div>
    </div>;
};
export default ProductsManager;