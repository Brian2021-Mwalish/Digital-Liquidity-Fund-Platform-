import React from 'react';
import { useLocation } from 'react-router-dom';

import AppRoutes from './routes/AppRoutes';
import Footer from './components/Footer';

const App = () => {
  const location = useLocation();

  return (
    <>
      <AppRoutes />
      <Footer />
    </>
  );
};

export default App;
