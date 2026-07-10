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
    <div className="transition-all duration-300 bg-[#1C3041] ">
      <div className="max-w-[1200px] pt-1 pb-1 relative mx-auto flex items-center justify-between gap-10 ">
        {/* <div className="max-w-[1280px] mx-auto px-10 pt-1 pb-2.5 flex items-center justify-between gap-2"> */}

        <div className="flex items-center justify-center gap-2 ">
          {/* All Dropdowns */}
          <div>
            {/* Bottom header button */}
            <button
              className="flex items-center gap-2.5 text-[13.5px] font-medium text-[#C9D2DD] pl-0 pr-[17px] py-[9px] mr-0 flex-shrink-0 "
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
          <nav className="flex items-center flex-1 justify-start gap-2 ml-0">
            {navItems.map((i: NavItemsTypes, index: number) => (
              <Link
                className={`flex items-center px-3 py-0.5 font-medium text-[13.5px] tracking-wide transition-colors ${
                  i.accent
                    ? 'text-[#F16232] font-semibold'
                    : 'text-[#C9D2DD] hover:text-[#fff]'
                }`}
                href={i.href}
                key={index}
              >
                {i.title}
              </Link>
            ))}
          </nav>
        </div>
        <span className="flex-1" />

        <a
          href="/sell"
          className="hidden lg:inline text-[13.5px] text-[#C9D2DD] font-medium opacity-80 hover:opacity-100 shrink-0"
        >
          Sell on Sokonis
        </a>
        <a
          href="/support"
          className="hidden lg:inline text-[13.5px] text-[#C9D2DD] font-medium opacity-80 hover:opacity-100 shrink-0"
        >
          Customer Service
        </a>
      </div>
    </div>
  );
};

export default HeaderBottom;
