/**
 * Search service with fuzzy matching across products, pages, and features
 */

import type { SearchResult, SearchQuery } from '../types/search';
import { mockGreaseProducts } from './mockData';

// Define searchable pages
const pages: SearchResult[] = [
  {
    id: 'page-home',
    type: 'page',
    title: 'Home',
    subtitle: 'Grease Recommender',
    description: 'Find similar greases using cosine similarity',
    path: '/',
    icon: '🏠',
  },
  {
    id: 'page-data-explorer',
    type: 'page',
    title: 'Data Explorer',
    subtitle: 'Dataset & Preprocessing',
    description: 'Explore dataset features and preprocessing pipeline',
    path: '/data-explorer',
    icon: '📊',
  },
  {
    id: 'page-regressor',
    type: 'page',
    title: 'Regressor',
    subtitle: 'Linear Regression',
    description: 'Train models to predict grease properties',
    path: '/regressor',
    icon: '📈',
  },
  {
    id: 'page-metrics',
    type: 'page',
    title: 'Metrics & Reports',
    subtitle: 'System Analytics',
    description: 'View usage statistics and system metrics',
    path: '/metrics',
    icon: '📉',
  },
  {
    id: 'page-help',
    type: 'page',
    title: 'Help & About',
    subtitle: 'Documentation',
    description: 'Learn how to use the system and understand limitations',
    path: '/help',
    icon: '❓',
  },
];

// Define searchable features/actions
const features: SearchResult[] = [
  {
    id: 'action-recommend',
    type: 'action',
    title: 'Get Recommendations',
    description: 'Find similar greases based on properties',
    path: '/',
    icon: '🔍',
  },
  {
    id: 'action-train-model',
    type: 'action',
    title: 'Train Regression Model',
    description: 'Train a model to predict grease properties',
    path: '/regressor',
    icon: '🤖',
  },
  {
    id: 'feature-base-oil',
    type: 'feature',
    title: 'Base Oil',
    description: 'Type of base oil used in grease formulation',
    path: '/',
  },
  {
    id: 'feature-thickener',
    type: 'feature',
    title: 'Thickener',
    description: 'Thickening agent type in grease',
    path: '/',
  },
  {
    id: 'feature-nlgi-grade',
    type: 'feature',
    title: 'NLGI Grade',
    description: 'Grease consistency classification (0-6)',
    path: '/',
  },
  {
    id: 'feature-viscosity',
    type: 'feature',
    title: 'Viscosity at 40°C',
    description: 'Kinematic viscosity measurement',
    path: '/',
  },
];

/**
 * Simple fuzzy match scoring
 * Returns a score from 0-1 based on how well the query matches the text
 */
function fuzzyMatch(text: string, query: string): number {
  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();

  // Exact match
  if (textLower === queryLower) return 1.0;

  // Starts with query
  if (textLower.startsWith(queryLower)) return 0.9;

  // Contains query
  if (textLower.includes(queryLower)) return 0.7;

  // Check for partial matches (words)
  const textWords = textLower.split(/\s+/);
  const queryWords = queryLower.split(/\s+/);

  let matchCount = 0;
  queryWords.forEach(qWord => {
    if (textWords.some(tWord => tWord.includes(qWord) || qWord.includes(tWord))) {
      matchCount++;
    }
  });

  if (matchCount > 0) {
    return (matchCount / queryWords.length) * 0.6;
  }

  return 0;
}

/**
 * Search across all searchable content
 * TODO: In production, this would call a backend search API with proper indexing
 */
export async function performSearch(searchQuery: SearchQuery): Promise<SearchResult[]> {
  const { query, filters } = searchQuery;

  if (!query || query.trim().length < 2) {
    return [];
  }

  const allResults: Array<SearchResult & { score: number }> = [];

  // Search products
  if (!filters?.types || filters.types.includes('product')) {
    mockGreaseProducts.forEach(product => {
      const titleScore = fuzzyMatch(product.name, query);
      const aceiteBaseScore = product.aceiteBase
        ? fuzzyMatch(product.aceiteBase, query)
        : 0;
      const descScore = product.descripcion
        ? fuzzyMatch(product.descripcion, query)
        : 0;

      const maxScore = Math.max(titleScore, aceiteBaseScore, descScore);

      if (maxScore > 0.3) {
        allResults.push({
          id: `product-${product.id}`,
          type: 'product',
          title: product.name,
          subtitle: product.aceiteBase || 'Grease Product',
          description: product.descripcion,
          path: `/?product=${product.id}`,
          icon: '🛢️',
          data: product,
          score: maxScore,
        });
      }
    });
  }

  // Search pages
  if (!filters?.types || filters.types.includes('page')) {
    pages.forEach(page => {
      const titleScore = fuzzyMatch(page.title, query);
      const subtitleScore = page.subtitle ? fuzzyMatch(page.subtitle, query) : 0;
      const descScore = page.description ? fuzzyMatch(page.description, query) : 0;

      const maxScore = Math.max(titleScore, subtitleScore, descScore);

      if (maxScore > 0.3) {
        allResults.push({ ...page, score: maxScore });
      }
    });
  }

  // Search features and actions
  if (!filters?.types || filters.types.includes('feature') || filters.types.includes('action')) {
    features.forEach(feature => {
      if (filters?.types && !filters.types.includes(feature.type)) {
        return;
      }

      const titleScore = fuzzyMatch(feature.title, query);
      const descScore = feature.description ? fuzzyMatch(feature.description, query) : 0;

      const maxScore = Math.max(titleScore, descScore);

      if (maxScore > 0.3) {
        allResults.push({ ...feature, score: maxScore });
      }
    });
  }

  // Sort by score (descending)
  allResults.sort((a, b) => b.score - a.score);

  // Apply limit
  const limit = filters?.limit || 10;
  const results = allResults.slice(0, limit);

  // Remove score from results
  return results.map(({ score, ...result }) => result);
}

/**
 * Get quick suggestions (for autocomplete)
 */
export function getQuickSuggestions(query: string): string[] {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const suggestions: string[] = [];

  // Add matching product names
  mockGreaseProducts.forEach(product => {
    if (fuzzyMatch(product.name, query) > 0.5) {
      suggestions.push(product.name);
    }
  });

  // Add matching page titles
  pages.forEach(page => {
    if (fuzzyMatch(page.title, query) > 0.5) {
      suggestions.push(page.title);
    }
  });

  return suggestions.slice(0, 5);
}
