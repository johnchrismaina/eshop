'use client';
// import { useQuery } from '@tanstack/react-query';
// import ProfileIcon from 'apps/user-ui/src/assets/svgs/profile-icon';
import { navItems } from 'apps/user-ui/src/configs/constants';
import useUser from 'apps/user-ui/src/hooks/useUser';
// import { useStore } from 'apps/user-ui/src/store';
// import axiosProductService from 'apps/user-ui/src/utils/axiosProductService';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
// import { BsBag } from 'react-icons/bs';
import SidebarMenu from '../../components/sidebar-menu';
import { usePathname } from 'next/navigation';
// import CartIcon from 'apps/user-ui/src/assets/svgs/cart-icon';
// import { HiOutlineUser } from 'react-icons/hi';

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
      <div className="w-[1400px] px-0 mx-auto pt-0 pb-0 relative grid grid-cols-[180px_1fr_240px] items-center justify-between gap-1 h-[40px] ">
        {/* All Dropdowns */}
        <div
          onMouseEnter={() => setShowSidebar(true)}
          onMouseLeave={() => setShowSidebar(false)}
          className="relative flex items-center justify-center h-full hover:bg-[#3B4148]"
        >
          <button className="flex items-center justify-start gap-1.5 px-2 py-0 text-[16px] font-medium text-[#fff]  rounded-sm transition-colors duration-300 mr-0 flex-shrink-0">
            Shop Departments
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
        <nav className="flex items-start justify-start gap-4 ml-0 ">
          {navItems.map((i: NavItemsTypes, index: number) => (
            <Link
              className={`flex items-center px-2 py-0 text-[14px] h-full rounded-sm transition-colors duration-150 ${
                i.accent
                  ? 'text-[#FEA417] font-semibold hover:text-amber-500'
                  : 'text-[#f5f5f5] font-medium hover:bg-[#3B4148]'
              }`}
              href={i.href}
              key={index}
            >
              {i.title}
            </Link>
          ))}
        </nav>

        {/* </div> */}
        <div className="flex items-center justify-end gap-2 ml-0 h-full text-[14px] text-[#f5f5f5] font-medium rounded-sm transition-colors duration-150 ">
          <span className="cursor-pointer px-2 py-0 transition-colors duration-100 hover:bg-[#3B4148] shrink-0">
            Sell
          </span>
          <div className=" w-px h-4 bg-gray-600 ml-2" />
          <span className="cursor-pointer px-2 py-0 transition-colors duration-100 hover:bg-[#3B4148] shrink-0">
            Customer Service
          </span>
        </div>
      </div>
    </div>
  );
};

export default HeaderBottom;
