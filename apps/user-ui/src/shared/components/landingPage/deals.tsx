'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import SectionTitle from '../section/section-title';
import ProductCard from 'packages/components/ProductCard';
import { fetchDeals } from 'apps/user-ui/src/lib/queries/deals';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import Carousel from 'react-multi-carousel';
// import 'react-multi-carousel/lib/styles.css';

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

  const responsive = {
    superLargeDesktop: {
      // the naming can be any, depends on you.
      breakpoint: { max: 4000, min: 3000 },
      items: 5,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  };

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
          <Carousel responsive={responsive}>
            <div>Item 1</div>
            <div>Item 2</div>
            <div>Item 3</div>
            <div>Item 4</div>
          </Carousel>
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
