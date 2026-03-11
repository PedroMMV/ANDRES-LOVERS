/**
 * Regressor page
 * Complete interface for linear regression: training, prediction, and recommendations
 */

import React, { useState } from 'react';
import { AppShell } from '../layouts/AppShell';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { SEO } from '../components/common/SEO';
import { RegressionConfigForm } from '../components/regressor/RegressionConfigForm';
import { RegressionMetrics } from '../components/regressor/RegressionMetrics';
import { RegressionCharts } from '../components/regressor/RegressionCharts';
import { PredictionForm } from '../components/regressor/PredictionForm';
import {
  trainRegressionModel,
  makePrediction,
  getRegressionRecommendations,
} from '../services/regressionService';
import type {
  RegressionConfig,
  RegressionResults,
  PredictionInput,
  PredictionOutput,
  RegressionRecommendationResponse,
} from '../types/regression';
import { SEO_DATA } from '../constants/seo';
import {
  TrendingUp,
  Target,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  CheckCircle,
  Beaker,
  Settings,
} from 'lucide-react';

export const Regressor: React.FC = () => {
  // Training state
  const [results, setResults] = useState<RegressionResults | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [trainError, setTrainError] = useState<string | null>(null);

  // Prediction state
  const [isPredicting, setIsPredicting] = useState(false);
  const [prediction, setPrediction] = useState<PredictionOutput | null>(null);
  const [predictionError, setPredictionError] = useState<string | null>(null);

  // Recommendation state
  const [recommendations, setRecommendations] = useState<RegressionRecommendationResponse | null>(null);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);
  const [recommendationInput, setRecommendationInput] = useState<Record<string, string>>({});

  // UI state
  const [showCharts, setShowCharts] = useState(true);
  const [activeTab, setActiveTab] = useState<'predict' | 'recommend'>('predict');
  const [isConfigCollapsed, setIsConfigCollapsed] = useState(false);

  const handleTrain = async (config: RegressionConfig) => {
    setIsTraining(true);
    setTrainError(null);
    setPrediction(null);
    setRecommendations(null);
    try {
      const trainedResults = await trainRegressionModel(config);
      setResults(trainedResults);
      // Collapse config after successful training
      setIsConfigCollapsed(true);
    } catch (error) {
      console.error('Error training model:', error);
      setTrainError(error instanceof Error ? error.message : 'Error training model');
    } finally {
      setIsTraining(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setPrediction(null);
    setRecommendations(null);
    setTrainError(null);
    setPredictionError(null);
    setRecommendationError(null);
    setRecommendationInput({});
    setIsConfigCollapsed(false);
  };

  const handlePredict = async (input: PredictionInput) => {
    if (!results) return;

    setIsPredicting(true);
    setPredictionError(null);
    try {
      const predictionResult = await makePrediction(input, results.targetVariable);
      setPrediction(predictionResult);
    } catch (error) {
      console.error('Error making prediction:', error);
      setPredictionError(error instanceof Error ? error.message : 'Error making prediction');
    } finally {
      setIsPredicting(false);
    }
  };

  const handleRecommendationInputChange = (feature: string, value: string) => {
    setRecommendationInput(prev => ({
      ...prev,
      [feature]: value,
    }));
  };

  const handleGetRecommendations = async () => {
    // Convert string inputs to numbers
    const numericInput: PredictionInput = {};
    for (const [key, value] of Object.entries(recommendationInput)) {
      if (value.trim() !== '') {
        const num = parseFloat(value);
        if (!isNaN(num)) {
          numericInput[key] = num;
        }
      }
    }

    if (Object.keys(numericInput).length === 0) {
      setRecommendationError('Enter at least one value to get recommendations');
      return;
    }

    setIsLoadingRecommendations(true);
    setRecommendationError(null);
    try {
      const recs = await getRegressionRecommendations(numericInput, undefined, 5);
      setRecommendations(recs);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      setRecommendationError(error instanceof Error ? error.message : 'Error getting recommendations');
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  // Recommendation input features (common properties)
  const recommendationFeatures = [
    { name: 'nlgi_grade', label: 'NLGI Grade', placeholder: '0-6' },
    { name: 'visc_40c', label: 'Viscosity 40C (cSt)', placeholder: '40-3000' },
    { name: 'punto_gota', label: 'Drop Point (C)', placeholder: '80-400' },
    { name: 'temp_min', label: 'Min Temp (C)', placeholder: '-60 to 20' },
    { name: 'temp_max', label: 'Max Temp (C)', placeholder: '80-260' },
    { name: 'penetracion', label: 'Penetration (0.1mm)', placeholder: '220-475' },
  ];

  return (
    <>
      <SEO
        title={SEO_DATA.regressor.title}
        description={SEO_DATA.regressor.description}
        keywords={SEO_DATA.regressor.keywords}
      />
      <AppShell
        sidebar={
          <>
            {/* Model Results Card */}
            {results && (
              <Card
                title="Model Results"
                subtitle={`Predicting: ${results.targetVariableDisplay}`}
              >
                <RegressionMetrics
                  metrics={results.metrics}
                  coefficients={results.coefficients}
                  numSamples={results.numSamples}
                  numTrainSamples={results.numTrainSamples}
                  numTestSamples={results.numTestSamples}
                />

                {/* Charts Toggle */}
                <button
                  onClick={() => setShowCharts(!showCharts)}
                  className="w-full mt-4 flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-sm font-medium text-gray-700">
                    Diagnostic Charts
                  </span>
                  {showCharts ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>

                {showCharts && (
                  <div className="mt-4">
                    <RegressionCharts
                      actualVsPredicted={results.actualVsPredicted}
                      residuals={results.residuals}
                    />
                  </div>
                )}
              </Card>
            )}

            {/* Help Card when no model */}
            {!results && (
              <Card title="About Regression">
                <div className="text-sm text-gray-600 space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-primary-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                    <p>
                      <strong>Linear Regression</strong> predicts a continuous numeric value
                      based on predictor variables.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="font-medium text-gray-700">Steps:</p>
                    <ol className="list-decimal list-inside space-y-1.5 text-gray-600">
                      <li>Select the variable to predict</li>
                      <li>Choose predictor variables (or use auto-select)</li>
                      <li>Configure test set percentage</li>
                      <li>Train the model and review metrics</li>
                      <li>Make predictions or find similar greases</li>
                    </ol>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-amber-800 text-xs">
                      <strong>Tip:</strong> An R² &gt; 0.7 indicates good fit.
                      Highly correlated variables improve predictions.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </>
        }
      >
        {/* Main Content: Collapsible Configuration Form */}
        <Card>
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setIsConfigCollapsed(!isConfigCollapsed)}
          >
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-primary-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Model Configuration
                </h3>
                <p className="text-sm text-gray-500">
                  {results
                    ? `Trained to predict ${results.targetVariableDisplay}`
                    : 'Train a linear regression model with grease data'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {results && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  Trained
                </span>
              )}
              {isConfigCollapsed ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </div>

          <div
            className={`grid transition-all duration-300 ease-in-out ${
              isConfigCollapsed ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100'
            }`}
          >
            <div className="overflow-hidden">
              <div className="mt-6 pt-6 border-t border-gray-100">
                <RegressionConfigForm
                  onTrain={handleTrain}
                  onReset={handleReset}
                  isTraining={isTraining}
                />

                {trainError && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
                    <span className="text-sm text-red-700">{trainError}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs for Prediction and Recommendations */}
        {results && (
          <Card>
            {/* Tab buttons */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab('predict')}
                className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'predict'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Target className="w-4 h-4 inline mr-2" />
                Make Prediction
              </button>
              <button
                onClick={() => setActiveTab('recommend')}
                className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'recommend'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Sparkles className="w-4 h-4 inline mr-2" />
                Find Similar Greases
              </button>
            </div>

            {/* Prediction Tab */}
            {activeTab === 'predict' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Predict {results.targetVariableDisplay}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Enter values for the predictor variables to get a prediction
                </p>

                <PredictionForm
                  features={results.predictorFeatures}
                  featuresDisplay={results.predictorFeaturesDisplay}
                  onPredict={handlePredict}
                  prediction={prediction}
                  isPredicting={isPredicting}
                />

                {predictionError && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
                    <span className="text-sm text-red-700">{predictionError}</span>
                  </div>
                )}
              </div>
            )}

            {/* Recommendations Tab */}
            {activeTab === 'recommend' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Find Similar Greases
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Enter desired properties to find the most similar greases in the catalog
                </p>

                {/* Recommendation Input Form */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {recommendationFeatures.map((feature) => (
                    <div key={feature.name}>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        {feature.label}
                      </label>
                      <input
                        type="number"
                        value={recommendationInput[feature.name] || ''}
                        onChange={(e) => handleRecommendationInputChange(feature.name, e.target.value)}
                        placeholder={feature.placeholder}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  ))}
                </div>

                <Button
                  variant="primary"
                  onClick={handleGetRecommendations}
                  disabled={isLoadingRecommendations}
                  className="w-full"
                >
                  {isLoadingRecommendations ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Beaker className="w-4 h-4 mr-2" />
                      Find Similar Greases
                    </>
                  )}
                </Button>

                {recommendationError && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
                    <span className="text-sm text-red-700">{recommendationError}</span>
                  </div>
                )}

                {/* Recommendations Results */}
                {recommendations && (
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                      Recommended Greases ({recommendations.total})
                    </h4>

                    {/* Target vector */}
                    {Object.keys(recommendations.vector_objetivo).length > 0 && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs font-medium text-blue-700 mb-2">
                          Target vector (with predictions):
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(recommendations.vector_objetivo).map(([key, value]) => (
                            <span
                              key={key}
                              className="px-2 py-1 bg-white rounded text-xs text-blue-800"
                            >
                              {key}: {value.toFixed(2)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Results table */}
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              #
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Grease
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Similarity
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Base Oil
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Thickener
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {recommendations.recomendaciones.map((rec, idx) => (
                            <tr key={rec.id} className="hover:bg-gray-50">
                              <td className="px-3 py-3 text-sm text-gray-500">
                                {idx + 1}
                              </td>
                              <td className="px-3 py-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {rec.nombre}
                                </div>
                              </td>
                              <td className="px-3 py-3">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    rec.similitud >= 0.8
                                      ? 'bg-green-100 text-green-800'
                                      : rec.similitud >= 0.6
                                      ? 'bg-blue-100 text-blue-800'
                                      : rec.similitud >= 0.4
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {(rec.similitud * 100).toFixed(1)}%
                                </span>
                              </td>
                              <td className="px-3 py-3 text-sm text-gray-600">
                                {rec.aceite_base || '-'}
                              </td>
                              <td className="px-3 py-3 text-sm text-gray-600">
                                {rec.espesante || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        )}
      </AppShell>
    </>
  );
};
