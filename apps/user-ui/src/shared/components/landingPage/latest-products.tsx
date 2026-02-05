import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosProductService from 'apps/user-ui/src/utils/axiosProductService';
import SectionTitle from '../section/section-title';
import ProductCard from '../cards/product-card';

const LatestProducts = () => {
  // Fetch latest products from the API and display them
  const { data: latestProducts, isLoading: latestProductsLoading } = useQuery({
    queryKey: ['latest-products'],
    queryFn: async () => {
      const res = await axiosProductService.get(
        '/api/get-all-products?page=1&limit=10&type=latest'
      );
      return res.data.products;
    },
    staleTime: 1000 * 60 * 2,
  });

  return (
    <div className="bg-white px-4 pb-8">
      {/* Latest Products title */}
      <div className="my-4 block">
        <SectionTitle title="Latest Products" />
      </div>
      {/* Latest Products */}
      {!latestProductsLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
          {latestProducts?.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
      {latestProducts?.length === 0 && (
        <p className="text-center">No Products available yet!</p>
      )}
    </div>
  );
};

export default LatestProducts;
