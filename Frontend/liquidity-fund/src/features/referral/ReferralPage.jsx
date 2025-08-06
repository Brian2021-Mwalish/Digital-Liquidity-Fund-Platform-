import React, { useState } from 'react';

const ReferralPage = () => {
  const referralCode = 'LIQ123XYZ'; // This should come from user data
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-md shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">Referral Program</h1>

        <p className="mb-4">
          Invite your friends and earn rewards when they join Liquidity Fund using your referral link!
        </p>

        <div className="flex items-center space-x-4 mb-6">
          <input
            type="text"
            value={referralCode}
            readOnly
            className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-100 dark:bg-gray-700"
          />
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400">
          Share your code and get bonuses when your referrals deposit for the first time.
        </p>
      </div>
    </div>
  );
};

export default ReferralPage;
