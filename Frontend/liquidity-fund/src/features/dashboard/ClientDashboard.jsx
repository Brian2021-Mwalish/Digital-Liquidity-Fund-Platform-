import React, { useState, useEffect } from 'react';
import KYCForm from '../auth/KYCForm';
import { useSessionTracker } from '@/hooks/useSessionTracker';

const ClientDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [activeRentals, setActiveRentals] = useState([]);
  const [balance, setBalance] = useState(25000);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [notifications] = useState(3);
  const [clientName, setClientName] = useState(localStorage.getItem('client_name') || '');

  const token = localStorage.getItem('token') || localStorage.getItem('jwt');
  const { sessions, fetchSessions, updateActivity, error } = useSessionTracker(token);

  useEffect(() => {
    const fetchName = async () => {
      if (!token) return;
      try {
        const { apiFetch } = await import('../../lib/api');
        const res = await apiFetch('/api/user/accounts/me/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.name || data.full_name) {
          const name = data.name || data.full_name || '';
          setClientName(name);
          localStorage.setItem('client_name', name);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    const handleActivity = () => updateActivity();
    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll'];
    
    if (token) {
      fetchName();
      activityEvents.forEach(event => window.addEventListener(event, handleActivity));
    }

    return () => {
      activityEvents.forEach(event => window.removeEventListener(event, handleActivity));
    };
  }, [token, updateActivity]);

  const currencies = [
    { code: 'CAD', name: 'Canadian Dollar', price: 100, color: 'bg-red-500' },
    { code: 'AUD', name: 'Australian Dollar', price: 250, color: 'bg-blue-500' },
    { code: 'GBP', name: 'British Pound Sterling', price: 500, color: 'bg-blue-600' },
    { code: 'JPY', name: 'Japanese Yen', price: 750, color: 'bg-red-600' },
    { code: 'EUR', name: 'Euro', price: 1000, color: 'bg-blue-700' },
    { code: 'USD', name: 'US Dollar', price: 1200, color: 'bg-green-600' }
  ];

  const currencyColorMap = {
    'bg-red-500': '#ef4444', 'bg-blue-500': '#3b82f6', 'bg-blue-600': '#2563eb',
    'bg-red-600': '#dc2626', 'bg-blue-700': '#1d4ed8', 'bg-green-600': '#16a34a'
  };

  const RentalTimer = ({ rental }) => {
    const [timeLeft, setTimeLeft] = useState(rental.timeLeft);
    const totalTime = 24 * 60 * 60;
    const progress = ((totalTime - timeLeft) / totalTime) * 100;

    useEffect(() => {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev <= 0 ? 0 : prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const mainColor = currencyColorMap[rental.currency.color] || '#2563eb';

    return (
      <div className="relative w-52 h-52 mx-auto">
        <div className="absolute inset-0 rounded-full border-8 border-muted"></div>
        <svg className="w-full h-full animate-spin-slow" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke={mainColor} strokeWidth="16"
                  strokeDasharray={`${progress * 2.83} 283`} strokeLinecap="round"
                  style={{ filter: `drop-shadow(0 0 16px ${mainColor})`, transition: 'stroke-dasharray 0.3s' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold text-primary">{formatTime(timeLeft)}</div>
          <div className="text-lg text-muted-foreground">remaining</div>
        </div>
      </div>
    );
  };

  const PaymentModal = () => (
    showPaymentModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/80" onClick={() => setShowPaymentModal(false)}></div>
        <div className="relative bg-gradient-to-br from-green-50 via-white to-green-200 border-2 border-green-500 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
          <button onClick={() => setShowPaymentModal(false)} className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m18 6-12 12M6 6l12 12"/>
            </svg>
          </button>
          <h3 className="text-lg font-semibold mb-4">
            <span className="text-2xl font-bold">{selectedCurrency?.code}</span> Rent {selectedCurrency?.name}
          </h3>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">KES {selectedCurrency?.price}</div>
              <div className="text-muted-foreground">Expected Return: KES {selectedCurrency?.price * 2}</div>
            </div>
            <input type="text" placeholder="254712345678" className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm" />
            <div className="flex gap-2">
              <button onClick={() => {
                const newRental = {
                  id: Date.now(),
                  currency: selectedCurrency,
                  amount: selectedCurrency.price,
                  timeLeft: 24 * 60 * 60,
                  expectedReturn: selectedCurrency.price * 2
                };
                setActiveRentals([...activeRentals, newRental]);
                setShowPaymentModal(false);
                setActiveTab('rentals');
              }} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md">
                Pay with M-Pesa
              </button>
              <button onClick={() => setShowPaymentModal(false)} className="border border-input bg-background hover:bg-accent h-10 px-4 py-2 rounded-md">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );

  const StatCard = ({ title, value, subtitle, className = "" }) => (
    <div className={`currency-card rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>
      <div className="p-6">
        <h3 className="text-sm text-muted-foreground mb-2">{title}</h3>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );

  const navItems = [
    { id: 'dashboard', icon: 'home', label: 'Dashboard' },
    { id: 'wallet', icon: 'wallet', label: 'Wallet' },
    { id: 'rent', icon: 'coins', label: 'Rent Currency' },
    { id: 'rentals', icon: 'clock', label: 'My Rentals' },
    { id: 'withdraw', icon: 'arrow-up', label: 'Withdraw Funds', link: '/withdraw' },
    { id: 'history', icon: 'history', label: 'Transaction History', link: '/home' },
    { id: 'support', icon: 'help', label: 'Support' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'wallet':
        const doubledMoney = activeRentals.reduce((sum, rental) => sum + (rental.expectedReturn || 0), 0);
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-foreground">Wallet</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard title="Current Balance" value={`KES ${balance.toLocaleString()}`} className="text-success" />
              <StatCard title="Doubled Money" value={`KES ${doubledMoney.toLocaleString()}`} 
                       subtitle="Money that has been doubled from rentals" className="text-primary" />
            </div>
          </div>
        );

      case 'dashboard':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Welcome back{clientName ? `, ${clientName}` : ''}!</h1>
              <p className="text-muted-foreground">Current Balance: <span className="text-2xl font-bold text-success">KES {balance.toLocaleString()}</span></p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Active Rentals" value={activeRentals.length} subtitle="Currently earning" className="text-primary" />
              <StatCard title="Total Earnings" value="KES 45,000" subtitle="This month" className="text-success" />
              <StatCard title="Pending Withdrawals" value="KES 12,000" subtitle="Available soon" className="text-warning" />
            </div>
            <div className="currency-card rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="p-6">
                <h3 className="text-2xl font-semibold mb-4">Today's Exchange Rates</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {currencies.slice(0, 3).map((currency) => (
                    <div key={currency.code} className="flex items-center gap-2 p-2 rounded border">
                      <span className="text-xl font-bold">{currency.code}</span>
                      <div>
                        <div className="font-medium">{currency.code}</div>
                        <div className="text-sm text-muted-foreground">1 {currency.code} = KES {(currency.price / 10).toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'rent':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Rent Currency</h2>
              <p className="text-muted-foreground">Choose a currency to rent and double your investment in 24 hours</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currencies.map((currency) => (
                <div key={currency.code} className="currency-card cursor-pointer rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-105" 
                     onClick={() => { setSelectedCurrency(currency); setShowPaymentModal(true); }}>
                  <div className="p-6 text-center">
                    <div className="text-4xl mb-2 font-bold">{currency.code}</div>
                    <h3 className="text-2xl font-semibold">{currency.name}</h3>
                    <div className="text-2xl font-bold text-accent mb-2 mt-4">KES {currency.price}</div>
                    <div className="text-sm text-muted-foreground mb-4">
                      Return: <span className="text-success font-medium">KES {currency.price * 2}</span>
                    </div>
                    <button className="w-full bg-gradient-to-r from-green-500 via-green-600 to-green-400 text-white shadow-lg hover:scale-105 h-12 px-4 py-2 border-2 border-green-600 rounded-md font-bold">
                      Pay with M-Pesa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'rentals':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">My Rentals</h2>
              <p className="text-muted-foreground">Track your active and completed currency rentals</p>
            </div>
            {activeRentals.length > 0 ? (
              <div className="grid gap-6">
                {activeRentals.map((rental) => (
                  <div key={rental.id} className="currency-card rounded-lg border bg-card text-card-foreground shadow-sm">
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row items-center gap-6">
                        <RentalTimer rental={rental} />
                        <div className="flex-1 text-center md:text-left">
                          <h3 className="text-xl font-bold mb-2">{rental.currency.name} Rental</h3>
                          <div className="space-y-1 text-sm">
                            <div>Investment: <span className="font-medium">KES {rental.amount}</span></div>
                            <div>Expected Return: <span className="font-medium text-success">KES {rental.expectedReturn}</span></div>
                            <div>Status: <span className="bg-warning text-warning-foreground px-2 py-1 rounded text-xs">Active</span></div>
                          </div>
                        </div>
                        <button disabled={rental.timeLeft > 0} className="min-w-[120px] border border-input bg-background hover:bg-accent h-10 px-4 py-2 rounded-md disabled:opacity-50">
                          {rental.timeLeft > 0 ? 'Waiting...' : 'Withdraw'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="currency-card rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-6 text-center py-12">
                  <svg className="w-16 h-16 mx-auto mb-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/>
                  </svg>
                  <h3 className="text-xl font-medium mb-2">No Active Rentals</h3>
                  <p className="text-muted-foreground mb-6">Start renting currencies to see them here</p>
                  <button onClick={() => setActiveTab('rent')} className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md">
                    Start Renting
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('token');
    localStorage.removeItem('client_name');
    window.location.href = '/login';
  };

  return (
    <div className="fixed inset-0 w-full h-full min-h-screen bg-gradient-to-br from-blue-200 via-indigo-100 to-blue-400 flex flex-col">
      <header className="border-b bg-blue-900 sticky top-0 z-40 shadow-lg w-full">
        <div className="w-full px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-800 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xl">RC</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-wide">RentFlowCoin</h1>
          </div>
          <div className="flex items-center gap-6">
            <button className="relative p-2 hover:bg-blue-800 rounded-full transition-colors">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
              </svg>
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>
            <div className="relative">
              <button onClick={() => setShowProfileDropdown(!showProfileDropdown)} className="flex items-center gap-2 p-2 hover:bg-blue-800 rounded-lg transition-colors">
                <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">J</span>
                </div>
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </button>
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-blue-900 border border-blue-700 rounded-lg shadow-lg z-50">
                  <div className="p-2">
                    <button onClick={() => { setShowProfileDropdown(false); setShowProfileModal(true); }} className="w-full text-left px-3 py-2 hover:bg-blue-800 rounded-md flex items-center gap-2 text-white">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                      Account
                    </button>
                    <button onClick={handleLogout} className="w-full text-left px-3 py-2 hover:bg-blue-800 rounded-md flex items-center gap-2 text-red-400">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" x2="9" y1="12" y2="12"/>
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <aside className="w-64 bg-gradient-to-b from-blue-100 via-indigo-50 to-blue-200 border-r shadow-lg">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => item.link ? window.location.href = item.link : setActiveTab(item.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-3 ${
                        activeTab === item.id ? 'bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-400 text-white shadow-lg border border-blue-400'
                                             : 'hover:bg-blue-100 text-blue-700 hover:text-indigo-700 border border-transparent'
                      }`}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {/* Simplified icon rendering */}
                  {item.icon === 'home' && <><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></>}
                  {item.icon === 'wallet' && <><rect x="4" y="7" width="16" height="9" rx="2"/><circle cx="16" cy="12" r="1.5"/></>}
                  {item.icon === 'coins' && <><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/></>}
                  {item.icon === 'clock' && <><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></>}
                  {item.icon === 'arrow-up' && <><path d="M7 7h10v10"/><path d="m7 17 10-10"/></>}
                  {item.icon === 'history' && <><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></>}
                  {item.icon === 'help' && <><circle cx="12" cy="12" r="10"/><path d="M12 17h.01"/></>}
                </svg>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 overflow-auto">
          <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-100 shadow-2xl p-6 border border-blue-200 h-full">
            {renderContent()}
          </div>
        </main>
      </div>

      <PaymentModal />
      {showProfileModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60">
          <div className="bg-white border border-blue-200 shadow-2xl rounded-2xl w-full max-w-xl relative">
            <button onClick={() => setShowProfileModal(false)} className="absolute -right-5 -top-5 p-2 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white hover:scale-105">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <KYCForm />
          </div>
        </div>
      )}
    </div>
  );
};

// Add spin animation if not exists
if (typeof document !== 'undefined' && !document.getElementById('spin-slow-style')) {
  const style = document.createElement('style');
  style.id = 'spin-slow-style';
  style.innerHTML = '.animate-spin-slow { animation: spin 2s linear infinite; } @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
  document.head.appendChild(style);
}

export default ClientDashboard;