import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

function getTrendPath(data, w, h, pad=30) {
  if (!data.length) return '';
  const max = Math.max(...data.map(d => d.amount));
  const min = Math.min(...data.map(d => d.amount));
  const points = data.map((d, i) => {
    const x = pad + (w-pad*2) * i/(data.length-1);
    const y = h - pad - ((d.amount-min)/(max-min||1)) * (h-pad*2);
    return `${x},${y}`;
  });
  return 'M ' + points.join(' L ');
}

const Home = () => {
  const [transactions, setTransactions] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [earningHistory, setEarningHistory] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileResponse = await apiFetch('/api/profile/');
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setProfile(profileData);
        }

        const paymentsResponse = await apiFetch('/api/payments/history/');
        const paymentsData = await paymentsResponse.json();
        const formattedTransactions = paymentsData.payments.map(payment => ({
          id: payment.id,
          type: payment.amount_deducted > 0 ? 'Deposit' : 'Withdraw',
          amount: Math.abs(payment.amount_deducted),
          date: new Date(payment.created_at).toLocaleDateString(),
          created_at: payment.created_at,
          method: 'M-Pesa'
        }));
        setTransactions(formattedTransactions);

        const referralsResponse = await apiFetch('/api/referrals/history/');
        const referralsData = await referralsResponse.json();
        const formattedReferrals = referralsData.map(ref => ({
          id: ref.id,
          referred_name: ref.referred_name || 'N/A',
          email: ref.referred_email,
          mobile: ref.mobile || 'N/A',
          date: new Date(ref.created_at).toLocaleDateString(),
          status: ref.status,
          reward: ref.reward
        }));
        setReferrals(formattedReferrals);
      } catch (error) {
        console.error('Error fetching data:', error);
        setTransactions([]);
        setReferrals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (transactions.length > 0) {
      const deposits = transactions.filter(tx => tx.type === 'Deposit').sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      let cumulative = 0;
      const history = deposits.map(tx => {
        cumulative += tx.amount;
        return { date: tx.created_at, amount: cumulative };
      });
      setEarningHistory(history);
    }
  }, [transactions]);

  const totalEarnings = earningHistory[earningHistory.length-1]?.amount || 0;
  const graphW = 400, graphH = 200;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 overflow-x-hidden">
      {/* Back Button - Fixed Position */}
      <div className="fixed left-4 top-4 z-50 md:left-6 md:top-6">
        <Link
          to="/client-dashboard"
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-4 py-2.5 md:px-5 md:py-3 rounded-xl shadow-lg font-semibold text-sm md:text-base transition-all duration-200 transform hover:scale-105 active:scale-95"
        >
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Dashboard</span>
          <span className="sm:hidden">Back</span>
        </Link>
      </div>

      {/* Main Content Container */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 max-w-7xl">
        {/* Welcome Section */}
        {profile && (
          <div className="mb-8 text-center">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-6 rounded-2xl shadow-xl mb-6">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                Welcome back, {profile.first_name} {profile.last_name}!
              </h2>
              <div className="flex items-center justify-center gap-2 text-green-100">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                </svg>
                <span className="font-medium text-lg">{profile.email}</span>
              </div>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <div className="text-center mb-10 md:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-green-800 leading-tight">
            Welcome to Liquidity Fund
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-green-700 max-w-3xl mx-auto">
            Your trusted platform to manage deposits, withdrawals, and fund history with ease and transparency.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10 md:mb-12 max-w-4xl mx-auto">
          <Link
            to="/deposit"
            className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 active:from-green-800 active:to-green-700 text-white px-6 py-4 rounded-xl font-bold text-base md:text-lg transition-all duration-200 transform hover:scale-105 hover:shadow-xl active:scale-95 text-center shadow-lg"
          >
            Deposit via M-Pesa
          </Link>
          <Link
            to="/withdraw"
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 active:from-green-700 active:to-emerald-700 text-white px-6 py-4 rounded-xl font-bold text-base md:text-lg transition-all duration-200 transform hover:scale-105 hover:shadow-xl active:scale-95 text-center shadow-lg"
          >
            Withdraw Funds
          </Link>
          <Link
            to="/client-dashboard"
            className="bg-white hover:bg-green-50 active:bg-green-100 text-green-700 border-2 border-green-600 px-6 py-4 rounded-xl font-bold text-base md:text-lg transition-all duration-200 transform hover:scale-105 hover:shadow-xl active:scale-95 text-center shadow-lg sm:col-span-2 lg:col-span-1"
          >
            My Dashboard
          </Link>
        </div>

        {/* Earnings History Card */}
        <div className="bg-white p-6 md:p-8 mb-8 rounded-2xl shadow-xl border-2 border-green-200">
          <h2 className="text-2xl md:text-3xl font-bold text-green-800 mb-2">Your Earnings History & Trends</h2>
          <p className="mb-6 text-sm md:text-base text-green-600">See how you have been earning and gaining over time.</p>
          
          {/* Chart Container */}
          <div className="w-full flex flex-col items-center mb-6">
            <div className="w-full max-w-2xl overflow-x-auto">
              <svg width={graphW} height={graphH} viewBox={`0 0 ${graphW} ${graphH}`} className="mb-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 shadow-md w-full min-w-[400px]">
                <defs>
                  <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity="0.8"/>
                    <stop offset="50%" stopColor="#16a34a" stopOpacity="0.4"/>
                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0.1"/>
                  </linearGradient>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#16a34a"/>
                    <stop offset="50%" stopColor="#22c55e"/>
                    <stop offset="100%" stopColor="#15803d"/>
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                {/* Grid Lines */}
                {[0, 1, 2, 3, 4].map(i => (
                  <g key={i}>
                    <line 
                      x1={30} 
                      x2={graphW-30} 
                      y1={30 + i * ((graphH-60)/4)} 
                      y2={30 + i * ((graphH-60)/4)} 
                      stroke="#d1fae5" 
                      strokeWidth="1" 
                      strokeDasharray="2,2"
                    />
                  </g>
                ))}
                
                {/* Axes */}
                <line x1={30} x2={graphW-30} y1={graphH-30} y2={graphH-30} stroke="#10b981" strokeWidth="2"/>
                <line x1={30} x2={30} y1={30} y2={graphH-30} stroke="#10b981" strokeWidth="2"/>
                
                {/* Area Fill */}
                <path 
                  d={getTrendPath(earningHistory, graphW, graphH) + ` L ${graphW-30},${graphH-30} L 30,${graphH-30} Z`} 
                  fill="url(#areaGradient)" 
                  stroke="none"
                  opacity="0.7"
                />
                
                {/* Trend Line */}
                <path 
                  d={getTrendPath(earningHistory, graphW, graphH)} 
                  fill="none" 
                  stroke="url(#lineGradient)" 
                  strokeWidth="3" 
                  filter="url(#glow)"
                />
                
                {/* Data Points */}
                {earningHistory.map((d,i) => {
                  const x = 30 + (graphW-60)*i/(earningHistory.length-1);
                  const max = Math.max(...earningHistory.map(e => e.amount));
                  const min = Math.min(...earningHistory.map(e => e.amount));
                  const y = graphH-30 - ((d.amount-min)/(max-min||1))*(graphH-60);
                  return (
                    <g key={i}>
                      <circle 
                        cx={x} 
                        cy={y} 
                        r={6} 
                        fill="#22c55e" 
                        stroke="#16a34a" 
                        strokeWidth="3" 
                        className="hover:r-8 transition-all duration-200 cursor-pointer"
                        filter="url(#glow)"
                      />
                      <circle 
                        cx={x} 
                        cy={y} 
                        r={3} 
                        fill="#ffffff" 
                        stroke="none"
                      />
                    </g>
                  );
                })}
                
                {/* Date Labels */}
                {earningHistory.map((d, i) => {
                  const x = 30 + (graphW-60)*i/(earningHistory.length-1);
                  return (
                    <g key={i}>
                      <text 
                        x={x} 
                        y={graphH-14} 
                        textAnchor="middle" 
                        fontSize="10" 
                        fill="#166534" 
                        fontWeight="500"
                      >
                        {formatDate(d.date)}
                      </text>
                    </g>
                  );
                })}
                
                {/* Y-axis Labels */}
                {[0, 1, 2, 3, 4].map(i => {
                  const max = Math.max(...earningHistory.map(e => e.amount)) || 0;
                  const value = Math.round((max / 4) * i);
                  return (
                    <text 
                      key={i} 
                      x={20} 
                      y={graphH-25 - i * ((graphH-60)/4)} 
                      textAnchor="end" 
                      fontSize="9" 
                      fill="#166534" 
                      fontWeight="500"
                    >
                      {value.toLocaleString()}
                    </text>
                  );
                })}
                
                {/* Current Total Display */}
                <g>
                  <rect 
                    x={graphW-120} 
                    y={graphH-70} 
                    width="90" 
                    height="25" 
                    fill="#22c55e" 
                    rx="12" 
                    ry="12" 
                    opacity="0.9"
                  />
                  <text 
                    x={graphW-75} 
                    y={graphH-53} 
                    textAnchor="middle" 
                    fontSize="11" 
                    fill="#ffffff" 
                    fontWeight="bold"
                  >
                    KES {totalEarnings.toLocaleString()}
                  </text>
                </g>
                
                {/* Chart Title */}
                <text 
                  x={graphW/2} 
                  y={20} 
                  textAnchor="middle" 
                  fontSize="14" 
                  fill="#166534" 
                  fontWeight="bold"
                >
                  Deposit Growth Over Time
                </text>
              </svg>
            </div>
            
            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mb-4">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                <div className="flex items-center gap-3">
                  <div className="bg-white bg-opacity-20 rounded-full p-2">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-green-100 text-sm font-medium mb-1">Total Deposits</p>
                    <p className="text-2xl md:text-3xl font-bold">KES {totalEarnings.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-700 to-green-600 text-white px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                <div className="flex items-center gap-3">
                  <div className="bg-white bg-opacity-20 rounded-full p-2">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-green-100 text-sm font-medium mb-1">Total Withdrawals</p>
                    <p className="text-2xl md:text-3xl font-bold">KES {transactions.filter(tx => tx.type === 'Withdraw').reduce((sum, tx) => sum + tx.amount, 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-emerald-600 to-green-700 text-white px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                <div className="flex items-center gap-3">
                  <div className="bg-white bg-opacity-20 rounded-full p-2">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-green-100 text-sm font-medium mb-1">Net Balance</p>
                    <p className="text-2xl md:text-3xl font-bold">KES {(totalEarnings - transactions.filter(tx => tx.type === 'Withdraw').reduce((sum, tx) => sum + tx.amount, 0)).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History Card */}
        <div className="bg-white p-6 md:p-8 mb-8 rounded-2xl shadow-xl border-2 border-green-200">
          <h2 className="text-2xl md:text-3xl font-bold text-green-800 mb-6">Your Transaction History</h2>
          {transactions.length === 0 ? (
            <p className="text-center text-green-600 py-8">No transactions available.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border-2 border-green-100">
              <table className="w-full min-w-[600px]">
                <thead className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                  <tr>
                    <th className="px-4 py-4 text-left font-semibold">Date</th>
                    <th className="px-4 py-4 text-left font-semibold">Type</th>
                    <th className="px-4 py-4 text-left font-semibold">Amount (KES)</th>
                    <th className="px-4 py-4 text-left font-semibold">Method</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-green-100 hover:bg-green-50 transition-colors">
                      <td className="px-4 py-4 text-gray-700">{tx.date}</td>
                      <td className={`px-4 py-4 font-bold ${tx.type === 'Deposit' ? 'text-green-600' : 'text-red-500'}`}>
                        {tx.type}
                      </td>
                      <td className="px-4 py-4 text-gray-700 font-semibold">{tx.amount}</td>
                      <td className="px-4 py-4 text-gray-700">{tx.method}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Referrals History Card */}
        <div className="bg-white p-6 md:p-8 mb-8 rounded-2xl shadow-xl border-2 border-green-200">
          <h2 className="text-2xl md:text-3xl font-bold text-green-800 mb-6">Your Referrals History</h2>
          
          {/* Referral Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium mb-1">Total Referrals</p>
                  <p className="text-3xl md:text-4xl font-bold">{referrals.length}</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-full p-3">
                  <svg className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-600 to-green-700 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium mb-1">Completed</p>
                  <p className="text-3xl md:text-4xl font-bold">{referrals.filter(r => r.status === 'completed').length}</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-full p-3">
                  <svg className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-600 to-green-700 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium mb-1">Total Earnings</p>
                  <p className="text-3xl md:text-4xl font-bold">{referrals.reduce((sum, r) => sum + r.reward, 0)} KES</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-full p-3">
                  <svg className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.51-1.31c-.562-.649-1.413-1.076-2.353-1.253V5z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Referrals Table */}
          {referrals.length > 0 && (
            <div className="overflow-x-auto rounded-xl border-2 border-green-100">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                  <tr>
                    <th className="p-4 text-left font-semibold">Referred User</th>
                    <th className="p-4 text-left font-semibold">Email</th>
                    <th className="p-4 text-left font-semibold">Mobile</th>
                    <th className="p-4 text-left font-semibold">Date</th>
                    <th className="p-4 text-center font-semibold">Status</th>
                    <th className="p-4 text-right font-semibold">Reward</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((ref) => (
                    <tr key={ref.id} className="border-b border-green-100 hover:bg-green-50 transition-colors">
                      <td className="p-4 font-semibold text-gray-800">{ref.referred_name}</td>
                      <td className="p-4 text-gray-600">{ref.email}</td>
                      <td className="p-4 text-gray-600">{ref.mobile}</td>
                      <td className="p-4 text-gray-600">{ref.date}</td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${ref.status === 'completed' ? 'bg-green-100 text-green-800 border-2 border-green-300' : 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300'}`}>
                          {ref.status}
                        </span>
                      </td>
                      <td className="p-4 text-right text-green-700 font-bold text-lg">{ref.reward} KES</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Investment Guide Card */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border-2 border-green-200">
          <h2 className="text-2xl md:text-3xl font-bold text-green-800 mb-6">Investment Guide</h2>
          <div className="space-y-4 md:space-y-6">
            {[
              {
                num: 1,
                title: 'Create Your Account',
                desc: 'Sign up for a free account on our platform. Provide your basic information and verify your email to get started.'
              },
              {
                num: 2,
                title: 'Complete KYC Verification',
                desc: 'Submit your identification documents for Know Your Customer (KYC) verification to unlock full platform features.'
              },
              {
                num: 3,
                title: 'Fund Your Wallet',
                desc: 'Deposit funds into your wallet using M-Pesa. Choose from various currency options and top up securely.'
              },
              {
                num: 4,
                title: 'Start Investing',
                desc: 'Browse available investment opportunities and allocate your funds to start earning returns on your investments.'
              },
              {
                num: 5,
                title: 'Monitor and Withdraw',
                desc: 'Track your investment performance and withdraw your earnings whenever you need them through our secure platform.'
              }
            ].map((step) => (
              <div key={step.num} className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 md:p-6 rounded-xl border-2 border-green-200 hover:border-green-400 hover:shadow-lg transition-all duration-200">
                <div className="flex items-start space-x-3 md:space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-600 to-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-lg md:text-xl shadow-lg">
                    {step.num}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base md:text-lg font-bold text-green-800 mb-2">{step.title}</h3>
                    <p className="text-sm md:text-base text-gray-700 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;