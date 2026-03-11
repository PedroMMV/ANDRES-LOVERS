/**
 * Help/About page
 * Comprehensive documentation about the Interlub Grease Recommender System
 */

import React, { useState } from 'react';
import { AppShell } from '../layouts/AppShell';
import { Card } from '../components/common/Card';
import { SEO } from '../components/common/SEO';
import { Tag } from '../components/common/Tag';
import {
  Book,
  Info,
  Search,
  Target,
  Layers,
  Zap,
  Users,
  BarChart3,
  Database,
  GitCompare,
  Trophy,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Boxes,
  PieChart
} from 'lucide-react';
import { SEO_DATA } from '../constants/seo';

// Collapsible Section Component
interface CollapsibleSectionProps {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  iconBgColor: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  id,
  title,
  subtitle,
  icon,
  iconBgColor,
  isExpanded,
  onToggle,
  children
}) => (
  <div id={id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 rounded-lg ${iconBgColor} flex items-center justify-center`}>
          {icon}
        </div>
        <div className="text-left">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
      <div className="text-gray-400">
        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </div>
    </button>
    {isExpanded && (
      <div className="px-6 pb-6 border-t border-gray-100">
        <div className="pt-4">
          {children}
        </div>
      </div>
    )}
  </div>
);

export const HelpAbout: React.FC = () => {
  // Track which sections are expanded (by default, first one is open)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    methods: false,
    competitive: false,
    tfidf: false,
    explorer: false,
    regressor: false,
    clustering: false,
    factorial: false,
    properties: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Expand all / Collapse all
  const expandAll = () => {
    setExpandedSections({
      overview: true,
      methods: true,
      competitive: true,
      tfidf: true,
      explorer: true,
      regressor: true,
      clustering: true,
      factorial: true,
      properties: true
    });
  };

  const collapseAll = () => {
    setExpandedSections({
      overview: false,
      methods: false,
      competitive: false,
      tfidf: false,
      explorer: false,
      regressor: false,
      clustering: false,
      factorial: false,
      properties: false
    });
  };

  return (
    <>
      <SEO
        title={SEO_DATA.help.title}
        description={SEO_DATA.help.description}
        keywords={SEO_DATA.help.keywords}
      />
      <AppShell
      sidebar={
        <>
          {/* Quick Navigation */}
          <Card
            title="Quick Navigation"
            subtitle="Jump to section"
          >
            <div className="space-y-2 text-sm">
              <a href="#overview" className="block px-3 py-2 rounded-lg hover:bg-primary-50 text-gray-700 hover:text-primary-700 transition-colors">
                System Overview
              </a>
              <a href="#recommendation-methods" className="block px-3 py-2 rounded-lg hover:bg-primary-50 text-gray-700 hover:text-primary-700 transition-colors">
                Recommendation Methods
              </a>
              <a href="#competitive-analysis" className="block px-3 py-2 rounded-lg hover:bg-orange-50 text-gray-700 hover:text-orange-700 transition-colors">
                Competitive Analysis
              </a>
              <a href="#data-explorer" className="block px-3 py-2 rounded-lg hover:bg-purple-50 text-gray-700 hover:text-purple-700 transition-colors">
                Data Explorer
              </a>
              <a href="#tfidf" className="block px-3 py-2 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-700 transition-colors">
                TF-IDF & Similarity
              </a>
              <a href="#regressor" className="block px-3 py-2 rounded-lg hover:bg-green-50 text-gray-700 hover:text-green-700 transition-colors">
                Regressor
              </a>
              <a href="#clustering" className="block px-3 py-2 rounded-lg hover:bg-cyan-50 text-gray-700 hover:text-cyan-700 transition-colors">
                Clustering (K-Means)
              </a>
              <a href="#factorial" className="block px-3 py-2 rounded-lg hover:bg-rose-50 text-gray-700 hover:text-rose-700 transition-colors">
                Factor Analysis
              </a>
            </div>
          </Card>

          {/* Project Info Card */}
          <Card title="Project Info">
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-gray-600">Version</div>
                <div className="font-semibold text-gray-900">2.0.0</div>
              </div>
              <div>
                <div className="text-gray-600">Status</div>
                <Tag variant="success" size="sm">Production Ready</Tag>
              </div>
              <div>
                <div className="text-gray-600">Backend</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  <Tag variant="primary" size="sm">FastAPI</Tag>
                  <Tag variant="primary" size="sm">Python</Tag>
                  <Tag variant="primary" size="sm">scikit-learn</Tag>
                </div>
              </div>
              <div>
                <div className="text-gray-600">Frontend</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  <Tag variant="primary" size="sm">React</Tag>
                  <Tag variant="primary" size="sm">TypeScript</Tag>
                  <Tag variant="primary" size="sm">Tailwind</Tag>
                </div>
              </div>
              <div>
                <div className="text-gray-600">Data</div>
                <div className="text-gray-900">51 Interlub + 13 Rival products</div>
              </div>
            </div>
          </Card>

          {/* Authors Card */}
          <Card title="Authors">
            <div className="text-xs text-gray-600 space-y-1">
              <p><span className="text-gray-400">A01612830</span> Yoseba Michel Mireles Ahumada</p>
              <p><span className="text-gray-400">A00573182</span> Barush Caliel Copado Luna</p>
              <p><span className="text-gray-400">A01741569</span> Pedro Manuel Montes Valle</p>
              <p><span className="text-gray-400">A01741944</span> Santiago Pérez Mendoza</p>
              <p><span className="text-gray-400">A01246417</span> Pedro Emilio Silva Rodríguez</p>
              <p><span className="text-gray-400">A01738369</span> Diego Barragán Castillo</p>
            </div>
          </Card>
        </>
      }
    >
      {/* Main Content */}
      <div className="space-y-4">

        {/* Expand/Collapse All Buttons */}
        <div className="flex justify-end gap-2">
          <button
            onClick={expandAll}
            className="px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Collapse All
          </button>
        </div>

        {/* System Overview */}
        <CollapsibleSection
          id="overview"
          title="Interlub Grease Recommender System"
          subtitle="Complete documentation and user guide"
          icon={<Info className="w-5 h-5 text-primary-600" />}
          iconBgColor="bg-primary-100"
          isExpanded={expandedSections.overview}
          onToggle={() => toggleSection('overview')}
        >
          <div className="space-y-6 text-gray-700">
            <p className="leading-relaxed">
              The <strong>Interlub Grease Recommender</strong> is a full-stack application designed to help
              engineers and sales teams find the optimal industrial grease for specific applications.
              The system uses <strong>TF-IDF (Term Frequency-Inverse Document Frequency)</strong> combined
              with <strong>cosine similarity</strong> to match user requirements against a catalog of
              Interlub products.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 text-center">
                <Database className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-primary-700">51</div>
                <div className="text-sm text-primary-600">Interlub Products</div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                <Users className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-700">13</div>
                <div className="text-sm text-orange-600">Competitor Products</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <Layers className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-700">20+</div>
                <div className="text-sm text-blue-600">Technical Properties</div>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Recommendation Methods */}
        <CollapsibleSection
          id="recommendation-methods"
          title="Recommendation Methods"
          subtitle="Understanding each algorithm"
          icon={<Search className="w-5 h-5 text-blue-600" />}
          iconBgColor="bg-blue-100"
          isExpanded={expandedSections.methods}
          onToggle={() => toggleSection('methods')}
        >
          <div className="space-y-4">

            {/* Content-Based */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Search className="w-4 h-4 text-blue-600" />
                <h4 className="font-semibold text-blue-900 text-sm">Content-Based Filtering (TF-IDF)</h4>
                <Tag variant="primary" size="sm">Primary</Tag>
              </div>
              <p className="text-xs text-blue-800 leading-relaxed">
                Main algorithm using TF-IDF vectors and cosine similarity to match products by textual content.
              </p>
            </div>

            {/* By Characteristics */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-4 h-4 text-purple-600" />
                <h4 className="font-semibold text-purple-900 text-sm">Filter by Characteristics</h4>
              </div>
              <p className="text-xs text-purple-800 leading-relaxed">
                Filter by base oil type, thickener, and temperature range requirements.
              </p>
            </div>

            {/* By Range */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="w-4 h-4 text-green-600" />
                <h4 className="font-semibold text-green-900 text-sm">Filter by Numeric Range</h4>
              </div>
              <p className="text-xs text-green-800 leading-relaxed">
                Filter by viscosity, drop point, penetration, weld load, wear, and Timken load ranges.
              </p>
            </div>

            {/* Hybrid */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Layers className="w-4 h-4 text-amber-600" />
                <h4 className="font-semibold text-amber-900 text-sm">Hybrid Recommendation</h4>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Combines TF-IDF similarity with numeric filters for refined results.
              </p>
            </div>

            {/* By Popularity */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Trophy className="w-4 h-4 text-gray-600" />
                <h4 className="font-semibold text-gray-900 text-sm">By Data Completeness</h4>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">
                Ranks products by documentation completeness.
              </p>
            </div>
          </div>
        </CollapsibleSection>

        {/* Competitive Analysis */}
        <CollapsibleSection
          id="competitive-analysis"
          title="Competitive Analysis"
          subtitle="Analyze products against competitors"
          icon={<Users className="w-5 h-5 text-orange-600" />}
          iconBgColor="bg-orange-100"
          isExpanded={expandedSections.competitive}
          onToggle={() => toggleSection('competitive')}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Search className="w-4 h-4 text-orange-600" />
                <h4 className="font-semibold text-orange-900 text-sm">Find Similar Rivals</h4>
              </div>
              <p className="text-xs text-orange-800">Find competitor products similar to your Interlub product.</p>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Target className="w-4 h-4 text-orange-600" />
                <h4 className="font-semibold text-orange-900 text-sm">Find Best Competitor</h4>
              </div>
              <p className="text-xs text-orange-800">Find Interlub alternatives for a rival product.</p>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <GitCompare className="w-4 h-4 text-orange-600" />
                <h4 className="font-semibold text-orange-900 text-sm">Compare Products</h4>
              </div>
              <p className="text-xs text-orange-800">Side-by-side property comparison.</p>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <h4 className="font-semibold text-orange-900 text-sm">Gap Analysis</h4>
              </div>
              <p className="text-xs text-orange-800">Identify market gaps for product development.</p>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <BarChart3 className="w-4 h-4 text-orange-600" />
                <h4 className="font-semibold text-orange-900 text-sm">Benchmarking</h4>
              </div>
              <p className="text-xs text-orange-800">Statistical comparison across all products.</p>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Layers className="w-4 h-4 text-orange-600" />
                <h4 className="font-semibold text-orange-900 text-sm">Competitive Matrix</h4>
              </div>
              <p className="text-xs text-orange-800">Full similarity matrix and market positioning.</p>
            </div>
          </div>
        </CollapsibleSection>

        {/* TF-IDF Explanation */}
        <CollapsibleSection
          id="tfidf"
          title="TF-IDF & Cosine Similarity"
          subtitle="The math behind recommendations"
          icon={<Book className="w-5 h-5 text-indigo-600" />}
          iconBgColor="bg-indigo-100"
          isExpanded={expandedSections.tfidf}
          onToggle={() => toggleSection('tfidf')}
        >
          <div className="space-y-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 text-sm mb-2">TF-IDF Formula</h4>
              <div className="font-mono text-xs text-center py-2 bg-white rounded border">
                tfidf(t,d) = tf(t,d) × log(N / df(t))
              </div>
              <p className="text-xs text-gray-600 mt-2 text-center">
                Converts text to numerical vectors based on term importance.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 text-sm mb-2">Cosine Similarity</h4>
              <div className="font-mono text-xs text-center py-2 bg-white rounded border">
                similarity(A, B) = (A · B) / (||A|| × ||B||)
              </div>
              <p className="text-xs text-gray-600 mt-2 text-center">
                Score of 1 = identical, 0 = unrelated.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
              <strong>Config:</strong> word analyzer, n-grams (1,2), max 1000 features, Spanish stop words removed
            </div>
          </div>
        </CollapsibleSection>

        {/* Data Explorer */}
        <CollapsibleSection
          id="data-explorer"
          title="Data Explorer"
          subtitle="Understanding the datasets"
          icon={<Database className="w-5 h-5 text-purple-600" />}
          iconBgColor="bg-purple-100"
          isExpanded={expandedSections.explorer}
          onToggle={() => toggleSection('explorer')}
        >
          <div className="space-y-4">
            {/* Available Datasets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Database className="w-4 h-4 text-blue-600" />
                  <h4 className="font-semibold text-blue-900 text-sm">Interlub Products</h4>
                </div>
                <p className="text-xs text-blue-800">51 products from Interlub catalog with full technical specifications.</p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="w-4 h-4 text-orange-600" />
                  <h4 className="font-semibold text-orange-900 text-sm">Rival Products</h4>
                </div>
                <p className="text-xs text-orange-800">13 competitor products for competitive analysis.</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Layers className="w-4 h-4 text-green-600" />
                  <h4 className="font-semibold text-green-900 text-sm">Expanded Data</h4>
                  <Tag variant="success" size="sm">New</Tag>
                </div>
                <p className="text-xs text-green-800">~1200 synthetic records for advanced ML analysis.</p>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <h4 className="font-semibold text-purple-900 text-sm mb-2">Dataset Statistics</h4>
                <ul className="text-xs text-purple-800 space-y-1">
                  <li>• Records and features count</li>
                  <li>• Missing data percentages</li>
                  <li>• Numeric vs categorical breakdown</li>
                </ul>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <h4 className="font-semibold text-purple-900 text-sm mb-2">Processing Pipeline</h4>
                <ul className="text-xs text-purple-800 space-y-1">
                  <li>• Type conversion & cleaning</li>
                  <li>• TF-IDF vectorization</li>
                  <li>• Synthetic data generation (expanded)</li>
                </ul>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Regressor */}
        <CollapsibleSection
          id="regressor"
          title="Regressor"
          subtitle="Predict grease properties with linear regression"
          icon={<TrendingUp className="w-5 h-5 text-green-600" />}
          iconBgColor="bg-green-100"
          isExpanded={expandedSections.regressor}
          onToggle={() => toggleSection('regressor')}
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-700 leading-relaxed">
              Train linear regression models to predict grease properties and get product recommendations
              based on desired characteristics using Euclidean distance.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="w-4 h-4 text-green-600" />
                  <h4 className="font-semibold text-green-900 text-sm">Model Configuration</h4>
                </div>
                <ul className="text-xs text-green-800 space-y-1">
                  <li>• Select target variable to predict</li>
                  <li>• Choose feature variables</li>
                  <li>• Configure train/test split ratio</li>
                  <li>• Optional data scaling</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-green-600" />
                  <h4 className="font-semibold text-green-900 text-sm">Performance Metrics</h4>
                </div>
                <ul className="text-xs text-green-800 space-y-1">
                  <li>• R² Score (coefficient of determination)</li>
                  <li>• MSE (Mean Squared Error)</li>
                  <li>• RMSE (Root Mean Squared Error)</li>
                  <li>• MAE (Mean Absolute Error)</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Layers className="w-4 h-4 text-green-600" />
                  <h4 className="font-semibold text-green-900 text-sm">Visualizations</h4>
                </div>
                <ul className="text-xs text-green-800 space-y-1">
                  <li>• Feature coefficients chart</li>
                  <li>• Actual vs Predicted scatter plot</li>
                  <li>• Residuals distribution</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Search className="w-4 h-4 text-green-600" />
                  <h4 className="font-semibold text-green-900 text-sm">Recommendations</h4>
                </div>
                <ul className="text-xs text-green-800 space-y-1">
                  <li>• Input desired property values</li>
                  <li>• Uses Euclidean distance matching</li>
                  <li>• Returns top-K similar products</li>
                </ul>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Clustering */}
        <CollapsibleSection
          id="clustering"
          title="Clustering (K-Means)"
          subtitle="Group products by similarity"
          icon={<Boxes className="w-5 h-5 text-cyan-600" />}
          iconBgColor="bg-cyan-100"
          isExpanded={expandedSections.clustering}
          onToggle={() => toggleSection('clustering')}
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-700 leading-relaxed">
              Use K-Means clustering to group grease products based on their properties
              and find recommendations within specific clusters.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-cyan-600" />
                  <h4 className="font-semibold text-cyan-900 text-sm">Elbow Method Analysis</h4>
                </div>
                <ul className="text-xs text-cyan-800 space-y-1">
                  <li>• Silhouette Score visualization</li>
                  <li>• Inertia (WCSS) plot</li>
                  <li>• Optimal K recommendation</li>
                </ul>
              </div>

              <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="w-4 h-4 text-cyan-600" />
                  <h4 className="font-semibold text-cyan-900 text-sm">Model Training</h4>
                </div>
                <ul className="text-xs text-cyan-800 space-y-1">
                  <li>• Configure number of clusters (K)</li>
                  <li>• Select variables for analysis</li>
                  <li>• Optional data scaling</li>
                </ul>
              </div>

              <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <PieChart className="w-4 h-4 text-cyan-600" />
                  <h4 className="font-semibold text-cyan-900 text-sm">Visualizations</h4>
                </div>
                <ul className="text-xs text-cyan-800 space-y-1">
                  <li>• Cluster distribution chart</li>
                  <li>• Radar chart by cluster</li>
                  <li>• Silhouette score metrics</li>
                </ul>
              </div>

              <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Search className="w-4 h-4 text-cyan-600" />
                  <h4 className="font-semibold text-cyan-900 text-sm">Cluster Recommendations</h4>
                </div>
                <ul className="text-xs text-cyan-800 space-y-1">
                  <li>• Input desired characteristics</li>
                  <li>• Find matching cluster</li>
                  <li>• Get top products from cluster</li>
                </ul>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Factor Analysis */}
        <CollapsibleSection
          id="factorial"
          title="Factor Analysis"
          subtitle="Dimensionality reduction and latent factors"
          icon={<PieChart className="w-5 h-5 text-rose-600" />}
          iconBgColor="bg-rose-100"
          isExpanded={expandedSections.factorial}
          onToggle={() => toggleSection('factorial')}
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-700 leading-relaxed">
              Apply factor analysis to identify latent factors explaining correlations
              between variables and reduce dimensionality for better insights.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-rose-600" />
                  <h4 className="font-semibold text-rose-900 text-sm">Scree Analysis</h4>
                </div>
                <ul className="text-xs text-rose-800 space-y-1">
                  <li>• Variance explained by factors</li>
                  <li>• Optimal number of factors</li>
                  <li>• Visual scree plot</li>
                </ul>
              </div>

              <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="w-4 h-4 text-rose-600" />
                  <h4 className="font-semibold text-rose-900 text-sm">Model Configuration</h4>
                </div>
                <ul className="text-xs text-rose-800 space-y-1">
                  <li>• Select number of factors</li>
                  <li>• Choose variables to include</li>
                  <li>• Optional data normalization</li>
                </ul>
              </div>

              <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Layers className="w-4 h-4 text-rose-600" />
                  <h4 className="font-semibold text-rose-900 text-sm">Results & Metrics</h4>
                </div>
                <ul className="text-xs text-rose-800 space-y-1">
                  <li>• Total variance explained</li>
                  <li>• Factor loadings matrix</li>
                  <li>• Communalities analysis</li>
                </ul>
              </div>

              <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Search className="w-4 h-4 text-rose-600" />
                  <h4 className="font-semibold text-rose-900 text-sm">Factor Recommendations</h4>
                </div>
                <ul className="text-xs text-rose-800 space-y-1">
                  <li>• Input characteristics</li>
                  <li>• Search in reduced factor space</li>
                  <li>• Get closest matching products</li>
                </ul>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Technical Properties Reference */}
        <CollapsibleSection
          id="properties"
          title="Technical Properties Reference"
          subtitle="Grease specifications"
          icon={<Zap className="w-5 h-5 text-amber-600" />}
          iconBgColor="bg-amber-100"
          isExpanded={expandedSections.properties}
          onToggle={() => toggleSection('properties')}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-gray-900">Property</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-900">Unit</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-900">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-3 py-1.5 font-medium">Viscosidad 40°C</td>
                  <td className="px-3 py-1.5 text-gray-600">cSt</td>
                  <td className="px-3 py-1.5 text-gray-600">Base oil viscosity, flow characteristics</td>
                </tr>
                <tr>
                  <td className="px-3 py-1.5 font-medium">Grado NLGI</td>
                  <td className="px-3 py-1.5 text-gray-600">0-6</td>
                  <td className="px-3 py-1.5 text-gray-600">Consistency grade</td>
                </tr>
                <tr>
                  <td className="px-3 py-1.5 font-medium">Punto de Gota</td>
                  <td className="px-3 py-1.5 text-gray-600">°C</td>
                  <td className="px-3 py-1.5 text-gray-600">Drop point temperature</td>
                </tr>
                <tr>
                  <td className="px-3 py-1.5 font-medium">Penetracion</td>
                  <td className="px-3 py-1.5 text-gray-600">0.1mm</td>
                  <td className="px-3 py-1.5 text-gray-600">Cone penetration</td>
                </tr>
                <tr>
                  <td className="px-3 py-1.5 font-medium">Soldadura 4 Bolas</td>
                  <td className="px-3 py-1.5 text-gray-600">kgf</td>
                  <td className="px-3 py-1.5 text-gray-600">EP protection</td>
                </tr>
                <tr>
                  <td className="px-3 py-1.5 font-medium">Desgaste 4 Bolas</td>
                  <td className="px-3 py-1.5 text-gray-600">mm</td>
                  <td className="px-3 py-1.5 text-gray-600">Wear protection</td>
                </tr>
                <tr>
                  <td className="px-3 py-1.5 font-medium">Carga Timken</td>
                  <td className="px-3 py-1.5 text-gray-600">lb</td>
                  <td className="px-3 py-1.5 text-gray-600">Load capacity</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CollapsibleSection>

      </div>
      </AppShell>
    </>
  );
};
