/**
 * Type definitions for regression model functionality
 * Matches the backend API responses
 */

// ==================== Feature Types ====================

export interface FeatureStats {
  min: number | null;
  max: number | null;
  mean: number | null;
  count: number;
}

export interface FeatureOption {
  name: string;
  displayName: string;
  type: 'numeric' | 'categorical';
  description: string;
  stats: FeatureStats;
}

export interface FeaturesResponse {
  features: FeatureOption[];
  total: number;
}

// ==================== Correlation Types ====================

export interface CorrelationPoint {
  var1: string;
  var2: string;
  var1_display: string;
  var2_display: string;
  correlation: number;
}

export interface CorrelationMatrixResponse {
  variables: string[];
  variables_display: string[];
  correlations: CorrelationPoint[];
  umbral: number;
}

export interface CorrelatedPredictor {
  name: string;
  display: string;
  correlation: number;
}

export interface CorrelatedVariable {
  variable: string;
  variable_display: string;
  predictores: CorrelatedPredictor[];
}

export interface CorrelatedVariablesResponse {
  umbral: number;
  variables: CorrelatedVariable[];
}

// ==================== Training Types ====================

export interface RegressionConfig {
  targetVariable: string;
  predictorFeatures: string[];
  testSizePercent: number;
}

export interface RegressionMetrics {
  r2Train: number;
  r2Test: number;
  mseTrain: number;
  mseTest: number;
  rmseTrain: number;
  rmseTest: number;
  mae: number;
}

export interface ModelCoefficient {
  feature: string;
  feature_display: string;
  coefficient: number;
  importance: number;
}

export interface ActualVsPredicted {
  actual: number;
  predicted: number;
}

export interface RegressionResults {
  targetVariable: string;
  targetVariableDisplay: string;
  predictorFeatures: string[];
  predictorFeaturesDisplay: string[];
  testSizePercent: number;
  numSamples: number;
  numTrainSamples: number;
  numTestSamples: number;
  metrics: RegressionMetrics;
  coefficients: ModelCoefficient[];
  intercept: number;
  actualVsPredicted: ActualVsPredicted[];
  residuals: number[];
}

// ==================== Prediction Types ====================

export interface PredictionInput {
  [feature: string]: number;
}

export interface PredictionOutput {
  targetVariable: string;
  targetVariableDisplay: string;
  predictedValue: number;
  inputFeatures: Record<string, number>;
}

// ==================== Recommendation Types ====================

export interface RecommendedGrease {
  id: string;
  nombre: string;
  distancia: number;
  similitud: number;
  propiedades: Record<string, number | null>;
  aceite_base: string | null;
  espesante: string | null;
}

export interface RegressionRecommendationResponse {
  entrada_usuario: Record<string, number>;
  vector_objetivo: Record<string, number>;
  variables_usadas: string[];
  variables_usadas_display: string[];
  recomendaciones: RecommendedGrease[];
  total: number;
}

// ==================== Vector Build Types ====================

export interface VectorBuildResponse {
  input: Record<string, number>;
  vector_completo: Record<string, number>;
  variables_predichas: string[];
}

// ==================== Train All Response ====================

export interface TrainedModelInfo {
  variable: string;
  variable_display: string;
  predictores: string[];
  num_samples: number;
}

export interface TrainAllResponse {
  modelos_entrenados: TrainedModelInfo[];
  total: number;
}
