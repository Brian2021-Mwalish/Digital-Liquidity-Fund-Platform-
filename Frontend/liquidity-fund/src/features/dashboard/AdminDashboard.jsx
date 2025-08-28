import React, { useState, useEffect } from 'react';
import { 
  Search, Bell, ChevronDown, Menu, X, BarChart3, Users, Home, CreditCard, 
  FileCheck, MessageSquare, Settings, Shield, Activity, LogOut, UserX, 
  CheckCircle, Eye, Filter, MoreHorizontal 
} from 'lucide-react';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [profileOpen, setProfileOpen] = useState(false);
  const [adminData, setAdminData] = useState({ username: 'Admin', email: 'admin@example.com', is_superuser: true });
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState([
    { title: 'Total Users', value: '1,247', change: '+12%', positive: true },
    { title: 'Active Rentals', value: '89', change: '+5%', positive: true },
    { title: 'Monthly Revenue', value: '$24,680', change: '+18%', positive: true },
    { title: 'Pending KYC', value: '12', change: '-3%', positive: false }
  ]);

  const API_BASE_URL = 'http://127.0.0.1:8000/api/auth';

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3, count: null },
    { id: 'users', label: 'Users', icon: Users, count: users.length },
    { id: 'rentals', label: 'Rentals', icon: Home, count: 89 },
    { id: 'transactions', label: 'Transactions', icon: CreditCard, count: null },
    { id: 'kyc', label: 'KYC Verifications', icon: FileCheck, count: 12 },
    { id: 'support', label: 'Support', icon: MessageSquare, count: 7 },
    { id: 'settings', label: 'Settings', icon: Settings, count: null },
    { id: 'audit', label: 'Audit Logs', icon: Shield, count: null },
    { id: 'status', label: 'System Status', icon: Activity, count: null }
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users;
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter(user => 
        filterStatus === 'active' ? user.is_active : !user.is_active
      );
    }
    setFilteredUsers(filtered);
  }, [users, searchTerm, filterStatus]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("access");
      
      if (!token) {
        console.log('No access token found');
        setUsers([]);
        return;
      }

      const res = await fetch("http://127.0.0.1:8000/api/auth/profile/", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const profileData = await res.json();
        
        // For now, since there's no users endpoint in your backend,
        // we'll create mock data based on the authenticated admin
        const mockUsers = [
          {
            id: profileData.id,
            username: profileData.full_name?.split(' ')[0]?.toLowerCase() || 'admin',
            email: profileData.email,
            is_active: true,
            date_joined: profileData.date_joined,
            first_name: profileData.full_name?.split(' ')[0] || 'Admin',
            last_name: profileData.full_name?.split(' ')[1] || 'User'
          },
          { id: 2, username: 'john_doe', email: 'john@example.com', is_active: true, date_joined: '2024-01-15', first_name: 'John', last_name: 'Doe' },
          { id: 3, username: 'jane_smith', email: 'jane@example.com', is_active: false, date_joined: '2024-02-20', first_name: 'Jane', last_name: 'Smith' }
        ];

        setUsers(mockUsers);
        setStats(prev => prev.map(stat => 
          stat.title === 'Total Users' ? { ...stat, value: mockUsers.length.toString() } : stat
        ));

        // Update admin data
        setAdminData({
          username: profileData.full_name || 'Admin',
          email: profileData.email,
          is_superuser: true
        });

      } else if (res.status === 401) {
        console.error('Authentication failed: Token expired or invalid');
        setUsers([]);
      } else {
        console.error('Failed to fetch profile:', res.status, res.statusText);
        setUsers([]);
      }
    } catch (error) {
      console.error('Network error while fetching users:', error);
      setUsers([]);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("access");
      await fetch(`${API_BASE_URL}/logout/`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem("access");
      setProfileOpen(false);
      window.location.href = '/login';
    }
  };

  const handleBlockUser = async (userId, isBlocked) => {
    if (!confirm(`Are you sure you want to ${isBlocked ? 'unblock' : 'block'} this user?`)) return;
    try {
      const token = localStorage.getItem("access");

      const response = await fetch(`${API_BASE_URL}/users/${userId}/`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ is_active: isBlocked }),
      });
      
      if (response.ok) {
        await fetchUsers();
        alert(`User ${isBlocked ? 'unblocked' : 'blocked'} successfully`);
      } else if (response.status === 401) {
        alert('Authentication expired. Please log in again.');
      } else {
        alert('Failed to update user status');
      }
    } catch (error) {
      console.error('Block user error:', error);
      alert('An error occurred while updating user status');
    }
  };

  const UsersManagement = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Filter size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Users</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
            <span className="text-sm text-gray-600">{filteredUsers.length} of {users.length} users</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-medium text-gray-900">User</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">Email</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">Status</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">Joined</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {(user.first_name?.[0] || user.username[0]).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.username}
                        </p>
                        <p className="text-sm text-gray-600">@{user.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-900">{user.email}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active ? <><CheckCircle size={12} className="mr-1" />Active</> : <><UserX size={12} className="mr-1" />Blocked</>}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-600">{new Date(user.date_joined).toLocaleDateString()}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleBlockUser(user.id, !user.is_active)}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                          user.is_active ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {user.is_active ? 'Block' : 'Unblock'}
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600 rounded-md"><Eye size={16} /></button>
                      <button className="p-1 text-gray-400 hover:text-gray-600 rounded-md"><MoreHorizontal size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 text-lg">No users found</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-slate-800 text-white shadow-lg relative z-50 w-full">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white hover:bg-white/10 p-2 rounded-md md:hidden">
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
              <input placeholder="Search..." className="pl-10 pr-4 py-2 w-48 lg:w-64 bg-slate-700 border border-slate-600 text-white placeholder:text-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
            </div>
            <button className="text-white hover:bg-white/10 p-2 rounded-md relative">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">3</span>
            </button>
            <div className="relative">
              <div className="flex items-center space-x-2 cursor-pointer hover:bg-white/10 rounded-lg px-3 py-2 transition-colors" onClick={() => setProfileOpen(!profileOpen)}>
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-white">{adminData?.username?.[0] || 'A'}</span>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-white">{adminData?.username || 'Admin'}</p>
                  <p className="text-xs text-gray-300">{adminData?.email}</p>
                </div>
                <ChevronDown size={16} className="text-gray-300" />
              </div>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl py-2 text-gray-800 border border-gray-200">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="font-medium text-gray-900">{adminData?.username}</p>
                    <p className="text-sm text-gray-600">{adminData?.email}</p>
                    <span className="inline-flex items-center px-2 py-1 mt-2 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {adminData?.is_superuser ? 'Super Admin' : 'Admin'}
                    </span>
                  </div>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2">
                    <LogOut size={16} /><span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex w-full">
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:block`}>
          <div className="flex flex-col h-full pt-16 md:pt-0">
            <nav className="flex-1 px-4 py-6 space-y-2">
              {menuItems.map((item) => (
                <button key={item.id} onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                          activeSection === item.id ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                        }`}>
                  <div className="flex items-center space-x-3">
                    <item.icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.count && <span className={`text-xs px-2 py-1 rounded-full ${activeSection === item.id ? 'bg-blue-800 text-blue-200' : 'bg-slate-700 text-white'}`}>{item.count}</span>}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {sidebarOpen && <div className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden" onClick={() => setSidebarOpen(false)} />}

        <main className="flex-1 w-full md:w-auto">
          <div className="p-4 lg:p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 capitalize">{activeSection === 'kyc' ? 'KYC Verifications' : activeSection}</h2>
              <p className="text-gray-600 mt-1">Manage your {activeSection} and monitor platform performance</p>
            </div>

            {activeSection === 'users' ? <UsersManagement /> : (
              <>
                {activeSection === 'overview' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 mb-6">
                    {stats.map((stat, index) => (
                      <div key={index} className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                        <h3 className="text-gray-600 text-sm font-medium mb-2">{stat.title}</h3>
                        <div className="flex items-end justify-between">
                          <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                          <span className={`text-sm font-medium flex items-center ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                            {stat.positive ? '↗' : '↘'} {stat.change}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
                  <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
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
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors transform hover:scale-105">Approve KYC</button>
                      <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors">Export Data</button>
                      <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors transform hover:scale-105">Block User</button>
                      <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors">Send Alert</button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;