/**
 * Clustering Charts Components
 * Visualizations for clustering analysis
 */

import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import { Card } from '../common/Card';
import { TrendingUp, PieChart as PieIcon, Activity, Grid3X3, BarChart2 } from 'lucide-react';
import type { ElbowAnalysis, ClusterTrainResults, ClustersSummaryResponse } from '../../types/clustering';

// Color palette for clusters
const CLUSTER_COLORS = [
  '#0ea5e9', // primary-500
  '#8b5cf6', // violet-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
  '#f97316', // orange-500
  '#6366f1', // indigo-500
];

interface ElbowChartProps {
  data: ElbowAnalysis;
  optimalK: number;
}

export const ElbowChart: React.FC<ElbowChartProps> = ({ data, optimalK }) => {
  const chartData = data.results.map((point) => ({
    k: point.k,
    inertia: point.inertia,
    silhouette: point.silhouette,
    isOptimal: point.k === optimalK,
  }));

  return (
    <Card
      title="Elbow Method Analysis"
      subtitle="Find the optimal number of clusters"
      headerAction={<TrendingUp className="w-5 h-5 text-primary-600" />}
    >
      <div className="space-y-6">
        {/* Silhouette Score Chart */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Silhouette Score by K</h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="k"
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#9ca3af' }}
                  label={{ value: 'Number of Clusters (K)', position: 'bottom', offset: 10, fontSize: 12 }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#9ca3af' }}
                  domain={[0, 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [value.toFixed(4), 'Silhouette']}
                />
                <Line
                  type="monotone"
                  dataKey="silhouette"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={(props: any) => {
                    const { cx, cy, payload } = props;
                    if (payload.isOptimal) {
                      return (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={8}
                          fill="#10b981"
                          stroke="#fff"
                          strokeWidth={2}
                        />
                      );
                    }
                    return <circle cx={cx} cy={cy} r={4} fill="#10b981" />;
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Higher silhouette score = better cluster separation. Optimal K = {optimalK}
          </p>
        </div>

        {/* Inertia Chart */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Inertia (Within-cluster sum of squares)</h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="k"
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#9ca3af' }}
                  label={{ value: 'Number of Clusters (K)', position: 'bottom', offset: 10, fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} tickLine={{ stroke: '#9ca3af' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [value.toFixed(2), 'Inertia']}
                />
                <Line
                  type="monotone"
                  dataKey="inertia"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  dot={(props: any) => {
                    const { cx, cy, payload } = props;
                    if (payload.isOptimal) {
                      return (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={8}
                          fill="#0ea5e9"
                          stroke="#fff"
                          strokeWidth={2}
                        />
                      );
                    }
                    return <circle cx={cx} cy={cy} r={4} fill="#0ea5e9" />;
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Look for the "elbow" where inertia decreases slower
          </p>
        </div>
      </div>
    </Card>
  );
};

interface ClusterDistributionChartProps {
  trainResults: ClusterTrainResults;
}

export const ClusterDistributionChart: React.FC<ClusterDistributionChartProps> = ({
  trainResults,
}) => {
  const pieData = Object.entries(trainResults.cluster_counts).map(([clusterId, count]) => ({
    name: `Cluster ${clusterId}`,
    value: count,
    percentage: ((count / trainResults.total_clustered) * 100).toFixed(1),
  }));

  const barData = Object.entries(trainResults.cluster_counts).map(([clusterId, count]) => ({
    cluster: `C${clusterId}`,
    count,
    percentage: (count / trainResults.total_clustered) * 100,
  }));

  return (
    <Card
      title="Cluster Distribution"
      subtitle="Products per cluster"
      headerAction={<PieIcon className="w-5 h-5 text-primary-600" />}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 text-center">Distribution</h4>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percentage }) => `${percentage}%`}
                  labelLine={{ stroke: '#9ca3af', strokeWidth: 1 }}
                >
                  {pieData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CLUSTER_COLORS[index % CLUSTER_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number, name: string) => [
                    `${value} products`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 text-center">Count by Cluster</h4>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="cluster" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [`${value} products`, 'Count']}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {barData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CLUSTER_COLORS[index % CLUSTER_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-4 pt-4 border-t border-gray-100">
        {pieData.map((item, index) => (
          <div key={item.name} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: CLUSTER_COLORS[index % CLUSTER_COLORS.length] }}
            />
            <span className="text-xs text-gray-600">
              {item.name}: {item.value}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};

interface ClusterRadarChartProps {
  summary: ClustersSummaryResponse;
}

export const ClusterRadarChart: React.FC<ClusterRadarChartProps> = ({ summary }) => {
  if (!summary || summary.clusters.length === 0) return null;

  // Get variables to show (limit to 6 for readability)
  const variables = summary.variables_analyzed.slice(0, 6);

  // Normalize data for radar chart
  const normalizeData = () => {
    // Find min/max for each variable across all clusters
    const ranges: Record<string, { min: number; max: number }> = {};
    variables.forEach((v) => {
      const values = summary.clusters
        .map((c) => c.variables[v]?.mean)
        .filter((val) => val !== undefined) as number[];
      if (values.length > 0) {
        ranges[v] = { min: Math.min(...values), max: Math.max(...values) };
      }
    });

    // Create radar data
    return variables.map((v) => {
      const point: Record<string, any> = { variable: v.slice(0, 10) }; // Truncate name
      summary.clusters.forEach((cluster) => {
        const value = cluster.variables[v]?.mean;
        if (value !== undefined && ranges[v]) {
          const range = ranges[v].max - ranges[v].min;
          point[`cluster${cluster.cluster_id}`] =
            range > 0 ? ((value - ranges[v].min) / range) * 100 : 50;
        } else {
          point[`cluster${cluster.cluster_id}`] = 0;
        }
      });
      return point;
    });
  };

  const radarData = normalizeData();

  return (
    <Card
      title="Cluster Profiles"
      subtitle="Normalized comparison across variables"
      headerAction={<Activity className="w-5 h-5 text-primary-600" />}
    >
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis dataKey="variable" tick={{ fontSize: 10 }} />
            <PolarRadiusAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
            {summary.clusters.map((cluster, index) => (
              <Radar
                key={cluster.cluster_id}
                name={`Cluster ${cluster.cluster_id}`}
                dataKey={`cluster${cluster.cluster_id}`}
                stroke={CLUSTER_COLORS[index % CLUSTER_COLORS.length]}
                fill={CLUSTER_COLORS[index % CLUSTER_COLORS.length]}
                fillOpacity={0.2}
                strokeWidth={2}
              />
            ))}
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              formatter={(value) => <span className="text-gray-700">{value}</span>}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-gray-500 text-center mt-2">
        Values normalized to 0-100 scale for comparison
      </p>
    </Card>
  );
};

interface CorrelationHeatmapProps {
  matrix: number[][];
  variables: string[];
}

export const CorrelationHeatmap: React.FC<CorrelationHeatmapProps> = ({
  matrix,
  variables,
}) => {
  // Convert matrix to scatter plot data for heatmap effect
  const heatmapData: { x: number; y: number; value: number; xVar: string; yVar: string }[] = [];

  matrix.forEach((row, i) => {
    row.forEach((value, j) => {
      heatmapData.push({
        x: j,
        y: i,
        value,
        xVar: variables[j],
        yVar: variables[i],
      });
    });
  });

  const getColor = (value: number) => {
    if (value >= 0.7) return '#166534'; // green-800
    if (value >= 0.5) return '#16a34a'; // green-600
    if (value >= 0.3) return '#4ade80'; // green-400
    if (value >= 0) return '#bbf7d0'; // green-200
    if (value >= -0.3) return '#fecaca'; // red-200
    if (value >= -0.5) return '#f87171'; // red-400
    if (value >= -0.7) return '#dc2626'; // red-600
    return '#991b1b'; // red-800
  };

  return (
    <Card
      title="Correlation Matrix"
      subtitle="Variable relationships"
      headerAction={<Grid3X3 className="w-5 h-5 text-primary-600" />}
    >
      <div className="overflow-x-auto">
        <div className="min-w-[400px]">
          {/* Heatmap Grid */}
          <div className="flex">
            {/* Y-axis labels */}
            <div className="flex flex-col justify-around pr-2 py-4">
              {variables.map((v) => (
                <div key={v} className="text-xs text-gray-600 truncate w-20 text-right">
                  {v.slice(0, 12)}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="flex-1">
              <div
                className="grid gap-0.5"
                style={{
                  gridTemplateColumns: `repeat(${variables.length}, minmax(0, 1fr))`,
                }}
              >
                {matrix.map((row, i) =>
                  row.map((value, j) => (
                    <div
                      key={`${i}-${j}`}
                      className="aspect-square rounded-sm flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: getColor(value) }}
                      title={`${variables[i]} vs ${variables[j]}: ${value.toFixed(3)}`}
                    >
                      <span className="text-[9px] font-medium text-white drop-shadow-sm">
                        {value.toFixed(2)}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* X-axis labels */}
              <div className="flex justify-around mt-2">
                {variables.map((v) => (
                  <div
                    key={v}
                    className="text-xs text-gray-600 truncate transform -rotate-45 origin-left"
                    style={{ width: '60px' }}
                  >
                    {v.slice(0, 8)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-gray-100">
            <span className="text-xs text-gray-500">-1</span>
            <div className="flex h-3 rounded overflow-hidden">
              {['#991b1b', '#dc2626', '#f87171', '#fecaca', '#bbf7d0', '#4ade80', '#16a34a', '#166534'].map(
                (color) => (
                  <div key={color} className="w-6" style={{ backgroundColor: color }} />
                )
              )}
            </div>
            <span className="text-xs text-gray-500">+1</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
