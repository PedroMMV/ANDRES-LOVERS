/**
 * Main application shell with two-column layout
 * Matches reference UI: main content left (2/3), context panels right (1/3)
 * Responsive: stacks vertically on mobile
 */

import React from 'react';
import { Navbar } from '../components/layout/Navbar';

interface AppShellProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children, sidebar }) => {
  return (
    <div className="min-h-screen bg-background-light">
      <Navbar />

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Column (Left - 2/3) */}
          <div className={`space-y-6 ${sidebar ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
            {children}
          </div>

          {/* Sidebar Column (Right - 1/3) */}
          {sidebar && (
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-6 space-y-6">
                {sidebar}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
