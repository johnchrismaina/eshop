'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchEvents } from 'apps/user-ui/src/lib/queries/events';
import SectionTitle from '../section/section-title';
import ProductCard from 'packages/components/ProductCard';

const Offers = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const {
    data: events = [],
    isLoading,
    isError,
    isFetched,
  } = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
    staleTime: 15 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  return (
    <div className="bg-white px-4 ">
      <div className="my-6 block">
        <SectionTitle title="Top Deals" />
      </div>

      {isLoading && !isFetched && (
        <div className="m-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 2xl:grid-cols-6 gap-3 mb-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-[250px] bg-gray-300 animate-pulse rounded-xl"
            />
          ))}
        </div>
      )}

      {isFetched && events.length > 0 && isMounted && (
        <div className="m-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 2xl:grid-cols-6 gap-3 mb-2">
          {events.map((event: any) => (
            <ProductCard key={event.id} product={event} isEvent={true} />
          ))}
        </div>
      )}

      {isFetched && events.length === 0 && !isError && (
        <p className="text-center">No offers available yet!</p>
      )}

      {isError && (
        <p className="text-center text-red-500">Failed to load offers</p>
      )}
    </div>
  );
};

export default Offers;
