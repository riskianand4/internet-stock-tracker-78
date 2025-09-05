import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, TrendingUp, Calendar, Target } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/formatters';
import { PRODUCT_VELOCITY } from '@/data/constants';
const PredictiveAnalytics = () => {
  const predictions = useMemo(() => {
    // Generate predictive data for the next 30 days
    const futureData = [];
    const baseDate = new Date();
    for (let i = 1; i <= 30; i++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + i);

      // Simulate predictions with some seasonality
      const seasonalFactor = 1 + Math.sin(i / 30 * Math.PI * 2) * 0.2;
      const trendFactor = 1 + i / 30 * 0.1; // slight upward trend
      const randomFactor = 0.9 + Math.random() * 0.2;
      const baseDemand = 15;
      const predictedDemand = baseDemand * seasonalFactor * trendFactor * randomFactor;
      futureData.push({
        date: date.toISOString().split('T')[0],
        formattedDate: date.toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short'
        }),
        predictedDemand: Math.round(predictedDemand),
        confidenceHigh: Math.round(predictedDemand * 1.2),
        confidenceLow: Math.round(predictedDemand * 0.8),
        reorderAlert: Math.random() > 0.8,
        stockoutRisk: Math.random() * 100,
        demandSpike: Math.random() > 0.9
      });
    }
    return futureData;
  }, []);
  const reorderPredictions = useMemo(() => {
    return PRODUCT_VELOCITY.filter(p => p.daysUntilOutOfStock < 30).sort((a, b) => a.daysUntilOutOfStock - b.daysUntilOutOfStock).slice(0, 8).map(p => ({
      ...p,
      sku: p.productId,
      currentStock: Math.round(p.dailyMovement * p.daysUntilOutOfStock * (1 + Math.random() * 0.3)),
      stockoutRisk: Math.min(95, 100 - p.daysUntilOutOfStock / 30 * 100),
      predictedStockout: new Date(Date.now() + p.daysUntilOutOfStock * 24 * 60 * 60 * 1000),
      reorderDate: new Date(Date.now() + (p.daysUntilOutOfStock - 3) * 24 * 60 * 60 * 1000),
      confidence: 85 + Math.random() * 10,
      seasonalAdjustment: 1.0 + (Math.random() - 0.5) * 0.2
    }));
  }, []);
  const CustomTooltip = ({
    active,
    payload,
    label
  }: any) => {
    if (active && payload && payload.length) {
      return <div className="bg-card border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((item: any, index: number) => <p key={index} style={{
          color: item.color
        }} className="text-sm">
              {item.name}: {formatNumber(item.value)}
            </p>)}
        </div>;
    }
    return null;
  };
  const getRiskColor = (risk: number) => {
    if (risk > 70) return 'destructive';
    if (risk > 40) return 'warning';
    return 'success';
  };
  return;
};
export default PredictiveAnalytics;