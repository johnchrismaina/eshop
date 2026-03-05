'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from 'apps/user-ui/src/lib/queries/products';
import SectionTitle from '../section/section-title';
import ProductCard from 'packages/components/ProductCard';

const Products = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const {
    data: products = [],
    isLoading,
    isError,
    isFetched,
  } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  return (
    <div className="bg-white px-4 py-0">
      <div className="my-6 block">
        <SectionTitle title="Suggested Products" />
      </div>

      {isLoading && !isFetched && (
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 2xl:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-[250px] bg-gray-300 animate-pulse rounded-xl"
            />
          ))}
        </div>
      )}

      {isFetched && products.length > 0 && isMounted && (
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 2xl:grid-cols-6 gap-3">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {isFetched && products.length === 0 && !isError && (
        <p className="text-center">No Products available yet!</p>
      )}

      {isError && (
        <p className="text-center text-red-500">Failed to load products</p>
      )}
    </div>
  );
};

export default Products;
