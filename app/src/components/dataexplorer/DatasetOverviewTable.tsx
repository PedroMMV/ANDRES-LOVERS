/**
 * Dataset overview table component
 * Shows comprehensive information about each feature in the dataset
 */

import React from 'react';
import type { DatasetFeature } from '../../types/metrics';

interface DatasetOverviewTableProps {
  features: DatasetFeature[];
}

export const DatasetOverviewTable: React.FC<DatasetOverviewTableProps> = ({
  features,
}) => {
  return (
    <div className="overflow-x-auto custom-scrollbar">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Feature Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Missing (%)
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Non-Null Count
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {features.map((feature) => (
            <tr key={feature.name} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {feature.name}
                  </div>
                  {feature.description && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      {feature.description}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  feature.originalType === 'numeric'
                    ? 'bg-blue-100 text-blue-800'
                    : feature.originalType === 'categorical'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {feature.originalType}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-1 w-16 h-2 bg-gray-200 rounded-full mr-2">
                    <div
                      className={`h-full rounded-full ${
                        feature.missingPercentage > 10
                          ? 'bg-red-500'
                          : feature.missingPercentage > 5
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(feature.missingPercentage, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-900 font-medium">
                    {feature.missingPercentage.toFixed(1)}%
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {feature.nonNullCount ?? 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
