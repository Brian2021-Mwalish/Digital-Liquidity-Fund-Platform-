import React from "react";

const LandingPage = () => {
  return (
    <div className="bg-white text-gray-800 font-sans">
      {/* HERO SECTION */}
      <section className="bg-gradient-to-r from-emerald-600 to-green-500 text-white py-24 px-6 md:px-20">
        <div className="max-w-6xl mx-auto text-center animate-fadeIn">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight transition-transform duration-700 ease-in-out hover:scale-105">
            Kenya’s Smartest Way to Invest
          </h1>
          <p className="text-xl max-w-2xl mx-auto mb-8 transition-opacity duration-700 ease-in-out">
            Safe. Liquid. Rewarding. Start investing in short-term instruments like T-bills & FDRs with full M-Pesa integration.
          </p>
          <button className="bg-white text-emerald-600 font-semibold px-8 py-4 rounded-md hover:bg-emerald-100 transition-transform transform hover:scale-105 duration-300">
            Open Your Investment Account
          </button>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-6 md:px-20 bg-gray-50">
        <div className="max-w-6xl mx-auto animate-fadeInUp">
          <h2 className="text-3xl font-bold text-center mb-10">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                title: "1. Register & Verify",
                desc: "Create your account, complete KYC in minutes.",
              },
              {
                title: "2. Fund & Invest",
                desc: "Use M-Pesa or bank to fund your wallet. Start investing instantly.",
              },
              {
                title: "3. Track & Withdraw",
                desc: "Monitor your returns live. Withdraw anytime — usually within 24 hours.",
              },
            ].map((step, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-md transform transition duration-300 hover:scale-105 hover:shadow-xl"
              >
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLIENT & ADMIN BENEFITS */}
      <section className="py-20 px-6 md:px-20 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          <div className="animate-fadeInLeft">
            <h2 className="text-3xl font-bold mb-6">Investor Benefits</h2>
            <ul className="space-y-4 text-gray-700">
              <li>✅ High liquidity: Withdraw in 24 hours</li>
              <li>✅ Capital safety: Secure instruments only</li>
              <li>✅ 50% referral rewards</li>
              <li>✅ Portfolio visibility in real time</li>
              <li>✅ M-Pesa & bank integration</li>
            </ul>
          </div>
          <div className="animate-fadeInRight delay-200">
            <h2 className="text-3xl font-bold mb-6">Admin (Fund Manager) Benefits</h2>
            <ul className="space-y-4 text-gray-700">
              <li>📈 Earn management & performance fees</li>
              <li>🛠 Automate reporting & compliance (CBK, CMA)</li>
              <li>👥 Scalable investor onboarding</li>
              <li>📊 Access real-time investment & behavior data</li>
            </ul>
          </div>
        </div>
      </section>

      {/* REFERRAL PROMO */}
      <section className="bg-yellow-50 py-20 px-6 md:px-20 text-center">
        <div className="max-w-4xl mx-auto animate-fadeInUp">
          <h2 className="text-3xl font-bold mb-4">Earn While You Share</h2>
          <p className="text-lg mb-6 text-gray-700">
            Invite friends, family or followers and get a <strong>50% bonus</strong> when they invest. Passive income just got easier.
          </p>
          <button className="bg-yellow-400 text-white px-8 py-3 rounded-md font-semibold hover:bg-yellow-500 transform transition hover:scale-105">
            Share My Referral Code
          </button>
        </div>
      </section>

      {/* MODULES OVERVIEW */}
      <section className="py-20 px-6 md:px-20 bg-gray-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 animate-fadeIn">What Powers the Platform</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              "User Account + KYC Module",
              "M-Pesa / Wallet Transactions",
              "Real-Time Portfolio Engine",
              "Referral Engine & Bonus Payouts",
              "Regulatory Reporting System",
              "Admin Dashboard & Audit Tools",
            ].map((m, i) => (
              <div
                key={i}
                className="bg-white p-5 rounded-md shadow-md border-l-4 border-emerald-600 transform hover:scale-105 transition duration-300"
              >
                <h3 className="text-lg font-semibold">{m}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="bg-emerald-600 text-white py-20 text-center px-6">
        <h2 className="text-4xl font-bold mb-4 animate-fadeInUp">Let’s Grow Your Money</h2>
        <p className="text-lg mb-6 animate-fadeIn delay-200">Low-risk. Fully managed. 100% digital. Join thousands of Kenyans investing smarter today.</p>
        <button className="bg-white text-emerald-600 px-10 py-4 rounded-md font-semibold hover:bg-emerald-100 transition transform hover:scale-105 duration-300">
          Get Started
        </button>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-200 text-gray-700 text-center py-6 text-sm">
        &copy; {new Date().getFullYear()} LiquiInvest KE. All Rights Reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
