import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, AlertCircle, X, Bell, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency, formatNumber } from '@/lib/formatters';
import { STOCK_ALERTS } from '@/data/constants';

const AlertsPanel = () => {
  const [alerts, setAlerts] = useState(STOCK_ALERTS);
  const [filterType, setFilterType] = useState<string>('all');
  const [isExpanded, setIsExpanded] = useState(true);

  const filteredAlerts = filterType === 'all' 
    ? alerts 
    : alerts.filter(alert => alert.type === filterType);

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return AlertTriangle;
      case 'warning': return AlertCircle;
      case 'info': return Info;
      default: return Info;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'destructive';
      case 'warning': return 'warning';
      case 'info': return 'accent';
      default: return 'secondary';
    }
  };

  const priorityCounts = {
    critical: alerts.filter(a => a.type === 'critical').length,
    warning: alerts.filter(a => a.type === 'warning').length,
    info: alerts.filter(a => a.type === 'info').length,
  };

  if (alerts.length === 0) {
    return (
      <Card className="glass border-success/20">
        <CardContent className="p-6 text-center">
          <Bell className="w-8 h-8 text-success mx-auto mb-2" />
          <p className="text-success font-medium">Tidak ada alert aktif</p>
          <p className="text-xs text-muted-foreground">Semua sistem berjalan normal</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-warning" />
              System Alerts
              {alerts.length > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {alerts.length}
                </Badge>
              )}
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="destructive" className="text-xs">
                {priorityCounts.critical} Critical
              </Badge>
              <Badge variant="outline" className="text-xs border-warning text-warning">
                {priorityCounts.warning} Warning
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {priorityCounts.info} Info
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Minimize' : 'Expand'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardContent className="space-y-3 max-h-64 overflow-y-auto">
              {filteredAlerts.map((alert, index) => {
                const IconComponent = getAlertIcon(alert.type);
                const alertColor = getAlertColor(alert.type);
                
                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-3 rounded-lg border border-${alertColor}/20 bg-${alertColor}/5 relative group`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-1.5 rounded-full bg-${alertColor}/10`}>
                        <IconComponent className={`w-4 h-4 text-${alertColor}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={alert.type === 'critical' ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              {alert.type.toUpperCase()}
                            </Badge>
                            {alert.actionRequired && (
                              <Badge variant="outline" className="text-xs">
                                Action Required
                              </Badge>
                            )}
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => dismissAlert(alert.id)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-foreground">
                            {alert.product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {alert.message}
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>SKU: {alert.product.sku}</span>
                            <span>
                              {new Date(alert.timestamp).toLocaleString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                                day: '2-digit',
                                month: 'short'
                              })}
                            </span>
                          </div>
                        </div>
                        
                        {alert.actionRequired && (
                          <div className="mt-2 pt-2 border-t border-border/50">
                            <Button size="sm" variant="outline" className="text-xs h-6">
                              Take Action
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              
              {filteredAlerts.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8 text-muted-foreground"
                >
                  <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No alerts found for the selected filter</p>
                </motion.div>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default AlertsPanel;