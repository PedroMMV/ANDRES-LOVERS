/**
 * Regression service - handles linear regression model training and prediction
 * Calls the FastAPI backend endpoints
 */

import { apiClient } from '../api/apiClient';
import type {
  RegressionConfig,
  RegressionResults,
  PredictionInput,
  PredictionOutput,
  FeaturesResponse,
  CorrelationMatrixResponse,
  CorrelatedVariablesResponse,
  RegressionRecommendationResponse,
  VectorBuildResponse,
  TrainAllResponse,
  FeatureOption,
} from '../types/regression';

/**
 * Get available features for regression from the backend
 */
export async function getAvailableFeatures(): Promise<FeaturesResponse> {
  return apiClient.get<FeaturesResponse>('/api/regression/features');
}

/**
 * Get correlation matrix for numeric variables
 */
export async function getCorrelationMatrix(): Promise<CorrelationMatrixResponse> {
  return apiClient.get<CorrelationMatrixResponse>('/api/regression/correlation');
}

/**
 * Get correlated variables for each target variable
 */
export async function getCorrelatedVariables(umbral: number = 0.3): Promise<CorrelatedVariablesResponse> {
  return apiClient.get<CorrelatedVariablesResponse>(`/api/regression/correlated-variables?umbral=${umbral}`);
}

/**
 * Train a regression model
 */
export async function trainRegressionModel(config: RegressionConfig): Promise<RegressionResults> {
  const response = await apiClient.post<RegressionResults>('/api/regression/train', {
    target_variable: config.targetVariable,
    predictor_features: config.predictorFeatures.length > 0 ? config.predictorFeatures : null,
    test_size_percent: config.testSizePercent,
  });
  return response;
}

/**
 * Train all regression models for all variables
 */
export async function trainAllModels(): Promise<TrainAllResponse> {
  return apiClient.post<TrainAllResponse>('/api/regression/train-all', {});
}

/**
 * Make a prediction using a trained model
 */
export async function makePrediction(
  input: PredictionInput,
  targetVariable: string
): Promise<PredictionOutput> {
  return apiClient.post<PredictionOutput>('/api/regression/predict', {
    target_variable: targetVariable,
    input_features: input,
  });
}

/**
 * Get grease recommendations based on regression
 */
export async function getRegressionRecommendations(
  inputFeatures: PredictionInput,
  variablesSimilitud?: string[],
  topK: number = 5
): Promise<RegressionRecommendationResponse> {
  return apiClient.post<RegressionRecommendationResponse>('/api/regression/recommend', {
    input_features: inputFeatures,
    variables_similitud: variablesSimilitud,
    top_k: topK,
  });
}

/**
 * Build target vector by predicting missing values
 */
export async function buildTargetVector(
  inputFeatures: PredictionInput,
  variablesToPredict?: string[]
): Promise<VectorBuildResponse> {
  return apiClient.post<VectorBuildResponse>('/api/regression/build-vector', {
    input_features: inputFeatures,
    variables_similitud: variablesToPredict,
  });
}

/**
 * Helper function to get target variable options from features
 */
export function getTargetVariableOptions(features: FeatureOption[]): { value: string; label: string }[] {
  return features
    .filter(f => f.type === 'numeric')
    .map(f => ({
      value: f.name,
      label: f.displayName,
    }));
}

/**
 * Helper function to format feature for display
 */
export function formatFeatureDisplay(feature: FeatureOption): string {
  return `${feature.displayName}${feature.description ? ` - ${feature.description}` : ''}`;
}
