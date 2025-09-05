import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  Server, 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  ExternalLink,
  Wifi,
  Database
} from 'lucide-react';
import { useApi } from '@/contexts/ApiContext';
import { motion } from 'framer-motion';

interface ApiSetupGuideProps {
  onNavigateToSettings?: () => void;
}

const ApiSetupGuide = ({ onNavigateToSettings }: ApiSetupGuideProps) => {
  const { isConfigured, isOnline, config } = useApi();

  const setupSteps = [
    {
      id: 1,
      title: 'Start Your Backend Server',
      description: 'Make sure your Node.js backend is running at http://localhost:3001',
      status: isOnline ? 'completed' : 'pending',
      icon: <Server className="w-5 h-5" />,
      command: 'npm start' // or however they start their backend
    },
    {
      id: 2,
      title: 'Configure API Connection',
      description: 'Set up the API connection in Settings > API tab',
      status: isConfigured ? 'completed' : 'pending',
      icon: <Settings className="w-5 h-5" />,
      action: 'Configure Now'
    },
    {
      id: 3,
      title: 'Test Connection',
      description: 'Verify that frontend can communicate with backend',
      status: isConfigured && isOnline ? 'completed' : 'pending',
      icon: <Wifi className="w-5 h-5" />
    },
    {
      id: 4,
      title: 'Start Using Live Data',
      description: 'All CRUD operations will now work with your database',
      status: isConfigured && isOnline ? 'completed' : 'pending',
      icon: <Database className="w-5 h-5" />
    }
  ];

  const getStepStatus = (status: string) => {
    switch (status) {
      case 'completed':
        return { icon: <CheckCircle className="w-4 h-4 text-success" />, color: 'text-success' };
      default:
        return { icon: <XCircle className="w-4 h-4 text-muted-foreground" />, color: 'text-muted-foreground' };
    }
  };

  const allStepsCompleted = setupSteps.every(step => step.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold mb-2">Connect to Your Backend API</h2>
        <p className="text-muted-foreground">
          Follow these steps to connect your frontend to your backend running at localhost:3001
        </p>
      </motion.div>

      {/* Current Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Alert className={allStepsCompleted ? 'border-success bg-success/10' : 'border-warning bg-warning/10'}>
          <div className="flex items-center gap-2">
            {allStepsCompleted ? (
              <CheckCircle className="w-4 h-4 text-success" />
            ) : (
              <Settings className="w-4 h-4 text-warning" />
            )}
            <AlertDescription>
              {allStepsCompleted 
                ? 'Great! Your frontend is now connected to your backend API. All operations will use live data.'
                : 'Setup required: Your frontend is currently using mock data. Complete the steps below to connect to your backend.'
              }
            </AlertDescription>
          </div>
        </Alert>
      </motion.div>

      {/* Setup Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {setupSteps.map((step, index) => {
          const stepStatus = getStepStatus(step.status);
          return (
            <Card key={step.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                      step.status === 'completed' 
                        ? 'bg-success border-success text-white' 
                        : 'border-muted-foreground text-muted-foreground'
                    }`}>
                      {step.status === 'completed' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <span className="text-sm font-medium">{step.id}</span>
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-base">{step.title}</CardTitle>
                      <CardDescription>{step.description}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={step.status === 'completed' ? 'default' : 'secondary'}>
                    {step.status === 'completed' ? 'Complete' : 'Pending'}
                  </Badge>
                </div>
              </CardHeader>
              {(step.command || step.action) && (
                <CardContent className="pt-0">
                  {step.command && (
                    <div className="bg-muted p-2 rounded font-mono text-sm">
                      {step.command}
                    </div>
                  )}
                  {step.action && step.status !== 'completed' && (
                    <Button 
                      onClick={onNavigateToSettings}
                      className="gap-2"
                    >
                      {step.action}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}
                </CardContent>
              )}
              {/* Connector line */}
              {index < setupSteps.length - 1 && (
                <div className="absolute left-7 top-16 w-0.5 h-8 bg-border" />
              )}
            </Card>
          );
        })}
      </motion.div>

      {/* Configuration Details */}
      {isConfigured && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Current Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Base URL:</span>
                <span className="text-sm font-medium">{config?.baseURL}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">API Key:</span>
                <span className="text-sm font-medium">
                  {"*".repeat(config?.baseURL?.length || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge variant={isOnline ? 'default' : 'destructive'}>
                  {isOnline ? 'Connected' : 'Offline'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Help Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>
              Common troubleshooting steps for API connection issues
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <p className="font-medium mb-2">If you're having connection issues:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Make sure your backend server is running on port 3001</li>
                <li>• Check that CORS is configured to allow localhost:5173</li>
                <li>• Verify your API key is correct (if required)</li>
                <li>• Check the browser console for error messages</li>
              </ul>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <ExternalLink className="w-4 h-4" />
              View Documentation
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ApiSetupGuide;