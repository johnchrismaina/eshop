'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTopShops } from 'apps/user-ui/src/lib/queries/top-shops';
import SectionTitle from '../section/section-title';
import ShopCard from '../cards/shop.card';

const TopShops = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const {
    data: shops = [],
    isLoading,
    isError,
    isFetched,
  } = useQuery({
    queryKey: ['shops'],
    queryFn: fetchTopShops,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  return (
    <div className="bg-white px-4 pb-8">
      <div className="my-4 block">
        <SectionTitle title="Top Shops" />
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

      {isFetched && shops.length > 0 && isMounted && (
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
          {shops.map((shop: any) => (
            <ShopCard key={shop.id} shop={shop} />
          ))}
        </div>
      )}

      {isFetched && shops.length === 0 && !isError && (
        <p className="text-center">No Shops available yet!</p>
      )}

      {isError && (
        <p className="text-center text-red-500">Failed to load shops</p>
      )}
    </div>
  );
};

export default TopShops;
