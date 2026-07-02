'use client';

import Link from 'next/link';
import React, { useState, useLayoutEffect } from 'react';
import {
  ChevronDown,
  ChevronDownIcon,
  MapPin,
  Search,
  ShoppingCart,
  // ShoppingCart,
} from 'lucide-react';
import HeaderBottom from './header-bottom';
// import useUser from 'apps/user-ui/src/hooks/useUser';
import { useStore } from 'apps/user-ui/src/store';
import axiosProductService from 'apps/user-ui/src/utils/axiosProductService';
import useLayout from 'apps/user-ui/src/hooks/useLayout';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
  useAuthStore,
  hadPreviousSession,
} from 'apps/user-ui/src/store/authStore';
import axiosInstance from 'apps/user-ui/src/utils/axiosInstance';
import CartFilledIcon from 'apps/user-ui/src/assets/svgs/cart-filled';
import PinFilledIcon from 'apps/user-ui/src/assets/svgs/pin-filled';

const Header = () => {
  // const { user, isLoading } = useUser();
  const cart = useStore((state: any) => state.cart);
  const { layout } = useLayout();

  //Image and layout used by logo

  const router = useRouter();
  const queryClient = useQueryClient();
  const { logout, user, hydrated } = useAuthStore();

  const [open, setOpen] = useState(false);
  const [openSearchBackdrop, setOpenSearchBackdrop] = useState(false);

  // Track if we've mounted and what the initial session state was
  const [mounted, setMounted] = useState(false);
  const [hadSession, setHadSession] = useState(false);

  // useLayoutEffect runs synchronously before paint on client
  useLayoutEffect(() => {
    setHadSession(hadPreviousSession());
    setMounted(true);
  }, []);

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

  const logOutHandler = async () => {
    try {
      await axiosInstance.post('/api/logout-user');
      logout();
      queryClient.invalidateQueries({ queryKey: ['user'] });
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const capitalizeWords = (str: string) => {
    if (!str) return '';
    return str
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <>
      {/* Top header - fixed */}
      <div className="fixed top-0 left-0 w-full bg-white z-[100] ">
        <div className="w-[95%] h-[56px] m-auto flex items-center justify-between gap-6 ">
          {/* logo */}
          <div>
            <Link href="/">
              {/* <span className="font-semibold text-3xl tracking-tight">
                Sokonis
              </span> */}
              <Image
                src={
                  layout?.logo ||
                  'https://ik.imagekit.io/johnchrismaina/Assets/sokonis_logo1.svg?updatedAt=1782386876690'
                }
                alt="logo"
                width={120}
                height={50}
                className="object-contain"
                unoptimized
              />
            </Link>
          </div>

          {/* Search Bar */}
          <div className="w-[70%] relative flex items-center">
            {/* Search All dropdown */}
            {/* <div className="h-[40px] pl-4 pr-3 cursor-pointer flex items-center justify-center absolute border-r border-gray-200 hover:bg-gray-200 transition left-0 rounded-l-md "> */}
            <div className="h-[40px] pl-4 pr-3 cursor-pointer flex items-center justify-center absolute hover:bg-gray-200 transition left-0 rounded-l-md ">
              <span className="text-sm text-[#333]">All</span>
              <ChevronDownIcon color="#333" size={18} className="pl-[6px]" />
            </div>

            {/* Search input */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={() => setOpenSearchBackdrop(true)}
              placeholder="Search for anything"
              className="w-full pl-[75px] pr-10 py-1 font-Poppins font-normal text-sm tracking-normal text-gray-600 border-r border-gray-200 bg-gray-100 h-[40px] rounded-md outline-none focus:outline-none focus:border-[#ebedf0] focus:ring-0 focus:shadow-none"
            />
            {/* bg-[#f3f3f6] */}
            {/* border-[#ebedf0]  */}
            {/* Search Backdrop */}
            {openSearchBackdrop && (
              <div
                className="fixed top-[56px] left-0 right-0 bottom-0 bg-black bg-opacity-40 transition-opacity z-[100]"
                onClick={() => setOpenSearchBackdrop(false)} // click backdrop closes everything
              />
            )}

            {/* Search icon */}
            <div
              onClick={handleSearchClick}
              className="w-[40px] h-[40px] cursor-pointer flex items-center justify-center bg-orange-300 hover:bg-orange-400 border-r border-orange-300 transition outline-none absolute right-0 rounded-r-md"
            >
              <Search color="#333" size={20} />
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
          {/* Account */}
          <div className="flex items-center gap-2 shrink-0 h-full ">
            {/* Trigger */}
            <div
              className="relative flex items-center gap-2 text-gray-600 px-2 h-full "
              onMouseEnter={() => setOpen(true)}
              onMouseLeave={() => setOpen(false)}
            >
              <Link
                href={user?.name ? '/profile' : '/login'}
                className="flex flex-col items-start gap-0.5 "
              >
                {/* <span className="block text-xs h-[16px]"> */}
                <span className="block text-xs ">
                  {!mounted ? (
                    // SSR + first client render: invisible placeholder to prevent hydration mismatch
                    <span className="font-normal text-gray-500 ">Sign in</span>
                  ) : hadSession && !hydrated ? (
                    // Had previous session, still hydrating: show skeleton
                    <span className="block w-12 h-3 bg-gray-300 rounded animate-pulse"></span>
                  ) : user?.name ? (
                    // Hydrated with user: show username
                    <span className="font-medium">
                      {`Hi, ${capitalizeWords(user.name.split(' ')[0])}`}
                    </span>
                  ) : (
                    // No user or no previous session: show Log in
                    <span className="font-normal text-gray-500">Sign in</span>
                  )}
                </span>

                <span className="flex items-center font-semibold text-gray-900 text-sm tracking-tight gap-1 -mt-1.5">
                  Account
                  <ChevronDown className="mt-1" size={12} color="#555" />
                </span>
              </Link>

              {/* Backdrop */}
              {open && (
                <div
                  className="fixed top-[56px] left-0 right-0 bottom-0 bg-black/40 transition-opacity z-[100]"
                  onMouseEnter={() => setOpen(false)} // hover backdrop closes everything
                />
              )}

              {/* Floating Panel */}
              {open && (
                <div className="absolute top-full right-0 mt-[0px] w-64 bg-white z-[110] rounded-br-lg rounded-bl-lg">
                  <div className="p-6 ">
                    {user?.name ? (
                      <div className="flex flex-col items-start rounded-md bg-gray-100 px-6 py-2">
                        <span className="block font-semibold text-base">
                          {/* {user?.name?.split(' ')[0]} */}
                          {/* {capitalizeWords(user?.name?.split(' ')[0])} */}
                          {capitalizeWords(user?.name)}
                        </span>
                        <span className="block font-normal text-sm text-gray-600 mb-1 ">
                          {user?.email?.split(' ')[0]}
                        </span>
                        <Link
                          href="#"
                          className=" text-blue-800 text-sm font-medium no-underline hover:underline"
                          onClick={() => {
                            logOutHandler();
                            setOpen(false);
                          }}
                        >
                          Sign Out
                        </Link>
                      </div>
                    ) : (
                      <div className="flex flex-col items-start ">
                        <Link
                          href="/login"
                          className="block w-full rounded-md text-gray-800 bg-amber-300 px-4 py-2 text-sm text-center font-medium no-underline hover:underline"
                          onClick={() => setOpen(false)}
                        >
                          Sign in
                        </Link>
                        <div className="flex items-center mt-3 gap-1 text-gray-800">
                          <span className="text-sm">New customer?</span>
                          <Link
                            href="/register"
                            className="text-sm text-blue-600 hover:underline"
                            onClick={() => setOpen(false)}
                          >
                            Sign up
                          </Link>
                        </div>
                      </div>
                    )}

                    <div className="w-full h-[0.5px] bg-gray-300 my-4"></div>

                    <div className="flex flex-col text-[13px] text-gray-800 font-medium mt-0 gap-2">
                      <span className="text-gray-800 text-xl">Account</span>
                      <Link href="/sign-in" className="hover:underline">
                        My Account
                      </Link>
                      <Link href="/sign-in" className="hover:underline">
                        My Orders
                      </Link>
                      <Link href="/sign-in" className="hover:underline">
                        Watchlist
                      </Link>
                      {/* <Link
                        href={`${process.env.NEXT_PUBLIC_SELLER_SERVER_URI}/signup`}
                        className="hover:underline"
                      >
                        Start a Selling Account
                      </Link> */}
                      <Link href="/sign-in" className="hover:underline">
                        Customer Service
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Cart */}
            <div className="flex items-end mt-2 gap-1">
              <Link href="/cart" className="relative ">
                {/* <CartIcon className="bg-[#333] " /> */}
                {/* <ShoppingCart /> */}
                <CartFilledIcon color="#555" />
                {cart?.length > 0 && (
                  <div className="w-5 h-5 border-2 border-white bg-orange-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]">
                    <span className="text-white font-medium text-sm">
                      {cart.length}
                    </span>
                  </div>
                )}
              </Link>
              {/* <span className="font-semibold text-sm text-gray-900">Cart</span> */}
            </div>
          </div>
        </div>
      </div>
      {/* Bottom header - scrolls normally, with top padding to account for fixed header */}
      <div className="pt-[56px]">
        <HeaderBottom />
      </div>
    </>
  );
};

export default Header;
