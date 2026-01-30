'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { HeartIcon, Search } from 'lucide-react';
import ProfileIcon from '../../../assets/svgs/profile-icon';
import { BsBag } from 'react-icons/bs';
import HeaderBottom from './header-bottom';
import useUser from 'apps/user-ui/src/hooks/useUser';
import { useStore } from 'apps/user-ui/src/store';
import axiosProductService from 'apps/user-ui/src/utils/axiosProductService';
import Image from 'next/image';
import useLayout from 'apps/user-ui/src/hooks/useLayout';

const Header = () => {
  const { user, isLoading } = useUser();
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
      <div className="w-[80%] py-5 m-auto flex items-center justify-between">
        <div>
          <Link href={'/'}>
            <Image
              src={
                layout?.logo ||
                'https://ik.imagekit.io/johnchrismaina/happy-basket.png?updatedAt=1764842031651'
              }
              alt=""
              width={300}
              height={100}
              className="h-[70px] ml-[-50px] mb-[-30px] object-cover"
            />
            {/* <span className="text-3xl font-semibold ">Eshop</span> */}
          </Link>
        </div>

        {/* Search input */}
        <div className="w-[50%] relative flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for products..."
            className="w-full px-4 font-Poppins font-medium border-1 border-gray-500 outline-none h-[55px] rounded-lg"
          />
          <div
            onClick={handleSearchClick}
            className="w-[60px] cursor-pointer flex items-center justify-center h-[55px] outline-none bg-orange-600 absolute top-0 right-0 rounded-r-lg"
          >
            <Search color="#fff" />
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
        <div className="flex items-center gap-8 ">
          <div className="flex items-center gap-2">
            {!isLoading && user ? (
              <>
                <Link
                  href={'/profile'}
                  className="border-2 w-[50px] h-[50px] flex items-center justify-center rounded-full border-[#010f1c1a]"
                >
                  <ProfileIcon />
                </Link>
                <Link href={'/profile'}>
                  <span className="block font-medium">Hello,</span>
                  <span className="font-semibold">
                    {user?.name?.split(' ')[0]}
                  </span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href={'/login'}
                  className="border-2 w-[50px] h-[50px] flex items-center justify-center rounded-full border-[#010f1c1a]"
                >
                  <ProfileIcon />
                </Link>
                <Link href={'/login'}>
                  <span className="block font-medium">Hello,</span>
                  <span className="font-semibold">
                    {isLoading ? '...' : 'Sign In'}
                  </span>
                </Link>
              </>
            )}
          </div>

          {/* Wishlist & cart */}
          <div className="flex items-center gap-5">
            <Link href={'/wishlist'} className="relative">
              <HeartIcon />
              <div className="w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]">
                <span className="text-white font-medium text-sm">
                  {wishlist?.length}
                </span>
              </div>
            </Link>
            <Link href={'/cart'} className="relative">
              <BsBag color="black" size={25} />
              <div className="w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]">
                <span className="text-white font-medium text-sm">
                  {cart?.length}
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
      <div className="border-b border-b-[#99999938]" />
      <HeaderBottom />
    </div>
  );
};

export default Header;
