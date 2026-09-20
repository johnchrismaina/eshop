'use client';
// import { useQuery } from '@tanstack/react-query';
// import ProfileIcon from 'apps/user-ui/src/assets/svgs/profile-icon';
import { navItems } from 'apps/user-ui/src/configs/constants';
import useUser from 'apps/user-ui/src/hooks/useUser';
// import { useStore } from 'apps/user-ui/src/store';
// import axiosProductService from 'apps/user-ui/src/utils/axiosProductService';
import { ChevronDown, Menu } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
// import { BsBag } from 'react-icons/bs';
import SidebarMenu from '../../components/sidebar-menu';
import { usePathname } from 'next/navigation';
// import CartIcon from 'apps/user-ui/src/assets/svgs/cart-icon';
import { HiOutlineUser } from 'react-icons/hi';

const HeaderBottom = () => {
  const [showSidebar, setShowSidebar] = useState(false);

  const { user } = useUser();
  const [open, setOpen] = useState(false);

  // console.log(user);
  // 292F36 - perfect --

  const pathname = usePathname();
  const isLanding = pathname === '/';

  return (
    // <div className="w-full transition-all duration-300 bg-[#fff] border-b border-gray-100 shadow-xl">
    <div
      // className={`relative z-10 w-full transition-all duration-300 border-b border-gray-200 shadow-none shadow-gray-300/10 ${
      //   isLanding ? 'bg-[#4E4D5C]' : 'bg-[#4E4D5C]'
      // } `}
      className={`relative z-10 w-full transition-all duration-300 border-b border-gray-200 shadow-none shadow-gray-300/10 bg-[#292F36]
      } `}
    >
      <div className="w-[1460px] px-8 mx-auto pt-0.5 pb-0.5 relative grid grid-cols-[120px_1fr_240px] items-center justify-between gap-1 h-full text-[#fff] ">
        {/* All Dropdowns */}
        <div
          className="relative"
          onMouseEnter={() => setShowSidebar(true)}
          onMouseLeave={() => setShowSidebar(false)}
        >
          <button className="flex items-center justify-start gap-1.5 px-2 py-2 text-[14px] text-gray-100 font-medium hover:text-[#fff] rounded-sm transition-colors duration-300 mr-0 flex-shrink-0">
            Departments
            <div className="shrink-0">
              <ChevronDown size={12} />
            </div>
          </button>

          <SidebarMenu
            isOpen={showSidebar}
            onClose={() => setShowSidebar(false)}
          />
        </div>

        {/* Navigation Links */}
        <nav className="flex items-start justify-start gap-3 ml-0 ">
          {navItems.map((i: NavItemsTypes, index: number) => (
            <Link
              className={`flex items-center px-3 py-2 text-[13.5px] h-full rounded-sm transition-colors duration-150 ${
                i.accent
                  ? 'text-[#FEA417] font-semibold hover:text-amber-500'
                  : 'text-gray-100 font-medium hover:text-[#fff]'
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
          <span className="cursor-pointer px-3 py-2 transition-colors duration-100 hover:text-[#fff] ">
            Sell
          </span>
          <span className="cursor-pointer px-2 py-2 transition-colors duration-100 hover:text-[#fff]">
            Customer Service
          </span>
        </div>
      </div>
    </div>
  );
};

export default HeaderBottom;
