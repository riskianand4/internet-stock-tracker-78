export interface SystemSettings {
  id: string;
  category: 'general' | 'inventory' | 'notifications' | 'security' | 'integrations';
  key: string;
  value: any;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  isPublic: boolean;
  updatedAt: Date;
  updatedBy: string;
}

export interface NotificationSettings {
  id: string;
  userId: string;
  type: 'email' | 'push' | 'sms';
  category: 'stock_alerts' | 'order_updates' | 'system_notifications' | 'security_alerts';
  enabled: boolean;
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  threshold?: number;
}

export interface BackupSettings {
  id: string;
  name: string;
  type: 'full' | 'incremental';
  frequency: 'daily' | 'weekly' | 'monthly';
  retention: number;
  location: 'local' | 'cloud';
  enabled: boolean;
  lastBackup?: Date;
  nextBackup: Date;
}

export interface IntegrationSettings {
  id: string;
  name: string;
  type: 'api' | 'webhook' | 'database' | 'file';
  endpoint?: string;
  credentials: Record<string, any>;
  config: Record<string, any>;
  status: 'active' | 'inactive' | 'error';
  lastSync?: Date;
  enabled: boolean;
}