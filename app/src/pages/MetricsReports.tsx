/**
 * Metrics & Reports page
 * Shows system metrics and usability/design rationale
 */

import React from 'react';
import { AppShell } from '../layouts/AppShell';
import { Card } from '../components/common/Card';
import { SEO } from '../components/common/SEO';
import { Button } from '../components/common/Button';
import { SystemMetricTiles } from '../components/metrics/SystemMetricTiles';
import { mockSystemMetrics } from '../services/mockData';
import { Download } from 'lucide-react';
import { SEO_DATA } from '../constants/seo';

export const MetricsReports: React.FC = () => {
  const handleExportReport = () => {
    // TODO: Implement report export functionality
    alert('Export functionality will be connected to backend report generator');
  };

  return (
    <>
      <SEO
        title={SEO_DATA.metrics.title}
        description={SEO_DATA.metrics.description}
        keywords={SEO_DATA.metrics.keywords}
      />
      <AppShell
      sidebar={
        <>
          {/* Usability & Design Rationale Card */}
          <Card
            title="Usability & Design Rationale"
            subtitle="Why this interface works"
          >
            <div className="space-y-4 text-sm text-gray-700">
              <section>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Intuitive Design
                </h4>
                <p className="text-gray-600">
                  The dashboard follows established UI patterns with a clean, card-based layout.
                  Navigation is straightforward with clearly labeled sections, and form inputs
                  use familiar controls (dropdowns, sliders, checkboxes) that reduce cognitive load.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Decision Support
                </h4>
                <p className="text-gray-600">
                  Visual comparisons (charts, radar plots) help engineers quickly assess
                  similarity scores and property matches. The side-by-side layout allows
                  simultaneous viewing of search criteria and results, facilitating
                  informed grease selection.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Progressive Disclosure
                </h4>
                <p className="text-gray-600">
                  Advanced options are collapsible, preventing interface clutter while
                  remaining accessible. The system guides users from basic queries to
                  detailed comparisons naturally.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Visual Hierarchy
                </h4>
                <p className="text-gray-600">
                  Typography, spacing, and color create clear information hierarchy.
                  Important metrics use larger fonts and accent colors, while supporting
                  details use subtle styling to avoid distraction.
                </p>
              </section>

              <section>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Responsive & Accessible
                </h4>
                <p className="text-gray-600">
                  The layout adapts to different screen sizes, stacking content vertically
                  on mobile devices. Semantic HTML and proper contrast ratios ensure
                  accessibility for all users.
                </p>
              </section>
            </div>
          </Card>

          {/* Export Card */}
          <Card title="Reports">
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Generate comprehensive reports including system metrics, usage patterns,
                and recommendation statistics.
              </p>
              <Button
                variant="secondary"
                onClick={handleExportReport}
                disabled={true}
                fullWidth
              >
                <Download className="w-4 h-4 mr-2 inline" />
                Export Report (Coming Soon)
              </Button>
              <p className="text-xs text-gray-500">
                This feature will be connected to the backend report generator.
              </p>
            </div>
          </Card>
        </>
      }
    >
      {/* Main Content: System Metrics */}
      <Card
        title="System Metrics"
        subtitle="Overview of system usage and performance"
      >
        <SystemMetricTiles metrics={mockSystemMetrics} />
      </Card>

      {/* Additional Metrics Placeholder */}
      <Card
        title="Usage Insights"
        subtitle="Patterns and trends in system usage"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm font-medium text-blue-700">
                Most Queried Base Oil
              </div>
              <div className="text-2xl font-bold text-blue-900 mt-2">
                Mineral Oil
              </div>
              <div className="text-xs text-blue-600 mt-1">
                42% of all queries
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="text-sm font-medium text-purple-700">
                Most Popular NLGI Grade
              </div>
              <div className="text-2xl font-bold text-purple-900 mt-2">
                Grade 2
              </div>
              <div className="text-xs text-purple-600 mt-1">
                68% of all queries
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-sm font-medium text-green-700">
                Avg. Similarity Score
              </div>
              <div className="text-2xl font-bold text-green-900 mt-2">
                0.78
              </div>
              <div className="text-xs text-green-600 mt-1">
                For top recommendations
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="text-sm font-medium text-amber-700">
                Peak Usage Time
              </div>
              <div className="text-2xl font-bold text-amber-900 mt-2">
                2-4 PM
              </div>
              <div className="text-xs text-amber-600 mt-1">
                Weekday average
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-600 mt-6 p-4 bg-gray-50 rounded-lg">
            <strong>Note:</strong> These are mock metrics for demonstration purposes.
            In production, these would be calculated from actual user interaction data
            collected by the backend analytics system.
          </div>
        </div>
      </Card>
      </AppShell>
    </>
  );
};
