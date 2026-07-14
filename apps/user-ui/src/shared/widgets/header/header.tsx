'use client';

import Link from 'next/link';
import React, { useState, useLayoutEffect, useRef } from 'react';
import {
  ChevronDown,
  MapPin,
  UserRound,
  // Search,
  // ShoppingCart,
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
import CartIcon from 'apps/user-ui/src/assets/svgs/cart-icon';
// import ChevronDownIcon from 'apps/user-ui/src/assets/svgs/chevron-down';

import { useEffect } from 'react';
import { Search, User, ShoppingCart, Menu } from 'lucide-react';
import SidebarMenu from '../../components/sidebar-menu';
import ProfileIcon from 'apps/user-ui/src/assets/svgs/profile-icon';
import PinFilledIcon from 'apps/user-ui/src/assets/svgs/pin-filled';
import ChevronDownIcon from 'apps/user-ui/src/assets/svgs/chevron-down';

// ----------------------------------

function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);
  return scrolled;
}

const DEPARTMENTS = [
  { label: 'Deals', href: '#' },
  { label: 'Electronics', href: '#' },
  { label: 'Fashion', href: '#' },
  { label: 'Home & Living', href: '#' },
  { label: 'Groceries', href: '#' },
  { label: 'Sell on Sokonis', href: '#' },
  { label: 'Customer Service', href: '#' },
];

const SEARCH_CATEGORIES = [
  'All',
  'Electronics',
  'Fashion',
  'Home & Living',
  'Groceries',
];

// ----------------------------------

// Define the props type
interface SearchScopeDropdownProps {
  value: string; // or whatever type your SEARCH_CATEGORIES values are
  onChange: (newValue: string) => void;
}

// ----------------------------------

// All Departments Dropdown

// SearchScopeDropdown is now just the trigger button — no state, no panel.
// The header owns the open/close state and renders the panel itself.
function SearchScopeDropdown({
  value,
  onToggle,
}: {
  value: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-1.5 h-10 pl-4 pr-3 text-[13px] text-[#333] hover:text-[#14181A] bg-white transition-colors flex-shrink-0 border-none outline-none focus:outline-none focus-visible:outline-none"
    >
      {value}
      <ChevronDown size={14} />
    </button>
  );
}

// ----------------------------------

const Header = () => {
  //Image and layout used by logo
  // const scrolled = useScrolled();
  // const [searchScope, setSearchScope] = useState('All');

  const [scrolled, setScrolled] = useState(false);
  const [searchScope, setSearchScope] = useState('All');
  const [openDepartments, setOpenDepartments] = useState(false);
  const searchWrapperRef = useRef<HTMLDivElement>(null);

  const [openSearchBackdrop, setOpenSearchBackdrop] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Click-outside now lives at the header level, watching the OUTER
  // wrapper (which contains both the pill and the dropdown panel).
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (
        searchWrapperRef.current &&
        !searchWrapperRef.current.contains(e.target as Node)
      ) {
        setOpenDepartments(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  //----------------------------------------------------

  //Search bar backdrop function

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setOpenSearchBackdrop(false);
      }
    }

    if (openSearchBackdrop) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openSearchBackdrop]);

  //----------------------------------------------------

  // const { user, isLoading } = useUser();
  const cart = useStore((state: any) => state.cart);
  const { layout } = useLayout();

  //Image and layout used by logo

  const router = useRouter();
  const queryClient = useQueryClient();
  const { logout, user, hydrated } = useAuthStore();

  const [open, setOpen] = useState(false);
  // const [openSearchBackdrop, setOpenSearchBackdrop] = useState(false);

  const [showSidebar, setShowSidebar] = useState(false);

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
      {/* HEADER 1 — logo / search / account / cart — sticky, gets shadow on scroll */}
      <header
        className={`sticky top-0 z-50 bg-[#fff] transition-shadow duration-200 ${
          scrolled ? 'shadow-sm' : 'shadow-none'
        }`}
      >
        <div className="max-w-[1200px] mx-auto pt-3 pb-3 grid grid-cols-[1fr_1fr] items-center justify-between ">
          <div className="flex items-center justify-center gap-12">
            {/* logo */}
            <div>
              <Link href="/">
                {/* <span className="font-semibold text-3xl tracking-tight">
                Sokonis
              </span> */}
                <Image
                  src={
                    layout?.logo ||
                    'https://ik.imagekit.io/johnchrismaina/Images%20and%20Banners/logo.svg'
                  }
                  alt="logo"
                  width={120}
                  height={50}
                  className="object-contain"
                  unoptimized
                />
              </Link>
            </div>

            {/* Delivery location - can be dropdown in future */}
            <div className="relative flex items-end gap-1 ml-4">
              {/* <MapPin color="#333" size={22} className="pr-1 " /> */}
              <div className="absolute top-[8px] left-[-24px] ">
                <MapPin color="#333" size={18} className="" />
                {/* <PinFilledIcon size={24} color="#FF2E2E" /> */}
              </div>
              <div className="flex flex-col items-start shrink-0">
                <span className="text-xs font-normal text-gray-500">
                  Deliver to:{' '}
                </span>
                <span className="text-[13.5px] font-medium text-gray-950 -mt-1.5">
                  Naivasha
                </span>
              </div>
            </div>

            {/* Search bar — OUTER wrapper: relative, no overflow-hidden.
              This is what click-outside watches, and what holds the panel. */}
            <div ref={searchWrapperRef} className="relative w-[700px] mx-auto">
              <div
                ref={searchContainerRef}
                className="flex items-center h-10 bg-[#fff] rounded-md border border-gray-600 
                 focus-within:border-orange-500/50 overflow-hidden 
                 focus-within:ring focus-within:ring-opacity-50 focus-within:ring-orange-500 
                 transition-all duration-200 ease-out"
              >
                <SearchScopeDropdown
                  value={searchScope}
                  onToggle={() => setOpenDepartments((o) => !o)}
                />

                <input
                  type="text"
                  onFocus={() => setOpenSearchBackdrop(true)} // open backdrop when input is focused
                  placeholder="Search products, brands, categories..."
                  className="flex-1 h-12 bg-transparent outline-none border-none text-[13.5px] 
                   placeholder:font-normal placeholder:text-gray-500 px-4 py-0 
                   focus:border-blue-500 focus:border-2 focus:ring-0"
                />

                {/* Backdrop with synced fade */}
                <div
                  className={`fixed top-[106px] left-0 right-0 bottom-0 bg-black 
                   transition-opacity duration-200 ease-out z-[100] 
                   ${
                     openSearchBackdrop
                       ? 'opacity-40'
                       : 'opacity-0 pointer-events-none'
                   }`}
                  onClick={() => setOpenSearchBackdrop(false)}
                />

                <button
                  aria-label="Search"
                  className="flex items-center justify-center w-12 h-10 mr-[-1px] rounded-r-md 
                   text-[#14181A] bg-orange-400 hover:text-[#14181A] hover:bg-orange-400 
                   transition-colors flex-shrink-0"
                >
                  <Search size={20} />
                </button>
              </div>
              {/* dropdown panel unchanged */}
              {openDepartments && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-gray-100 border border-[#E7E5E0] rounded-md shadow-lg py-1 z-50">
                  {SEARCH_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setSearchScope(cat);
                        setOpenDepartments(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-[13.5px] transition-colors ${
                        cat === searchScope
                          ? 'text-[#E85D1F] font-medium bg-[#FCE6D9]/40'
                          : 'text-[#14181A] hover:bg-[#F6F5F1]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Account / Cart column */}
          <div className="flex items-center justify-end w-full h-full gap-7">
            {/* Account/Trigger */}
            <div
              className="relative flex items-center gap-1 text-gray-600 px-0 h-full "
              onMouseEnter={() => setOpen(true)}
              onMouseLeave={() => setOpen(false)}
            >
              <Link
                href={user?.name ? '/profile' : '/login'}
                className="flex flex-col gap-0 items-start justify-start "
              >
                <span className="block text-[13.0px] font-normal text-[#1c1c1c] tracking-wide">
                  {!mounted ? (
                    // SSR + first client render: invisible placeholder to prevent hydration mismatch
                    <span className="text-xs text-gray-500 font-normal ">
                      Sign in
                    </span>
                  ) : hadSession && !hydrated ? (
                    // Had previous session, still hydrating: show skeleton
                    <span className="block w-12 h-3 bg-gray-300 rounded animate-pulse"></span>
                  ) : user?.name ? (
                    // Hydrated with user: show username
                    <span className="font-normal">
                      {`Hi, ${capitalizeWords(user.name.split(' ')[0])}`}
                    </span>
                  ) : (
                    // No user or no previous session: show Log in
                    <span className="flex items-center justify-center text-xs text-gray-500 font-normal ">
                      {/* <ProfileIcon size={18} color="#fff" /> */}
                      Sign in
                    </span>
                  )}
                </span>

                <span className="relative flex items-center text-[13.5px] text-gray-950 font-medium gap-0.5 -mt-1.5">
                  Account
                  {/* <ChevronDown size={14} color="#333" /> */}
                  <ChevronDownIcon size={12} color="#555" />
                </span>
              </Link>

              {/* Backdrop */}
              {open && (
                <div
                  className="fixed top-[106px] left-0 right-0 bottom-0 bg-black/40 transition-opacity z-[100]"
                  onMouseEnter={() => setOpen(false)} // hover backdrop closes everything
                />
              )}

              {/* Floating Panel */}
              {open && (
                <div className="absolute top-full right-0 mt-[0] w-64 bg-[#fff] z-[110] shadow-lg rounded-md ">
                  {/* Arrow pointing up */}
                  {/* <div
                    className="absolute -top-2 right-4 w-0 h-0 
                            border-l-[10px] border-l-transparent 
                            border-r-[10px] border-r-transparent 
                            border-b-[12px] border-gray-400"
                  ></div> */}

                  <div className="p-6">
                    {user?.name ? (
                      <div className="flex flex-col items-start rounded-md bg-gray-100 px-6 py-2">
                        <span className="block font-semibold text-base">
                          {capitalizeWords(user?.name)}
                        </span>
                        <span className="block font-normal text-sm text-gray-600 mb-1">
                          {user?.email?.split(' ')[0]}
                        </span>
                        <Link
                          href="#"
                          className="text-blue-800 text-sm font-medium no-underline hover:underline"
                          onClick={() => {
                            logOutHandler();
                            setOpen(false);
                          }}
                        >
                          Sign Out
                        </Link>
                      </div>
                    ) : (
                      <div className="flex flex-col items-start">
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

                    <div className="flex flex-col mt-0 gap-2">
                      <span className="text-gray-900 font-semibold text-base">
                        Account
                      </span>
                      <div className="flex flex-col mt-0 gap-2 text-[13px] text-gray-600 font-normal ">
                        <Link href="/sign-in" className="hover:underline">
                          My Account
                        </Link>
                        <Link href="/sign-in" className="hover:underline">
                          My Orders
                        </Link>
                        <Link href="/sign-in" className="hover:underline">
                          Watchlist
                        </Link>
                        <Link href="/sign-in" className="hover:underline">
                          Customer Service
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* divider */}
            {/* <div className="w-px h-6 bg-gray-200 mx-3" /> */}

            {/* Cart */}
            <div className="flex items-center justify-start h-full gap-3 ">
              <Link
                href="/cart"
                className="relative flex items-center justify-center mt-[2px] cursor-pointer"
              >
                {/* <ShoppingCart
                  size={20}
                  strokeWidth={1.8}
                  className="text-[#5B6265] hover:text-[#14181A]"
                /> */}
                <CartIcon strokeWidth={1.5} size={24} color="#fff" />
                {/* {cart?.length > 0 && ( */}
                <div className="absolute top-[-2px] right-[-6px] min-w-[16px] h-4 px-1 rounded-full bg-[#e85d1f] flex items-center justify-center mt-[0px]">
                  <span className="text-white font-semibold text-[10px] leading-none">
                    {cart.length > 99 ? '99+' : cart.length}
                  </span>
                </div>
                {/* )} */}
              </Link>
              <span className="flex items-center justify-center py-1.5 px-3 ml-0 text-[11.5px] text-gray-900 font-semibold ">
                KES 0.00
              </span>
              {/* <div className="flex flex-col items-start justify-center"> */}
              {/* <span className="font-normal text-[11px] text-gray-500  ">
                  Cart
                </span>
                <span className=" text-[13.0px] text-gray-900 font-medium -mt-1.5">
                  KES 0.00
                </span> */}
              {/* </div> */}
            </div>
          </div>
        </div>
      </header>

      {/* HEADER 2 — categories — normal flow, not sticky, no shadow */}
      <div className="">
        <HeaderBottom />
      </div>
    </>
  );
};

export default Header;
