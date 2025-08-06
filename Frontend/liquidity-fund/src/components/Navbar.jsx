import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  // Show nav links only on these routes
  const showNavItems = [
    '/home',
    '/dashboard',
    '/portfolio',
    '/referrals',
    '/statement',
    '/deposit',
    '/withdraw',
    '/transactions',
  ].some((path) => location.pathname.startsWith(path));

  const navItems = [
    { name: 'Home', path: '/home' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Portfolio', path: '/portfolio' },
    { name: 'Referrals', path: '/referrals' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="bg-blue-100 border-b border-blue-200 fixed top-0 left-0 w-full z-50 shadow-md transition-all duration-300 ease-in-out">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold text-blue-800 hover:text-blue-600 transition duration-300 transform hover:scale-105"
        >
          Liquidity Fund
        </Link>

        {/* Nav Links */}
        {showNavItems && (
          <div className="hidden md:flex space-x-6 items-center">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`relative text-blue-900 font-medium transition duration-300 
                  ${location.pathname === item.path ? 'text-blue-700 font-semibold underline' : 'hover:text-blue-600'}
                `}
              >
                {item.name}
                <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-blue-400 scale-x-0 hover:scale-x-100 transition-transform origin-left duration-300"></span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
