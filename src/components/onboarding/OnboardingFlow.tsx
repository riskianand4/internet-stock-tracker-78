import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Package, 
  BarChart3, 
  Settings, 
  Users, 
  Bell,
  Search,
  Filter,
  Plus,
  Download,
  TrendingUp,
  Shield,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  content: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline';
  };
}

interface OnboardingFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

const OnboardingFlow = ({ open, onOpenChange, onComplete }: OnboardingFlowProps) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Telnet Inventory',
      description: 'Your smart inventory management system',
      icon: Package,
      content: (
        <div className="space-y-4 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Package className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Hello {user?.name || 'there'}! 👋
            </h3>
            <p className="text-muted-foreground">
              Let's get you started with the most powerful inventory management system. 
              This quick tour will help you understand the key features and get you productive in minutes.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <BarChart3 className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-sm font-medium">Real-time Analytics</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <Shield className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-sm font-medium">Secure & Reliable</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'navigation',
      title: 'Navigation & Layout',
      description: 'Learn how to navigate around the system',
      icon: Search,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Search className="w-4 h-4" />
                Quick Search
              </h4>
              <p className="text-sm text-muted-foreground">
                Use <kbd className="px-2 py-1 text-xs bg-muted rounded border">⌘K</kbd> or 
                click the search bar to quickly find products, pages, or features.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notifications
              </h4>
              <p className="text-sm text-muted-foreground">
                Get real-time alerts for low stock, system updates, and important events.
              </p>
            </div>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <h5 className="font-medium mb-2">Pro Tip:</h5>
            <p className="text-sm text-muted-foreground">
              The sidebar can be collapsed for more screen space. All icons remain accessible for quick navigation.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'products',
      title: 'Product Management',
      description: 'Add, edit, and organize your inventory',
      icon: Package,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-semibold">Key Features:</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-green-500" />
                <span className="text-sm">Add new products with detailed information</span>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-500" />
                <span className="text-sm">Advanced filtering and search capabilities</span>
              </div>
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-purple-500" />
                <span className="text-sm">Bulk operations and data export</span>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
            <h5 className="font-medium mb-2 text-primary">Quick Start:</h5>
            <p className="text-sm">
              Click the "Add Product" button in the sidebar to create your first product, 
              or import your existing inventory using the bulk import feature.
            </p>
          </div>
        </div>
      ),
      action: {
        label: 'Add First Product',
        onClick: () => {
          // This would trigger the add product dialog
          console.log('Opening add product dialog');
        }
      }
    },
    {
      id: 'analytics',
      title: 'Analytics & Reports',
      description: 'Track performance and make data-driven decisions',
      icon: BarChart3,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                Real-time Insights
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Stock velocity analysis</li>
                <li>• Cost analysis and trends</li>
                <li>• Supplier performance</li>
                <li>• Demand prediction</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Download className="w-4 h-4 text-blue-500" />
                Export & Reports
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Custom report generation</li>
                <li>• Excel/CSV export</li>
                <li>• Scheduled reports</li>
                <li>• Visual dashboards</li>
              </ul>
            </div>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm">
              <strong>Visit the Analytics page</strong> to explore comprehensive reports 
              and insights about your inventory performance.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'settings',
      title: 'Settings & Configuration',
      description: 'Customize the system to match your workflow',
      icon: Settings,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-semibold">Essential Settings:</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <div className="font-medium">API Configuration</div>
                  <div className="text-sm text-muted-foreground">Connect to external systems</div>
                </div>
                <Badge variant="outline">Optional</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <div className="font-medium">User Management</div>
                  <div className="text-sm text-muted-foreground">Manage team access and roles</div>
                </div>
                <Badge variant="outline">Admin Only</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <div className="font-medium">Stock Alerts</div>
                  <div className="text-sm text-muted-foreground">Configure low stock thresholds</div>
                </div>
                <Badge variant="default">Recommended</Badge>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'complete',
      title: "You're All Set!",
      description: 'Start managing your inventory efficiently',
      icon: Check,
      content: (
        <div className="space-y-4 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Congratulations! 🎉
            </h3>
            <p className="text-muted-foreground">
              You're now ready to use Telnet Inventory System. Remember, you can always access 
              help and documentation from the help button in the top navigation.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
              <div className="font-medium text-primary">Need Help?</div>
              <div className="text-sm text-muted-foreground">Press ? for keyboard shortcuts</div>
            </div>
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
              <div className="font-medium text-primary">Pro Tips</div>
              <div className="text-sm text-muted-foreground">Check the help section for advanced features</div>
            </div>
          </div>
        </div>
      ),
      action: {
        label: 'Start Using System',
        onClick: onComplete,
      }
    }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps(prev => new Set(prev).add(currentStep));
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const skipOnboarding = () => {
    onComplete();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">Getting Started</DialogTitle>
              <DialogDescription>
                Step {currentStep + 1} of {steps.length}
              </DialogDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={skipOnboarding}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4 mr-1" />
              Skip
            </Button>
          </div>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Step Navigation */}
        <div className="flex items-center justify-center space-x-2 py-2 overflow-x-auto">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => goToStep(index)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                index === currentStep
                  ? 'bg-primary text-primary-foreground'
                  : completedSteps.has(index)
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
              disabled={index > currentStep && !completedSteps.has(index)}
            >
              {completedSteps.has(index) ? (
                <Check className="w-4 h-4" />
              ) : (
                <step.icon className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">{step.title}</span>
            </button>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <Card>
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      {React.createElement(steps[currentStep].icon, { className: "w-8 h-8 text-primary" })}
                    </div>
                    <h2 className="text-2xl font-bold mb-2">
                      {steps[currentStep].title}
                    </h2>
                    <p className="text-muted-foreground">
                      {steps[currentStep].description}
                    </p>
                  </div>
                  
                  {steps[currentStep].content}
                  
                  {steps[currentStep].action && (
                    <div className="mt-6 text-center">
                      <Button
                        onClick={steps[currentStep].action!.onClick}
                        variant={steps[currentStep].action!.variant || 'default'}
                      >
                        {steps[currentStep].action!.label}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

            <div className="text-sm text-muted-foreground self-center">
              {currentStep + 1} / {steps.length}
            </div>

          {currentStep === steps.length - 1 ? (
            <Button onClick={onComplete} className="gap-2">
              Get Started
              <Check className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={nextStep} className="gap-2">
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingFlow;