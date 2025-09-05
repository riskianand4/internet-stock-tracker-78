import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Mic, MicOff, Volume2, VolumeX, Settings, Zap, MessageSquare } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
interface VoiceCommand {
  id: string;
  command: string;
  description: string;
  example: string;
  category: 'search' | 'navigation' | 'actions' | 'reports';
  confidence?: number;
  lastUsed?: Date;
}
interface RecognitionResult {
  transcript: string;
  confidence: number;
  timestamp: Date;
  action?: string;
  parameters?: Record<string, any>;
}
const VoiceCommands = () => {
  const [isListening, setIsListening] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [recognitionResults, setRecognitionResults] = useState<RecognitionResult[]>([]);
  const [volume, setVolume] = useState(80);
  const [language, setLanguage] = useState('id-ID');
  const recognitionRef = useRef<any>(null);
  const voiceCommands: VoiceCommand[] = [
  // Search Commands
  {
    id: 'search-product',
    command: 'Cari produk [nama]',
    description: 'Mencari produk berdasarkan nama',
    example: 'Cari produk laptop Dell',
    category: 'search'
  }, {
    id: 'search-low-stock',
    command: 'Tampilkan stok menipis',
    description: 'Menampilkan produk dengan stok rendah',
    example: 'Tampilkan stok menipis',
    category: 'search'
  }, {
    id: 'search-category',
    command: 'Cari kategori [nama]',
    description: 'Mencari produk dalam kategori tertentu',
    example: 'Cari kategori elektronik',
    category: 'search'
  },
  // Navigation Commands
  {
    id: 'go-dashboard',
    command: 'Buka dashboard',
    description: 'Navigasi ke halaman dashboard',
    example: 'Buka dashboard',
    category: 'navigation'
  }, {
    id: 'go-products',
    command: 'Buka produk',
    description: 'Navigasi ke halaman produk',
    example: 'Buka produk',
    category: 'navigation'
  }, {
    id: 'go-analytics',
    command: 'Buka analytics',
    description: 'Navigasi ke halaman analytics',
    example: 'Buka analytics',
    category: 'navigation'
  },
  // Action Commands
  {
    id: 'add-product',
    command: 'Tambah produk baru',
    description: 'Membuka form tambah produk',
    example: 'Tambah produk baru',
    category: 'actions'
  }, {
    id: 'update-stock',
    command: 'Update stok [produk] [jumlah]',
    description: 'Mengupdate stok produk',
    example: 'Update stok laptop Dell 50',
    category: 'actions'
  }, {
    id: 'create-alert',
    command: 'Buat alert untuk [produk]',
    description: 'Membuat alert untuk produk tertentu',
    example: 'Buat alert untuk mouse wireless',
    category: 'actions'
  },
  // Report Commands
  {
    id: 'generate-report',
    command: 'Buat laporan [tipe]',
    description: 'Generate laporan otomatis',
    example: 'Buat laporan penjualan',
    category: 'reports'
  }, {
    id: 'export-data',
    command: 'Export data [format]',
    description: 'Export data dalam format tertentu',
    example: 'Export data Excel',
    category: 'reports'
  }];

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;
      recognition.maxAlternatives = 3;
      recognition.onstart = () => {
        setIsListening(true);
        toast({
          title: "Voice Recognition Started",
          description: "Listening for voice commands..."
        });
      };
      recognition.onend = () => {
        setIsListening(false);
      };
      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            processVoiceCommand(transcript, confidence);
          } else {
            interimTranscript += transcript;
          }
        }
        setCurrentTranscript(interimTranscript || finalTranscript);
      };
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Voice Recognition Error",
          description: `Error: ${event.error}`,
          variant: "destructive"
        });
      };
    } else {
      toast({
        title: "Voice Recognition Not Supported",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive"
      });
    }
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language]);
  const processVoiceCommand = (transcript: string, confidence: number) => {
    const result: RecognitionResult = {
      transcript: transcript.trim(),
      confidence,
      timestamp: new Date()
    };

    // AI-powered command matching
    const normalizedTranscript = transcript.toLowerCase().trim();

    // Search commands
    if (normalizedTranscript.includes('cari') || normalizedTranscript.includes('search')) {
      if (normalizedTranscript.includes('stok menipis') || normalizedTranscript.includes('low stock')) {
        result.action = 'search-low-stock';
        executeCommand('search-low-stock');
      } else {
        const productMatch = normalizedTranscript.match(/cari (?:produk )?(.+)/);
        if (productMatch) {
          result.action = 'search-product';
          result.parameters = {
            productName: productMatch[1]
          };
          executeCommand('search-product', {
            productName: productMatch[1]
          });
        }
      }
    }

    // Navigation commands
    else if (normalizedTranscript.includes('buka') || normalizedTranscript.includes('go to')) {
      if (normalizedTranscript.includes('dashboard')) {
        result.action = 'go-dashboard';
        executeCommand('go-dashboard');
      } else if (normalizedTranscript.includes('produk') || normalizedTranscript.includes('product')) {
        result.action = 'go-products';
        executeCommand('go-products');
      } else if (normalizedTranscript.includes('analytics') || normalizedTranscript.includes('analitik')) {
        result.action = 'go-analytics';
        executeCommand('go-analytics');
      }
    }

    // Action commands
    else if (normalizedTranscript.includes('tambah') || normalizedTranscript.includes('add')) {
      if (normalizedTranscript.includes('produk')) {
        result.action = 'add-product';
        executeCommand('add-product');
      }
    }

    // Update stock commands
    else if (normalizedTranscript.includes('update stok')) {
      const stockMatch = normalizedTranscript.match(/update stok (.+?) (\d+)/);
      if (stockMatch) {
        result.action = 'update-stock';
        result.parameters = {
          productName: stockMatch[1],
          quantity: parseInt(stockMatch[2])
        };
        executeCommand('update-stock', result.parameters);
      }
    }

    // Report commands
    else if (normalizedTranscript.includes('buat laporan') || normalizedTranscript.includes('generate report')) {
      result.action = 'generate-report';
      executeCommand('generate-report');
    }
    setRecognitionResults(prev => [result, ...prev.slice(0, 9)]);
  };
  const executeCommand = (action: string, parameters?: Record<string, any>) => {
    // Simulate command execution
    const command = voiceCommands.find(cmd => cmd.id === action);
    if (command) {
      toast({
        title: "Voice Command Executed",
        description: `Executing: ${command.description}${parameters ? ` with ${JSON.stringify(parameters)}` : ''}`
      });

      // Here you would integrate with your actual application logic
      // For example: navigate to pages, trigger search, etc.

      // Update command usage
      command.lastUsed = new Date();
    }
  };
  const startListening = () => {
    if (recognitionRef.current && isEnabled) {
      setCurrentTranscript('');
      recognitionRef.current.start();
    } else {
      toast({
        title: "Voice Commands Disabled",
        description: "Please enable voice commands first.",
        variant: "destructive"
      });
    }
  };
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };
  const toggleVoiceCommands = () => {
    setIsEnabled(!isEnabled);
    if (isListening) {
      stopListening();
    }
    toast({
      title: isEnabled ? "Voice Commands Disabled" : "Voice Commands Enabled",
      description: isEnabled ? "Voice commands have been disabled." : "Voice commands are now active. Click the microphone to start."
    });
  };
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'search':
        return '🔍';
      case 'navigation':
        return '🧭';
      case 'actions':
        return '⚡';
      case 'reports':
        return '📊';
      default:
        return '🎙️';
    }
  };
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'search':
        return 'bg-blue-100 text-blue-800';
      case 'navigation':
        return 'bg-green-100 text-green-800';
      case 'actions':
        return 'bg-orange-100 text-orange-800';
      case 'reports':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  return <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex items-center justify-end">
        
        
        <div className="flex items-center gap-2">
          <Button variant={isEnabled ? "default" : "outline"} onClick={toggleVoiceCommands} className="gap-2">
            {isEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            {isEnabled ? 'Voice ON' : 'Voice OFF'}
          </Button>
        </div>
      </div>

      {/* Voice Control Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Voice Control Interface</span>
            <Badge variant={isListening ? "default" : "secondary"}>
              {isListening ? 'Listening...' : 'Ready'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Microphone Control */}
          <div className="flex items-center justify-center">
            <motion.div whileHover={{
            scale: 1.05
          }} whileTap={{
            scale: 0.95
          }}>
              <Button size="lg" variant={isListening ? "destructive" : "default"} onClick={isListening ? stopListening : startListening} disabled={!isEnabled} className="h-20 w-20 rounded-full">
                {isListening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
              </Button>
            </motion.div>
          </div>

          {/* Current Transcript */}
          <AnimatePresence>
            {currentTranscript && <motion.div initial={{
            opacity: 0,
            y: 10
          }} animate={{
            opacity: 1,
            y: 0
          }} exit={{
            opacity: 0,
            y: -10
          }} className="text-center">
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Listening:</p>
                  <p className="font-medium">{currentTranscript}</p>
                </div>
              </motion.div>}
          </AnimatePresence>

          {/* Volume Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Microphone Sensitivity</span>
              <span>{volume}%</span>
            </div>
            <Progress value={volume} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Available Commands */}
      <Card>
        <CardHeader>
          <CardTitle>Available Voice Commands</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {Object.entries(voiceCommands.reduce((acc, cmd) => {
            if (!acc[cmd.category]) acc[cmd.category] = [];
            acc[cmd.category].push(cmd);
            return acc;
          }, {} as Record<string, VoiceCommand[]>)).map(([category, commands]) => <div key={category} className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <span className="text-lg">{getCategoryIcon(category)}</span>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </h3>
                <div className="grid gap-2">
                  {commands.map(command => <div key={command.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {command.command}
                          </code>
                          <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(command.category)}`}>
                            {command.category}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {command.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Example: "{command.example}"
                        </p>
                      </div>
                      
                      {command.lastUsed && <div className="text-xs text-muted-foreground">
                          Last used: {command.lastUsed.toLocaleDateString('id-ID')}
                        </div>}
                    </div>)}
                </div>
              </div>)}
          </div>
        </CardContent>
      </Card>

      {/* Recent Recognition Results */}
      {recognitionResults.length > 0 && <Card>
          <CardHeader>
            <CardTitle>Recent Voice Commands</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recognitionResults.map((result, index) => <motion.div key={index} initial={{
            opacity: 0,
            x: -20
          }} animate={{
            opacity: 1,
            x: 0
          }} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">"{result.transcript}"</p>
                    {result.action && <p className="text-sm text-primary">
                        Action: {result.action}
                        {result.parameters && ` (${JSON.stringify(result.parameters)})`}
                      </p>}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline">
                      {Math.round(result.confidence * 100)}% confidence
                    </Badge>
                    <span>{result.timestamp.toLocaleTimeString('id-ID')}</span>
                  </div>
                </motion.div>)}
            </div>
          </CardContent>
        </Card>}
    </div>;
};
export default VoiceCommands;