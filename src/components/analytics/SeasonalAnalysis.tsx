import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, TrendingUp, Snowflake, Sun, Leaf, Cloud } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/formatters';

const SeasonalAnalysis = () => {
  const [analysisType, setAnalysisType] = useState<'monthly' | 'quarterly' | 'weekly'>('monthly');
  const [selectedYear, setSelectedYear] = useState<'2023' | '2024'>('2024');

  // Generate seasonal data
  const seasonalData = useMemo(() => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    return months.map((month, index) => {
      // Simulate seasonal patterns for different categories
      const baseValue = 10000000;
      
      // Network Equipment - peak in Q4 (business purchases)
      const networkSeasonal = 1 + 0.4 * Math.cos((index - 10) * Math.PI / 6);
      
      // Servers - steady with slight Q1/Q3 peaks (budget cycles)
      const serverSeasonal = 1 + 0.2 * Math.cos((index - 2) * Math.PI / 3);
      
      // Access Points - peak in summer (installation season)
      const accessPointSeasonal = 1 + 0.3 * Math.cos((index - 6) * Math.PI / 6);
      
      // Cables - steady throughout year
      const cableSeasonal = 1 + 0.1 * Math.sin(index * Math.PI / 6);
      
      return {
        month,
        index,
        networkEquipment: Math.round(baseValue * 0.4 * networkSeasonal),
        servers: Math.round(baseValue * 0.3 * serverSeasonal),
        accessPoints: Math.round(baseValue * 0.2 * accessPointSeasonal),
        cables: Math.round(baseValue * 0.1 * cableSeasonal),
        totalSales: Math.round(baseValue * (0.4 * networkSeasonal + 0.3 * serverSeasonal + 0.2 * accessPointSeasonal + 0.1 * cableSeasonal)),
        seasonIndex: ((networkSeasonal + serverSeasonal + accessPointSeasonal + cableSeasonal) / 4 * 100).toFixed(1)
      };
    });
  }, [selectedYear]);

  // Weekly patterns
  const weeklyData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    return days.map((day, index) => {
      const isWeekend = index >= 5;
      const businessFactor = isWeekend ? 0.3 : 1.0;
      const midWeekBoost = index >= 1 && index <= 3 ? 1.2 : 1.0;
      
      return {
        day,
        sales: Math.round(7000000 * businessFactor * midWeekBoost),
        orders: Math.round(25 * businessFactor * midWeekBoost),
        seasonIndex: (businessFactor * midWeekBoost * 100).toFixed(1)
      };
    });
  }, []);

  // Quarterly comparison
  const quarterlyData = useMemo(() => {
    return [
      { quarter: 'Q1', sales: 45000000, growth: 12.5, seasonIndex: 95 },
      { quarter: 'Q2', sales: 52000000, growth: 18.3, seasonIndex: 108 },
      { quarter: 'Q3', sales: 48000000, growth: 8.7, seasonIndex: 102 },
      { quarter: 'Q4', sales: 65000000, growth: 25.4, seasonIndex: 125 }
    ];
  }, []);

  // Seasonal insights
  const seasonalInsights = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentSeason = seasonalData[currentMonth];
    const peakMonth = seasonalData.reduce((max, curr) => 
      curr.totalSales > max.totalSales ? curr : max, seasonalData[0]);
    const lowMonth = seasonalData.reduce((min, curr) => 
      curr.totalSales < min.totalSales ? curr : min, seasonalData[0]);
    
    return {
      currentSeason,
      peakMonth,
      lowMonth,
      seasonality: ((peakMonth.totalSales - lowMonth.totalSales) / lowMonth.totalSales * 100).toFixed(1),
      nextPeakMonths: seasonalData.filter(m => m.index > currentMonth && parseFloat(m.seasonIndex) > 110).slice(0, 2)
    };
  }, [seasonalData]);

  const getSeasonIcon = (month: string) => {
    const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(month);
    if (monthIndex < 3 || monthIndex === 11) return Snowflake; // Winter
    if (monthIndex < 6) return Leaf; // Spring
    if (monthIndex < 9) return Sun; // Summer
    return Cloud; // Autumn
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((item: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: item.color }}>
              {item.name}: {
                item.name.includes('Sales') || item.name.includes('sales') 
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

  const currentData = analysisType === 'monthly' ? seasonalData : 
                     analysisType === 'weekly' ? weeklyData : quarterlyData;

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card className="glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent" />
              Seasonal Pattern Analysis
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Analysis Type:</span>
                <Select value={analysisType} onValueChange={(value: any) => setAnalysisType(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Year:</span>
                <Select value={selectedYear} onValueChange={(value: any) => setSelectedYear(value)}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Seasonal Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Current Season Index',
            value: `${seasonalInsights.currentSeason.seasonIndex}%`,
            icon: getSeasonIcon(seasonalInsights.currentSeason.month),
            color: 'primary',
            subtitle: seasonalInsights.currentSeason.month
          },
          {
            label: 'Peak Season',
            value: seasonalInsights.peakMonth.month,
            icon: TrendingUp,
            color: 'success',
            subtitle: `${seasonalInsights.peakMonth.seasonIndex}% index`
          },
          {
            label: 'Seasonality Range',
            value: `${seasonalInsights.seasonality}%`,
            icon: Calendar,
            color: 'warning',
            subtitle: 'Peak vs Low variance'
          },
          {
            label: 'Next Peak',
            value: seasonalInsights.nextPeakMonths[0]?.month || 'N/A',
            icon: getSeasonIcon(seasonalInsights.nextPeakMonths[0]?.month || 'Jan'),
            color: 'accent',
            subtitle: 'Upcoming opportunity'
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
                  Seasonal
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Main Seasonal Chart */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>
              {analysisType === 'monthly' ? 'Monthly' : 
               analysisType === 'weekly' ? 'Weekly' : 'Quarterly'} Sales Pattern
            </CardTitle>
          </CardHeader>
          <CardContent>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                {analysisType === 'monthly' ? (
                  <BarChart data={seasonalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="month"
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
                    <Bar dataKey="networkEquipment" name="Network Equipment" fill="hsl(var(--primary))" />
                    <Bar dataKey="servers" name="Servers & Storage" fill="hsl(var(--accent))" />
                    <Bar dataKey="accessPoints" name="Access Points" fill="hsl(var(--warning))" />
                    <Bar dataKey="cables" name="Cables" fill="hsl(var(--success))" />
                  </BarChart>
                ) : (
                  <LineChart data={currentData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey={analysisType === 'weekly' ? 'day' : 'quarter'}
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickFormatter={(value) => `${value / 1000000}M`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={{ r: 6 }}
                      name="Sales"
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </motion.div>
          </CardContent>
        </Card>

        {/* Seasonal Index Radar */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Seasonal Index Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={seasonalData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[80, 130]}
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Radar
                    name="Seasonal Index"
                    dataKey="seasonIndex"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>
          </CardContent>
        </Card>
      </div>

      {/* Seasonal Recommendations */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Seasonal Strategy Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                season: 'Q4 Peak Season',
                period: 'Oct - Dec',
                icon: Snowflake,
                color: 'primary',
                recommendations: [
                  'Increase Network Equipment inventory by 40%',
                  'Prepare for B2B budget cycle purchases',
                  'Launch enterprise promotion campaigns',
                  'Ensure adequate staff for holiday rush'
                ]
              },
              {
                season: 'Summer Installation',
                period: 'Jun - Aug',
                icon: Sun,
                color: 'warning',
                recommendations: [
                  'Stock up on Access Points and outdoor equipment',
                  'Partner with installation companies',
                  'Promote infrastructure upgrade packages',
                  'Prepare for construction season demand'
                ]
              },
              {
                season: 'Q1 Planning',
                period: 'Jan - Mar',
                icon: Leaf,
                color: 'success',
                recommendations: [
                  'Focus on budget planning tools and services',
                  'Clear out Q4 excess inventory',
                  'Introduce new product lines',
                  'Plan for upcoming seasonal demands'
                ]
              }
            ].map((strategy, index) => (
              <motion.div
                key={strategy.season}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-4 hover-lift border-l-4" style={{ borderLeftColor: `hsl(var(--${strategy.color}))` }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg bg-${strategy.color}/10`}>
                      <strategy.icon className={`w-5 h-5 text-${strategy.color}`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{strategy.season}</h4>
                      <p className="text-xs text-muted-foreground">{strategy.period}</p>
                    </div>
                  </div>
                  
                  <ul className="space-y-1">
                    {strategy.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className={`w-1 h-1 rounded-full bg-${strategy.color} mt-2 flex-shrink-0`}></span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SeasonalAnalysis;