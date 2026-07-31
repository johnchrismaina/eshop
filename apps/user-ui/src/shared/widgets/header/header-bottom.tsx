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

  return (
    // <div className="w-full transition-all duration-300 bg-[#fff] border-b border-gray-100 shadow-xl">
    <div className="relative z-10 w-full transition-all duration-300 bg-[#fff] border-b border-slate-200/80 shadow-md shadow-gray-300/10 ">
      <div className="w-full px-12 mx-auto pt-0 pb-0 relative flex items-center justify-center gap-6 h-full ">
        {/* <div className="max-w-[1280px] mx-auto px-10 pt-1 pb-2.5 flex items-center justify-between gap-2"> */}

        {/* <div className="flex items-center justify-center gap-10"> */}
        {/* All Dropdowns */}
        <div>
          {/* Bottom header button */}
          <button
            className="flex items-center text-[14.0px] font-semibold gap-2.5 text-[#000] hover:text-[#000] px-2 py-2 hover:bg-gray-200/80 transition-colors duration-100 mr-0 flex-shrink-0 "
            onClick={() => setShowSidebar(true)}
          >
            <Menu size={16} />
            Categories
          </button>

          {/* Sidebar controlled by parent state */}
          <SidebarMenu
            isOpen={showSidebar}
            onClose={() => setShowSidebar(false)}
          />
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-1 items-center justify-start gap-4 ml-0 ">
          {navItems.map((i: NavItemsTypes, index: number) => (
            <Link
              className={`flex items-center px-3 py-2 text-[14.0px] h-full hover:bg-gray-200/80 transition-colors duration-100 ${
                i.accent
                  ? 'text-[#C2410C] font-semibold hover:text-[#e85d1f]'
                  : 'text-[#000] font-medium hover:text-[#000]'
              }`}
              href={i.href}
              key={index}
            >
              {i.title}
            </Link>
          ))}
        </nav>

        {/* </div> */}
        <div className="flex items-center justify-start text-[14.0px] text-[#000] font-medium gap-4 ml-0 h-full">
          <span className="cursor-pointer px-2 py-2 hover:bg-gray-200/80 transition-colors duration-100 ">
            Sell on Sokonis
          </span>
          <span className="cursor-pointer px-2 py-2 hover:bg-gray-200/80 transition-colors duration-100 ">
            Customer Service
          </span>
        </div>
      </div>
    </div>
  );
};

export default HeaderBottom;
