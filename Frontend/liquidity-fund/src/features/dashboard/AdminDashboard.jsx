import React, { useState } from 'react';
import { Search, Bell, ChevronDown, Menu, X, BarChart3, Users, Home, CreditCard, FileCheck, MessageSquare, Settings, Shield, Activity } from 'lucide-react';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [profileOpen, setProfileOpen] = useState(false); // ✅ added state

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3, count: null },
    { id: 'users', label: 'Users', icon: Users, count: 1247 },
    { id: 'rentals', label: 'Rentals', icon: Home, count: 89 },
    { id: 'transactions', label: 'Transactions', icon: CreditCard, count: null },
    { id: 'kyc', label: 'KYC Verifications', icon: FileCheck, count: 12 },
    { id: 'support', label: 'Support', icon: MessageSquare, count: 7 },
    { id: 'settings', label: 'Settings', icon: Settings, count: null },
    { id: 'audit', label: 'Audit Logs', icon: Shield, count: null },
    { id: 'status', label: 'System Status', icon: Activity, count: null }
  ];

  const stats = [
    { title: 'Total Users', value: '1,247', change: '+12%', positive: true },
    { title: 'Active Rentals', value: '89', change: '+5%', positive: true },
    { title: 'Monthly Revenue', value: '$24,680', change: '+18%', positive: true },
    { title: 'Pending KYC', value: '12', change: '-3%', positive: false }
  ];

  // ✅ stubbed logout handler
  const handleLogout = () => {
    console.log("Logout clicked");
    setProfileOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-slate-800 text-white shadow-lg relative z-50 w-full">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white hover:bg-white/10 p-2 rounded-md md:hidden"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Home size={16} className="text-white" />
              </div>
              <h1 className="text-xl font-bold hidden sm:block">RentFlowCoin Admin</h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                placeholder="Search..."
                className="pl-10 pr-4 py-2 w-48 lg:w-64 bg-slate-700 border border-slate-600 text-white placeholder:text-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <button className="text-white hover:bg-white/10 p-2 rounded-md relative">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">3</span>
              </button>
            </div>

            {/* Profile */}
            <div className="relative">
              <div 
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-white">A</span>
                </div>
                <button className="text-white hover:bg-white/10 p-2 rounded-md hidden sm:flex items-center">
                  Admin <ChevronDown size={16} className="ml-1" />
                </button>
              </div>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 text-gray-800">
                  <p className="px-4 py-2 text-sm border-b border-gray-200">
                    Logged in as <span className="block text-xs text-gray-600">admin@example.com</span>
                  </p>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar + Main */}
      <div className="flex w-full">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0 md:block
        `}>
          <div className="flex flex-col h-full pt-16 md:pt-0">
            <nav className="flex-1 px-4 py-6 space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all duration-200
                    ${activeSection === item.id 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.count && (
                    <span className="bg-slate-700 text-white text-xs px-2 py-1 rounded-full">
                      {item.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 w-full md:w-auto">
          <div className="p-4 lg:p-6">
            {/* Page Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 capitalize">
                {activeSection === 'kyc' ? 'KYC Verifications' : activeSection}
              </h2>
              <p className="text-gray-600 mt-1">
                Manage your {activeSection} and monitor platform performance
              </p>
            </div>

            {/* Stats Grid */}
            {activeSection === 'overview' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 mb-6">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                    <h3 className="text-gray-600 text-sm font-medium mb-2">{stat.title}</h3>
                    <div className="flex items-end justify-between">
                      <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                      <span className={`text-sm font-medium ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Content Cards */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <Users size={16} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">New user registration</p>
                        <p className="text-xs text-gray-600">2 minutes ago</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    Approve KYC
                  </button>
                  <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors">
                    Export Data
                  </button>
                  <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    Block User
                  </button>
                  <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors">
                    Send Alert
                  </button>
                </div>
              </div>
            </div>

            {/* Additional Content */}
            <div className="mt-6 bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Management
              </h3>
              <div className="text-gray-600">
                <p>Detailed {activeSection} management interface would be implemented here.</p>
                <p className="mt-2">This includes filtering, sorting, and bulk actions for efficient administration.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
