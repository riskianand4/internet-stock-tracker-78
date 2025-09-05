import React from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useRealTimeSync } from '@/hooks/useRealTimeSync';
import { useApi } from '@/contexts/ApiContext';
import { format } from 'date-fns';

const SyncStatusIndicator = () => {
  const { isConfigured, isOnline } = useApi();
  const { syncStatus, lastSyncTime, errorCount, manualSync, isRealTimeEnabled } = useRealTimeSync();

  const getStatusIcon = () => {
    if (!isConfigured) {
      return <WifiOff className="w-4 h-4 text-muted-foreground" />;
    }

    if (!isOnline) {
      return <WifiOff className="w-4 h-4 text-destructive" />;
    }

    switch (syncStatus) {
      case 'syncing':
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <RefreshCw className="w-4 h-4 text-primary" />
          </motion.div>
        );
      case 'success':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      default:
        return <Wifi className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    if (!isConfigured) {
      return 'API not configured';
    }

    if (!isOnline) {
      return 'Connection lost';
    }

    switch (syncStatus) {
      case 'syncing':
        return 'Syncing...';
      case 'success':
        return lastSyncTime 
          ? `Last sync: ${format(lastSyncTime, 'HH:mm:ss')}`
          : 'Connected';
      case 'error':
        return `Connection error${errorCount > 1 ? ` (${errorCount})` : ''}`;
      default:
        return 'Ready to sync';
    }
  };

  const getStatusColor = () => {
    if (!isConfigured || !isOnline) {
      return 'secondary';
    }

    switch (syncStatus) {
      case 'syncing':
        return 'default';
      case 'success':
        return 'success';
      case 'error':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={manualSync}
              disabled={syncStatus === 'syncing'}
              className="h-8 px-2 gap-1"
            >
              {getStatusIcon()}
              <span className="text-xs hidden sm:inline">
                {isRealTimeEnabled ? 'Live' : 'Local'}
              </span>
            </Button>
            
            {errorCount > 0 && (
              <Badge variant="destructive" className="h-5 px-1 text-xs">
                !
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-medium">{getStatusText()}</p>
            {isRealTimeEnabled ? (
              <p className="text-xs text-muted-foreground">
                Real-time sync enabled
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Using local data only
              </p>
            )}
            {syncStatus === 'error' && (
              <p className="text-xs text-destructive">
                Click to retry connection
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SyncStatusIndicator;