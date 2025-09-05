export interface SystemSetting {
  id: string;
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  category: string;
  description: string;
  updatedAt: Date;
}

export interface BackupSetting {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'differential';
  frequency: 'daily' | 'weekly' | 'monthly';
  location: 'local' | 'cloud' | 's3' | 'ftp';
  enabled: boolean;
  lastBackup?: Date;
  nextBackup: Date;
}

export interface IntegrationSetting {
  id: string;
  name: string;
  type: 'api' | 'webhook' | 'database' | 'file';
  status: 'active' | 'inactive' | 'error';
  enabled: boolean;
  endpoint?: string;
  lastSync?: Date;
  config: Record<string, any>;
}

export const mockSystemSettings: SystemSetting[] = [
  {
    id: '1',
    key: 'app.name',
    value: 'Inventory Management System',
    type: 'string',
    category: 'general',
    description: 'Nama aplikasi yang ditampilkan',
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    key: 'app.timezone',
    value: 'Asia/Jakarta',
    type: 'string',
    category: 'general',
    description: 'Timezone default aplikasi',
    updatedAt: new Date('2024-01-10')
  },
  {
    id: '3',
    key: 'inventory.auto_reorder',
    value: true,
    type: 'boolean',
    category: 'inventory',
    description: 'Otomatis membuat order ketika stok minimum tercapai',
    updatedAt: new Date('2024-01-20')
  },
  {
    id: '4',
    key: 'notifications.email_alerts',
    value: true,
    type: 'boolean',
    category: 'notifications',
    description: 'Kirim notifikasi email untuk alert penting',
    updatedAt: new Date('2024-01-18')
  },
  {
    id: '5',
    key: 'security.session_timeout',
    value: 8,
    type: 'number',
    category: 'security',
    description: 'Timeout sesi dalam jam',
    updatedAt: new Date('2024-01-12')
  }
];

export const mockBackupSettings: BackupSetting[] = [
  {
    id: '1',
    name: 'Database Daily Backup',
    type: 'full',
    frequency: 'daily',
    location: 'cloud',
    enabled: true,
    lastBackup: new Date('2024-01-20T02:00:00'),
    nextBackup: new Date('2024-01-21T02:00:00')
  },
  {
    id: '2',
    name: 'Files Weekly Backup',
    type: 'incremental',
    frequency: 'weekly',
    location: 'local',
    enabled: true,
    lastBackup: new Date('2024-01-15T03:00:00'),
    nextBackup: new Date('2024-01-22T03:00:00')
  },
  {
    id: '3',
    name: 'System Configuration Backup',
    type: 'full',
    frequency: 'monthly',
    location: 's3',
    enabled: false,
    nextBackup: new Date('2024-02-01T01:00:00')
  }
];

export const mockIntegrationSettings: IntegrationSetting[] = [
  {
    id: '1',
    name: 'ERP System Integration',
    type: 'api',
    status: 'active',
    enabled: true,
    endpoint: 'https://erp.company.com/api/v1',
    lastSync: new Date('2024-01-20T10:30:00'),
    config: {
      apiKey: '***hidden***',
      syncInterval: 300000,
      entities: ['products', 'orders', 'customers']
    }
  },
  {
    id: '2',
    name: 'Warehouse Management System',
    type: 'webhook',
    status: 'inactive',
    enabled: false,
    endpoint: 'https://wms.company.com/webhook',
    config: {
      events: ['stock_movement', 'order_fulfillment'],
      retryAttempts: 3
    }
  },
  {
    id: '3',
    name: 'Financial System',
    type: 'database',
    status: 'error',
    enabled: true,
    lastSync: new Date('2024-01-19T15:45:00'),
    config: {
      host: 'db.finance.company.com',
      database: 'finance_prod',
      syncTables: ['transactions', 'invoices']
    }
  }
];