import React from 'react';
import { SearchProduct } from '../../../shared/components/SmartSearchBar';

interface SearchResultsPageProps {
  results: SearchProduct[];
  allProducts: SearchProduct[];
  loading: boolean;
}

export default function SearchResultsPage({
  results,
  allProducts,
  loading,
}: SearchResultsPageProps) {
  // Decide what to show: matched results or fallback to all
  const displayProducts = results.length > 0 ? results : allProducts;

  return (
    <div className="flex gap-6 mt-6 px-6 py-4">
      {/* Left sidebar filters */}
      <aside className="w-64 bg-white border rounded-md p-4">
        <h3 className="font-semibold mb-3">Filters</h3>
        {/* Dummy filters */}
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Category</h4>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" /> Electronics
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" /> Fashion
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" /> Home
          </label>
        </div>
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Price Range</h4>
          <input type="range" min="0" max="1000" className="w-full" />
          <div className="flex justify-between text-xs mt-1">
            <span>$0</span>
            <span>$1000</span>
          </div>
        </div>
      </aside>

      {/* Right side results */}
      <main className="flex-1">
        <h3 className="text-2xl font-bold mb-2">Search Results</h3>

        {/* Results counter only AFTER loading */}
        {!loading && (
          <p className="text-sm text-gray-600 mb-4">
            Showing {displayProducts.length} of {allProducts.length} products
          </p>
        )}

        {loading ? (
          <>
            {/* Skeleton grid while loading */}
            <div className="m-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[250px] bg-gray-300 animate-pulse rounded-xl"
                />
              ))}
            </div>
            {/* Second row of skeletons */}
            <div className="m-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-2 mt-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={`row2-${index}`}
                  className="h-[250px] bg-gray-300 animate-pulse rounded-xl"
                />
              ))}
            </div>
          </>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayProducts.map((product) => (
              <div
                key={product.id}
                className="border rounded-md p-3 hover:shadow transition"
              >
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                )}
                <h4 className="text-sm font-medium">{product.title}</h4>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
