/**
 * Home/Recommender page
 * Main interface for grease recommendations and competitive analysis
 * Integrates all 8 functions from RecomendadorGrasas and 9 from RecomendadorGrasasCompetitivo
 */

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Swords, Search, Sparkles, TrendingUp, GitCompare, Target, BarChart3, Zap, Gauge, Flame, Droplets, Star, Award, Crown, Rocket, Filter, Layers, type LucideIcon } from 'lucide-react';
import { AppShell } from '../layouts/AppShell';
import { Card } from '../components/common/Card';
import { SEO } from '../components/common/SEO';
import { Dropdown } from '../components/common/Dropdown';
import { Slider } from '../components/common/Slider';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { RecommendationsChart } from '../components/recommender/RecommendationsChart';
import { RecommendationsTable } from '../components/recommender/RecommendationsTable';
import { ProductDetailPanel } from '../components/recommender/ProductDetailPanel';
import { useSettings } from '../contexts/SettingsContext';
import {
  getRecommendations,
  getRecommendationsByContent,
  getRecommendationsByPopularity,
  getRecommendationsByRange,
  getRecommendationsHybrid,
  getCatalogCount,
  getProductById,
  getAllProducts,
  getAllRivals,
  getSimilarRivals,
  findCompetitor,
  compareWithRival,
  getGapAnalysis,
  getBenchmarking,
  getCompetitiveMatrix,
  getCategoricalOptions,
} from '../services/recommenderService';
import type { RecommenderQuery, RecommendationResult, GreaseProduct, CategoricalOptions, ComparisonResult } from '../types/products';
import { SEO_DATA } from '../constants/seo';

type RecommenderMode = 'normal' | 'competitive';
type NormalMethod = 'content' | 'characteristics' | 'range' | 'popularity' | 'hybrid';
type CompetitiveMethod = 'find-rivals' | 'find-competitor' | 'compare' | 'gap-analysis' | 'benchmarking' | 'matrix';

// Preset definitions
interface Preset {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  config: {
    productCode?: string;
    topK?: number;
    aceiteBase?: string;
    espesante?: string;
    tempMin?: number;
    tempMax?: number;
    rangeColumn?: string;
    rangeMin?: number;
    rangeMax?: number;
    nlgiFilter?: number;
    viscosidadMin?: number;
    viscosidadMax?: number;
    puntoGotaMin?: number;
    puntoGotaMax?: number;
    rivalCode?: string;
    benchmarkProperty?: string;
  };
}

const PRESETS: Record<NormalMethod | CompetitiveMethod, Preset[]> = {
  // ========== NORMAL MODE PRESETS ==========
  content: [
    { id: 'content-1', name: 'Quick Search', description: 'Fast 5 results, no filters', icon: Zap, config: { topK: 5 } },
    { id: 'content-2', name: 'NLGI 2 Filter', description: 'Similar products, NLGI grade 2 only', icon: Filter, config: { topK: 10, nlgiFilter: 2 } },
    { id: 'content-3', name: 'High Performance', description: 'High viscosity (>400 cSt)', icon: Rocket, config: { topK: 10, viscosidadMin: 400 } },
  ],
  characteristics: [
    { id: 'char-1', name: 'Lithium Complex', description: 'Complejo de Litio, NLGI 2', icon: Flame, config: { espesante: 'Complejo de Litio', nlgiFilter: 2, topK: 10 } },
    { id: 'char-2', name: 'Semi-Synthetic', description: 'Semi-Sintetico base oil', icon: Sparkles, config: { aceiteBase: 'Semi-Sintetico', topK: 10 } },
    { id: 'char-3', name: 'Calcium Sulfonate', description: 'Complejo Sulfonato de Calcio', icon: Layers, config: { espesante: 'Complejo Sulfonato de Calcio', topK: 15 } },
  ],
  range: [
    { id: 'range-1', name: 'Low Viscosity', description: 'Viscosity 40-150 cSt', icon: Droplets, config: { rangeColumn: 'visc_40c', rangeMin: 40, rangeMax: 150, topK: 10 } },
    { id: 'range-2', name: 'Medium Viscosity', description: 'Viscosity 150-500 cSt', icon: Gauge, config: { rangeColumn: 'visc_40c', rangeMin: 150, rangeMax: 500, topK: 10 } },
    { id: 'range-3', name: 'High Viscosity', description: 'Viscosity 500-1500 cSt', icon: Flame, config: { rangeColumn: 'visc_40c', rangeMin: 500, rangeMax: 1500, topK: 10 } },
  ],
  popularity: [
    { id: 'pop-1', name: 'Top 5 Best Data', description: 'Most complete products', icon: Star, config: { topK: 5 } },
    { id: 'pop-2', name: 'Popular NLGI 2', description: 'Top products with NLGI 2', icon: Award, config: { topK: 10, nlgiFilter: 2 } },
    { id: 'pop-3', name: 'Popular High Visc', description: 'Top products, viscosity >400', icon: Crown, config: { topK: 15, viscosidadMin: 400 } },
  ],
  hybrid: [
    { id: 'hybrid-1', name: 'Industrial NLGI 2', description: 'Content match + NLGI 2', icon: Target, config: { topK: 10, nlgiFilter: 2 } },
    { id: 'hybrid-2', name: 'High Viscosity Match', description: 'Content + viscosity >500 cSt', icon: Rocket, config: { topK: 10, viscosidadMin: 500 } },
    { id: 'hybrid-3', name: 'Light Grease Match', description: 'Content + viscosity <200 cSt', icon: Droplets, config: { topK: 10, viscosidadMax: 200 } },
  ],
  // ========== COMPETITIVE MODE (no presets - advanced filters don't apply) ==========
  'find-rivals': [],
  'find-competitor': [],
  compare: [],
  'gap-analysis': [],
  benchmarking: [],
  matrix: [],
};

export const HomeRecommender: React.FC = () => {
  // Settings
  const { settings } = useSettings();

  // State
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<GreaseProduct | null>(null);
  const [currentQuery, setCurrentQuery] = useState<RecommenderQuery | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormCollapsed, setIsFormCollapsed] = useState(false);
  const [catalogCount, setCatalogCount] = useState(0);
  const [recommenderMode, setRecommenderMode] = useState<RecommenderMode>('normal');

  // Normal mode state
  const [normalMethod, setNormalMethod] = useState<NormalMethod>('content');
  const [selectedProductCode, setSelectedProductCode] = useState<string>('');
  const [topK, setTopK] = useState<number>(settings.defaultTopK);
  const [products, setProducts] = useState<GreaseProduct[]>([]);
  const [options, setOptions] = useState<CategoricalOptions>({ aceitesBase: [], espesantes: [], nlgiGrades: [] });

  // Characteristics filter state
  const [aceiteBase, setAceiteBase] = useState<string>('');
  const [espesante, setEspesante] = useState<string>('');
  const [tempMin, setTempMin] = useState<number | undefined>();
  const [tempMax, setTempMax] = useState<number | undefined>();

  // Range filter state
  const [rangeColumn, setRangeColumn] = useState<string>('visc_40c');
  const [rangeMin, setRangeMin] = useState<number>(0);
  const [rangeMax, setRangeMax] = useState<number>(500);

  // Hybrid filter state (kept for API compatibility)
  const [hybridFilters] = useState<Record<string, [number, number]>>({});

  // Advanced filters state (shared across methods)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [nlgiFilter, setNlgiFilter] = useState<number | undefined>();
  const [viscosidadMin, setViscosidadMin] = useState<number | undefined>();
  const [viscosidadMax, setViscosidadMax] = useState<number | undefined>();
  const [puntoGotaMin, setPuntoGotaMin] = useState<number | undefined>();
  const [puntoGotaMax, setPuntoGotaMax] = useState<number | undefined>();
  const [penetracionMin, setPenetracionMin] = useState<number | undefined>();
  const [penetracionMax, setPenetracionMax] = useState<number | undefined>();

  // Competitive mode state
  const [competitiveMethod, setCompetitiveMethod] = useState<CompetitiveMethod>('find-rivals');
  const [rivals, setRivals] = useState<GreaseProduct[]>([]);
  const [selectedRivalCode, setSelectedRivalCode] = useState<string>('');
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [gapAnalysisResult, setGapAnalysisResult] = useState<{ gaps: any[]; total: number } | null>(null);
  const [benchmarkProperty, setBenchmarkProperty] = useState<string>('visc_40c');
  const [benchmarkResult, setBenchmarkResult] = useState<any>(null);
  const [matrixResult, setMatrixResult] = useState<any>(null);

  // Fetch data on mount
  useEffect(() => {
    getCatalogCount().then(setCatalogCount);
    getAllProducts().then(setProducts);
    getAllRivals().then(setRivals);
    getCategoricalOptions().then(setOptions);
  }, []);

  const hasResults = recommendations.length > 0 || comparisonResult !== null || gapAnalysisResult !== null || benchmarkResult !== null || matrixResult !== null;

  // Helper to apply advanced filters to results
  const applyAdvancedFilters = (results: RecommendationResult[]): RecommendationResult[] => {
    return results.filter(r => {
      const p = r.product;
      // NLGI filter
      if (nlgiFilter !== undefined && p.nlgiGrade !== nlgiFilter) return false;
      // Viscosidad filter
      if (viscosidadMin !== undefined && (p.viscosidad40C === null || p.viscosidad40C < viscosidadMin)) return false;
      if (viscosidadMax !== undefined && (p.viscosidad40C === null || p.viscosidad40C > viscosidadMax)) return false;
      // Punto Gota filter
      if (puntoGotaMin !== undefined && (p.puntoGota === null || p.puntoGota < puntoGotaMin)) return false;
      if (puntoGotaMax !== undefined && (p.puntoGota === null || p.puntoGota > puntoGotaMax)) return false;
      // Penetración filter
      if (penetracionMin !== undefined && (p.penetracion === null || p.penetracion < penetracionMin)) return false;
      if (penetracionMax !== undefined && (p.penetracion === null || p.penetracion > penetracionMax)) return false;
      return true;
    });
  };

  // ==== Normal Mode Submit ====
  const handleNormalSubmit = async () => {
    setIsLoading(true);
    setComparisonResult(null);
    setGapAnalysisResult(null);
    setBenchmarkResult(null);
    setMatrixResult(null);

    try {
      let results: RecommendationResult[] = [];

      switch (normalMethod) {
        case 'content':
          if (!selectedProductCode) {
            alert('Please select a product to find similar products');
            setIsLoading(false);
            return;
          }
          results = await getRecommendationsByContent(selectedProductCode, topK);
          // Get source product properties for radar chart comparison
          const sourceProduct = products.find(p => p.id === selectedProductCode);
          setCurrentQuery({
            topK,
            mode: 'advanced',
            aceiteBase: sourceProduct?.aceiteBase,
            espesante: sourceProduct?.espesante,
            nlgiGrade: sourceProduct?.nlgiGrade ?? undefined,
            viscosidad40C: sourceProduct?.viscosidad40C ?? undefined,
            tempMin: sourceProduct?.tempMin ?? undefined,
            tempMax: sourceProduct?.tempMax ?? undefined,
            puntoGota: sourceProduct?.puntoGota ?? undefined,
            penetracion: sourceProduct?.penetracion ?? undefined,
          });
          break;

        case 'characteristics':
          const query: RecommenderQuery = {
            aceiteBase: aceiteBase || undefined,
            espesante: espesante || undefined,
            tempMin,
            tempMax,
            topK,
          };
          results = await getRecommendations(query);
          setCurrentQuery(query);
          break;

        case 'range':
          results = await getRecommendationsByRange(rangeColumn, rangeMin, rangeMax, topK);
          setCurrentQuery({ topK, mode: 'basic' });
          break;

        case 'popularity':
          results = await getRecommendationsByPopularity(topK);
          setCurrentQuery({ topK, mode: 'basic' });
          break;

        case 'hybrid':
          if (!selectedProductCode) {
            alert('Please select a product for hybrid recommendation');
            setIsLoading(false);
            return;
          }
          results = await getRecommendationsHybrid(selectedProductCode, hybridFilters, topK);
          // Get source product properties for radar chart comparison
          const hybridSourceProduct = products.find(p => p.id === selectedProductCode);
          setCurrentQuery({
            topK,
            mode: 'advanced',
            aceiteBase: hybridSourceProduct?.aceiteBase,
            espesante: hybridSourceProduct?.espesante,
            nlgiGrade: hybridSourceProduct?.nlgiGrade ?? undefined,
            viscosidad40C: hybridSourceProduct?.viscosidad40C ?? undefined,
            tempMin: hybridSourceProduct?.tempMin ?? undefined,
            tempMax: hybridSourceProduct?.tempMax ?? undefined,
            puntoGota: hybridSourceProduct?.puntoGota ?? undefined,
            penetracion: hybridSourceProduct?.penetracion ?? undefined,
          });
          break;
      }

      // Apply advanced filters
      const filteredResults = applyAdvancedFilters(results);
      setRecommendations(filteredResults);
      if (filteredResults.length > 0) {
        setSelectedProduct(filteredResults[0].product);
        setIsFormCollapsed(true);
      }
    } catch (error) {
      console.error('Error getting recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ==== Competitive Mode Submit ====
  const handleCompetitiveSubmit = async () => {
    setIsLoading(true);
    setRecommendations([]);
    setComparisonResult(null);
    setGapAnalysisResult(null);
    setBenchmarkResult(null);
    setMatrixResult(null);

    try {
      switch (competitiveMethod) {
        case 'find-rivals':
          if (!selectedProductCode) {
            alert('Please select your product to find similar rivals');
            setIsLoading(false);
            return;
          }
          const rivalsResults = await getSimilarRivals(selectedProductCode, topK);
          const filteredRivalsResults = applyAdvancedFilters(rivalsResults);
          setRecommendations(filteredRivalsResults);
          // Get source product properties for radar chart comparison
          const sourceProductForRivals = products.find(p => p.id === selectedProductCode);
          setCurrentQuery({
            topK,
            mode: 'competitive',
            aceiteBase: sourceProductForRivals?.aceiteBase,
            espesante: sourceProductForRivals?.espesante,
            nlgiGrade: sourceProductForRivals?.nlgiGrade ?? undefined,
            viscosidad40C: sourceProductForRivals?.viscosidad40C ?? undefined,
            tempMin: sourceProductForRivals?.tempMin ?? undefined,
            tempMax: sourceProductForRivals?.tempMax ?? undefined,
            puntoGota: sourceProductForRivals?.puntoGota ?? undefined,
            penetracion: sourceProductForRivals?.penetracion ?? undefined,
          });
          if (filteredRivalsResults.length > 0) {
            setSelectedProduct(filteredRivalsResults[0].product);
          }
          break;

        case 'find-competitor':
          if (!selectedRivalCode) {
            alert('Please select a rival product to find your best competitor');
            setIsLoading(false);
            return;
          }
          const competitorResults = await findCompetitor(selectedRivalCode, topK);
          const filteredCompetitorResults = applyAdvancedFilters(competitorResults);
          setRecommendations(filteredCompetitorResults);
          // Get rival product properties for radar chart comparison
          const sourceRival = rivals.find(p => p.id === selectedRivalCode);
          setCurrentQuery({
            topK,
            mode: 'competitive',
            aceiteBase: sourceRival?.aceiteBase,
            espesante: sourceRival?.espesante,
            nlgiGrade: sourceRival?.nlgiGrade ?? undefined,
            viscosidad40C: sourceRival?.viscosidad40C ?? undefined,
            tempMin: sourceRival?.tempMin ?? undefined,
            tempMax: sourceRival?.tempMax ?? undefined,
            puntoGota: sourceRival?.puntoGota ?? undefined,
            penetracion: sourceRival?.penetracion ?? undefined,
          });
          if (filteredCompetitorResults.length > 0) {
            setSelectedProduct(filteredCompetitorResults[0].product);
          }
          break;

        case 'compare':
          if (!selectedProductCode || !selectedRivalCode) {
            alert('Please select both your product and a rival to compare');
            setIsLoading(false);
            return;
          }
          const comparison = await compareWithRival(selectedProductCode, selectedRivalCode);
          setComparisonResult(comparison);
          break;

        case 'gap-analysis':
          const gaps = await getGapAnalysis();
          setGapAnalysisResult(gaps);
          break;

        case 'benchmarking':
          const benchmark = await getBenchmarking(benchmarkProperty);
          setBenchmarkResult(benchmark);
          break;

        case 'matrix':
          const matrix = await getCompetitiveMatrix();
          setMatrixResult(matrix);
          break;
      }

      setIsFormCollapsed(true);
    } catch (error) {
      console.error('Error in competitive analysis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setRecommendations([]);
    setSelectedProduct(null);
    setCurrentQuery(null);
    setComparisonResult(null);
    setGapAnalysisResult(null);
    setBenchmarkResult(null);
    setMatrixResult(null);
    setIsFormCollapsed(false);
    // Clear advanced filters
    setShowAdvancedFilters(false);
    setNlgiFilter(undefined);
    setViscosidadMin(undefined);
    setViscosidadMax(undefined);
    setPuntoGotaMin(undefined);
    setPuntoGotaMax(undefined);
    setPenetracionMin(undefined);
    setPenetracionMax(undefined);
  };

  // Apply preset configuration
  const applyPreset = (preset: Preset) => {
    const { config } = preset;

    // First, clear all filter values to avoid mixing presets
    setAceiteBase('');
    setEspesante('');
    setTempMin(undefined);
    setTempMax(undefined);
    setRangeColumn('visc_40c');
    setRangeMin(0);
    setRangeMax(500);
    setNlgiFilter(undefined);
    setViscosidadMin(undefined);
    setViscosidadMax(undefined);
    setPuntoGotaMin(undefined);
    setPuntoGotaMax(undefined);
    setPenetracionMin(undefined);
    setPenetracionMax(undefined);
    setShowAdvancedFilters(false);

    // Apply common settings
    if (config.topK !== undefined) setTopK(config.topK);

    // Normal mode specific settings
    if (config.aceiteBase !== undefined) setAceiteBase(config.aceiteBase);
    if (config.espesante !== undefined) setEspesante(config.espesante);
    if (config.tempMin !== undefined) setTempMin(config.tempMin);
    if (config.tempMax !== undefined) setTempMax(config.tempMax);
    if (config.rangeColumn !== undefined) setRangeColumn(config.rangeColumn);
    if (config.rangeMin !== undefined) setRangeMin(config.rangeMin);
    if (config.rangeMax !== undefined) setRangeMax(config.rangeMax);
    if (config.nlgiFilter !== undefined) setNlgiFilter(config.nlgiFilter);
    if (config.viscosidadMin !== undefined) setViscosidadMin(config.viscosidadMin);
    if (config.viscosidadMax !== undefined) setViscosidadMax(config.viscosidadMax);
    if (config.puntoGotaMin !== undefined) setPuntoGotaMin(config.puntoGotaMin);
    if (config.puntoGotaMax !== undefined) setPuntoGotaMax(config.puntoGotaMax);

    // Competitive mode specific settings
    if (config.benchmarkProperty !== undefined) setBenchmarkProperty(config.benchmarkProperty);

    // Auto-expand advanced filters if preset has advanced properties
    const hasAdvancedProps = config.nlgiFilter !== undefined ||
      config.viscosidadMin !== undefined || config.viscosidadMax !== undefined ||
      config.puntoGotaMin !== undefined || config.puntoGotaMax !== undefined;
    if (hasAdvancedProps) {
      setShowAdvancedFilters(true);
    }
  };

  // Get current presets based on mode and method
  const getCurrentPresets = (): Preset[] => {
    if (recommenderMode === 'normal') {
      return PRESETS[normalMethod] || [];
    } else {
      return PRESETS[competitiveMethod] || [];
    }
  };

  const handleViewDetails = (productId: string) => {
    // First check in current recommendations (already have full data)
    const fromRecommendations = recommendations.find(r => r.product.id === productId);
    if (fromRecommendations) {
      setSelectedProduct(fromRecommendations.product);
      return;
    }
    // Fallback to API call for products not in recommendations
    getProductById(productId).then(product => {
      if (product) {
        setSelectedProduct(product);
      }
    });
  };

  const toggleFormCollapse = () => {
    setIsFormCollapsed(!isFormCollapsed);
  };

  // Product options for dropdowns (filter duplicates)
  const uniqueProducts = products.filter((p, index, self) =>
    index === self.findIndex(t => t.id === p.id)
  );
  const productOptions = [
    { value: '', label: 'Select a product...' },
    ...uniqueProducts.map(p => ({ value: p.id, label: `${p.id} - ${p.aceiteBase || 'N/A'}` }))
  ];

  const uniqueRivals = rivals.filter((p, index, self) =>
    index === self.findIndex(t => t.id === p.id)
  );
  const rivalOptions = [
    { value: '', label: 'Select a rival product...' },
    ...uniqueRivals.map(p => ({ value: p.id, label: `${p.id} - ${p.aceiteBase || 'N/A'}` }))
  ];

  const rangeColumnOptions = [
    { value: 'visc_40c', label: 'Viscosidad 40°C' },
    { value: 'temp_min', label: 'Temp. Mínima' },
    { value: 'temp_max', label: 'Temp. Máxima' },
    { value: 'penetracion', label: 'Penetración' },
    { value: 'punto_gota', label: 'Punto de Gota' },
  ];

  const benchmarkPropertyOptions = [
    { value: 'visc_40c', label: 'Viscosidad 40°C' },
    { value: 'temp_max', label: 'Temp. Máxima' },
    { value: 'soldadura_4bolas', label: 'Soldadura 4 Bolas' },
    { value: 'carga_timken', label: 'Carga Timken' },
  ];

  // Get method display name for presets section
  const getMethodDisplayName = (): string => {
    if (recommenderMode === 'normal') {
      const names: Record<NormalMethod, string> = {
        content: 'TF-IDF Content',
        characteristics: 'Characteristics',
        range: 'Range Search',
        popularity: 'Popularity',
        hybrid: 'Hybrid',
      };
      return names[normalMethod];
    } else {
      const names: Record<CompetitiveMethod, string> = {
        'find-rivals': 'Find Rivals',
        'find-competitor': 'Find Competitor',
        compare: 'Compare',
        'gap-analysis': 'Gap Analysis',
        benchmarking: 'Benchmarking',
        matrix: 'Matrix',
      };
      return names[competitiveMethod];
    }
  };

  const currentPresets = getCurrentPresets();

  const sidebarContent = !hasResults ? (
    <div className="space-y-4">
      <Card title="Getting Started">
        <div className="text-sm text-gray-600 space-y-2">
          <p>
            {recommenderMode === 'normal'
              ? 'Find similar greases using advanced ML methods:'
              : 'Analyze competitive positioning:'}
          </p>
          {recommenderMode === 'normal' ? (
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li><strong>TF-IDF Content:</strong> Real cosine similarity</li>
              <li><strong>Characteristics:</strong> Filter by properties</li>
              <li><strong>Range:</strong> Search by value range</li>
              <li><strong>Popularity:</strong> Most complete data</li>
              <li><strong>Hybrid:</strong> Content + numeric filters</li>
            </ul>
          ) : (
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li><strong>Find Rivals:</strong> Similar competitor products</li>
              <li><strong>Find Competitor:</strong> Best match vs rival</li>
              <li><strong>Compare:</strong> Head-to-head analysis</li>
              <li><strong>Gap Analysis:</strong> Market opportunities</li>
              <li><strong>Benchmarking:</strong> Property comparison</li>
              <li><strong>Matrix:</strong> Full competitive view</li>
            </ul>
          )}
        </div>
      </Card>

      {/* Presets Card */}
      {currentPresets.length > 0 && (
        <Card title={`Quick Presets: ${getMethodDisplayName()}`}>
          <div className="space-y-2">
            {currentPresets.map((preset) => {
              const IconComponent = preset.icon;
              return (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all group border-gray-200 ${
                    recommenderMode === 'competitive'
                      ? 'hover:border-orange-400 hover:bg-orange-50'
                      : 'hover:border-primary-400 hover:bg-primary-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                      recommenderMode === 'competitive'
                        ? 'bg-orange-100 group-hover:bg-orange-200'
                        : 'bg-primary-100 group-hover:bg-primary-200'
                    }`}>
                      <IconComponent className={`w-4 h-4 ${
                        recommenderMode === 'competitive'
                          ? 'text-orange-600'
                          : 'text-primary-600'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-sm text-gray-800 block">{preset.name}</span>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{preset.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      )}

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
    </div>
  ) : null;

  return (
    <>
      <SEO
        title={SEO_DATA.home.title}
        description={SEO_DATA.home.description}
        keywords={SEO_DATA.home.keywords}
      />
      <AppShell sidebar={sidebarContent}>
        {/* Mode Toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => { setRecommenderMode('normal'); handleClear(); }}
            className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              recommenderMode === 'normal'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Find Similar Products
          </button>
          <button
            onClick={() => { setRecommenderMode('competitive'); handleClear(); }}
            className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              recommenderMode === 'competitive'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Swords className="w-4 h-4" />
            Competitive Analysis
          </button>
        </div>

        {/* Main Form Card */}
        <div className={`bg-white rounded-xl shadow-soft border ${recommenderMode === 'competitive' ? 'border-orange-200' : 'border-gray-100'}`}>
          {/* Clickable Header */}
          <button
            onClick={toggleFormCollapse}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors rounded-t-xl"
          >
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {recommenderMode === 'normal' ? 'Grease Recommender' : 'Competitive Analysis'}
              </h2>
              <p className="text-sm text-gray-500">
                {recommenderMode === 'normal'
                  ? 'Select a method and get recommendations using real ML similarity'
                  : 'Analyze your products against competitors'}
              </p>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              {hasResults && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  recommenderMode === 'competitive'
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-primary-100 text-primary-700'
                }`}>
                  {recommendations.length > 0 ? `${recommendations.length} results` : 'Analysis ready'}
                </span>
              )}
              {isFormCollapsed ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronUp className="w-5 h-5" />
              )}
            </div>
          </button>

          {/* Form Content */}
          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              isFormCollapsed ? 'max-h-0' : 'max-h-[2000px]'
            }`}
          >
            <div className="px-6 pb-6 border-t border-gray-100 pt-4">
              {/* ==== NORMAL MODE ==== */}
              {recommenderMode === 'normal' && (
                <div className="space-y-6">
                  {/* Method Selector */}
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { value: 'content', label: 'TF-IDF Content', icon: Search, desc: 'Real cosine similarity' },
                      { value: 'characteristics', label: 'Characteristics', icon: Target, desc: 'Filter by properties' },
                      { value: 'range', label: 'Range Search', icon: TrendingUp, desc: 'Value range query' },
                      { value: 'popularity', label: 'Popularity', icon: BarChart3, desc: 'Best data completeness' },
                      { value: 'hybrid', label: 'Hybrid', icon: GitCompare, desc: 'Content + filters' },
                    ].map(({ value, label, icon: Icon, desc }) => (
                      <button
                        key={value}
                        onClick={() => setNormalMethod(value as NormalMethod)}
                        className={`p-3 rounded-lg border-2 transition-all text-center ${
                          normalMethod === value
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mx-auto mb-1 ${normalMethod === value ? 'text-primary-600' : 'text-gray-400'}`} />
                        <div className={`text-xs font-medium ${normalMethod === value ? 'text-primary-700' : 'text-gray-700'}`}>
                          {label}
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5">{desc}</div>
                      </button>
                    ))}
                  </div>

                  {/* Method-specific inputs */}
                  <div className="space-y-4">
                    {/* Content-based: Select product */}
                    {(normalMethod === 'content' || normalMethod === 'hybrid') && (
                      <Dropdown
                        label="Select Product (for similarity search)"
                        value={selectedProductCode}
                        onChange={(v) => setSelectedProductCode(String(v))}
                        options={productOptions}
                      />
                    )}

                    {/* Characteristics filter */}
                    {normalMethod === 'characteristics' && (
                      <div className="grid grid-cols-2 gap-4">
                        <Dropdown
                          label="Aceite Base"
                          value={aceiteBase}
                          onChange={(v) => setAceiteBase(String(v))}
                          options={[{ value: '', label: 'Any' }, ...options.aceitesBase.map(o => ({ value: o, label: o }))]}
                        />
                        <Dropdown
                          label="Espesante"
                          value={espesante}
                          onChange={(v) => setEspesante(String(v))}
                          options={[{ value: '', label: 'Any' }, ...options.espesantes.map(o => ({ value: o, label: o }))]}
                        />
                        <Input
                          label="Temp. Mínima (°C)"
                          type="number"
                          value={tempMin ?? ''}
                          onChange={(e) => setTempMin(e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="-40"
                        />
                        <Input
                          label="Temp. Máxima (°C)"
                          type="number"
                          value={tempMax ?? ''}
                          onChange={(e) => setTempMax(e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="200"
                        />
                      </div>
                    )}

                    {/* Range search */}
                    {normalMethod === 'range' && (
                      <div className="grid grid-cols-3 gap-4">
                        <Dropdown
                          label="Property"
                          value={rangeColumn}
                          onChange={(v) => setRangeColumn(String(v))}
                          options={rangeColumnOptions}
                        />
                        <Input
                          label="Min Value"
                          type="number"
                          value={rangeMin}
                          onChange={(e) => setRangeMin(Number(e.target.value))}
                        />
                        <Input
                          label="Max Value"
                          type="number"
                          value={rangeMax}
                          onChange={(e) => setRangeMax(Number(e.target.value))}
                        />
                      </div>
                    )}

                    {/* Advanced Properties Toggle - available for all methods */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        className="w-full px-4 py-2 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-sm font-medium text-gray-700 transition-colors"
                      >
                        <span>Advanced Properties (optional)</span>
                        <span className={`transform transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`}>
                          ▼
                        </span>
                      </button>
                      {showAdvancedFilters && (
                        <div className="p-4 space-y-4 bg-white">
                          {/* Row 1: NLGI and Viscosidad */}
                          <div className="grid grid-cols-3 gap-4">
                            <Dropdown
                              label="NLGI Grade"
                              value={nlgiFilter?.toString() ?? ''}
                              onChange={(v) => setNlgiFilter(v ? Number(v) : undefined)}
                              options={[
                                { value: '', label: 'Any' },
                                ...options.nlgiGrades.map(g => ({ value: g.toString(), label: g.toString() }))
                              ]}
                            />
                            <Input
                              label="Viscosidad 40°C Min"
                              type="number"
                              value={viscosidadMin ?? ''}
                              onChange={(e) => setViscosidadMin(e.target.value ? Number(e.target.value) : undefined)}
                              placeholder="0"
                            />
                            <Input
                              label="Viscosidad 40°C Max"
                              type="number"
                              value={viscosidadMax ?? ''}
                              onChange={(e) => setViscosidadMax(e.target.value ? Number(e.target.value) : undefined)}
                              placeholder="500"
                            />
                          </div>
                          {/* Row 2: Punto Gota and Penetración */}
                          <div className="grid grid-cols-4 gap-4">
                            <Input
                              label="Punto Gota Min (°C)"
                              type="number"
                              value={puntoGotaMin ?? ''}
                              onChange={(e) => setPuntoGotaMin(e.target.value ? Number(e.target.value) : undefined)}
                              placeholder="150"
                            />
                            <Input
                              label="Punto Gota Max (°C)"
                              type="number"
                              value={puntoGotaMax ?? ''}
                              onChange={(e) => setPuntoGotaMax(e.target.value ? Number(e.target.value) : undefined)}
                              placeholder="320"
                            />
                            <Input
                              label="Penetración Min"
                              type="number"
                              value={penetracionMin ?? ''}
                              onChange={(e) => setPenetracionMin(e.target.value ? Number(e.target.value) : undefined)}
                              placeholder="0"
                            />
                            <Input
                              label="Penetración Max"
                              type="number"
                              value={penetracionMax ?? ''}
                              onChange={(e) => setPenetracionMax(e.target.value ? Number(e.target.value) : undefined)}
                              placeholder="500"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Common: Top K slider */}
                    <Slider
                      label="Number of Results (Top K)"
                      value={topK}
                      onChange={setTopK}
                      min={5}
                      max={20}
                      step={1}
                    />
                  </div>

                  {/* Submit buttons */}
                  <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                    <Button
                      variant="primary"
                      onClick={handleNormalSubmit}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      {isLoading ? 'Searching...' : 'Get Recommendations'}
                    </Button>
                    <Button variant="ghost" onClick={handleClear} disabled={isLoading}>
                      Clear
                    </Button>
                  </div>

                  <div className="text-sm text-gray-500">
                    Catalog: <span className="font-medium text-gray-900">{catalogCount}</span> products
                  </div>
                </div>
              )}

              {/* ==== COMPETITIVE MODE ==== */}
              {recommenderMode === 'competitive' && (
                <div className="space-y-6">
                  {/* Method Selector */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'find-rivals', label: 'Find Similar Rivals', desc: 'Rivals similar to your product' },
                      { value: 'find-competitor', label: 'Find Best Competitor', desc: 'Your best match vs a rival' },
                      { value: 'compare', label: 'Compare Products', desc: 'Head-to-head analysis' },
                      { value: 'gap-analysis', label: 'Gap Analysis', desc: 'Market opportunities' },
                      { value: 'benchmarking', label: 'Benchmarking', desc: 'Property comparison' },
                      { value: 'matrix', label: 'Competitive Matrix', desc: 'Full market view' },
                    ].map(({ value, label, desc }) => (
                      <button
                        key={value}
                        onClick={() => setCompetitiveMethod(value as CompetitiveMethod)}
                        className={`p-3 rounded-lg border-2 transition-all text-center ${
                          competitiveMethod === value
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`text-xs font-medium ${competitiveMethod === value ? 'text-orange-700' : 'text-gray-700'}`}>
                          {label}
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5">{desc}</div>
                      </button>
                    ))}
                  </div>

                  {/* Method-specific inputs */}
                  <div className="space-y-4">
                    {/* Find rivals: Select your product */}
                    {competitiveMethod === 'find-rivals' && (
                      <Dropdown
                        label="Select Your Product"
                        value={selectedProductCode}
                        onChange={(v) => setSelectedProductCode(String(v))}
                        options={productOptions}
                      />
                    )}

                    {/* Find competitor: Select rival */}
                    {competitiveMethod === 'find-competitor' && (
                      <Dropdown
                        label="Select Rival Product"
                        value={selectedRivalCode}
                        onChange={(v) => setSelectedRivalCode(String(v))}
                        options={rivalOptions}
                      />
                    )}

                    {/* Compare: Both products */}
                    {competitiveMethod === 'compare' && (
                      <div className="grid grid-cols-2 gap-4">
                        <Dropdown
                          label="Your Product"
                          value={selectedProductCode}
                          onChange={(v) => setSelectedProductCode(String(v))}
                          options={productOptions}
                        />
                        <Dropdown
                          label="Rival Product"
                          value={selectedRivalCode}
                          onChange={(v) => setSelectedRivalCode(String(v))}
                          options={rivalOptions}
                        />
                      </div>
                    )}

                    {/* Benchmarking: Select property */}
                    {competitiveMethod === 'benchmarking' && (
                      <Dropdown
                        label="Property to Benchmark"
                        value={benchmarkProperty}
                        onChange={(v) => setBenchmarkProperty(String(v))}
                        options={benchmarkPropertyOptions}
                      />
                    )}

                    {/* Top K for methods that use it */}
                    {['find-rivals', 'find-competitor'].includes(competitiveMethod) && (
                      <Slider
                        label="Number of Results"
                        value={topK}
                        onChange={setTopK}
                        min={5}
                        max={20}
                        step={1}
                      />
                    )}
                  </div>

                  {/* Submit buttons */}
                  <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                    <Button
                      variant="secondary"
                      onClick={handleCompetitiveSubmit}
                      disabled={isLoading}
                      className="flex-1 !bg-orange-600 hover:!bg-orange-700 !text-white"
                    >
                      {isLoading ? 'Analyzing...' : 'Run Analysis'}
                    </Button>
                    <Button variant="ghost" onClick={handleClear} disabled={isLoading}>
                      Clear
                    </Button>
                  </div>

                  <div className="text-sm text-gray-500">
                    <span className="font-medium text-gray-900">{products.length}</span> own products vs{' '}
                    <span className="font-medium text-gray-900">{rivals.length}</span> rivals
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ==== Results Section ==== */}
        {hasResults && (
          <div className="mt-6">
            {/* Recommendations results (normal mode + some competitive modes) */}
            {recommendations.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 min-w-0">
                  <Card
                    title="Top Recommendations"
                    subtitle={`Top ${recommendations.length} results by ${
                      normalMethod === 'content' || recommenderMode === 'competitive' ? 'cosine similarity' : 'match'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <RecommendationsChart recommendations={recommendations} />
                    </div>
                    <div className="mt-6">
                      <RecommendationsTable
                        recommendations={recommendations}
                        onViewDetails={handleViewDetails}
                        selectedProductId={selectedProduct?.id}
                      />
                    </div>
                  </Card>
                </div>
                <div className="lg:col-span-2 min-w-0">
                  {selectedProduct && currentQuery && (
                    <Card
                      title="Query vs Product Details"
                      subtitle="Comparison between your query and selected product"
                    >
                      <ProductDetailPanel
                        product={selectedProduct}
                        query={currentQuery}
                      />
                    </Card>
                  )}
                </div>
              </div>
            )}

            {/* Comparison result */}
            {comparisonResult && (
              <Card title="Product Comparison" subtitle={`${comparisonResult.productoPropio.id} vs ${comparisonResult.productoRival.id}`}>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-2xl font-bold text-green-600">{comparisonResult.resumen.ventajasPropias}</div>
                      <div className="text-sm text-gray-600">Your Advantages</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-400">{comparisonResult.resumen.totalComparaciones - comparisonResult.resumen.ventajasPropias - comparisonResult.resumen.ventajasRival}</div>
                      <div className="text-sm text-gray-600">Ties</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{comparisonResult.resumen.ventajasRival}</div>
                      <div className="text-sm text-gray-600">Rival Advantages</div>
                    </div>
                  </div>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-2 text-left">Property</th>
                        <th className="p-2 text-right">Your Value</th>
                        <th className="p-2 text-right">Rival Value</th>
                        <th className="p-2 text-center">Winner</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonResult.comparaciones.map((c, i) => (
                        <tr key={i} className="border-b">
                          <td className="p-2 font-medium">{c.propiedad}</td>
                          <td className={`p-2 text-right ${c.ventaja === 'propio' ? 'text-green-600 font-bold' : ''}`}>
                            {c.valorPropio?.toFixed(2)}
                          </td>
                          <td className={`p-2 text-right ${c.ventaja === 'rival' ? 'text-red-600 font-bold' : ''}`}>
                            {c.valorRival?.toFixed(2)}
                          </td>
                          <td className="p-2 text-center">
                            <span className={`px-2 py-1 rounded text-xs ${
                              c.ventaja === 'propio' ? 'bg-green-100 text-green-700' :
                              c.ventaja === 'rival' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {c.ventaja === 'propio' ? 'You' : c.ventaja === 'rival' ? 'Rival' : 'Tie'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* Gap Analysis result */}
            {gapAnalysisResult && (
              <Card title="Gap Analysis" subtitle={`${gapAnalysisResult.total} market opportunities identified`}>
                <div className="space-y-4">
                  {gapAnalysisResult.gaps.map((gap, i) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-gray-900">{gap.propiedad}</div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          gap.tipo === 'superior' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {gap.tipo === 'superior' ? 'Rivals have higher' : 'Rivals have lower'}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">Your Best</div>
                          <div className="font-medium">{gap.valorPropio?.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Rival Best</div>
                          <div className="font-medium">{gap.valorRival?.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Gap</div>
                          <div className="font-medium text-orange-600">{gap.gap?.toFixed(2)}</div>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        <strong>Opportunity:</strong> {gap.oportunidad}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Benchmarking result */}
            {benchmarkResult && (
              <Card title="Benchmarking" subtitle={`Property: ${benchmarkResult.propiedad}`}>
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-3">Your Products ({benchmarkResult.propios.count})</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Min:</span>
                        <span className="font-medium">{benchmarkResult.propios.min?.toFixed(2) ?? 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Max:</span>
                        <span className="font-medium">{benchmarkResult.propios.max?.toFixed(2) ?? 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Average:</span>
                        <span className="font-medium">{benchmarkResult.propios.promedio?.toFixed(2) ?? 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-medium text-orange-900 mb-3">Rivals ({benchmarkResult.rivales.count})</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Min:</span>
                        <span className="font-medium">{benchmarkResult.rivales.min?.toFixed(2) ?? 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Max:</span>
                        <span className="font-medium">{benchmarkResult.rivales.max?.toFixed(2) ?? 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Average:</span>
                        <span className="font-medium">{benchmarkResult.rivales.promedio?.toFixed(2) ?? 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {benchmarkResult.analisis && (
                  <div className="mt-4 p-3 bg-gray-100 rounded-lg text-sm">
                    <strong>Analysis:</strong> Best max goes to{' '}
                    <span className={benchmarkResult.analisis.mejorMax === 'propios' ? 'text-blue-600' : 'text-orange-600'}>
                      {benchmarkResult.analisis.mejorMax === 'propios' ? 'Your Products' : 'Rivals'}
                    </span>
                    . Best average goes to{' '}
                    <span className={benchmarkResult.analisis.mejorPromedio === 'propios' ? 'text-blue-600' : 'text-orange-600'}>
                      {benchmarkResult.analisis.mejorPromedio === 'propios' ? 'Your Products' : 'Rivals'}
                    </span>.
                  </div>
                )}
              </Card>
            )}

            {/* Competitive Matrix result */}
            {matrixResult && (
              <Card title="Competitive Matrix" subtitle={`${matrixResult.resumen.totalComparaciones} comparisons analyzed`}>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{matrixResult.productosPropi?.length ?? 0}</div>
                      <div className="text-sm text-gray-600">Your Products</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{matrixResult.productosRivales?.length ?? 0}</div>
                      <div className="text-sm text-gray-600">Rival Products</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary-600">{(matrixResult.resumen.promedioSimilitud * 100).toFixed(1)}%</div>
                      <div className="text-sm text-gray-600">Avg. Similarity</div>
                    </div>
                  </div>

                  {matrixResult.resumen.mejorMatchup && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="text-sm text-green-800 font-medium mb-1">Best Match Found!</div>
                      <div className="text-green-900">
                        <strong>{matrixResult.resumen.mejorMatchup.propio}</strong> competes best against{' '}
                        <strong>{matrixResult.resumen.mejorMatchup.rival}</strong> with{' '}
                        <strong>{(matrixResult.resumen.mejorMatchup.similitud * 100).toFixed(1)}%</strong> similarity.
                      </div>
                    </div>
                  )}

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-2 text-left">Your Product</th>
                          <th className="p-2 text-left">Rival Product</th>
                          <th className="p-2 text-right">Similarity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {matrixResult.matriz?.slice(0, 20).map((m: any, i: number) => (
                          <tr key={i} className="border-b hover:bg-gray-50">
                            <td className="p-2 font-medium">{m.propio}</td>
                            <td className="p-2">{m.rival}</td>
                            <td className="p-2 text-right">
                              <span className={`px-2 py-1 rounded text-xs ${
                                m.similitud > 0.7 ? 'bg-green-100 text-green-700' :
                                m.similitud > 0.4 ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {(m.similitud * 100).toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {matrixResult.matriz?.length > 20 && (
                      <div className="text-center text-sm text-gray-500 mt-2">
                        Showing top 20 of {matrixResult.matriz.length} comparisons
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Score Methodology Section - Only for competitive mode results */}
            {recommenderMode === 'competitive' && (comparisonResult || gapAnalysisResult || benchmarkResult || matrixResult || recommendations.length > 0) && (
              <Card title="Score Methodology" subtitle="Mathematical formulas and data sources">
                <div className="space-y-4 text-sm">
                  {/* Gap Analysis explanation */}
                  {gapAnalysisResult && (
                    <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
                      <h4 className="font-semibold text-orange-800 mb-2">Gap Analysis</h4>
                      <div className="space-y-3 text-gray-700">
                        <div>
                          <p className="font-medium mb-1">Data Source:</p>
                          <p className="text-xs bg-white/50 p-2 rounded font-mono">Values are read directly from the product database (e.g., soldadura_4bolas = 900 for your product)</p>
                        </div>
                        <div>
                          <p className="font-medium mb-1">Formulas:</p>
                          <ul className="list-none space-y-1 text-xs bg-white/50 p-2 rounded font-mono">
                            <li>Your Best = MAX(property) across all your products</li>
                            <li>Rival Best = MAX(property) across all rival products</li>
                            <li>Gap = |Rival Best - Your Best|</li>
                          </ul>
                        </div>
                        <div>
                          <p className="font-medium mb-1">Classification:</p>
                          <ul className="list-disc list-inside text-xs">
                            <li><strong>Superior:</strong> Rival Best &gt; Your Best (opportunity to improve)</li>
                            <li><strong>Inferior:</strong> Rival Best &lt; Your Best (you're already ahead)</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Benchmarking explanation */}
                  {benchmarkResult && (
                    <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Benchmarking</h4>
                      <div className="space-y-3 text-gray-700">
                        <div>
                          <p className="font-medium mb-1">Data Source:</p>
                          <p className="text-xs bg-white/50 p-2 rounded font-mono">Raw numeric values from the selected property column in database</p>
                        </div>
                        <div>
                          <p className="font-medium mb-1">Formulas (per group):</p>
                          <ul className="list-none space-y-1 text-xs bg-white/50 p-2 rounded font-mono">
                            <li>Min = MIN(property) WHERE property IS NOT NULL</li>
                            <li>Max = MAX(property) WHERE property IS NOT NULL</li>
                            <li>Average = SUM(property) / COUNT(property) WHERE property IS NOT NULL</li>
                            <li>Count = COUNT(*) WHERE property IS NOT NULL</li>
                          </ul>
                        </div>
                        <div>
                          <p className="font-medium mb-1">Winner Determination:</p>
                          <ul className="list-disc list-inside text-xs">
                            <li><strong>Best Max:</strong> Group with higher MAX value</li>
                            <li><strong>Best Average:</strong> Group with higher AVG value</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Compare Products explanation */}
                  {comparisonResult && (
                    <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Compare Products</h4>
                      <div className="space-y-3 text-gray-700">
                        <div>
                          <p className="font-medium mb-1">Data Source:</p>
                          <p className="text-xs bg-white/50 p-2 rounded font-mono">Direct property values from each product (e.g., Product A visc_40c = 150, Product B visc_40c = 200)</p>
                        </div>
                        <div>
                          <p className="font-medium mb-1">Comparison Logic:</p>
                          <ul className="list-none space-y-1 text-xs bg-white/50 p-2 rounded font-mono">
                            <li>IF your_value &gt; rival_value THEN winner = "You"</li>
                            <li>IF your_value &lt; rival_value THEN winner = "Rival"</li>
                            <li>IF your_value == rival_value OR both NULL THEN winner = "Tie"</li>
                            <li>Difference = your_value - rival_value</li>
                          </ul>
                        </div>
                        <div>
                          <p className="font-medium mb-1">Summary:</p>
                          <ul className="list-disc list-inside text-xs">
                            <li><strong>Your Advantages:</strong> COUNT(winner = "You")</li>
                            <li><strong>Rival Advantages:</strong> COUNT(winner = "Rival")</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Competitive Matrix explanation */}
                  {matrixResult && (
                    <div className="p-4 border border-purple-200 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">Competitive Matrix</h4>
                      <div className="space-y-3 text-gray-700">
                        <div>
                          <p className="font-medium mb-1">TF-IDF Vectorization:</p>
                          <ul className="list-none space-y-1 text-xs bg-white/50 p-2 rounded font-mono">
                            <li>TF(t,d) = (frequency of term t in document d) / (total terms in d)</li>
                            <li>IDF(t) = log(N / df(t)) where N = total docs, df(t) = docs containing t</li>
                            <li>TF-IDF(t,d) = TF(t,d) × IDF(t)</li>
                          </ul>
                        </div>
                        <div>
                          <p className="font-medium mb-1">Cosine Similarity:</p>
                          <p className="text-xs bg-white/50 p-2 rounded font-mono">
                            similarity(A,B) = (A · B) / (||A|| × ||B||) = Σ(Ai × Bi) / (√Σ(Ai²) × √Σ(Bi²))
                          </p>
                        </div>
                        <div>
                          <p className="font-medium mb-1">Interpretation:</p>
                          <ul className="list-disc list-inside text-xs">
                            <li><strong>1.0 (100%):</strong> Vectors are identical (same text features)</li>
                            <li><strong>0.0 (0%):</strong> Vectors are orthogonal (no common features)</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Find Rivals / Find Competitor explanation */}
                  {recommendations.length > 0 && (competitiveMethod === 'find-rivals' || competitiveMethod === 'find-competitor') && (
                    <div className="p-4 border border-gray-200 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">Similarity Score</h4>
                      <div className="space-y-3 text-gray-700">
                        <div>
                          <p className="font-medium mb-1">Text Features Used:</p>
                          <p className="text-xs bg-white/50 p-2 rounded font-mono">CONCAT(aceite_base, espesante, descripcion, aplicaciones, beneficios)</p>
                        </div>
                        <div>
                          <p className="font-medium mb-1">Process:</p>
                          <ol className="list-decimal list-inside text-xs space-y-1">
                            <li>Tokenize text into terms (words)</li>
                            <li>Calculate TF-IDF weight for each term</li>
                            <li>Create vector representation per product</li>
                            <li>Calculate cosine similarity between query and all candidates</li>
                            <li>Sort by similarity descending, return top K</li>
                          </ol>
                        </div>
                        <div>
                          <p className="font-medium mb-1">Formula:</p>
                          <p className="text-xs bg-white/50 p-2 rounded font-mono">
                            score = cos(θ) = Σ(qi × di) / (√Σ(qi²) × √Σ(di²)) where q=query, d=candidate
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        )}
      </AppShell>
    </>
  );
};
