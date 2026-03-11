/**
 * Factor Analysis Page
 * Dimensionality reduction analysis and recommendations for greases
 */

import React, { useState, useEffect } from 'react';
import { AppShell } from '../layouts/AppShell';
import { Card } from '../components/common/Card';
import { SEO } from '../components/common/SEO';
import { Button } from '../components/common/Button';
import {
  FactorialConfigForm,
  FactorialResults,
  FactorialCharts,
  FactorialRecommendForm,
  FactorialRecommendations,
} from '../components/factorial';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  GitBranch,
  AlertCircle,
  Loader2,
  TrendingUp,
  Target,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Settings,
} from 'lucide-react';
import {
  getFactorialVariables,
  trainFactorialModel,
  getFactorialRecommendations,
  getScreeData,
} from '../services/factorialService';
import type {
  FactorialVariable,
  FactorialTrainResults,
  FactorialRecommendResponse,
  ScreeAnalysis,
} from '../types/factorial';

export const FactorAnalysis: React.FC = () => {
  // State
  const [variables, setVariables] = useState<FactorialVariable[]>([]);
  const [defaultVariables, setDefaultVariables] = useState<string[]>([]);
  const [trainResults, setTrainResults] = useState<FactorialTrainResults | null>(null);
  const [recommendations, setRecommendations] = useState<FactorialRecommendResponse | null>(null);
  const [screeData, setScreeData] = useState<ScreeAnalysis | null>(null);

  // Loading states
  const [isLoadingVariables, setIsLoadingVariables] = useState(true);
  const [isTraining, setIsTraining] = useState(false);
  const [isRecommending, setIsRecommending] = useState(false);
  const [isLoadingScree, setIsLoadingScree] = useState(false);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // UI states
  const [isConfigCollapsed, setIsConfigCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'recommend'>('config');

  // Load variables on mount
  useEffect(() => {
    loadVariables();
  }, []);

  const loadVariables = async () => {
    setIsLoadingVariables(true);
    setError(null);
    try {
      const response = await getFactorialVariables();
      setVariables(response.variables);
      setDefaultVariables(response.default_variables);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load variables');
    } finally {
      setIsLoadingVariables(false);
    }
  };

  const handleTrain = async (config: {
    n_factors: number;
    variables: string[];
    scale: boolean;
  }) => {
    setIsTraining(true);
    setError(null);
    try {
      const result = await trainFactorialModel({
        n_factors: config.n_factors,
        variables: config.variables,
        scale: config.scale,
      });
      setTrainResults(result);

      // Collapse config after successful training
      setIsConfigCollapsed(true);

      // Clear previous recommendations
      setRecommendations(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to train model');
    } finally {
      setIsTraining(false);
    }
  };

  const handleRecommend = async (inputFeatures: Record<string, number>, topK: number) => {
    setIsRecommending(true);
    setError(null);
    try {
      const result = await getFactorialRecommendations({
        input_features: inputFeatures,
        top_k: topK,
      });
      setRecommendations(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get recommendations');
    } finally {
      setIsRecommending(false);
    }
  };

  const handleLoadScree = async () => {
    setIsLoadingScree(true);
    setError(null);
    try {
      const result = await getScreeData(10);
      setScreeData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load scree data');
    } finally {
      setIsLoadingScree(false);
    }
  };

  // Build variable display names map
  const variableDisplayNames: Record<string, string> = {};
  variables.forEach((v) => {
    variableDisplayNames[v.name] = v.display || v.name;
  });

  return (
    <>
      <SEO
        title="Factor Analysis | Interlub Grease Recommender"
        description="Factor Analysis for dimensionality reduction and grease recommendations"
        keywords={['factor analysis', 'dimensionality reduction', 'grease', 'analysis', 'recommendations']}
      />
      <AppShell
        sidebar={
          <>
            {/* Info Card */}
            {!trainResults && (
              <Card title="About Factor Analysis" subtitle="How it works">
                <div className="text-sm text-gray-600 space-y-3">
                  <div className="flex items-start gap-2">
                    <GitBranch className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
                    <p>
                      <strong>Factor Analysis</strong> reduces dimensionality by
                      identifying latent factors that explain correlations between
                      variables.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <p>
                      <strong>Variance Explained</strong> shows how much of the
                      original data variation is captured by the extracted factors.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Target className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <p>
                      <strong>Recommendations</strong> find products closest to your
                      requirements in the reduced factor space.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Scree Plot Card */}
            <Card title="Optimal Factors" subtitle="Scree analysis">
              {!screeData ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Use the scree plot to find the optimal number of factors.
                  </p>
                  <Button
                    variant="secondary"
                    onClick={handleLoadScree}
                    disabled={isLoadingScree || isLoadingVariables}
                    fullWidth
                  >
                    {isLoadingScree ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Calculating...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Calculate Scree Plot
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Recommended K Badge */}
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-sm font-medium text-green-700">
                      Recommended Factors
                    </div>
                    <div className="text-2xl font-bold text-green-800">
                      {screeData.optimal_factors}
                    </div>
                    <div className="text-xs text-green-600">
                      Kaiser criterion (eigenvalue &gt; 1)
                    </div>
                  </div>

                  {/* Cumulative Variance bars */}
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-gray-500">
                      Cumulative Variance Explained
                    </div>
                    {screeData.results.map((point) => (
                      <div key={point.n_factors} className="flex items-center gap-2">
                        <span className="w-8 text-xs text-gray-500">
                          F={point.n_factors}
                        </span>
                        <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              point.n_factors === screeData.optimal_factors
                                ? 'bg-green-500'
                                : 'bg-primary-400'
                            }`}
                            style={{ width: `${point.explained_variance_ratio * 100}%` }}
                          />
                        </div>
                        <span className="w-12 text-xs text-gray-600 text-right">
                          {(point.explained_variance_ratio * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Scree Plot Chart - Eigenvalues */}
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-2">
                      Scree Plot (Eigenvalues)
                    </div>
                    <div className="h-44">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={screeData.results.map((r) => ({
                            factors: r.n_factors,
                            eigenvalue: r.eigenvalue,
                            isOptimal: r.n_factors === screeData.optimal_factors,
                          }))}
                          margin={{ top: 10, right: 15, left: -5, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis
                            dataKey="factors"
                            tick={{ fontSize: 10 }}
                            tickLine={{ stroke: '#9ca3af' }}
                          />
                          <YAxis
                            tick={{ fontSize: 10 }}
                            tickLine={{ stroke: '#9ca3af' }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '6px',
                              fontSize: '11px',
                            }}
                            formatter={(value: number) => [value.toFixed(2), 'Eigenvalue']}
                          />
                          {/* Kaiser criterion line at eigenvalue = 1 */}
                          <ReferenceLine
                            y={1}
                            stroke="#ef4444"
                            strokeDasharray="5 5"
                            strokeWidth={1.5}
                          />
                          <Line
                            type="monotone"
                            dataKey="eigenvalue"
                            stroke="#0284c7"
                            strokeWidth={2}
                            dot={({ cx, cy, payload }) => (
                              <circle
                                key={payload.factors}
                                cx={cx}
                                cy={cy}
                                r={payload.isOptimal ? 8 : 5}
                                fill={payload.isOptimal ? '#10b981' : '#0284c7'}
                                stroke={payload.isOptimal ? '#059669' : '#0369a1'}
                                strokeWidth={2}
                              />
                            )}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      Red line = Kaiser criterion (eigenvalue = 1)
                    </p>
                  </div>
                </div>
              )}
            </Card>

            {/* Quick Stats when model is trained */}
            {trainResults && (
              <Card title="Model Status" subtitle="Current configuration">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="text-sm text-green-700">Status</span>
                    <span className="text-sm font-medium text-green-800">
                      Trained
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Factors</span>
                    <span className="text-sm font-medium text-gray-800">
                      {trainResults.n_factors}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Variables</span>
                    <span className="text-sm font-medium text-gray-800">
                      {trainResults.variables_used.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Variance</span>
                    <span className="text-sm font-medium text-gray-800">
                      {(trainResults.total_variance_explained * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </Card>
            )}
          </>
        }
      >
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoadingVariables ? (
          <Card>
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600 mr-3" />
              <span className="text-gray-600">Loading factor analysis variables...</span>
            </div>
          </Card>
        ) : (
          <>
            {/* Tab Navigation */}
            <div className="mb-6 border-b border-gray-200">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('config')}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'config'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <GitBranch className="w-4 h-4 inline mr-2" />
                  Configuration & Training
                </button>
                <button
                  onClick={() => setActiveTab('recommend')}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'recommend'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Target className="w-4 h-4 inline mr-2" />
                  Get Recommendations
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'config' && (
              <div className="space-y-6">
                {/* Collapsible Configuration Form */}
                <Card>
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setIsConfigCollapsed(!isConfigCollapsed)}
                  >
                    <div className="flex items-center gap-3">
                      <Settings className="w-5 h-5 text-primary-600" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Factor Analysis Configuration
                        </h3>
                        <p className="text-sm text-gray-500">
                          {trainResults
                            ? `Model trained with ${trainResults.n_factors} factors`
                            : 'Configure dimensionality reduction parameters'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {trainResults && (
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
                        <FactorialConfigForm
                          variables={variables}
                          defaultVariables={defaultVariables}
                          isLoading={isTraining}
                          optimalFactors={screeData?.optimal_factors}
                          onTrain={handleTrain}
                        />
                      </div>
                    </div>
                  </div>
                </Card>

                {trainResults && (
                  <>
                    <FactorialResults trainResults={trainResults} />
                    <FactorialCharts trainResults={trainResults} />
                  </>
                )}
              </div>
            )}

            {activeTab === 'recommend' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FactorialRecommendForm
                  variables={trainResults?.variables_used || []}
                  variableDisplayNames={variableDisplayNames}
                  isLoading={isRecommending}
                  modelTrained={!!trainResults}
                  onRecommend={handleRecommend}
                />

                <FactorialRecommendations results={recommendations} />
              </div>
            )}
          </>
        )}
      </AppShell>
    </>
  );
};
