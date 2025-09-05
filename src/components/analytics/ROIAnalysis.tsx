import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, DollarSign, Calculator, AlertTriangle, Award } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/formatters';
import { DUMMY_PRODUCTS } from '@/data/constants';

const ROIAnalysis = () => {
  const [analysisType, setAnalysisType] = useState<'product' | 'category' | 'investment'>('product');
  const [timeframe, setTimeframe] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');

  // Generate ROI data for products
  const productROI = useMemo(() => {
    return DUMMY_PRODUCTS.map(product => {
      const monthlySales = Math.random() * 20 + 5; // 5-25 units per month
      const revenue = monthlySales * product.price;
      const cost = product.price * 0.7; // Assume 70% cost ratio
      const profit = revenue - (monthlySales * cost);
      const roi = (profit / (monthlySales * cost)) * 100;
      const inventoryCost = product.stock * cost;
      const turnoverMonths = product.stock / monthlySales;
      
      return {
        ...product,
        monthlySales: Math.round(monthlySales),
        revenue: Math.round(revenue),
        cost: Math.round(monthlySales * cost),
        profit: Math.round(profit),
        roi: Math.round(roi * 10) / 10,
        inventoryCost: Math.round(inventoryCost),
        turnoverMonths: Math.round(turnoverMonths * 10) / 10,
        profitMargin: Math.round(((product.price - cost) / product.price) * 100)
      };
    }).sort((a, b) => b.roi - a.roi);
  }, []);

  // Category ROI analysis
  const categoryROI = useMemo(() => {
    const categories = Array.from(new Set(productROI.map(p => p.category)));
    
    return categories.map(category => {
      const products = productROI.filter(p => p.category === category);
      const totalRevenue = products.reduce((sum, p) => sum + p.revenue, 0);
      const totalCost = products.reduce((sum, p) => sum + p.cost, 0);
      const totalProfit = totalRevenue - totalCost;
      const avgROI = products.reduce((sum, p) => sum + p.roi, 0) / products.length;
      const inventoryValue = products.reduce((sum, p) => sum + p.inventoryCost, 0);
      
      return {
        category,
        productCount: products.length,
        totalRevenue: Math.round(totalRevenue),
        totalCost: Math.round(totalCost),
        totalProfit: Math.round(totalProfit),
        avgROI: Math.round(avgROI * 10) / 10,
        inventoryValue: Math.round(inventoryValue),
        profitMargin: Math.round((totalProfit / totalRevenue) * 100)
      };
    }).sort((a, b) => b.avgROI - a.avgROI);
  }, [productROI]);

  // Investment analysis
  const investmentAnalysis = useMemo(() => {
    const totalInventoryValue = productROI.reduce((sum, p) => sum + p.inventoryCost, 0);
    const totalMonthlyRevenue = productROI.reduce((sum, p) => sum + p.revenue, 0);
    const totalMonthlyProfit = productROI.reduce((sum, p) => sum + p.profit, 0);
    const overallROI = (totalMonthlyProfit / totalInventoryValue) * 100;
    const paybackPeriod = totalInventoryValue / totalMonthlyProfit;
    
    return {
      totalInventoryValue: Math.round(totalInventoryValue),
      totalMonthlyRevenue: Math.round(totalMonthlyRevenue),
      totalMonthlyProfit: Math.round(totalMonthlyProfit),
      overallROI: Math.round(overallROI * 10) / 10,
      annualROI: Math.round(overallROI * 12 * 10) / 10,
      paybackPeriod: Math.round(paybackPeriod * 10) / 10,
      profitMargin: Math.round((totalMonthlyProfit / totalMonthlyRevenue) * 100)
    };
  }, [productROI]);

  // Performance categories
  const performanceData = useMemo(() => {
    const excellent = productROI.filter(p => p.roi >= 50).length;
    const good = productROI.filter(p => p.roi >= 25 && p.roi < 50).length;
    const average = productROI.filter(p => p.roi >= 10 && p.roi < 25).length;
    const poor = productROI.filter(p => p.roi < 10).length;
    
    return [
      { name: 'Excellent (≥50%)', value: excellent, color: '#22c55e' },
      { name: 'Good (25-49%)', value: good, color: '#3b82f6' },
      { name: 'Average (10-24%)', value: average, color: '#f59e0b' },
      { name: 'Poor (<10%)', value: poor, color: '#ef4444' }
    ];
  }, [productROI]);

  const getROIColor = (roi: number) => {
    if (roi >= 50) return 'success';
    if (roi >= 25) return 'primary';
    if (roi >= 10) return 'warning';
    return 'destructive';
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((item: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: item.color }}>
              {item.name}: {
                item.name.includes('%') || item.name.includes('ROI')
                  ? `${item.value}%`
                  : item.name.includes('Revenue') || item.name.includes('Cost') || item.name.includes('Profit')
                  ? formatCurrency(item.value)
                  : formatNumber(item.value)
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card className="glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              ROI Analysis Dashboard
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Analysis:</span>
                <Select value={analysisType} onValueChange={(value: any) => setAnalysisType(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="product">By Product</SelectItem>
                    <SelectItem value="category">By Category</SelectItem>
                    <SelectItem value="investment">Investment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Period:</span>
                <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key ROI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Overall ROI',
            value: `${investmentAnalysis.overallROI}%`,
            icon: Target,
            color: getROIColor(investmentAnalysis.overallROI),
            subtitle: 'Monthly return'
          },
          {
            label: 'Annual ROI',
            value: `${investmentAnalysis.annualROI}%`,
            icon: TrendingUp,
            color: getROIColor(investmentAnalysis.annualROI / 12),
            subtitle: 'Annualized return'
          },
          {
            label: 'Payback Period',
            value: `${investmentAnalysis.paybackPeriod}`,
            icon: Calculator,
            color: 'accent',
            subtitle: 'Months to breakeven'
          },
          {
            label: 'Profit Margin',
            value: `${investmentAnalysis.profitMargin}%`,
            icon: DollarSign,
            color: 'success',
            subtitle: 'Monthly margin'
          }
        ].map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4 glass hover-lift">
              <div className="flex items-center justify-between mb-2">
                <metric.icon className={`w-5 h-5 text-${metric.color}`} />
                <Badge variant="outline" className="text-xs">
                  ROI Metric
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="text-xl font-bold">{metric.value}</div>
                <div className="text-xs text-muted-foreground">{metric.label}</div>
                <div className="text-xs text-muted-foreground">{metric.subtitle}</div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {analysisType === 'product' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Product ROI Chart */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Top Performing Products</CardTitle>
            </CardHeader>
            <CardContent>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="h-80"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productROI.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="roi" name="ROI %" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            </CardContent>
          </Card>

          {/* Product ROI Table */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Detailed Product Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {productROI.slice(0, 8).map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-3 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-sm">{product.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={getROIColor(product.roi) === 'success' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {product.roi}% ROI
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {product.profitMargin}% margin
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="space-y-1">
                        <div className="text-muted-foreground">Monthly Revenue</div>
                        <div className="font-medium">{formatCurrency(product.revenue)}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-muted-foreground">Monthly Profit</div>
                        <div className="font-medium text-success">{formatCurrency(product.profit)}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-muted-foreground">Turnover</div>
                        <div className="font-medium">{product.turnoverMonths}mo</div>
                      </div>
                    </div>

                    <div className="mt-2">
                      <Progress 
                        value={Math.min(product.roi, 100)} 
                        className="h-1"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {analysisType === 'category' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Category ROI Chart */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>ROI by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="h-80"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryROI}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="category"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="avgROI" name="Average ROI %" fill="hsl(var(--accent))" />
                    <Bar dataKey="profitMargin" name="Profit Margin %" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            </CardContent>
          </Card>

          {/* Category Performance */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Category Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryROI.map((category, index) => (
                  <motion.div
                    key={category.category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-lg border bg-card/50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{category.category}</h4>
                      <Badge 
                        variant={getROIColor(category.avgROI) === 'success' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {category.avgROI}% ROI
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Products:</span>
                          <span className="font-medium">{category.productCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Revenue:</span>
                          <span className="font-medium">{formatCurrency(category.totalRevenue)}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Profit:</span>
                          <span className="font-medium text-success">{formatCurrency(category.totalProfit)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Margin:</span>
                          <span className="font-medium">{category.profitMargin}%</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {analysisType === 'investment' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* ROI Distribution */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>ROI Performance Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="h-80"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={performanceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {performanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            </CardContent>
          </Card>

          {/* Investment Summary */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Investment Analysis Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Investment Overview</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Investment:</span>
                        <span className="font-medium">{formatCurrency(investmentAnalysis.totalInventoryValue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Monthly Revenue:</span>
                        <span className="font-medium">{formatCurrency(investmentAnalysis.totalMonthlyRevenue)}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Monthly Profit:</span>
                        <span className="font-medium text-success">{formatCurrency(investmentAnalysis.totalMonthlyProfit)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Payback Period:</span>
                        <span className="font-medium">{investmentAnalysis.paybackPeriod} months</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Performance Metrics</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span>Monthly ROI</span>
                        <span className="font-medium">{investmentAnalysis.overallROI}%</span>
                      </div>
                      <Progress value={Math.min(investmentAnalysis.overallROI * 2, 100)} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span>Profit Margin</span>
                        <span className="font-medium">{investmentAnalysis.profitMargin}%</span>
                      </div>
                      <Progress value={investmentAnalysis.profitMargin} className="h-2" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Recommendations</h4>
                  <div className="space-y-2 text-xs">
                    {investmentAnalysis.overallROI >= 20 ? (
                      <div className="flex items-center gap-2 text-success">
                        <TrendingUp className="w-3 h-3" />
                        Excellent performance. Consider expanding high-ROI categories.
                      </div>
                    ) : investmentAnalysis.overallROI >= 10 ? (
                      <div className="flex items-center gap-2 text-warning">
                        <AlertTriangle className="w-3 h-3" />
                        Good performance. Optimize inventory turnover for better returns.
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="w-3 h-3" />
                        Below target. Review product mix and pricing strategy.
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Target className="w-3 h-3" />
                      Focus on products with ROI &gt; 25% for maximum profitability.
                    </div>
                    
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calculator className="w-3 h-3" />
                      Reduce inventory of products with ROI &lt; 10%.
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ROIAnalysis;