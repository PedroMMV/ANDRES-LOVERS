/**
 * Factor Analysis Charts Component
 * Displays variance explained chart and factor loadings visualization
 */

import React from 'react';
import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { Card } from '../common/Card';
import { TrendingUp, BarChart3, GitBranch } from 'lucide-react';
import type { FactorialTrainResults } from '../../types/factorial';

interface FactorialChartsProps {
  trainResults: FactorialTrainResults;
}

// Color palette for factors
const FACTOR_COLORS = ['#0284c7', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export const FactorialCharts: React.FC<FactorialChartsProps> = ({
  trainResults,
}) => {
  // Prepare variance explained data
  const varianceData = trainResults.explained_variance_ratio.map((ratio, idx) => ({
    factor: `F${idx + 1}`,
    factorFull: `Factor ${idx + 1}`,
    variance: ratio * 100,
    cumulative: trainResults.cumulative_variance_ratio[idx] * 100,
  }));

  // Prepare loadings data for bar chart
  const loadingsData = trainResults.loadings.variables.map((variable, varIdx) => {
    const dataPoint: Record<string, string | number> = {
      variable: variable.length > 15 ? variable.slice(0, 12) + '...' : variable,
      variableFull: variable,
    };
    trainResults.loadings.factors.forEach((factor, factorIdx) => {
      dataPoint[factor] = trainResults.loadings.matrix[varIdx][factorIdx];
    });
    return dataPoint;
  });

  // Prepare radar chart data for factor loadings
  const radarData = trainResults.loadings.variables.map((variable, varIdx) => {
    const dataPoint: Record<string, string | number> = {
      variable: variable.length > 12 ? variable.slice(0, 10) + '...' : variable,
    };
    trainResults.loadings.factors.forEach((factor, factorIdx) => {
      // Use absolute value for radar chart
      dataPoint[factor] = Math.abs(trainResults.loadings.matrix[varIdx][factorIdx]);
    });
    return dataPoint;
  });

  return (
    <div className="space-y-6">
      {/* Variance Explained Chart */}
      <Card
        title="Variance Explained"
        subtitle="Individual and cumulative variance by factor"
        headerAction={<TrendingUp className="w-5 h-5 text-primary-600" />}
      >
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={varianceData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="factor"
                tick={{ fontSize: 12 }}
                label={{ value: 'Factors', position: 'bottom', offset: 40 }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                label={{ value: 'Variance (%)', angle: -90, position: 'insideLeft', offset: 10 }}
                domain={[0, 100]}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                        <p className="font-semibold text-gray-900">{data.factorFull}</p>
                        <p className="text-sm text-primary-600">
                          Individual: {data.variance.toFixed(1)}%
                        </p>
                        <p className="text-sm text-green-600">
                          Cumulative: {data.cumulative.toFixed(1)}%
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend verticalAlign="top" height={36} />
              <Bar
                dataKey="variance"
                name="Individual Variance"
                fill="#0284c7"
                radius={[4, 4, 0, 0]}
              />
              <Line
                type="monotone"
                dataKey="cumulative"
                name="Cumulative Variance"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Total variance explained: {(trainResults.total_variance_explained * 100).toFixed(1)}%
        </p>
      </Card>

      {/* Factor Loadings Bar Chart */}
      <Card
        title="Factor Loadings"
        subtitle="Variable contributions to each factor"
        headerAction={<BarChart3 className="w-5 h-5 text-primary-600" />}
      >
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={loadingsData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 120, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                type="number"
                domain={[-1, 1]}
                tick={{ fontSize: 11 }}
                label={{ value: 'Loading Value', position: 'bottom', offset: 40 }}
              />
              <YAxis
                type="category"
                dataKey="variable"
                tick={{ fontSize: 11 }}
                width={110}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                        <p className="font-semibold text-gray-900 mb-2">{data.variableFull}</p>
                        {trainResults.loadings.factors.map((factor, idx) => (
                          <p key={factor} className="text-sm" style={{ color: FACTOR_COLORS[idx] }}>
                            {factor}: {(data[factor] as number).toFixed(3)}
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend verticalAlign="top" height={36} />
              {trainResults.loadings.factors.map((factor, idx) => (
                <Bar
                  key={factor}
                  dataKey={factor}
                  name={factor}
                  fill={FACTOR_COLORS[idx % FACTOR_COLORS.length]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-green-500 rounded"></span>
            Strong positive (&gt;0.5)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-red-500 rounded"></span>
            Strong negative (&lt;-0.5)
          </span>
        </div>
      </Card>

      {/* Radar Chart for Factor Profile */}
      {trainResults.loadings.factors.length <= 4 && (
        <Card
          title="Factor Profile (Radar)"
          subtitle="Absolute loadings by variable for each factor"
          headerAction={<GitBranch className="w-5 h-5 text-primary-600" />}
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis
                  dataKey="variable"
                  tick={{ fontSize: 10, fill: '#6b7280' }}
                />
                <PolarRadiusAxis
                  domain={[0, 1]}
                  tick={{ fontSize: 10 }}
                  tickCount={5}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                          {payload.map((entry, idx) => (
                            <p key={idx} className="text-sm" style={{ color: entry.color }}>
                              {entry.name}: {(entry.value as number).toFixed(3)}
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                {trainResults.loadings.factors.map((factor, idx) => (
                  <Radar
                    key={factor}
                    name={factor}
                    dataKey={factor}
                    stroke={FACTOR_COLORS[idx % FACTOR_COLORS.length]}
                    fill={FACTOR_COLORS[idx % FACTOR_COLORS.length]}
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                ))}
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Shows absolute loading values. Larger areas indicate stronger factor-variable relationships.
          </p>
        </Card>
      )}
    </div>
  );
};
