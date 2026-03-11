/**
 * Factor Analysis Recommendation Form Component
 * Allows users to input feature values for recommendations
 */

import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Loader2, Search, AlertCircle } from 'lucide-react';

interface FactorialRecommendFormProps {
  variables: string[];
  variableDisplayNames: Record<string, string>;
  isLoading: boolean;
  modelTrained: boolean;
  onRecommend: (inputFeatures: Record<string, number>, topK: number) => void;
}

export const FactorialRecommendForm: React.FC<FactorialRecommendFormProps> = ({
  variables,
  variableDisplayNames,
  isLoading,
  modelTrained,
  onRecommend,
}) => {
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [topK, setTopK] = useState<number>(5);

  // Initialize input values when variables change
  useEffect(() => {
    const initialValues: Record<string, string> = {};
    variables.forEach((v) => {
      initialValues[v] = inputValues[v] || '';
    });
    setInputValues(initialValues);
  }, [variables]);

  const handleInputChange = (variable: string, value: string) => {
    setInputValues((prev) => ({
      ...prev,
      [variable]: value,
    }));
  };

  const handleSubmit = () => {
    // Validate all inputs have values
    const missingVars = variables.filter(
      (v) => !inputValues[v] || inputValues[v].trim() === ''
    );

    if (missingVars.length > 0) {
      alert(`Please fill in all variables: ${missingVars.join(', ')}`);
      return;
    }

    // Convert to numbers
    const features: Record<string, number> = {};
    for (const v of variables) {
      const num = parseFloat(inputValues[v]);
      if (isNaN(num)) {
        alert(`Invalid number for ${v}`);
        return;
      }
      features[v] = num;
    }

    onRecommend(features, topK);
  };

  if (!modelTrained) {
    return (
      <Card
        title="Get Recommendations"
        subtitle="Find similar greases based on your requirements"
        headerAction={<Search className="w-5 h-5 text-primary-600" />}
      >
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
          <p className="text-center">
            Please train the Factor Analysis model first in the Configuration tab.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="Get Recommendations"
      subtitle="Enter your desired specifications"
      headerAction={<Search className="w-5 h-5 text-primary-600" />}
    >
      <div className="space-y-4">
        {/* Top K Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Recommendations
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="10"
              value={topK}
              onChange={(e) => setTopK(parseInt(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
            />
            <span className="text-lg font-bold text-primary-600 w-8 text-center">
              {topK}
            </span>
          </div>
        </div>

        {/* Variable Inputs */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Feature Values
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {variables.map((variable) => (
              <div key={variable}>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {variableDisplayNames[variable] || variable}
                </label>
                <input
                  type="number"
                  step="any"
                  value={inputValues[variable] || ''}
                  onChange={(e) => handleInputChange(variable, e.target.value)}
                  placeholder="Enter value"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={isLoading || variables.length === 0}
          fullWidth
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Finding Recommendations...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Get Recommendations
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};
