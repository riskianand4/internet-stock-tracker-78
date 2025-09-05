import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/types/inventory';
import { useHybridProducts } from '@/hooks/useHybridData';
import ModernProductCard from './ModernProductCard';
import ProductDetailModal from './ProductDetailModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Search, 
  Plus, 
  Filter, 
  Grid3X3, 
  List, 
  SortAsc, 
  SortDesc,
  Package,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type ViewMode = 'grid' | 'list';
type SortField = 'name' | 'quantity' | 'price' | 'status';
type SortOrder = 'asc' | 'desc';

const ModernProductGrid = () => {
  const { user } = useAuth();
  const { data: hybridProducts, isLoading, isFromApi } = useHybridProducts();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Update local products when hybrid data changes
  React.useEffect(() => {
    if (hybridProducts) {
      setProducts(hybridProducts);
    }
  }, [hybridProducts]);

  const categories = useMemo(() => 
    Array.from(new Set(products.map(p => p.category))),
    [products]
  );

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });

    // Sort products
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'name' || sortField === 'status') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [products, searchTerm, statusFilter, categoryFilter, sortField, sortOrder]);

  const stats = useMemo(() => {
    const total = products.length;
    const inStock = products.filter(p => p.status === 'in_stock').length;
    const lowStock = products.filter(p => p.status === 'low_stock').length;
    const outOfStock = products.filter(p => p.status === 'out_of_stock').length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

    return { total, inStock, lowStock, outOfStock, totalValue };
  }, [products]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  const handleProductUpdate = (updatedProduct: Product) => {
    setProducts(prev => 
      prev.map(p => p.id === updatedProduct.id ? updatedProduct : p)
    );
    setSelectedProduct(updatedProduct);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="glass hover-lift">
          <CardContent className="p-3 lg:p-4">
            <div className="flex items-center space-x-2 lg:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-primary/10 text-primary rounded-lg lg:rounded-xl flex items-center justify-center">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              </div>
              <div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-xs lg:text-sm text-muted-foreground">Total Produk</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass hover-lift">
          <CardContent className="p-3 lg:p-4">
            <div className="flex items-center space-x-2 lg:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-success/10 text-success rounded-lg lg:rounded-xl flex items-center justify-center">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              </div>
              <div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">{stats.inStock}</p>
                <p className="text-xs lg:text-sm text-muted-foreground">Stok Tersedia</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass hover-lift">
          <CardContent className="p-3 lg:p-4">
            <div className="flex items-center space-x-2 lg:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-warning/10 text-warning rounded-lg lg:rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              </div>
              <div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">{stats.lowStock}</p>
                <p className="text-xs lg:text-sm text-muted-foreground">Stok Menipis</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass hover-lift">
          <CardContent className="p-3 lg:p-4">
            <div className="flex items-center space-x-2 lg:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-accent/10 text-accent rounded-lg lg:rounded-xl flex items-center justify-center">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              </div>
              <div>
                <p className="text-base sm:text-lg lg:text-xl font-bold text-foreground">{formatCurrency(stats.totalValue)}</p>
                <p className="text-xs lg:text-sm text-muted-foreground">Total Nilai</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Controls */}
      <Card className="glass">
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3 h-3 sm:w-4 sm:h-4" />
                <Input
                  placeholder="Cari produk, SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 sm:pl-10 bg-background/50 text-xs sm:text-sm h-8 sm:h-9"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32 sm:w-36 lg:w-40 h-8 sm:h-9 text-xs sm:text-sm">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="in_stock">Tersedia</SelectItem>
                    <SelectItem value="low_stock">Menipis</SelectItem>
                    <SelectItem value="out_of_stock">Habis</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-32 sm:w-36 lg:w-40 h-8 sm:h-9 text-xs sm:text-sm">
                    <SelectValue placeholder="Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kategori</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* View Controls */}
            <div className="flex items-center space-x-2">
              {/* Sort */}
              <Select value={`${sortField}-${sortOrder}`} onValueChange={(value) => {
                const [field, order] = value.split('-') as [SortField, SortOrder];
                setSortField(field);
                setSortOrder(order);
              }}>
                <SelectTrigger className="w-32 sm:w-36 lg:w-40 h-8 sm:h-9 text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Nama A-Z</SelectItem>
                  <SelectItem value="name-desc">Nama Z-A</SelectItem>
                  <SelectItem value="quantity-desc">Stok Tinggi</SelectItem>
                  <SelectItem value="quantity-asc">Stok Rendah</SelectItem>
                  <SelectItem value="price-desc">Harga Tinggi</SelectItem>
                  <SelectItem value="price-asc">Harga Rendah</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="flex border border-border/50 rounded-lg p-1 bg-background/50">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 p-0"
                >
                  <Grid3X3 className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 p-0"
                >
                  <List className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>

              {/* Add Product */}
              {(user?.role === 'admin' || user?.role === 'super_admin') && (
                <Button className="bg-primary hover:shadow-glow text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3">
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Tambah</span>
                </Button>
              )}
            </div>
          </div>

          {/* Filter Summary */}
            <div className="flex items-center space-x-2 mt-3 lg:mt-4">
            <span className="text-xs sm:text-sm text-muted-foreground">
              {filteredAndSortedProducts.length} dari {products.length} produk
            </span>
            {isFromApi && (
              <Badge variant="secondary" className="text-xs bg-success/20 text-success">
                Live Data
              </Badge>
            )}
            {(statusFilter !== 'all' || categoryFilter !== 'all' || searchTerm) && (
              <div className="flex items-center space-x-1 sm:space-x-2">
                {searchTerm && (
                  <Badge variant="secondary" className="text-[10px] sm:text-xs">
                    "{searchTerm}"
                  </Badge>
                )}
                {statusFilter !== 'all' && (
                  <Badge variant="secondary" className="text-[10px] sm:text-xs">
                    {statusFilter}
                  </Badge>
                )}
                {categoryFilter !== 'all' && (
                  <Badge variant="secondary" className="text-[10px] sm:text-xs">
                    {categoryFilter}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setCategoryFilter('all');
                  }}
                  className="text-[10px] sm:text-xs h-5 sm:h-6 px-2"
                >
                  Hapus Filter
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Product Grid/List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6'
              : 'space-y-3 sm:space-y-4'
          }
        >
          {filteredAndSortedProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <ModernProductCard
                product={product}
                onClick={() => setSelectedProduct(product)}
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Empty State */}
      {filteredAndSortedProducts.length === 0 && (
        <motion.div
          className="text-center py-12 lg:py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Filter className="w-12 h-12 lg:w-16 lg:h-16 text-muted-foreground mx-auto mb-3 lg:mb-4" />
          <h3 className="text-base lg:text-lg font-semibold text-foreground mb-2">Tidak ada produk ditemukan</h3>
          <p className="text-sm lg:text-base text-muted-foreground mb-3 lg:mb-4">
            Coba ubah filter pencarian atau kata kunci Anda
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setCategoryFilter('all');
            }}
            className="text-xs sm:text-sm h-8 sm:h-9"
          >
            Hapus Semua Filter
          </Button>
        </motion.div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onUpdate={handleProductUpdate}
        />
      )}
    </div>
  );
};

export default ModernProductGrid;