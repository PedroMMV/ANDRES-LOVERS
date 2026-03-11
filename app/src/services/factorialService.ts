/**
 * Factor Analysis Service - API communication for factor analysis functionality
 */

import { apiClient } from '../api/apiClient';
import type {
  FactorialVariablesResponse,
  CorrelationMatrix,
  ScreeAnalysis,
  FactorialTrainConfig,
  FactorialTrainResults,
  FactorLoadingsResponse,
  FactorSummaryResponse,
  FactorialRecommendQuery,
  FactorialRecommendResponse,
} from '../types/factorial';

/**
 * Gets available variables for factor analysis with their statistics
 */
export async function getFactorialVariables(): Promise<FactorialVariablesResponse> {
  return apiClient.get<FactorialVariablesResponse>('/api/factorial/variables');
}

/**
 * Gets correlation matrix for selected variables
 * @param variables - Optional comma-separated list of variables
 */
export async function getCorrelationMatrix(
  variables?: string[]
): Promise<CorrelationMatrix> {
  const params = variables ? `?variables=${variables.join(',')}` : '';
  return apiClient.get<CorrelationMatrix>(`/api/factorial/correlation${params}`);
}

/**
 * Calculates scree plot data for optimal factor selection
 * @param maxFactors - Maximum number of factors to test
 * @param variables - Optional list of variables to use
 */
export async function getScreeData(
  maxFactors: number = 10,
  variables?: string[]
): Promise<ScreeAnalysis> {
  let params = `?max_factors=${maxFactors}`;
  if (variables) {
    params += `&variables=${variables.join(',')}`;
  }
  return apiClient.get<ScreeAnalysis>(`/api/factorial/scree${params}`);
}

/**
 * Trains a Factor Analysis model
 * @param config - Training configuration
 */
export async function trainFactorialModel(
  config: FactorialTrainConfig
): Promise<FactorialTrainResults> {
  return apiClient.post<FactorialTrainResults>('/api/factorial/train', config);
}

/**
 * Gets the factor loadings matrix
 */
export async function getFactorLoadings(): Promise<FactorLoadingsResponse> {
  return apiClient.get<FactorLoadingsResponse>('/api/factorial/loadings');
}

/**
 * Gets summary of factors with interpretations
 */
export async function getFactorSummary(): Promise<FactorSummaryResponse> {
  return apiClient.get<FactorSummaryResponse>('/api/factorial/summary');
}

/**
 * Recommends greases based on user input using Factor Analysis
 * @param query - Recommendation query with input features
 */
export async function getFactorialRecommendations(
  query: FactorialRecommendQuery
): Promise<FactorialRecommendResponse> {
  return apiClient.post<FactorialRecommendResponse>('/api/factorial/recommend', query);
}
