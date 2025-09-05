import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ModernLoginPage from '@/components/auth/ModernLoginPage';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AnomalyDetection from '@/components/ai/AnomalyDetection';
import SmartReorderEngine from '@/components/ai/SmartReorderEngine';
import VoiceCommands from '@/components/ai/VoiceCommands';
import AIBusinessIntelligence from '@/components/ai/AIBusinessIntelligence';
import { Brain, Bot, Mic, TrendingUp, Zap } from 'lucide-react';

const AIStudioPage = () => {
  const { user } = useAuth();

  if (!user) {
    return <ModernLoginPage />;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            AI Studio
          </h1>
          <p className="text-muted-foreground">
            Advanced AI-powered features untuk optimasi inventori dan business intelligence
          </p>
        </div>

        <Tabs defaultValue="intelligence" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="intelligence" className="gap-2">
              <Brain className="h-4 w-4" />
              Business Intelligence
            </TabsTrigger>
            <TabsTrigger value="anomaly" className="gap-2">
              <Zap className="h-4 w-4" />
              Anomaly Detection
            </TabsTrigger>
            <TabsTrigger value="reorder" className="gap-2">
              <Bot className="h-4 w-4" />
              Smart Reorder
            </TabsTrigger>
            <TabsTrigger value="voice" className="gap-2">
              <Mic className="h-4 w-4" />
              Voice Commands
            </TabsTrigger>
          </TabsList>

          <TabsContent value="intelligence" className="space-y-4">
            <AIBusinessIntelligence />
          </TabsContent>

          <TabsContent value="anomaly" className="space-y-4">
            <AnomalyDetection />
          </TabsContent>

          <TabsContent value="reorder" className="space-y-4">
            <SmartReorderEngine />
          </TabsContent>

          <TabsContent value="voice" className="space-y-4">
            <VoiceCommands />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default AIStudioPage;