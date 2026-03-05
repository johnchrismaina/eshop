'use client';
// import { useQuery } from '@tanstack/react-query';
// import ProfileIcon from 'apps/user-ui/src/assets/svgs/profile-icon';
import { navItems } from 'apps/user-ui/src/configs/constants';
import useUser from 'apps/user-ui/src/hooks/useUser';
// import { useStore } from 'apps/user-ui/src/store';
// import axiosProductService from 'apps/user-ui/src/utils/axiosProductService';
import { TextAlignJustify } from 'lucide-react';
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
    <div className="w-full transition-all duration-300 flex items-center justify-center h-[45px] ">
      <div className="w-[95%] relative mx-auto flex items-center justify-start gap-4 ">
        {/* All Dropdowns */}
        <div>
          {/* Bottom header button */}
          <button
            className="py-2 bg-transparent rounded flex items-center justify-between gap-1"
            onClick={() => setShowSidebar(true)}
          >
            <TextAlignJustify color="#000" className="size-4" />
            {/* <EqualIcon color="#333" /> */}
            <span className="text-gray-800 hover:text-gray-900 font-bold">
              Categories
            </span>
          </button>

          {/* Sidebar controlled by parent state */}
          <SidebarMenu
            isOpen={showSidebar}
            onClose={() => setShowSidebar(false)}
          />
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-2">
          {navItems.map((i: NavItemsTypes, index: number) => (
            <Link
              className="px-3 py-2 font-bold text-sm text-gray-800 hover:text-gray-900 transition flex items-center"
              href={i.href}
              key={index}
            >
              {i.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeaderBottom;
