'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, History, X } from 'lucide-react';
import SearchScopeDropdown from '../SearchScopeDropdown';
import { useRouter, useSearchParams } from 'next/navigation';

export interface SearchProduct {
  id: string;
  title: string;
  slug: string;
  category?: string;
  imageUrl?: string;
  price?: number;
}

interface SmartSearchBarProps {
  products: SearchProduct[];
  searchScope: string;
  setSearchScope: (scope: string) => void;
  openSearchBackdrop: boolean;
  setOpenSearchBackdrop: (open: boolean) => void;
  searchContainerRef: React.RefObject<HTMLDivElement>;
  initialQuery?: string;
}

// Don't attempt phrase suggestions until there's enough product data
// to generate anything meaningful from. Raise this as your catalog grows.
const MIN_PRODUCTS_FOR_SUGGESTIONS = 8;

const STOP_WORDS = new Set([
  'for',
  'the',
  'and',
  'a',
  'an',
  'of',
  'in',
  'with',
  'new',
  'to',
  'on',
]);

function generateSuggestions(
  query: string,
  products: SearchProduct[],
  max = 6
): string[] {
  const q = query.trim().toLowerCase();
  if (!q || products.length < MIN_PRODUCTS_FOR_SUGGESTIONS) return [];

  const matches = products.filter((p) => p.title.toLowerCase().includes(q));

  const wordCounts = new Map<string, number>();
  for (const p of matches) {
    const words = p.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w && w !== q && !STOP_WORDS.has(w) && w.length > 2);

    for (const w of new Set(words)) {
      wordCounts.set(w, (wordCounts.get(w) || 0) + 1);
    }
  }

  return [...wordCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([word]) => `${query} ${word}`);
}

export default function SmartSearchBar({
  products,
  searchScope,
  setSearchScope,
  openSearchBackdrop,
  setOpenSearchBackdrop,
  searchContainerRef,
  initialQuery = '',
}: SmartSearchBarProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load past searches
  useEffect(() => {
    const stored = localStorage.getItem('recentSearches');
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);

  // Recent searches that match what's currently typed
  const matchedRecent = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return recentSearches.filter((s) => s.toLowerCase().includes(q));
  }, [query, recentSearches]);

  // Generated phrase suggestions (gated behind MIN_PRODUCTS_FOR_SUGGESTIONS)
  const phraseSuggestions = useMemo(
    () => generateSuggestions(query, products),
    [query, products]
  );

  // Save a new search
  const saveSearch = (value: string) => {
    if (!value) return;
    const updated = [value, ...recentSearches.filter((s) => s !== value)].slice(
      0,
      5
    );
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  // Remove a single past search
  const deleteSearch = (value: string) => {
    const updated = recentSearches.filter((s) => s !== value);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  // Only update the local query, no navigation/search yet
  const handleChange = (value: string) => {
    setQuery(value);
  };

  // Run search only on submit — new/unmatched queries just search as-is
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
    saveSearch(query);
    setOpenSearchBackdrop(false);
  };

  const runSearch = (value: string) => {
    setQuery(value);
    router.push(`/search?q=${encodeURIComponent(value)}`);
    saveSearch(value);
    setOpenSearchBackdrop(false);
  };

  return (
    <div ref={searchContainerRef} className="relative w-full">
      <form
        onSubmit={handleSubmit}
        className="flex items-center h-[36px] bg-[#fff] rounded-md border border-gray-200
                   focus-within:border-orange-500/50 overflow-hidden 
                   focus-within:ring-1 focus-within:ring-orange-500 transition-all relative"
      >
        <SearchScopeDropdown
          value={searchScope}
          onToggle={() =>
            setSearchScope(searchScope === 'All' ? 'Products' : 'All')
          }
        />

        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setOpenSearchBackdrop(true)}
          placeholder="Search products, brands, categories..."
          className="flex-1 h-10 bg-transparent outline-none border-none text-sm 
                     placeholder:text-gray-500 pl-6 pr-4 focus:border-blue-500 focus:border-2 focus:ring-0"
        />

        <button
          aria-label="Search"
          type="submit"
          className="flex items-center justify-center w-12 h-[36px] rounded-r-md
                     text-orange-600 hover:text-orange-700 bg-gray-50 border-l border-gray-200 transition-colors"
        >
          <Search strokeWidth={2} size={18} />
        </button>
      </form>

      {/* Dropdown: recent searches when empty; matched recent + suggestions while typing */}
      {openSearchBackdrop && (
        <div className="absolute top-full left-0 mt-1 bg-white border rounded-md w-full z-[200] max-h-96 overflow-y-auto">
          {query ? (
            <>
              {matchedRecent.map((s, idx) => (
                <div
                  key={`recent-${idx}`}
                  className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer gap-2"
                  onClick={() => runSearch(s)}
                >
                  <History size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="text-sm">{s}</span>
                </div>
              ))}

              {phraseSuggestions.map((s, idx) => (
                <div
                  key={`suggestion-${idx}`}
                  className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer gap-2"
                  onClick={() => runSearch(s)}
                >
                  <Search size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="text-sm">{s}</span>
                </div>
              ))}
            </>
          ) : (
            recentSearches.length > 0 && (
              <>
                <div className="px-4 py-1 text-xs text-gray-500">
                  Recent searches
                </div>
                {recentSearches.map((s, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer group"
                    onClick={() => {
                      setQuery(s);
                      router.push(`/search?q=${encodeURIComponent(s)}`);
                      setOpenSearchBackdrop(false);
                    }}
                  >
                    <span>{s}</span>
                    <button
                      type="button"
                      aria-label={`Remove "${s}" from recent searches`}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSearch(s);
                      }}
                      className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </>
            )
          )}
        </div>
      )}
    </div>
  );
}
