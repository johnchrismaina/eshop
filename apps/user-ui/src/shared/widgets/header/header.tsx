'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import HeaderBottom from './header-bottom';
import useUser from 'apps/user-ui/src/hooks/useUser';
import { useStore } from 'apps/user-ui/src/store';
import axiosProductService from 'apps/user-ui/src/utils/axiosProductService';
import useLayout from 'apps/user-ui/src/hooks/useLayout';
import CartIcon from 'apps/user-ui/src/assets/svgs/cart-icon';
import Image from 'next/image';

const Header = () => {
  const { user, role, isLoading } = useUser();
  const cart = useStore((state: any) => state.cart);
  const { layout } = useLayout();

  const [open, setOpen] = useState(false);

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
      // handle error silently
    } finally {
      setLoadingSuggestions(false);
    }
  };

  return (
    <>
      {/* Top header - fixed */}
      <div className="fixed top-0 left-0 w-full bg-white z-[100] ">
        <div className="w-[95%] py-1 m-auto flex items-center justify-between gap-6">
          {/* logo */}
          <div>
            <Link href="/">
              <Image
                src={
                  layout?.logo ||
                  'https://ik.imagekit.io/johnchrismaina/Assets/logo.svg'
                }
                alt=""
                width={150}
                height={50}
                className="object-cover"
              />
            </Link>
          </div>

          <div className="flex flex-col items-start shrink-0">
            <span className="text-xs font-normal">Deliver to: </span>
            <span className=" font-bold -mt-1.5">Nairobi, Kenya</span>
          </div>

          {/* Search input */}
          <div className="w-[65%] relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products"
              className="w-full px-6 font-Poppins font-normal text-sm text-gray-900 tracking-wide border-1 border-[#f3f3f6] bg-[#f3f3f6] h-[40px] rounded-md outline-none focus:outline-none focus:border-[#ebedf0] focus:ring-0 focus:shadow-none"
            />
            <div
              onClick={handleSearchClick}
              className="w-[35px] h-[35px] cursor-pointer flex items-center justify-center hover:bg-gray-200 transition outline-none absolute right-0 mr-1 rounded-full"
            >
              <Search color="#333" size={18} />
            </div>

            {/* Suggestions dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute w-full top-[60px] bg-white border border-gray-600 z-[120]">
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
              <div className="absolute w-full top-[60px] bg-white border z-[120]">
                Searching...
              </div>
            )}
          </div>

          {/* Profile icons */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Account */}
            <div
              className="relative flex items-center gap-2 text-gray-600 p-2"
              onMouseEnter={() => setOpen(true)}
              onMouseLeave={() => setOpen(false)}
            >
              {/* Trigger */}
              <Link
                href={role === 'user' ? '/profile' : '/login'}
                className="flex flex-col items-start gap-0.5"
              >
                {!isLoading && role === 'user' ? (
                  <span className="block font-normal text-xs">
                    Hi, {user?.name?.split(' ')[0]}
                  </span>
                ) : (
                  <span className="block font-normal text-xs text-gray-500">
                    Log in
                  </span>
                )}
                <span className="flex items-center font-bold text-sm gap-1 -mt-1.5">
                  Account
                  <ChevronDown className="mt-1" size={12} color="#555" />
                </span>
              </Link>

              {/* Backdrop */}
              {open && (
                <div
                  className="fixed top-[55px] left-0 right-0 bottom-0 bg-black bg-opacity-40 transition-opacity z-[100]"
                  onMouseEnter={() => setOpen(false)} // hover backdrop closes everything
                />
              )}

              {/* Floating Panel */}
              {open && (
                <div className="absolute top-full right-0 mt-0 w-64 rounded-sm border border-gray-200 bg-white shadow-lg z-[110]">
                  <div className="p-6 text-gray-900">
                    <p className="font-semibold">Welcome back!</p>
                    <Link
                      href="/login"
                      className="mt-3 block rounded-md text-gray-800 bg-amber-300 px-4 py-2 text-sm text-center font-medium no-underline hover:underline"
                    >
                      Sign in
                    </Link>
                    <div className="flex items-center mt-3 gap-1">
                      <span className="text-xs">New customer?</span>
                      <Link
                        href="/register"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Start here
                      </Link>
                    </div>
                    <div className="w-full h-[0.5px] bg-gray-300 my-4"></div>
                    <div className="flex flex-col text-[13px] mt-2 gap-2">
                      <Link href="/sign-in" className="hover:underline">
                        Account
                      </Link>
                      <Link href="/sign-in" className="hover:underline">
                        Orders
                      </Link>
                      <Link href="/sign-in" className="hover:underline">
                        Recommendations
                      </Link>
                      <Link href="/sign-in" className="hover:underline">
                        Watchlist
                      </Link>
                      <Link
                        href={`${process.env.NEXT_PUBLIC_SELLER_SERVER_URI}/signup`}
                        className="hover:underline"
                      >
                        Start a Selling Account
                      </Link>
                      <Link href="/sign-in" className="hover:underline">
                        Customer Service
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Cart */}
            <div className="flex items-center gap-5">
              <Link href="/cart" className="relative">
                <CartIcon className="bg-[#333]" />
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
      </div>
      {/* Bottom header - scrolls normally, with top padding to account for fixed header */}
      <div className="pt-[58px]">
        <HeaderBottom />
      </div>
    </>
  );
};

export default Header;
