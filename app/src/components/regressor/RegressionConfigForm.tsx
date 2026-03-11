/**
 * Regression configuration form component
 * Loads features dynamically from the backend API
 */

import React, { useState, useEffect } from 'react';
import { Dropdown } from '../common/Dropdown';
import { Button } from '../common/Button';
import { getAvailableFeatures, getCorrelatedVariables } from '../../services/regressionService';
import type { RegressionConfig, FeatureOption, CorrelatedPredictor } from '../../types/regression';
import { AlertCircle, Loader2, Info } from 'lucide-react';

interface RegressionConfigFormProps {
  onTrain: (config: RegressionConfig) => void;
  onReset: () => void;
  isTraining: boolean;
}

export const RegressionConfigForm: React.FC<RegressionConfigFormProps> = ({
  onTrain,
  onReset,
  isTraining,
}) => {
  // State for features loaded from backend
  const [features, setFeatures] = useState<FeatureOption[]>([]);
  const [isLoadingFeatures, setIsLoadingFeatures] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // State for correlated predictors (auto-selection)
  const [correlatedPredictors, setCorrelatedPredictors] = useState<Record<string, CorrelatedPredictor[]>>({});
  const [umbral, setUmbral] = useState<number>(0.3);

  // Form state
  const [targetVariable, setTargetVariable] = useState<string>('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [testSizePercent, setTestSizePercent] = useState<number>(20);
  const [useAutoSelect, setUseAutoSelect] = useState<boolean>(true);

  // Load features from backend on mount
  useEffect(() => {
    loadFeatures();
  }, []);

  // Load correlated predictors when target variable changes
  useEffect(() => {
    if (targetVariable && useAutoSelect) {
      loadCorrelatedPredictors();
    }
  }, [targetVariable, umbral]);

  // Auto-select predictors when correlation data changes
  useEffect(() => {
    if (useAutoSelect && targetVariable && correlatedPredictors[targetVariable]) {
      const autoSelected = correlatedPredictors[targetVariable].map(p => p.name);
      setSelectedFeatures(autoSelected);
    }
  }, [correlatedPredictors, targetVariable, useAutoSelect]);

  const loadFeatures = async () => {
    setIsLoadingFeatures(true);
    setLoadError(null);
    try {
      const response = await getAvailableFeatures();
      setFeatures(response.features);
      // Set default target variable to first feature
      if (response.features.length > 0) {
        setTargetVariable(response.features[0].name);
      }
    } catch (error) {
      console.error('Error loading features:', error);
      setLoadError('Error loading variables from server. Please check that the backend is running.');
    } finally {
      setIsLoadingFeatures(false);
    }
  };

  const loadCorrelatedPredictors = async () => {
    try {
      const response = await getCorrelatedVariables(umbral);
      const predictorMap: Record<string, CorrelatedPredictor[]> = {};
      response.variables.forEach(v => {
        predictorMap[v.variable] = v.predictores;
      });
      setCorrelatedPredictors(predictorMap);
    } catch (error) {
      console.error('Error loading correlated predictors:', error);
    }
  };

  const handleTrain = () => {
    const config: RegressionConfig = {
      targetVariable,
      predictorFeatures: selectedFeatures,
      testSizePercent,
    };
    onTrain(config);
  };

  const handleFeatureToggle = (feature: string) => {
    if (selectedFeatures.includes(feature)) {
      setSelectedFeatures(selectedFeatures.filter(f => f !== feature));
    } else {
      setSelectedFeatures([...selectedFeatures, feature]);
    }
    // Disable auto-select when manually changing
    setUseAutoSelect(false);
  };

  const handleTargetChange = (newTarget: string) => {
    setTargetVariable(newTarget);
    // Remove from selected features if it was selected
    setSelectedFeatures(prev => prev.filter(f => f !== newTarget));
  };

  const handleAutoSelectToggle = () => {
    const newValue = !useAutoSelect;
    setUseAutoSelect(newValue);
    if (newValue && targetVariable && correlatedPredictors[targetVariable]) {
      const autoSelected = correlatedPredictors[targetVariable].map(p => p.name);
      setSelectedFeatures(autoSelected);
    }
  };

  // Loading state
  if (isLoadingFeatures) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <span className="ml-3 text-gray-600">Loading dataset variables...</span>
      </div>
    );
  }

  // Error state
  if (loadError) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{loadError}</p>
        <Button variant="primary" onClick={loadFeatures}>
          Retry
        </Button>
      </div>
    );
  }

  // Prepare options
  const targetOptions = features.map(f => ({
    value: f.name,
    label: f.displayName,
  }));

  const testSizeOptions = [
    { value: 10, label: '10%' },
    { value: 20, label: '20%' },
    { value: 30, label: '30%' },
    { value: 40, label: '40%' },
  ];

  const umbralOptions = [
    { value: 0.2, label: '0.2 (more predictors)' },
    { value: 0.3, label: '0.3 (recommended)' },
    { value: 0.4, label: '0.4 (more selective)' },
    { value: 0.5, label: '0.5 (very selective)' },
  ];

  // Features available for selection (excluding target)
  const availableFeatures = features.filter(f => f.name !== targetVariable);

  // Get correlation info for a feature
  const getCorrelationBadge = (featureName: string) => {
    if (!correlatedPredictors[targetVariable]) return null;
    const predictor = correlatedPredictors[targetVariable].find(p => p.name === featureName);
    if (!predictor) return null;

    const corr = predictor.correlation;
    const absCorr = Math.abs(corr);
    let colorClass = 'bg-gray-100 text-gray-700';
    if (absCorr >= 0.7) colorClass = 'bg-green-100 text-green-800';
    else if (absCorr >= 0.5) colorClass = 'bg-blue-100 text-blue-800';
    else if (absCorr >= 0.3) colorClass = 'bg-yellow-100 text-yellow-800';

    return (
      <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${colorClass}`}>
        r={corr.toFixed(2)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Target Variable Selection */}
      <div>
        <Dropdown
          label="Target Variable (to predict)"
          value={targetVariable}
          onChange={handleTargetChange}
          options={targetOptions}
          helperText="The variable the model will learn to predict"
        />
      </div>

      {/* Auto-select toggle and correlation threshold */}
      <div className="bg-primary-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={useAutoSelect}
              onChange={handleAutoSelectToggle}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">
              Auto-select by correlation
            </span>
          </label>
          <div className="flex items-center text-xs text-gray-500">
            <Info className="w-4 h-4 mr-1" />
            Automatically selects correlated predictors
          </div>
        </div>

        {useAutoSelect && (
          <div className="mt-2">
            <Dropdown
              label="Minimum correlation threshold"
              value={umbral}
              onChange={(val) => setUmbral(Number(val))}
              options={umbralOptions}
              helperText="Only variables with |correlation| >= threshold are selected"
            />
          </div>
        )}
      </div>

      {/* Predictor Features Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Predictor Features
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Select the variables to use for predicting the target variable
        </p>
        <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar p-2 bg-gray-50 rounded-lg">
          {availableFeatures.map((feature) => (
            <label
              key={feature.name}
              className={`flex items-start p-2 rounded transition-colors cursor-pointer ${
                selectedFeatures.includes(feature.name)
                  ? 'bg-primary-100 border border-primary-300'
                  : 'hover:bg-white'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedFeatures.includes(feature.name)}
                onChange={() => handleFeatureToggle(feature.name)}
                className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                disabled={isTraining}
              />
              <div className="ml-3 flex-1">
                <div className="text-sm font-medium text-gray-900 flex items-center flex-wrap">
                  {feature.displayName}
                  {getCorrelationBadge(feature.name)}
                </div>
                {feature.description && (
                  <div className="text-xs text-gray-600 mt-0.5">
                    {feature.description}
                  </div>
                )}
                {feature.stats && (
                  <div className="text-xs text-gray-400 mt-1">
                    Range: {feature.stats.min?.toFixed(1)} - {feature.stats.max?.toFixed(1)} |
                    Mean: {feature.stats.mean?.toFixed(1)} |
                    N: {feature.stats.count}
                  </div>
                )}
              </div>
            </label>
          ))}
        </div>
        <div className="text-xs text-gray-600 mt-2 flex justify-between">
          <span>Selected: {selectedFeatures.length} feature(s)</span>
          {selectedFeatures.length === 0 && (
            <span className="text-amber-600">Correlated variables will be used automatically</span>
          )}
        </div>
      </div>

      {/* Test Size */}
      <div>
        <Dropdown
          label="Test Set Size"
          value={testSizePercent}
          onChange={(val) => setTestSizePercent(Number(val))}
          options={testSizeOptions}
          helperText="Percentage of data reserved for model evaluation"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-3 pt-4">
        <Button
          variant="primary"
          onClick={handleTrain}
          disabled={isTraining}
          className="flex-1"
        >
          {isTraining ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Training Model...
            </>
          ) : (
            'Train Regression Model'
          )}
        </Button>
        <Button
          variant="secondary"
          onClick={onReset}
          disabled={isTraining}
        >
          Reset
        </Button>
      </div>

      {/* Info message */}
      {selectedFeatures.length === 0 && !useAutoSelect && (
        <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>
            No predictors selected. The model will automatically use variables
            with the highest correlation to the target variable.
          </span>
        </div>
      )}
    </div>
  );
};
