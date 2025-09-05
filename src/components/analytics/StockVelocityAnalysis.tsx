import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Clock, AlertCircle, Zap } from 'lucide-react';
import { stockMovementApi } from '@/services/stockMovementApi';
import { StockVelocity } from '@/types/stock-movement';

const StockVelocityAnalysis = () => {
  const [timeframe, setTimeframe] = useState('monthly');
  const [sortBy, setSortBy] = useState('velocity');
  
  const [velocityData, setVelocityData] = useState<StockVelocity[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStockVelocity = async () => {
      setLoading(true);
      try {
        const data = await stockMovementApi.getStockVelocity();
        setVelocityData(data);
      } catch (error) {
        console.error('Failed to fetch stock velocity:', error);
        setVelocityData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStockVelocity();
  }, []);

  const getVelocityColor = (velocity: StockVelocity['velocity']) => {
    switch (velocity) {
      case 'FAST':
        return 'text-green-600 bg-green-100';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-100';
      case 'SLOW':
        return 'text-orange-600 bg-orange-100';
      case 'DEAD':
        return 'text-red-600 bg-red-100';
    }
  };

  const getVelocityIcon = (velocity: StockVelocity['velocity']) => {
    switch (velocity) {
      case 'FAST':
        return <Zap className="w-4 h-4" />;
      case 'MEDIUM':
        return <Activity className="w-4 h-4" />;
      case 'SLOW':
        return <Clock className="w-4 h-4" />;
      case 'DEAD':
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const velocityStats = {
    fast: velocityData.filter(v => v.velocity === 'FAST').length,
    medium: velocityData.filter(v => v.velocity === 'MEDIUM').length,
    slow: velocityData.filter(v => v.velocity === 'SLOW').length,
    dead: velocityData.filter(v => v.velocity === 'DEAD').length,
  };

  const chartData = velocityData.map(item => ({
    name: item.productCode,
    daily: item.averageDailyUsage,
    weekly: item.averageWeeklyUsage,
    monthly: item.averageMonthlyUsage,
    daysOfSupply: item.daysOfSupply,
    velocity: item.velocity
  }));

  const pieData = [
    { name: 'Fast Moving', value: velocityStats.fast, color: '#10b981' },
    { name: 'Medium Moving', value: velocityStats.medium, color: '#f59e0b' },
    { name: 'Slow Moving', value: velocityStats.slow, color: '#f97316' },
    { name: 'Dead Stock', value: velocityStats.dead, color: '#ef4444' },
  ];

  const sortedData = [...velocityData].sort((a, b) => {
    switch (sortBy) {
      case 'velocity':
        const velocityOrder = { 'FAST': 4, 'MEDIUM': 3, 'SLOW': 2, 'DEAD': 1 };
        return velocityOrder[b.velocity] - velocityOrder[a.velocity];
      case 'usage':
        return b.averageMonthlyUsage - a.averageMonthlyUsage;
      case 'daysOfSupply':
        return a.daysOfSupply - b.daysOfSupply;
      default:
        return 0;
    }
  });

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
                  <p className="text-sm text-muted-foreground">Fast Moving</p>
                  <p className="text-2xl font-bold text-green-600">{velocityStats.fast}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-green-600" />
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
                  <p className="text-sm text-muted-foreground">Medium Moving</p>
                  <p className="text-2xl font-bold text-yellow-600">{velocityStats.medium}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-yellow-600" />
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
                  <p className="text-sm text-muted-foreground">Slow Moving</p>
                  <p className="text-2xl font-bold text-orange-600">{velocityStats.slow}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
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
                  <p className="text-sm text-muted-foreground">Dead Stock</p>
                  <p className="text-2xl font-bold text-red-600">{velocityStats.dead}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Stock Usage Analysis
              </span>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey={timeframe === 'daily' ? 'daily' : timeframe === 'weekly' ? 'weekly' : 'monthly'} 
                  fill="#3b82f6" 
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Velocity Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Velocity Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5" />
              Detailed Velocity Analysis
            </span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="velocity">Sort by Velocity</SelectItem>
                <SelectItem value="usage">Sort by Usage</SelectItem>
                <SelectItem value="daysOfSupply">Sort by Days of Supply</SelectItem>
              </SelectContent>
            </Select>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedData.map((item, index) => (
              <motion.div
                key={item.productId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getVelocityColor(item.velocity)}`}>
                    {getVelocityIcon(item.velocity)}
                  </div>
                  <div>
                    <h4 className="font-medium">{item.productName}</h4>
                    <p className="text-sm text-muted-foreground">{item.productCode}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Monthly Usage</p>
                    <p className="font-medium">{item.averageMonthlyUsage}</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Days of Supply</p>
                    <p className="font-medium">{item.daysOfSupply.toFixed(1)} days</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Reorder Point</p>
                    <p className="font-medium">{item.reorderPoint}</p>
                  </div>
                  
                  <Badge className={getVelocityColor(item.velocity)}>
                    {item.velocity}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockVelocityAnalysis;