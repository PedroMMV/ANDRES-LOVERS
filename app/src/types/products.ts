/**
 * Core type definitions for lubricating grease products
 * These types represent the data structure for the recommender system
 * Adapted to match real CSV columns from Interlub data
 */

export interface GreaseProduct {
  id: string;
  name: string;

  // Core properties (matching CSV columns)
  aceiteBase: string;       // "Aceite Base"
  espesante: string;        // "Espesante"
  nlgiGrade: number | null; // "Grado NLGI Consistencia"
  viscosidad40C: number | null; // "Viscosidad del Aceite Base a 40°C. cSt"

  // Temperature range
  tempMin: number | null;   // "Temperatura de Servicio °C, min"
  tempMax: number | null;   // "Temperatura de Servicio °C, max"

  // Additional technical properties
  puntoGota: number | null;       // "Punto de Gota, °C"
  penetracion: number | null;     // "Penetración de Cono a 25°C, 0.1mm"
  soldadura4Bolas: number | null; // "Punto de Soldadura Cuatro Bolas, kgf"
  desgaste4Bolas: number | null;  // "Desgaste Cuatro Bolas, mm"
  cargaTimken: number | null;     // "Carga Timken Ok, lb"

  // Descriptive fields
  descripcion?: string;
  subtitulo?: string;
  aplicaciones?: string;
  beneficios?: string;
  color?: string;
  textura?: string;

  // Origin for competitive analysis
  origen?: 'propio' | 'rival';
}

export interface RecommenderQuery {
  // Core properties
  aceiteBase?: string;
  espesante?: string;
  nlgiGrade?: number;
  viscosidad40C?: number;

  // Temperature range
  tempMin?: number;
  tempMax?: number;

  // Additional properties
  puntoGota?: number;
  penetracion?: number;

  // Query configuration
  topK?: number;
  onlyActive?: boolean;
  mode?: 'basic' | 'advanced' | 'competitive';
}

export interface RecommendationResult {
  product: GreaseProduct;
  similarityScore: number; // 0-1, cosine similarity
  matchedFeatures: string[]; // Which features contributed to the match
  origen?: 'propio' | 'rival';
}

export interface CategoricalOptions {
  aceitesBase: string[];
  espesantes: string[];
  nlgiGrades: number[];
  colores?: string[];
  texturas?: string[];
}

// Comparison types for competitive analysis
export interface PropertyComparison {
  propiedad: string;
  valorPropio: number;
  valorRival: number;
  diferencia: number;
  ventaja: 'propio' | 'rival' | 'igual';
}

export interface ComparisonResult {
  productoPropio: Partial<GreaseProduct>;
  productoRival: Partial<GreaseProduct>;
  comparaciones: PropertyComparison[];
  resumen: {
    ventajasPropias: number;
    ventajasRival: number;
    totalComparaciones: number;
  };
}

export interface GapAnalysisItem {
  propiedad: string;
  tipo: 'superior' | 'inferior';
  valorPropio: number;
  valorRival: number;
  gap: number;
  oportunidad: string;
}
