'use client';
import React from 'react';
import Hero from '../shared/modules/hero';
import SectionTitle from '../shared/components/section/section-title';
import { useQuery } from '@tanstack/react-query';
// import axiosInstance from '../utils/axiosInstance';
import ProductCard from '../shared/components/cards/product-card';
import axiosProductService from '../utils/axiosProductService';

const Page = () => {
  const {
    data: products,
    isLoading,
    isError,
    error,
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

  // const { data: latestProducts } = useQuery({
  //   queryKey: ['latest-products'],
  //   queryFn: async () => {
  //     const res = await axiosProductService.get(
  //       '/api/get-all-products?page=1&limit=10&type=latest'
  //     );
  //     return res.data.products;
  //   },
  //   staleTime: 1000 * 60 * 2,
  // });

  return (
    <div className="bg-[#f5f5f5]">
      <Hero />
      <div className="md:w-[80%] w-[90%] my-10 m-auto">
        <div className="mb-8">
          <SectionTitle title="Suggested Products" />
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="h-[250px] bg-gray-300 animate-pulse rounded-xl"
              />
            ))}
          </div>
        )}

        {!isLoading && !isError && (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {products && products.length > 0 ? (
              products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-gray-500">No products available</p>
              </div>
            )}
          </div>
        )}

        {!isLoading && isError && (
          <div className="text-center text-red-500 py-10">
            <p>Error loading products: {error?.message || 'Unknown error'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
