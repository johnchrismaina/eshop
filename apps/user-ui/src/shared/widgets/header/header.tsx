'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { HeartIcon, Search } from 'lucide-react';
// import ProfileIcon from '../../../assets/svgs/profile-icon';
// import { BsBag } from 'react-icons/bs';
import HeaderBottom from './header-bottom';
import useUser from 'apps/user-ui/src/hooks/useUser';
import { useStore } from 'apps/user-ui/src/store';
import axiosProductService from 'apps/user-ui/src/utils/axiosProductService';
// import Image from 'next/image';
import useLayout from 'apps/user-ui/src/hooks/useLayout';
import CartIcon from 'apps/user-ui/src/assets/svgs/cart-icon';

const Header = () => {
  const { user, role, isLoading } = useUser();
  const wishlist = useStore((state: any) => state.wishlist);
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
      <div className="w-[95%] py-4 m-auto flex items-center justify-between">
        {/* logo */}
        <div>
          <Link href={'/'}>
            {/* <Image
              src={
                layout?.logo ||
                'https://ik.imagekit.io/johnchrismaina/Assets/sokonis-logo1.png'
              }
              alt=""
              width={300}
              height={100}
              className="object-cover"
            /> */}
            <span className="text-3xl font-bold ">Sokonis</span>
          </Link>
        </div>

        {/* Search input */}
        <div className="w-[60%] relative flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for products"
            className="w-full px-6 font-Poppins font-semibold text-sm text-gray-900 tracking-wide border-1 border-gray-300 bg-[#f5f5f5] h-[45px] rounded-full 
             outline-none focus:outline-none focus:bg-[#ebedf0] focus:border-[#ebedf0] focus:ring-0 focus:shadow-none"
          />
          <div
            onClick={handleSearchClick}
            className="w-[45px] h-[45px] cursor-pointer flex items-center justify-center outline-none bg-orange-300 absolute top-0 right-0 rounded-full"
          >
            <Search color="#474747" />
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
        <div className="flex items-center gap-6 ">
          <div className="flex items-center gap-2 text-gray-800">
            {!isLoading && role === 'user' ? (
              <>
                <Link
                  href={'/profile'}
                  className="flex items-center gap-x-[2px]"
                >
                  <span className="block font-medium text-md">Hello,</span>
                  <span className="font-medium text-md">
                    {/* {user?.name?.split(' ')[0]} */}{' '}
                    {user?.name?.split(' ')[0]}
                  </span>
                </Link>
              </>
            ) : (
              <>
                <Link href={'/login'} className="flex items-center gap-x-[2px]">
                  <span className="block font-medium text-md">Hello,</span>
                  <span className="font-medium text-md">
                    {' '}
                    {isLoading ? '...' : 'sign in'}
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
            <Link href={'/cart'} className="relative">
              <CartIcon />
              {cart?.length > 0 && (
                <div className="w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]">
                  <span className="text-white font-medium text-sm">
                    {cart.length}
                  </span>
                </div>
              )}
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
