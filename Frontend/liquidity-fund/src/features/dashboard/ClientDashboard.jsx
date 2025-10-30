import React, { useEffect, useState } from "react";
import Contact from "../../components/Contact";
import { Link } from 'react-router-dom';
import { API_BASE_URL } from "../../lib/api";
import { LayoutDashboard } from "lucide-react";
import { Wallet } from "lucide-react";
import { Coins } from "lucide-react";
import { FileText } from "lucide-react";
import { Users } from "lucide-react";
import { History } from "lucide-react";
import { Settings } from "lucide-react";
import { HelpCircle } from "lucide-react";
import { LogOut } from "lucide-react";
import { TrendingUp } from "lucide-react";
import { DollarSign } from "lucide-react";
import { Clock } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { X } from "lucide-react";
import { Loader } from "lucide-react";
import { Menu } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { CheckCircle } from "lucide-react";
import { Shield } from "lucide-react";
import { Activity } from "lucide-react";

const ClientDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [activeRentals, setActiveRentals] = useState([]);
  const [balance, setBalance] = useState(0);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [clientName, setClientName] = useState(localStorage.getItem('client_name') || '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [profile, setProfile] = useState(null);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [pendingReturns, setPendingReturns] = useState(0);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const token = localStorage.getItem('access');

  const currencies = [
    { code: 'CAD', name: 'Canadian Dollar', price: 100 },
    { code: 'AUD', name: 'Australian Dollar', price: 250 },
    { code: 'GBP', name: 'British Pound Sterling', price: 500 },
    { code: 'JPY', name: 'Japanese Yen', price: 750 },
    { code: 'EUR', name: 'Euro', price: 1000 },
    { code: 'USD', name: 'US Dollar', price: 1200 }
  ];

  const apiCall = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}/api/payments${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    return response;
  };

  const fetchBalance = async () => {
    try {
      const response = await apiCall('/balance/');
      if (response.ok) {
        const data = await response.json();
        setBalance(data.balance || 0);
      }
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const response = await apiCall('/history/');
      if (response.ok) {
        const data = await response.json();
        setPaymentHistory(data.payments || []);
      }
    } catch (error) {
      console.error('Failed to fetch payment history:', error);
    }
  };

  const fetchUserRentals = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/rentals/user-rentals/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setActiveRentals(data.rentals || []);
      }
    } catch (error) {
      console.error('Failed to fetch user rentals:', error);
    }
  };

  const initiateMpesaPayment = async (phone, currencyCode) => {
    try {
      const response = await apiCall('/mpesa/initiate/', {
        method: 'POST',
        body: JSON.stringify({
          phone: phone,
          currency: currencyCode
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Payment initiation failed');
      }
      return data;
    } catch (error) {
      throw error;
    }
  };

  const makePayment = async (currencyCode) => {
    try {
      const response = await apiCall('/make/', {
        method: 'POST',
        body: JSON.stringify({ currency: currencyCode })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Payment failed');
      }

      setBalance(data.new_balance);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(phone)) {
      setPhoneError('Phone number must start with 0 and be exactly 10 digits');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 10) value = value.slice(0, 10);
    setPhoneNumber(value);
    if (value.length === 10 && value.startsWith('0')) {
      setPhoneError('');
    } else if (value.length > 0) {
      setPhoneError('Phone must start with 0 and be 10 digits');
    }
  };

  const proceedPayment = async () => {
    setShowPinModal(false);
    setIsLoading(true);
    setPaymentStatus('Initiating M-Pesa payment...');

    try {
      const mpesaResult = await initiateMpesaPayment(phoneNumber, selectedCurrency.code);
      setPaymentStatus('Check your phone for M-Pesa prompt...');

      const initialBalance = balance;
      let attempts = 0;
      const pollInterval = setInterval(async () => {
        attempts++;
        await fetchBalance();
        if (balance !== initialBalance) {
          clearInterval(pollInterval);
          await fetchUserRentals();
          setShowPaymentModal(false);
          setActiveTab('rentals');
          setPaymentStatus('');
          setPhoneNumber('');
          fetchPaymentHistory();
          setIsLoading(false);
        } else if (attempts > 60) {
          clearInterval(pollInterval);
          setPaymentStatus('Payment timeout. Please try again.');
          setIsLoading(false);
        }
      }, 1000);

    } catch (error) {
      setPaymentStatus('Payment failed: ' + error.message);
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!validatePhone(phoneNumber)) return;
    setShowPinModal(true);
  };

  useEffect(() => {
    if (token) {
      fetchBalance();
      fetchPaymentHistory();
      fetchUserRentals();
      const fetchStats = async () => {
        try {
          const earningsRes = await fetch(`${API_BASE_URL}/api/payments/earnings/`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          const earningsData = earningsRes.ok ? await earningsRes.json() : {};
          setTotalEarnings(earningsData.total_earnings || 0);

          const returnsRes = await fetch(`${API_BASE_URL}/api/rentals/pending-returns/`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          const returnsData = returnsRes.ok ? await returnsRes.json() : {};
          setPendingReturns(returnsData.pending_returns || 0);
        } catch (error) {
          setTotalEarnings(0);
          setPendingReturns(0);
        }
      };
      fetchStats();
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      fetchBalance();
    }, 5000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('access');
      try {
        const res = await fetch(`${API_BASE_URL}/api/profile/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          if (data.full_name) setClientName(data.full_name);
          if (data.phone_number) setPhoneNumber(data.phone_number);
        } else {
          setProfile(null);
        }
      } catch (error) {
        setProfile(null);
      }
    };
    fetchProfile();
  }, []);

  const fetchMaintenance = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/support/maintenance/`);
      if (response.ok) {
        const data = await response.json();
        setIsMaintenance(data.maintenance_mode);
      }
    } catch (error) {
      console.error('Failed to fetch maintenance status:', error);
    }
  };

  useEffect(() => {
    fetchMaintenance();
  }, []);

  const StatCard = ({ title, value, subtitle, icon: Icon, gradient = false }) => (
    <div className={`${gradient ? 'bg-gradient-to-br from-green-600 to-emerald-600' : 'bg-white'} rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border ${gradient ? 'border-green-500' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between mb-3">
        <h3 className={`text-sm font-medium ${gradient ? 'text-white/90' : 'text-gray-600'}`}>{title}</h3>
        {Icon && <Icon className={`w-5 h-5 ${gradient ? 'text-white/80' : 'text-green-600'}`} />}
      </div>
      <div className={`text-3xl font-bold mb-1 ${gradient ? 'text-white' : 'text-gray-900'}`}>{value}</div>
      {subtitle && <p className={`text-sm ${gradient ? 'text-white/70' : 'text-gray-500'}`}>{subtitle}</p>}
    </div>
  );

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'rent', label: 'Rent Currency', icon: Coins },
    { id: 'rentals', label: 'My Rentals', icon: FileText },
    { id: 'referrals', label: 'Referrals', link: '/referrals', icon: Users },
    { id: 'history', label: 'Payment History', link: '/home', icon: History },
    { id: 'account', label: 'Account Settings', link: '/kyc', icon: Settings },
    { id: 'support', label: 'Support', icon: HelpCircle }
  ];

  const doubledMoney = activeRentals.reduce((sum, rental) => sum + (rental.expectedReturn || 0), 0);

  const renderContent = () => {
    switch (activeTab) {
      case 'wallet':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Wallet className="w-8 h-8 text-green-600" />
                <h2 className="text-3xl font-bold text-gray-900">Wallet</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard 
                title="Current Balance" 
                value={`KES ${balance.toLocaleString()}`} 
                icon={DollarSign}
                gradient={true}
              />
              <StatCard 
                title="Doubled Money" 
                value={`KES ${doubledMoney.toLocaleString()}`} 
                subtitle="Money doubled from rentals" 
                icon={TrendingUp}
              />
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
              <Link
                to="/withdraw"
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-all shadow-md hover:shadow-lg"
              >
                <ArrowUpRight className="w-5 h-5" />
                Withdraw Funds
              </Link>
            </div>
          </div>
        );

      case 'dashboard':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-600/90 text-white p-8 rounded-2xl shadow-2xl">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome back{clientName ? `, ${clientName}` : ''}!</h1>
              <div className="flex items-baseline gap-2">
                <span className="text-lg opacity-90">Current Balance:</span>
                <span className="text-4xl font-bold">KES {balance.toLocaleString()}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard 
                title="Active Rentals" 
                value={activeRentals.length} 
                subtitle="Currently earning" 
                icon={Coins}
              />
              <StatCard 
                title="Total Earnings" 
                value={`KES ${totalEarnings.toLocaleString()}`} 
                subtitle="This month" 
                icon={TrendingUp}
              />
              <StatCard 
                title="Pending Returns" 
                value={`KES ${pendingReturns.toLocaleString()}`} 
                subtitle="Expected returns" 
                icon={Clock}
              />
            </div>
          </div>
        );

      case 'rent':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2 text-gray-900">Rent Currency</h2>
                <p className="text-gray-600">Choose a currency to rent and double your investment in 20 days</p>
              </div>
              <Coins className="w-8 h-8 text-green-600 hidden md:block" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {currencies.map((currency, index) => {
                const gradients = [
                  'from-green-500 to-emerald-500',
                  'from-emerald-500 to-teal-500',
                  'from-teal-500 to-green-600',
                  'from-green-600 to-emerald-600',
                  'from-emerald-600 to-teal-600',
                  'from-teal-600 to-green-700'
                ];
                return (
                  <div 
                    key={currency.code} 
                    className="bg-white border border-gray-200 rounded-2xl p-6 text-center hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group"
                    onClick={() => { setSelectedCurrency(currency); setShowPaymentModal(true); }}
                  >
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${gradients[index]} flex items-center justify-center shadow-lg`}>
                      <span className="text-2xl font-bold text-white">{currency.code[0]}</span>
                    </div>
                    <div className="text-3xl mb-2 font-bold text-gray-900">{currency.code}</div>
                    <h3 className="text-base font-medium text-gray-600 mb-4">{currency.name}</h3>
                    <div className="text-4xl font-bold text-green-600 mb-2">KES {currency.price}</div>
                    <div className="text-sm text-gray-600 mb-6">
                      Return: <span className="text-emerald-600 font-semibold text-lg">KES {currency.price * 2}</span>
                    </div>
                    <button className={`w-full bg-gradient-to-r ${gradients[index]} text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all group-hover:scale-105`}>
                      Pay with M-Pesa
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'rentals':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2 text-gray-900">My Rentals</h2>
                <p className="text-gray-600">Track your active and completed currency rentals</p>
              </div>
              <FileText className="w-8 h-8 text-green-600 hidden md:block" />
            </div>
            {activeRentals.length > 0 ? (
              <div className="space-y-4">
                {activeRentals.map((rental) => (
                  <div key={rental.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                      <div className="flex-shrink-0 text-center lg:text-left">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-600 mb-3">
                          <span className="text-2xl font-bold text-white">{rental.currency}</span>
                        </div>
                        <div className="text-sm font-medium text-gray-600">
                          Status: <span className={`${rental.status === 'active' ? 'text-green-600' : 'text-emerald-600'} font-semibold`}>{rental.status}</span>
                        </div>
                        {rental.status === 'active' && (
                          <div className="mt-3 flex flex-col items-center">
                            <div className="animate-spin">
                              <Loader className="w-8 h-8 text-green-600" />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Money doubling...</p>
                            <p className="text-xs text-green-600 font-medium mt-1">ID: {rental.unique_id}</p>
                            {(() => {
                              const startDate = new Date(rental.start_date);
                              const endDate = new Date(rental.end_date);
                              const now = new Date();
                              const totalDuration = endDate - startDate;
                              const elapsed = now - startDate;
                              const progress = Math.min((elapsed / totalDuration) * 100, 100);
                              return (
                                <div className="w-full mt-3">
                                  <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                                    <div
                                      className="bg-gradient-to-r from-green-600 to-emerald-600 h-2 rounded-full transition-all duration-1000"
                                      style={{ width: `${progress}%` }}
                                    ></div>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1 text-center">
                                    {Math.round(progress)}% complete
                                  </p>
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Investment</div>
                          <div className="text-xl font-bold text-gray-900">KES {rental.amount}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Expected Return</div>
                          <div className="text-xl font-bold text-green-600">KES {rental.expected_return}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Duration</div>
                          <div className="text-lg font-medium text-gray-900">{rental.duration_days} days</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">End Date</div>
                          <div className="text-lg font-medium text-gray-900">{new Date(rental.end_date).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-lg">
                <Coins className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2 text-gray-900">No Active Rentals</h3>
                <p className="text-gray-600 mb-6">Start renting currencies to see them here</p>
                <button 
                  onClick={() => setActiveTab('rent')} 
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition-all shadow-md hover:shadow-lg"
                >
                  Start Renting
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        );

      case 'history':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2 text-gray-900">Payment History</h2>
                <p className="text-gray-600">View all your payment transactions</p>
              </div>
              <History className="w-8 h-8 text-green-600 hidden md:block" />
            </div>
            {paymentHistory.length > 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Currency</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paymentHistory.map((payment, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-900">{new Date(payment.created_at).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">{payment.currency}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">KES {payment.amount}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              payment.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {payment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-lg">
                <History className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2 text-gray-900">No Payment History</h3>
                <p className="text-gray-600">Your payment transactions will appear here</p>
              </div>
            )}
          </div>
        );

      case 'support':
        return <Contact isDashboard={true} />;

      default:
        return null;
    }
  };

  if (!profile) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader className="w-12 h-12 animate-spin text-green-600" />
        <p className="text-gray-600">Loading profile...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-green-600 via-emerald-600 to-green-600/90 backdrop-blur-sm shadow-lg">
        <div className="px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Menu className="w-6 h-6 text-white" />
            </button>
            <div className="w-12 h-12 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/20">
              <span className="text-white font-bold text-xl">RC</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white">RentFlowCoin</h1>
          </div>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = '/login';
            }}
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-medium transition-all shadow-md"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <div className="flex gap-6 p-4 md:p-6 max-w-[1600px] mx-auto">
        {/* Floating Sidebar - Desktop */}
        <aside className={`hidden lg:block w-72 flex-shrink-0`}>
          <div className="sticky top-24 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                  {clientName ? clientName[0].toUpperCase() : 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{clientName || 'User'}</div>
                  <div className="text-sm text-gray-500">Client Account</div>
                </div>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => (
                  item.link ? (
                    <Link
                      key={item.id}
                      to={item.link}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-gray-600 hover:text-gray-900 hover:bg-gray-50 group"
                    >
                      <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  ) : (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                        activeTab === item.id 
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      } group`}
                    >
                      <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span>{item.label}</span>
                    </button>
                  )
                ))}
              </nav>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="fixed left-4 top-20 bottom-4 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 lg:hidden overflow-hidden">
              <div className="p-6 h-full overflow-y-auto">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                    {clientName ? clientName[0].toUpperCase() : 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">{clientName || 'User'}</div>
                    <div className="text-sm text-gray-500">Client Account</div>
                  </div>
                </div>
                <nav className="space-y-1">
                  {navItems.map((item) => (
                    item.link ? (
                      <Link
                        key={item.id}
                        to={item.link}
                        onClick={() => setSidebarOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-gray-600 hover:text-gray-900 hover:bg-gray-50 group"
                      >
                        <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    ) : (
                      <button
                        key={item.id}
                        onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                          activeTab === item.id 
                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        } group`}
                      >
                        <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span>{item.label}</span>
                      </button>
                    )
                  ))}
                </nav>
              </div>
            </aside>
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {isMaintenance && (
            <div className="bg-red-500 text-white p-4 rounded-xl mb-6 text-center font-semibold shadow-lg">
              System is under maintenance
            </div>
          )}
          {renderContent()}
        </main>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-300 relative">
            <button 
              onClick={() => setShowPaymentModal(false)} 
              className="absolute right-4 top-4 p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{selectedCurrency?.code}</span>
              </div>
              <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">
                Rent {selectedCurrency?.name}
              </h3>
            </div>
            <div className="space-y-6">
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="text-4xl font-bold text-green-600 mb-2">KES {selectedCurrency?.price}</div>
                <div className="text-sm text-gray-600">
                  Expected Return: <span className="text-emerald-600 font-semibold text-lg">KES {selectedCurrency?.price * 2}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Phone Number</label>
                <input
                  type="tel"
                  placeholder="07XXXXXXXX"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  className="w-full px-4 py-3 border border-gray-300 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                />
                {phoneError && <p className="text-red-600 text-xs mt-2 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-600"></span>
                  {phoneError}
                </p>}
                <p className="text-xs text-gray-500 mt-2">Enter your 10-digit M-Pesa number</p>
              </div>
              {paymentStatus && (
                <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                  {isLoading && <Loader className="inline-block animate-spin w-5 h-5 text-green-600 mr-2" />}
                  <span className="text-sm text-gray-900 font-medium">{paymentStatus}</span>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handlePayment}
                  disabled={isLoading || !phoneNumber || phoneNumber.length !== 10}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                >
                  {isLoading ? 'Processing...' : 'Pay with M-Pesa'}
                </button>
                <button 
                  onClick={() => setShowPaymentModal(false)} 
                  className="px-6 py-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-300">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Confirm Payment</h3>
            </div>
            <div className="space-y-6">
              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 text-center">
                <p className="text-gray-900 font-medium">Please enter your M-Pesa PIN on your phone when prompted.</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={proceedPayment}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  OK, I'm Ready
                </button>
                <button 
                  onClick={() => setShowPinModal(false)} 
                  className="px-6 py-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;