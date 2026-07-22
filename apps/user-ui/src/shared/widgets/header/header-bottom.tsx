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
    <div className="w-full transition-all duration-300 bg-[#fff] shadow-b shadow-lg border-b border-gray-300">
      <div className="w-[1200px] mx-auto pt-0 pb-2 relative flex items-center justify-center gap-10 ">
        {/* <div className="max-w-[1280px] mx-auto px-10 pt-1 pb-2.5 flex items-center justify-between gap-2"> */}

        {/* <div className="flex items-center justify-center gap-10"> */}
        {/* All Dropdowns */}
        <div>
          {/* Bottom header button */}
          <button
            className="flex items-center text-[14.0px] font-bold gap-2.5 text-[#00000CC] hover:text-[#000000] pl-0 pr-[17px] py-[9px] mr-0 flex-shrink-0 "
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
        <nav className="flex items-center flex-1 justify-start gap-4 ml-0">
          {navItems.map((i: NavItemsTypes, index: number) => (
            <Link
              className={`flex items-center px-3 py-0 rounded-sm pt-0 pb-0 text-[14.0px] transition-colors ${
                i.accent
                  ? 'text-[#fab528] font-bold hover:text-[#fab528]'
                  : 'text-[#000000CC] font-bold hover:text-[#000000]'
              }`}
              href={i.href}
              key={index}
            >
              {i.title}
            </Link>
          ))}
        </nav>
        {/* </div> */}
        <div className="flex gap-4 font-medium text-[14.0px] pt-1.5 pb-1.5 text-[#000000CC] hover:text-[#000000]">
          <span className="cursor-pointer">Sell </span>
          <span className="cursor-pointer">Customer Service</span>
        </div>
      </div>
    </div>
  );
};

export default HeaderBottom;
