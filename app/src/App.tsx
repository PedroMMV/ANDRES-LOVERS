/**
 * Main App component with routing and global providers
 */

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { SearchProvider } from './contexts/SearchContext';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { SettingsModal } from './components/common/SettingsModal';
import { HomeRecommender } from './pages/HomeRecommender';
import { DataExplorer } from './pages/DataExplorer';
import { Regressor } from './pages/Regressor';
import { Clustering } from './pages/Clustering';
import { FactorAnalysis } from './pages/FactorAnalysis';
import { HelpAbout } from './pages/HelpAbout';

/**
 * RedirectHandler component - redirects from root to default page on mount
 */
const RedirectHandler: React.FC = () => {
  const { settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only redirect from root path on initial load
    if (location.pathname === '/' && settings.defaultPage !== '/') {
      navigate(settings.defaultPage, { replace: true });
    }
  }, []); // Only on mount

  return null;
};

function App() {
  return (
    <Router>
      <SearchProvider>
        <SettingsProvider>
          <RedirectHandler />
          <Routes>
            <Route path="/" element={<HomeRecommender />} />
            <Route path="/data-explorer" element={<DataExplorer />} />
            <Route path="/regressor" element={<Regressor />} />
            <Route path="/clustering" element={<Clustering />} />
            <Route path="/factor-analysis" element={<FactorAnalysis />} />
            <Route path="/help" element={<HelpAbout />} />
          </Routes>
          <SettingsModal />
        </SettingsProvider>
      </SearchProvider>
    </Router>
  );
}

export default App;
