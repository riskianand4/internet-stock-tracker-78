import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ApiKeyManagement } from '@/components/admin/ApiKeyManagement';
import { ApiMonitoring } from '@/components/admin/ApiMonitoring';
import { ApiDocumentation } from '@/components/admin/ApiDocumentation';
import { Key, Activity, Book, Settings } from 'lucide-react';

export const ApiManagementPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">API Management</h1>
          <p className="text-muted-foreground">
            Comprehensive API key management, monitoring, and documentation
          </p>
        </div>

        <Tabs defaultValue="keys" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="keys" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Monitoring
            </TabsTrigger>
            <TabsTrigger value="documentation" className="flex items-center gap-2">
              <Book className="w-4 h-4" />
              Documentation
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="keys">
            <ApiKeyManagement />
          </TabsContent>

          <TabsContent value="monitoring">
            <ApiMonitoring />
          </TabsContent>

          <TabsContent value="documentation">
            <ApiDocumentation />
          </TabsContent>

          <TabsContent value="settings">
            <div className="text-center py-12 text-muted-foreground">
              <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>API Settings coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};