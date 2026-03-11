/**
 * Reusable Checkbox component
 */

import React from 'react';

interface CheckboxProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  helperText?: string;
  className?: string;
  disabled?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onChange,
  helperText,
  className = '',
  disabled = false,
}) => {
  return (
    <div className={`${className}`}>
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex-shrink-0"
        />
        {label && (
          <label className="ml-2 text-sm font-medium text-gray-700 cursor-pointer select-none">
            {label}
          </label>
        )}
      </div>
      {helperText && (
        <p className="ml-6 mt-1 text-xs text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
};
