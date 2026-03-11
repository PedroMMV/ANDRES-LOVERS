/**
 * Cluster Recommendations Display Component
 * Shows recommended greases based on clustering
 */

import React from 'react';
import { Card } from '../common/Card';
import { Award, Star, Layers, ChevronDown, ChevronUp } from 'lucide-react';
import type { ClusterRecommendResponse } from '../../types/clustering';

interface ClusterRecommendationsProps {
  results: ClusterRecommendResponse | null;
}

export const ClusterRecommendations: React.FC<ClusterRecommendationsProps> = ({
  results,
}) => {
  const [expandedIndex, setExpandedIndex] = React.useState<number | null>(0);

  if (!results || results.recommendations.length === 0) {
    return null;
  }

  return (
    <Card
      title="Recommended Greases"
      subtitle={`Cluster ${results.user_cluster} - ${results.count} matches found`}
      headerAction={<Award className="w-5 h-5 text-primary-600" />}
    >
      <div className="space-y-3">
        {results.recommendations.map((rec, index) => (
          <div
            key={rec.product.id}
            className={`border rounded-lg overflow-hidden transition-all ${
              index === 0
                ? 'border-primary-300 bg-primary-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            {/* Header */}
            <div
              className="p-4 cursor-pointer"
              onClick={() =>
                setExpandedIndex(expandedIndex === index ? null : index)
              }
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      index === 0
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {index === 0 ? (
                      <Star className="w-4 h-4" />
                    ) : (
                      <span className="text-sm font-medium">{rec.rank}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {rec.product.nombre}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {rec.product.aceite_base && rec.product.espesante
                        ? `${rec.product.aceite_base} / ${rec.product.espesante}`
                        : rec.product.aceite_base || rec.product.espesante || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary-600">
                      {rec.similarity_percentage.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">Similarity</div>
                  </div>
                  {expandedIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
            </div>

            {/* Expanded Content */}
            {expandedIndex === index && (
              <div className="px-4 pb-4 border-t border-gray-100">
                {/* Cluster & Distance Info */}
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700">
                    <Layers className="w-3 h-3 mr-1" />
                    Cluster {rec.cluster}
                  </span>
                  <span className="text-gray-500">
                    Distance: {rec.distance.toFixed(4)}
                  </span>
                </div>

                {/* Feature Values */}
                <div className="mt-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">
                    Feature Values
                  </h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {Object.entries(rec.feature_values).map(([key, value]) => (
                      <div
                        key={key}
                        className="bg-gray-50 rounded px-2 py-1 text-sm"
                      >
                        <span className="text-gray-500">{key}:</span>{' '}
                        <span className="font-medium text-gray-700">
                          {value !== null ? value.toFixed(2) : 'N/A'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description & Applications */}
                {(rec.product.descripcion || rec.product.aplicaciones) && (
                  <div className="mt-4 space-y-2">
                    {rec.product.descripcion && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700">
                          Description
                        </h5>
                        <p className="text-sm text-gray-600 mt-1">
                          {rec.product.descripcion.slice(0, 200)}
                          {rec.product.descripcion.length > 200 ? '...' : ''}
                        </p>
                      </div>
                    )}
                    {rec.product.aplicaciones && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700">
                          Applications
                        </h5>
                        <p className="text-sm text-gray-600 mt-1">
                          {rec.product.aplicaciones.slice(0, 200)}
                          {rec.product.aplicaciones.length > 200 ? '...' : ''}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};
