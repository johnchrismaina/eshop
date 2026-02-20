import React from 'react';

const PromoGrid = () => {
  return (
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-10">
      {/* Card 1  */}
      <div class="bg-blue-300 rounded-lg overflow-hidden">
        <div class="h-[250px]">
          <img
            src="https://ik.imagekit.io/johnchrismaina/Card%20categories/unnamed%20(2).png?updatedAt=1771515836912"
            alt="Pharmacy"
            class="object-contain w-full h-full"
          />
        </div>
        {/* <div class="p-4 text-center">
          <h3 class="text-lg font-semibold">Pharmacy at your doorstep!</h3>
          <p class="text-gray-600 text-sm mt-2">
            Cough syrups, pain relief sprays & more
          </p>
          <button class="mt-4 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded">
            Order Now
          </button>
        </div> */}
      </div>

      {/* Card 2  */}
      <div class="bg-slate-300 rounded-lg overflow-hidden">
        <div class="h-[250px]">
          <img
            src="https://ik.imagekit.io/johnchrismaina/Card%20categories/unnamed.png?updatedAt=1771515836923"
            alt="Pet Care"
            class="object-contain w-full h-full"
          />
        </div>
        {/* <div class="p-4 text-center">
          <h3 class="text-lg font-semibold">Pet care supplies at your door</h3>
          <p class="text-gray-600 text-sm mt-2">Food, treats, toys & more</p>
          <button class="mt-4 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded">
            Order Now
          </button>
        </div> */}
      </div>

      {/* Card 3 */}
      <div class="bg-blue-300 rounded-lg overflow-hidden">
        <div class="h-[250px]">
          <img
            src="https://ik.imagekit.io/johnchrismaina/Card%20categories/unnamed%20(2).png?updatedAt=1771515836912"
            alt="Baby Care"
            class="object-contain w-full h-full"
          />
        </div>
        {/* <div class="p-4 text-center">
          <h3 class="text-lg font-semibold">No time for a diaper run?</h3>
          <p class="text-gray-600 text-sm mt-2">Get baby care essentials</p>
          <button class="mt-4 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded">
            Order Now
          </button>
        </div> */}
      </div>

      {/* Card 4 */}
      <div class="bg-slate-300 rounded-lg overflow-hidden">
        <div class="h-[250px]">
          <img
            src="https://ik.imagekit.io/johnchrismaina/Card%20categories/unnamed.png?updatedAt=1771515836923"
            alt="Extra Category"
            class="object-contain w-full h-full"
          />
        </div>
        {/* <div class="p-4 text-center">
          <h3 class="text-lg font-semibold">Fourth Column</h3>
          <p class="text-gray-600 text-sm mt-2">Optional extra promo</p>
          <button class="mt-4 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded">
            Order Now
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default PromoGrid;
