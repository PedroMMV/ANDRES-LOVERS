/**
 * TypeScript types for Clustering functionality
 */

// Variable info from backend
export interface ClusterVariable {
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

// Elbow method data point
export interface ElbowDataPoint {
  k: number;
  inertia: number;
  silhouette: number;
}

// Elbow analysis response
export interface ElbowAnalysis {
  results: ElbowDataPoint[];
  optimal_k: number;
  max_tested: number;
}

// Training configuration
export interface ClusterTrainConfig {
  n_clusters: number;
  variables: string[] | null;
  scale: boolean;
}

// Training results
export interface ClusterTrainResults {
  n_clusters: number;
  inertia: number;
  silhouette_score: number | null;
  cluster_counts: Record<number, number>;
  total_clustered: number;
  variables_used: string[];
}

// Cluster statistics for a variable
export interface ClusterVariableStats {
  mean: number;
  min: number;
  max: number;
  std: number;
}

// Single cluster summary
export interface ClusterSummary {
  cluster_id: number;
  count: number;
  variables: Record<string, ClusterVariableStats>;
}

// Full clusters summary response
export interface ClustersSummaryResponse {
  clusters: ClusterSummary[];
  total_clusters: number;
  variables_analyzed: string[];
}

// Product in recommendation
export interface ClusterProduct {
  id: string;
  nombre: string;
  aceite_base: string;
  espesante: string;
  descripcion: string;
  aplicaciones: string;
  beneficios: string;
}

// Single recommendation
export interface ClusterRecommendation {
  rank: number;
  product: ClusterProduct;
  cluster: number;
  distance: number;
  similarity_score: number;
  similarity_percentage: number;
  feature_values: Record<string, number | null>;
}

// Recommendation query
export interface ClusterRecommendQuery {
  input_features: Record<string, number>;
  top_k: number;
}

// Recommendation response
export interface ClusterRecommendResponse {
  recommendations: ClusterRecommendation[];
  user_cluster: number;
  count: number;
  variables_used: string[];
}

// Variables response
export interface ClusterVariablesResponse {
  variables: ClusterVariable[];
  total: number;
  default_variables: string[];
}

// Product in cluster
export interface ClusterProductItem {
  id: string;
  nombre: string;
  aceite_base: string;
  espesante: string;
  cluster: number;
  feature_values: Record<string, number | null>;
}

// Cluster products response
export interface ClusterProductsResponse {
  cluster_id: number;
  products: ClusterProductItem[];
  count: number;
}
