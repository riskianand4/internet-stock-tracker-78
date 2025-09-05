import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Activity, AlertTriangle, CheckCircle, Clock, Download, RefreshCw, Shield, TrendingUp, Zap } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
interface ApiLog {
  id: string;
  timestamp: Date;
  method: string;
  endpoint: string;
  statusCode: number;
  responseTime: number;
  apiKeyName: string;
  ipAddress: string;
  userAgent: string;
}
interface ApiStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  topEndpoints: {
    endpoint: string;
    count: number;
  }[];
  requestsToday: {
    hour: string;
    requests: number;
  }[];
  statusCodes: {
    code: number;
    count: number;
  }[];
}
export const ApiMonitoring: React.FC = () => {
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [stats, setStats] = useState<ApiStats | null>(null);
  const [timeRange, setTimeRange] = useState('24h');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Generate mock data
  useEffect(() => {
    generateMockData();
  }, [timeRange]);
  const generateMockData = () => {
    // Generate mock logs
    const mockLogs: ApiLog[] = [];
    const endpoints = ['/api/products', '/api/inventory/stats', '/api/analytics/velocity', '/api/inventory/movements'];
    const methods = ['GET', 'POST', 'PUT', 'DELETE'];
    const statusCodes = [200, 201, 400, 401, 404, 500];
    const apiKeys = ['Production API', 'Development Key', 'Analytics Bot', 'Mobile App'];
    for (let i = 0; i < 100; i++) {
      const timestamp = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000);
      mockLogs.push({
        id: crypto.randomUUID(),
        timestamp,
        method: methods[Math.floor(Math.random() * methods.length)],
        endpoint: endpoints[Math.floor(Math.random() * endpoints.length)],
        statusCode: statusCodes[Math.floor(Math.random() * statusCodes.length)],
        responseTime: Math.floor(Math.random() * 1000) + 50,
        apiKeyName: apiKeys[Math.floor(Math.random() * apiKeys.length)],
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'API Client/1.0'
      });
    }

    // Generate mock stats
    const totalRequests = mockLogs.length;
    const successfulRequests = mockLogs.filter(log => log.statusCode < 400).length;
    const failedRequests = totalRequests - successfulRequests;
    const averageResponseTime = mockLogs.reduce((sum, log) => sum + log.responseTime, 0) / totalRequests;
    const endpointCounts = endpoints.map(endpoint => ({
      endpoint,
      count: mockLogs.filter(log => log.endpoint === endpoint).length
    }));
    const hourlyData = Array.from({
      length: 24
    }, (_, i) => ({
      hour: `${i}:00`,
      requests: Math.floor(Math.random() * 50) + 10
    }));
    const statusCodeCounts = statusCodes.map(code => ({
      code,
      count: mockLogs.filter(log => log.statusCode === code).length
    }));
    setStats({
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime,
      topEndpoints: endpointCounts.sort((a, b) => b.count - a.count).slice(0, 5),
      requestsToday: hourlyData,
      statusCodes: statusCodeCounts.filter(item => item.count > 0)
    });
    setLogs(mockLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
  };
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    generateMockData();
    setIsRefreshing(false);
  };
  const getStatusColor = (code: number) => {
    if (code < 300) return 'text-green-600';
    if (code < 400) return 'text-blue-600';
    if (code < 500) return 'text-yellow-600';
    return 'text-red-600';
  };
  const getStatusBadgeVariant = (code: number) => {
    if (code < 300) return 'default';
    if (code < 400) return 'secondary';
    if (code < 500) return 'destructive';
    return 'destructive';
  };
  const filteredLogs = logs.filter(log => {
    if (statusFilter === 'success') return log.statusCode < 400;
    if (statusFilter === 'error') return log.statusCode >= 400;
    return true;
  });
  if (!stats) return <div>Loading...</div>;
  return <div className="space-y-6">
      <div className="flex justify-end items-center">
        
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.successfulRequests / stats.totalRequests * 100).toFixed(1)}%
            </div>
            <Progress value={stats.successfulRequests / stats.totalRequests * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.averageResponseTime)}ms</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">-5ms</span> from last hour
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Requests</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failedRequests}</div>
            <p className="text-xs text-muted-foreground">
              {(stats.failedRequests / stats.totalRequests * 100).toFixed(1)}% error rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Request Volume (24h)</CardTitle>
            <CardDescription>Hourly API request distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats.requestsToday}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="requests" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Endpoints</CardTitle>
            <CardDescription>Most frequently accessed endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.topEndpoints}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="endpoint" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Logs */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Recent API Logs</CardTitle>
              <CardDescription>Latest API requests and responses</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="error">Errors</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Response Time</TableHead>
                <TableHead>API Key</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.slice(0, 20).map(log => <TableRow key={log.id}>
                  <TableCell className="text-sm">
                    {log.timestamp.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.method}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{log.endpoint}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(log.statusCode)}>
                      {log.statusCode}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={log.responseTime > 500 ? 'text-red-600' : 'text-green-600'}>
                      {log.responseTime}ms
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">{log.apiKeyName}</TableCell>
                  <TableCell className="text-sm font-mono">{log.ipAddress}</TableCell>
                </TableRow>)}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>;
};