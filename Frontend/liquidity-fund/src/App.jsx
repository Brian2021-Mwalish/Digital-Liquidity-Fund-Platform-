import React from 'react';
import { useLocation } from 'react-router-dom';

import AppRoutes from './routes/AppRoutes';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const App = () => {
  const location = useLocation();

  // Add '/home' here to show Navbar on Home.jsx
  const showNavbar = location.pathname.startsWith('/home') ||
                     location.pathname.startsWith('/dashboard') ||
                     location.pathname.startsWith('/portfolio') ||
                     location.pathname.startsWith('/deposit') ||
                     location.pathname.startsWith('/withdraw') ||
                     location.pathname.startsWith('/transactions') ||
                     location.pathname.startsWith('/statement') ||
                     location.pathname.startsWith('/referrals');

  return (
    <div className="flex flex-col min-h-screen font-sans bg-gray-50 text-gray-800">
      {showNavbar && <Navbar />}
      <main className="flex-grow container mx-auto px-4 py-6">
        <AppRoutes />
      </main>
      <Footer />
    </div>
  );
};

export default App;
