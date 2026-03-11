/**
 * Regression charts component
 * Displays scatter plot of actual vs predicted values and residuals histogram
 */

import React from 'react';
import {
  ScatterChart,
  Scatter,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from 'recharts';
import type { ActualVsPredicted } from '../../types/regression';

interface RegressionChartsProps {
  actualVsPredicted: ActualVsPredicted[];
  residuals: number[];
}

export const RegressionCharts: React.FC<RegressionChartsProps> = ({
  actualVsPredicted,
  residuals,
}) => {
  // Prepare residuals histogram data
  const binSize = 10;
  const residualBins: { [key: string]: number } = {};

  residuals.forEach((r) => {
    const bin = Math.floor(r / binSize) * binSize;
    const binLabel = `${bin}`;
    residualBins[binLabel] = (residualBins[binLabel] || 0) + 1;
  });

  const histogramData = Object.entries(residualBins)
    .map(([bin, count]) => ({
      bin: parseFloat(bin),
      count,
    }))
    .sort((a, b) => a.bin - b.bin);

  return (
    <div className="space-y-6">
      {/* Actual vs Predicted Scatter Plot */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          Actual vs Predicted Values
        </h4>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                type="number"
                dataKey="actual"
                name="Actual"
                label={{ value: 'Actual Values', position: 'insideBottom', offset: -10 }}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                type="number"
                dataKey="predicted"
                name="Predicted"
                label={{ value: 'Predicted Values', angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                        <p className="text-sm text-gray-900">
                          <strong>Actual:</strong> {payload[0].value?.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-900">
                          <strong>Predicted:</strong> {payload[1].value?.toFixed(2)}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine
                stroke="#9ca3af"
                strokeDasharray="5 5"
                segment={[
                  { x: Math.min(...actualVsPredicted.map(d => d.actual)), y: Math.min(...actualVsPredicted.map(d => d.actual)) },
                  { x: Math.max(...actualVsPredicted.map(d => d.actual)), y: Math.max(...actualVsPredicted.map(d => d.actual)) },
                ]}
              />
              <Scatter
                name="Predictions"
                data={actualVsPredicted}
                fill="#0284c7"
                fillOpacity={0.6}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Points closer to the diagonal line indicate better predictions.
        </p>
      </div>

      {/* Residuals Histogram */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          Residuals Distribution
        </h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={histogramData} margin={{ top: 20, right: 30, left: 30, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="bin"
                label={{ value: 'Residual (Predicted - Actual)', position: 'insideBottom', offset: -10 }}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                        <p className="text-sm text-gray-900">
                          <strong>Residual Range:</strong> {payload[0].payload.bin} to {payload[0].payload.bin + binSize}
                        </p>
                        <p className="text-sm text-gray-900">
                          <strong>Count:</strong> {payload[0].value}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Residuals should be randomly distributed around zero for a good model.
        </p>
      </div>
    </div>
  );
};
