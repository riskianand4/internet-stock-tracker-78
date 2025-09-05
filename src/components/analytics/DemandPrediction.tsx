import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, BarChart, Bar, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Brain, AlertTriangle, TrendingUp, Package, Zap, Target } from 'lucide-react';
import { formatNumber } from '@/lib/formatters';
import { DUMMY_PRODUCTS } from '@/data/constants';

const DemandPrediction = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [predictionHorizon, setPredictionHorizon] = useState<'7' | '14' | '30'>('14');

  // Generate AI demand predictions
  const demandPredictions = useMemo(() => {
    const days = parseInt(predictionHorizon);
    const predictions = [];
    
    for (let i = 1; i <= days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      // Simulate AI demand prediction algorithm
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const weekendFactor = isWeekend ? 0.7 : 1.0;
      
      // Seasonal demand patterns
      const seasonalFactor = 1 + 0.2 * Math.sin((date.getMonth() / 12) * 2 * Math.PI);
      
      // AI confidence based on historical data quality
      const confidence = 85 + Math.random() * 10; // 85-95%
      
      const baseDemand = 150;
      const predictedDemand = Math.round(baseDemand * seasonalFactor * weekendFactor * (0.9 + Math.random() * 0.2));
      
      predictions.push({
        date: date.toISOString().split('T')[0],
        formattedDate: date.toLocaleDateString('id-ID', { 
          month: 'short', 
          day: 'numeric',
          weekday: 'short' 
        }),
        predictedDemand,
        confidence: Math.round(confidence),
        demandSpike: predictedDemand > baseDemand * 1.3,
        riskLevel: confidence < 90 ? 'medium' : 'low',
        weekday: dayOfWeek
      });
    }
    
    return predictions;
  }, [predictionHorizon]);

  // Product-specific demand predictions
  const productDemandPredictions = useMemo(() => {
    return DUMMY_PRODUCTS
      .filter(product => selectedCategory === 'all' || product.category === selectedCategory)
      .map(product => {
        const baseVelocity = 2 + Math.random() * 8; // 2-10 units per day
        const seasonalMultiplier = product.category === 'Network Equipment' ? 1.2 : 1.0;
        const aiAdjustment = 0.85 + Math.random() * 0.3; // AI optimization factor
        
        const predictedDemand = Math.round(baseVelocity * seasonalMultiplier * aiAdjustment);
        const confidence = 80 + Math.random() * 15; // 80-95%
        const riskScore = product.stock < predictedDemand * 7 ? 'high' : 
                         product.stock < predictedDemand * 14 ? 'medium' : 'low';
        
        return {
          ...product,
          predictedDailyDemand: predictedDemand,
          confidence: Math.round(confidence),
          riskScore,
          stockoutProbability: Math.max(0, 100 - (product.stock / (predictedDemand * 14)) * 100),
          recommendedOrder: riskScore === 'high' ? predictedDemand * 30 : 0
        };
      })
      .sort((a, b) => b.stockoutProbability - a.stockoutProbability);
  }, [selectedCategory]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(DUMMY_PRODUCTS.map(p => p.category)));
    return ['all', ...cats];
  }, []);

  // Summary insights
  const insights = useMemo(() => {
    const totalPredictedDemand = demandPredictions.reduce((sum, d) => sum + d.predictedDemand, 0);
    const avgConfidence = demandPredictions.reduce((sum, d) => sum + d.confidence, 0) / demandPredictions.length;
    const spikeDays = demandPredictions.filter(d => d.demandSpike).length;
    const highRiskProducts = productDemandPredictions.filter(p => p.riskScore === 'high').length;
    
    return {
      totalPredictedDemand,
      avgConfidence: Math.round(avgConfidence),
      spikeDays,
      highRiskProducts,
      peakDay: demandPredictions.reduce((max, d) => d.predictedDemand > max.predictedDemand ? d : max, demandPredictions[0])
    };
  }, [demandPredictions, productDemandPredictions]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">{data.formattedDate}</p>
          <p className="text-sm text-primary">
            Predicted Demand: {formatNumber(data.predictedDemand)} units
          </p>
          <p className="text-sm text-accent">
            AI Confidence: {data.confidence}%
          </p>
          {data.demandSpike && (
            <Badge variant="destructive" className="text-xs mt-1">
              Demand Spike Alert
            </Badge>
          )}
        </div>
      );
    }
    return null;
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      default: return 'success';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card className="glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              AI Demand Prediction Engine
              <Badge variant="outline" className="text-xs">
                ML Powered
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Category:</span>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.slice(1).map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Horizon:</span>
                <Select value={predictionHorizon} onValueChange={(value: any) => setPredictionHorizon(value)}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 Days</SelectItem>
                    <SelectItem value="14">14 Days</SelectItem>
                    <SelectItem value="30">30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* AI Insights Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Predicted Demand',
            value: formatNumber(insights.totalPredictedDemand),
            icon: Target,
            color: 'primary'
          },
          {
            label: 'AI Confidence',
            value: `${insights.avgConfidence}%`,
            icon: Brain,
            color: 'success'
          },
          {
            label: 'Demand Spike Days',
            value: `${insights.spikeDays}`,
            icon: Zap,
            color: 'warning'
          },
          {
            label: 'High Risk Products',
            value: `${insights.highRiskProducts}`,
            icon: AlertTriangle,
            color: 'destructive'
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4 glass hover-lift">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`w-5 h-5 text-${stat.color}`} />
                <Badge variant="outline" className="text-xs">
                  AI Predicted
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="text-xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Demand Trend Prediction */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Daily Demand Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={demandPredictions}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="formattedDate"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="predictedDemand"
                    stroke="hsl(var(--primary))"
                    fillOpacity={0.3}
                    fill="hsl(var(--primary))"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </CardContent>
        </Card>

        {/* Product Risk Analysis */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Product Stockout Risk Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {productDemandPredictions.slice(0, 8).map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{product.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={getRiskColor(product.riskScore) === 'destructive' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {product.riskScore} risk
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {product.confidence}% confidence
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Predicted Demand:</span>
                        <span className="font-medium">{product.predictedDailyDemand}/day</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current Stock:</span>
                        <span className="font-medium">{product.stock} units</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Stockout Risk:</span>
                        <span className={`font-medium text-${getRiskColor(product.riskScore)}`}>
                          {Math.round(product.stockoutProbability)}%
                        </span>
                      </div>
                      <Progress 
                        value={product.stockoutProbability} 
                        className="h-1"
                      />
                    </div>
                  </div>

                  {product.recommendedOrder > 0 && (
                    <div className="mt-2 pt-2 border-t border-border/50">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-warning">Recommended Order:</span>
                        <span className="font-medium text-warning">
                          {product.recommendedOrder} units
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Model Performance */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>AI Model Performance & Confidence</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Model Accuracy</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Last 7 Days</span>
                  <span className="font-medium">94.2%</span>
                </div>
                <Progress value={94.2} className="h-2" />
                
                <div className="flex justify-between text-xs">
                  <span>Last 30 Days</span>
                  <span className="font-medium">91.7%</span>
                </div>
                <Progress value={91.7} className="h-2" />
                
                <div className="flex justify-between text-xs">
                  <span>Overall</span>
                  <span className="font-medium">89.3%</span>
                </div>
                <Progress value={89.3} className="h-2" />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-sm">Prediction Confidence</h4>
              <div className="space-y-2">
                {[
                  { range: '90-95%', count: 12, color: 'success' },
                  { range: '85-90%', count: 8, color: 'warning' },
                  { range: '80-85%', count: 3, color: 'destructive' }
                ].map((conf, index) => (
                  <div key={conf.range} className="flex items-center justify-between text-xs">
                    <span>{conf.range}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{conf.count} products</span>
                      <div className={`w-2 h-2 rounded-full bg-${conf.color}`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-sm">Model Status</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span>Last Updated</span>
                  <Badge variant="outline" className="text-xs">2 hours ago</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Training Data</span>
                  <span className="font-medium">365 days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Algorithm</span>
                  <span className="font-medium">LSTM Neural Network</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Status</span>
                  <Badge variant="outline" className="text-xs text-success border-success">
                    Active
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DemandPrediction;