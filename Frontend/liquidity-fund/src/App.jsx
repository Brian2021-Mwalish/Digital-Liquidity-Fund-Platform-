import React from 'react';
import { useLocation } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const App = () => {
  const location = useLocation();

  // Only hide Navbar on the landing page route
  const isLandingPage = location.pathname === '/';

  return (
    <div className="flex flex-col min-h-screen font-sans bg-gray-50 text-gray-800">
      {!isLandingPage && <Navbar />}
      <main className="flex-grow container mx-auto px-4 py-6">
        <AppRoutes />
      </main>
      <Footer />
    </div>
  );
};

export default App;
