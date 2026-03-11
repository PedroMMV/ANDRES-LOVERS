/**
 * API Client for the Grease Recommender Backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// ==================== Dataset API ====================

export interface DatasetOverview {
  total_records: number;
  total_features: number;
  numeric_features: number;
  categorical_features: number;
  features: FeatureInfo[];
}

export interface FeatureInfo {
  name: string;
  type: 'numeric' | 'categorical';
  missing_percentage: number;
  non_null_count: number;
}

export interface CategoricalOptions {
  aceites_base: string[];
  espesantes: string[];
  nlgi_grades: number[];
  colores?: string[];
  texturas?: string[];
}

export const datasetApi = {
  getOverview: () => apiClient.get<DatasetOverview>('/api/dataset/overview'),
  getOverviewRivals: () => apiClient.get<DatasetOverview>('/api/dataset/overview/rivals'),
  getOverviewExpanded: () => apiClient.get<DatasetOverview>('/api/dataset/overview/expanded'),
  getCategoricalOptions: () => apiClient.get<CategoricalOptions>('/api/dataset/categorical-options'),
  getCategoricalOptionsRivals: () => apiClient.get<CategoricalOptions>('/api/dataset/categorical-options/rivals'),
};

// ==================== Products API ====================

export interface Product {
  id: string;
  nombre: string;
  aceite_base: string;
  espesante: string;
  nlgi_grade: number | null;
  viscosidad_40c: number | null;
  temp_min: number | null;
  temp_max: number | null;
  punto_gota: number | null;
  penetracion: number | null;
  soldadura_4bolas?: number | null;
  desgaste_4bolas?: number | null;
  carga_timken?: number | null;
  descripcion?: string;
  subtitulo?: string;
  aplicaciones?: string;
  beneficios?: string;
  color?: string;
  textura?: string;
}

export interface ProductsResponse {
  total: number;
  products: Product[];
}

export const productsApi = {
  getProducts: (limit = 100, offset = 0) =>
    apiClient.get<ProductsResponse>(`/api/products?limit=${limit}&offset=${offset}`),
  getAllProducts: () =>
    apiClient.get<ProductsResponse>('/api/products?limit=1000'),
  getProductById: (id: string) => apiClient.get<Product>(`/api/products/${id}`),
  getProductsCount: () => apiClient.get<{ count: number }>('/api/products/count'),
  getRivals: (limit = 100, offset = 0) =>
    apiClient.get<ProductsResponse>(`/api/rivals?limit=${limit}&offset=${offset}`),
  getAllRivals: () =>
    apiClient.get<ProductsResponse>('/api/rivals?limit=1000'),
};

// ==================== Recommendations API ====================

export interface RecommendationResult {
  product: Partial<Product>;
  similarity_score: number;
  matched_features: string[];
  origen?: 'propio' | 'rival';
}

export interface RecommendationsResponse {
  recommendations: RecommendationResult[];
  count: number;
}

export interface RecommendByCharacteristicsQuery {
  aceite_base?: string;
  espesante?: string;
  nlgi_grade?: number;
  viscosidad_40c?: number;
  temp_min?: number;
  temp_max?: number;
  top_k?: number;
  only_active?: boolean;
}

export interface ContentBasedQuery {
  codigo_grasa: string;
  top_k?: number;
}

export interface RangeQuery {
  columna: string;
  valor_min: number;
  valor_max: number;
  top_k?: number;
}

export interface HybridQuery {
  codigo_grasa: string;
  filtros?: Record<string, [number, number]>;
  top_k?: number;
}

export interface PopularityQuery {
  top_n?: number;
  filtro_categoria?: string;
}

export const recommendApi = {
  byPopularity: (top_n = 10, filtro_categoria?: string) => {
    const params = new URLSearchParams({ top_n: top_n.toString() });
    if (filtro_categoria) {
      params.append('filtro_categoria', filtro_categoria);
    }
    return apiClient.get<RecommendationsResponse>(`/api/recommend/by-popularity?${params.toString()}`);
  },
  byCharacteristics: (query: RecommendByCharacteristicsQuery) =>
    apiClient.post<RecommendationsResponse>('/api/recommend/by-characteristics', query),
  byContent: (query: ContentBasedQuery) =>
    apiClient.post<RecommendationsResponse>('/api/recommend/by-content', query),
  byRange: (query: RangeQuery) =>
    apiClient.post<RecommendationsResponse>('/api/recommend/by-range', query),
  hybrid: (query: HybridQuery) =>
    apiClient.post<RecommendationsResponse>('/api/recommend/hybrid', query),
  findSimilarRivals: (query: ContentBasedQuery) =>
    apiClient.post<RecommendationsResponse>('/api/recommend/rivals-similar', query),
  findCompetitor: (query: ContentBasedQuery) =>
    apiClient.post<RecommendationsResponse>('/api/recommend/find-competitor', query),
};

// ==================== Comparison API ====================

export interface CompareQuery {
  codigo_propio: string;
  codigo_rival: string;
}

export interface PropertyComparison {
  propiedad: string;
  valor_propio: number;
  valor_rival: number;
  diferencia: number;
  ventaja: 'propio' | 'rival' | 'igual';
}

export interface CompareResponse {
  producto_propio: Partial<Product>;
  producto_rival: Partial<Product>;
  comparaciones: PropertyComparison[];
  resumen: {
    ventajas_propias: number;
    ventajas_rival: number;
    total_comparaciones: number;
  };
}

export interface GapItem {
  propiedad: string;
  tipo: 'superior' | 'inferior';
  valor_propio: number;
  valor_rival: number;
  gap: number;
  oportunidad: string;
}

export interface GapAnalysisResponse {
  gaps: GapItem[];
  total: number;
}

export interface BenchmarkingResponse {
  propiedad: string;
  propios: {
    min: number | null;
    max: number | null;
    promedio: number | null;
    count: number;
  };
  rivales: {
    min: number | null;
    max: number | null;
    promedio: number | null;
    count: number;
  };
  analisis?: {
    mejor_max: 'propios' | 'rivales';
    mejor_promedio: 'propios' | 'rivales';
  };
}

export interface CompetitiveMatrixCell {
  propio: string;
  rival: string;
  similitud: number;
  ventajas_propio: number;
  ventajas_rival: number;
}

export interface CompetitiveMatrixResponse {
  matriz: CompetitiveMatrixCell[];
  productos_propios: string[];
  productos_rivales: string[];
  resumen: {
    total_comparaciones: number;
    promedio_similitud: number;
    mejor_matchup?: {
      propio: string;
      rival: string;
      similitud: number;
    };
  };
}

export const analysisApi = {
  compare: (query: CompareQuery) =>
    apiClient.post<CompareResponse>('/api/recommend/compare', query),
  gapAnalysis: () => apiClient.get<GapAnalysisResponse>('/api/analysis/gap'),
  benchmarking: (propiedad: string) =>
    apiClient.get<BenchmarkingResponse>(`/api/analysis/benchmarking/${propiedad}`),
  competitiveMatrix: () =>
    apiClient.get<CompetitiveMatrixResponse>('/api/analysis/competitive-matrix'),
};

// ==================== Health API ====================

export const healthApi = {
  check: () => apiClient.get<{ status: string; message: string }>('/api/health'),
};
