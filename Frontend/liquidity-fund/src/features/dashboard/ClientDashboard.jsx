import React from 'react';

const ClientDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">Welcome Back!</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Your Portfolio Balance</h2>
          <p className="text-3xl font-bold text-green-500">$12,450.00</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Pending Withdrawals</h2>
          <p className="text-3xl font-bold text-yellow-500">$500.00</p>
        </div>
      </div>

      <div className="mt-10">
        <h3 className="text-2xl font-semibold mb-4">Recent Transactions</h3>
        <ul className="space-y-4">
          <li className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
            📥 You deposited <strong>$2,000</strong> on <em>Aug 4, 2025</em>
          </li>
          <li className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
            📤 Withdrawal request of <strong>$500</strong> pending
          </li>
          <li className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
            💰 Interest credited: <strong>$75</strong> on <em>Aug 1, 2025</em>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ClientDashboard;
