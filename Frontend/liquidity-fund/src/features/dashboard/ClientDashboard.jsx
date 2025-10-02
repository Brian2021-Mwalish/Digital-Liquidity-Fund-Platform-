import React, { useEffect, useState } from "react";
import KYCForm from "../auth/KYCForm";
import { Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const ClientDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
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

  const token = localStorage.getItem('access'); // always use 'access' token

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

  const handlePayment = async () => {
    if (!validatePhone(phoneNumber)) return;
    
    setIsLoading(true);
    setPaymentStatus('Initiating M-Pesa payment...');
    
    try {
      const mpesaResult = await initiateMpesaPayment(phoneNumber, selectedCurrency.code);
      setPaymentStatus('Check your phone for M-Pesa prompt...');
      
      setTimeout(async () => {
        try {
          setPaymentStatus('Processing rental...');
          const paymentResult = await makePayment(selectedCurrency.code);
          
          const newRental = {
            id: Date.now(),
            currency: selectedCurrency,
            amount: selectedCurrency.price,
            expectedReturn: selectedCurrency.price * 2,
            status: 'active'
          };
          
          setActiveRentals([...activeRentals, newRental]);
          setShowPaymentModal(false);
          setActiveTab('rentals');
          setPaymentStatus('');
          setPhoneNumber('');
          fetchBalance();
          fetchPaymentHistory();
        } catch (error) {
          setPaymentStatus('Payment processing failed: ' + error.message);
        }
      }, 3000);
      
    } catch (error) {
      setPaymentStatus('Payment failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchBalance();
      fetchPaymentHistory();
      // Fetch stats from backend
      const fetchStats = async () => {
        try {
          // Example: replace with your actual endpoints
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

  // Polling for balance updates every 5 seconds
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      fetchBalance();
    }, 5000); // 5 seconds
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('access'); // always use 'access' token
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
          // Optionally update clientName and phoneNumber from profile
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

  const StatCard = ({ title, value, subtitle, bgColor = "bg-white" }) => (
    <div className={`${bgColor} border border-gray-200 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all`}>
      <h3 className="text-sm text-gray-600 mb-2 font-medium">{title}</h3>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'wallet', label: 'Wallet' },
    { id: 'rent', label: 'Rent Currency' },
    { id: 'rentals', label: 'My Rentals' },
    { id: 'referrals', label: 'Referrals', link: '/referrals' },
    { id: 'history', label: 'Payment History', link: '/home' },
    { id: 'support', label: 'Support', link: '/contact' }

  ];

  const doubledMoney = activeRentals.reduce((sum, rental) => sum + (rental.expectedReturn || 0), 0);

  const renderContent = () => {
    switch (activeTab) {
      case 'wallet':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Wallet</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard title="Current Balance" value={`KES ${balance.toLocaleString()}`} bgColor="bg-green-50 border-green-200" />
              <StatCard title="Doubled Money" value={`KES ${doubledMoney.toLocaleString()}`} subtitle="Money doubled from rentals" bgColor="bg-emerald-50 border-emerald-200" />
            </div>
            <div className="mt-6">
              <Link 
                to="/withdraw" 
                className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-all"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                Withdraw Funds
              </Link>
            </div>
          </div>
        );

      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white p-6 rounded-xl shadow-lg">
              <h1 className="text-3xl font-bold">Welcome back{clientName ? `, ${clientName}` : ''}!</h1>
              <p className="mt-2">Current Balance: <span className="text-2xl font-bold">KES {balance.toLocaleString()}</span></p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Active Rentals" value={activeRentals.length} subtitle="Currently earning" bgColor="bg-yellow-50 border-yellow-200" />
              <StatCard title="Total Earnings" value={`KES ${totalEarnings.toLocaleString()}`} subtitle="This month" bgColor="bg-green-50 border-green-200" />
              <StatCard title="Pending Returns" value={`KES ${pendingReturns.toLocaleString()}`} subtitle="Expected returns" bgColor="bg-emerald-50 border-emerald-200" />
            </div>
          </div>
        );

      case 'rent':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-2 text-gray-800">Rent Currency</h2>
              <p className="text-gray-600">Choose a currency to rent and double your investment in 24 hours</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currencies.map((currency, index) => {
                const colors = ['bg-green-500', 'bg-emerald-500', 'bg-teal-500', 'bg-green-600', 'bg-emerald-600', 'bg-teal-600'];
                return (
                  <div key={currency.code} className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 text-center hover:shadow-xl hover:scale-105 transition-all cursor-pointer" 
                       onClick={() => { setSelectedCurrency(currency); setShowPaymentModal(true); }}>
                    <div className="text-4xl mb-3 font-bold text-gray-800">{currency.code}</div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">{currency.name}</h3>
                    <div className="text-3xl font-bold text-green-600 mb-2">KES {currency.price}</div>
                    <div className="text-sm text-gray-600 mb-4">
                      Return: <span className="text-green-600 font-semibold">KES {currency.price * 2}</span>
                    </div>
                    <button className={`w-full ${colors[index]} text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-all`}>
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
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-2 text-gray-800">My Rentals</h2>
              <p className="text-gray-600">Track your active and completed currency rentals</p>
            </div>
            {activeRentals.length > 0 ? (
              <div className="space-y-4">
                {activeRentals.map((rental) => (
                  <div key={rental.id} className="bg-white border border-gray-200 rounded-xl shadow-lg p-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="text-center">
                        <div className="text-xl font-bold text-gray-800">{rental.currency.name}</div>
                        <div className="text-sm text-green-600 font-medium">Status: Active</div>
                      </div>
                      <div className="flex-1 text-center md:text-left">
                        <div className="space-y-1 text-sm">
                          <div className="text-gray-600">Investment: <span className="font-medium text-gray-800">KES {rental.amount}</span></div>
                          <div className="text-gray-600">Expected Return: <span className="font-medium text-green-600">KES {rental.expectedReturn}</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-12 text-center">
                <h3 className="text-xl font-medium mb-2 text-gray-800">No Active Rentals</h3>
                <p className="text-gray-600 mb-6">Start renting currencies to see them here</p>
                <button onClick={() => setActiveTab('rent')} className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-all">
                  Start Renting
                </button>
              </div>
            )}
          </div>
        );

      case 'history':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-2 text-gray-800">Payment History</h2>
              <p className="text-gray-600">View all your payment transactions</p>
            </div>
            {paymentHistory.length > 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Currency</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paymentHistory.map((payment, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">{new Date(payment.created_at).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{payment.currency}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">KES {payment.amount}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
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
              <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-12 text-center">
                <h3 className="text-xl font-medium mb-2 text-gray-800">No Payment History</h3>
                <p className="text-gray-600">Your payment transactions will appear here</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (!profile) return <div>Loading profile...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header with green gradient */}
      <header className="bg-gradient-to-r from-green-900 via-emerald-900 to-teal-900 border-b border-gray-800 shadow-2xl sticky top-0 z-40">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">RC</span>
            </div>
            <h1 className="text-2xl font-bold text-white">RentFlowCoin</h1>
          </div>
          <div className="flex items-center gap-6">
            <button className="relative p-2 hover:bg-white/10 rounded-full transition-colors">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5-5-5h5V3h0z"/>
              </svg>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
            </button>
            <div className="relative">
              <button onClick={() => setShowProfileDropdown(!showProfileDropdown)} className="flex items-center gap-2 p-2 hover:bg-white/10 rounded-lg transition-colors">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">U</span>
                </div>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-2">
                  <button className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg text-gray-700 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                    <Link
                                to="/kyc"
                                className="bg-gradient-to-r from-green-500 to-green-400 hover:from-green-600 hover:to-green-400 text-white px-6 py-3 rounded-lg font-semibold transition shadow w-full md:w-auto text-center"
                              >
                                Account
                     </Link>
                  </button>
                  <button onClick={() => window.location.href = '/login'} className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg text-red-600 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1"/>
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 shadow-sm">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              item.link ? (
                <Link 
                  key={item.id} 
                  to={item.link}
                  className="w-full text-left px-4 py-3 rounded-xl transition-all font-medium hover:bg-gray-100 text-gray-700 block"
                >
                  {item.label}
                </Link>
              ) : (
                <button 
                  key={item.id} 
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium ${
                    activeTab === item.id ? 'bg-green-600 text-white shadow-lg' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {item.label}
                </button>
              )
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl relative">
            <button onClick={() => setShowPaymentModal(false)} className="absolute right-4 top-4 text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              <span className="text-2xl font-bold text-green-600">{selectedCurrency?.code}</span> Rent {selectedCurrency?.name}
            </h3>
            <div className="space-y-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">KES {selectedCurrency?.price}</div>
                <div className="text-gray-600">Expected Return: <span className="text-green-600 font-medium">KES {selectedCurrency?.price * 2}</span></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  placeholder="07........" 
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                />
                {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
                <p className="text-xs text-gray-500 mt-1">Enter your 10-digit phone number starting with 0</p>
              </div>
              {paymentStatus && (
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  {isLoading && <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>}
                  <span className="text-sm text-gray-700">{paymentStatus}</span>
                </div>
              )}
              <div className="flex gap-3">
                <button 
                  onClick={handlePayment}
                  disabled={isLoading || !phoneNumber || phoneNumber.length !== 10}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium disabled:opacity-50 hover:bg-green-700 transition-all"
                >
                  {isLoading ? 'Processing...' : 'Pay with M-Pesa'}
                </button>
                <button onClick={() => setShowPaymentModal(false)} className="border border-gray-300 bg-white hover:bg-gray-50 py-3 px-4 rounded-lg text-gray-700">
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