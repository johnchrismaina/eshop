'use client';

import useUser from 'apps/user-ui/src/hooks/useUser';
import Hero from '../../modules/hero';
import Products from './products';
import LatestProducts from './latest-products';
import TopShops from './top-shops';
import Offers from './offers';
import CategoriesGrid from './CategoriesGrid';
import Footer from '../footer/Footer';

export default function LandingPage() {
  const { role } = useUser();

  return (
    <div className="bg-[#f5f5f5] min-h-screen">
      <Hero />
      <div className="w-full my-0 px-5 m-auto flex flex-col gap-4 rounded-lg">
        <CategoriesGrid />
        <Products />
        <LatestProducts />
        <TopShops />
        <Offers />

        {role === 'user' && (
          <p className="text-center mt-4">
            Welcome back! Personalized content coming soon.
          </p>
        )}
      </div>
      <Footer />
    </div>
  );
}
