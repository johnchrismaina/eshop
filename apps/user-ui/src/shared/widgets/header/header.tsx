'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { ChevronDown, Search, Triangle } from 'lucide-react';
// import ProfileIcon from '../../../assets/svgs/profile-icon';
import HeaderBottom from './header-bottom';
import useUser from 'apps/user-ui/src/hooks/useUser';
import { useStore } from 'apps/user-ui/src/store';
import axiosProductService from 'apps/user-ui/src/utils/axiosProductService';
// import Image from 'next/image';
import useLayout from 'apps/user-ui/src/hooks/useLayout';
import CartIcon from 'apps/user-ui/src/assets/svgs/cart-icon';
// import ProfileIcon from 'apps/user-ui/src/assets/svgs/profile-icon';
import Image from 'next/image';

const Header = () => {
  const { user, role, isLoading } = useUser();
  // const wishlist = useStore((state: any) => state.wishlist);
  const cart = useStore((state: any) => state.cart);
  const { layout } = useLayout();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const handleSearchClick = async () => {
    if (!searchQuery.trim()) return;
    setLoadingSuggestions(true);

    try {
      const res = await axiosProductService.get(
        `/product/api/search-products?q=${encodeURIComponent(searchQuery)}`
      );
      setSuggestions(res.data.products.slice(0, 10));
    } catch (err) {
    } finally {
      setLoadingSuggestions(false);
    }
  };

  return (
    <div className="w-full bg-white">
      <div className="w-[80%] pt-4 pb-4 m-auto flex items-center justify-between gap-8">
        {/* logo */}
        <div>
          <Link href={'/'}>
            <Image
              src={
                layout?.logo ||
                'https://ik.imagekit.io/johnchrismaina/Assets/logo.svg'
              }
              alt=""
              // width={300}
              width={150}
              // height={100}
              height={50}
              className="object-cover"
            />
            {/* <span className="text-3xl font-semibold text-[#333] ">sokonis</span> */}
          </Link>
        </div>

        {/* Search input */}
        <div className="w-[70%] relative flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for products"
            className="w-full px-6 font-Poppins font-normal text-sm text-gray-900 tracking-wide border-1 border-[#f3f3f6] bg-[#f3f3f6] h-[50px] rounded-md 
             outline-none focus:outline-none focus:border-[#ebedf0] focus:ring-0 focus:shadow-none"
          />
          <div
            onClick={handleSearchClick}
            // className="w-[35px] h-[35px] cursor-pointer flex items-center justify-center outline-none bg-[#ffc220] absolute right-0 mr-1 rounded-full"
            className="w-[35px] h-[35px] cursor-pointer flex items-center justify-center outline-none absolute right-0 mr-1 rounded-full"
          >
            <Search color="#333" size={18} />
          </div>

          {/* Suggestions dropdown */}
          {suggestions.length > 0 && (
            <div className="absolute w-full top-[60px] bg-white border border-gray-600">
              {suggestions.map((item) => (
                <Link
                  href={`/product/${item.slug}`}
                  key={item.id}
                  onClick={() => {
                    setSuggestions([]);
                    setSearchQuery('');
                  }}
                  className="block px-4 py-2 text-sm hover:bg-blue-500"
                >
                  {item.title}
                </Link>
              ))}
            </div>
          )}
          {loadingSuggestions && (
            <div className="absolute w-full top-[60px] bg-white border">
              Searching...
            </div>
          )}
        </div>

        {/* Profile icons */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-2 text-gray-600 p-2">
            {!isLoading && role === 'user' ? (
              <>
                <Link
                  href={'/profile'}
                  className="flex items-center justify-center gap-[2px]"
                >
                  <span className="block font-medium text-sm">Hello,</span>
                  <span className="font-medium text-sm">
                    {user?.name?.split(' ')[0]}
                  </span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href={'/login'}
                  className="flex flex-col items-start gap-0.5"
                >
                  <span className="block font-medium text-sm">Log in</span>
                  <span className="flex items-center font-bold text-sm gap-1 -mt-1.5">
                    Account
                    <ChevronDown className="mt-1" size={12} color="#555" />
                  </span>
                </Link>
              </>
            )}
          </div>

          {/* Wishlist & cart */}
          <div className="flex items-center gap-5">
            {/* <Link href={'/wishlist'} className="relative">
              <HeartIcon />
              <div className="w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]">
                <span className="text-white font-medium text-sm">
                  {wishlist?.length}
                </span>
              </div>
            </Link> */}
            <Link href={'/cart'} className="relative ">
              <CartIcon className="bg-[#333]" />
              {/* <ShoppingCart color="#333" strokeWidth={1.5} /> */}
              {cart?.length > 0 && (
                <div className="w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]">
                  <span className="text-white font-medium text-sm">
                    {cart.length}
                  </span>
                </div>
              )}
              {/* <span className="font-medium text-sm">Cart</span> */}
            </Link>
          </div>
        </div>
      </div>
      {/* <div className="border-b border-b-[#99999938]" /> */}
      <HeaderBottom />
    </div>
  );
};

export default Header;
