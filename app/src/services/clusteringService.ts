/**
 * Clustering Service - API communication for clustering functionality
 */

import { apiClient } from '../api/apiClient';
import type {
  ClusterVariablesResponse,
  CorrelationMatrix,
  ElbowAnalysis,
  ClusterTrainConfig,
  ClusterTrainResults,
  ClustersSummaryResponse,
  ClusterRecommendQuery,
  ClusterRecommendResponse,
  ClusterProductsResponse,
} from '../types/clustering';

/**
 * Gets available variables for clustering with their statistics
 */
export async function getClusteringVariables(): Promise<ClusterVariablesResponse> {
  return apiClient.get<ClusterVariablesResponse>('/api/clustering/variables');
}

/**
 * Gets correlation matrix for selected variables
 * @param variables - Optional comma-separated list of variables
 */
export async function getCorrelationMatrix(
  variables?: string[]
): Promise<CorrelationMatrix> {
  const params = variables ? `?variables=${variables.join(',')}` : '';
  return apiClient.get<CorrelationMatrix>(`/api/clustering/correlation${params}`);
}

/**
 * Calculates elbow method data for optimal k selection
 * @param maxClusters - Maximum number of clusters to test
 * @param variables - Optional list of variables to use
 */
export async function getElbowData(
  maxClusters: number = 10,
  variables?: string[]
): Promise<ElbowAnalysis> {
  let params = `?max_clusters=${maxClusters}`;
  if (variables) {
    params += `&variables=${variables.join(',')}`;
  }
  return apiClient.get<ElbowAnalysis>(`/api/clustering/elbow${params}`);
}

/**
 * Trains a K-Means clustering model
 * @param config - Training configuration
 */
export async function trainClusteringModel(
  config: ClusterTrainConfig
): Promise<ClusterTrainResults> {
  return apiClient.post<ClusterTrainResults>('/api/clustering/train', config);
}

/**
 * Gets statistical summary of all clusters
 */
export async function getClustersSummary(): Promise<ClustersSummaryResponse> {
  return apiClient.get<ClustersSummaryResponse>('/api/clustering/summary');
}

/**
 * Recommends greases based on user input using clustering
 * @param query - Recommendation query with input features
 */
export async function getClusterRecommendations(
  query: ClusterRecommendQuery
): Promise<ClusterRecommendResponse> {
  return apiClient.post<ClusterRecommendResponse>('/api/clustering/recommend', query);
}

/**
 * Gets products belonging to a specific cluster
 * @param clusterId - Cluster ID to fetch products for
 * @param limit - Maximum number of products to return
 */
export async function getClusterProducts(
  clusterId: number,
  limit: number = 50
): Promise<ClusterProductsResponse> {
  return apiClient.get<ClusterProductsResponse>(
    `/api/clustering/products/${clusterId}?limit=${limit}`
  );
}
