/**
 * Reusable Slider component for numeric ranges
 */

import React from 'react';

interface SliderProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  showValue?: boolean;
  helperText?: string;
  className?: string;
  disabled?: boolean;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  showValue = true,
  helperText,
  className = '',
  disabled = false,
}) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-1.5">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        {showValue && (
          <span className="text-sm font-semibold text-primary-600">
            {value}
          </span>
        )}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className={`
          w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
          disabled:opacity-50 disabled:cursor-not-allowed
          slider
        `}
      />
      {helperText && (
        <p className="mt-1.5 text-xs text-gray-500">{helperText}</p>
      )}
      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #0284c7;
          cursor: pointer;
          transition: all 0.2s;
        }
        .slider::-webkit-slider-thumb:hover {
          background: #0369a1;
          transform: scale(1.1);
        }
        .slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #0284c7;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }
        .slider::-moz-range-thumb:hover {
          background: #0369a1;
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
};
