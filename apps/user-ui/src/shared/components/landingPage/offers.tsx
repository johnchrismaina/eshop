'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchEvents } from 'apps/user-ui/src/lib/queries/events';
import SectionTitle from '../section/section-title';
import ProductCard from '../cards/product-card';

const Offers = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const {
    data: offers = [],
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
    <div className="bg-white px-4 pb-8">
      <div className="my-4 block">
        <SectionTitle title="Top Offers" />
      </div>

      {isLoading && !isFetched && (
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-[250px] bg-gray-300 animate-pulse rounded-xl"
            />
          ))}
        </div>
      )}

      {isFetched && offers.length > 0 && isMounted && (
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
          {offers.map((offer: any) => (
            <ProductCard key={offer.id} product={offer} isEvent={true} />
          ))}
        </div>
      )}

      {isFetched && offers.length === 0 && !isError && (
        <p className="text-center">No Offers available yet!</p>
      )}

      {isError && (
        <p className="text-center text-red-500">Failed to load offers</p>
      )}
    </div>
  );
};

export default Offers;
