import React from 'react';

const Portfolio = () => {
  // Dummy data – this would typically come from context or an API
  const portfolio = [
    { id: 1, asset: 'USDT', amount: 2500, date: '2025-07-15' },
    { id: 2, asset: 'ETH', amount: 1.3, date: '2025-07-20' },
    { id: 3, asset: 'BTC', amount: 0.05, date: '2025-07-25' },
  ];

  return (
    <div className="p-6 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">My Portfolio</h2>

      {portfolio.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 rounded-md shadow">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="py-2 px-4 text-left">Asset</th>
                <th className="py-2 px-4 text-left">Amount</th>
                <th className="py-2 px-4 text-left">Date Invested</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.map((item) => (
                <tr key={item.id} className="border-b border-gray-300 dark:border-gray-700">
                  <td className="py-2 px-4">{item.asset}</td>
                  <td className="py-2 px-4">{item.amount}</td>
                  <td className="py-2 px-4">{item.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>You have no active investments yet.</p>
      )}
    </div>
  );
};

export default Portfolio;
