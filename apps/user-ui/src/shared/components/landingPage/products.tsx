import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosProductService from 'apps/user-ui/src/utils/axiosProductService';
import SectionTitle from '../section/section-title';
import ProductCard from '../cards/product-card';

const Products = () => {
  // Fetch products from the API and display them
  const {
    data: products,
    isLoading,
    isError,
    // error,
  } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await axiosProductService.get(
        '/api/get-all-products?page=1&limit=10'
      );
      return res.data.products;
    },
    staleTime: 1000 * 60 * 2,
  });

  return (
    <div className="bg-white px-4 pb-8">
      {/* Suggested Products title */}
      <div className="my-4">
        <SectionTitle title="Suggested Products" />
      </div>

      {/* Suggested Products Loader */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-[250px] bg-gray-300 animate-pulse rounded-xl"
            />
          ))}
        </div>
      )}
      {/* Suggested Products */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
      {products?.length === 0 && (
        <p className="text-center">No Products available yet!</p>
      )}
    </div>
  );
};

export default Products;
