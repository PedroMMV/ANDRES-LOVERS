/**
 * TypeScript types for Factor Analysis functionality
 */

// Variable info from backend
export interface FactorialVariable {
  name: string;
  display: string;
  non_null_count: number;
  missing_percentage: number;
  min: number | null;
  max: number | null;
  mean: number | null;
}

// Correlation matrix response
export interface CorrelationMatrix {
  matrix: number[][];
  variables: string[];
  variables_display: string[];
  error?: string;
}

// Scree plot data point
export interface ScreeDataPoint {
  n_factors: number;
  eigenvalue: number;
  explained_variance_ratio: number;
  individual_variance: number;
}

// Scree analysis response
export interface ScreeAnalysis {
  results: ScreeDataPoint[];
  optimal_factors: number;
  kaiser_criterion: number;
  max_tested: number;
}

// Training configuration
export interface FactorialTrainConfig {
  n_factors: number;
  variables: string[] | null;
  scale: boolean;
}

// Factor loadings structure
export interface FactorLoadings {
  matrix: number[][];
  variables: string[];
  factors: string[];
}

// Training results
export interface FactorialTrainResults {
  n_factors: number;
  n_samples: number;
  variables_used: string[];
  explained_variance_ratio: number[];
  cumulative_variance_ratio: number[];
  total_variance_explained: number;
  loadings: FactorLoadings;
}

// Factor loading by variable
export interface FactorLoadingByVariable {
  variable: string;
  display: string;
  [key: string]: string | number; // Factor_1, Factor_2, etc.
}

// Factor loadings response
export interface FactorLoadingsResponse {
  loadings: FactorLoadingByVariable[];
  n_factors: number;
  variables: string[];
}

// Factor summary item
export interface FactorLoadingItem {
  variable: string;
  display: string;
  loading: number;
}

// Single factor summary
export interface FactorSummaryItem {
  factor: string;
  top_positive_loadings: FactorLoadingItem[];
  top_negative_loadings: FactorLoadingItem[];
}

// Factor summary response
export interface FactorSummaryResponse {
  factors: FactorSummaryItem[];
  n_factors: number;
}

// Product in recommendation
export interface FactorialProduct {
  id: string;
  nombre: string;
  aceite_base: string;
  espesante: string;
  descripcion: string;
  aplicaciones: string;
  beneficios: string;
}

// Single recommendation
export interface FactorialRecommendation {
  rank: number;
  product: FactorialProduct;
  distance: number;
  similarity_percentage: number;
  feature_values: Record<string, number | null>;
  factor_scores: Record<string, number>;
}

// Recommendation query
export interface FactorialRecommendQuery {
  input_features: Record<string, number>;
  top_k: number;
}

// Recommendation response
export interface FactorialRecommendResponse {
  recommendations: FactorialRecommendation[];
  user_factors: Record<string, number>;
  count: number;
  variables_used: string[];
}

// Variables response
export interface FactorialVariablesResponse {
  variables: FactorialVariable[];
  total: number;
  default_variables: string[];
}
