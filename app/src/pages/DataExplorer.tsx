/**
 * Data Explorer page
 * Shows dataset overview, missing data analysis, and preprocessing pipeline
 */

import React, { useState, useEffect } from 'react';
import { AppShell } from '../layouts/AppShell';
import { Card } from '../components/common/Card';
import { SEO } from '../components/common/SEO';
import { DatasetOverviewTable } from '../components/dataexplorer/DatasetOverviewTable';
import { MissingDataChart } from '../components/dataexplorer/MissingDataChart';
import { PreprocessingPipeline } from '../components/dataexplorer/PreprocessingPipeline';
import { mockPreprocessingSteps, expandedDataPreprocessingSteps } from '../services/mockData';
import { datasetApi, type DatasetOverview as ApiDatasetOverview } from '../api/apiClient';
import { SEO_DATA } from '../constants/seo';
import type { DatasetFeature } from '../types/metrics';

type DatasetType = 'interlub' | 'rivals' | 'expanded';

// Convert API feature info to frontend DatasetFeature
function apiToDatasetFeature(f: { name: string; type: 'numeric' | 'categorical'; missing_percentage: number; non_null_count: number }): DatasetFeature {
  return {
    name: f.name,
    originalType: f.type,
    missingPercentage: f.missing_percentage,
    nonNullCount: f.non_null_count,
    description: f.name,
  };
}

export const DataExplorer: React.FC = () => {
  const [datasetType, setDatasetType] = useState<DatasetType>('interlub');
  const [overview, setOverview] = useState<ApiDatasetOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOverview = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let data;
        if (datasetType === 'interlub') {
          data = await datasetApi.getOverview();
        } else if (datasetType === 'rivals') {
          data = await datasetApi.getOverviewRivals();
        } else {
          data = await datasetApi.getOverviewExpanded();
        }
        setOverview(data);
      } catch (err) {
        setError('Error loading dataset overview. Make sure the backend is running.');
        console.error('Error fetching dataset overview:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOverview();
  }, [datasetType]);

  const totalRecords = overview?.total_records ?? 0;
  const totalFeatures = overview?.total_features ?? 0;
  const numericFeatures = overview?.numeric_features ?? 0;
  const categoricalFeatures = overview?.categorical_features ?? 0;
  const features: DatasetFeature[] = overview?.features.map(apiToDatasetFeature) ?? [];

  return (
    <>
      <SEO
        title={SEO_DATA.dataExplorer.title}
        description={SEO_DATA.dataExplorer.description}
        keywords={SEO_DATA.dataExplorer.keywords}
      />
      <AppShell
      sidebar={
        <>
          {/* Missing Data Card */}
          <Card
            title="Missing Data Analysis"
            subtitle="Distribution of missing values across features"
          >
            {isLoading ? (
              <div className="text-center py-4 text-gray-500">Loading...</div>
            ) : error ? (
              <div className="text-center py-4 text-red-500">{error}</div>
            ) : (
              <MissingDataChart features={features} />
            )}
          </Card>

          {/* Preprocessing Pipeline Card */}
          <Card
            title="Preprocessing Pipeline"
            subtitle={datasetType === 'expanded'
              ? "Steps applied to generate synthetic data"
              : "Steps applied to prepare data for similarity calculation"}
          >
            <PreprocessingPipeline
              steps={datasetType === 'expanded' ? expandedDataPreprocessingSteps : mockPreprocessingSteps}
            />
          </Card>
        </>
      }
    >
      {/* Main Content: Dataset Overview */}
      <Card
        title="Dataset Overview"
        subtitle={
          datasetType === 'interlub'
            ? 'Interlub products catalog'
            : datasetType === 'rivals'
              ? 'Competitive products (rivals)'
              : 'Synthetic expanded dataset (~1200 records)'
        }
      >
        {/* Dataset Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setDatasetType('interlub')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              datasetType === 'interlub'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Interlub Products
          </button>
          <button
            onClick={() => setDatasetType('rivals')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              datasetType === 'rivals'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Rival Products
          </button>
          <button
            onClick={() => setDatasetType('expanded')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              datasetType === 'expanded'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Expanded Data
          </button>
        </div>
        {/* Summary Statistics */}
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading dataset information...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className={`rounded-lg p-4 ${
                datasetType === 'interlub'
                  ? 'bg-primary-50'
                  : datasetType === 'rivals'
                    ? 'bg-orange-50'
                    : 'bg-emerald-50'
              }`}>
                <div className={`text-2xl font-bold ${
                  datasetType === 'interlub'
                    ? 'text-primary-700'
                    : datasetType === 'rivals'
                      ? 'text-orange-700'
                      : 'text-emerald-700'
                }`}>{totalRecords}</div>
                <div className={`text-sm mt-1 ${
                  datasetType === 'interlub'
                    ? 'text-primary-600'
                    : datasetType === 'rivals'
                      ? 'text-orange-600'
                      : 'text-emerald-600'
                }`}>Total Records</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-700">{totalFeatures}</div>
                <div className="text-sm text-blue-600 mt-1">Total Features</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-700">{numericFeatures}</div>
                <div className="text-sm text-purple-600 mt-1">Numeric Features</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-700">{categoricalFeatures}</div>
                <div className="text-sm text-green-600 mt-1">Categorical Features</div>
              </div>
            </div>

            {/* Feature Details Table */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                Feature Details
              </h3>
              <DatasetOverviewTable features={features} />
            </div>
          </>
        )}
      </Card>
      </AppShell>
    </>
  );
};
