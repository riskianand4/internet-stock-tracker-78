import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

import { Loader2, Wifi, Eye, EyeOff, Shield, Lock, User, Mail, CheckCircle2, ArrowRight } from 'lucide-react';
const ModernLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);
  const {
    login,
    isLoading
  } = useAuth();
  const demoCredentials = [{
    role: 'staff',
    email: 'staff@inventory.com',
    password: 'staff123',
    name: 'Staff Demo',
    description: 'Akses read-only untuk melihat data',
    color: 'bg-success',
    permissions: ['Lihat Dashboard', 'Lihat Produk', 'Lihat Statistik']
  }, {
    role: 'admin',
    email: 'admin@inventory.com',
    password: 'admin123',
    name: 'Admin Demo',
    description: 'Kelola stok dan input data',
    color: 'bg-warning',
    permissions: ['Semua akses User', 'Input/Edit Produk', 'Kelola Inventori']
  }, {
    role: 'superadmin',
    email: 'superadmin@inventory.com',
    password: 'admin123',
    name: 'Super Admin Demo',
    description: 'Akses penuh sistem',
    color: 'bg-destructive',
    permissions: ['Semua akses Admin', 'Kelola User', 'Kelola Kategori', 'System Settings']
  }];
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      return;
    }
    await login(email, password);
  };
  const handleDemoLogin = (demo: typeof demoCredentials[0]) => {
    setEmail(demo.email);
    setPassword(demo.password);
    setSelectedDemo(demo.role);
  };
  return <div className="min-h-screen bg-muted/10 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div className="absolute -top-32 -left-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl" animate={{
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.5, 0.3]
      }} transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }} />
        <motion.div className="absolute -bottom-32 -right-32 w-64 h-64 bg-accent/10 rounded-full blur-3xl" animate={{
        scale: [1.2, 1, 1.2],
        opacity: [0.5, 0.3, 0.5]
      }} transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 4
      }} />
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        {/* Left Side - Branding */}
        <motion.div className="hidden lg:flex flex-col justify-center space-y-8 p-8" initial={{
        opacity: 0,
        x: -50
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        duration: 0.6
      }}>
          <div className="text-center lg:text-left">
            <motion.div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-2xl shadow-glow mb-6" initial={{
            scale: 0,
            rotate: -180
          }} animate={{
            scale: 1,
            rotate: 0
          }} transition={{
            duration: 0.8,
            type: "spring",
            stiffness: 200
          }}>
              <Wifi className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4" initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6,
            delay: 0.2
          }}>
              Telnet
              <span className="block text-primary">Inventory</span>
            </motion.h1>
            
            <motion.p className="text-lg text-muted-foreground mb-8" initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6,
            delay: 0.3
          }}>
              Sistem Manajemen Stok Barang Modern dengan Teknologi Terdepan
            </motion.p>
          </div>

          {/* Features */}
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-4" initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          delay: 0.4
        }}>
            {[{
            icon: Shield,
            title: "Keamanan Tinggi",
            desc: "Data terproteksi dengan enkripsi"
          }, {
            icon: CheckCircle2,
            title: "Real-time Updates",
            desc: "Sinkronisasi data secara langsung"
          }, {
            icon: Lock,
            title: "Role-based Access",
            desc: "Kontrol akses berdasarkan peran"
          }, {
            icon: Mail,
            title: "Smart Analytics",
            desc: "Analisis data yang mendalam"
          }].map((feature, index) => <motion.div key={feature.title} className="flex items-center space-x-3 p-4 rounded-lg bg-card/50 border border-border/50" initial={{
            opacity: 0,
            x: -20
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            duration: 0.4,
            delay: 0.5 + index * 0.1
          }}>
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                  <feature.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">{feature.title}</p>
                  <p className="text-xs text-muted-foreground">{feature.desc}</p>
                </div>
              </motion.div>)}
          </motion.div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div initial={{
        opacity: 0,
        x: 50
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        duration: 0.6,
        delay: 0.2
      }} className="flex flex-col justify-center mx-0">
          <Card className="glass shadow-strong border-border/50 px-0 mx-[6px]">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold text-foreground">Masuk ke Sistem</CardTitle>
              <CardDescription>
                Gunakan kredensial Anda untuk mengakses dashboard
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                 <motion.div className="space-y-2" initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                duration: 0.4,
                delay: 0.3
              }}>
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Masukkan email" disabled={isLoading} className="pl-10 bg-background/50 border-border/50 focus:border-primary" />
                  </div>
                </motion.div>

                <motion.div className="space-y-2" initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                duration: 0.4,
                delay: 0.4
              }}>
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Masukkan password" disabled={isLoading} className="pl-10 pr-10 bg-background/50 border-border/50 focus:border-primary" />
                    <Button type="button" variant="ghost" size="sm" className="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 p-0" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </motion.div>

                <motion.div initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                duration: 0.4,
                delay: 0.5
              }}>
                  <Button type="submit" className="w-full bg-primary hover:shadow-glow" disabled={isLoading}>
                    {isLoading ? <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Memproses...
                      </> : <>
                        Masuk
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>}
                  </Button>
                </motion.div>
              </form>

              {/* Demo Credentials */}
              <motion.div className="space-y-4" initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.4,
              delay: 0.6
            }}>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/50" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-card px-2 text-muted-foreground">
                      Demo Credentials
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  {demoCredentials.map((demo, index) => <motion.button key={demo.role} type="button" onClick={() => handleDemoLogin(demo)} className={`w-full p-3 rounded-lg border border-border/50 transition-all duration-200 text-left hover:bg-muted/50 ${selectedDemo === demo.role ? 'bg-primary/10 border-primary/50' : ''}`} initial={{
                  opacity: 0,
                  x: -20
                }} animate={{
                  opacity: 1,
                  x: 0
                }} transition={{
                  duration: 0.4,
                  delay: 0.7 + index * 0.1
                }} whileHover={{
                  scale: 1.02
                }} whileTap={{
                  scale: 0.98
                }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge className={`${demo.color} text-white text-xs`}>
                            {demo.name}
                          </Badge>
                          <div>
                            <span className="text-xs text-muted-foreground font-mono">
                              {demo.email} / {demo.password}
                            </span>
                            <p className="text-xs text-muted-foreground">{demo.description}</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </motion.button>)}
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>;
};
export default ModernLoginPage;