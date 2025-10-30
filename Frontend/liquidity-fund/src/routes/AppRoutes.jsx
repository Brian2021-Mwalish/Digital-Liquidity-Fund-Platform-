import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation, useParams, useNavigate } from "react-router-dom";
// Referral redirect component
const ReferralRedirect = () => {
  const { referral_code } = useParams();
  const navigate = useNavigate();
  React.useEffect(() => {
    navigate(`/register?referral_code=${referral_code}`);
  }, [referral_code, navigate]);
  return null;
};
import { AnimatePresence, motion } from "framer-motion";
import LoadingScreen from "../components/LoadingScreen";

// Pages
import LandingPage from "../pages/LandingPage";
import About from "../pages/About";
import Home from "../pages/Home";
import NotFound from "../pages/NotFound";

// Auth
import Login from "../features/auth/Login";
import Register from "../features/auth/Register";
import KYCForm from "../features/auth/KYCForm";
import ForgotPassword from "../features/auth/ForgotPassword";
import ResetPassword from "../features/auth/ResetPassword";

// Dashboards
import ClientDashboard from "../features/dashboard/ClientDashboard";
import AdminDashboard from "../features/dashboard/AdminDashboard";
import WithdrawalForm from "../features/transactions/Withdraw";
import ReferralPage from "../features/referral/ReferralPage"; // ✅ Correct import
import RequireAuth from "./RequireAuth";

// Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught an error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-red-600 text-lg">
            Something went wrong. Please try again later.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

// Slide animation variants
const slideVariants = {
  initial: { opacity: 0, x: 80 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -80 },
};

const PageWrapper = ({ children }) => (
  <motion.div
    variants={slideVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
  >
    {children}
  </motion.div>
);

const AppRoutes = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500); // Simulate loading time for navigation
    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (isLoading) {
    return <LoadingScreen message="Navigating..." subMessage="Please wait while we load the page" />;
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Pages */}
        <Route path="/" element={<PageWrapper><LandingPage /></PageWrapper>} />
        <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
        <Route path="/home" element={<PageWrapper><Home /></PageWrapper>} />

        {/* Authentication */}
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
        <Route path="/kyc" element={<PageWrapper><KYCForm /></PageWrapper>} />
        <Route path="/forgot-password" element={<PageWrapper><ForgotPassword /></PageWrapper>} />
          <Route path="/reset-password/:uidb64/:token" element={<PageWrapper><ResetPassword /></PageWrapper>} />
        {/* Referral link support: /referral/:referral_code redirects to /register?referral_code=... */}
        <Route path="/referral/:referral_code" element={<ReferralRedirect />} />

        {/* Dashboards & Protected Routes */}
        <Route
          path="/client-dashboard"
          element={
            <RequireAuth>
              <PageWrapper><ClientDashboard /></PageWrapper>
            </RequireAuth>
          }
        />
        <Route path="/withdraw" element={<PageWrapper><WithdrawalForm /></PageWrapper>} />

        {/* ✅ Referral Page (Protected) */}
        <Route
          path="/referrals"
          element={
            <RequireAuth>
              <PageWrapper><ReferralPage /></PageWrapper>
            </RequireAuth>
          }
        />

        <Route
          path="/admin-dashboard"
          element={
            <ErrorBoundary>
              <PageWrapper><AdminDashboard /></PageWrapper>
            </ErrorBoundary>
          }
        />

        {/* 404 Not Found */}
        <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};

export default AppRoutes;
