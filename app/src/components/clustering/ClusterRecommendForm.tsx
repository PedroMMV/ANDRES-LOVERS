/**
 * Cluster Recommendation Form Component
 * Allows users to input feature values for grease recommendations
 */

import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Loader2, Search, Target } from 'lucide-react';

interface ClusterRecommendFormProps {
  variables: string[];
  variableDisplayNames: Record<string, string>;
  isLoading: boolean;
  modelTrained: boolean;
  onRecommend: (inputFeatures: Record<string, number>, topK: number) => void;
}

export const ClusterRecommendForm: React.FC<ClusterRecommendFormProps> = ({
  variables,
  variableDisplayNames,
  isLoading,
  modelTrained,
  onRecommend,
}) => {
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [topK, setTopK] = useState<number>(5);

  // Initialize input values
  useEffect(() => {
    const initial: Record<string, string> = {};
    variables.forEach((v) => {
      initial[v] = '';
    });
    setInputValues(initial);
  }, [variables]);

  const handleInputChange = (varName: string, value: string) => {
    setInputValues((prev) => ({
      ...prev,
      [varName]: value,
    }));
  };

  const handleSubmit = () => {
    // Convert to numbers and validate
    const numericValues: Record<string, number> = {};
    let allValid = true;

    variables.forEach((v) => {
      const val = parseFloat(inputValues[v]);
      if (isNaN(val)) {
        allValid = false;
      } else {
        numericValues[v] = val;
      }
    });

    if (!allValid) {
      alert('Please fill all fields with valid numbers');
      return;
    }

    onRecommend(numericValues, topK);
  };

  const filledCount = variables.filter(
    (v) => inputValues[v] && !isNaN(parseFloat(inputValues[v]))
  ).length;

  return (
    <Card
      title="Get Recommendations"
      subtitle="Enter your grease requirements"
      headerAction={<Target className="w-5 h-5 text-primary-600" />}
    >
      {!modelTrained ? (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> Please train a clustering model first before
            requesting recommendations.
          </p>
        </div>
      ) : (
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
              <div className="w-12 text-center">
                <span className="text-xl font-bold text-primary-600">{topK}</span>
              </div>
            </div>
          </div>

          {/* Input Fields */}
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {variables.map((varName) => (
              <div key={varName}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {variableDisplayNames[varName] || varName}
                </label>
                <input
                  type="number"
                  step="any"
                  value={inputValues[varName] || ''}
                  onChange={(e) => handleInputChange(varName, e.target.value)}
                  placeholder={`Enter ${varName}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                />
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-500">
            Filled: {filledCount} of {variables.length} fields
          </p>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={isLoading || filledCount < variables.length}
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
      )}
    </Card>
  );
};
