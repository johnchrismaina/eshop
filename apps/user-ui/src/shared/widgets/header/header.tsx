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
import { IoCartOutline } from 'react-icons/io5';
import { CiUser } from 'react-icons/ci';

import { TbShoppingCart } from 'react-icons/tb';
import { PiShoppingCart } from 'react-icons/pi';
import { CgShoppingCart } from 'react-icons/cg';
import { IoCart } from 'react-icons/io5';

import { useEffect } from 'react';
import { Search, User, ShoppingCart, Menu } from 'lucide-react';
import SidebarMenu from '../../components/sidebar-menu';
// import ProfileIcon from 'apps/user-ui/src/assets/svgs/profile-icon';
import ChevronDownIcon from 'apps/user-ui/src/assets/svgs/chevron-down';

<style>
  @import
  url('https://fonts.googleapis.com/css2?family=Oswald:wght@200..700&display=swap');
</style>;

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
      className="flex items-center gap-1.5 h-10 pl-6 pr-3 text-[13px] text-gray-800 font-medium hover:text-[#14181A] bg-[#fff] transition-colors flex-shrink-0 border-none outline-none focus:outline-none focus-visible:outline-none"
    >
      {value}
      {/* <ChevronDown size={14} /> */}
      <ChevronDownIcon width={9} height={20} color="#4c4c4c" />
      {/* divider */}
      <div className=" w-px h-6 bg-gray-200 mx-2" />
    </button>
  );
}

// ----------------------------------

const Header = () => {
  //Image and layout used by logo
  // const scrolled = useScrolled();
  // const [searchScope, setSearchScope] = useState('All');

  const [scrolled, setScrolled] = useState(false);
  const [searchScope, setSearchScope] = useState('All Categories');
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
          scrolled ? 'shadow-none' : 'shadow-none'
        }`}
      >
        <div className="w-full px-12 mx-auto pt-2 pb-2 grid grid-cols-[1fr_300px] items-center justify-start gap-4 ">
          <div className="flex items-center justify-start gap-6">
            {/* Logo */}
            <div
              className="font-semibold font-libre text-[23px] tracking-tight pl-2"
              // style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              Sokonis<span className="text-2xl text-[#E85D1F] px-[1px]">.</span>
            </div>

            {/* Search bar — OUTER wrapper: relative, no overflow-hidden.
              This is what click-outside watches, and what holds the panel. */}
            <div
              ref={searchWrapperRef}
              className="relative w-[800px] mx-auto ml-6"
            >
              <div
                ref={searchContainerRef}
                className="flex items-center h-[38px] bg-[#fff] rounded-md border border-gray-400
                 focus-within:border-orange-500/50 overflow-hidden 
                 focus-within:ring-1 focus-within:ring-opacity-50 focus-within:ring-orange-500 
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
                  className="flex-1 h-[38px] bg-transparent outline-none border-none text-[14.0px] 
                   placeholder:font-normal placeholder:text-gray-400 pl-0 pr-4 py-0 
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
                  className="flex items-center justify-center w-[38px] h-[35px] mr-[0.5px] rounded-r-md 
                   text-[#fff] hover:text-[#fff] bg-[#262626] hover:bg-gray-950 border border-[#222]
                   transition-colors flex-shrink-0"
                >
                  <Search size={18} />
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
          <div className="flex items-center justify-end w-full h-full gap-1">
            {/* Delivery location - can be dropdown in future */}
            <div className="relative flex items-center justify-start gap-2 px-3 py-0 rounded-sm cursor-pointer hover:bg-gray-200/80 transition-colors duration-100 ">
              {/* </div> */}
              {/* <MapPin size={17} color="#000000cc" /> */}
              <div className="flex flex-col items-start shrink-0">
                <span className="text-xs font-normal text-[#000000cc] tracking-tight">
                  Deliver to:{' '}
                </span>
                <span className="text-[14.0px] font-semibold text-[#000] -mt-[4px] tracking-tight">
                  Naivasha
                </span>
              </div>
            </div>

            {/* Account/Trigger */}
            <div
              className="relative flex items-center gap-2 text-gray-600 px-3 rounded-sm h-full hover:bg-gray-200/80 transition-colors duration-100 "
              onMouseEnter={() => setOpen(true)}
              onMouseLeave={() => setOpen(false)}
            >
              {/* <CiUser /> */}
              <Link
                href={user?.name ? '/profile' : '/login'}
                className="flex flex-col gap-0 items-start justify-start "
              >
                <span className="block text-[11.0px] font-normal text-[#1c1c1c] tracking-wide">
                  {!mounted ? (
                    // SSR + first client render: invisible placeholder to prevent hydration mismatch
                    <span className="text-[11.0px] text-[#000000cc] font-normal tracking-tight ">
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
                    <span className="flex items-center justify-center text-[11.0px] text-[#000000cc] font-normal tracking-tight">
                      {/* <ProfileIcon size={18} color="#fff" /> */}
                      Sign in
                    </span>
                  )}
                </span>

                <span className="relative flex items-center text-[14.0px] text-[#000] font-semibold gap-0.5 -mt-1.5 tracking-tight">
                  Account
                  {/* <ChevronDown size={14} color="#999" /> */}
                  <ChevronDownIcon width={9} height={20} color="#757575" />
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
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-[0] w-64 bg-[#fff] shadow-[0_0_30px_rgba(0,0,0,0.1)] z-[110] rounded-md ">
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

            {/* Cart */}
            <div className="flex items-center justify-start h-full gap-2 pr-2">
              <Link
                href="/cart"
                className="relative flex items-center justify-center mt-[2px] cursor-pointer"
              >
                {/* <PiShoppingCart size={22} /> */}
                {/* <IoCartOutline size={22} color="#222" /> */}
                <CgShoppingCart size={18} color="#000000cc" />
                {/* <IoCart size={20} color="#222" /> */}
                {cart?.length > 0 && (
                  <div className="absolute top-[-8px] right-[-8px] min-w-[16px] h-4 px-1 rounded-full bg-[#ffac30] border border-white flex items-center justify-center mt-[0px]">
                    <span className="text-gray-800 font-semibold text-[10px] leading-none">
                      {cart.length > 99 ? '99+' : cart.length}
                    </span>
                  </div>
                )}
              </Link>
              {/* <span className="flex items-center justify-center py-1 px-1 ml-0 text-[11.5px] text-gray-900 font-medium ">
                KES 0.00
              </span> */}
              <div className="flex flex-col items-start justify-center">
                <span className="font-medium text-[11px] text-[#000000cc] tracking-tight ">
                  Cart
                </span>
                <span className=" text-[12.5px] text-[#000] font-semibold -mt-1.5 tracking-tight">
                  KES 0.00
                </span>
              </div>
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
