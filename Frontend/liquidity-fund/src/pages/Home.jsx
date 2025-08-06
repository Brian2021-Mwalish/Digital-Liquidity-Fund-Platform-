import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 text-white flex flex-col items-center justify-center px-4">
      <div className="max-w-3xl text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to Liquidity Fund</h1>
        <p className="text-lg md:text-xl mb-8">
          Your trusted platform to manage deposits, withdrawals, and fund history with ease and transparency.
        </p>

        <div className="flex flex-col md:flex-row justify-center gap-4">
          <Link
            to="/deposit"
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            Deposit via M-Pesa
          </Link>
          <Link
            to="/withdraw"
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            Withdraw Funds
          </Link>
          <Link
            to="/client-dashboard"
            className="bg-white text-blue-700 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transition"
          >
            My Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
