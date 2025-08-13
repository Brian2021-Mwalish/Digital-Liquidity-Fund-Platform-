import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  BarChart3,
  TrendingUp,
  Shield,
  Clock,
  Users,
  AlertTriangle,
  Activity,
  DollarSign,
  Search,
  Bell,
  Settings,
  FileText,
  Headphones,
  Database,
  Zap,
  Eye,
  Ban,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Menu,
  X
} from 'lucide-react';

const AdminDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemStatus, setSystemStatus] = useState('stable');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNav, setSelectedNav] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'stable': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-green-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'stable': return 'All Systems Online';
      case 'warning': return 'System Warning';
      case 'critical': return 'Critical Alert';
      default: return 'All Systems Online';
    }
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'clients', label: 'Client Management', icon: Users },
    { id: 'rentals', label: 'Rental Management', icon: Database },
    { id: 'transactions', label: 'Transactions', icon: DollarSign },
    { id: 'reports', label: 'Reports & Analytics', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'support', label: 'Support & Helpdesk', icon: Headphones }
  ];

  const keyMetrics = [
    {
      title: 'Liquidity Health Index',
      value: '87',
      unit: '/100',
      change: '+5.2%',
      trend: 'up',
      status: 'good',
      icon: Activity,
      bgColor: 'bg-blue-50',
      iconColor: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Overdue Rental Risk',
      value: '12.3',
      unit: '%',
      change: '-2.1%',
      trend: 'down',
      status: 'warning',
      icon: AlertTriangle,
      bgColor: 'bg-orange-50',
      iconColor: 'bg-orange-500',
      textColor: 'text-orange-600'
    },
    {
      title: 'Client Retention Rate',
      value: '94.2',
      unit: '%',
      change: '+1.8%',
      trend: 'up',
      status: 'good',
      icon: Users,
      bgColor: 'bg-green-50',
      iconColor: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Time-to-Approval',
      value: '2.4',
      unit: 'min',
      change: '-0.6%',
      trend: 'down',
      status: 'good',
      icon: Clock,
      bgColor: 'bg-purple-50',
      iconColor: 'bg-purple-500',
      textColor: 'text-purple-600'
    }
  ];

  const recentActivities = [
    { type: 'signup', message: 'New user registration: john.doe@email.com', time: '2 min ago', status: 'success' },
    { type: 'deposit', message: 'Large deposit: $50,000 - UserID: 12847', time: '5 min ago', status: 'success' },
    { type: 'alert', message: 'Overdue rental alert: BTC rental #4521', time: '12 min ago', status: 'warning' },
    { type: 'error', message: 'API timeout error on withdrawal service', time: '18 min ago', status: 'critical' },
    { type: 'withdrawal', message: 'Withdrawal request: $25,000 - UserID: 9653', time: '25 min ago', status: 'warning' }
  ];

  const topCurrencies = [
    { symbol: 'BTC', name: 'Bitcoin', rentals: 234, trend: 'up', trending: true, color: 'bg-orange-100 text-orange-800', iconBg: 'bg-orange-500' },
    { symbol: 'ETH', name: 'Ethereum', rentals: 187, trend: 'up', trending: false, color: 'bg-blue-100 text-blue-800', iconBg: 'bg-blue-500' },
    { symbol: 'USDC', name: 'USD Coin', rentals: 156, trend: 'down', trending: false, color: 'bg-green-100 text-green-800', iconBg: 'bg-green-500' },
    { symbol: 'SOL', name: 'Solana', rentals: 98, trend: 'up', trending: true, color: 'bg-purple-100 text-purple-800', iconBg: 'bg-purple-500' }
  ];

  const quickActions = [
    { label: 'Approve Withdrawals', icon: CheckCircle, color: 'bg-green-600 hover:bg-green-700 text-white' },
    { label: 'Send Client Alert', icon: Send, color: 'bg-blue-600 hover:bg-blue-700 text-white' },
    { label: 'Freeze Account', icon: Ban, color: 'bg-red-600 hover:bg-red-700 text-white' },
    { label: 'View Reports', icon: Eye, color: 'bg-gray-600 hover:bg-gray-700 text-white' }
  ];

  const filteredNavigation = navigationItems.filter(item =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Card */}
      <Card className="sticky top-0 z-50 rounded-none border-b shadow-sm">
        <CardContent className="p-0">
          <div className="flex items-center justify-between px-4 lg:px-6 py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                    Prime Trades Admin
                  </h1>
                  <p className="text-sm text-gray-600 hidden sm:block">
                    Real-time dashboard & analytics
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Card className="hidden sm:block">
                <CardContent className="p-3">
                  <div className="text-sm font-semibold text-gray-900">
                    {currentTime.toLocaleTimeString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {currentTime.toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
              
              <Badge className={`${getStatusColor(systemStatus)} text-white border-0`}>
                <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                <span className="hidden sm:inline">{getStatusText(systemStatus)}</span>
                <span className="sm:hidden">Status</span>
              </Badge>

              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold cursor-pointer hover:scale-105 transition-transform">
                AD
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex">
        {/* Sidebar Card */}
        <Card className={`
          fixed lg:sticky top-0 left-0 z-40 w-16 h-screen pt-20 lg:pt-0 
          transform transition-transform duration-300 ease-in-out rounded-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:w-20 lg:h-[calc(100vh-81px)]
          shadow-lg lg:shadow-none border-r
        `}>
          <CardContent className="p-4 lg:p-6 h-full">
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search menu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <nav className="space-y-2">
              {filteredNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = selectedNav === item.id;
                return (
                  <Button
                    key={item.id}
                    onClick={() => {
                      setSelectedNav(item.id);
                      setSidebarOpen(false);
                    }}
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start transition-all duration-200 ${
                      isActive 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>
          </CardContent>
        </Card>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 space-y-6 lg:space-y-8">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {keyMetrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <Card key={index} className={`${metric.bgColor} border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-gray-700">
                        {metric.title}
                      </CardTitle>
                      <div className={`p-2 rounded-lg ${metric.iconColor}`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline space-x-2 mb-3">
                      <span className={`text-3xl font-bold ${metric.textColor}`}>
                        {metric.value}
                      </span>
                      <span className="text-sm text-gray-600">
                        {metric.unit}
                      </span>
                    </div>
                    <div className="flex items-center">
                      {metric.trend === 'up' ? (
                        <ArrowUp className="w-4 h-4 text-green-600 mr-2" />
                      ) : (
                        <ArrowDown className="w-4 h-4 text-red-600 mr-2" />
                      )}
                      <span className={`text-sm font-semibold ${
                        metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {metric.change}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">vs last week</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Chart Section Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Rental Duration Trends</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">This Week</span>
                        <span className="text-xl font-bold text-blue-600">14.2 days</span>
                      </div>
                    </CardContent>
                  </Card>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full w-3/4" />
                  </div>
                  <Card className="bg-gray-50 border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Last Week</span>
                        <span className="text-xl font-bold text-gray-600">12.8 days</span>
                      </div>
                    </CardContent>
                  </Card>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-gray-400 h-full rounded-full w-2/3" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Top Performing Currencies</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {topCurrencies.map((currency, index) => (
                    <Card key={index} className="border hover:shadow-md transition-all duration-200 cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`w-10 h-10 ${currency.iconBg} rounded-full flex items-center justify-center`}>
                              <span className="text-sm font-bold text-white">{currency.symbol}</span>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{currency.name}</div>
                              <div className="text-sm text-gray-600">{currency.rentals} active rentals</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            {currency.trending && (
                              <Badge className={currency.color}>
                                🔥 Trending
                              </Badge>
                            )}
                            <div className={`p-2 rounded-lg ${
                              currency.trend === 'up' ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                              {currency.trend === 'up' ? (
                                <ArrowUp className="w-4 h-4 text-green-600" />
                              ) : (
                                <ArrowDown className="w-4 h-4 text-red-600" />
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Analysis and Quick Actions Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Risk & Profit Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Card className="bg-green-500 text-white border-0">
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold mb-2">$2.4M</div>
                      <div className="text-green-100 mb-1">Total Profits</div>
                      <div className="text-xs text-green-200">↑ 12.5% this month</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-orange-500 text-white border-0">
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold mb-2">$580K</div>
                      <div className="text-orange-100 mb-1">Risk Exposure</div>
                      <div className="text-xs text-orange-200">↓ 3.2% this month</div>
                    </CardContent>
                  </Card>
                </div>
                <Card className="bg-gray-50 border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm font-medium text-gray-700">Risk Ratio</span>
                      <span className="font-bold text-gray-900">24.2% (Healthy)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-full rounded-full w-1/4" />
                    </div>
                    <div className="text-xs text-gray-500 text-center mt-2">Optimal range: 20-30%</div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={index}
                      className={`w-full justify-start transition-all duration-200 hover:scale-105 ${action.color}`}
                      size="sm"
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {action.label}
                    </Button>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Feed Card */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Live Activity Feed</span>
                </div>
                <Badge className="bg-green-500 text-white border-0">
                  <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                  Live
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {recentActivities.map((activity, index) => (
                  <Card key={index} className="hover:shadow-md transition-all duration-200 cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <div className={`w-3 h-3 rounded-full mt-2 ${
                          activity.status === 'success' ? 'bg-green-500' :
                          activity.status === 'warning' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`} />
                        <div className="flex-1">
                          <div className="text-sm text-gray-900 font-medium">
                            {activity.message}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {activity.time}
                          </div>
                        </div>
                        <div className={`p-2 rounded-lg ${
                          activity.status === 'success' ? 'bg-green-100' :
                          activity.status === 'warning' ? 'bg-yellow-100' :
                          'bg-red-100'
                        }`}>
                          {activity.status === 'success' && <CheckCircle className="w-4 h-4 text-green-600" />}
                          {activity.status === 'warning' && <AlertCircle className="w-4 h-4 text-yellow-600" />}
                          {activity.status === 'critical' && <XCircle className="w-4 h-4 text-red-600" />}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Status Card */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>System Performance Metrics</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">1.2ms</div>
                    <div className="text-sm text-gray-700 mb-3">API Response Time</div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full w-1/5" />
                    </div>
                    <div className="text-xs text-gray-600 mt-2">Excellent Performance</div>
                  </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">99.98%</div>
                    <div className="text-sm text-gray-700 mb-3">Server Uptime</div>
                    <div className="w-full bg-green-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full w-full" />
                    </div>
                    <div className="text-xs text-gray-600 mt-2">Outstanding Reliability</div>
                  </CardContent>
                </Card>
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-yellow-600 mb-2">3</div>
                    <div className="text-sm text-gray-700 mb-3">Active Alerts</div>
                    <div className="w-full bg-yellow-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full w-1/4 animate-pulse" />
                    </div>
                    <div className="text-xs text-gray-600 mt-2">Requires Attention</div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Footer Card */}
      <Card className="rounded-none border-t border-b-0 mt-8">
        <CardContent className="px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between text-sm space-y-2 sm:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-4">
              <span className="text-gray-700 font-medium">
                © 2025 Prime Trades — Admin Panel v2.1.3
              </span>
              <span className="text-gray-500">
                Last updated: {new Date().toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(systemStatus)}`} />
              <span className="text-gray-700 font-medium">
                {systemStatus === 'stable' ? 'All systems operational' : 'System issues detected'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;