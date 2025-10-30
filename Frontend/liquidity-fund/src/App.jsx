import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen'; // 👈 create this

const App = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate async setup: auth check, config fetch, etc.
    const initializeApp = async () => {
      try {
        // Example: fetch user session or config from Django
        const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/check/`, {
          credentials: 'include',
        });
        // You can handle auth data here if needed
        await new Promise((r) => setTimeout(r, 800)); // small delay for smooth transition
      } catch (error) {
        console.error('Initialization failed:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (loading) {
    return <LoadingScreen />; // 👈 prevents page flicker before ready
  }

  return (
    <>
      <AppRoutes />
      {location.pathname !== '/login' && <Footer />}
    </>
  );
};

export default App;
