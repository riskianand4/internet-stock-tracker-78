import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend, AreaChart, Area } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, AlertTriangle, Target, Calendar, Zap } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/formatters';

const SalesForecasting = () => {
  const [forecastPeriod, setForecastPeriod] = useState<'30' | '90' | '180' | '365'>('90');
  const [confidenceLevel, setConfidenceLevel] = useState<'80' | '90' | '95'>('90');

  // Generate forecasting data
  const forecastData = useMemo(() => {
    const days = parseInt(forecastPeriod);
    const data = [];
    const baseValue = 50000000; // Base daily sales
    
    // Historical data (last 30 days)
    for (let i = -30; i <= 0; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      const seasonalFactor = 1 + 0.3 * Math.sin((date.getMonth() / 12) * 2 * Math.PI);
      const trendFactor = 1 + (i / 365) * 0.1; // 10% annual growth
      const randomFactor = 0.8 + Math.random() * 0.4;
      
      data.push({
        date: date.toISOString().split('T')[0],
        formattedDate: date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }),
        actualSales: Math.round(baseValue * seasonalFactor * trendFactor * randomFactor),
        type: 'historical'
      });
    }
    
    // Forecast data
    for (let i = 1; i <= days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      const seasonalFactor = 1 + 0.3 * Math.sin((date.getMonth() / 12) * 2 * Math.PI);
      const trendFactor = 1 + (i / 365) * 0.12; // 12% growth trend
      const confidenceFactor = parseInt(confidenceLevel) / 100;
      
      const forecastValue = baseValue * seasonalFactor * trendFactor;
      const margin = forecastValue * (1 - confidenceFactor) * 0.5;
      
      data.push({
        date: date.toISOString().split('T')[0],
        formattedDate: date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }),
        forecastSales: Math.round(forecastValue),
        upperBound: Math.round(forecastValue + margin),
        lowerBound: Math.round(forecastValue - margin),
        confidence: parseInt(confidenceLevel),
        type: 'forecast'
      });
    }
    
    return data;
  }, [forecastPeriod, confidenceLevel]);

  // Calculate forecast insights
  const insights = useMemo(() => {
    const forecastOnly = forecastData.filter(d => d.type === 'forecast');
    const historicalOnly = forecastData.filter(d => d.type === 'historical');
    
    const avgHistorical = historicalOnly.reduce((sum, d) => sum + (d.actualSales || 0), 0) / historicalOnly.length;
    const avgForecast = forecastOnly.reduce((sum, d) => sum + (d.forecastSales || 0), 0) / forecastOnly.length;
    const growthRate = ((avgForecast - avgHistorical) / avgHistorical) * 100;
    
    const totalForecast = forecastOnly.reduce((sum, d) => sum + (d.forecastSales || 0), 0);
    
    return {
      avgHistorical,
      avgForecast,
      growthRate,
      totalForecast,
      peakDay: forecastOnly.reduce((max, d) => d.forecastSales! > (max.forecastSales || 0) ? d : max, forecastOnly[0]),
      lowDay: forecastOnly.reduce((min, d) => d.forecastSales! < (min.forecastSales || Infinity) ? d : min, forecastOnly[0])
    };
  }, [forecastData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">{data.formattedDate}</p>
          {data.actualSales && (
            <p className="text-sm text-primary">
              Actual: {formatCurrency(data.actualSales)}
            </p>
          )}
          {data.forecastSales && (
            <>
              <p className="text-sm text-accent">
                Forecast: {formatCurrency(data.forecastSales)}
              </p>
              <p className="text-xs text-muted-foreground">
                Range: {formatCurrency(data.lowerBound)} - {formatCurrency(data.upperBound)}
              </p>
              <p className="text-xs text-muted-foreground">
                Confidence: {data.confidence}%
              </p>
            </>
          )}
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
              <TrendingUp className="w-5 h-5 text-accent" />
              Sales Forecasting Model
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Forecast Period:</span>
                <Select value={forecastPeriod} onValueChange={(value: any) => setForecastPeriod(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 Days</SelectItem>
                    <SelectItem value="90">90 Days</SelectItem>
                    <SelectItem value="180">6 Months</SelectItem>
                    <SelectItem value="365">1 Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Confidence:</span>
                <Select value={confidenceLevel} onValueChange={(value: any) => setConfidenceLevel(value)}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="80">80%</SelectItem>
                    <SelectItem value="90">90%</SelectItem>
                    <SelectItem value="95">95%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Expected Growth',
            value: `${insights.growthRate > 0 ? '+' : ''}${insights.growthRate.toFixed(1)}%`,
            icon: insights.growthRate > 0 ? TrendingUp : AlertTriangle,
            color: insights.growthRate > 0 ? 'success' : 'warning'
          },
          {
            label: 'Total Forecast',
            value: formatCurrency(insights.totalForecast),
            icon: Target,
            color: 'primary'
          },
          {
            label: 'Peak Day',
            value: formatCurrency(insights.peakDay?.forecastSales || 0),
            icon: Zap,
            color: 'accent',
            subtitle: insights.peakDay?.formattedDate
          },
          {
            label: 'Avg Daily Sales',
            value: formatCurrency(insights.avgForecast),
            icon: Calendar,
            color: 'secondary'
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
                  {confidenceLevel}% confidence
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="text-xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
                {stat.subtitle && (
                  <div className="text-xs text-muted-foreground">{stat.subtitle}</div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Forecast Chart */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Sales Forecast Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="h-96"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="formattedDate"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => `${value / 1000000}M`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                
                {/* Historical Sales */}
                <Line
                  type="monotone"
                  dataKey="actualSales"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Historical Sales"
                  connectNulls={false}
                />
                
                {/* Forecast Sales */}
                <Line
                  type="monotone"
                  dataKey="forecastSales"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 4 }}
                  name="Forecast Sales"
                  connectNulls={false}
                />
                
                {/* Upper Bound */}
                <Line
                  type="monotone"
                  dataKey="upperBound"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={1}
                  dot={false}
                  name={`Upper Bound (${confidenceLevel}%)`}
                  connectNulls={false}
                />
                
                {/* Lower Bound */}
                <Line
                  type="monotone"
                  dataKey="lowerBound"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={1}
                  dot={false}
                  name={`Lower Bound (${confidenceLevel}%)`}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </CardContent>
      </Card>

      {/* Forecast Table */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Detailed Forecast Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {forecastData.filter(d => d.type === 'forecast').slice(0, 10).map((item, index) => (
              <motion.div
                key={item.date}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 rounded-lg border bg-card/50"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-sm">{item.formattedDate}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(item.forecastSales!)}</div>
                    <div className="text-xs text-muted-foreground">
                      ±{formatCurrency((item.upperBound! - item.lowerBound!) / 2)}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {item.confidence}%
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

export default SalesForecasting;