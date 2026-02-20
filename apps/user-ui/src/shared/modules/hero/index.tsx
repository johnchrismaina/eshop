'use client';
import useLayout from 'apps/user-ui/src/hooks/useLayout';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react';

const Hero = () => {
  const router = useRouter();
  const { layout } = useLayout();

  return (
    <div className="relative w-full m-auto h-[40vh] z-0 overflow-visible ">
      <Image
        src={
          layout?.banner ||
          'https://ik.imagekit.io/johnchrismaina/Images%20and%20Banners/61uMN8JVocL._SX3000_.jpg'
        }
        alt="Banner"
        onClick={() => router.push('/products')}
        fill
        unoptimized
        className="object-top object-cover cursor-pointer"
      />
    </div>
  );
};

export default Hero;
