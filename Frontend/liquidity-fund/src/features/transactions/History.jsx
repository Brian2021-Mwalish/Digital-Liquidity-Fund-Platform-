import React, { useEffect, useState } from 'react';

const History = () => {
  const [transactions, setTransactions] = useState([]);

  // Simulate fetching data (replace with API call later)
  useEffect(() => {
    const sampleData = [
      { id: 1, type: 'Deposit', amount: 1000, date: '2025-08-01', method: 'M-Pesa' },
      { id: 2, type: 'Withdraw', amount: 500, date: '2025-08-03', method: 'M-Pesa' },
      { id: 3, type: 'Deposit', amount: 1500, date: '2025-08-05', method: 'M-Pesa' },
    ];
    setTransactions(sampleData);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 px-4 text-gray-800 dark:text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Transaction History</h1>

        {transactions.length === 0 ? (
          <p className="text-center text-gray-500">No transactions available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse rounded-lg overflow-hidden shadow-md">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Amount (KES)</th>
                  <th className="px-4 py-3 text-left">Method</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="px-4 py-3">{tx.date}</td>
                    <td className={`px-4 py-3 font-medium ${tx.type === 'Deposit' ? 'text-green-600' : 'text-red-500'}`}>
                      {tx.type}
                    </td>
                    <td className="px-4 py-3">{tx.amount}</td>
                    <td className="px-4 py-3">{tx.method}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
