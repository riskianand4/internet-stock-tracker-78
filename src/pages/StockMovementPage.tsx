import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ModernLoginPage from '@/components/auth/ModernLoginPage';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import StockTransactionForm from '@/components/inventory/StockTransactionForm';
import StockMovementHistory from '@/components/inventory/StockMovementHistory';

const StockMovementPage = () => {
  const { user } = useAuth();
  const [refreshHistory, setRefreshHistory] = useState(false);

  if (!user) {
    return <ModernLoginPage />;
  }

  const handleTransactionComplete = () => {
    setRefreshHistory(!refreshHistory);
  };

  return (
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
            <h1 className="text-3xl font-bold">Stock Movement</h1>
            <p className="text-muted-foreground">
              Input transaksi stok masuk, keluar, dan adjustment
            </p>
          </div>
        </motion.div>

        <Tabs defaultValue="input" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="input">Input Transaksi</TabsTrigger>
            <TabsTrigger value="history">History Pergerakan</TabsTrigger>
          </TabsList>

          <TabsContent value="input" className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <StockTransactionForm onTransactionComplete={handleTransactionComplete} />
            </motion.div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              key={`history-${refreshHistory}`}
            >
              <StockMovementHistory />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default StockMovementPage;