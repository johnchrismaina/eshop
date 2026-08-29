'use client';

import useUser from 'apps/user-ui/src/hooks/useUser';
import Hero from '../../modules/hero';
import Deals from './deals';
import PromoGrid from './PromoGrid';
import Products from './products';
// import TopShops from './top-shops';
import Footer from '../footer/Footer';
import BestSellers from './BestSellers';

export default function LandingPage() {
  const { role } = useUser();

  return (
    <div className="bg-[#fff] min-h-screen ">
      <div className="px-10 pt-4 bg-[#fff]">
        <Hero />
      </div>
      <div className="w-full px-0 pb-5 m-auto flex flex-col bg-transparent">
        <PromoGrid />
        <Deals />
        <BestSellers />
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
