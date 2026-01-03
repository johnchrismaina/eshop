import { ArrowRight, MapPin, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

interface ShopCardProps {
  shop: {
    id: string;
    name: string;
    description?: string;
    avatar: string;
    coverBanner?: string;
    address?: string;
    followers?: [];
    rating?: number;
    category?: string;
  };
}

const ShopCard: React.FC<ShopCardProps> = ({ shop }) => {
  return (
    <div className="w-full rounded-md cursor-pointer bg-white border border-gray-200 shadow-sm overflow-hidden transition">
      {/* Cover Banner */}
      <div className="h-[120px] w-full relative">
        <Image
          src={
            shop?.coverBanner ??
            'https://ik.imagekit.io/johnchrismaina/fashion-banner.png'
          }
          alt={shop?.name ?? 'Shop banner'}
          fill
          className="w-full h-full object-cover"
        />
      </div>

      {/* Avatar */}
      <div className="relative flex justify-center -mt-8">
        <div className="w-16 h-16 rounded-full border-4 border-gray-200 overflow-hidden shadow bg-white">
          <Image
            src={
              shop?.avatar ||
              'https://ik.imagekit.io/johnchrismaina/3d-portrait-businessman-min.jpg'
            }
            alt={shop.name}
            width={64}
            height={64}
            className="w-full h-full object-cover"
            // className="object-cover"
          />
        </div>
      </div>

      {/* Shop Information */}
      <div className="px-4 pb-4 pt-2 text-center">
        <h3 className="text-base font-semibold text-center text-gray-800">
          {shop?.name}
        </h3>
        {/* Followers */}
        <p className="text-xs text-gray-500 mt-0.5">
          {shop?.followers?.length ?? 0} Followers
        </p>
        {/* Address * Rating */}
        <div className="flex items-center justify-center text-xs text-gray-500 mt-2 gap-4 flex-wrap">
          {shop.address && (
            <span className="flex items-center gap-1 max-w-[120px]">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="truncate">{shop.address}</span>
            </span>
          )}

          {/* Shop rating */}
          <span className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            {shop.rating ?? 'N/A'}
          </span>
        </div>

        {/* Shop Category */}
        {shop?.category && (
          <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs">
            <span className="bg-blue-50 capitalize text-blue-600 px-2 py-1 rounded-full font-medium">
              {shop.category}
            </span>
          </div>
        )}

        {/* Visit Button */}
        <div className="mt-4">
          <Link
            href={`/shops/${shop.id}`}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline transition"
          >
            Visit Shop
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ShopCard;
