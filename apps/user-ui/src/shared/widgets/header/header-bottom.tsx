'use client';
import { useQuery } from '@tanstack/react-query';
// import ProfileIcon from 'apps/user-ui/src/assets/svgs/profile-icon';
import { navItems } from 'apps/user-ui/src/configs/constants';
import useUser from 'apps/user-ui/src/hooks/useUser';
import { useStore } from 'apps/user-ui/src/store';
import axiosProductService from 'apps/user-ui/src/utils/axiosProductService';
import {
  // ChevronDown,
  // ChevronRight,
  // HeartIcon,
  TextAlignJustify,
} from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
// import { BsBag } from 'react-icons/bs';
import SidebarMenu from '../../components/sidebar-menu';
import CartIcon from 'apps/user-ui/src/assets/svgs/cart-icon';

const HeaderBottom = () => {
  // const [show, setShow] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  // const [expandedCategory, setExpandedCategory] = useState<string | null>();
  const wishlist = useStore((state: any) => state.wishlist);
  const cart = useStore((state: any) => state.cart);

  const { user, role, isLoading } = useUser();
  const { data } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await axiosProductService.get('/product/api/get-categories');
      return res.data;
    },
    staleTime: 1000 * 60 * 30,
  });

  console.log(user);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={`w-full transition-all duration-300 bg-[#f5f5f5] flex items-center justify-center h-[50px] ${
        isSticky ? 'fixed top-0 left-0 z-[100] bg-white shadow-lg' : 'relative'
      }`}
    >
      <div
        className={`w-[95%] relative m-auto flex items-center justify-between ${
          isSticky ? 'pt-3' : 'py-0'
        }`}
      >
        {/* All Dropdowns */}
        <div>
          {/* Bottom header button */}
          <button
            className="p-2 bg-transparent rounded flex items-center justify-between gap-1"
            onClick={() => setShowSidebar(true)}
          >
            <TextAlignJustify color="#333" />
            <span className="text-gray-800 font-medium">Categories</span>
          </button>

          {/* Sidebar controlled by parent state */}
          <SidebarMenu
            isOpen={showSidebar}
            onClose={() => setShowSidebar(false)}
          />
        </div>
        {/* <div
          className={`${
            isSticky ? '-mb-2' : ''
          } cursor-pointer flex items-center justify-between px-5 h-[50px]`}
          onClick={() => setShow(!show)}
        >
          <div className="flex items-center gap-2 ">
            <TextAlignJustify color="#333" />
            <span className="text-gray-800 font-medium">Categories</span>
          </div>
        </div> */}

        {/* Dropdown menu */}
        {/* {show && <SidebarMenu />} */}

        {/* Navigation Links */}
        <div className="flex items-center gap-1">
          {navItems.map((i: NavItemsTypes, index: number) => (
            <Link
              className="px-3 font-medium text-md"
              href={i.href}
              key={index}
            >
              {i.title}
            </Link>
          ))}
        </div>

        <div>
          {isSticky && (
            <div className="flex items-center gap-8 ">
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
                    <Link
                      href={'/login'}
                      className="flex items-center gap-x-[2px]"
                    >
                      <span className="block font-medium text-md">Hello,</span>
                      <span className="font-medium text-md">
                        {' '}
                        {isLoading ? '...' : 'sign in'}
                      </span>
                    </Link>
                  </>
                )}
              </div>
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
          )}
        </div>
      </div>
    </div>
  );
};

export default HeaderBottom;
