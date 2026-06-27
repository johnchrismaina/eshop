'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import SectionTitle from '../section/section-title';
import ProductCard from 'packages/components/ProductCard';
import { fetchDeals } from 'apps/user-ui/src/lib/queries/deals';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Deals = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // const scrollRef = useRef<HTMLDivElement>(null);

  const {
    data: deals = [],
    isLoading,
    isError,
    isFetched,
  } = useQuery({
    queryKey: ['deals'],
    queryFn: fetchDeals,
    staleTime: 15 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth);
    };

    handleScroll(); // 🔑 run once on mount
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-white pb-6 ">
      <div className="pb-2 flex justify-between">
        <SectionTitle title="Top Deals" />
        <span className="text-sm underline cursor-pointer text-blue-700 hover:text-blue-800">
          See all
        </span>
      </div>

      {isLoading && !isFetched && (
        <div className="m-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 pb-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-[250px] bg-gray-300 animate-pulse rounded-xl"
            />
          ))}
        </div>
      )}

      {isFetched && deals.length > 0 && isMounted && (
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
            {deals.map((deal: any) => (
              <ProductCard key={deal.id} product={deal} isDeal={true} />
            ))}
          </div>

          {/* Left arrow (fade in on hover) */}
          <button
            onClick={() =>
              scrollRef.current?.scrollBy({ left: -250, behavior: 'smooth' })
            }
            className="absolute left-0 top-20 flex items-center justify-center 
             w-12 h-20 bg-gray-200 bg-opacity-60 rounded-sm shadow-lg 
             opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out"
          >
            <ChevronLeft size={22} />
          </button>

          {/* Right arrow (fade in on hover) */}
          <button
            onClick={() =>
              scrollRef.current?.scrollBy({ left: 250, behavior: 'smooth' })
            }
            className="absolute right-0 top-20 flex items-center justify-center 
             w-12 h-20 bg-gray-200 bg-opacity-60 rounded-sm shadow-lg 
             opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out"
          >
            <ChevronRight size={22} />
          </button>
        </div>
      )}

      {isFetched && deals.length === 0 && !isError && (
        <p className="text-center">No deals available!</p>
      )}

      {isError && (
        <p className="text-center text-red-500">Failed to load deals</p>
      )}
    </div>
  );
};

export default Deals;
