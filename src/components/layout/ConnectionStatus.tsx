import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useConnectionMonitor } from '@/hooks/useConnectionMonitor';
import { CheckCircle, XCircle, AlertTriangle, Wifi, WifiOff } from 'lucide-react';

interface ConnectionStatusProps {
  showDetails?: boolean;
  className?: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  showDetails = false, 
  className = '' 
}) => {
  const { connectionStatus, metrics } = useConnectionMonitor();

  const getStatusIcon = () => {
    if (!connectionStatus.isOnline) {
      return <WifiOff className="h-4 w-4" />;
    }
    if (metrics.isHealthy) {
      return <CheckCircle className="h-4 w-4" />;
    }
    return <AlertTriangle className="h-4 w-4" />;
  };

  const getStatusVariant = (): "default" | "secondary" | "destructive" | "outline" => {
    if (!connectionStatus.isOnline) return "destructive";
    if (metrics.isHealthy) return "default";
    return "secondary";
  };

  const getStatusText = () => {
    if (!connectionStatus.isOnline) return "Offline";
    if (metrics.isHealthy) return "Connected";
    return "Issues";
  };

  const getTooltipContent = () => {
    if (!connectionStatus.isOnline) {
      return `Offline - ${connectionStatus.error || 'No connection'}`;
    }
    
    const parts = [
      `Status: ${getStatusText()}`,
      metrics.latency ? `Latency: ${Math.round(metrics.latency)}ms` : '',
      `Failures: ${metrics.consecutiveFailures}`,
      connectionStatus.lastCheck ? `Last: ${connectionStatus.lastCheck.toLocaleTimeString()}` : ''
    ].filter(Boolean);
    
    return parts.join(' • ');
  };

  if (showDetails) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-1">
          {getStatusIcon()}
          <span className="text-sm font-medium">{getStatusText()}</span>
        </div>
        {connectionStatus.isOnline && metrics.latency && (
          <Badge variant="outline" className="text-xs">
            {Math.round(metrics.latency)}ms
          </Badge>
        )}
        {metrics.consecutiveFailures > 0 && (
          <Badge variant="destructive" className="text-xs">
            {metrics.consecutiveFailures} failures
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={`flex items-center ${className}`}>
          <Badge variant={getStatusVariant()} className="flex items-center gap-1">
            {getStatusIcon()}
            {getStatusText()}
          </Badge>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{getTooltipContent()}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default ConnectionStatus;