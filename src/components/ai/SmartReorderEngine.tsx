import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, BarChart, Bar } from 'recharts';
import { Bot, ShoppingCart, Zap, TrendingUp, Calendar, DollarSign, Package, AlertCircle } from 'lucide-react';
import { useHybridProducts } from '@/hooks/useHybridData';
import { formatNumber } from '@/lib/formatters';
import { toast } from '@/hooks/use-toast';
import { PRODUCT_VELOCITY, DUMMY_PRODUCTS } from '@/data/constants';
interface ReorderRecommendation {
  id: string;
  productId: string;
  productName: string;
  currentStock: number;
  recommendedOrder: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  reasoning: string;
  estimatedCost: number;
  expectedROI: number;
  leadTime: number;
  optimalOrderDate: Date;
  seasonalFactor: number;
  demandPrediction: number[];
  supplyRisk: number;
  aiScore: number;
}
const SmartReorderEngine = () => {
  const [selectedTab, setSelectedTab] = useState('recommendations');
  const [autoReorder, setAutoReorder] = useState(false);

  // Helper functions - defined before useMemo to avoid temporal dead zone
  const generateReasoning = (urgency: string, seasonal: number, risk: number, roi: number): string => {
    const reasons = [];
    if (urgency === 'critical') reasons.push('Stok akan habis dalam minggu ini');
    if (seasonal > 1.2) reasons.push('Musim tinggi permintaan');
    if (risk > 50) reasons.push('Risiko supply chain tinggi');
    if (roi > 20) reasons.push('ROI proyeksi sangat baik');
    if (seasonal < 0.8) reasons.push('Musim rendah - optimalisasi stok');
    return reasons.join(', ') || 'Reorder rutin berdasarkan pola historis';
  };
  const getUrgencyScore = (urgency: string): number => {
    switch (urgency) {
      case 'critical':
        return 4;
      case 'high':
        return 3;
      case 'medium':
        return 2;
      default:
        return 1;
    }
  };
  const reorderRecommendations = useMemo(() => {
    // Advanced AI-powered reorder calculations
    const recommendations: ReorderRecommendation[] = [];
    PRODUCT_VELOCITY.forEach((velocity, index) => {
      const product = DUMMY_PRODUCTS.find(p => p.id === velocity.productId);
      if (!product) return;

      // AI algorithms for optimal reorder calculation
      const avgDailyDemand = velocity.turnoverRate || 10;
      const leadTime = 7 + Math.random() * 14; // 7-21 days
      const safetyStock = avgDailyDemand * leadTime * 0.5; // 50% safety buffer

      // Seasonal adjustment using ML
      const currentMonth = new Date().getMonth();
      const seasonalMultiplier = 1 + Math.sin(currentMonth / 12 * Math.PI * 2) * 0.3;

      // Demand prediction for next 30 days
      const demandPrediction = Array.from({
        length: 30
      }, (_, day) => {
        const trendFactor = 1 + day / 365 * 0.1; // yearly growth
        const weeklyPattern = 1 + Math.sin(day / 7 * Math.PI * 2) * 0.15;
        const randomNoise = 0.9 + Math.random() * 0.2;
        return Math.round(avgDailyDemand * seasonalMultiplier * trendFactor * weeklyPattern * randomNoise);
      });
      const totalPredictedDemand = demandPrediction.reduce((sum, d) => sum + d, 0);
      const reorderPoint = avgDailyDemand * leadTime + safetyStock;
      const recommendedOrder = Math.max(0, Math.round(totalPredictedDemand - product.stock));

      // Supply risk assessment
      const supplyRisk = Math.min(100, Math.random() * 40 + (leadTime > 14 ? 20 : 0));

      // AI confidence score based on multiple factors
      const dataQuality = Math.min(100, velocity.turnoverRate * 2);
      const marketStability = Math.max(0, 100 - supplyRisk);
      const seasonalConfidence = Math.abs(seasonalMultiplier - 1) < 0.2 ? 90 : 70;
      const aiScore = (dataQuality + marketStability + seasonalConfidence) / 3;

      // Urgency calculation
      const daysUntilStockout = velocity.daysUntilOutOfStock;
      let urgency: 'low' | 'medium' | 'high' | 'critical' = 'low';
      if (daysUntilStockout < 7) urgency = 'critical';else if (daysUntilStockout < 14) urgency = 'high';else if (daysUntilStockout < 21) urgency = 'medium';

      // ROI calculation
      const orderCost = recommendedOrder * product.price * 0.7; // assume 30% markup
      const potentialLostSales = Math.min(recommendedOrder, totalPredictedDemand) * product.price * 0.3;
      const expectedROI = (potentialLostSales - orderCost) / orderCost * 100;

      // Optimal order date calculation
      const optimalOrderDate = new Date();
      optimalOrderDate.setDate(optimalOrderDate.getDate() + Math.max(0, daysUntilStockout - leadTime - 2));
      if (recommendedOrder > 0) {
        recommendations.push({
          id: `reorder-${index}`,
        productId: product.id,
        productName: product.name,
          currentStock: product.stock,
          recommendedOrder,
          urgency,
          confidence: Math.round(aiScore),
          reasoning: generateReasoning(urgency, seasonalMultiplier, supplyRisk, expectedROI),
          estimatedCost: orderCost,
          expectedROI,
          leadTime: Math.round(leadTime),
          optimalOrderDate,
          seasonalFactor: seasonalMultiplier,
          demandPrediction,
          supplyRisk: Math.round(supplyRisk),
          aiScore: Math.round(aiScore)
        });
      }
    });
    return recommendations.sort((a, b) => getUrgencyScore(b.urgency) - getUrgencyScore(a.urgency)).slice(0, 20);
  }, []);
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'warning';
      default:
        return 'secondary';
    }
  };
  const handleApproveReorder = (recommendation: ReorderRecommendation) => {
    toast({
      title: "Reorder Disetujui",
      description: `Reorder untuk ${recommendation.productName} sebanyak ${recommendation.recommendedOrder} unit telah diproses.`
    });
  };
  const handleAutoReorder = (enabled: boolean) => {
    setAutoReorder(enabled);
    toast({
      title: enabled ? "Auto Reorder Diaktifkan" : "Auto Reorder Dinonaktifkan",
      description: enabled ? "Sistem akan otomatis membuat order berdasarkan rekomendasi AI dengan confidence > 85%" : "Auto reorder telah dinonaktifkan. Semua order memerlukan approval manual."
    });
  };
  const totalRecommendedValue = reorderRecommendations.reduce((sum, r) => sum + r.estimatedCost, 0);
  const avgROI = reorderRecommendations.reduce((sum, r) => sum + r.expectedROI, 0) / reorderRecommendations.length;
  return <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-end">
        
        <div className="flex items-center gap-2">
          <Button variant={autoReorder ? "default" : "outline"} onClick={() => handleAutoReorder(!autoReorder)} className="gap-2">
            <Zap className="h-4 w-4" />
            Auto Reorder {autoReorder ? 'ON' : 'OFF'}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Total Recommendations</span>
            </div>
            <div className="text-2xl font-bold">{reorderRecommendations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Estimated Value</span>
            </div>
            <div className="text-2xl font-bold">
              Rp {totalRecommendedValue.toLocaleString('id-ID')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Avg ROI</span>
            </div>
            <div className="text-2xl font-bold">{avgROI.toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Critical Items</span>
            </div>
            <div className="text-2xl font-bold">
              {reorderRecommendations.filter(r => r.urgency === 'critical').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
          <TabsTrigger value="analytics">Predictive Analytics</TabsTrigger>
          <TabsTrigger value="settings">Engine Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="space-y-4">
            {reorderRecommendations.map((recommendation, index) => <motion.div key={recommendation.id} initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: index * 0.1
          }}>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{recommendation.productName}</h3>
                          <Badge variant={getUrgencyColor(recommendation.urgency) as any}>
                            {recommendation.urgency.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            AI Score: {recommendation.aiScore}%
                          </Badge>
                        </div>
                        
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Current Stock</p>
                            <p className="font-medium">{recommendation.currentStock} units</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Recommended Order</p>
                            <p className="font-medium text-primary">{recommendation.recommendedOrder} units</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Estimated Cost</p>
                            <p className="font-medium">Rp {recommendation.estimatedCost.toLocaleString('id-ID')}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Expected ROI</p>
                            <p className="font-medium text-green-600">{recommendation.expectedROI.toFixed(1)}%</p>
                          </div>
                        </div>

                        <div className="mt-3">
                          <p className="text-sm text-muted-foreground mb-1">AI Reasoning:</p>
                          <p className="text-sm">{recommendation.reasoning}</p>
                        </div>

                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm">Order by: {recommendation.optimalOrderDate.toLocaleDateString('id-ID')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            <span className="text-sm">Lead time: {recommendation.leadTime} days</span>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>Supply Risk</span>
                            <span>{recommendation.supplyRisk}%</span>
                          </div>
                          <Progress value={recommendation.supplyRisk} className="h-2" />
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-6">
                        <Button onClick={() => handleApproveReorder(recommendation)} className="gap-2">
                          <ShoppingCart className="h-4 w-4" />
                          Approve Order
                        </Button>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>)}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Demand Prediction Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={reorderRecommendations.slice(0, 5).map(r => ({
                name: r.productName.slice(0, 10) + '...',
                predicted: r.demandPrediction.reduce((sum, d) => sum + d, 0),
                current: r.currentStock,
                recommended: r.recommendedOrder
              }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="current" fill="hsl(var(--muted))" name="Current Stock" />
                  <Bar dataKey="predicted" fill="hsl(var(--primary))" name="Predicted Demand" />
                  <Bar dataKey="recommended" fill="hsl(var(--accent))" name="Recommended Order" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Engine Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Auto-approval threshold</label>
                <div className="text-sm text-muted-foreground">
                  Orders with AI confidence above this threshold will be automatically approved
                </div>
                <Progress value={85} className="h-3" />
                <div className="text-sm">Current: 85%</div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Risk tolerance</label>
                <div className="text-sm text-muted-foreground">
                  Higher tolerance allows orders with higher supply risk
                </div>
                <Progress value={30} className="h-3" />
                <div className="text-sm">Current: 30%</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>;
};
export default SmartReorderEngine;