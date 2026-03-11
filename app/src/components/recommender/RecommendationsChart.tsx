/**
 * Recommendations chart component
 * Displays top K results as horizontal bar chart showing similarity scores
 */

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { RecommendationResult } from '../../types/products';
import { useSettings } from '../../contexts/SettingsContext';

interface RecommendationsChartProps {
  recommendations: RecommendationResult[];
}

export const RecommendationsChart: React.FC<RecommendationsChartProps> = ({
  recommendations,
}) => {
  const { settings } = useSettings();
  // Prepare data for chart
  const chartData = recommendations.map((rec) => ({
    name: rec.product.name.length > 20
      ? rec.product.name.substring(0, 20) + '...'
      : rec.product.name,
    fullName: rec.product.name,
    similarity: Math.round(rec.similarityScore * 100) / 100,
  }));

  // Color gradient for bars based on similarity
  const getBarColor = (value: number) => {
    if (value >= 0.8) return '#059669'; // green-600
    if (value >= 0.6) return '#0284c7'; // primary-600
    if (value >= 0.4) return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            type="number"
            domain={[0, 1]}
            ticks={[0, 0.2, 0.4, 0.6, 0.8, 1.0]}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12 }}
            width={90}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                    <p className="font-semibold text-gray-900 text-sm">
                      {payload[0].payload.fullName}
                    </p>
                    <p className="text-primary-600 font-medium text-sm mt-1">
                      Similarity: {payload[0].value}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="similarity" radius={[0, 4, 4, 0]} isAnimationActive={settings.chartAnimations}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.similarity)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
