/**
 * Recommendations table component
 * Displays detailed information about recommended greases
 */

import React from 'react';
import { MousePointerClick } from 'lucide-react';
import type { RecommendationResult } from '../../types/products';

interface RecommendationsTableProps {
  recommendations: RecommendationResult[];
  onViewDetails: (productId: string) => void;
  selectedProductId?: string;
}

export const RecommendationsTable: React.FC<RecommendationsTableProps> = ({
  recommendations,
  onViewDetails,
  selectedProductId,
}) => {
  return (
    <div>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Base Oil
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thickener
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                NLGI
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Visc. 40°C
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Drop Pt.
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Temp Range
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Penetración
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sold. 4 Bolas
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Desg. 4 Bolas
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Carga Timken
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Similarity
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {recommendations.map((rec) => {
              const isSelected = selectedProductId === rec.product.id;
              const isRival = rec.origen === 'rival';
              return (
              <tr
                key={rec.product.id}
                onClick={() => onViewDetails(rec.product.id)}
                className={`transition-colors cursor-pointer ${
                  isSelected
                    ? isRival
                      ? 'bg-orange-100'
                      : 'bg-primary-100'
                    : isRival
                      ? 'hover:bg-orange-50'
                      : 'hover:bg-primary-50'
                }`}
              >
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  {rec.product.id}
                  {rec.origen === 'rival' && (
                    <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-1 py-0.5 rounded">rival</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {rec.product.name}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                  {rec.product.aceiteBase || '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                  {rec.product.espesante || '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                  {rec.product.nlgiGrade ?? '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                  {rec.product.viscosidad40C ? `${rec.product.viscosidad40C} cSt` : '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                  {rec.product.puntoGota ? `${rec.product.puntoGota}°C` : '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                  {rec.product.tempMin != null && rec.product.tempMax != null
                    ? `${rec.product.tempMin}° to ${rec.product.tempMax}°C`
                    : '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                  {rec.product.penetracion ? `${rec.product.penetracion}` : '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                  {rec.product.soldadura4Bolas ? `${rec.product.soldadura4Bolas} kgf` : '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                  {rec.product.desgaste4Bolas ? `${rec.product.desgaste4Bolas} mm` : '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                  {rec.product.cargaTimken ? `${rec.product.cargaTimken} lb` : '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      rec.similarityScore >= 0.8
                        ? 'bg-green-100 text-green-800'
                        : rec.similarityScore >= 0.6
                        ? 'bg-blue-100 text-blue-800'
                        : rec.similarityScore >= 0.4
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {(rec.similarityScore * 100).toFixed(0)}%
                  </span>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
        <MousePointerClick className="w-4 h-4" />
        <span>Click on a row to compare with your query in "Query vs Product Details"</span>
      </div>
    </div>
  );
};
