import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, X, Minimize2, Maximize2, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/contexts/ApiContext';
import { toast } from '@/hooks/use-toast';
interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  suggestions?: string[];
}
interface AIAssistantProps {
  className?: string;
}
const AIAssistant: React.FC<AIAssistantProps> = ({
  className = ""
}) => {
  const { user } = useAuth();
  const { apiService, isConfigured, isOnline } = useApi();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    text: `Halo! Saya adalah asisten AI untuk sistem inventori. ${isConfigured && isOnline ? 'Terhubung dengan database real-time' : 'Mode offline - data lokal'}. Anda bisa bertanya tentang stok barang, laporan, atau fitur sistem lainnya. Bagaimana saya bisa membantu?`,
    isUser: false,
    timestamp: new Date(),
    suggestions: isConfigured && isOnline 
      ? ['Berapa sisa stok router WiFi?', 'Tampilkan produk yang stoknya menipis', 'Buatkan laporan penjualan bulan ini', 'Apa saja fitur yang tersedia untuk role saya?']
      : ['Setup koneksi API', 'Lihat data offline', 'Panduan koneksi backend', 'Fitur yang tersedia']
  }]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const getAIResponse = async (userMessage: string): Promise<{
    text: string;
    suggestions?: string[];
  }> => {
    try {
      // Use real API if available, otherwise fallback to mock responses
      if (isConfigured && isOnline && apiService) {
        const response = await apiService.request('/api/ai/chat', {
          method: 'POST',
          body: JSON.stringify({
            message: userMessage,
            context: { userRole: user?.role }
          })
        });

        if (response.success) {
          return {
            text: response.data.response,
            suggestions: response.data.suggestions
          };
        }
      }

      // Fallback to mock responses if API not available
      const lowerMessage = userMessage.toLowerCase();

      if (lowerMessage.includes('stok') || lowerMessage.includes('stock')) {
        return {
          text: 'Berdasarkan data lokal, sistem menampilkan informasi stok tersimpan. Untuk data real-time, hubungkan ke backend API.',
          suggestions: ['Konfigurasi API Backend', 'Lihat data lokal', 'Help koneksi']
        };
      }
      
      if (lowerMessage.includes('laporan') || lowerMessage.includes('report')) {
        return {
          text: 'Fitur laporan tersedia dengan data lokal. Hubungkan ke backend untuk laporan real-time dan analisis mendalam.',
          suggestions: ['Setup API Connection', 'Laporan data lokal', 'Panduan koneksi']
        };
      }

      // Default offline response
      return {
        text: 'Mode offline aktif. Saya dapat membantu dengan data lokal dan panduan fitur. Untuk pengalaman terbaik dengan data real-time, hubungkan ke backend API.',
        suggestions: ['Cara koneksi API', 'Fitur offline', 'Panduan setup']
      };

    } catch (error) {
      console.error('AI Response Error:', error);
      return {
        text: 'Terjadi kesalahan saat memproses permintaan. Menggunakan mode offline.',
        suggestions: ['Coba lagi', 'Mode offline', 'Bantuan teknis']
      };
    }
  };
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    try {
      const response = await getAIResponse(inputValue);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        isUser: false,
        timestamp: new Date(),
        suggestions: response.suggestions
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memproses pesan",
        variant: "destructive"
      });
    } finally {
      setIsTyping(false);
    }
  };
  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  const toggleVoiceInput = () => {
    if (isListening) {
      setIsListening(false);
      toast({
        description: 'Voice input stopped'
      });
    } else {
      setIsListening(true);
      toast({
        description: 'Voice input started - speak now'
      });
      // Here you would integrate with Web Speech API
      setTimeout(() => {
        setIsListening(false);
        toast({
          description: 'Voice input processed'
        });
      }, 3000);
    }
  };
  if (!isOpen) {
    return <motion.div className={`fixed bottom-6 right-6 z-50 ${className}`} initial={{
      scale: 0
    }} animate={{
      scale: 1
    }} transition={{
      type: "spring",
      stiffness: 260,
      damping: 20
    }}>
        <Button onClick={() => setIsOpen(true)} size="lg" className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/80 my-[73px]">
          <MessageCircle className="h-6 w-6" />
        </Button>
      </motion.div>;
  }
  return <motion.div className={`fixed bottom-6 right-6 z-50 ${className}`} initial={{
    scale: 0,
    opacity: 0
  }} animate={{
    scale: 1,
    opacity: 1
  }} transition={{
    type: "spring",
    stiffness: 260,
    damping: 20
  }}>
      <Card className={`w-96 shadow-xl border-2 ${isMinimized ? 'h-16' : 'h-[500px]'} transition-all duration-300`}>
        <CardHeader className="p-4 border-b bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <CardTitle className="text-lg">AI Assistant</CardTitle>
              <Badge variant="secondary" className="text-xs">
                {user?.role === 'super_admin' ? 'Super Admin' : user?.role === 'admin' ? 'Admin' : 'User'}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => setIsMinimized(!isMinimized)}>
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <AnimatePresence>
          {!isMinimized && <motion.div initial={{
          height: 0,
          opacity: 0
        }} animate={{
          height: 'auto',
          opacity: 1
        }} exit={{
          height: 0,
          opacity: 0
        }} transition={{
          duration: 0.3
        }}>
              <CardContent className="p-0 flex flex-col h-[436px]">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map(message => <motion.div key={message.id} initial={{
                  opacity: 0,
                  y: 10
                }} animate={{
                  opacity: 1,
                  y: 0
                }} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-lg ${message.isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                          <p className="text-sm">{message.text}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                          </p>
                          
                          {message.suggestions && <div className="mt-2 space-y-1">
                              {message.suggestions.map((suggestion, index) => <Button key={index} variant="outline" size="sm" className="text-xs h-6 mr-1 mb-1" onClick={() => handleSuggestionClick(suggestion)}>
                                  {suggestion}
                                </Button>)}
                            </div>}
                        </div>
                      </motion.div>)}
                    
                    {isTyping && <motion.div initial={{
                  opacity: 0,
                  y: 10
                }} animate={{
                  opacity: 1,
                  y: 0
                }} className="flex justify-start">
                        <div className="bg-muted p-3 rounded-lg">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{
                        animationDelay: '0.1s'
                      }}></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{
                        animationDelay: '0.2s'
                      }}></div>
                          </div>
                        </div>
                      </motion.div>}
                  </div>
                  <div ref={messagesEndRef} />
                </ScrollArea>

                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input ref={inputRef} placeholder="Tanyakan tentang stok, laporan, atau fitur..." value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyPress={handleKeyPress} className="flex-1" />
                    <Button variant="outline" size="sm" onClick={toggleVoiceInput} className={isListening ? 'bg-red-100 hover:bg-red-200' : ''}>
                      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                    <Button onClick={handleSendMessage} size="sm" disabled={!inputValue.trim() || isTyping}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </motion.div>}
        </AnimatePresence>
      </Card>
    </motion.div>;
};
export default AIAssistant;