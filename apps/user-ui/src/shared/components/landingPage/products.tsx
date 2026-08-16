'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from 'apps/user-ui/src/lib/queries/products';
import SectionTitle from '../section/section-title';
import ProductCard from 'packages/components/ProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

  // ... scroll logic
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;

    // small buffer avoids flicker from sub-pixel rounding
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollState(); // set initial state once deals render

    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);

    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [products]); // re-check when deals load/change (widths depend on content)

  return (
    <div className="bg-white px-10 py-6 pb-6">
      <div className="pb-4 block">
        <SectionTitle title="Recommended For You" />
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

      {isFetched && products.length > 0 && isMounted && (
        <div className="relative w-full group">
          {/* Scrollable grid */}
          <div
            ref={scrollRef}
            className="
    grid grid-flow-col 
    auto-cols-[40%]        /* mobile: 2.5 items (100 / 40 ≈ 2.5) */
    sm:auto-cols-[28.5%]   /* tablet: 3.5 items (100 / 28.5 ≈ 3.5) */
    md:auto-cols-[22%]     /* medium: 4.5 items (100 / 22 ≈ 4.5) */
    lg:auto-cols-[calc(16.6666%-13.3333px)] /* desktop: 6 items perfectly aligned */
    gap-4 overflow-x-auto scrollbar-hide w-full
  "
          >
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Left arrow */}
          <button
            onClick={() =>
              scrollRef.current?.scrollBy({ left: -250, behavior: 'smooth' })
            }
            className={`absolute left-0 top-20 flex items-center justify-center 
    w-12 h-12 bg-gray-200 shadow-sm rounded-full 
    transition-all duration-100 ease-in-out
    ${
      canScrollLeft
        ? 'opacity-100 hover:bg-gray-100'
        : 'opacity-0 pointer-events-none'
    }`}
          >
            <ChevronLeft
              size={30}
              className="text-gray-500 hover:text-[#555]"
            />
          </button>

          {/* Right arrow */}
          <button
            onClick={() =>
              scrollRef.current?.scrollBy({ left: 250, behavior: 'smooth' })
            }
            className={`absolute right-0 top-20 flex items-center justify-center 
    w-12 h-12 bg-gray-200 shadow-sm rounded-full 
    transition-all duration-100 ease-in-out
    ${
      canScrollRight
        ? 'opacity-100 hover:bg-gray-100'
        : 'opacity-0 pointer-events-none'
    }`}
          >
            <ChevronRight
              strokeWidth="2"
              size={30}
              className="text-gray-500 hover:text-[#555]"
            />
          </button>
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
