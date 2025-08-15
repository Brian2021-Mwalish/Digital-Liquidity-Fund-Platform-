import React from 'react';
import { Link } from 'react-router-dom';

const earningHistory = [
  { date: '2024-05-01', amount: 5000 },
  { date: '2024-05-08', amount: 8000 },
  { date: '2024-05-15', amount: 11000 },
  { date: '2024-05-22', amount: 18000 },
  { date: '2024-05-29', amount: 26000 },
  { date: '2024-06-05', amount: 35000 },
  { date: '2024-06-12', amount: 43000 },
  { date: '2024-06-19', amount: 48000 },
  { date: '2024-06-26', amount: 55000 },
];

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
  const totalUsers = 1052;
  const totalEarnings = earningHistory[earningHistory.length-1].amount;
  const avgEarnings = Math.round(totalEarnings/totalUsers);
  const graphW = 400, graphH = 200;

  return (
    <div className="fixed inset-0 w-screen h-screen min-h-screen min-w-screen bg-gradient-to-br from-blue-200 via-indigo-100 to-blue-400 flex flex-col items-stretch justify-center p-0 m-0 overflow-auto pt-20">
      <div className="w-full h-full flex flex-col justify-center items-stretch py-12 px-0">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary text-center w-full">Welcome to Liquidity Fund</h1>
        <p className="text-lg md:text-xl mb-8 text-muted-foreground w-full text-center">
          Your trusted platform to manage deposits, withdrawals, and fund history with ease and transparency.
        </p>
        <div className="flex flex-col md:flex-row justify-center gap-4 mb-10 w-full px-4">
          <Link
            to="/deposit"
            className="bg-gradient-to-r from-green-500 to-green-400 hover:from-green-600 hover:to-green-400 text-white px-6 py-3 rounded-lg font-semibold transition shadow w-full md:w-auto text-center"
          >
            Deposit via M-Pesa
          </Link>
          <Link
            to="/withdraw"
            className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white px-6 py-3 rounded-lg font-semibold transition shadow w-full md:w-auto text-center"
          >
            Withdraw Funds
          </Link>
          <Link
            to="/client-dashboard"
            className="bg-white text-blue-700 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold transition shadow w-full md:w-auto text-center"
          >
            My Dashboard
          </Link>
        </div>
        {/* History and Trends Card */}
        <div className="bg-card p-7 mt-4 rounded-2xl shadow-2xl border border-blue-200 text-primary w-full max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-primary mb-2">Earnings History & Data Trends</h2>
          <p className="mb-4 text-base text-muted-foreground">See how our clients have been earning and gaining over time.</p>
          <div className="w-full flex flex-col items-center overflow-x-auto">
            {/* SVG Chart */}
            <svg width={graphW} height={graphH} viewBox={`0 0 ${graphW} ${graphH}`} className="mb-2 bg-gradient-to-br from-blue-50 via-white to-indigo-100 rounded-lg border border-indigo-200 shadow w-full max-w-2xl">
              {/* X axis */}
              <line x1={30} x2={graphW-30} y1={graphH-30} y2={graphH-30} stroke="#C7D2FE" strokeWidth="2"/>
              {/* Y axis */}
              <line x1={30} x2={30} y1={30} y2={graphH-30} stroke="#C7D2FE" strokeWidth="2"/>
              {/* Chart Path */}
              <path d={getTrendPath(earningHistory, graphW, graphH)} fill="none" stroke="#2563eb" strokeWidth="4" strokeLinejoin="round"/>
              {/* Points */}
              {earningHistory.map((d,i) => {
                const x = 30 + (graphW-60)*i/(earningHistory.length-1);
                const max = Math.max(...earningHistory.map(e => e.amount));
                const min = Math.min(...earningHistory.map(e => e.amount));
                const y = graphH-30 - ((d.amount-min)/(max-min||1))*(graphH-60);
                return <circle key={i} cx={x} cy={y} r={5} fill="#4ADE80" stroke="#2563eb" strokeWidth="2" />
              })}
              {/* X axis labels */}
              {earningHistory.map((d, i) => {
                const x = 30 + (graphW-60)*i/(earningHistory.length-1);
                return <text key={i} x={x} y={graphH-14} textAnchor="middle" fontSize="10" fill="#64748B">{formatDate(d.date)}</text>;
              })}
              {/* Last value label */}
              <text x={graphW-32} y={graphH-45} fontSize="12" fill="#2563eb" fontWeight="bold">KES {earningHistory[earningHistory.length-1].amount.toLocaleString()}</text>
            </svg>
            <div className="flex w-full justify-center gap-6 mt-2 mb-2 flex-wrap">
              <div className="bg-gradient-to-r from-green-500 via-blue-500 to-green-400 text-white px-7 py-3 rounded-xl shadow-xl font-bold text-lg">
                Total Earned: <span className="text-success">KES {totalEarnings.toLocaleString()}</span>
              </div>
              <div className="bg-gradient-to-r from-blue-600 via-blue-400 to-blue-200 text-white px-6 py-3 rounded-xl shadow-lg font-bold text-lg">
                Total Clients: <span className="text-warning">{totalUsers}</span>
              </div>
            </div>
            <div className="text-center text-muted-foreground text-sm mb-2 font-medium">
              Average earning per client: <span className="text-primary font-bold">KES {avgEarnings.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
