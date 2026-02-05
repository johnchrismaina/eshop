import { useQuery } from '@tanstack/react-query';
import axiosProductService from 'apps/user-ui/src/utils/axiosProductService';
import React from 'react';
import SectionTitle from '../section/section-title';
import ProductCard from '../cards/product-card';

const Offers = () => {
  // Fetch Offers from the API and display them
  const { data: offers, isLoading: offersLoading } = useQuery({
    queryKey: ['offers'],
    queryFn: async () => {
      const res = await axiosProductService.get(
        '/api/get-all-events?page=1&limit=10'
      );
      return res.data.events;
    },
    staleTime: 1000 * 60 * 2,
  });

  return (
    <div className="bg-white px-4 pb-8">
      {/* Top Offers title */}
      <div className="my-4 block">
        <SectionTitle title="Top Offers" />
      </div>
      {/* Top Offers */}
      {!offersLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
          {offers?.map((product: any) => (
            <ProductCard key={product.id} product={product} isEvent={true} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Offers;
