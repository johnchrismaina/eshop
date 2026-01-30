'use client';
import useLayout from 'apps/user-ui/src/hooks/useLayout';
import { MoveRight } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react';

const Hero = () => {
  const router = useRouter();
  const { layout } = useLayout();

  return (
    <div className="bg-[#115061] h-[85vh] flex flex-col justify-center w-full">
      <div className="md:w-[80%] w-[90%] m-auto md:flex h-full items-center">
        <div className="md:w-1/2">
          <p className="font-poppins font-normal text-white pb-2 text-xl">
            Starting from $40
          </p>
          <h1 className="text-white text-6xl font-extrabold font-poppins">
            The best watch <br />
            Collection 2025
          </h1>
          <p className="font-poppins text-3xl pt-4 text-white">
            Exclusive offer <span className="text-yellow-400">10% </span>off
            this week
          </p>
          <br />
          <button
            onClick={() => router.push('/products')}
            className="w-[140px] gap-2 font-semibold h-[40px] bg-white hover:bg-[#115061] text-[#115061] hover:text-white flex items-center justify-center border border-transparent hover:border hover:border-solid hover:border-white rounded-sm transition"
          >
            Shop Now <MoveRight />
          </button>
        </div>
        {/* Banner */}
        <div className="md:w-1/2 flex justify-center">
          <Image
            src={
              layout?.banner ||
              'https://ik.imagekit.io/johnchrismaina/products/slider-img-1.webp?updatedAt=1763137176151'
            }
            alt=""
            width={450}
            height={450}
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;
