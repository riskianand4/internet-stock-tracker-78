import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowUpCircle, ArrowDownCircle, RefreshCw, ArrowRightLeft, Calendar, Search, Filter, Download, Edit, Trash2, Eye } from 'lucide-react';
import { useStockMovement } from '@/hooks/useStockMovement';
import { StockMovement } from '@/types/stock-movement';
import { format } from 'date-fns';
import EditStockMovementModal from './EditStockMovementModal';
import { useAuth } from '@/contexts/AuthContext';

const StockMovementHistory = () => {
  const { user } = useAuth();
  const { movements, getMovementStats, updateMovement, deleteMovement } = useStockMovement();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('ALL');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<StockMovement | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [movementToDelete, setMovementToDelete] = useState<string | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [movementDetail, setMovementDetail] = useState<StockMovement | null>(null);
  
  const stats = getMovementStats();

  const handleEdit = (movement: StockMovement) => {
    setSelectedMovement(movement);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (movementId: string) => {
    setMovementToDelete(movementId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (movementToDelete) {
      await deleteMovement(movementToDelete);
      setDeleteDialogOpen(false);
      setMovementToDelete(null);
    }
  };

  const handleViewDetail = (movement: StockMovement) => {
    setMovementDetail(movement);
    setDetailDialogOpen(true);
  };

  const handleUpdate = async (updatedMovement: StockMovement) => {
    await updateMovement(updatedMovement);
    setEditModalOpen(false);
    setSelectedMovement(null);
  };

  const getMovementIcon = (type: StockMovement['type']) => {
    switch (type) {
      case 'IN':
        return <ArrowUpCircle className="w-4 h-4 text-green-500" />;
      case 'OUT':
        return <ArrowDownCircle className="w-4 h-4 text-red-500" />;
      case 'ADJUSTMENT':
        return <RefreshCw className="w-4 h-4 text-blue-500" />;
      case 'TRANSFER':
        return <ArrowRightLeft className="w-4 h-4 text-purple-500" />;
    }
  };

  const getMovementBadge = (type: StockMovement['type']) => {
    const variants = {
      'IN': 'bg-green-100 text-green-800 border-green-200',
      'OUT': 'bg-red-100 text-red-800 border-red-200',
      'ADJUSTMENT': 'bg-blue-100 text-blue-800 border-blue-200',
      'TRANSFER': 'bg-purple-100 text-purple-800 border-purple-200'
    };
    
    return (
      <Badge className={variants[type]}>
        {type}
      </Badge>
    );
  };

  const filteredMovements = movements.filter(movement => {
    const matchesSearch = 
      movement.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.reason.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'ALL' || movement.type === typeFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'ALL') {
      const movementDate = new Date(movement.timestamp);
      const now = new Date();
      
      switch (dateFilter) {
        case 'TODAY':
          matchesDate = movementDate.toDateString() === now.toDateString();
          break;
        case 'WEEK':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = movementDate >= weekAgo;
          break;
        case 'MONTH':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = movementDate >= monthAgo;
          break;
      }
    }
    
    return matchesSearch && matchesType && matchesDate;
  });

  const exportMovements = () => {
    // Implementation for exporting stock movements to Excel/CSV
    const exportData = filteredMovements.map(movement => ({
      'Product Name': movement.productName,
      'SKU': movement.productCode,
      'Type': movement.type,
      'Quantity': movement.quantity,
      'Location': movement.location,
      'Reason': movement.reason,
      'Reference': movement.reference || '',
      'Notes': movement.notes || '',
      'Date': format(movement.timestamp, 'yyyy-MM-dd HH:mm:ss'),
    }));

    // Create CSV content
    const headers = Object.keys(exportData[0] || {}).join(',');
    const rows = exportData.map(row => Object.values(row).join(','));
    const csvContent = [headers, ...rows].join('\n');
    
    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `stock-movements-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Movements</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Stock In</p>
                  <p className="text-2xl font-bold text-green-600">{stats.inMovements}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <ArrowUpCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Stock Out</p>
                  <p className="text-2xl font-bold text-red-600">{stats.outMovements}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <ArrowDownCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Week</p>
                  <p className="text-2xl font-bold">{stats.thisWeek}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Stock Movement History
            </span>
            <Button onClick={exportMovements} size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by product name, code, or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="IN">Stock In</SelectItem>
                <SelectItem value="OUT">Stock Out</SelectItem>
                <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                <SelectItem value="TRANSFER">Transfer</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Time</SelectItem>
                <SelectItem value="TODAY">Today</SelectItem>
                <SelectItem value="WEEK">Last 7 Days</SelectItem>
                <SelectItem value="MONTH">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Movement Table */}
          <div className="border rounded-lg overflow-x-auto">
            <Table className="min-w-[1200px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Previous Stock</TableHead>
                  <TableHead>New Stock</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovements.map((movement, index) => (
                  <motion.tr
                    key={movement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">
                      {format(new Date(movement.timestamp), 'dd/MM/yy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{movement.productName}</p>
                        <p className="text-sm text-muted-foreground">{movement.productCode}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getMovementIcon(movement.type)}
                        {getMovementBadge(movement.type)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={movement.type === 'OUT' ? 'text-red-600' : 'text-green-600'}>
                        {movement.type === 'OUT' ? '' : '+'}{movement.quantity}
                      </span>
                    </TableCell>
                    <TableCell>{movement.previousStock}</TableCell>
                    <TableCell className="font-medium">{movement.newStock}</TableCell>
                    <TableCell className="max-w-48 truncate">{movement.reason}</TableCell>
                    <TableCell>{movement.userName}</TableCell>
                    <TableCell>{movement.location}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewDetail(movement)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {(user?.role === 'admin' || user?.role === 'super_admin') && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEdit(movement)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteClick(movement.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredMovements.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No stock movements found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <EditStockMovementModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedMovement(null);
        }}
        movement={selectedMovement}
        onUpdate={handleUpdate}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus transaksi stock movement ini? 
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail View Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Stock Movement</DialogTitle>
            <DialogDescription>
              Informasi lengkap transaksi stock movement
            </DialogDescription>
          </DialogHeader>
          {movementDetail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tanggal & Waktu</label>
                  <p className="text-sm font-mono">
                    {format(new Date(movementDetail.timestamp), 'dd MMMM yyyy, HH:mm:ss')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tipe Transaksi</label>
                  <div className="flex items-center gap-2 mt-1">
                    {getMovementIcon(movementDetail.type)}
                    {getMovementBadge(movementDetail.type)}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nama Produk</label>
                  <p className="font-medium">{movementDetail.productName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Kode Produk</label>
                  <p className="font-mono text-sm">{movementDetail.productCode}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Jumlah</label>
                  <p className={`font-bold ${movementDetail.type === 'OUT' ? 'text-red-600' : 'text-green-600'}`}>
                    {movementDetail.type === 'OUT' ? '-' : '+'}{movementDetail.quantity}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Stock Sebelum</label>
                  <p className="font-medium">{movementDetail.previousStock}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Stock Sesudah</label>
                  <p className="font-medium">{movementDetail.newStock}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Lokasi</label>
                  <p>{movementDetail.location}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">User</label>
                  <p>{movementDetail.userName}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Alasan</label>
                <p>{movementDetail.reason}</p>
              </div>
              
              {movementDetail.reference && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Referensi</label>
                  <p className="font-mono text-sm">{movementDetail.reference}</p>
                </div>
              )}
              
              {movementDetail.notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Catatan</label>
                  <p className="text-sm">{movementDetail.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setDetailDialogOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StockMovementHistory;