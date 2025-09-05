import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Monitor, 
  Zap, 
  TrendingUp,
  Download,
  RefreshCw,
  AlertTriangle,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import usePerformanceMonitor from '@/hooks/usePerformanceMonitor';
import { format } from 'date-fns';

const PerformanceMonitor = () => {
  const {
    metrics,
    alerts,
    isMonitoring,
    getPerformanceScore,
    getPerformanceGrade,
    startMonitoring,
    stopMonitoring,
    exportReport,
    clearAlerts,
    thresholds,
  } = usePerformanceMonitor();

  const [showDetails, setShowDetails] = useState(false);

  const score = getPerformanceScore();
  const grade = getPerformanceGrade();

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    if (score >= 60) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const formatMetric = (value: number, unit: string) => {
    if (unit === 'ms') {
      return value < 1000 ? `${value.toFixed(1)}ms` : `${(value / 1000).toFixed(2)}s`;
    }
    if (unit === 'MB') {
      return `${value.toFixed(1)}MB`;
    }
    return `${Math.round(value)}${unit}`;
  };

  const recentAlerts = alerts.slice(0, 3);

  return (
    <>
      {/* Performance Score Widget */}
      <Card className="relative overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              Performance
            </div>
            <Dialog open={showDetails} onOpenChange={setShowDetails}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs">
                  Details
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Performance Monitor</DialogTitle>
                  <DialogDescription>
                    Real-time application performance metrics and alerts
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Overall Score */}
                  <div className="text-center">
                    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-2xl font-bold ${getScoreColor(score)}`}>
                      {grade}
                    </div>
                    <div className="mt-2">
                      <div className="text-2xl font-bold">{score}/100</div>
                      <div className="text-sm text-muted-foreground">Performance Score</div>
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-muted-foreground">Render Time</div>
                            <div className="text-lg font-semibold">
                              {formatMetric(metrics.renderTime, 'ms')}
                            </div>
                          </div>
                          <Clock className={`w-6 h-6 ${metrics.renderTime > thresholds.renderTime ? 'text-red-500' : 'text-green-500'}`} />
                        </div>
                        <Progress 
                          value={Math.min((metrics.renderTime / (thresholds.renderTime * 2)) * 100, 100)} 
                          className="mt-2 h-1"
                        />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-muted-foreground">Memory Usage</div>
                            <div className="text-lg font-semibold">
                              {formatMetric(metrics.memoryUsage, 'MB')}
                            </div>
                          </div>
                          <Activity className={`w-6 h-6 ${metrics.memoryUsage > thresholds.memoryUsage ? 'text-red-500' : 'text-green-500'}`} />
                        </div>
                        <Progress 
                          value={Math.min((metrics.memoryUsage / (thresholds.memoryUsage * 2)) * 100, 100)} 
                          className="mt-2 h-1"
                        />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-muted-foreground">Network Requests</div>
                            <div className="text-lg font-semibold">
                              {metrics.networkRequests}
                            </div>
                          </div>
                          <Zap className="w-6 h-6 text-blue-500" />
                        </div>
                        <Progress 
                          value={Math.min((metrics.networkRequests / thresholds.networkRequests) * 100, 100)} 
                          className="mt-2 h-1"
                        />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-muted-foreground">Page Load</div>
                            <div className="text-lg font-semibold">
                              {formatMetric(metrics.pageLoadTime, 'ms')}
                            </div>
                          </div>
                          <TrendingUp className={`w-6 h-6 ${metrics.pageLoadTime > thresholds.pageLoadTime ? 'text-red-500' : 'text-green-500'}`} />
                        </div>
                        <Progress 
                          value={Math.min((metrics.pageLoadTime / (thresholds.pageLoadTime * 2)) * 100, 100)} 
                          className="mt-2 h-1"
                        />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-muted-foreground">Errors</div>
                            <div className="text-lg font-semibold">
                              {metrics.errorCount}
                            </div>
                          </div>
                          <AlertCircle className={`w-6 h-6 ${metrics.errorCount > 0 ? 'text-red-500' : 'text-green-500'}`} />
                        </div>
                        <Progress 
                          value={Math.min((metrics.errorCount / thresholds.errorCount) * 100, 100)} 
                          className="mt-2 h-1"
                        />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-muted-foreground">Interactions</div>
                            <div className="text-lg font-semibold">
                              {metrics.userInteractions}
                            </div>
                          </div>
                          <BarChart3 className="w-6 h-6 text-blue-500" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Alerts */}
                  {alerts.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Recent Alerts
                          </span>
                          <Button variant="outline" size="sm" onClick={clearAlerts}>
                            Clear All
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {alerts.slice(0, 5).map((alert, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                              {alert.type === 'error' ? (
                                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                              ) : (
                                <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                              )}
                              <div className="flex-1">
                                <div className="font-medium text-sm">{alert.message}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {format(alert.timestamp, 'HH:mm:ss')} • {alert.metric}
                                </div>
                              </div>
                              <Badge variant={alert.type === 'error' ? 'destructive' : 'secondary'}>
                                {alert.type}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Controls */}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                      <span className="text-sm text-muted-foreground">
                        {isMonitoring ? 'Monitoring Active' : 'Monitoring Stopped'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={isMonitoring ? stopMonitoring : startMonitoring}
                      >
                        {isMonitoring ? 'Stop' : 'Start'} Monitoring
                      </Button>
                      <Button variant="outline" size="sm" onClick={exportReport}>
                        <Download className="w-4 h-4 mr-2" />
                        Export Report
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-2xl font-bold ${getScoreColor(score).split(' ')[0]}`}>
                {grade}
              </div>
              <div className="text-xs text-muted-foreground">Score: {score}/100</div>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${getScoreColor(score)}`}>
              {score}
            </div>
          </div>

          {/* Mini Metrics */}
          <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Render:</span>
              <span className={metrics.renderTime > thresholds.renderTime ? 'text-red-600' : 'text-green-600'}>
                {formatMetric(metrics.renderTime, 'ms')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Memory:</span>
              <span className={metrics.memoryUsage > thresholds.memoryUsage ? 'text-red-600' : 'text-green-600'}>
                {formatMetric(metrics.memoryUsage, 'MB')}
              </span>
            </div>
          </div>

          {/* Recent Alerts Badge */}
          {recentAlerts.length > 0 && (
            <div className="mt-3">
              <Badge variant="destructive" className="text-xs">
                {recentAlerts.length} Alert{recentAlerts.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default PerformanceMonitor;