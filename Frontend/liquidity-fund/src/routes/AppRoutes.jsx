import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Pages
import Home from '../pages/Home';
import About from '../pages/About';
import Contact from '../pages/Contact';
import NotFound from '../pages/NotFound';

// Auth
import Login from '../features/auth/Login';
import Register from '../features/auth/Register';
import KYCForm from '../features/auth/KYCForm';

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
      {/* Public Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/kyc" element={<KYCForm />} />

      {/* Client Dashboard */}
      <Route path="/dashboard" element={<ClientDashboard />} />
      <Route path="/portfolio" element={<Portfolio />} />
      <Route path="/deposit" element={<Deposit />} />
      <Route path="/withdraw" element={<Withdraw />} />
      <Route path="/transactions" element={<History />} />
      <Route path="/statement" element={<Statement />} />
      <Route path="/referrals" element={<ReferralPage />} />

      {/* Admin Section */}
      <Route path="/admin" element={<AdminDashboard />} />

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
