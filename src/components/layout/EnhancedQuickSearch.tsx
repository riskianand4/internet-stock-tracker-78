import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Command, ArrowRight, Clock, Star, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchResult {
  title: string;
  description: string;
  href: string;
  category: string;
  keywords: string[];
  priority: number;
  icon?: React.ReactNode;
}

interface EnhancedQuickSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const EnhancedQuickSearch: React.FC<EnhancedQuickSearchProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const { user } = useAuth();
  
  const debouncedQuery = useDebounce(query, 150);

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const getSearchableItems = (): SearchResult[] => {
    const baseItems: SearchResult[] = [
      { 
        title: 'Products', 
        description: 'View and search product catalog', 
        href: '/products', 
        category: 'Navigation',
        keywords: ['produk', 'barang', 'item', 'catalog', 'daftar'],
        priority: 10,
        icon: <TrendingUp className="h-4 w-4" />
      },
      { 
        title: 'Analytics', 
        description: 'View statistics and insights', 
        href: '/stats', 
        category: 'Navigation',
        keywords: ['statistik', 'analisis', 'insight', 'data', 'chart', 'grafik'],
        priority: 8,
        icon: <TrendingUp className="h-4 w-4" />
      },
      { 
        title: 'Reports', 
        description: 'Generate inventory reports', 
        href: '/reports', 
        category: 'Navigation',
        keywords: ['laporan', 'report', 'export', 'download'],
        priority: 7,
        icon: <TrendingUp className="h-4 w-4" />
      },
      { 
        title: 'Alerts', 
        description: 'Check system notifications', 
        href: '/alerts', 
        category: 'Navigation',
        keywords: ['notifikasi', 'peringatan', 'warning', 'notification'],
        priority: 6,
        icon: <TrendingUp className="h-4 w-4" />
      },
    ];

    if (user?.role === 'admin' || user?.role === 'super_admin') {
      baseItems.push(
        { 
          title: 'Stock Management', 
          description: 'Manage inventory and stock levels', 
          href: '/stock-movement', 
          category: 'Admin',
          keywords: ['stok', 'inventory', 'stock', 'management', 'pergerakan'],
          priority: 9,
          icon: <TrendingUp className="h-4 w-4" />
        },
        { 
          title: 'User Management', 
          description: 'Manage system users', 
          href: '/users', 
          category: 'Admin',
          keywords: ['pengguna', 'user', 'akun', 'account'],
          priority: 5,
          icon: <TrendingUp className="h-4 w-4" />
        },
        { 
          title: 'Settings', 
          description: 'Configure system settings', 
          href: '/settings', 
          category: 'Admin',
          keywords: ['pengaturan', 'setting', 'konfigurasi', 'config'],
          priority: 4,
          icon: <TrendingUp className="h-4 w-4" />
        }
      );
    }

    if (user?.role === 'super_admin') {
      baseItems.push(
        { 
          title: 'Security Center', 
          description: 'Monitor system security', 
          href: '/security', 
          category: 'Super Admin',
          keywords: ['keamanan', 'security', 'monitoring'],
          priority: 3,
          icon: <TrendingUp className="h-4 w-4" />
        },
        { 
          title: 'System Health', 
          description: 'Monitor system performance', 
          href: '/system-health', 
          category: 'Super Admin',
          keywords: ['kesehatan', 'health', 'performance', 'monitoring'],
          priority: 2,
          icon: <TrendingUp className="h-4 w-4" />
        }
      );
    }

    return baseItems;
  };

  const searchableItems = getSearchableItems();

  const fuzzySearch = (items: SearchResult[], searchQuery: string): SearchResult[] => {
    if (!searchQuery.trim()) return items.slice(0, 6).sort((a, b) => b.priority - a.priority);

    const query = searchQuery.toLowerCase();
    
    return items
      .map(item => {
        let score = 0;
        
        // Exact title match
        if (item.title.toLowerCase().includes(query)) {
          score += 10;
        }
        
        // Description match
        if (item.description.toLowerCase().includes(query)) {
          score += 5;
        }
        
        // Keywords match
        const keywordMatches = item.keywords.filter(keyword => 
          keyword.toLowerCase().includes(query) || query.includes(keyword.toLowerCase())
        );
        score += keywordMatches.length * 3;
        
        // Fuzzy matching for typos
        const fuzzyMatches = item.keywords.filter(keyword => {
          const maxDistance = Math.floor(keyword.length * 0.3);
          return levenshteinDistance(keyword.toLowerCase(), query) <= maxDistance;
        });
        score += fuzzyMatches.length * 2;
        
        // Priority bonus
        score += item.priority * 0.1;
        
        return { ...item, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  const filteredResults = useMemo(() => {
    return fuzzySearch(searchableItems, debouncedQuery);
  }, [searchableItems, debouncedQuery]);

  const handleItemClick = (item: SearchResult) => {
    // Add to recent searches
    const newRecentSearches = [item.title, ...recentSearches.filter(s => s !== item.title)].slice(0, 5);
    setRecentSearches(newRecentSearches);
    localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
    
    setQuery('');
    onClose();
  };

  const handleRecentSearchClick = (searchTerm: string) => {
    setQuery(searchTerm);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Enhanced Search
          </DialogTitle>
        </DialogHeader>
        
        <div className="px-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for pages, features, actions, or use keywords..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-4"
              autoFocus
            />
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {!debouncedQuery && recentSearches.length > 0 && (
            <div className="p-6 pt-2">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Recent Searches</span>
                </div>
                <button 
                  onClick={clearRecentSearches}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((searchTerm, index) => (
                  <Badge 
                    key={index}
                    variant="secondary" 
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => handleRecentSearchClick(searchTerm)}
                  >
                    {searchTerm}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="p-6 pt-2">
            <AnimatePresence mode="wait">
              {filteredResults.length > 0 ? (
                <motion.div 
                  key="results"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-2"
                >
                  {filteredResults.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link to={item.href} onClick={() => handleItemClick(item)}>
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer border border-transparent hover:border-border">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="text-muted-foreground group-hover:text-foreground transition-colors">
                              {item.icon}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium group-hover:text-primary transition-colors">
                                  {item.title}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {item.category}
                                </Badge>
                                {item.priority >= 8 && (
                                  <Star className="h-3 w-3 text-yellow-500" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              ) : debouncedQuery ? (
                <motion.div 
                  key="no-results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <Search className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No results found for "{debouncedQuery}"</p>
                  <p className="text-sm text-muted-foreground mt-1">Try different keywords or check spelling</p>
                </motion.div>
              ) : (
                <motion.div 
                  key="default"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-2"
                >
                  {searchableItems.slice(0, 6).sort((a, b) => b.priority - a.priority).map((item, index) => (
                    <Link key={index} to={item.href} onClick={() => handleItemClick(item)}>
                      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer border border-transparent hover:border-border">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="text-muted-foreground group-hover:text-foreground transition-colors">
                            {item.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{item.title}</span>
                              <Badge variant="outline" className="text-xs">
                                {item.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="px-6 py-3 border-t bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-background rounded border text-xs">Ctrl</kbd>
                <span>+</span>
                <kbd className="px-2 py-1 bg-background rounded border text-xs">K</kbd>
              </div>
              <span>to search</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {filteredResults.length} results
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};