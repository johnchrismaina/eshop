'use client';

import { useQuery } from '@tanstack/react-query';
import ProfileIcon from 'apps/user-ui/src/assets/svgs/profile-icon';
import { navItems } from 'apps/user-ui/src/configs/constants';
import useUser from 'apps/user-ui/src/hooks/useUser';
import { useStore } from 'apps/user-ui/src/store';
import axiosProductService from 'apps/user-ui/src/utils/axiosProductService';
import { AlignLeft, ChevronDown, ChevronRight, HeartIcon } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { BsBag } from 'react-icons/bs';

const HeaderBottom = () => {
  const [show, setShow] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>();
  const wishlist = useStore((state: any) => state.wishlist);
  const cart = useStore((state: any) => state.cart);

  const { user, isLoading } = useUser();
  const { data } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await axiosProductService.get('/product/api/get-categories');
      return res.data;
    },
    staleTime: 1000 * 60 * 30,
  });

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
      className={`w-full transition-all duration-300 ${
        isSticky ? 'fixed top-0 left-0 z-[100] bg-white shadow-lg' : 'relative'
      }`}
    >
      <div
        className={`w-[80%] relative m-auto flex items-center justify-between ${
          isSticky ? 'pt-3' : 'py-0'
        }`}
      >
        {/* All Dropdowns */}
        <div
          className={`w-[260px] ${
            isSticky ? '-mb-2' : ''
          } cursor-pointer flex items-center justify-between px-5 h-[50px] bg-[#3489ff]`}
          onClick={() => setShow(!show)}
        >
          <div className="flex items-center gap-2">
            <AlignLeft color="white" />
            <span className="text-white font-medium">All Departments</span>
          </div>
          <ChevronDown color="white" />
        </div>

        {/* Dropdown menu */}
        {show && (
          <div
            className={`absolute left-0 ${
              isSticky ? 'top-[70px]' : 'top-[50px]'
            } w-[260px] max-h-[400px] overflow-y-auto bg-white shadow-md`}
          >
            {data?.categories?.length > 0 ? (
              data.categories.map((cat: string, i: number) => {
                const hasSub = data.subCategories?.[cat]?.length > 0;
                const isExpanded = expandedCategory === cat;

                return (
                  <div key={i} className="relative">
                    <button
                      onClick={() => {
                        if (hasSub) {
                          setExpandedCategory((prev) =>
                            prev === cat ? null : cat
                          );
                        } else {
                          setShow(false);
                          window.location.href = `/products?category=${encodeURIComponent(
                            cat
                          )}`;
                        }
                      }}
                      className="w-full flex items-center justify-between px-4 py-2 text-left hover:bg-gray-100"
                    >
                      <span>{cat}</span>
                      {hasSub &&
                        (isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        ))}
                    </button>

                    {/* Subcategories panel */}
                    {isExpanded && hasSub && (
                      <div className="pl-6 bg-gray-50 border-t border-gray-200">
                        {data.subCategories[cat].map(
                          (sub: string, j: number) => (
                            <Link
                              key={j}
                              href={`/products?subcategory=${encodeURIComponent(
                                sub
                              )}`}
                              className="block px-4 py-2 text-sm hover:bg-gray-100"
                              onClick={() => setShow(false)}
                            >
                              {sub}
                            </Link>
                          )
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="px-5 py-4 text-sm text-gray-500">
                No categories found.
              </p>
            )}
          </div>
        )}

        {/* Navigation Links */}
        <div className="flex items-center">
          {navItems.map((i: NavItemsTypes, index: number) => (
            <Link
              className="px-5 font-medium text-lg"
              href={i.href}
              key={index}
            >
              {i.title}
            </Link>
          ))}
        </div>

        <div>
          {isSticky && (
            <div className="flex items-center gap-8 pb-2">
              <div className="flex items-center gap-2">
                {!isLoading && user ? (
                  <>
                    <Link
                      href={'/login'}
                      className="border-2 w-[50px] h-[50px] flex items-center justify-center rounded-full border-[#010f1c1a]"
                    >
                      <ProfileIcon />
                    </Link>
                    <Link href={'/profile'}>
                      <span className="block font-[500] opacity-[.6]">
                        Hello,
                      </span>
                      <span className="font-[600]">
                        {user?.name?.split(' ')[0]}
                      </span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href={'/login'}>
                      <span className="block font-[500] opacity-[.6]">
                        Hello,
                      </span>
                      <span className="font-[600]">
                        {isLoading ? '...' : 'Sign in'}
                      </span>
                    </Link>
                  </>
                )}
              </div>
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
          )}
        </div>
      </div>
    </div>
  );
};

export default HeaderBottom;
