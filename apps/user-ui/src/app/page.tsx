'use client';
import React, { useEffect } from 'react';
import Hero from '../shared/modules/hero';
import SectionTitle from '../shared/components/section/section-title';
import { useQuery } from '@tanstack/react-query';
// import axiosInstance from '../utils/axiosInstance';
import ProductCard from '../shared/components/cards/product-card';
import axiosProductService from '../utils/axiosProductService';
import ShopCard from '../shared/components/cards/shop.card';

const Page = () => {
  // Fetch products from the API and display them
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

  // Fetch top shops from the API and display them
  const { data: shops, isLoading: shopsLoading } = useQuery({
    queryKey: ['shops'],
    queryFn: async () => {
      const res = await axiosProductService.get('/api/top-shops');
      return res.data.shops;
    },
    staleTime: 1000 * 60 * 2,
  });

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

  // useEffect(() => {
  //   if (shops) {
  //     console.log('shops', shops);
  //   }
  // }, [shops]);

  return (
    <div className="bg-[#f5f5f5] min-h-screen">
      <Hero />
      <div className="md:w-[80%] w-[90%] my-10 m-auto flex flex-col gap-6">
        {/* Suggested Products */}
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

        {/* Latest Products */}
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

        {/* Top Shops */}
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

        {/* Top Shops */}
        <div className="bg-white px-4 pb-8">
          {/* Top Offers title */}
          <div className="my-4 block">
            <SectionTitle title="Top Offers" />
          </div>
          {/* Top Offers */}
          {!offersLoading && !isError && (
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
              {offers?.map((product: any) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isEvent={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
