/**
 * Reusable Card component
 * Matches reference UI: white background, rounded corners, soft shadow
 */

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  headerAction,
}) => {
  return (
    <div className={`bg-white rounded-card shadow-card p-6 ${className}`}>
      {(title || subtitle || headerAction) && (
        <div className="mb-4 border-b border-gray-100 pb-4">
          <div className="flex items-start justify-between">
            <div>
              {title && (
                <h2 className="text-xl font-semibold text-gray-900">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-sm text-gray-500 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            {headerAction && (
              <div className="ml-4">
                {headerAction}
              </div>
            )}
          </div>
        </div>
      )}
      {children}
    </div>
  );
};
