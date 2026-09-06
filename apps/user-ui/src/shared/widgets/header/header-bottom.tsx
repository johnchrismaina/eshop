'use client';
// import { useQuery } from '@tanstack/react-query';
// import ProfileIcon from 'apps/user-ui/src/assets/svgs/profile-icon';
import { navItems } from 'apps/user-ui/src/configs/constants';
import useUser from 'apps/user-ui/src/hooks/useUser';
// import { useStore } from 'apps/user-ui/src/store';
// import axiosProductService from 'apps/user-ui/src/utils/axiosProductService';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
// import { BsBag } from 'react-icons/bs';
import SidebarMenu from '../../components/sidebar-menu';
// import CartIcon from 'apps/user-ui/src/assets/svgs/cart-icon';

const HeaderBottom = () => {
  const [showSidebar, setShowSidebar] = useState(false);

  const { user } = useUser();

  console.log(user);

  // bg-gradient-to-b from-[#5C5C62] to-[#4A4A50]

  return (
    // <div className="w-full transition-all duration-300 bg-[#fff] border-b border-gray-100 shadow-xl">
    <div className="relative z-10 w-full transition-all duration-300 bg-[#161617]/80 border-none border-gray-200 shadow-none shadow-gray-300/10 ">
      <div className="w-full px-8 mx-auto pt-0.5 pb-0.5 relative flex items-center justify-between gap-4 h-full text-[#fff] ">
        {/* All Dropdowns */}
        <div>
          {/* Bottom header button */}
          <button
            className="flex items-center justify-center gap-2.5 px-2 py-2 text-[13.5px] text-[#fff] font-bold hover:text-[#fff] rounded-sm transition-colors duration-300 mr-0 flex-shrink-0 "
            onClick={() => setShowSidebar(true)}
          >
            <Menu size={16} />
            All Categories
          </button>

          {/* Sidebar controlled by parent state */}
          <SidebarMenu
            isOpen={showSidebar}
            onClose={() => setShowSidebar(false)}
          />
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-1 items-center justify-start gap-1 ml-0 ">
          {navItems.map((i: NavItemsTypes, index: number) => (
            <Link
              className={`flex items-center px-3 py-2 text-[13.5px] h-full rounded-sm transition-colors duration-150 ${
                i.accent
                  ? 'text-[#FEA417] font-semibold hover:text-amber-500'
                  : 'text-[#fff] font-medim hover:text-[#fff]'
              }`}
              href={i.href}
              key={index}
            >
              {i.title}
            </Link>
          ))}
        </nav>

        {/* </div> */}
        <div className="flex items-center justify-end gap-1 ml-0 h-full text-[13.5px] font-medium rounded-sm transition-colors duration-150 ">
          <span className="cursor-pointer px-3 py-2 transition-colors duration-100 hover:text-[#fff] hidden">
            Sell
          </span>
          <span className="cursor-pointer px-3 py-2 transition-colors duration-100 hover:text-[#fff]">
            Customer Service
          </span>
        </div>
      </div>
    </div>
  );
};

export default HeaderBottom;
