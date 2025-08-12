import React, { useState, useEffect } from "react";

const LandingPage = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogin = () => {
    window.location.href = '/login';
  };

  const handleGetStarted = () => {
    window.location.href = '/register';
  };

  return (
    <div className="fixed inset-0 w-screen min-h-screen bg-white text-gray-800 font-sans overflow-x-auto overflow-y-auto text-sm">
      {/* NAVIGATION */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white bg-opacity-95 backdrop-blur-md border-b border-gray-200 shadow-lg">
        <div className="max-w-full sm:max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
                LiquiInvest KE
              </h1>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#how-it-works" className="text-gray-700 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">How It Works</a>
                <a href="#benefits" className="text-gray-700 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Benefits</a>
                <a href="#referrals" className="text-gray-700 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Referrals</a>
                <a href="#platform" className="text-gray-700 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Platform</a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleLogin}
                className="text-emerald-600 font-semibold px-4 py-2 rounded-lg hover:bg-emerald-50 transition-all duration-300"
              >
                Login
              </button>
              <button 
                onClick={handleGetStarted}
                className="bg-emerald-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-emerald-700 transition-all duration-300 transform hover:scale-105"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center px-2 sm:px-4 lg:px-8 pt-20 bg-gradient-to-br from-emerald-600 via-green-500 to-emerald-600">
        {/* Floating geometric shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute w-64 h-64 bg-white bg-opacity-5 rounded-full -top-32 -right-32 animate-pulse"
            style={{ transform: `translateY(${scrollY * 0.1}px)` }}
          ></div>
          <div 
            className="absolute w-32 h-32 bg-yellow-400 bg-opacity-10 rounded-full top-1/4 left-10 animate-bounce"
            style={{ animationDelay: '2s', transform: `translateY(${scrollY * 0.15}px)` }}
          ></div>
          <div 
            className="absolute w-48 h-48 bg-white bg-opacity-5 rounded-full bottom-20 right-20"
            style={{ transform: `translateY(${scrollY * 0.08}px)` }}
          ></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto text-center">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-4 leading-tight text-white drop-shadow-lg">
              Kenya's <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500">Smartest</span>
              <br />Way to Invest
            </h1>
            <p className="text-xs sm:text-sm lg:text-base max-w-3xl mx-auto mb-4 text-gray-100 font-light leading-relaxed drop-shadow-md">
              Safe. Liquid. Rewarding. Start investing in short-term instruments like T-bills & FDRs with full M-Pesa integration.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
              <button 
                onClick={handleGetStarted}
                className="group relative bg-white text-emerald-600 font-bold px-4 py-2 rounded-xl hover:bg-yellow-400 hover:text-white transition-all duration-500 transform hover:scale-105 hover:shadow-xl text-xs sm:text-sm"
              >
                Open Your Investment Account
              </button>
              <button className="border border-white text-white font-semibold px-4 py-2 rounded-xl hover:bg-white hover:text-emerald-600 transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm">
                Watch Demo
              </button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-10 sm:py-16 px-2 sm:px-4 lg:px-8 bg-gradient-to-br from-gray-50 to-gray-100 mt-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
            How It Works
          </h2>
          <p className="text-xs sm:text-sm lg:text-base text-gray-600 max-w-2xl mx-auto mb-2">
              Get started in minutes with our streamlined investment process
          </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {[ 
              {
                title: "1. Register & Verify",
                desc: "Create your account, complete KYC in minutes with our AI-powered verification.",
                color: "from-blue-500 to-blue-600"
              },
              {
                title: "2. Fund & Invest",
                desc: "Use M-Pesa or bank to fund your wallet. Start investing instantly with as little as KES 100.",
                color: "from-emerald-500 to-emerald-600"
              },
              {
                title: "3. Track & Withdraw",
                desc: "Monitor your returns live. Withdraw anytime — usually within 24 hours to your M-Pesa.",
                color: "from-purple-500 to-purple-600"
              },
            ].map((step, index) => (
              <div
                key={index}
                className="group relative bg-white p-5 rounded-2xl shadow-md hover:shadow-lg transform transition-all duration-500 hover:scale-105 border border-gray-100"
              >
                <div className={`w-10 h-10 bg-gradient-to-r ${step.color} rounded-xl flex items-center justify-center text-lg text-white font-bold mb-4 group-hover:scale-105 transition-transform duration-300`}>
                  {index + 1}
                </div>
                <h3 className="text-base font-bold mb-2 text-gray-800">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed text-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLIENT & ADMIN BENEFITS */}
      <section id="benefits" className="py-10 sm:py-16 px-2 sm:px-4 lg:px-8 bg-white mt-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-gray-800">
                  <span className="bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">Investor</span> Benefits
                </h2>
                <div className="space-y-6">
                  {[ 
                    { title: "High liquidity", desc: "Withdraw in 24 hours" },
                    { title: "Capital safety", desc: "Secure instruments only" },
                    { title: "50% referral rewards", desc: "Earn when friends invest" },
                    { title: "Portfolio visibility", desc: "Real-time tracking" },
                    { title: "M-Pesa integration", desc: "Seamless transactions" },
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-start space-x-2 p-2 rounded-lg hover:bg-emerald-50 transition-colors duration-300">
                      <div className="w-4 h-4 bg-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1">
                        ✓
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 text-xs">{benefit.title}</h4>
                        <p className="text-gray-600 text-xs">{benefit.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-gray-800">
                  <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">Admin</span> Benefits
                </h2>
                <div className="space-y-6">
                  {[ 
                    { title: "Management fees", desc: "Earn performance-based income" },
                    { title: "Automated compliance", desc: "CBK & CMA reporting" },
                    { title: "Scalable onboarding", desc: "Streamlined investor management" },
                    { title: "Real-time analytics", desc: "Investment & behavior insights" },
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-start space-x-2 p-2 rounded-lg hover:bg-purple-50 transition-colors duration-300">
                      <div className="w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1">
                        ✓
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 text-xs">{benefit.title}</h4>
                        <p className="text-gray-600 text-xs">{benefit.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REFERRAL PROMO */}
      <section id="referrals" className="relative py-10 sm:py-16 px-2 sm:px-4 lg:px-8 overflow-hidden bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 mt-4">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-white bg-opacity-10 rounded-full animate-pulse"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white bg-opacity-5 rounded-full animate-bounce"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div className="mb-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6 text-white drop-shadow-lg">
            Earn While You <span className="text-orange-200">Share</span>
          </h2>
          <p className="text-xs sm:text-sm lg:text-base text-white text-opacity-90 mb-4 max-w-2xl mx-auto leading-relaxed">
              Invite friends, family or followers and get a <strong className="text-orange-200">50% bonus</strong> when they invest. 
              Passive income just got easier with our industry-leading referral program.
          </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center items-center mb-6">
            <button className="bg-white text-yellow-600 px-8 py-4 rounded-2xl font-bold hover:bg-orange-100 transition-all duration-500 transform hover:scale-110 hover:shadow-2xl">
            Share My Referral Code
          </button>
          <button className="border border-white text-white font-semibold px-4 py-2 rounded-xl hover:bg-white hover:text-yellow-600 transition-all duration-300 text-xs sm:text-sm">
            Learn More
          </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-white">
            <div className="bg-white bg-opacity-10 p-4 rounded-xl backdrop-blur-sm">
              <div className="text-xl font-bold">50%</div>
              <div className="text-xs opacity-90">Commission Rate</div>
            </div>
            <div className="bg-white bg-opacity-10 p-4 rounded-xl backdrop-blur-sm">
              <div className="text-xl font-bold">24hrs</div>
              <div className="text-xs opacity-90">Payout Time</div>
            </div>
            <div className="bg-white bg-opacity-10 p-4 rounded-xl backdrop-blur-sm">
              <div className="text-xl font-bold">Unlimited</div>
              <div className="text-xs opacity-90">Referral Limit</div>
            </div>
          </div>
        </div>
      </section>

      {/* MODULES OVERVIEW */}
      <section id="platform" className="py-10 sm:py-16 px-2 sm:px-4 lg:px-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white mt-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            What <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">Powers</span> the Platform
          </h2>
          <p className="text-xs sm:text-sm lg:text-base text-gray-300 max-w-2xl mx-auto mb-2">
              Built with cutting-edge technology for maximum security and performance
          </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[ 
              { title: "User Account + KYC Module", color: "from-blue-500 to-blue-600" },
              { title: "M-Pesa / Wallet Transactions", color: "from-green-500 to-green-600" },
              { title: "Real-Time Portfolio Engine", color: "from-purple-500 to-purple-600" },
              { title: "Referral Engine & Bonus Payouts", color: "from-yellow-500 to-yellow-600" },
              { title: "Regulatory Reporting System", color: "from-red-500 to-red-600" },
              { title: "Admin Dashboard & Audit Tools", color: "from-indigo-500 to-indigo-600" },
            ].map((module, index) => (
              <div
                key={index}
                className="group bg-gray-800 bg-opacity-50 p-4 rounded-xl border border-gray-700 hover:border-emerald-500 transform hover:scale-105 transition-all duration-500 backdrop-blur-sm"
              >
                <div className={`w-8 h-8 bg-gradient-to-r ${module.color} rounded-lg flex items-center justify-center text-base font-bold mb-2 group-hover:scale-105 transition-transform duration-300`}>
                  {index + 1}
                </div>
                <h3 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors duration-300">
                  {module.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-600 text-white py-10 sm:py-16 text-center px-2 sm:px-4 lg:px-8 mt-4">
        <div className="max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-5xl mx-auto">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6">
            Let's Grow Your <span className="text-yellow-300">Money</span>
          </h2>
          <p className="text-xs sm:text-sm lg:text-base mb-4 text-green-100 max-w-2xl mx-auto leading-relaxed">
            Low-risk. Fully managed. 100% digital. Join thousands of Kenyans investing smarter today.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center items-center">
            <button 
              onClick={handleGetStarted}
              className="bg-white text-emerald-600 px-6 py-3 rounded-xl font-bold hover:bg-yellow-400 hover:text-white transition-all duration-500 transform hover:scale-105 hover:shadow-xl text-xs sm:text-sm"
            >
              Get Started Now
            </button>
            <button 
              onClick={handleLogin}
              className="border border-white text-white font-semibold px-6 py-3 rounded-xl hover:bg-white hover:text-emerald-600 transition-all duration-300 text-xs sm:text-sm"
            >
              Already have an account? Login
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-300 py-8 sm:py-12 px-2 sm:px-4 lg:px-8">
        <div className="max-w-full sm:max-w-2xl md:max-w-4xl lg:max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 mb-6">
            <div>
              <h3 className="text-white font-bold text-xl mb-4">LiquiInvest KE</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Kenya's premier investment platform for smart, secure, and liquid investments.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#how-it-works" className="hover:text-emerald-400 transition-colors">How it Works</a></li>
                <li><a href="#benefits" className="hover:text-emerald-400 transition-colors">Benefits</a></li>
                <li><a href="#referrals" className="hover:text-emerald-400 transition-colors">Referrals</a></li>
                <li><a href="#platform" className="hover:text-emerald-400 transition-colors">Platform</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Compliance</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center hover:bg-emerald-500 transition-colors cursor-pointer text-sm">
                  @
                </div>
                <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center hover:bg-emerald-500 transition-colors cursor-pointer text-sm">
                  +
                </div>
                <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center hover:bg-emerald-500 transition-colors cursor-pointer text-sm">
                  T
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} LiquiInvest KE. All Rights Reserved. | Licensed by CBK & CMA
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;