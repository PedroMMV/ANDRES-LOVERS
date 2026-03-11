/**
 * Factor Analysis Results Display Component
 * Shows training results summary metrics
 */

import React from 'react';
import { Card } from '../common/Card';
import { CheckCircle } from 'lucide-react';
import type { FactorialTrainResults } from '../../types/factorial';

interface FactorialResultsProps {
  trainResults: FactorialTrainResults;
}

export const FactorialResults: React.FC<FactorialResultsProps> = ({
  trainResults,
}) => {
  return (
    <Card
      title="Training Results"
      subtitle="Factor Analysis model metrics"
      headerAction={<CheckCircle className="w-5 h-5 text-green-600" />}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-700">
            {trainResults.n_factors}
          </div>
          <div className="text-xs text-green-600">Factors Extracted</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-700">
            {trainResults.n_samples}
          </div>
          <div className="text-xs text-blue-600">Samples Used</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-700">
            {trainResults.variables_used.length}
          </div>
          <div className="text-xs text-purple-600">Variables</div>
        </div>
        <div className="bg-amber-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-amber-700">
            {(trainResults.total_variance_explained * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-amber-600">Variance Explained</div>
        </div>
      </div>

      {/* Variables Used */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Variables Used</h4>
        <div className="flex flex-wrap gap-2">
          {trainResults.variables_used.map((variable) => (
            <span
              key={variable}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
            >
              {variable}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
};
