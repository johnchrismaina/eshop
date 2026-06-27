'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchLatestProducts } from 'apps/user-ui/src/lib/queries/latest-products';
import SectionTitle from '../section/section-title';
import ProductCard from 'packages/components/ProductCard';

const LatestProducts = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const {
    data: latestProducts = [],
    isLoading,
    isError,
    isFetched,
  } = useQuery({
    queryKey: ['latest-products'],
    queryFn: fetchLatestProducts,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  return (
    <div className="bg-white pb-8">
      <div className="pb-4 block">
        <SectionTitle title="Featured Products" />
      </div>

      {isLoading && !isFetched && (
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 2xl:grid-cols-6 gap-3 pb-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-[250px] bg-gray-300 animate-pulse rounded-xl"
            />
          ))}
        </div>
      )}

      {isFetched && latestProducts.length > 0 && isMounted && (
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 2xl:grid-cols-6 gap-3">
          {latestProducts.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {isFetched && latestProducts.length === 0 && !isError && (
        <p className="text-center">No Products available yet!</p>
      )}

      {isError && (
        <p className="text-center text-red-500">
          Failed to load latest products
        </p>
      )}
    </div>
  );
};

export default LatestProducts;
