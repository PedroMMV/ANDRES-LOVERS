/**
 * Factor Analysis Configuration Form Component
 * Allows users to configure factor analysis parameters
 */

import React, { useState, useEffect } from 'react';
import { Button } from '../common/Button';
import { Loader2, GitBranch } from 'lucide-react';
import type { FactorialVariable } from '../../types/factorial';

interface FactorialConfigFormProps {
  variables: FactorialVariable[];
  defaultVariables: string[];
  isLoading: boolean;
  optimalFactors?: number;
  onTrain: (config: {
    n_factors: number;
    variables: string[];
    scale: boolean;
  }) => void;
}

export const FactorialConfigForm: React.FC<FactorialConfigFormProps> = ({
  variables,
  defaultVariables,
  isLoading,
  optimalFactors,
  onTrain,
}) => {
  const [nFactors, setNFactors] = useState<number>(optimalFactors || 3);
  const [selectedVariables, setSelectedVariables] = useState<string[]>([]);
  const [useScaling, setUseScaling] = useState<boolean>(true);

  // Initialize selected variables with defaults
  useEffect(() => {
    if (defaultVariables.length > 0 && selectedVariables.length === 0) {
      const availableDefaults = defaultVariables.filter(v =>
        variables.some(vr => vr.name === v)
      );
      setSelectedVariables(availableDefaults);
    }
  }, [defaultVariables, variables]);

  // Update nFactors when optimalFactors changes from scree analysis
  useEffect(() => {
    if (optimalFactors && optimalFactors >= 2) {
      setNFactors(optimalFactors);
    }
  }, [optimalFactors]);

  const handleVariableToggle = (varName: string) => {
    setSelectedVariables(prev =>
      prev.includes(varName)
        ? prev.filter(v => v !== varName)
        : [...prev, varName]
    );
  };

  const handleSelectAll = () => {
    setSelectedVariables(variables.map(v => v.name));
  };

  const handleClearAll = () => {
    setSelectedVariables([]);
  };

  const handleSubmit = () => {
    if (selectedVariables.length < 2) {
      alert('Please select at least 2 variables for factor analysis');
      return;
    }
    if (nFactors > selectedVariables.length) {
      alert(`Number of factors cannot exceed number of variables (${selectedVariables.length})`);
      return;
    }
    onTrain({
      n_factors: nFactors,
      variables: selectedVariables,
      scale: useScaling,
    });
  };

  // Calculate max factors based on selected variables
  const maxFactors = Math.max(2, selectedVariables.length);

  return (
    <div className="space-y-6">
      {/* Number of Factors */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Number of Factors
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="2"
            max={maxFactors}
            value={Math.min(nFactors, maxFactors)}
            onChange={(e) => setNFactors(parseInt(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          />
          <div className="w-16 text-center">
            <span className="text-2xl font-bold text-primary-600">{Math.min(nFactors, maxFactors)}</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Recommended: Use the scree plot to find the optimal number of factors
        </p>
      </div>

      {/* Scaling Option */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div>
          <span className="text-sm font-medium text-gray-700">
            Apply StandardScaler
          </span>
          <p className="text-xs text-gray-500">
            Normalize features to zero mean and unit variance
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={useScaling}
            onChange={(e) => setUseScaling(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
        </label>
      </div>

      {/* Variable Selection */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">
            Variables for Factor Analysis
          </label>
          <div className="flex gap-2">
            <button
              onClick={handleSelectAll}
              className="text-xs text-primary-600 hover:text-primary-700"
            >
              Select All
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={handleClearAll}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear All
            </button>
          </div>
        </div>

        <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1">
          {variables.map((variable) => (
            <label
              key={variable.name}
              className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                selectedVariables.includes(variable.name)
                  ? 'bg-primary-50 border border-primary-200'
                  : 'hover:bg-gray-50 border border-transparent'
              }`}
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedVariables.includes(variable.name)}
                  onChange={() => handleVariableToggle(variable.name)}
                  className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {variable.display || variable.name}
                </span>
              </div>
              <span className="text-xs text-gray-400">
                {variable.non_null_count} values
              </span>
            </label>
          ))}
        </div>

        <p className="text-xs text-gray-500 mt-1">
          Selected: {selectedVariables.length} of {variables.length} variables
        </p>
      </div>

      {/* Train Button */}
      <Button
        onClick={handleSubmit}
        disabled={isLoading || selectedVariables.length < 2}
        fullWidth
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Training Model...
          </>
        ) : (
          <>
            <GitBranch className="w-4 h-4 mr-2" />
            Train Factor Analysis Model
          </>
        )}
      </Button>
    </div>
  );
};
