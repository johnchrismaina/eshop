import { useQuery } from '@tanstack/react-query';
import axiosProductService from 'apps/user-ui/src/utils/axiosProductService';
import React from 'react';
import SectionTitle from '../section/section-title';
import ShopCard from '../cards/shop.card';

const TopShops = () => {
  // Fetch top shops from the API and display them
  const { data: shops = [], isLoading: shopsLoading } = useQuery({
    queryKey: ['shops'],
    queryFn: async () => {
      const res = await axiosProductService.get('/api/top-shops');
      return res.data.shops;
    },
    staleTime: 1000 * 60 * 2,
  });

  console.log('shops:', shops);

  return (
    <div className="bg-white px-4 pb-8">
      {/* Top Shops title */}
      <div className="my-4 block">
        <SectionTitle title="Top Shops" />
      </div>
      {/* Top Shops */}
      {!shopsLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
          {shops.map((shop: any) => (
            <ShopCard key={shop.id} shop={shop} />
          ))}
        </div>
      )}
      {shops?.length === 0 && (
        <p className="text-center">No Shops available yet!</p>
      )}
    </div>
  );
};

export default TopShops;
