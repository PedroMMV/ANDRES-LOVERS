/**
 * Top navigation bar component
 * Matches reference UI: horizontal layout, logo left, nav items center-left, search + icons right
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { SearchBar } from '../common/SearchBar';
import { useSettings } from '../../contexts/SettingsContext';

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/regressor', label: 'Regressor' },
  { path: '/clustering', label: 'Clustering' },
  { path: '/factor-analysis', label: 'Factor Analysis' },
  { path: '/data-explorer', label: 'Data Explorer' },
  { path: '/help', label: 'Help' },
];

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { openSettings } = useSettings();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logos */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-3">
              {/* Interlub Logo */}
              <img
                src="/img/interlub.png"
                alt="Interlub"
                className="h-8 w-auto"
              />

              {/* Divider */}
              <div className="h-6 w-px bg-gray-300"></div>

              {/* Tec Logo */}
              <img
                src="/img/tec.svg"
                alt="Tec de Monterrey"
                className="h-8 w-auto"
              />
            </Link>

            {/* Nav Items */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      ${
                        isActive
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side: Search and Icons */}
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="hidden sm:block">
              <SearchBar />
            </div>

            {/* Settings Icon */}
            <button
              onClick={openSettings}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
              title="Settings (⚙️)"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
