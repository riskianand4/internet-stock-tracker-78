import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ModernLoginPage from '@/components/auth/ModernLoginPage';
import MainLayout from '@/components/layout/MainLayout';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Users, 
  Database, 
  Shield, 
  Brain, 
  FileText, 
  TrendingUp,
  Package,
  ArrowUpDown,
  ClipboardList,
  BarChart2,
  Bell,
  Archive,
  BookOpen,
  Zap,
  ChevronRight,
  User
} from 'lucide-react';
import { Link } from 'react-router-dom';

const MorePage = () => {
  const { user } = useAuth();

  if (!user) {
    return <ModernLoginPage />;
  }

  // Temporarily show only essential features
  const menuSections = [
    {
      title: "Coming Soon",
      items: [
        {
          title: "More Features",
          description: "Fitur tambahan akan segera hadir",
          icon: Settings,
          path: "#",
          color: "muted",
          roles: ['user', 'admin', 'super_admin']
        }
      ]
    }
  ];

  // Filter menu items based on user role
  const filteredSections = menuSections.map(section => ({
    ...section,
    items: section.items.filter(item => 
      item.roles.includes(user.role)
    )
  })).filter(section => section.items.length > 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-muted/10 p-4 sm:p-6 pb-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto space-y-6"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <Settings className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-primary">
                  Menu Lainnya
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Akses fitur dan pengaturan lengkap
                </p>
              </div>
            </div>

            {/* User Info */}
            <Card className="p-4 glass max-w-md mx-auto">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                  <Badge variant="secondary" className="text-xs mt-1">
                    {user.role === 'super_admin' ? 'Super Admin' : 
                     user.role === 'admin' ? 'Admin' : 'User'}
                  </Badge>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Menu Sections */}
          {filteredSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              variants={itemVariants}
              className="space-y-4"
            >
              <h2 className="text-lg font-semibold text-foreground px-2">
                {section.title}
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {section.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  
                  return (
                    <motion.div
                      key={item.title}
                      variants={itemVariants}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link to={item.path} className="block">
                        <Card className="p-4 hover:shadow-md transition-all duration-200 glass group cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <Icon className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                                  {item.title}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </Card>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}

          {/* Footer Note */}
          <motion.div variants={itemVariants} className="text-center pt-4">
            <p className="text-xs text-muted-foreground">
              Menu yang ditampilkan disesuaikan dengan peran Anda
            </p>
          </motion.div>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default MorePage;