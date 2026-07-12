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
    <div className="transition-all duration-300 bg-[#f5f5f7] shadow-b shadow-lg">
      <div className="max-w-[1200px] pt-0 pb-0 relative mx-auto flex items-center justify-between gap-10 ">
        {/* <div className="max-w-[1280px] mx-auto px-10 pt-1 pb-2.5 flex items-center justify-between gap-2"> */}

        <div className="flex items-center justify-center gap-6">
          {/* All Dropdowns */}
          <div>
            {/* Bottom header button */}
            <button
              className="flex items-center gap-2.5 text-[#14181A] pl-0 pr-[17px] py-[9px] mr-0 flex-shrink-0 text-[13.5px] font-medium "
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
                className={`flex items-center px-3 pt-1.5 pb-1.5 text-[13.0px] tracking-wide transition-colors ${
                  i.accent
                    ? 'text-[#fab528] font-semibold hover:text-amber-500'
                    : 'text-[#444444] font-medium hover:text-[#14181A] '
                }`}
                href={i.href}
                key={index}
              >
                {i.title}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex gap-4 font-normal text-[13.0px] pt-1.5 pb-1.5 tracking-wide text-[#5B6265] hover:text-[#14181A]">
          <span className="cursor-pointer">Sell on Sokonis</span>
          <span className="cursor-pointer">Customer Service</span>
        </div>
      </div>
    </div>
  );
};

export default HeaderBottom;
