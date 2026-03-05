'use client';

import useUser from 'apps/user-ui/src/hooks/useUser';
import Hero from '../../modules/hero';
import Products from './products';
import LatestProducts from './latest-products';
// import TopShops from './top-shops';
import Offers from './offers';
import Footer from '../footer/Footer';
import PromoGrid from './PromoGrid';

export default function LandingPage() {
  const { role } = useUser();

  return (
    <div className="bg-white min-h-screen">
      <Hero />
      <div className="w-full my-0 px-6 m-auto flex flex-col gap-6 ">
        <PromoGrid />
        <Offers />
        <LatestProducts />
        <Products />
        {/* <TopShops /> */}

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
