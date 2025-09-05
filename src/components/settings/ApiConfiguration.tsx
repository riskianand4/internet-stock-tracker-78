import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

const ApiConfiguration = () => {
  const { config, connectionStatus, setConfig, testConnection } = useApp();
  const isConfigured = config.apiEnabled;
  const isOnline = connectionStatus.isOnline;
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    baseURL: config.baseURL || '',
    enabled: config.apiEnabled || false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    setFormData({
      baseURL: config.baseURL || '',
      enabled: config.apiEnabled || false,
    });
  }, [config]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate URL format
      if (formData.enabled && formData.baseURL && !formData.baseURL.startsWith('http')) {
        throw new Error('Base URL must start with http:// or https://');
      }

      setConfig({
        apiEnabled: formData.enabled,
        baseURL: formData.baseURL,
      });
      
      if (formData.enabled) {
        toast({
          title: "API Configuration Saved",
          description: "Testing connection...",
        });
      } else {
        toast({
          title: "API Configuration Disabled",
          description: "Using local data only",
        });
      }
    } catch (error) {
      toast({
        title: "Configuration Error",
        description: error instanceof Error ? error.message : "Failed to save configuration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const success = await testConnection();
      toast({
        title: success ? "Connection Successful" : "Connection Failed",
        description: success 
          ? "API is responding correctly" 
          : "Failed to connect to API endpoint",
        variant: success ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Connection Test Failed",
        description: "Unable to test API connection",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusIcon = () => {
    if (!isConfigured) return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    if (isOnline) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusText = () => {
    if (!isConfigured) return "Not configured";
    if (isOnline) return "Connected";
    return "Offline";
  };

  const getStatusVariant = (): "default" | "secondary" | "destructive" | "outline" => {
    if (!isConfigured) return "secondary";
    if (isOnline) return "default";
    return "destructive";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>External API Configuration</CardTitle>
            <CardDescription>
              Connect to your external Node.js backend API for real-time data
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <Badge variant={getStatusVariant()}>
              {getStatusText()}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            When API is enabled, the application will fetch data from your external backend.
            When disabled, it will use local mock data for development.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="api-enabled"
              checked={formData.enabled}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, enabled: checked }))
              }
            />
            <Label htmlFor="api-enabled">Enable External API</Label>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="baseURL">Base URL</Label>
              <Input
                id="baseURL"
                type="url"
                placeholder="http://localhost:3001"
                value={formData.baseURL}
                onChange={(e) => 
                  setFormData(prev => ({ ...prev, baseURL: e.target.value }))
                }
                disabled={!formData.enabled}
              />
            </div>

          </div>

          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Configuration
            </Button>

            {isConfigured && formData.enabled && (
              <Button
                type="button"
                variant="outline"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="flex items-center gap-2"
              >
                {isTesting && <Loader2 className="h-4 w-4 animate-spin" />}
                Test Connection
              </Button>
            )}

            {isConfigured && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setConfig({ apiEnabled: false, baseURL: '' })}
              >
                Disable API
              </Button>
            )}
          </div>
        </form>

        {isConfigured && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Current Configuration</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Base URL: {config.baseURL}</p>
              <p>Status: {getStatusText()}</p>
              <p>Last Check: {connectionStatus.lastCheck?.toLocaleTimeString() || 'Never'}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApiConfiguration;