import React, { useState, useEffect } from 'react';
import {
  Search, Bell, ChevronDown, Menu, X, BarChart3, Users, Home, CreditCard,
  FileCheck, MessageSquare, Settings, Shield, Activity, LogOut, UserX,
  CheckCircle, Eye, Filter, MoreHorizontal, DollarSign, Clock, Check, XCircle
} from 'lucide-react';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [profileOpen, setProfileOpen] = useState(false);
  const [adminData, setAdminData] = useState({ username: 'Admin', email: 'admin@example.com', is_superuser: true });
  const [users, setUsers] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredWithdrawals, setFilteredWithdrawals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState([
    { title: 'Total Users', value: '0', change: '+12%', positive: true },
    { title: 'Pending Withdrawals', value: '0', change: '+5%', positive: true },
    { title: 'Monthly Revenue', value: '$0', change: '+18%', positive: true },
    { title: 'Pending KYC', value: '0', change: '-3%', positive: false }
  ]);

  const API_BASE_URL = 'http://127.0.0.1:8000/api';

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3, count: null },
    { id: 'users', label: 'Users', icon: Users, count: users.length },
    { id: 'withdrawals', label: 'Withdrawals', icon: DollarSign, count: withdrawals.filter(w => w.status === 'pending').length },
    { id: 'rentals', label: 'Rentals', icon: Home, count: 89 },
    { id: 'transactions', label: 'Transactions', icon: CreditCard, count: null },
    { id: 'kyc', label: 'KYC Verifications', icon: FileCheck, count: 12 },
    { id: 'support', label: 'Support', icon: MessageSquare, count: 7 },
    { id: 'settings', label: 'Settings', icon: Settings, count: null },
    { id: 'audit', label: 'Audit Logs', icon: Shield, count: null }
  ];

  useEffect(() => {
    fetchUsers();
    fetchWithdrawals();
  }, []);

  useEffect(() => {
    let filtered = activeSection === 'withdrawals' ? withdrawals : users;
    if (searchTerm) {
      filtered = filtered.filter(item => {
        if (activeSection === 'withdrawals') {
          return item.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 item.amount?.toString().includes(searchTerm.toLowerCase());
        }
        return item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
               item.email.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => {
        if (activeSection === 'withdrawals') {
          return item.status === filterStatus;
        }
        return filterStatus === 'active' ? item.is_active : !item.is_active;
      });
    }
    if (activeSection === 'withdrawals') {
      setFilteredWithdrawals(filtered);
    } else {
      setFilteredUsers(filtered);
    }
  }, [users, withdrawals, searchTerm, filterStatus, activeSection]);

  const handleApiError = (error, operation) => {
    console.error(`Error ${operation}:`, error);
    if (error.message.includes('401') || error.message.includes('403')) {
      alert('Session expired. Please login again.');
      localStorage.removeItem("access");
      window.location.href = '/login';
    } else {
      alert(`Failed to ${operation}. Please try again.`);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      // Fixed: Use correct users endpoint
      const usersRes = await fetch(`${API_BASE_URL}/auth/users/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        const usersArray = Array.isArray(usersData) ? usersData : usersData.results || [];
        setUsers(usersArray);
        setStats(prev => prev.map(stat => 
          stat.title === 'Total Users' 
            ? { ...stat, value: usersArray.length.toString() }
            : stat
        ));
      } else if (usersRes.status === 401 || usersRes.status === 403) {
        localStorage.removeItem("access");
        window.location.href = '/login';
        return;
      } else {
        throw new Error(`Failed to fetch users: ${usersRes.status}`);
      }

      // Fetch admin profile
      const profileRes = await fetch(`${API_BASE_URL}/auth/profile/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setAdminData({
          username: profileData.full_name || profileData.username || 'Admin',
          email: profileData.email,
          is_superuser: profileData.is_superuser || true
        });
      }
    } catch (error) {
      handleApiError(error, 'fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      const token = localStorage.getItem('access');
      if (!token) return;

      // Fixed: Use correct withdrawals endpoint
      const res = await fetch(`${API_BASE_URL}/withdrawals/withdraw/pending/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const data = await res.json();
        // Also fetch approved and rejected withdrawals to show all
        const allWithdrawalsRes = await fetch(`${API_BASE_URL}/withdrawals/withdraw/all/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        let allWithdrawals = data; // Default to pending only
        if (allWithdrawalsRes.ok) {
          allWithdrawals = await allWithdrawalsRes.json();
        }

        // Ensure each withdrawal has a full user object
        const withdrawalsWithUser = await Promise.all(
          allWithdrawals.map(async (withdrawal) => {
            if (
              withdrawal.user &&
              (withdrawal.user.first_name || withdrawal.user.last_name || withdrawal.user.email || withdrawal.user.phone_number)
            ) {
              return withdrawal;
            }
            // If user info is missing, fetch it
            if (withdrawal.user && withdrawal.user.id) {
              try {
                const userRes = await fetch(`${API_BASE_URL}/auth/users/${withdrawal.user.id}/`, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                });
                if (userRes.ok) {
                  const userData = await userRes.json();
                  return { ...withdrawal, user: userData };
                }
              } catch (e) {
                // fallback to withdrawal as is
              }
            }
            return withdrawal;
          })
        );
        setWithdrawals(withdrawalsWithUser);
        setStats(prev => prev.map(stat => 
          stat.title === 'Pending Withdrawals' 
            ? { ...stat, value: withdrawalsWithUser.filter(w => w.status === 'pending').length.toString() }
            : stat
        ));
      } else if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("access");
        window.location.href = '/login';
      } else if (res.status === 404) {
        // If the endpoint doesn't exist, try alternative approach
        console.warn('Pending withdrawals endpoint not found, trying alternative...');
        // You could try a different endpoint or show empty state
        setWithdrawals([]);
      } else {
        throw new Error(`Failed to fetch withdrawals: ${res.status}`);
      }
    } catch (error) {
      handleApiError(error, 'fetch withdrawals');
    }
  };

  const handleBlockUser = async (userId, shouldBlock) => {
    const action = shouldBlock ? 'block' : 'unblock';
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('access');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      // Fixed: Use correct user block/unblock endpoint
      const endpoint = shouldBlock ? 'block' : 'unblock';
      const res = await fetch(`${API_BASE_URL}/auth/users/${userId}/${endpoint}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        // Update the user in the local state
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId 
              ? { ...user, is_active: !shouldBlock }
              : user
          )
        );
        alert(`User ${action}ed successfully`);
      } else if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("access");
        window.location.href = '/login';
      } else {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to ${action} user: ${res.status}`);
      }
    } catch (error) {
      handleApiError(error, `${action} user`);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawalAction = async (withdrawalId, action) => {
    if (!confirm(`Are you sure you want to ${action} this withdrawal?`)) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('access');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      // Fixed: Use correct withdrawal action endpoints
      const res = await fetch(`${API_BASE_URL}/withdrawals/withdraw/${action}/${withdrawalId}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        await fetchWithdrawals();
        alert(`Withdrawal ${action}d successfully`);
      } else if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("access");
        window.location.href = '/login';
      } else {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to ${action} withdrawal: ${res.status}`);
      }
    } catch (error) {
      handleApiError(error, `${action} withdrawal`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('access');
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      setProfileOpen(false);
      window.location.href = '/login';
    }
  };

  const WithdrawalsManagement = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search withdrawals..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Filter size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                disabled={loading}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <span className="text-sm text-gray-600">{filteredWithdrawals.length} of {withdrawals.length} withdrawals</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading && (
          <div className="col-span-full flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        {filteredWithdrawals.length === 0 && !loading ? (
          <div className="col-span-full text-center py-12">
            <DollarSign size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 text-lg">No withdrawals found</p>
          </div>
        ) : (
          filteredWithdrawals.map((withdrawal) => {
            // Ensure we fetch real user details
            const user = withdrawal.user || {};
            // Prefer full name, fallback to username, fallback to "Unknown User"
            const fullName = user.first_name && user.last_name
              ? `${user.first_name} ${user.last_name}`
              : user.first_name
                ? user.first_name
                : user.last_name
                  ? user.last_name
                  : user.username
                    ? user.username
                    : 'Unknown User';
            // Prefer email, fallback to username, fallback to "No email"
            const email = user.email
              ? user.email
              : user.username
                ? user.username
                : 'No email';
            // Prefer phone number, fallback to "No mobile"
            const phone = user.phone_number || 'No mobile';

            return (
              <div key={withdrawal.id} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {(user.first_name?.[0] || user.last_name?.[0] || user.username?.[0] || 'U').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{fullName}</p>
                    <p className="text-sm text-gray-600">{email}</p>
                    <p className="text-sm text-gray-600">{phone}</p>
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Amount</span>
                  <div className="text-xl font-bold text-gray-900">${withdrawal.amount}</div>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Status</span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ml-2 ${
                    withdrawal.status === 'approved' ? 'bg-green-100 text-green-800' : 
                    withdrawal.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {withdrawal.status === 'approved' ? <><CheckCircle size={12} className="mr-1" />Approved</> : 
                     withdrawal.status === 'rejected' ? <><XCircle size={12} className="mr-1" />Rejected</> : 
                     <><Clock size={12} className="mr-1" />Pending</>}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Date</span>
                  <div className="text-sm text-gray-700">{new Date(withdrawal.created_at).toLocaleDateString()}</div>
                </div>
                <div>
                  {withdrawal.status === 'pending' ? (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleWithdrawalAction(withdrawal.id, 'approve')}
                        disabled={loading}
                        className="px-3 py-1 text-xs font-medium rounded-md bg-green-100 text-green-700 hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleWithdrawalAction(withdrawal.id, 'reject')}
                        disabled={loading}
                        className="px-3 py-1 text-xs font-medium rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">No actions</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

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
              disabled={loading}
            />
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Filter size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                disabled={loading}
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

      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
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
                          {(
                            user.first_name?.[0] ||
                            user.last_name?.[0] ||
                            user.username?.[0] ||
                            'U'
                          ).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.first_name && user.last_name
                            ? `${user.first_name} ${user.last_name}`
                            : user.first_name
                              ? user.first_name
                              : user.last_name
                                ? user.last_name
                                : user.username
                                  ? user.username
                                  : 'Unknown User'}
                        </p>
                        <p className="text-sm text-gray-600">@{user.username || 'unknown'}</p>
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
                        onClick={() => handleBlockUser(user.id, user.is_active)}
                        disabled={loading}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          user.is_active ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {user.is_active ? 'Block' : 'Unblock'}
                      </button>
                      <button 
                        className="p-1 text-gray-400 hover:text-gray-600 rounded-md disabled:opacity-50"
                        disabled={loading}
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        className="p-1 text-gray-400 hover:text-gray-600 rounded-md disabled:opacity-50"
                        disabled={loading}
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && !loading && (
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
                <button key={item.id} onClick={() => { setActiveSection(item.id); setSidebarOpen(false); setSearchTerm(''); setFilterStatus('all'); }}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                          activeSection === item.id ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                        }`}>
                  <div className="flex items-center space-x-3">
                    <item.icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.count !== null && <span className={`text-xs px-2 py-1 rounded-full ${activeSection === item.id ? 'bg-blue-800 text-blue-200' : 'bg-slate-700 text-white'}`}>{item.count}</span>}
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

            {activeSection === 'users' ? <UsersManagement /> : 
             activeSection === 'withdrawals' ? <WithdrawalsManagement /> : (
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
                      {[
                        { type: 'user_registration', message: 'New user registration', time: '2 minutes ago' },
                        { type: 'withdrawal_request', message: 'Withdrawal request submitted', time: '5 minutes ago' },
                        { type: 'kyc_submission', message: 'KYC document submitted', time: '10 minutes ago' }
                      ].map((activity, i) => (
                        <div key={i} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                            {activity.type === 'user_registration' && <Users size={16} className="text-white" />}
                            {activity.type === 'withdrawal_request' && <DollarSign size={16} className="text-white" />}
                            {activity.type === 'kyc_submission' && <FileCheck size={16} className="text-white" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                            <p className="text-xs text-gray-600">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                      >
                        Approve KYC
                      </button>
                      <button 
                        className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                      >
                        Export Data
                      </button>
                      <button 
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                      >
                        Block User
                      </button>
                      <button 
                        className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                      >
                        Send Alert
                      </button>
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