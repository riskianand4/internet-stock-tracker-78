import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, AlertTriangle, Target, Lightbulb, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useHybridProducts } from '@/hooks/useHybridData';
import { useSmartInsights, useStockVelocity, useStockAlerts } from '@/hooks/useAnalyticsData';
import { formatCurrency, formatNumber } from '@/lib/formatters';
import { TimeFilter } from '../AdvancedStatsOverview';
interface SmartInsightsProps {
  timeFilter: TimeFilter;
}
const SmartInsights = ({ timeFilter }: SmartInsightsProps) => {
  const { data: insights, isLoading, isFromApi } = useSmartInsights(timeFilter);
  
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'secondary';
      case 'medium':
        return 'outline';
      default:
        return 'secondary';
    }
  };
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return TrendingUp;
      case 'alert':
        return AlertTriangle;
      case 'insight':
        return Brain;
      case 'performance':
        return Target;
      case 'recommendation':
        return Lightbulb;
      default:
        return Clock;
    }
  };

  if (isLoading) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Smart Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          Smart Insights
          {isFromApi && (
            <Badge variant="secondary" className="text-xs bg-success/20 text-success ml-auto">
              Live Data
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights && Array.isArray(insights) && insights.map((insight, index) => {
            const IconComponent = getTypeIcon(insight.type);
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-lg border bg-card/50 hover:bg-card/70 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <IconComponent className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant={getImpactColor(insight.impact)} className="text-xs">
                          {insight.impact}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {insight.timeframe}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{insight.message}</p>
                    {insight.actionable && (
                      <div className="flex justify-end">
                        <Button variant="outline" size="sm" className="text-xs">
                          Take Action
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartInsights;