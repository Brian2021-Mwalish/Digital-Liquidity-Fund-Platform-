import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Portfolio', path: '/portfolio' },
    { name: 'Referrals', path: '/referrals' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="bg-primary text-white shadow">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          Liquidity Fund
        </Link>

        <div className="hidden md:flex space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`hover:underline ${
                location.pathname === item.path ? 'font-semibold underline' : ''
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="md:flex space-x-4 hidden">
          <Link
            to="/login"
            className="bg-white text-primary font-medium px-4 py-1 rounded hover:bg-gray-100"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="border border-white px-4 py-1 rounded hover:bg-white hover:text-primary"
          >
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
