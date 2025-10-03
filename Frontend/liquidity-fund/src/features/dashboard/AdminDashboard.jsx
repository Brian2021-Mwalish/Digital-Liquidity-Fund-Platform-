import React, { useState, useEffect } from 'react';
import {
  Search, Bell, ChevronDown, Menu, X, BarChart3, Users, Home, CreditCard,
  FileCheck, MessageSquare, Settings, Shield, Activity, LogOut, UserX,
  CheckCircle, Eye, Filter, MoreHorizontal, DollarSign, Clock, Check, XCircle
} from 'lucide-react';
import { apiFetch } from '../../lib/api';


const AdminDashboard = () => {
  // State and constants
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [profileOpen, setProfileOpen] = useState(false);
  const [adminData, setAdminData] = useState({ username: 'Admin', email: 'admin@example.com', is_superuser: true });
  const [users, setUsers] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredWithdrawals, setFilteredWithdrawals] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState([
    { title: 'Total Users', value: '0', change: '+12%', positive: true },
    { title: 'Pending Withdrawals', value: '0', change: '+5%', positive: true },
    { title: 'Total Withdrawals', value: '0', change: '+0%', positive: true },
    { title: 'Total Wallet Balance', value: 'Ksh 0', change: '+10%', positive: true },
    { title: 'Monthly Revenue', value: '$0', change: '+18%', positive: true },
    { title: 'Pending KYC', value: '0', change: '-3%', positive: false },
    { title: 'Total Referrals', value: '0', change: '+0%', positive: true }
  ]);
  const [kycForms, setKycForms] = useState([]);
  const [kycLoading, setKycLoading] = useState(true);
  const API_BASE_URL = 'http://127.0.0.1:8000/api';
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3, count: null },
    { id: 'users', label: 'Users', icon: Users, count: users.length },
    { id: 'withdrawals', label: 'Withdrawals', icon: DollarSign, count: withdrawals.filter(w => w.status === 'pending').length },
    { id: 'referrals', label: 'Referrals', icon: CheckCircle, count: referrals.length },
    { id: 'rentals', label: 'Rentals', icon: Home, count: 89 },
    { id: 'transactions', label: 'Transactions', icon: CreditCard, count: null },
    { id: 'kyc', label: 'KYC Verifications', icon: FileCheck, count: 12 },
    { id: 'support', label: 'Support', icon: MessageSquare, count: 7 },
    { id: 'settings', label: 'Settings', icon: Settings, count: null },
    { id: 'audit', label: 'Audit Logs', icon: Shield, count: null }
  ];

  // API and handler functions
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
      const usersRes = await apiFetch(`${API_BASE_URL}/auth/users/`);
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        const usersArray = Array.isArray(usersData) ? usersData : usersData.results || [];
        setUsers(usersArray);
        const totalWalletBalance = usersArray.reduce((sum, user) => sum + parseFloat(user.wallet_balance || 0), 0);
        setStats(prev => prev.map(stat =>
          stat.title === 'Total Users'
            ? { ...stat, value: usersArray.length.toString() }
            : stat.title === 'Total Wallet Balance'
            ? { ...stat, value: `Ksh ${totalWalletBalance.toFixed(2)}` }
            : stat
        ));
      } else if (usersRes.status === 401 || usersRes.status === 403) {
        localStorage.removeItem("access");
        window.location.href = '/login';
        return;
      } else {
        throw new Error(`Failed to fetch users: ${usersRes.status}`);
      }
      const profileRes = await apiFetch(`${API_BASE_URL}/auth/profile/`);
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
      const res = await apiFetch(`${API_BASE_URL}/withdrawals/withdraw/pending/`);
      if (res.ok) {
        const data = await res.json();
        const allWithdrawalsRes = await apiFetch(`${API_BASE_URL}/withdrawals/withdraw/all/`);
        let allWithdrawals = data;
        if (allWithdrawalsRes.ok) {
          allWithdrawals = await allWithdrawalsRes.json();
        }
        // Enrich withdrawals with user data from users array to avoid individual fetches
        const withdrawalsWithUser = allWithdrawals.map(withdrawal => {
          if (
            withdrawal.user &&
            (withdrawal.user.first_name || withdrawal.user.last_name || withdrawal.user.email || withdrawal.user.phone_number)
          ) {
            return withdrawal;
          }
          if (withdrawal.user && withdrawal.user.id) {
            const userData = users.find(u => u.id === withdrawal.user.id);
            if (userData) {
              return { ...withdrawal, user: userData };
            }
          }
          return withdrawal;
        });
        setWithdrawals(withdrawalsWithUser);
        setStats(prev => prev.map(stat =>
          stat.title === 'Pending Withdrawals'
            ? { ...stat, value: withdrawalsWithUser.filter(w => w.status === 'pending').length.toString() }
            : stat.title === 'Total Withdrawals'
            ? { ...stat, value: withdrawalsWithUser.length.toString() }
            : stat
        ));
      } else if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("access");
        window.location.href = '/login';
      } else if (res.status === 404) {
        setWithdrawals([]);
      } else {
        throw new Error(`Failed to fetch withdrawals: ${res.status}`);
      }
    } catch (error) {
      handleApiError(error, 'fetch withdrawals');
    }
  };

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access');
      if (!token) {
        window.location.href = '/login';
        return;
      }
      const res = await apiFetch(`${API_BASE_URL}/auth/referrals/admin/`);
      if (res.ok) {
        const data = await res.json();
        setReferrals(data.referral_relationships || []);
        setStats(prev => prev.map(stat =>
          stat.title === 'Total Referrals'
            ? { ...stat, value: (data.total_referrals || 0).toString() }
            : stat
        ));
      }
    } catch (error) {
      handleApiError(error, 'fetch referrals');
    } finally {
      setLoading(false);
    }
  };

  // Fetch KYC forms for admin verification
  const fetchKycForms = async () => {
    setKycLoading(true);
    const res = await apiFetch(`${API_BASE_URL}/auth/kyc/all/`);
    if (res.ok) {
      const data = await res.json();
      setKycForms(data.kyc_forms || []);
    }
    setKycLoading(false);
  };

  // Verify KYC form
  const handleVerifyKyc = async (kycId) => {
    const res = await apiFetch(`${API_BASE_URL}/auth/kyc/${kycId}/verify/`, {
      method: "POST"
    });
    if (res.ok) {
      setKycForms(forms =>
        forms.map(f => f.id === kycId ? { ...f, status: "verified" } : f)
      );
      alert("KYC verified!");
    } else {
      alert("Failed to verify KYC.");
    }
  };

  const handleBlockUser = async (userId, shouldBlock) => {
    const action = shouldBlock ? 'block' : 'unblock';
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;
    try {
      setLoading(true);
      const endpoint = shouldBlock ? 'block' : 'unblock';
      const res = await apiFetch(`${API_BASE_URL}/auth/users/${userId}/${endpoint}/`, {
        method: 'POST'
      });
      if (res.ok) {
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
      const res = await apiFetch(`${API_BASE_URL}/withdrawals/withdraw/${action}/${withdrawalId}/`, {
        method: 'POST'
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

  const handleAwardWallet = async (userId) => {
    if (!window.confirm('Award Ksh50 to this user?')) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('access');
      const res = await fetch(`http://127.0.0.1:8000/api/auth/users/${userId}/award-wallet/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount: 50 })
      });
      if (res.ok) {
        alert('Awarded Ksh50!');
        // Update user's wallet_balance locally immediately
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.id === userId
              ? { ...user, wallet_balance: (parseFloat(user.wallet_balance) || 0) + 50 }
              : user
          )
        );
        // Update total wallet balance stat
        setStats(prevStats => {
          const totalWalletStat = prevStats.find(stat => stat.title === 'Total Wallet Balance');
          const totalWalletValue = totalWalletStat ? parseFloat(totalWalletStat.value.replace(/[^\d.-]/g, '')) : 0;
          const newTotal = totalWalletValue + 50;
          return prevStats.map(stat =>
            stat.title === 'Total Wallet Balance'
              ? { ...stat, value: `Ksh ${newTotal.toFixed(2)}` }
              : stat
          );
        });
      } else {
        alert('Failed to award wallet.');
      }
    } catch (e) {
      alert('Error awarding wallet.');
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

  useEffect(() => {
    const initializeData = async () => {
      await fetchUsers();
      await fetchWithdrawals();
      fetchReferrals();
      fetchKycForms();
    };
    initializeData();
  }, []);

  useEffect(() => {
    if (activeSection === 'withdrawals') {
      setFilterStatus('pending');
    } else if (activeSection === 'users') {
      setFilterStatus('all');
    }
  }, [activeSection]);
  // Referrals Management Section
  const ReferralsManagement = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-green-700 mb-4">All Referral Records</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-green-50 border-b border-green-200">
              <tr>
                <th className="text-left py-4 px-6 font-medium text-green-900">Referrer</th>
                <th className="text-left py-4 px-6 font-medium text-green-900">Referred User</th>
                <th className="text-left py-4 px-6 font-medium text-green-900">Date</th>
                <th className="text-left py-4 px-6 font-medium text-green-900">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-green-200">
              {referrals.length === 0 && (
                <tr><td colSpan={4} className="text-center py-8 text-green-600">No referral records found</td></tr>
              )}
              {referrals.map((ref, idx) => (
                <tr key={idx} className="hover:bg-green-50 transition-colors">
                  <td className="py-4 px-6">{ref.referrer_email || ref.referrer_full_name || 'Unknown'}</td>
                  <td className="py-4 px-6">{ref.referred_email || ref.referred_full_name || 'Unknown'}</td>
                  <td className="py-4 px-6">{ref.created_at ? new Date(ref.created_at).toLocaleDateString() : '-'}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${ref.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {ref.completed ? 'Completed' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

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
                <option value="paid">Paid</option>
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        )}
        {filteredWithdrawals.length === 0 && !loading ? (
          <div className="col-span-full text-center py-12">
            <DollarSign size={48} className="mx-auto text-green-300 mb-4" />
            <p className="text-green-600 text-lg">No withdrawals found</p>
          </div>
        ) : (
          filteredWithdrawals.map((withdrawal) => {
            const fullName = withdrawal.user_name || 'Unknown User';
            const email = withdrawal.user_email || 'No email';
            const userPhone = withdrawal.user_phone_number || 'No user phone';
            const withdrawalMobile = withdrawal.mobile_number || 'No withdrawal mobile';

            return (
              <div key={withdrawal.id} className="bg-white rounded-xl shadow-md border border-green-200 p-6 flex flex-col space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {(withdrawal.user_name?.[0] || 'U').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-green-900">{fullName}</p>
                    <p className="text-sm text-green-700">User Phone: {userPhone}</p>
                    <p className="text-sm text-green-700">Withdrawal Mobile: {withdrawalMobile}</p>
                    <p className="text-sm text-green-700">Email: {email}</p>
                  </div>
                </div>
                <div>
                  <span className="text-green-500 text-xs">Amount Requested</span>
                  <div className="text-xl font-bold text-green-900">Ksh {withdrawal.amount}</div>
                </div>
                <div>
                  <span className="text-green-500 text-xs">Status</span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ml-2 ${
                    withdrawal.status === 'approved' ? 'bg-green-100 text-green-800' :
                    withdrawal.status === 'paid' ? 'bg-blue-100 text-blue-800' :
                    withdrawal.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {withdrawal.status === 'approved' ? <><CheckCircle size={12} className="mr-1" />Approved</> :
                     withdrawal.status === 'paid' ? <><CheckCircle size={12} className="mr-1" />Paid</> :
                     withdrawal.status === 'rejected' ? <><XCircle size={12} className="mr-1" />Rejected</> :
                     <><Clock size={12} className="mr-1" />Pending</>}
                  </span>
                </div>
                <div>
                  <span className="text-green-500 text-xs">Created At</span>
                  <div className="text-sm text-green-700">{new Date(withdrawal.created_at).toLocaleDateString()}</div>
                </div>
                {withdrawal.processed_at && (
                  <div>
                    <span className="text-green-500 text-xs">Processed At</span>
                    <div className="text-sm text-green-700">{new Date(withdrawal.processed_at).toLocaleDateString()}</div>
                  </div>
                )}
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
                      <button
                        onClick={() => handleWithdrawalAction(withdrawal.id, 'paid')}
                        disabled={loading}
                        className="px-3 py-1 text-xs font-medium rounded-md bg-green-700 text-white hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Paid
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm text-green-500">No actions</span>
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-green-50 border-b border-green-200">
              <tr>
                <th className="text-left py-4 px-6 font-medium text-green-900">User</th>
                <th className="text-left py-4 px-6 font-medium text-green-900">Email</th>
                <th className="text-left py-4 px-6 font-medium text-green-900">Wallet</th>
                <th className="text-left py-4 px-6 font-medium text-green-900">Status</th>
                <th className="text-left py-4 px-6 font-medium text-green-900">Joined</th>
                <th className="text-left py-4 px-6 font-medium text-green-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-green-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-green-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
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
                        <p className="font-medium text-green-900">
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
                        <p className="text-sm text-green-700">@{user.username || 'unknown'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-green-900">{user.email}</td>
                  <td className="py-4 px-6 text-green-900 font-bold">Ksh {user.wallet_balance}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active ? <><CheckCircle size={12} className="mr-1" />Active</> : <><UserX size={12} className="mr-1" />Blocked</>}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-green-700">{new Date(user.date_joined).toLocaleDateString()}</td>
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
                        className="p-1 text-green-400 hover:text-green-600 rounded-md disabled:opacity-50"
                        disabled={loading}
                        onClick={() => handleAwardWallet(user.id)}
                      >
                        Award 50
                      </button>
                      <button 
                        className="p-1 text-green-400 hover:text-green-600 rounded-md disabled:opacity-50"
                        disabled={loading}
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        className="p-1 text-green-400 hover:text-green-600 rounded-md disabled:opacity-50"
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
            <Users size={48} className="mx-auto text-green-300 mb-4" />
            <p className="text-green-600 text-lg">No users found</p>
          </div>
        )}


        </div>
      </div>
    );

  // KYC Management Section
  const KycManagement = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-green-700 mb-6">KYC Verification</h2>
      {kycLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {kycForms.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Shield size={48} className="mx-auto text-green-300 mb-4" />
              <p className="text-green-600 text-lg">No KYC forms found</p>
            </div>
          )}
          {kycForms.map(form => (
            <div
              key={form.id}
              className="bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100 rounded-2xl shadow-lg border border-green-200 p-6 flex flex-col space-y-4"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {(form.full_name?.[0] || 'U').toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-green-900 text-lg">{form.full_name}</p>
                  <p className="text-sm text-green-700">{form.email}</p>
                  <p className="text-sm text-green-700">Mobile: {form.mobile}</p>
                </div>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-green-500 text-xs">National ID</span>
                <span className="font-medium text-green-800">{form.national_id}</span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-green-500 text-xs">Address</span>
                <span className="font-medium text-green-800">{form.address}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                  form.status === "verified"
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                }`}>
                  {form.status === "verified" ? <CheckCircle size={14} className="mr-1" /> : <Shield size={14} className="mr-1" />}
                  {form.status}
                </span>
                <span className="text-xs text-green-700 ml-2">
                  {form.date_submitted ? new Date(form.date_submitted).toLocaleDateString() : ""}
                </span>
              </div>
              {form.status !== "verified" && (
                <button
                  className="mt-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg font-bold shadow hover:from-green-600 hover:to-emerald-600 transition"
                  onClick={() => handleVerifyKyc(form.id)}
                >
                  Verify
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-green-50 flex">
      {/* Sidebar */}
      <aside className={`bg-white shadow-lg w-64 min-h-screen p-6 transition-all duration-300 ${sidebarOpen ? '' : 'hidden md:block'}`}>
        <div className="flex items-center justify-between mb-8">
          <span className="text-2xl font-bold text-green-700">Admin</span>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}><X size={24} /></button>
        </div>
        <nav className="space-y-2">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`w-full flex items-center px-4 py-2 rounded-lg text-green-900 hover:bg-green-100 transition-colors font-medium ${activeSection === item.id ? 'bg-green-100' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <item.icon size={20} className="mr-3" />
              {item.label}
              {item.count !== null && <span className="ml-auto text-xs bg-green-200 text-green-800 rounded-full px-2 py-0.5">{item.count}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-green-700">Admin Dashboard</h1>
            <p className="text-green-600">Welcome, {adminData.username}</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-medium" onClick={handleLogout}><LogOut size={18} className="inline mr-2" />Logout</button>
          </div>
        </div>

        {/* Section Content */}
        {activeSection === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-md p-6 border border-green-200 flex flex-col items-start">
                <span className="text-green-500 text-xs font-medium mb-2">{stat.title}</span>
                <span className="text-2xl font-bold text-green-900">{stat.value}</span>
                <span className={`mt-2 text-sm font-medium ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>{stat.change}</span>
              </div>
            ))}
          </div>
        )}
        {activeSection === 'users' && <UsersManagement />}
        {activeSection === 'withdrawals' && <WithdrawalsManagement />}
        {activeSection === 'referrals' && <ReferralsManagement />}
        {activeSection === 'kyc' && <KycManagement />}
      </main>
    </div>
  );
};

export default AdminDashboard;