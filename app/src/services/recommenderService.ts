/**
 * Recommender service - handles grease similarity calculations
 * Connects to FastAPI backend for ML-powered recommendations
 */

import type {
  GreaseProduct,
  RecommenderQuery,
  RecommendationResult,
  CategoricalOptions,
  ComparisonResult,
} from '../types/products';
import {
  recommendApi,
  productsApi,
  datasetApi,
  analysisApi,
  type Product,
  type RecommendationsResponse,
} from '../api/apiClient';

// Helper to convert API product to GreaseProduct
function apiProductToGreaseProduct(p: Partial<Product>): GreaseProduct {
  return {
    id: p.id || '',
    name: p.nombre || p.id || '',
    aceiteBase: p.aceite_base || '',
    espesante: p.espesante || '',
    nlgiGrade: p.nlgi_grade ?? null,
    viscosidad40C: p.viscosidad_40c ?? null,
    tempMin: p.temp_min ?? null,
    tempMax: p.temp_max ?? null,
    puntoGota: p.punto_gota ?? null,
    penetracion: p.penetracion ?? null,
    soldadura4Bolas: p.soldadura_4bolas ?? null,
    desgaste4Bolas: p.desgaste_4bolas ?? null,
    cargaTimken: p.carga_timken ?? null,
    descripcion: p.descripcion,
    subtitulo: p.subtitulo,
    aplicaciones: p.aplicaciones,
    beneficios: p.beneficios,
    color: p.color,
    textura: p.textura,
  };
}

// Helper to convert API response to RecommendationResult
function apiToRecommendationResult(
  response: RecommendationsResponse
): RecommendationResult[] {
  return response.recommendations.map((rec) => ({
    product: apiProductToGreaseProduct(rec.product),
    similarityScore: rec.similarity_score,
    matchedFeatures: rec.matched_features,
    origen: rec.origen,
  }));
}

/**
 * Get recommendations based on query
 * Uses the FastAPI backend
 */
export async function getRecommendations(
  query: RecommenderQuery
): Promise<RecommendationResult[]> {
  try {
    const response = await recommendApi.byCharacteristics({
      aceite_base: query.aceiteBase,
      espesante: query.espesante,
      nlgi_grade: query.nlgiGrade,
      viscosidad_40c: query.viscosidad40C,
      temp_min: query.tempMin,
      temp_max: query.tempMax,
      top_k: query.topK,
      only_active: query.onlyActive,
    });

    return apiToRecommendationResult(response);
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return [];
  }
}

/**
 * Get recommendations by content similarity (TF-IDF)
 */
export async function getRecommendationsByContent(
  codigoGrasa: string,
  topK: number = 10
): Promise<RecommendationResult[]> {
  try {
    const response = await recommendApi.byContent({
      codigo_grasa: codigoGrasa,
      top_k: topK,
    });

    return apiToRecommendationResult(response);
  } catch (error) {
    console.error('Error getting content recommendations:', error);
    return [];
  }
}

/**
 * Get similar rivals to a product
 */
export async function getSimilarRivals(
  codigoGrasa: string,
  topK: number = 10
): Promise<RecommendationResult[]> {
  try {
    const response = await recommendApi.findSimilarRivals({
      codigo_grasa: codigoGrasa,
      top_k: topK,
    });

    return apiToRecommendationResult(response);
  } catch (error) {
    console.error('Error getting similar rivals:', error);
    return [];
  }
}

/**
 * Find best competing product against a rival
 */
export async function findCompetitor(
  codigoRival: string,
  topK: number = 10
): Promise<RecommendationResult[]> {
  try {
    const response = await recommendApi.findCompetitor({
      codigo_grasa: codigoRival,
      top_k: topK,
    });

    return apiToRecommendationResult(response);
  } catch (error) {
    console.error('Error finding competitor:', error);
    return [];
  }
}

/**
 * Compare a product with a rival
 */
export async function compareWithRival(
  codigoPropio: string,
  codigoRival: string
): Promise<ComparisonResult | null> {
  try {
    const response = await analysisApi.compare({
      codigo_propio: codigoPropio,
      codigo_rival: codigoRival,
    });

    return {
      productoPropio: apiProductToGreaseProduct(response.producto_propio as Product),
      productoRival: apiProductToGreaseProduct(response.producto_rival as Product),
      comparaciones: response.comparaciones.map((c) => ({
        propiedad: c.propiedad,
        valorPropio: c.valor_propio,
        valorRival: c.valor_rival,
        diferencia: c.diferencia,
        ventaja: c.ventaja,
      })),
      resumen: {
        ventajasPropias: response.resumen.ventajas_propias,
        ventajasRival: response.resumen.ventajas_rival,
        totalComparaciones: response.resumen.total_comparaciones,
      },
    };
  } catch (error) {
    console.error('Error comparing products:', error);
    return null;
  }
}

/**
 * Get product by ID
 */
export async function getProductById(id: string): Promise<GreaseProduct | null> {
  try {
    const product = await productsApi.getProductById(id);
    return apiProductToGreaseProduct(product);
  } catch (error) {
    console.error('Error getting product:', error);
    return null;
  }
}

/**
 * Get all products
 */
export async function getProducts(
  limit: number = 100,
  offset: number = 0
): Promise<{ total: number; products: GreaseProduct[] }> {
  try {
    const response = await productsApi.getProducts(limit, offset);
    return {
      total: response.total,
      products: response.products.map(apiProductToGreaseProduct),
    };
  } catch (error) {
    console.error('Error getting products:', error);
    return { total: 0, products: [] };
  }
}

/**
 * Get rival products
 */
export async function getRivals(
  limit: number = 100,
  offset: number = 0
): Promise<{ total: number; products: GreaseProduct[] }> {
  try {
    const response = await productsApi.getRivals(limit, offset);
    return {
      total: response.total,
      products: response.products.map((p) => ({
        ...apiProductToGreaseProduct(p),
        origen: 'rival' as const,
      })),
    };
  } catch (error) {
    console.error('Error getting rivals:', error);
    return { total: 0, products: [] };
  }
}

/**
 * Get total catalog count
 */
export async function getCatalogCount(): Promise<number> {
  try {
    const response = await productsApi.getProductsCount();
    return response.count;
  } catch (error) {
    console.error('Error getting catalog count:', error);
    return 0;
  }
}

/**
 * Get categorical options from the dataset
 */
export async function getCategoricalOptions(): Promise<CategoricalOptions> {
  try {
    const options = await datasetApi.getCategoricalOptions();
    return {
      aceitesBase: options.aceites_base,
      espesantes: options.espesantes,
      nlgiGrades: options.nlgi_grades,
      colores: options.colores,
      texturas: options.texturas,
    };
  } catch (error) {
    console.error('Error getting categorical options:', error);
    return {
      aceitesBase: [],
      espesantes: [],
      nlgiGrades: [],
    };
  }
}

/**
 * Get recommendations by popularity (data completeness)
 */
export async function getRecommendationsByPopularity(
  topN: number = 10,
  filtroCategoria?: string
): Promise<RecommendationResult[]> {
  try {
    const response = await recommendApi.byPopularity(topN, filtroCategoria);
    return apiToRecommendationResult(response);
  } catch (error) {
    console.error('Error getting popularity recommendations:', error);
    return [];
  }
}

/**
 * Get recommendations by range (for a specific property)
 */
export async function getRecommendationsByRange(
  columna: string,
  valorMin: number,
  valorMax: number,
  topK: number = 10
): Promise<RecommendationResult[]> {
  try {
    const response = await recommendApi.byRange({
      columna,
      valor_min: valorMin,
      valor_max: valorMax,
      top_k: topK,
    });
    return apiToRecommendationResult(response);
  } catch (error) {
    console.error('Error getting range recommendations:', error);
    return [];
  }
}

/**
 * Get hybrid recommendations (content + filters)
 */
export async function getRecommendationsHybrid(
  codigoGrasa: string,
  filtros?: Record<string, [number, number]>,
  topK: number = 10
): Promise<RecommendationResult[]> {
  try {
    const response = await recommendApi.hybrid({
      codigo_grasa: codigoGrasa,
      filtros,
      top_k: topK,
    });
    return apiToRecommendationResult(response);
  } catch (error) {
    console.error('Error getting hybrid recommendations:', error);
    return [];
  }
}

/**
 * Get all products (for product selector)
 */
export async function getAllProducts(): Promise<GreaseProduct[]> {
  try {
    const response = await productsApi.getAllProducts();
    return response.products.map(apiProductToGreaseProduct);
  } catch (error) {
    console.error('Error getting all products:', error);
    return [];
  }
}

/**
 * Get all rival products
 */
export async function getAllRivals(): Promise<GreaseProduct[]> {
  try {
    const response = await productsApi.getAllRivals();
    return response.products.map((p) => ({
      ...apiProductToGreaseProduct(p),
      origen: 'rival' as const,
    }));
  } catch (error) {
    console.error('Error getting all rivals:', error);
    return [];
  }
}

/**
 * Gap analysis: what rivals have that we don't
 */
export async function getGapAnalysis(): Promise<{
  gaps: Array<{
    propiedad: string;
    tipo: 'superior' | 'inferior';
    valorPropio: number;
    valorRival: number;
    gap: number;
    oportunidad: string;
  }>;
  total: number;
}> {
  try {
    const response = await analysisApi.gapAnalysis();
    return {
      gaps: response.gaps.map((g) => ({
        propiedad: g.propiedad,
        tipo: g.tipo,
        valorPropio: g.valor_propio,
        valorRival: g.valor_rival,
        gap: g.gap,
        oportunidad: g.oportunidad,
      })),
      total: response.total,
    };
  } catch (error) {
    console.error('Error getting gap analysis:', error);
    return { gaps: [], total: 0 };
  }
}

/**
 * Benchmarking: compare property stats between our products and rivals
 */
export async function getBenchmarking(propiedad: string): Promise<{
  propiedad: string;
  propios: { min: number | null; max: number | null; promedio: number | null; count: number };
  rivales: { min: number | null; max: number | null; promedio: number | null; count: number };
  analisis?: { mejorMax: 'propios' | 'rivales'; mejorPromedio: 'propios' | 'rivales' };
}> {
  try {
    const response = await analysisApi.benchmarking(propiedad);
    return {
      propiedad: response.propiedad,
      propios: response.propios,
      rivales: response.rivales,
      analisis: response.analisis
        ? {
            mejorMax: response.analisis.mejor_max,
            mejorPromedio: response.analisis.mejor_promedio,
          }
        : undefined,
    };
  } catch (error) {
    console.error('Error getting benchmarking:', error);
    return {
      propiedad,
      propios: { min: null, max: null, promedio: null, count: 0 },
      rivales: { min: null, max: null, promedio: null, count: 0 },
    };
  }
}

/**
 * Competitive matrix: positioning of our products vs rivals
 */
export async function getCompetitiveMatrix(): Promise<{
  matriz: Array<{
    propio: string;
    rival: string;
    similitud: number;
    ventajasPropio: number;
    ventajasRival: number;
  }>;
  productosPropi: string[];
  productosRivales: string[];
  resumen: {
    totalComparaciones: number;
    promedioSimilitud: number;
    mejorMatchup?: { propio: string; rival: string; similitud: number };
  };
}> {
  try {
    const response = await analysisApi.competitiveMatrix();
    return {
      matriz: response.matriz.map((m) => ({
        propio: m.propio,
        rival: m.rival,
        similitud: m.similitud,
        ventajasPropio: m.ventajas_propio,
        ventajasRival: m.ventajas_rival,
      })),
      productosPropi: response.productos_propios,
      productosRivales: response.productos_rivales,
      resumen: {
        totalComparaciones: response.resumen.total_comparaciones,
        promedioSimilitud: response.resumen.promedio_similitud,
        mejorMatchup: response.resumen.mejor_matchup,
      },
    };
  } catch (error) {
    console.error('Error getting competitive matrix:', error);
    return {
      matriz: [],
      productosPropi: [],
      productosRivales: [],
      resumen: { totalComparaciones: 0, promedioSimilitud: 0 },
    };
  }
}
