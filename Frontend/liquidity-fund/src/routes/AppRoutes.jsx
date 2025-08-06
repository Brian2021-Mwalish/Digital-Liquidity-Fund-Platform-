import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Public Pages
import LandingPage from '../pages/LandingPage';
import Home from '../pages/Home';
import About from '../pages/About';
import Contact from '../pages/Contact';
import NotFound from '../pages/NotFound';

// Auth
import Login from '../features/auth/Login';
import Register from '../features/auth/Register';
import KYCForm from '../features/auth/KYCForm';

// Multi-Step Registration
import StepOne from '../features/auth/registerSteps/StepOne';
import StepTwo from '../features/auth/registerSteps/StepTwo';
import StepThree from '../features/auth/registerSteps/StepThree';

// Dashboards
import ClientDashboard from '../features/dashboard/ClientDashboard';
import AdminDashboard from '../features/dashboard/AdminDashboard';

// Investment
import Portfolio from '../features/investment/Portfolio';

// Transactions
import Deposit from '../features/transactions/Deposit';
import Withdraw from '../features/transactions/Withdraw';
import History from '../features/transactions/History';

// Referrals
import ReferralPage from '../features/referral/ReferralPage';

// Reports
import Statement from '../features/reports/Statement';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Public Pages */}
      <Route path="/home" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />

      {/* Authentication */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/kyc" element={<KYCForm />} />

      {/* Multi-Step Registration */}
      <Route path="/register/step-one" element={<StepOne />} />
      <Route path="/register/step-two" element={<StepTwo />} />
      <Route path="/register/step-three" element={<StepThree />} />

      {/* Client Dashboard */}
      <Route path="/dashboard" element={<ClientDashboard />} />
      <Route path="/portfolio" element={<Portfolio />} />
      <Route path="/deposit" element={<Deposit />} />
      <Route path="/withdraw" element={<Withdraw />} />
      <Route path="/transactions" element={<History />} />
      <Route path="/statement" element={<Statement />} />
      <Route path="/referrals" element={<ReferralPage />} />

      {/* Admin Dashboard */}
      <Route path="/admin" element={<AdminDashboard />} />

      {/* Catch-All Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
