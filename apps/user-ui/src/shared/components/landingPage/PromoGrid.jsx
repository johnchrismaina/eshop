import React from 'react';

const PromoGrid = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-5 pb-0">
      {/* Card 1  */}
      <div className="flex flex-col items-start cursor-pointer ">
        <div className="bg-blue-300 overflow-hidden ">
          <div className="aspect-[16/10]">
            <img
              src="https://ik.imagekit.io/johnchrismaina/Card%20categories/unnamed%20(2).png?updatedAt=1771515836912"
              alt="Computers & Gaming"
              className="object-contain w-full h-full "
            />
          </div>
        </div>
        <div className="pt-3 text-center">
          <h3 className="text-base font-bold tracking-tight">
            Computers & Gaming - 10% OFF
          </h3>
        </div>
      </div>

      {/* Card 2  */}
      <div className="flex flex-col items-start cursor-pointer">
        <div className="bg-slate-300 overflow-hidden ">
          <div className="aspect-[16/10]">
            <img
              src="https://ik.imagekit.io/johnchrismaina/Promo%20Card/homepage-new-brand-img-1.png"
              alt="Smartphones & Accessories"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
        <div className="pt-3 text-center">
          <h3 className="text-base font-bold tracking-tight">
            Smartphones & Accessories - 15% OFF
          </h3>
        </div>
      </div>

      {/* Card 3 */}
      <div className="flex flex-col items-start cursor-pointer">
        <div className="bg-blue-300 overflow-hidden ">
          <div className="aspect-[16/10]">
            <img
              src="https://ik.imagekit.io/johnchrismaina/Promo%20Card/homepage-new-brand-img-2.png"
              alt="Beauty & Personal Care"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
        <div className="pt-3 text-center">
          <h3 className="text-base font-bold tracking-tight">
            Beauty & Personal Care - 30% OFF
          </h3>
        </div>
      </div>

      {/* Card 4 */}
      <div className="flex flex-col items-start cursor-pointer">
        <div className="bg-slate-300 overflow-hidden ">
          <div className="aspect-[16/10]">
            <img
              src="https://ik.imagekit.io/johnchrismaina/Promo%20Card/homepage-new-brand-img-3.png"
              alt="Home & Kitchen"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
        <div className="pt-3 text-center">
          <h3 className="text-base font-bold tracking-tight">
            Home & Kitchen - 20% OFF
          </h3>
        </div>
      </div>
    </div>
  );
};

export default PromoGrid;
