/**
 * Regression metrics component
 * Displays model performance metrics in tiles
 */

import React from 'react';
import { TrendingUp, Target, AlertCircle, Activity, BarChart3, Hash } from 'lucide-react';
import type { RegressionMetrics as Metrics, ModelCoefficient } from '../../types/regression';

interface RegressionMetricsProps {
  metrics: Metrics;
  coefficients?: ModelCoefficient[];
  numSamples?: number;
  numTrainSamples?: number;
  numTestSamples?: number;
}

export const RegressionMetrics: React.FC<RegressionMetricsProps> = ({
  metrics,
  coefficients,
  numSamples,
  numTrainSamples,
  numTestSamples,
}) => {
  const metricsData = [
    {
      label: 'R² (Training)',
      value: metrics.r2Train.toFixed(3),
      icon: TrendingUp,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      description: 'Variance explained on training set',
    },
    {
      label: 'R² (Test)',
      value: metrics.r2Test.toFixed(3),
      icon: Target,
      color: metrics.r2Test >= 0.7 ? 'bg-green-50 text-green-700 border-green-200' :
             metrics.r2Test >= 0.5 ? 'bg-amber-50 text-amber-700 border-amber-200' :
             'bg-red-50 text-red-700 border-red-200',
      description: 'Variance explained on test set',
    },
    {
      label: 'MAE',
      value: metrics.mae.toFixed(2),
      icon: AlertCircle,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      description: 'Mean Absolute Error',
    },
    {
      label: 'RMSE (Test)',
      value: metrics.rmseTest.toFixed(2),
      icon: Activity,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      description: 'Root Mean Squared Error',
    },
  ];

  // Determine overall quality
  const getQualityMessage = () => {
    const r2Test = metrics.r2Test;
    if (r2Test >= 0.9) return { text: 'Excellent fit', color: 'text-green-700', bg: 'bg-green-50' };
    if (r2Test >= 0.7) return { text: 'Good fit', color: 'text-blue-700', bg: 'bg-blue-50' };
    if (r2Test >= 0.5) return { text: 'Moderate fit', color: 'text-amber-700', bg: 'bg-amber-50' };
    return { text: 'Poor fit - consider other variables', color: 'text-red-700', bg: 'bg-red-50' };
  };

  const quality = getQualityMessage();

  return (
    <div className="space-y-4">
      {/* Sample info */}
      {numSamples && (
        <div className="flex items-center gap-4 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
          <div className="flex items-center">
            <Hash className="w-4 h-4 mr-1" />
            <span>Total: <strong>{numSamples}</strong></span>
          </div>
          {numTrainSamples && (
            <div>Train: <strong>{numTrainSamples}</strong></div>
          )}
          {numTestSamples && (
            <div>Test: <strong>{numTestSamples}</strong></div>
          )}
        </div>
      )}

      {/* Quality Assessment */}
      <div className={`${quality.bg} border border-gray-200 rounded-lg p-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className={`w-5 h-5 ${quality.color}`} />
            <span className="text-sm font-medium text-gray-700">Model Quality:</span>
            <span className={`text-sm font-bold ${quality.color}`}>{quality.text}</span>
          </div>
          <span className={`text-lg font-bold ${quality.color}`}>
            R² = {(metrics.r2Test * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        {metricsData.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className={`border rounded-lg p-3 ${metric.color}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-xs font-medium opacity-80">
                    {metric.label}
                  </div>
                  <div className="text-xl font-bold mt-1">
                    {metric.value}
                  </div>
                  <div className="text-xs opacity-70 mt-0.5">
                    {metric.description}
                  </div>
                </div>
                <Icon className="w-6 h-6 opacity-40" />
              </div>
            </div>
          );
        })}
      </div>

      {/* MSE comparison (train vs test) */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500">MSE Train</div>
          <div className="font-semibold text-gray-700">{metrics.mseTrain.toFixed(4)}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500">MSE Test</div>
          <div className="font-semibold text-gray-700">{metrics.mseTest.toFixed(4)}</div>
        </div>
      </div>

      {/* Feature Importance (Coefficients) */}
      {coefficients && coefficients.length > 0 && (
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <BarChart3 className="w-4 h-4 mr-2" />
            Feature Importance (Coefficients)
          </h4>
          <div className="space-y-2">
            {coefficients.slice(0, 6).map((coef, idx) => {
              const maxImportance = coefficients[0].importance;
              const barWidth = (coef.importance / maxImportance) * 100;
              const isPositive = coef.coefficient >= 0;

              return (
                <div key={coef.feature} className="flex items-center gap-2">
                  <div className="w-32 text-xs text-gray-600 truncate" title={coef.feature_display}>
                    {coef.feature_display}
                  </div>
                  <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <div className={`w-16 text-xs text-right font-mono ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {coef.coefficient >= 0 ? '+' : ''}{coef.coefficient.toFixed(3)}
                  </div>
                </div>
              );
            })}
          </div>
          {coefficients.length > 6 && (
            <div className="text-xs text-gray-500 mt-2">
              +{coefficients.length - 6} more variables
            </div>
          )}
        </div>
      )}

      {/* Help text */}
      <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 space-y-1">
        <p><strong>R²:</strong> Proportion of variance explained (0-1, higher is better)</p>
        <p><strong>MAE:</strong> Average absolute difference between prediction and actual value</p>
        <p><strong>RMSE:</strong> Root mean squared error (penalizes large errors)</p>
      </div>
    </div>
  );
};
