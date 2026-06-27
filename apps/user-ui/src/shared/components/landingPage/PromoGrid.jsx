import React from 'react';

const PromoGrid = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 font-sans gap-6 pt-10 pb-8 bg-white text-gray-800 border-t border-gray-100">
      {/* Card 1  */}
      <div className="flex flex-col items-start rounded-lg">
        {/* Card */}
        <div className="bg-blue-300 overflow-hidden rounded-lg cursor-pointer">
          {/* <div className="aspect-[16/10]"> */}
          <div className="aspect-[3/2]">
            <img
              src="https://ik.imagekit.io/johnchrismaina/Card%20categories/unnamed%20(2).png?updatedAt=1771515836912"
              alt="Computers & Gaming"
              className="object-contain w-full h-full "
            />
          </div>
        </div>
        {/* Description */}
        <div className="pb-3 text-center pt-2">
          <h3 className="text-base font-semibold tracking-tight">
            Computers & Gaming - 10% OFF
          </h3>
        </div>
      </div>

      {/* Card 2  */}
      <div className="flex flex-col items-start rounded-lg">
        {/* Card */}
        <div className="bg-slate-300 overflow-hidden rounded-lg cursor-pointer">
          {/* <div className="aspect-[16/10]"> */}
          <div className="aspect-[3/2]">
            <img
              // src="https://ik.imagekit.io/johnchrismaina/Promo%20Card/homepage-new-brand-img-2.png"
              src="https://ik.imagekit.io/johnchrismaina/Promo%20Grid/unnamed2.jpg"
              alt="Beauty & Personal Care"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
        {/* Description */}
        <div className="pb-3 text-center pt-2">
          <h3 className="text-base font-semibold tracking-tight">
            Beauty & Personal Care - 30% OFF
          </h3>
        </div>
      </div>

      {/* Card 3 */}
      <div className="flex flex-col items-start rounded-lg">
        {/* Card */}
        <div className="bg-slate-300 overflow-hidden rounded-lg cursor-pointer">
          {/* <div className="aspect-[16/10]">
           */}
          <div className="aspect-[3/2]">
            <img
              // src="https://ik.imagekit.io/johnchrismaina/Promo%20Card/homepage-new-brand-img-1.png"
              src="https://ik.imagekit.io/johnchrismaina/Promo%20Grid/unnamed.png"
              alt="Smartphones & Accessories"
              className="object-contain w-full h-full"
            />
          </div>
        </div>
        {/* Description */}
        <div className="pb-3 text-center pt-2">
          <h3 className="text-base font-semibold tracking-tight">
            Smartphones & Accessories
          </h3>
        </div>
      </div>

      {/* Card 4 */}
      <div className="flex flex-col items-start rounded-lg">
        {/* Card */}
        <div className="bg-gray-300 overflow-hidden rounded-lg cursor-pointer">
          {/* <div className="aspect-[16/10]"> */}
          <div className="aspect-[3/2]">
            <img
              // src="https://ik.imagekit.io/johnchrismaina/Promo%20Card/homepage-new-brand-img-3.png"
              src="https://ik.imagekit.io/johnchrismaina/Promo%20Grid/unnamed%20(3).png"
              alt="Home & Kitchen"
              className="object-contain w-full h-full"
            />
          </div>
        </div>
        {/* Description */}
        <div className="pb-3 text-center pt-2">
          <h3 className="text-base font-semibold tracking-tight">
            Home & Kitchen - 20% OFF
          </h3>
        </div>
      </div>
    </div>
  );
};

export default PromoGrid;
