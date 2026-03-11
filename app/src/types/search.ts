/**
 * Type definitions for search functionality
 */

export interface SearchResult {
  id: string;
  type: 'product' | 'page' | 'feature' | 'action';
  title: string;
  subtitle?: string;
  description?: string;
  path?: string;
  icon?: string;
  data?: any;
}

export interface SearchQuery {
  query: string;
  filters?: {
    types?: SearchResult['type'][];
    limit?: number;
  };
}

export interface SearchContextValue {
  isOpen: boolean;
  query: string;
  results: SearchResult[];
  isSearching: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  setQuery: (query: string) => void;
  performSearch: (query: string) => Promise<void>;
}
