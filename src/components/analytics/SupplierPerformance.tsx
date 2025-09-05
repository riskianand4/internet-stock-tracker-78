import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Users, Star, Clock, TrendingUp, Package, Award, AlertTriangle, CheckCircle } from 'lucide-react';
import { stockMovementApi } from '@/services/stockMovementApi';
import { SupplierPerformance as SupplierPerformanceType } from '@/types/stock-movement';
import { format } from 'date-fns';

const SupplierPerformance = () => {
  const [sortBy, setSortBy] = useState('performance');
  const [metric, setMetric] = useState('onTime');
  
  const [supplierData, setSupplierData] = useState<SupplierPerformanceType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSupplierPerformance = async () => {
      setLoading(true);
      try {
        const data = await stockMovementApi.getSupplierPerformance();
        setSupplierData(data);
      } catch (error) {
        console.error('Failed to fetch supplier performance:', error);
        setSupplierData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSupplierPerformance();
  }, []);

  const getPerformanceScore = (supplier: SupplierPerformanceType) => {
    // Calculate weighted performance score
    const onTimeWeight = 0.4;
    const qualityWeight = 0.3;
    const leadTimeWeight = 0.2;
    const valueWeight = 0.1;

    const onTimeScore = supplier.onTimePercentage;
    const qualityScore = (supplier.qualityRating / 5) * 100;
    const leadTimeScore = Math.max(0, 100 - (supplier.averageLeadTime - 1) * 20); // Penalize long lead times
    const valueScore = Math.min(100, (supplier.totalValue / 150000000) * 100); // Normalize based on max value

    return (
      onTimeScore * onTimeWeight +
      qualityScore * qualityWeight +
      leadTimeScore * leadTimeWeight +
      valueScore * valueWeight
    );
  };

  const getPerformanceGrade = (score: number) => {
    if (score >= 90) return { grade: 'A+', color: 'text-green-600 bg-green-100', icon: Award };
    if (score >= 80) return { grade: 'A', color: 'text-green-600 bg-green-100', icon: CheckCircle };
    if (score >= 70) return { grade: 'B', color: 'text-blue-600 bg-blue-100', icon: Star };
    if (score >= 60) return { grade: 'C', color: 'text-yellow-600 bg-yellow-100', icon: Clock };
    return { grade: 'D', color: 'text-red-600 bg-red-100', icon: AlertTriangle };
  };

  const sortedSuppliers = [...supplierData].sort((a, b) => {
    switch (sortBy) {
      case 'performance':
        return getPerformanceScore(b) - getPerformanceScore(a);
      case 'onTime':
        return b.onTimePercentage - a.onTimePercentage;
      case 'quality':
        return b.qualityRating - a.qualityRating;
      case 'value':
        return b.totalValue - a.totalValue;
      default:
        return 0;
    }
  });

  const radarData = supplierData.map(supplier => ({
    supplier: supplier.supplierName.split(' ')[0],
    onTime: supplier.onTimePercentage,
    quality: (supplier.qualityRating / 5) * 100,
    leadTime: Math.max(0, 100 - (supplier.averageLeadTime - 1) * 20),
    reliability: getPerformanceScore(supplier)
  }));

  const chartData = supplierData.map(supplier => ({
    name: supplier.supplierName.split(' ')[0],
    orders: supplier.totalOrders,
    onTime: supplier.onTimeDeliveries,
    onTimePercentage: supplier.onTimePercentage,
    quality: supplier.qualityRating,
    leadTime: supplier.averageLeadTime,
    value: supplier.totalValue / 1000000 // Convert to millions
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const totalMetrics = {
    totalSuppliers: supplierData.length,
    avgOnTimePercentage: supplierData.reduce((sum, s) => sum + s.onTimePercentage, 0) / supplierData.length,
    avgQualityRating: supplierData.reduce((sum, s) => sum + s.qualityRating, 0) / supplierData.length,
    totalValue: supplierData.reduce((sum, s) => sum + s.totalValue, 0),
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
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
                  <p className="text-sm text-muted-foreground">Total Suppliers</p>
                  <p className="text-2xl font-bold">{totalMetrics.totalSuppliers}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
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
                  <p className="text-sm text-muted-foreground">Avg On-Time</p>
                  <p className="text-2xl font-bold text-green-600">{totalMetrics.avgOnTimePercentage.toFixed(1)}%</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
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
                  <p className="text-sm text-muted-foreground">Avg Quality</p>
                  <p className="text-2xl font-bold text-yellow-600">{totalMetrics.avgQualityRating.toFixed(1)}/5</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-600" />
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
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-xl font-bold">{formatCurrency(totalMetrics.totalValue)}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Performance Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="supplier" />
                <PolarRadiusAxis domain={[0, 100]} />
                <Radar
                  name="Performance"
                  dataKey="reliability"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.1}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Metrics Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Supplier Metrics
              </span>
              <Select value={metric} onValueChange={setMetric}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="onTime">On-Time %</SelectItem>
                  <SelectItem value="quality">Quality</SelectItem>
                  <SelectItem value="leadTime">Lead Time</SelectItem>
                  <SelectItem value="orders">Orders</SelectItem>
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
                <Tooltip formatter={(value, name) => {
                  if (name === 'value') return `${value}M IDR`;
                  if (name === 'quality') return `${value}/5`;
                  if (name === 'leadTime') return `${value} days`;
                  if (name === 'onTimePercentage') return `${value}%`;
                  return value;
                }} />
                <Bar 
                  dataKey={
                    metric === 'onTime' ? 'onTimePercentage' :
                    metric === 'quality' ? 'quality' :
                    metric === 'leadTime' ? 'leadTime' :
                    'orders'
                  } 
                  fill="#3b82f6" 
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Supplier Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Supplier Performance Details
            </span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="performance">Overall Performance</SelectItem>
                <SelectItem value="onTime">On-Time Delivery</SelectItem>
                <SelectItem value="quality">Quality Rating</SelectItem>
                <SelectItem value="value">Total Value</SelectItem>
              </SelectContent>
            </Select>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedSuppliers.map((supplier, index) => {
              const performanceScore = getPerformanceScore(supplier);
              const { grade, color, icon: Icon } = getPerformanceGrade(performanceScore);
              
              return (
                <motion.div
                  key={supplier.supplierId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-medium">{supplier.supplierName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {supplier.activeProducts} active products • Last order: {format(new Date(supplier.lastOrderDate), 'dd/MM/yyyy')}
                        </p>
                      </div>
                    </div>
                    <Badge className={color}>
                      Grade {grade}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Orders</p>
                      <p className="font-medium">{supplier.totalOrders}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">On-Time Delivery</p>
                      <p className="font-medium text-green-600">{supplier.onTimePercentage.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Quality Rating</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{supplier.qualityRating}/5</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Lead Time</p>
                      <p className="font-medium">{supplier.averageLeadTime} days</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Value</p>
                      <p className="font-medium">{formatCurrency(supplier.totalValue)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Performance Score</p>
                      <p className="font-medium">{performanceScore.toFixed(1)}/100</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>On-Time Performance</span>
                        <span>{supplier.onTimePercentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={supplier.onTimePercentage} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Quality Rating</span>
                        <span>{supplier.qualityRating}/5</span>
                      </div>
                      <Progress value={(supplier.qualityRating / 5) * 100} className="h-2" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupplierPerformance;