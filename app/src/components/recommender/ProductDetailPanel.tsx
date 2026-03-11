/**
 * Product detail panel component
 * Shows detailed comparison between query and selected product using radar chart
 */

import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from 'recharts';
import { Tag } from '../common/Tag';
import type { GreaseProduct } from '../../types/products';
import type { RecommenderQuery } from '../../types/products';

interface ProductDetailPanelProps {
  product: GreaseProduct;
  query: RecommenderQuery;
}

export const ProductDetailPanel: React.FC<ProductDetailPanelProps> = ({
  product,
  query,
}) => {
  // Normalize values to 0-100 scale for radar chart
  const normalizeValue = (value: number | null | undefined, min: number, max: number): number => {
    if (value === undefined || value === null) return 0;
    return ((value - min) / (max - min)) * 100;
  };

  // Prepare radar chart data
  const radarData = [
    {
      feature: 'Viscosidad',
      query: query.viscosidad40C ? normalizeValue(query.viscosidad40C, 0, 500) : null,
      product: normalizeValue(product.viscosidad40C, 0, 500),
    },
    {
      feature: 'NLGI',
      query: query.nlgiGrade !== undefined ? normalizeValue(query.nlgiGrade, 0, 6) : null,
      product: normalizeValue(product.nlgiGrade, 0, 6),
    },
    {
      feature: 'Punto Gota',
      query: query.puntoGota ? normalizeValue(query.puntoGota, 150, 320) : null,
      product: product.puntoGota ? normalizeValue(product.puntoGota, 150, 320) : null,
    },
    {
      feature: 'Temp Min',
      query: query.tempMin !== undefined ? normalizeValue(query.tempMin, -60, 0) : null,
      product: product.tempMin !== undefined ? normalizeValue(product.tempMin, -60, 0) : null,
    },
    {
      feature: 'Temp Max',
      query: query.tempMax ? normalizeValue(query.tempMax, 90, 250) : null,
      product: product.tempMax ? normalizeValue(product.tempMax, 90, 250) : null,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Product Summary */}
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
          {product.origen === 'rival' && (
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">Rival</span>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-1">ID: {product.id}</p>
        {product.subtitulo && (
          <p className="text-sm text-gray-600">{product.subtitulo}</p>
        )}
        {product.descripcion && (
          <p className="text-sm text-gray-700 mt-2">{product.descripcion}</p>
        )}
      </div>

      {/* Color & Texture Tags */}
      {(product.color || product.textura) && (
        <div className="flex flex-wrap gap-2">
          {product.color && (
            <Tag variant="secondary" size="sm">
              Color: {product.color}
            </Tag>
          )}
          {product.textura && (
            <Tag variant="secondary" size="sm">
              Textura: {product.textura}
            </Tag>
          )}
        </div>
      )}

      {/* Radar Chart Comparison */}
      <div className="pt-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          Property Comparison
        </h4>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis
                dataKey="feature"
                tick={{ fontSize: 12, fill: '#4b5563' }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fontSize: 10 }}
              />
              <Radar
                name="Your Query"
                dataKey="query"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Radar
                name="This Product"
                dataKey="product"
                stroke="#0284c7"
                fill="#0284c7"
                fillOpacity={0.5}
                strokeWidth={2}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          All values normalized to 0-100 scale. Null values in query are shown as 0.
        </p>
      </div>

      {/* Property Details */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">
          Specifications
        </h4>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-600">Aceite Base:</dt>
            <dd className="font-medium text-gray-900">{product.aceiteBase || '-'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">Espesante:</dt>
            <dd className="font-medium text-gray-900">{product.espesante || '-'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">Grado NLGI:</dt>
            <dd className="font-medium text-gray-900">{product.nlgiGrade ?? '-'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">Viscosidad @ 40°C:</dt>
            <dd className="font-medium text-gray-900">{product.viscosidad40C ? `${product.viscosidad40C} cSt` : '-'}</dd>
          </div>
          {product.penetracion && (
            <div className="flex justify-between">
              <dt className="text-gray-600">Penetración de Cono:</dt>
              <dd className="font-medium text-gray-900">{product.penetracion} (0.1 mm)</dd>
            </div>
          )}
          {product.puntoGota && (
            <div className="flex justify-between">
              <dt className="text-gray-600">Punto de Gota:</dt>
              <dd className="font-medium text-gray-900">{product.puntoGota}°C</dd>
            </div>
          )}
          {(product.tempMin != null || product.tempMax != null) && (
            <div className="flex justify-between">
              <dt className="text-gray-600">Rango de Temp. Servicio:</dt>
              <dd className="font-medium text-gray-900">
                {product.tempMin ?? '?'}°C a {product.tempMax ?? '?'}°C
              </dd>
            </div>
          )}
          {product.soldadura4Bolas && (
            <div className="flex justify-between">
              <dt className="text-gray-600">Soldadura 4 Bolas:</dt>
              <dd className="font-medium text-gray-900">{product.soldadura4Bolas} kgf</dd>
            </div>
          )}
          {product.desgaste4Bolas && (
            <div className="flex justify-between">
              <dt className="text-gray-600">Desgaste 4 Bolas:</dt>
              <dd className="font-medium text-gray-900">{product.desgaste4Bolas} mm</dd>
            </div>
          )}
          {product.cargaTimken && (
            <div className="flex justify-between">
              <dt className="text-gray-600">Carga Timken:</dt>
              <dd className="font-medium text-gray-900">{product.cargaTimken} lb</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Applications & Benefits */}
      {(product.aplicaciones || product.beneficios) && (
        <div className="pt-4 border-t border-gray-200 space-y-3">
          {product.aplicaciones && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">Aplicaciones</h4>
              <p className="text-sm text-gray-700">{product.aplicaciones}</p>
            </div>
          )}
          {product.beneficios && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">Beneficios</h4>
              <p className="text-sm text-gray-700">{product.beneficios}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
