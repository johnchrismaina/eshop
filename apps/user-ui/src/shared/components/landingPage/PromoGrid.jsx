import React from 'react';

const PromoGrid = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-8">
      {/* Card 1  */}
      <div className="flex flex-col items-start cursor-pointer">
        <div className="bg-blue-300 rounded-lg overflow-hidden">
          <div className="aspect-[16/10]">
            <img
              src="https://ik.imagekit.io/johnchrismaina/Card%20categories/unnamed%20(2).png?updatedAt=1771515836912"
              alt="Computers & Gaming"
              className="object-contain w-full h-full"
            />
          </div>
        </div>
        <div className="pt-3 text-center">
          <h3 className="text-base font-bold tracking-tight">
            Computers & Gaming - 10% OFF
          </h3>
          {/* <p className="text-gray-600 text-sm mt-2">
            Cough syrups, pain relief sprays & more
          </p>
          <button className="mt-4 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded">
            Order Now
          </button> */}
        </div>
      </div>

      {/* Card 2  */}
      <div className="flex flex-col items-start cursor-pointer">
        <div className="bg-slate-300 rounded-lg overflow-hidden">
          <div className="aspect-[16/10]">
            <img
              src="https://ik.imagekit.io/johnchrismaina/Card%20categories/unnamed.png?updatedAt=1771515836923"
              alt="Smartphones & Accessories"
              className="object-contain w-full h-full"
            />
          </div>
        </div>
        <div className="pt-3 text-center">
          <h3 className="text-base font-bold tracking-tight">
            Smartphones & Accessories - 15% OFF
          </h3>
          {/* <p className="text-gray-600 text-sm mt-2">Food, treats, toys & more</p>
          <button className="mt-4 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded">
            Order Now
          </button> */}
        </div>
      </div>

      {/* Card 3 */}
      <div className="flex flex-col items-start cursor-pointer">
        <div className="bg-blue-300 rounded-lg overflow-hidden">
          <div className="aspect-[16/10]">
            <img
              src="https://ik.imagekit.io/johnchrismaina/Card%20categories/unnamed%20(2).png?updatedAt=1771515836912"
              alt="Beauty & Personal Care"
              className="object-contain w-full h-full"
            />
          </div>
        </div>
        <div className="pt-3 text-center">
          <h3 className="text-base font-bold tracking-tight">
            Beauty & Personal Care - 30% OFF
          </h3>
          {/* <p className="text-gray-600 text-sm mt-2">Get baby care essentials</p>
          <button className="mt-4 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded">
            Order Now
          </button> */}
        </div>
      </div>

      {/* Card 4 */}
      <div className="flex flex-col items-start cursor-pointer">
        <div className="bg-slate-300 rounded-lg overflow-hidden">
          <div className="aspect-[16/10]">
            <img
              src="https://ik.imagekit.io/johnchrismaina/Card%20categories/unnamed.png?updatedAt=1771515836923"
              alt="Home & Kitchen"
              className="object-contain w-full h-full"
            />
          </div>
        </div>
        <div className="pt-3 text-center">
          <h3 className="text-base font-bold tracking-tight">
            Home & Kitchen - 20% OFF
          </h3>
          {/* <p className="text-gray-600 text-sm mt-2">Optional extra promo</p>
          <button className="mt-4 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded">
            Order Now
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default PromoGrid;
