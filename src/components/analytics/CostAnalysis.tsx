import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Target, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { stockMovementApi } from '@/services/stockMovementApi';
import { CostAnalysis as CostAnalysisType } from '@/types/stock-movement';

const CostAnalysis = () => {
  const [analysisType, setAnalysisType] = useState('profit');
  const [timeframe, setTimeframe] = useState('monthly');
  
  const [costData, setCostData] = useState<CostAnalysisType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCostAnalysis = async () => {
      setLoading(true);
      try {
        const data = await stockMovementApi.getCostAnalysis();
        setCostData(data);
      } catch (error) {
        console.error('Failed to fetch cost analysis:', error);
        setCostData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCostAnalysis();
  }, []);

  const totalMetrics = {
    totalValue: costData.reduce((sum, item) => sum + item.currentValue, 0),
    totalCost: costData.reduce((sum, item) => sum + item.totalCost, 0),
    totalProfit: costData.reduce((sum, item) => sum + item.profit, 0),
    averageMargin: costData.reduce((sum, item) => sum + item.profitMargin, 0) / costData.length,
    totalCarryingCost: costData.reduce((sum, item) => sum + item.carryingCost, 0),
  };

  const chartData = costData.map(item => ({
    name: item.productName.split(' ').slice(0, 2).join(' '),
    cost: item.totalCost,
    value: item.currentValue,
    profit: item.profit,
    margin: item.profitMargin,
    turnover: item.turnoverRate,
    carrying: item.carryingCost
  }));

  const profitData = [
    { name: 'Profitable', value: costData.filter(item => item.profit > 0).length, color: '#10b981' },
    { name: 'Break Even', value: costData.filter(item => item.profit === 0).length, color: '#f59e0b' },
    { name: 'Loss', value: costData.filter(item => item.profit < 0).length, color: '#ef4444' },
  ];

  const marginRanges = [
    { range: '>20%', count: costData.filter(item => item.profitMargin > 20).length, color: '#10b981' },
    { range: '10-20%', count: costData.filter(item => item.profitMargin >= 10 && item.profitMargin <= 20).length, color: '#3b82f6' },
    { range: '5-10%', count: costData.filter(item => item.profitMargin >= 5 && item.profitMargin < 10).length, color: '#f59e0b' },
    { range: '<5%', count: costData.filter(item => item.profitMargin < 5).length, color: '#ef4444' },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const getMarginColor = (margin: number) => {
    if (margin > 20) return 'text-green-600 bg-green-100';
    if (margin > 10) return 'text-blue-600 bg-blue-100';
    if (margin > 5) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
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
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-xl font-bold">{formatCurrency(totalMetrics.totalValue)}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600" />
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
                  <p className="text-sm text-muted-foreground">Total Cost</p>
                  <p className="text-xl font-bold">{formatCurrency(totalMetrics.totalCost)}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-red-600" />
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
                  <p className="text-sm text-muted-foreground">Total Profit</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(totalMetrics.totalProfit)}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
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
                  <p className="text-sm text-muted-foreground">Avg. Margin</p>
                  <p className="text-xl font-bold">{totalMetrics.averageMargin.toFixed(1)}%</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost vs Value Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Cost vs Value Analysis
              </span>
              <Select value={analysisType} onValueChange={setAnalysisType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="profit">Profit</SelectItem>
                  <SelectItem value="margin">Margin</SelectItem>
                  <SelectItem value="turnover">Turnover</SelectItem>
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
                  if (name === 'cost' || name === 'value' || name === 'profit' || name === 'carrying') {
                    return formatCurrency(value as number);
                  }
                  return `${value}${name === 'margin' ? '%' : ''}`;
                }} />
                <Bar dataKey="cost" fill="#ef4444" name="Cost" />
                <Bar dataKey="value" fill="#3b82f6" name="Value" />
                {analysisType === 'profit' && <Bar dataKey="profit" fill="#10b981" name="Profit" />}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Profit Margin Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5" />
              Profit Margin Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={marginRanges}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ range, count }) => `${range}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {marginRanges.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Cost Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Detailed Cost Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {costData.map((item, index) => (
              <motion.div
                key={item.productId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium">{item.productName}</h4>
                    <p className="text-sm text-muted-foreground">Product ID: {item.productId}</p>
                  </div>
                  <Badge className={getMarginColor(item.profitMargin)}>
                    {item.profitMargin.toFixed(1)}% Margin
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Cost</p>
                    <p className="font-medium">{formatCurrency(item.totalCost)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Value</p>
                    <p className="font-medium">{formatCurrency(item.currentValue)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Profit</p>
                    <p className={`font-medium ${item.profit > 0 ? 'text-green-600' : item.profit < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                      {formatCurrency(item.profit)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Turnover Rate</p>
                    <p className="font-medium">{item.turnoverRate.toFixed(1)}x</p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Profitability</span>
                    <span>{item.profitMargin.toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={Math.min(item.profitMargin, 100)} 
                    className="h-2"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CostAnalysis;