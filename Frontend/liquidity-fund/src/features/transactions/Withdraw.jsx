// src/features/withdrawal/Withdrawal.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Wallet, 
  DollarSign, 
  Clock, 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  Smartphone,
  TrendingUp,
  Zap
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const Withdrawal = () => {
  const navigate = useNavigate();
  const [mobileNumber, setMobileNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [feedback, setFeedback] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [selectedQuickAmount, setSelectedQuickAmount] = useState(null);

  useEffect(() => {
    setIsLoaded(true);
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setFeedback("");
    setStatus("idle");

    if (!mobileNumber || !amount) {
      setStatus("error");
      setFeedback("⚠️ Please fill in both Mobile Number and Amount.");
      return;
    }

    if (parseFloat(amount) < 300) {
      setStatus("error");
      setFeedback("⚠️ Minimum withdrawal amount is KSh 300.");
      return;
    }

    setLoading(true);
    setStatus("loading");
    setFeedback("⏳ Checking your wallet balance and processing request...");

    try {
      const token = localStorage.getItem('access'); // always use 'access' token

      if (!token) {
        setStatus("error");
        setFeedback("🚨 Session expired. Please log in again.");
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/withdraw/`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mobile_number: mobileNumber,
          amount: amount,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setFeedback(
          "🎉 Withdrawal request submitted successfully! Expect your funds within 48 hours."
        );
        setMobileNumber("");
        setAmount("");
        setSelectedQuickAmount(null);
      } else if (response.status === 401) {
        // Unauthorized → token invalid or expired
        setStatus("error");
        setFeedback("🚨 Session expired. Please log in again.");
        navigate("/login");
      } else {
        setStatus("error");
        setFeedback(data.error || "❌ Failed to process withdrawal. Try again.");
      }
    } catch (err) {
      setStatus("error");
      setFeedback("🚨 Something went wrong. Please try later.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAmount = (quickAmount) => {
    setAmount(quickAmount.toString());
    setSelectedQuickAmount(quickAmount);
  };

  // Enhanced loading spinner component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center space-x-3">
      <div className="relative">
        <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
        <div className="absolute top-1 left-1 w-6 h-6 border-3 border-transparent border-t-blue-300 rounded-full animate-spin" style={{ animationDelay: '150ms' }}></div>
      </div>
      <span className="text-white font-medium">Processing...</span>
    </div>
  );

  const quickAmounts = [300, 500, 1000, 2000, 5000];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-100 via-white to-blue-100 flex items-center justify-center p-2 sm:p-4 lg:p-6 py-8 sm:py-12 lg:py-16">
      
       {/* Dashboard back button top left */}
      <div className="absolute left-6 top-6 z-50">
        <Link
          to="/client-dashboard"
          className="flex items-center gap-2 bg-blue-900 text-white px-5 py-2 rounded-xl shadow-lg font-semibold text-base hover:bg-blue-700 transition"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" />
          </svg>
          Dashboard
        </Link>
      </div>
      {/* Dynamic background elements matching Login */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.1) 0%, transparent 50%)`
        }}
      />

      {/* Floating money icons for withdrawal theme */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            animate={{
              y: [0, -100, 0],
              x: [0, Math.sin(i) * 50, 0],
              opacity: [0.1, 0.3, 0.1],
              rotate: [0, 360],
            }}
            transition={{
              duration: 15 + i * 2,
              repeat: Infinity,
              delay: i * 2,
              ease: "easeInOut",
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          >
            <DollarSign className="w-6 h-6 text-blue-200" />
          </motion.div>
        ))}
      </div>

      <div className={`w-full max-w-xs sm:max-w-lg lg:max-w-6xl space-y-3 sm:space-y-4 lg:space-y-6 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        
      

        {/* Header with enhanced design */}
        <motion.div
          className="text-center transform transition-all duration-300 hover:scale-105"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <motion.div
              className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-lg"
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
            >
              <Wallet className="text-white w-6 h-6" />
            </motion.div>
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Withdraw Funds
            </h2>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Zap className="text-indigo-600 w-5 h-5" />
            </motion.div>
          </div>
          <p className="text-sm sm:text-base text-gray-600 transition-colors duration-300 hover:text-gray-800">
            Fast & secure money transfers to your mobile wallet
          </p>
        </motion.div>

        {/* Main Card matching Login styling */}
        <motion.div
          className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8 transform transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.3, type: "spring", bounce: 0.3 }}
        >
          {/* Loading Overlay */}
          <AnimatePresence>
            {loading && (
              <motion.div
                className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="text-center"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.4 }}
                >
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <div className="relative">
                      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                      <div className="absolute top-2 left-2 w-8 h-8 border-3 border-transparent border-t-indigo-400 rounded-full animate-spin" style={{ animationDelay: '150ms' }}></div>
                    </div>
                  </div>
                  <motion.p
                    className="text-gray-700 font-medium"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Securing your transaction...
                  </motion.p>
                  <p className="text-gray-500 text-sm mt-2">
                    Please wait while we process your request
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Stats Row */}
          <motion.div
            className="grid grid-cols-3 gap-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <Clock className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <p className="text-xs text-gray-600 font-medium">≤ 48 Hours</p>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
              <Shield className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <p className="text-xs text-gray-600 font-medium">Secure</p>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
              <TrendingUp className="w-5 h-5 text-purple-600 mx-auto mb-1" />
              <p className="text-xs text-gray-600 font-medium">Instant</p>
            </div>
          </motion.div>

          {/* Withdrawal Form */}
          <form onSubmit={handleWithdraw} className="space-y-4 sm:space-y-5">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Mobile Number Input */}
              <motion.div
                className="group w-full sm:w-1/2"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label className="block mb-2 font-semibold text-gray-700 text-xs sm:text-sm flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  Mobile Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="07XXXXXXXX or 01XXXXXXXX"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full px-2 sm:px-3 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 text-xs sm:text-sm transition-all duration-300 border-gray-300 focus:ring-blue-300 focus:border-blue-400 bg-gray-50 hover:bg-white hover:border-gray-400"
                  />
                  <motion.div
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400/10 to-indigo-400/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    whileHover={{ scale: 1.02 }}
                  />
                </div>
              </motion.div>

              {/* Amount Input */}
              <motion.div
                className="group w-full sm:w-1/2"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <label className="block mb-2 font-semibold text-gray-700 text-xs sm:text-sm flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  Amount (KES)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Minimum: KSh 300"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setSelectedQuickAmount(null);
                    }}
                    className="w-full px-2 sm:px-3 py-2 sm:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 text-xs sm:text-sm transition-all duration-300 border-gray-300 focus:ring-blue-300 focus:border-blue-400 bg-gray-50 hover:bg-white hover:border-gray-400"
                  />
                  <motion.div
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-green-400/10 to-blue-400/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    whileHover={{ scale: 1.02 }}
                  />
                </div>
              </motion.div>
            </div>

            {/* Quick Amount Selection with enhanced design */}
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <label className="block font-semibold text-gray-700 text-xs sm:text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-600" />
                Quick Select Amounts
              </label>
              <div className="grid grid-cols-5 gap-2">
                {quickAmounts.map((quickAmount) => (
                  <motion.button
                    key={quickAmount}
                    type="button"
                    onClick={() => handleQuickAmount(quickAmount)}
                    className={`py-2 px-2 rounded-lg border text-xs font-medium transition-all duration-300 relative overflow-hidden ${
                      selectedQuickAmount === quickAmount
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-blue-500 shadow-lg"
                        : "bg-gray-50 text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700"
                    }`}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {selectedQuickAmount === quickAmount && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700"
                        layoutId="selectedAmount"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10">
                      {quickAmount >= 1000 ? `${quickAmount / 1000}K` : quickAmount}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Submit Button matching Login style */}
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:-translate-y-1 hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100"
              whileHover={!loading ? { scale: 1.02, y: -2 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    <Wallet className="w-4 h-4" />
                    Submit Withdrawal Request
                  </>
                )}
              </div>

              {/* Shimmer effect when not loading */}
              {!loading && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: [-100, 300] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
                />
              )}
            </motion.button>
          </form>

          {/* Enhanced Info Card with withdrawal-specific features */}
          <motion.div
            className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <h3 className="text-blue-700 font-semibold mb-3 flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Withdrawal Guidelines</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-600 text-xs sm:text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                <span>Min: KSh 300</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-3 h-3 text-blue-500 flex-shrink-0" />
                <span>Up to 48 hours</span>
              </div>
              <div className="flex items-center space-x-2">
                <Smartphone className="w-3 h-3 text-purple-500 flex-shrink-0" />
                <span>M-Pesa & Airtel</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-3 h-3 text-orange-500 flex-shrink-0" />
                <span>2% transaction fee</span>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Feedback */}
          <AnimatePresence mode="wait">
            {status !== "idle" && (
              <motion.div
                key={status}
                className={`mt-6 p-4 rounded-xl text-center relative overflow-hidden border ${
                  status === "success"
                    ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200"
                    : status === "error"
                    ? "bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border-red-200"
                    : "bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-700 border-yellow-200"
                }`}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
              >
                {/* Animated background for success */}
                {status === "success" && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-green-100/50 to-emerald-100/50"
                    animate={{ 
                      scale: [1, 1.02, 1],
                      opacity: [0.5, 0.8, 0.5]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
                
                <motion.div
                  className="relative z-10 flex items-center justify-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {status === "success" && <CheckCircle className="w-5 h-5 text-green-600" />}
                  {status === "error" && <AlertTriangle className="w-5 h-5 text-red-600" />}
                  {status === "loading" && <Clock className="w-5 h-5 text-yellow-600" />}
                  <span className="font-medium">{feedback}</span>
                </motion.div>

                {/* Success celebration particles */}
                {status === "success" && (
                  <div className="absolute inset-0 pointer-events-none">
                    {[...Array(12)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-green-500 rounded-full"
                        initial={{ 
                          x: "50%", 
                          y: "50%", 
                          opacity: 0,
                          scale: 0 
                        }}
                        animate={{ 
                          x: `${50 + (Math.random() - 0.5) * 200}%`,
                          y: `${50 + (Math.random() - 0.5) * 200}%`,
                          opacity: [0, 1, 0],
                          scale: [0, 1.5, 0]
                        }}
                        transition={{ 
                          duration: 2,
                          delay: i * 0.1,
                          ease: "easeOut"
                        }}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Withdrawal History Preview (Unique Feature) */}
          <motion.div
            className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 }}
          >
            <h3 className="text-gray-700 font-semibold mb-2 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Recent Activity</span>
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-gray-600 p-2 bg-white rounded-lg">
                <span>Last withdrawal</span>
                <span className="font-medium text-blue-600">2 days ago</span>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-600 p-2 bg-white rounded-lg">
                <span>Available balance</span>
                <span className="font-medium text-green-600">Click to view</span>
              </div>
            </div>
          </motion.div>

          {/* Security indicator matching Login theme */}
          <motion.div
            className="mt-6 flex items-center justify-center space-x-2 text-gray-500 text-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            <motion.div
              className="w-2 h-2 bg-green-500 rounded-full"
              animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <Shield className="w-3 h-3" />
            <span>Secured by 256-bit encryption</span>
          </motion.div>
        </motion.div>

        {/* Additional help link */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <p className="text-sm text-gray-600">
            Need help with withdrawals?{" "}
            <button
              onClick={() => navigate("/support")}
              className="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200 hover:underline"
            >
              Contact Support
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Withdrawal;