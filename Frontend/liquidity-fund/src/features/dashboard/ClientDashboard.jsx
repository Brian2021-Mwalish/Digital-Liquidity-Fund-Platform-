import React, { useState, useEffect } from 'react';

const ClientDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [activeRentals, setActiveRentals] = useState([]);
  const [balance, setBalance] = useState(25000);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [notifications] = useState(3);

  // Sample data
  const currencies = [
    { code: 'CAD', name: 'Canadian Dollar', price: 100, icon: 'CAD', color: 'bg-red-500' },
    { code: 'AUD', name: 'Australian Dollar', price: 250, icon: 'AUD', color: 'bg-blue-500' },
    { code: 'GBP', name: 'British Pound Sterling', price: 500, icon: 'GBP', color: 'bg-blue-600' },
    { code: 'JPY', name: 'Japanese Yen', price: 750, icon: 'JPY', color: 'bg-red-600' },
    { code: 'EUR', name: 'Euro', price: 1000, icon: 'EUR', color: 'bg-blue-700' },
    { code: 'USD', name: 'US Dollar', price: 1200, icon: 'USD', color: 'bg-green-600' }
  ];

  const transactions = [
    { id: 1, type: 'Rental', currency: 'USD', amount: 1200, status: 'Completed', date: '2024-01-15', return: 2400 },
    { id: 2, type: 'Withdrawal', currency: 'EUR', amount: 2000, status: 'Pending', date: '2024-01-14', return: null },
    { id: 3, type: 'Rental', currency: 'GBP', amount: 500, status: 'Active', date: '2024-01-13', return: 1000 },
  ];

  // Timer component for active rentals
  const RentalTimer = ({ rental }) => {
    const [timeLeft, setTimeLeft] = useState(rental.timeLeft);
    const totalTime = 24 * 60 * 60; // 24 hours in seconds
    const progress = ((totalTime - timeLeft) / totalTime) * 100;

    useEffect(() => {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
      <div className="relative w-32 h-32 mx-auto">
        <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
        <svg className="w-full h-full spin-timer" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="8"
            strokeDasharray={`${progress * 2.83} 283`}
            strokeLinecap="round"
            className="pulse-glow"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-lg font-bold text-primary">{formatTime(timeLeft)}</div>
          <div className="text-sm text-muted-foreground">remaining</div>
        </div>
      </div>
    );
  };

  // Payment Modal Component
  const PaymentModal = () => (
    <div className={`fixed inset-0 z-50 ${showPaymentModal ? 'flex' : 'hidden'} items-center justify-center`}>
      <div className="fixed inset-0 bg-black/80" onClick={() => setShowPaymentModal(false)}></div>
      <div className="relative bg-background border rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
        <div className="mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span className="text-2xl font-bold">{selectedCurrency?.code}</span>
            Rent {selectedCurrency?.name}
          </h3>
        </div>
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-accent">KES {selectedCurrency?.price}</div>
            <div className="text-muted-foreground">Expected Return: KES {selectedCurrency?.price * 2}</div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">M-Pesa Phone Number</label>
            <input 
              type="text" 
              placeholder="254712345678" 
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                // Simulate payment process
                const newRental = {
                  id: Date.now(),
                  currency: selectedCurrency,
                  amount: selectedCurrency.price,
                  timeLeft: 24 * 60 * 60, // 24 hours
                  expectedReturn: selectedCurrency.price * 2
                };
                setActiveRentals([...activeRentals, newRental]);
                setShowPaymentModal(false);
                setActiveTab('rentals');
              }}
              className="btn-currency flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Pay with M-Pesa
            </button>
            <button 
              onClick={() => setShowPaymentModal(false)}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            >
              Cancel
            </button>
          </div>
        </div>
        <button 
          onClick={() => setShowPaymentModal(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <span className="sr-only">Close</span>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m18 6-12 12M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="text-left">
              <h1 className="text-3xl font-bold text-foreground">Welcome back, John!</h1>
              <p className="text-muted-foreground">Current Balance: <span className="text-2xl font-bold text-success">KES {balance.toLocaleString()}</span></p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="currency-card rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="flex flex-col space-y-1.5 p-6 pb-2">
                  <h3 className="text-sm text-muted-foreground">Active Rentals</h3>
                </div>
                <div className="p-6 pt-0">
                  <div className="text-2xl font-bold text-primary">{activeRentals.length}</div>
                  <p className="text-xs text-muted-foreground">Currently earning</p>
                </div>
              </div>

              <div className="currency-card rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="flex flex-col space-y-1.5 p-6 pb-2">
                  <h3 className="text-sm text-muted-foreground">Total Earnings</h3>
                </div>
                <div className="p-6 pt-0">
                  <div className="text-2xl font-bold text-success">KES 45,000</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </div>
              </div>

              <div className="currency-card rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="flex flex-col space-y-1.5 p-6 pb-2">
                  <h3 className="text-sm text-muted-foreground">Pending Withdrawals</h3>
                </div>
                <div className="p-6 pt-0">
                  <div className="text-2xl font-bold text-warning">KES 12,000</div>
                  <p className="text-xs text-muted-foreground">Available soon</p>
                </div>
              </div>
            </div>

            <div className="currency-card rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="text-2xl font-semibold leading-none tracking-tight">Today's Exchange Rates</h3>
              </div>
              <div className="p-6 pt-0">
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

            <div className="flex gap-4">
              <button 
                onClick={() => setActiveTab('rent')} 
                className="btn-primary-gradient flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/>
                </svg>
                Rent Currency Now
              </button>
              <button 
                onClick={() => setActiveTab('withdraw')} 
                className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 7h10v10"/><path d="m7 17 10-10"/>
                </svg>
                Withdraw Funds
              </button>
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
                <div key={currency.code} className="currency-card cursor-pointer rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-105" onClick={() => {
                  setSelectedCurrency(currency);
                  setShowPaymentModal(true);
                }}>
                  <div className="flex flex-col space-y-1.5 p-6 text-center">
                    <div className="text-4xl mb-2 font-bold">{currency.code}</div>
                    <h3 className="text-2xl font-semibold leading-none tracking-tight">{currency.name}</h3>
                    <p className="text-sm text-muted-foreground">{currency.code}</p>
                  </div>
                  <div className="p-6 pt-0 text-center">
                    <div className="text-2xl font-bold text-accent mb-2">KES {currency.price}</div>
                    <div className="text-sm text-muted-foreground mb-4">
                      Return: <span className="text-success font-medium">KES {currency.price * 2}</span>
                    </div>
                    <button className="btn-currency w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                      Rent Now
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
                    <div className="p-6 pt-6">
                      <div className="flex flex-col md:flex-row items-center gap-6">
                        <RentalTimer rental={rental} />
                        <div className="flex-1 text-center md:text-left">
                          <h3 className="text-xl font-bold mb-2">
                            {rental.currency.name} Rental
                          </h3>
                          <div className="space-y-1 text-sm">
                            <div>Investment: <span className="font-medium">KES {rental.amount}</span></div>
                            <div>Expected Return: <span className="font-medium text-success">KES {rental.expectedReturn}</span></div>
                            <div>Status: <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-warning text-warning-foreground">Active</span></div>
                          </div>
                        </div>
                        <button 
                          disabled={rental.timeLeft > 0}
                          className="min-w-[120px] inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                        >
                          {rental.timeLeft > 0 ? 'Waiting...' : 'Withdraw'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="currency-card rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-6 pt-6 text-center py-12">
                  <svg className="w-16 h-16 mx-auto mb-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/>
                  </svg>
                  <h3 className="text-xl font-medium mb-2">No Active Rentals</h3>
                  <p className="text-muted-foreground mb-6">Start renting currencies to see them here</p>
                  <button onClick={() => setActiveTab('rent')} className="btn-primary-gradient inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                    Start Renting
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 'withdraw':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Withdraw Funds</h2>
              <p className="text-muted-foreground">Withdraw your completed rental returns</p>
            </div>

            <div className="currency-card rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="text-2xl font-semibold leading-none tracking-tight">Available Balance</h3>
              </div>
              <div className="p-6 pt-0">
                <div className="text-3xl font-bold text-success mb-4">KES {balance.toLocaleString()}</div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">M-Pesa Phone Number</label>
                    <input 
                      type="text"
                      placeholder="254712345678" 
                      className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Amount to Withdraw</label>
                    <input 
                      type="text"
                      placeholder="Enter amount" 
                      className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <button className="btn-primary-gradient w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                    Withdraw to M-Pesa
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'history':
        return (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">Transaction History</h2>
                <p className="text-muted-foreground">View all your rental and withdrawal activities</p>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  <input 
                    type="text"
                    placeholder="Search transactions..." 
                    className="pl-10 w-full md:w-64 flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"/>
                  </svg>
                </button>
              </div>
            </div>

            <div className="currency-card rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr className="text-left">
                        <th className="p-4 font-medium">Type</th>
                        <th className="p-4 font-medium">Currency</th>
                        <th className="p-4 font-medium">Amount</th>
                        <th className="p-4 font-medium">Status</th>
                        <th className="p-4 font-medium">Date</th>
                        <th className="p-4 font-medium">Return</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="border-b last:border-b-0 hover:bg-muted/50">
                          <td className="p-4">
                            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                              tx.type === 'Rental' ? 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80' : 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80'
                            }`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="p-4 font-medium">{tx.currency}</td>
                          <td className="p-4">KES {tx.amount}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                              tx.status === 'Completed' ? 'bg-success text-success-foreground' :
                              tx.status === 'Active' ? 'bg-warning text-warning-foreground' : 'bg-muted text-muted-foreground'
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                          <td className="p-4 text-muted-foreground">{tx.date}</td>
                          <td className="p-4 text-success font-medium">
                            {tx.return ? `KES ${tx.return}` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );

      case 'support':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Support Center</h2>
              <p className="text-muted-foreground">Get help with your account and rentals</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="currency-card rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="flex flex-col space-y-1.5 p-6">
                  <h3 className="text-2xl font-semibold leading-none tracking-tight">Contact Us</h3>
                </div>
                <div className="p-6 pt-0">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Name</label>
                      <input 
                        type="text"
                        placeholder="Your full name" 
                        className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <input 
                        type="email"
                        placeholder="your@email.com" 
                        className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Message</label>
                      <textarea 
                        placeholder="How can we help you?" 
                        rows="4"
                        className="mt-1 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                    <button className="btn-primary-gradient w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                      Send Message
                    </button>
                  </div>
                </div>
              </div>

              <div className="currency-card rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="flex flex-col space-y-1.5 p-6">
                  <h3 className="text-2xl font-semibold leading-none tracking-tight">FAQ</h3>
                </div>
                <div className="p-6 pt-0">
                  <div className="space-y-4">
                    <div className="border rounded-lg">
                      <button className="w-full text-left p-4 hover:bg-muted/50">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">How does currency rental work?</span>
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m6 9 6 6 6-6"/>
                          </svg>
                        </div>
                      </button>
                    </div>
                    <div className="border rounded-lg">
                      <button className="w-full text-left p-4 hover:bg-muted/50">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">When will I receive my returns?</span>
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m6 9 6 6 6-6"/>
                          </svg>
                        </div>
                      </button>
                    </div>
                    <div className="border rounded-lg">
                      <button className="w-full text-left p-4 hover:bg-muted/50">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Is my investment secure?</span>
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m6 9 6 6 6-6"/>
                          </svg>
                        </div>
                      </button>
                    </div>
                    <div className="border rounded-lg">
                      <button className="w-full text-left p-4 hover:bg-muted/50">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">How do I withdraw my funds?</span>
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m6 9 6 6 6-6"/>
                          </svg>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-blue-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 sticky top-0 z-40 shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">RC</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              RentFlowCoin
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-muted rounded-full transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
              </svg>
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center">
                  <span className="text-secondary-foreground font-medium text-sm">J</span>
                </div>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </button>
              
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-background border rounded-lg shadow-lg z-50">
                  <div className="p-2">
                    <button className="w-full text-left px-3 py-2 hover:bg-muted rounded-md flex items-center gap-2">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                      Account
                    </button>
                    <button className="w-full text-left px-3 py-2 hover:bg-muted rounded-md flex items-center gap-2">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                      Settings
                    </button>
                    <div className="border-t my-1"></div>
                    <button className="w-full text-left px-3 py-2 hover:bg-muted rounded-md flex items-center gap-2 text-destructive">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-white/80 border-r sticky top-[73px] shadow-lg backdrop-blur-md">
          <nav className="p-4 space-y-2">
            {[
              { id: 'dashboard', icon: 'home', label: 'Dashboard' },
              { id: 'rent', icon: 'coins', label: 'Rent Currency' },
              { id: 'rentals', icon: 'clock', label: 'My Rentals' },
              { id: 'withdraw', icon: 'arrow-up', label: 'Withdraw Funds' },
              { id: 'history', icon: 'history', label: 'Transaction History' },
              { id: 'support', icon: 'help', label: 'Support' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-3 ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'hover:bg-blue-50 text-blue-700 hover:text-indigo-700'
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {item.icon === 'home' && (<><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></>)}
                  {item.icon === 'coins' && (<><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/></>)}
                  {item.icon === 'clock' && (<><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></>)}
                  {item.icon === 'arrow-up' && (<><path d="M7 7h10v10"/><path d="m7 17 10-10"/></>)}
                  {item.icon === 'history' && (<><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></>)}
                  {item.icon === 'help' && (<><circle cx="12" cy="12" r="10"/><path d="m9 9a3 3 0 0 1 5.12-2.12l1.02.48a1 1 0 0 1 .86 1.48V9a3 3 0 1 1-6 0V8a1 1 0 0 1 .86-1.48l1.02-.48A3 3 0 0 1 15 9"/><path d="M12 17h.01"/></>)}
                </svg>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {/* Card background update for main content */}
            <div className="bg-white/80 rounded-2xl shadow-xl p-6 backdrop-blur-md">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>

      <PaymentModal />
    </div>
  );
};

export default ClientDashboard;