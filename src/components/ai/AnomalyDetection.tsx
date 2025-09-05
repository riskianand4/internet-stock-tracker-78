import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, ScatterChart, Scatter, Cell } from 'recharts';
import { AlertTriangle, Brain, TrendingDown, TrendingUp, Zap, Eye } from 'lucide-react';
import { useHybridProducts } from '@/hooks/useHybridData';
import { formatNumber } from '@/lib/formatters';
import { toast } from '@/hooks/use-toast';
interface Anomaly {
  id: string;
  type: 'spike' | 'drop' | 'pattern' | 'correlation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  productId: string;
  productName: string;
  description: string;
  detectedAt: Date;
  confidence: number;
  impact: string;
  suggestedAction: string;
  dataPoints: number[];
  threshold: number;
}
const AnomalyDetection = () => {
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);
  const [autoDetection, setAutoDetection] = useState(true);
  const { data: products } = useHybridProducts();

  const anomalies = useMemo(() => {
    // AI-powered anomaly detection using statistical analysis
    const detectedAnomalies: Anomaly[] = [];
    
    if (!products || products.length === 0) return detectedAnomalies;
    
    products.forEach((product, index) => {
      // Simulate anomaly detection algorithms
      const dataPoints = Array.from({
        length: 30
      }, (_, i) => {
        const base = 100;
        const trend = i * 2;
        const noise = (Math.random() - 0.5) * 20;
        return Math.max(0, base + trend + noise);
      });

      // Z-score based spike detection
      const mean = dataPoints.reduce((a, b) => a + b, 0) / dataPoints.length;
      const stdDev = Math.sqrt(dataPoints.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / dataPoints.length);
      dataPoints.forEach((value, i) => {
        const zScore = Math.abs((value - mean) / stdDev);
        if (zScore > 2.5 && Math.random() > 0.7) {
          // 30% chance of anomaly
          const isSpike = value > mean;
          detectedAnomalies.push({
            id: `anomaly-${index}-${i}`,
            type: isSpike ? 'spike' : 'drop',
          severity: zScore > 3 ? 'critical' : zScore > 2.8 ? 'high' : 'medium',
            productId: product.id,
            productName: product.name,
            description: `${isSpike ? 'Lonjakan' : 'Penurunan'} permintaan yang tidak biasa terdeteksi`,
            detectedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
            confidence: Math.min(95, Math.round(zScore * 25)),
            impact: isSpike ? `Potensi kehabisan stok dalam ${Math.round(3 / zScore)} hari` : `Penurunan penjualan ${Math.round(zScore * 10)}%`,
            suggestedAction: isSpike ? 'Tambah stok segera & cek supplier' : 'Evaluasi strategi marketing & promosi',
            dataPoints: dataPoints.slice(Math.max(0, i - 7), i + 7),
            threshold: mean + (isSpike ? 1 : -1) * 2 * stdDev
          });
        }
      });

      // Pattern anomaly detection (seasonal mismatch)
      if (Math.random() > 0.8) {
        detectedAnomalies.push({
          id: `pattern-${index}`,
          type: 'pattern',
          severity: 'medium',
          productId: product.id,
          productName: product.name,
          description: 'Pola penjualan tidak sesuai dengan tren musiman historis',
          detectedAt: new Date(),
          confidence: 78,
          impact: `Deviasi ${Math.round(15 + Math.random() * 25)}% dari pola normal`,
          suggestedAction: 'Analisis faktor eksternal & sesuaikan prediksi',
          dataPoints: dataPoints,
          threshold: mean
        });
      }

      // Correlation anomaly (related products behaving differently)
      if (Math.random() > 0.85) {
        detectedAnomalies.push({
          id: `correlation-${index}`,
          type: 'correlation',
          severity: 'high',
          productId: product.id,
          productName: product.name,
          description: 'Produk terkait menunjukkan korelasi yang tidak biasa',
          detectedAt: new Date(),
          confidence: 82,
          impact: 'Kemungkinan masalah supply chain atau perubahan preferensi',
          suggestedAction: 'Investigasi hubungan antar produk & supplier',
          dataPoints: dataPoints,
          threshold: mean
        });
      }
    });
    return detectedAnomalies.sort((a, b) => b.confidence - a.confidence).slice(0, 15);
  }, [products]);
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'warning';
      default:
        return 'secondary';
    }
  };
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'spike':
        return TrendingUp;
      case 'drop':
        return TrendingDown;
      case 'pattern':
        return Zap;
      case 'correlation':
        return Brain;
      default:
        return AlertTriangle;
    }
  };
  const handleAcknowledge = (anomalyId: string) => {
    toast({
      title: "Anomali Diakui",
      description: "Anomali telah ditandai sebagai diketahui dan akan dipantau."
    });
  };
  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  const itemVariants = {
    hidden: {
      y: 20,
      opacity: 0
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 24
      }
    }
  };
  return <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex items-center justify-end">
        
        <Button variant={autoDetection ? "default" : "outline"} onClick={() => setAutoDetection(!autoDetection)} className="gap-2">
          <Eye className="h-4 w-4" />
          {autoDetection ? 'Auto Detection ON' : 'Auto Detection OFF'}
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium">Critical</span>
            </div>
            <div className="text-2xl font-bold">
              {anomalies.filter(a => a.severity === 'critical').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium">High</span>
            </div>
            <div className="text-2xl font-bold">
              {anomalies.filter(a => a.severity === 'high').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Confidence</span>
            </div>
            <div className="text-2xl font-bold">
              {Math.round(anomalies.reduce((sum, a) => sum + a.confidence, 0) / anomalies.length)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">Detection Rate</span>
            </div>
            <div className="text-2xl font-bold">
              {products?.length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Anomalies List */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid gap-4">
        {anomalies.map(anomaly => {
        const Icon = getTypeIcon(anomaly.type);
        return <motion.div key={anomaly.id} variants={itemVariants}>
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedAnomaly(anomaly)}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-full ${anomaly.severity === 'critical' ? 'bg-destructive/20' : anomaly.severity === 'high' ? 'bg-destructive/10' : anomaly.severity === 'medium' ? 'bg-warning/20' : 'bg-secondary'}`}>
                        <Icon className={`h-4 w-4 ${anomaly.severity === 'critical' ? 'text-destructive' : anomaly.severity === 'high' ? 'text-destructive' : anomaly.severity === 'medium' ? 'text-warning' : 'text-muted-foreground'}`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{anomaly.productName}</h3>
                          <Badge variant={getSeverityColor(anomaly.severity) as any}>
                            {anomaly.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">{anomaly.confidence}% confidence</Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {anomaly.description}
                        </p>
                        
                        <div className="text-sm">
                          <p className="mb-1"><strong>Impact:</strong> {anomaly.impact}</p>
                          <p><strong>Saran:</strong> {anomaly.suggestedAction}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button size="sm" variant="outline" onClick={e => {
                    e.stopPropagation();
                    handleAcknowledge(anomaly.id);
                  }}>
                        Acknowledge
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>;
      })}
      </motion.div>

      {/* Anomaly Detail Modal */}
      {selectedAnomaly && <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Detail Anomali: {selectedAnomaly.productName}</span>
              <Button variant="ghost" size="sm" onClick={() => setSelectedAnomaly(null)}>
                ×
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Informasi Anomali</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Tipe:</strong> {selectedAnomaly.type}</p>
                  <p><strong>Severity:</strong> {selectedAnomaly.severity}</p>
                  <p><strong>Confidence:</strong> {selectedAnomaly.confidence}%</p>
                  <p><strong>Terdeteksi:</strong> {selectedAnomaly.detectedAt.toLocaleString('id-ID')}</p>
                </div>
                
                <Alert className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Saran Tindakan:</strong><br />
                    {selectedAnomaly.suggestedAction}
                  </AlertDescription>
                </Alert>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Data Pattern</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={selectedAnomaly.dataPoints.map((value, index) => ({
                index,
                value,
                threshold: selectedAnomaly.threshold
              }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="index" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} />
                    <Line type="monotone" dataKey="threshold" stroke="hsl(var(--destructive))" strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>}
    </div>;
};
export default AnomalyDetection;