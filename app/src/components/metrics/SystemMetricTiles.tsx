/**
 * System metric tiles component
 * Displays key system metrics and activity charts
 */

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Hash, Clock } from 'lucide-react';
import type { SystemMetrics } from '../../types/metrics';

interface SystemMetricTilesProps {
  metrics: SystemMetrics;
}

export const SystemMetricTiles: React.FC<SystemMetricTilesProps> = ({
  metrics,
}) => {
  const tiles = [
    {
      label: 'Total Sessions',
      value: metrics.totalSessions.toLocaleString(),
      icon: Users,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      description: 'This week',
    },
    {
      label: 'Avg. Top K',
      value: metrics.averageTopK.toFixed(1),
      icon: Hash,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      description: 'Recommendations requested',
    },
    {
      label: 'Avg. Response Time',
      value: `${metrics.averageResponseTime}ms`,
      icon: Clock,
      color: 'bg-green-50 text-green-700 border-green-200',
      description: 'Server response',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Metric Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <div
              key={tile.label}
              className={`border rounded-lg p-4 ${tile.color}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-sm font-medium opacity-80">
                    {tile.label}
                  </div>
                  <div className="text-3xl font-bold mt-2">
                    {tile.value}
                  </div>
                  <div className="text-xs opacity-70 mt-1">
                    {tile.description}
                  </div>
                </div>
                <Icon className="w-8 h-8 opacity-50" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Weekly Activity Chart */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          Weekly Activity
        </h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={metrics.weeklyActivity}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                label={{ value: 'Sessions', angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                        <p className="text-sm font-semibold text-gray-900">
                          {payload[0].payload.day}
                        </p>
                        <p className="text-sm text-primary-600 mt-1">
                          {payload[0].value} sessions
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="sessions"
                fill="#0284c7"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
