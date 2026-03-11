/**
 * Clustering Results Component
 * Displays training results and cluster summaries
 */

import React from 'react';
import { Card } from '../common/Card';
import { CheckCircle, BarChart3, Layers, TrendingUp } from 'lucide-react';
import type { ClusterTrainResults, ClustersSummaryResponse } from '../../types/clustering';

interface ClusteringResultsProps {
  trainResults: ClusterTrainResults | null;
  summary: ClustersSummaryResponse | null;
  onSelectCluster?: (clusterId: number) => void;
}

export const ClusteringResults: React.FC<ClusteringResultsProps> = ({
  trainResults,
  summary,
  onSelectCluster,
}) => {
  if (!trainResults) return null;

  return (
    <div className="space-y-6">
      {/* Training Metrics */}
      <Card
        title="Training Results"
        subtitle="K-Means model metrics"
        headerAction={<CheckCircle className="w-5 h-5 text-green-500" />}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-primary-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-primary-700">
              {trainResults.n_clusters}
            </div>
            <div className="text-sm text-primary-600 mt-1">Clusters</div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-700">
              {trainResults.total_clustered}
            </div>
            <div className="text-sm text-green-600 mt-1">Records Clustered</div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-700">
              {trainResults.inertia.toFixed(0)}
            </div>
            <div className="text-sm text-purple-600 mt-1">Inertia</div>
          </div>

          <div className="bg-amber-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-amber-700">
              {trainResults.silhouette_score
                ? trainResults.silhouette_score.toFixed(3)
                : 'N/A'}
            </div>
            <div className="text-sm text-amber-600 mt-1">Silhouette Score</div>
          </div>
        </div>

        {/* Cluster Distribution */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Cluster Distribution
          </h4>
          <div className="space-y-2">
            {Object.entries(trainResults.cluster_counts).map(([clusterId, count]) => {
              const percentage = (count / trainResults.total_clustered) * 100;
              return (
                <div
                  key={clusterId}
                  className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded"
                  onClick={() => onSelectCluster?.(parseInt(clusterId))}
                >
                  <div className="w-20 text-sm font-medium text-gray-700">
                    Cluster {clusterId}
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-24 text-right text-sm text-gray-600">
                    {count} ({percentage.toFixed(1)}%)
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Cluster Summary Statistics */}
      {summary && (
        <Card
          title="Cluster Statistics"
          subtitle="Mean values per cluster"
          headerAction={<BarChart3 className="w-5 h-5 text-primary-600" />}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cluster
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Count
                  </th>
                  {summary.variables_analyzed.slice(0, 5).map((varName) => (
                    <th
                      key={varName}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {varName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {summary.clusters.map((cluster) => (
                  <tr
                    key={cluster.cluster_id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => onSelectCluster?.(cluster.cluster_id)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        Cluster {cluster.cluster_id}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {cluster.count}
                    </td>
                    {summary.variables_analyzed.slice(0, 5).map((varName) => (
                      <td
                        key={varName}
                        className="px-4 py-3 whitespace-nowrap text-sm text-gray-600"
                      >
                        {cluster.variables[varName]?.mean?.toFixed(2) ?? 'N/A'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {summary.variables_analyzed.length > 5 && (
            <p className="text-xs text-gray-500 mt-2">
              Showing 5 of {summary.variables_analyzed.length} variables
            </p>
          )}
        </Card>
      )}
    </div>
  );
};
