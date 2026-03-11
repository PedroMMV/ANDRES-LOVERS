/**
 * Mock data for the recommender system
 * TODO: Replace with actual API calls to backend when available
 */

import type {
  GreaseProduct,
  CategoricalOptions
} from '../types/products';
import type {
  PreprocessingStep,
  SystemMetrics
} from '../types/metrics';
import type { FeatureOption } from '../types/regression';

// Mock categorical options (using Spanish field names to match API)
export const categoricalOptions: CategoricalOptions = {
  aceitesBase: [
    'Mineral Oil',
    'Synthetic Hydrocarbon (PAO)',
    'Polyglycol',
    'Ester',
    'Silicone',
    'PFPE (Perfluoropolyether)',
  ],
  espesantes: [
    'Lithium',
    'Lithium Complex',
    'Calcium',
    'Calcium Complex',
    'Aluminum Complex',
    'Polyurea',
    'Clay (Bentonite)',
  ],
  nlgiGrades: [0, 1, 2, 3, 4, 5, 6],
};

// Mock grease products database (using Spanish field names)
export const mockGreaseProducts: GreaseProduct[] = [
  {
    id: 'GR001',
    name: 'MobiLux EP 2',
    descripcion: 'General purpose lithium complex grease for industrial applications',
    aceiteBase: 'Mineral Oil',
    espesante: 'Lithium Complex',
    nlgiGrade: 2,
    viscosidad40C: 150,
    penetracion: 265,
    puntoGota: 250,
    tempMin: -20,
    tempMax: 130,
    soldadura4Bolas: null,
    desgaste4Bolas: null,
    cargaTimken: null,
  },
  {
    id: 'GR002',
    name: 'Shell Alvania EP LF 2',
    descripcion: 'Lithium grease with excellent water resistance',
    aceiteBase: 'Mineral Oil',
    espesante: 'Lithium',
    nlgiGrade: 2,
    viscosidad40C: 110,
    penetracion: 280,
    puntoGota: 190,
    tempMin: -30,
    tempMax: 110,
    soldadura4Bolas: null,
    desgaste4Bolas: null,
    cargaTimken: null,
  },
  {
    id: 'GR003',
    name: 'Castrol LMX Li-Complex',
    descripcion: 'Premium lithium complex grease for heavy-duty applications',
    aceiteBase: 'Mineral Oil',
    espesante: 'Lithium Complex',
    nlgiGrade: 2,
    viscosidad40C: 165,
    penetracion: 270,
    puntoGota: 260,
    tempMin: -25,
    tempMax: 140,
    soldadura4Bolas: null,
    desgaste4Bolas: null,
    cargaTimken: null,
  },
  {
    id: 'GR004',
    name: 'Kluber Centoplex GLP 500',
    descripcion: 'High-performance polyurea grease for extreme temperatures',
    aceiteBase: 'Synthetic Hydrocarbon (PAO)',
    espesante: 'Polyurea',
    nlgiGrade: 2,
    viscosidad40C: 100,
    penetracion: 275,
    puntoGota: 280,
    tempMin: -40,
    tempMax: 180,
    soldadura4Bolas: null,
    desgaste4Bolas: null,
    cargaTimken: null,
  },
  {
    id: 'GR005',
    name: 'SKF LGMT 2',
    descripcion: 'Multi-purpose lithium grease for rolling bearings',
    aceiteBase: 'Mineral Oil',
    espesante: 'Lithium',
    nlgiGrade: 2,
    viscosidad40C: 135,
    penetracion: 290,
    puntoGota: 185,
    tempMin: -30,
    tempMax: 110,
    soldadura4Bolas: null,
    desgaste4Bolas: null,
    cargaTimken: null,
  },
];

// Preprocessing steps - reflects actual backend processing
export const mockPreprocessingSteps: PreprocessingStep[] = [
  {
    step: 1,
    name: 'Type Conversion',
    description: 'Convert numeric columns from string to float using pd.to_numeric()',
    appliesTo: 'numeric',
  },
  {
    step: 2,
    name: 'Text Aggregation',
    description: 'Concatenate text fields: Aceite Base, Espesante, descripcion, beneficios, aplicaciones',
    appliesTo: 'categorical',
  },
  {
    step: 3,
    name: 'Text Cleaning',
    description: 'Lowercase conversion, remove @ symbols and newlines from text',
    appliesTo: 'categorical',
  },
  {
    step: 4,
    name: 'TF-IDF Vectorization',
    description: 'Create TF-IDF matrix with Spanish stop words, ngrams(1,2), max 1000 features',
    appliesTo: 'all',
  },
  {
    step: 5,
    name: 'Cosine Similarity',
    description: 'Compute pairwise cosine similarity matrix for content-based recommendations',
    appliesTo: 'all',
  },
];

// Preprocessing steps for expanded/synthetic data generation
export const expandedDataPreprocessingSteps: PreprocessingStep[] = [
  {
    step: 1,
    name: 'RobustScaler Normalization',
    description: 'Scale numeric variables using RobustScaler to minimize outlier impact (median-based scaling)',
    appliesTo: 'numeric',
  },
  {
    step: 2,
    name: 'Gaussian Copula Modeling',
    description: 'Fit parametric univariate distributions and model multivariate relationships using GaussianMultivariate copula',
    appliesTo: 'numeric',
  },
  {
    step: 3,
    name: 'Synthetic Data Generation',
    description: 'Generate ~1200 synthetic samples preserving statistical properties and variable correlations',
    appliesTo: 'numeric',
  },
  {
    step: 4,
    name: 'Kolmogorov-Smirnov Validation',
    description: 'Verify distribution similarity between original and synthetic data using KS test (p-value > 0.05)',
    appliesTo: 'numeric',
  },
  {
    step: 5,
    name: 'Inverse Scaling',
    description: 'Transform synthetic data back to original scale using inverse RobustScaler transformation',
    appliesTo: 'numeric',
  },
  {
    step: 6,
    name: 'Physical Range Validation',
    description: 'Filter out values outside realistic physical limits (e.g., NLGI 0-5, Temp 80-260°C, Penetration 220-475)',
    appliesTo: 'numeric',
  },
];

// Mock system metrics
export const mockSystemMetrics: SystemMetrics = {
  totalSessions: 1247,
  averageTopK: 7.3,
  averageResponseTime: 245,
  weeklyActivity: [
    { day: 'Mon', sessions: 156 },
    { day: 'Tue', sessions: 189 },
    { day: 'Wed', sessions: 203 },
    { day: 'Thu', sessions: 178 },
    { day: 'Fri', sessions: 192 },
    { day: 'Sat', sessions: 87 },
    { day: 'Sun', sessions: 62 },
  ],
};

// Mock feature options for regression
export const mockRegressionFeatures: FeatureOption[] = [
  { name: 'viscosidad40C', type: 'numeric', description: 'Viscosity at 40°C (cSt)' },
  { name: 'nlgiGrade', type: 'numeric', description: 'NLGI consistency grade' },
  { name: 'penetracion', type: 'numeric', description: 'Cone penetration (0.1mm)' },
  { name: 'tempMin', type: 'numeric', description: 'Min service temp (°C)' },
  { name: 'tempMax', type: 'numeric', description: 'Max service temp (°C)' },
  { name: 'aceiteBase', type: 'categorical', description: 'Base oil type' },
  { name: 'espesante', type: 'categorical', description: 'Thickener type' },
];

export const mockTargetVariables = [
  'puntoGota',
  'viscosidad40C',
  'tempMax',
  'penetracion',
];
