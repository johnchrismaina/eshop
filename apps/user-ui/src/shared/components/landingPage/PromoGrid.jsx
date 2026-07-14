import React from 'react';

const PromoGrid = () => {
  return (
    <>
      {/* <div className="px-10 pt-8 bg-[#fff]">
        <span className="font-semibold text-gray-800 text-xl">
          Happening Now
        </span>
      </div> */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 font-sans gap-4 px-10 pt-12 pb-8 bg-[#f4f4f4] text-gray-800 ">
        {/* Card 1  */}
        <div className="flex flex-col items-center justify-start bg-[#fff] p-5 rounded-none">
          {/* Title zone */}
          <div className="w-full px-4 pt-2 pb-6 ">
            <h3 className="text-lg font-bold text-[#1d1d1f]">Back to School</h3>
            <span className="text-sm">Bags, stationery & more</span>
          </div>

          <div className="bg-blue-50 h-[300px] overflow-hidden rounded-none cursor-pointer flex flex-col ">
            {/* Image zone anchored at bottom */}
            <div className="flex-grow flex items-end">
              <div className="aspect-square w-full0 h-full">
                <img
                  src="https://ik.imagekit.io/johnchrismaina/Card%20categories/unnamed%20(2).png?updatedAt=1771515836912"
                  alt="Computers & Gaming"
                  className="object-contain w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2  */}
        <div className="flex flex-col items-center justify-start bg-[#fff] p-5 rounded-none">
          {/* Title zone */}
          <div className="w-full px-4 pt-2 pb-6">
            <h3 className="text-lg font-bold text-[#1d1d1f]">Gaming Week</h3>
            <span className="text-sm">Consoles & accessories</span>
          </div>

          <div className="bg-slate-100 h-[300px] overflow-hidden rounded-none cursor-pointer flex flex-col ">
            {/* Image zone anchored at bottom */}
            <div className="flex-grow flex items-end">
              <div className="aspect-square w-full h-full">
                <img
                  src="https://ik.imagekit.io/johnchrismaina/Promo%20Grid/unnamed2.jpg"
                  alt="Beauty & Personal Care"
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="flex flex-col items-center justify-start bg-[#fff] p-5 rounded-none">
          {/* Title zone */}
          <div className=" w-full px-6 pt-2 pb-6 ">
            <h3 className="text-lg font-bold text-[#1d1d1f]">Fresh Fridays</h3>
            <span className="text-sm">Groceries restocked weekly</span>{' '}
          </div>

          <div className="bg-slate-200 h-[300px] overflow-hidden rounded-none cursor-pointer flex flex-col ">
            {/* Image zone anchored at bottom */}
            <div className="flex-grow flex items-end">
              <div className="aspect-square w-full h-full">
                <img
                  src="https://ik.imagekit.io/johnchrismaina/Promo%20Grid/unnamed.png"
                  alt="Smartphones "
                  className="object-contain w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="flex flex-col items-center justify-start bg-[#fff] p-5 rounded-none">
          {/* Title zone */}
          <div className="w-full px-0 pt-2 pb-6">
            <h3 className="text-lg font-bold text-[#1d1d1f]">Home Refresh</h3>
            <span className="text-sm">20% off selected decor</span>
          </div>

          <div className="bg-gray-200 h-[300px] overflow-hidden rounded-none cursor-pointer flex flex-col ">
            {/* Image zone anchored at bottom */}
            <div className="flex-grow flex items-end">
              <div className="aspect-square w-full h-full">
                <img
                  src="https://ik.imagekit.io/johnchrismaina/Promo%20Grid/unnamed%20(3).png"
                  alt="Home & Kitchen"
                  className="object-contain w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PromoGrid;
