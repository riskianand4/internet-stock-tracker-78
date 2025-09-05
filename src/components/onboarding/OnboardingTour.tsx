import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, X, CheckCircle } from 'lucide-react';
import { User } from '@/types/auth';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ isOpen, onClose, user }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const getTourSteps = (role: string) => {
    const baseSteps = [
      {
        title: "Welcome to the System!",
        description: "Let's take a quick tour of the key features available to you.",
        content: "This tour will help you understand how to navigate and use the system effectively."
      }
    ];

    switch (role) {
      case 'user':
        return [
          ...baseSteps,
          {
            title: "View Products",
            description: "Browse and search through the product catalog",
            content: "Use the Products page to view available items, check stock levels, and search for specific products."
          },
          {
            title: "Check Analytics",
            description: "View inventory insights and trends",
            content: "The Analytics section shows you important metrics like stock levels, popular products, and trends."
          },
          {
            title: "Generate Reports",
            description: "Create detailed inventory reports",
            content: "Generate comprehensive reports for inventory analysis, stock movements, and more."
          },
          {
            title: "Stay Updated with Alerts",
            description: "Monitor important notifications",
            content: "Check the Alerts page for low stock warnings and other important system notifications."
          }
        ];
      case 'admin':
        return [
          ...baseSteps,
          {
            title: "Manage Inventory",
            description: "Add, edit, and organize products",
            content: "Use the Products page to add new items, update existing products, and manage your inventory."
          },
          {
            title: "Stock Management",
            description: "Track and adjust stock levels",
            content: "Monitor stock movements, make adjustments, and track inventory changes in real-time."
          },
          {
            title: "User Management",
            description: "Manage system users",
            content: "View and manage user accounts, assign roles, and monitor user activity."
          },
          {
            title: "System Analytics",
            description: "Advanced reporting and insights",
            content: "Access detailed analytics, performance metrics, and comprehensive system reports."
          },
          {
            title: "Alert Management",
            description: "Monitor and respond to system alerts",
            content: "Stay on top of critical alerts, stock warnings, and system notifications."
          }
        ];
      case 'super_admin':
        return [
          ...baseSteps,
          {
            title: "System Administration",
            description: "Full system control and oversight",
            content: "Manage all aspects of the system including users, settings, and security."
          },
          {
            title: "User & Role Management",
            description: "Control user access and permissions",
            content: "Create users, assign roles, and manage system-wide permissions and security."
          },
          {
            title: "System Settings",
            description: "Configure global system parameters",
            content: "Customize system behavior, security settings, and global configurations."
          },
          {
            title: "Security & Monitoring",
            description: "Monitor system security and performance",
            content: "Access security logs, monitor system health, and manage security protocols."
          },
          {
            title: "Advanced Analytics",
            description: "Comprehensive system insights",
            content: "View system-wide analytics, performance metrics, and detailed operational reports."
          }
        ];
      default:
        return baseSteps;
    }
  };

  const steps = getTourSteps(user.role);
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      onClose();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Getting Started</DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            Step {currentStep + 1} of {steps.length}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex mb-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-2 rounded-full mr-2 last:mr-0 ${
                  index <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {isLastStep && <CheckCircle className="h-5 w-5 text-green-600" />}
                    {steps[currentStep].title}
                  </CardTitle>
                  <CardDescription>
                    {steps[currentStep].description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {steps[currentStep].content}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={isFirstStep}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex gap-2">
            {!isLastStep && (
              <Button variant="ghost" onClick={handleSkip}>
                Skip Tour
              </Button>
            )}
            <Button onClick={handleNext} className="flex items-center gap-2">
              {isLastStep ? 'Get Started' : 'Next'}
              {!isLastStep && <ArrowRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingTour;