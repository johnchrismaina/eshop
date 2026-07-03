import Link from 'next/link';
import React, { useEffect, useState } from 'react';
// import ProductDetailsCard from './product-details.card';
// import { useStore } from 'apps/user-ui/src/store';
// import useUser from 'apps/user-ui/src/hooks/useUser';
// import useLocationTracking from 'apps/user-ui/src/hooks/useLocationTracking';
// import useDeviceTracking from 'apps/user-ui/src/hooks/useDeviceTracking';
// import ProductDetailsCard from 'apps/user-ui/src/shared/components/cards/product-details.card';
import Ratings from '../ratings';
// import ProductDetails from '../ProductDetails';

const ProductCard = ({
  product,
  isDeal,
}: {
  product: any;
  isDeal?: boolean;
}) => {
  const [timeLeft, setTimeLeft] = useState('');
  // const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isDeal && product?.ending_date) {
      const interval = setInterval(() => {
        const endTime = new Date(product.ending_date).getTime();
        const now = Date.now();
        const diff = endTime - now;

        if (diff <= 0) {
          setTimeLeft('Expired');
          clearInterval(interval);
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        setTimeLeft(`${days}d ${hours}h ${minutes}m left with this price`);
      }, 60000);
      return () => clearInterval(interval);
    }
    return;
  }, [isDeal, product?.ending_date]);

  const capitalizeWords = (str: string) => {
    if (!str) return '';
    return str
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="w-full h-max bg-white rounded-lg relative min-w-0 cursor-pointer py-2 ">
      {isDeal && (
        <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-semibold px-2 py-1 rounded-sm shadow-md">
          OFFER
        </div>
      )}

      <Link
        href={`/product/${product?.slug}`}
        className="block relative max-w-[270px] h-[200px] overflow-hidden bg-white "
      >
        <img
          src={
            product?.images[0]?.url ||
            'https://ik.imagekit.io/johnchrismaina/products/slider-img-1.webp?updatedAt=1763137176151'
          }
          alt={product?.title || 'product'}
          className="w-full h-full object-contain"
          style={{ display: 'block' }}
        />
      </Link>

      {/* discount percentage badge */}
      {/* <div className="mt-2">
        {product?.regular_price && product?.sale_price && (
          <span className=" bg-[#ffece9] text-rose-600 text-xs font-semibold px-2 py-[6px] rounded-md ">
            {Math.round(
              ((product.regular_price - product.sale_price) /
                product.regular_price) *
                100
            )}
            % off
          </span>
        )}
      </div> */}

      {/* product price */}
      <div className="mt-2 flex items-center gap-2">
        <div className="flex items-center gap-1">
          <span className="text-sm font-bold text-gray-900">KSh</span>
          <span className="text-xl font-bold text-gray-900 tracking-tight">
            {product?.sale_price}
          </span>
        </div>
        <span className="text-xs font-normal line-through text-gray-500">
          KSh {product?.regular_price}
        </span>
      </div>

      {/* product title */}
      <Link href={`/product/${product?.slug}`}>
        <h3 className="text-[15px] tracking-tight font-normal !text-gray-900">
          {capitalizeWords(product?.title)}
        </h3>
      </Link>

      {/* product ratings */}
      <div className="mt-1 hidden">
        <Ratings rating={product?.ratings ?? 4} />
      </div>

      {isDeal && timeLeft && (
        <div className="mt-2">
          <span className="inline-block text-sm bg-orange-100 text-orange-700">
            {timeLeft}
          </span>
        </div>
      )}

      {/* {open && <ProductDetailsCard data={product} setOpen={setOpen} />} */}
      {/* {open && <ProductDetails productDetails={product} setOpen={setOpen} />} */}
    </div>
  );
};

export default ProductCard;
