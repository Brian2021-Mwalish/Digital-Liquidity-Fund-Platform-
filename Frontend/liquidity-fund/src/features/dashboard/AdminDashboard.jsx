import React from 'react';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-white px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-indigo-600 text-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-2">Total Users</h2>
          <p className="text-3xl font-bold">1,248</p>
        </div>

        <div className="bg-green-600 text-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-2">Total Investments</h2>
          <p className="text-3xl font-bold">$754,320</p>
        </div>

        <div className="bg-yellow-500 text-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-2">Pending KYC</h2>
          <p className="text-3xl font-bold">32</p>
        </div>
      </div>

      <div className="mt-10">
        <h3 className="text-2xl font-semibold mb-4">Recent Activities</h3>
        <ul className="space-y-3">
          <li className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
            ✅ User <strong>Jane Doe</strong> completed KYC
          </li>
          <li className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
             <strong>$5,000</strong> deposit by <strong>John Smith</strong>
          </li>
          <li className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
             New user <strong>Awaiting Verification</strong>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;
