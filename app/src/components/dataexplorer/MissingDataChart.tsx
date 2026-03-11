/**
 * Missing data chart component
 * Visualizes percentage of missing values for each feature
 */

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { DatasetFeature } from '../../types/metrics';

interface MissingDataChartProps {
  features: DatasetFeature[];
}

export const MissingDataChart: React.FC<MissingDataChartProps> = ({
  features,
}) => {
  // Prepare chart data - only show features with missing data
  const chartData = features
    .filter(f => f.missingPercentage > 0)
    .map(f => ({
      name: f.name.length > 15 ? f.name.substring(0, 15) + '...' : f.name,
      fullName: f.name,
      missing: Math.round(f.missingPercentage * 10) / 10,
    }))
    .sort((a, b) => b.missing - a.missing);

  // Color based on severity
  const getBarColor = (value: number) => {
    if (value > 10) return '#ef4444'; // red-500
    if (value > 5) return '#f59e0b'; // amber-500
    return '#10b981'; // green-500
  };

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <p className="text-lg font-medium">No Missing Data</p>
          <p className="text-sm mt-1">All features are complete!</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              label={{ value: '% Missing', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                      <p className="font-semibold text-gray-900 text-sm">
                        {payload[0].payload.fullName}
                      </p>
                      <p className="text-red-600 font-medium text-sm mt-1">
                        {payload[0].value}% missing
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="missing" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.missing)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Explanation */}
      <div className="text-sm text-gray-600 space-y-2">
        <p className="font-medium text-gray-900">Handling Missing Data:</p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Numeric features:</strong> Impute with median value</li>
          <li><strong>Categorical features:</strong> Impute with most frequent value</li>
          <li>Features with {'>'} 50% missing are excluded from similarity calculation</li>
        </ul>
      </div>
    </div>
  );
};
