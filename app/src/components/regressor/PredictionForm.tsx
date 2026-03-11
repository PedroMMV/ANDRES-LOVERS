/**
 * Prediction form component
 * Allows users to input custom values and get predictions from trained model
 */

import React, { useState } from 'react';
import { Button } from '../common/Button';
import type { PredictionInput, PredictionOutput } from '../../types/regression';
import { Loader2, Target, CheckCircle } from 'lucide-react';

interface PredictionFormProps {
  features: string[];
  featuresDisplay?: string[];
  onPredict: (input: PredictionInput) => void;
  prediction: PredictionOutput | null;
  isPredicting: boolean;
}

export const PredictionForm: React.FC<PredictionFormProps> = ({
  features,
  featuresDisplay,
  onPredict,
  prediction,
  isPredicting,
}) => {
  const [inputs, setInputs] = useState<Record<string, string>>({});

  const handleInputChange = (feature: string, value: string) => {
    setInputs({
      ...inputs,
      [feature]: value,
    });
  };

  const handlePredict = () => {
    // Convert string inputs to numbers
    const numericInputs: PredictionInput = {};
    for (const [key, value] of Object.entries(inputs)) {
      if (value.trim() !== '') {
        const num = parseFloat(value);
        if (!isNaN(num)) {
          numericInputs[key] = num;
        }
      }
    }
    onPredict(numericInputs);
  };

  const allFieldsFilled = features.every(f => {
    const value = inputs[f];
    return value !== undefined && value !== '' && !isNaN(parseFloat(value));
  });

  const getDisplayName = (feature: string, index: number): string => {
    if (featuresDisplay && featuresDisplay[index]) {
      return featuresDisplay[index];
    }
    return feature;
  };

  return (
    <div className="space-y-4">
      {/* Input Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature, index) => (
          <div key={feature}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {getDisplayName(feature, index)}
            </label>
            <input
              type="number"
              value={inputs[feature] ?? ''}
              onChange={(e) => handleInputChange(feature, e.target.value)}
              placeholder="Enter value"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        ))}
      </div>

      {/* Predict Button */}
      <Button
        variant="primary"
        onClick={handlePredict}
        disabled={!allFieldsFilled || isPredicting}
        className="w-full"
      >
        {isPredicting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Calculating...
          </>
        ) : (
          <>
            <Target className="w-4 h-4 mr-2" />
            Get Prediction
          </>
        )}
      </Button>

      {!allFieldsFilled && (
        <p className="text-xs text-amber-600">
          Fill all fields to make a prediction
        </p>
      )}

      {/* Prediction Result */}
      {prediction && (
        <div className="mt-6 bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-lg p-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-3">
              <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
              <span className="text-sm font-medium text-primary-700">
                Prediction for {prediction.targetVariableDisplay}
              </span>
            </div>
            <div className="text-4xl font-bold text-primary-900">
              {prediction.predictedValue.toFixed(2)}
            </div>

            {/* Input summary */}
            {prediction.inputFeatures && Object.keys(prediction.inputFeatures).length > 0 && (
              <div className="mt-4 pt-4 border-t border-primary-200">
                <p className="text-xs text-gray-600 mb-2">Input values used:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {Object.entries(prediction.inputFeatures).map(([key, value]) => (
                    <span
                      key={key}
                      className="px-2 py-1 bg-white rounded text-xs text-gray-700"
                    >
                      {key}: {value}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
