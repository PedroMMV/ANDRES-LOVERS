/**
 * Clustering Page
 * K-Means clustering analysis and recommendations for greases
 */

import React, { useState, useEffect } from 'react';
import { AppShell } from '../layouts/AppShell';
import { Card } from '../components/common/Card';
import { SEO } from '../components/common/SEO';
import { Button } from '../components/common/Button';
import {
  ClusteringConfigForm,
  ClusteringResults,
  ClusterRecommendForm,
  ClusterRecommendations,
  ClusterDistributionChart,
  ClusterRadarChart,
} from '../components/clustering';
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
  Layers,
  AlertCircle,
  Loader2,
  TrendingUp,
  Target,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Settings,
  CheckCircle,
} from 'lucide-react';
import {
  getClusteringVariables,
  trainClusteringModel,
  getClustersSummary,
  getClusterRecommendations,
  getElbowData,
} from '../services/clusteringService';
import type {
  ClusterVariable,
  ClusterTrainResults,
  ClustersSummaryResponse,
  ClusterRecommendResponse,
  ElbowAnalysis,
} from '../types/clustering';

export const Clustering: React.FC = () => {
  // State
  const [variables, setVariables] = useState<ClusterVariable[]>([]);
  const [defaultVariables, setDefaultVariables] = useState<string[]>([]);
  const [trainResults, setTrainResults] = useState<ClusterTrainResults | null>(null);
  const [summary, setSummary] = useState<ClustersSummaryResponse | null>(null);
  const [recommendations, setRecommendations] = useState<ClusterRecommendResponse | null>(null);
  const [elbowData, setElbowData] = useState<ElbowAnalysis | null>(null);

  // Loading states
  const [isLoadingVariables, setIsLoadingVariables] = useState(true);
  const [isTraining, setIsTraining] = useState(false);
  const [isRecommending, setIsRecommending] = useState(false);
  const [isLoadingElbow, setIsLoadingElbow] = useState(false);

  // UI states
  const [isConfigCollapsed, setIsConfigCollapsed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'config' | 'recommend'>('config');

  // Load variables on mount
  useEffect(() => {
    loadVariables();
  }, []);

  const loadVariables = async () => {
    setIsLoadingVariables(true);
    setError(null);
    try {
      const response = await getClusteringVariables();
      setVariables(response.variables);
      setDefaultVariables(response.default_variables);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load variables');
    } finally {
      setIsLoadingVariables(false);
    }
  };

  const handleTrain = async (config: {
    n_clusters: number;
    variables: string[];
    scale: boolean;
  }) => {
    setIsTraining(true);
    setError(null);
    try {
      const result = await trainClusteringModel({
        n_clusters: config.n_clusters,
        variables: config.variables,
        scale: config.scale,
      });
      setTrainResults(result);

      // Load summary after training
      const summaryResult = await getClustersSummary();
      setSummary(summaryResult);

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
      const result = await getClusterRecommendations({
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

  const handleLoadElbow = async () => {
    setIsLoadingElbow(true);
    setError(null);
    try {
      const result = await getElbowData(10);
      setElbowData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load elbow data');
    } finally {
      setIsLoadingElbow(false);
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
        title="Clustering Analysis | Interlub Grease Recommender"
        description="K-Means clustering analysis for industrial grease recommendations"
        keywords={['clustering', 'k-means', 'grease', 'analysis', 'recommendations']}
      />
      <AppShell
        sidebar={
          <>
            {/* Info Card - Only when no results */}
            {!trainResults && (
              <Card title="About Clustering" subtitle="How it works">
                <div className="text-sm text-gray-600 space-y-3">
                  <div className="flex items-start gap-2">
                    <Layers className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
                    <p>
                      <strong>K-Means Clustering</strong> groups similar greases
                      based on their technical properties.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <p>
                      <strong>Silhouette Score</strong> measures how similar
                      products are to their own cluster vs other clusters.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Target className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <p>
                      <strong>Recommendations</strong> find products in your
                      assigned cluster closest to your requirements.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Elbow Method Card */}
            <Card title="Optimal K" subtitle="Elbow method analysis">
              {!elbowData ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Use the elbow method to find the optimal number of clusters.
                  </p>
                  <Button
                    variant="secondary"
                    onClick={handleLoadElbow}
                    disabled={isLoadingElbow || isLoadingVariables}
                    fullWidth
                  >
                    {isLoadingElbow ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Calculating...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Calculate Elbow
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Recommended K Badge */}
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-sm font-medium text-green-700">
                      Recommended K
                    </div>
                    <div className="text-2xl font-bold text-green-800">
                      {elbowData.optimal_k}
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      Silhouette: {elbowData.results.find(r => r.k === elbowData.optimal_k)?.silhouette.toFixed(4)}
                    </div>
                    <div className="text-xs text-green-600">
                      Inertia: {elbowData.results.find(r => r.k === elbowData.optimal_k)?.inertia.toFixed(2)}
                    </div>
                  </div>

                  {/* Silhouette Score Chart */}
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-2">
                      Silhouette Score
                    </div>
                    <div className="h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={elbowData.results.map((r) => ({
                            k: r.k,
                            silhouette: r.silhouette,
                          }))}
                          margin={{ top: 5, right: 10, left: -15, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis
                            dataKey="k"
                            tick={{ fontSize: 10 }}
                            tickLine={{ stroke: '#9ca3af' }}
                          />
                          <YAxis
                            tick={{ fontSize: 10 }}
                            tickLine={{ stroke: '#9ca3af' }}
                            domain={[0, 'auto']}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '6px',
                              fontSize: '11px',
                            }}
                            formatter={(value: number) => [value.toFixed(4), 'Silhouette']}
                          />
                          <ReferenceLine
                            x={elbowData.optimal_k}
                            stroke="#10b981"
                            strokeDasharray="5 5"
                            strokeWidth={2}
                          />
                          <Line
                            type="monotone"
                            dataKey="silhouette"
                            stroke="#0ea5e9"
                            strokeWidth={2}
                            dot={{ fill: '#0ea5e9', strokeWidth: 0, r: 3 }}
                            activeDot={{ r: 5, fill: '#0284c7' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      Higher = better separation
                    </p>
                  </div>

                  {/* Inertia Chart */}
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-2">
                      Inertia (WCSS)
                    </div>
                    <div className="h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={elbowData.results.map((r) => ({
                            k: r.k,
                            inertia: r.inertia,
                          }))}
                          margin={{ top: 5, right: 10, left: -15, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis
                            dataKey="k"
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
                            formatter={(value: number) => [value.toFixed(2), 'Inertia']}
                          />
                          <ReferenceLine
                            x={elbowData.optimal_k}
                            stroke="#10b981"
                            strokeDasharray="5 5"
                            strokeWidth={2}
                          />
                          <Line
                            type="monotone"
                            dataKey="inertia"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            dot={{ fill: '#f59e0b', strokeWidth: 0, r: 3 }}
                            activeDot={{ r: 5, fill: '#d97706' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      Look for the "elbow" point
                    </p>
                  </div>
                </div>
              )}
            </Card>

            {/* Model Status - Only when trained */}
            {trainResults && (
              <Card title="Model Status" subtitle="Current configuration">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="text-sm text-green-700">Status</span>
                    <span className="text-sm font-medium text-green-800 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Trained
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Clusters</span>
                    <span className="text-sm font-medium text-gray-800">
                      {trainResults.n_clusters}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Variables</span>
                    <span className="text-sm font-medium text-gray-800">
                      {trainResults.variables_used.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Silhouette</span>
                    <span className="text-sm font-medium text-gray-800">
                      {trainResults.silhouette_score?.toFixed(3) || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">Records</span>
                    <span className="text-sm font-medium text-gray-800">
                      {trainResults.total_clustered}
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
              <span className="text-gray-600">Loading clustering variables...</span>
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
                  <Layers className="w-4 h-4 inline mr-2" />
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
                          Clustering Configuration
                        </h3>
                        <p className="text-sm text-gray-500">
                          {trainResults
                            ? `Model trained with K=${trainResults.n_clusters}`
                            : 'Configure K-Means parameters'}
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
                        <ClusteringConfigForm
                          variables={variables}
                          defaultVariables={defaultVariables}
                          isLoading={isTraining}
                          optimalK={elbowData?.optimal_k}
                          onTrain={handleTrain}
                        />
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Results Section - Show after training */}
                {trainResults && (
                  <>
                    {/* Training Metrics */}
                    <ClusteringResults
                      trainResults={trainResults}
                      summary={summary}
                    />

                    {/* Distribution Chart */}
                    <ClusterDistributionChart trainResults={trainResults} />

                    {/* Radar Chart */}
                    {summary && <ClusterRadarChart summary={summary} />}
                  </>
                )}
              </div>
            )}

            {activeTab === 'recommend' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ClusterRecommendForm
                  variables={trainResults?.variables_used || []}
                  variableDisplayNames={variableDisplayNames}
                  isLoading={isRecommending}
                  modelTrained={!!trainResults}
                  onRecommend={handleRecommend}
                />

                <ClusterRecommendations results={recommendations} />
              </div>
            )}
          </>
        )}
      </AppShell>
    </>
  );
};
