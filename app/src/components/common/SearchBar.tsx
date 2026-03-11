/**
 * SearchBar component with dropdown results
 * Includes keyboard navigation and highlighting
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, Command } from 'lucide-react';
import { useSearch } from '../../contexts/SearchContext';
import type { SearchResult } from '../../types/search';

export const SearchBar: React.FC = () => {
  const { isOpen, query, results, isSearching, openSearch, closeSearch, setQuery } = useSearch();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Focus input when search opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      handleResultClick(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      closeSearch();
    }
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.path) {
      navigate(result.path);
      closeSearch();
    }
  };

  const getTypeColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'product':
        return 'bg-blue-100 text-blue-700';
      case 'page':
        return 'bg-purple-100 text-purple-700';
      case 'feature':
        return 'bg-green-100 text-green-700';
      case 'action':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (!isOpen) {
    return (
      <div className="relative">
        <input
          type="text"
          placeholder="Search in dashboard..."
          onClick={openSearch}
          readOnly
          className="w-64 pl-10 pr-4 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer hover:border-gray-400 transition-colors"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1 text-xs text-gray-400">
          <Command className="w-3 h-3" />
          <span>K</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={closeSearch}
      />

      {/* Search Modal */}
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 w-full max-w-2xl z-50">
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center px-4 py-3 border-b border-gray-200">
            {isSearching ? (
              <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-gray-400" />
            )}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search products, pages, features..."
              className="flex-1 ml-3 text-base outline-none"
            />
            <kbd className="hidden sm:block px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded border border-gray-300">
              ESC
            </kbd>
          </div>

          {/* Results */}
          {query.length >= 2 && (
            <div className="max-h-96 overflow-y-auto custom-scrollbar">
              {results.length === 0 && !isSearching ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No results found for "{query}"</p>
                  <p className="text-xs mt-1 text-gray-400">
                    Try different keywords or check spelling
                  </p>
                </div>
              ) : (
                <div className="py-2">
                  {results.map((result, index) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className={`w-full px-4 py-3 flex items-start space-x-3 hover:bg-gray-50 transition-colors text-left ${
                        index === selectedIndex ? 'bg-primary-50' : ''
                      }`}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      {/* Icon */}
                      {result.icon && (
                        <span className="text-2xl flex-shrink-0">
                          {result.icon}
                        </span>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900 truncate">
                            {result.title}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-full ${getTypeColor(
                              result.type
                            )}`}
                          >
                            {result.type}
                          </span>
                        </div>
                        {result.subtitle && (
                          <div className="text-sm text-gray-600 truncate">
                            {result.subtitle}
                          </div>
                        )}
                        {result.description && (
                          <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {result.description}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer Hints */}
          {query.length < 2 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Type at least 2 characters to search</span>
                <div className="flex items-center space-x-3">
                  <span className="flex items-center space-x-1">
                    <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-300">
                      ↑↓
                    </kbd>
                    <span>Navigate</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-300">
                      ↵
                    </kbd>
                    <span>Select</span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
