import React from 'react';

const mockTransactions = [
  {
    id: 1,
    type: 'Deposit',
    method: 'M-Pesa',
    amount: 1500,
    date: '2025-08-01',
    status: 'Successful',
  },
  {
    id: 2,
    type: 'Withdrawal',
    method: 'Bank',
    amount: 500,
    date: '2025-08-03',
    status: 'Pending',
  },
  {
    id: 3,
    type: 'Deposit',
    method: 'M-Pesa',
    amount: 2000,
    date: '2025-08-05',
    status: 'Successful',
  },
];

const Statement = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 px-4 py-8">
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          Transaction Statement
        </h1>

        <div className="overflow-x-auto">
          <table className="w-full table-auto text-left text-sm">
            <thead className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
              <tr>
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Method</th>
                <th className="px-4 py-2">Amount (KES)</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockTransactions.map((tx, index) => (
                <tr key={tx.id} className="border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{tx.type}</td>
                  <td className="px-4 py-2">{tx.method}</td>
                  <td className="px-4 py-2">{tx.amount.toLocaleString()}</td>
                  <td className="px-4 py-2">{tx.date}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        tx.status === 'Successful'
                          ? 'bg-green-200 text-green-800'
                          : tx.status === 'Pending'
                          ? 'bg-yellow-200 text-yellow-800'
                          : 'bg-red-200 text-red-800'
                      }`}
                    >
                      {tx.status}
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
};

export default Statement;
