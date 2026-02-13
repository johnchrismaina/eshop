'use client';
// import { useQuery } from '@tanstack/react-query';
// import ProfileIcon from 'apps/user-ui/src/assets/svgs/profile-icon';
import { navItems } from 'apps/user-ui/src/configs/constants';
import useUser from 'apps/user-ui/src/hooks/useUser';
// import { useStore } from 'apps/user-ui/src/store';
// import axiosProductService from 'apps/user-ui/src/utils/axiosProductService';
import {
  // EqualIcon,
  // ChevronDown,
  // ChevronRight,
  // HeartIcon,
  TextAlignJustify,
} from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
// import { BsBag } from 'react-icons/bs';
import SidebarMenu from '../../components/sidebar-menu';
// import CartIcon from 'apps/user-ui/src/assets/svgs/cart-icon';

const HeaderBottom = () => {
  // const [show, setShow] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  // const [isSticky, setIsSticky] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const [isSticky, setIsSticky] = useState(false);
  // const [expandedCategory, setExpandedCategory] = useState<string | null>();
  // const wishlist = useStore((state: any) => state.wishlist);
  // const cart = useStore((state: any) => state.cart);

  // const { user, role, isLoading } = useUser();
  const { user } = useUser();

  // const { data } = useQuery({
  //   queryKey: ['categories'],
  //   queryFn: async () => {
  //     const res = await axiosProductService.get('/product/api/get-categories');
  //     return res.data;
  //   },
  //   staleTime: 1000 * 60 * 30,
  // });

  console.log(user);

  // Track scroll position
  // useEffect(() => {
  //   const handleScroll = () => {
  //     if (window.scrollY > 100) {
  //       setIsSticky(true);
  //     } else {
  //       setIsSticky(false);
  //     }
  //   };

  //   window.addEventListener('scroll', handleScroll);
  //   return () => window.removeEventListener('scroll', handleScroll);
  // }, []);

  return (
    <div className="w-full transition-all duration-300 flex items-center justify-center h-[45px] ">
      <div className="w-[80%] relative mx-auto flex items-center justify-start gap-6 ">
        {/* All Dropdowns */}
        <div>
          {/* Bottom header button */}
          <button
            className="py-2 bg-transparent rounded flex items-center justify-between gap-1"
            onClick={() => setShowSidebar(true)}
          >
            <TextAlignJustify color="#000" className="size-4" />
            {/* <EqualIcon color="#333" /> */}
            <span className="text-gray-600 hover:text-gray-800 font-medium">
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
        <div className="flex items-center gap-4">
          {navItems.map((i: NavItemsTypes, index: number) => (
            <Link
              className="px-3 py-2 font-medium text-sm text-gray-600 hover:text-gray-800 transition flex items-center"
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
