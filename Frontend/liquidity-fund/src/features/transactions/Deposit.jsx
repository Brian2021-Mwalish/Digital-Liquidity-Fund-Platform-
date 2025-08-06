import React, { useState } from 'react';

const Deposit = () => {
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState(null);

  const handleDeposit = (e) => {
    e.preventDefault();

    // Simulate M-Pesa deposit process (replace with actual API later)
    setStatus('processing');

    setTimeout(() => {
      setStatus('success');
      setPhone('');
      setAmount('');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 px-4 text-gray-800 dark:text-white">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
        <h1 className="text-3xl font-bold text-center mb-6">Deposit via M-Pesa</h1>
        
        <form onSubmit={handleDeposit} className="space-y-6">
          <div>
            <label className="block mb-2 font-semibold">Phone Number (Safaricom)</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 07XXXXXXXX"
              className="w-full px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold">Amount (KES)</label>
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 1000"
              className="w-full px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md font-semibold transition duration-200"
          >
            {status === 'processing' ? 'Processing...' : 'Initiate Deposit'}
          </button>

          {status === 'success' && (
            <p className="text-center text-green-600 font-medium mt-4">
              ✅ Deposit request sent! Confirm on your phone.
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Deposit;
