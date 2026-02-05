'use client';

import useUser from 'apps/user-ui/src/hooks/useUser';
import Products from './products';
import LatestProducts from './latest-products';
import TopShops from './top-shops';
import Offers from './offers';
import Hero from '../../modules/hero';

export default function LandingPage() {
  const { role } = useUser();

  return (
    <div className="bg-[#f5f5f5] min-h-screen">
      <Hero />
      <div className="md:w-[80%] w-[90%] my-10 m-auto flex flex-col gap-6">
        {/* Suggested Products */}
        <Products />
        <LatestProducts />
        <TopShops />
        <Offers />

        {/* Enrich only after role updates */}
        {/* {role === 'user' && <UserRecommendations />} */}
        {/* {role === 'user' && <UserRecommendations userId={user?.id} />} */}

        {/* Future enrichment */}
        {role === 'user' && (
          <p className="text-center mt-4">
            Welcome back! Personalized content coming soon.
          </p>
        )}
      </div>
    </div>
  );
}
