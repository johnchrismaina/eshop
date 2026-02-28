'use client';

import useSeller from 'apps/seller-ui/src/hooks/useSeller';
import useSidebar from 'apps/seller-ui/src/hooks/useSidebar';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Box from '../box';
import { Sidebar } from './sidebar.styles';
import Link from 'next/link';
import {
  BellPlus,
  BellRing,
  CalendarPlus,
  Grid2X2Icon,
  HomeIcon,
  ListOrdered,
  LogOut,
  Mail,
  PackageSearch,
  Settings,
  SquarePlus,
  TicketPercent,
  Wallet,
} from 'lucide-react';
import SidebarItem from './sidebar.item';
import SidebarMenu from './sidebar.menu';
import { useMutation } from '@tanstack/react-query';
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const SidebarWrapper = () => {
  const { activeSidebar, setActiveSidebar } = useSidebar();
  const [serverError, setServerError] = useState<string | null>(null);
  // const [setServerError] = useState<string | null>(null);
  const pathName = usePathname();
  const { seller } = useSeller();
  const router = useRouter();

  useEffect(() => {
    setActiveSidebar(pathName);
  }, [pathName, setActiveSidebar]);

  const getIconColor = (route: string) =>
    activeSidebar === route ? '#0085ff' : '#969696';

  // console.log('Sidebar seller:', seller);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/logout-seller`,
        {},
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: () => {
      // Clear any local state if needed
      router.push('/login'); // redirect to landing page
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        'Logout failed!';
      setServerError(errorMessage);
    },
  });

  return (
    <Box
      $css={{
        height: '100vh',
        zIndex: 202,
        position: 'sticky',
        padding: '8px',
        top: '0',
        overflowY: 'scroll',
        scrollbarWidth: 'none',
      }}
      className="sidebar-wrapper"
    >
      <Sidebar.Header className="flex items-center justify-center ">
        <Box>
          <Link
            href={'/'}
            className="flex flex-col items-center justify-center text-center gap-2"
          >
            {/* <Grid2X2Icon /> */}
            <div className="relative w-[80px] h-[80px] rounded-full border-4 border-slate-700 overflow-hidden">
              <Image
                src={
                  seller?.shop?.avatar ||
                  'https://ik.imagekit.io/johnchrismaina/3d-portrait-businessman-min.jpg'
                }
                alt="Seller Avatar"
                layout="fill"
                objectFit="cover"
              />
            </div>
            <Box>
              <h3 className="text-xl font-medium text-[#ecedee]">
                {seller?.shop?.name
                  ? seller.shop.name
                  : 'No shop name available'}
              </h3>
              <h5 className="font-medium text-xs text-[#ecedeecf] whitespace-nowrap overflow-hidden text-ellipsis max-w-[170px]">
                {seller?.shop?.address
                  ? seller.shop.address
                  : 'No address available'}
              </h5>

              {/* <h3 className="text-xl font-medium text-[#ecedee]">
                {seller?.shop?.name}
              </h3>
              <h5 className="font-medium pl-2 text-xs text-[#ecedeecf] whitespace-nowrap overflow-hidden text-ellipsis max-w-[170px]">
                {seller?.shop?.address}
              </h5> */}
            </Box>
          </Link>
        </Box>
      </Sidebar.Header>
      <div className="block my-3 h-full">
        <Sidebar.Body className="body sidebar">
          <SidebarItem
            isActive={activeSidebar === '/dashboard'}
            title="Dashboard"
            href="/dashboard"
            icon={<HomeIcon size={22} color={getIconColor('/dashboard')} />}
          />
          <div className="mt-2 block">
            <SidebarMenu title="Main Menu">
              <SidebarItem
                isActive={activeSidebar === '/dashboard/orders'}
                title="Orders"
                href="/dashboard/orders"
                icon={
                  <ListOrdered
                    size={22}
                    color={getIconColor('/dashboard/orders')}
                  />
                }
              />
              <SidebarItem
                isActive={activeSidebar === '/dashboard/payments'}
                title="Payments"
                href="/dashboard/payments"
                icon={
                  <Wallet
                    size={22}
                    color={getIconColor('/dashboard/payments')}
                  />
                }
              />
            </SidebarMenu>
            <SidebarMenu title="Products">
              <SidebarItem
                isActive={activeSidebar === '/dashboard/create-product'}
                title="Create Product"
                href="/dashboard/create-product"
                icon={
                  <SquarePlus
                    size={22}
                    color={getIconColor('/dashboard/create-product')}
                  />
                }
              />
              <SidebarItem
                isActive={activeSidebar === '/dashboard/all-products'}
                title="All Products"
                href="/dashboard/all-products"
                icon={
                  <PackageSearch
                    size={22}
                    color={getIconColor('/dashboard/all-products')}
                  />
                }
              />
            </SidebarMenu>
            <SidebarMenu title="Events">
              <SidebarItem
                isActive={activeSidebar === '/dashboard/create-event'}
                title="Create Event"
                href="/dashboard/create-event"
                icon={
                  <CalendarPlus
                    size={22}
                    color={getIconColor('/dashboard/create-event')}
                  />
                }
              />
              <SidebarItem
                isActive={activeSidebar === '/dashboard/all-events'}
                title="All Events"
                href="/dashboard/all-events"
                icon={
                  <BellPlus
                    size={22}
                    color={getIconColor('/dashboard/all-events')}
                  />
                }
              />
            </SidebarMenu>
            <SidebarMenu title="Controllers">
              <SidebarItem
                isActive={activeSidebar === '/dashboard/inbox'}
                title="Inbox"
                href="/dashboard/inbox"
                icon={
                  <Mail size={22} color={getIconColor('/dashboard/inbox')} />
                }
              />
              <SidebarItem
                isActive={activeSidebar === '/dashboard/settings'}
                title="Settings"
                href="/dashboard/settings"
                icon={
                  <Settings
                    size={22}
                    color={getIconColor('/dashboard/settings')}
                  />
                }
              />
              <SidebarItem
                isActive={activeSidebar === '/dashboard/notifications'}
                title="Notifications"
                href="/dashboard/notifications"
                icon={
                  <BellRing
                    size={22}
                    color={getIconColor('/dashboard/notifications')}
                  />
                }
              />
            </SidebarMenu>
            <SidebarMenu title="Extras">
              <SidebarItem
                isActive={activeSidebar === '/dashboard/discount-codes'}
                title="Discount Codes"
                href="/dashboard/discount-codes"
                icon={
                  <TicketPercent
                    size={22}
                    color={getIconColor('/dashboard/discount-codes')}
                  />
                }
              />
              <SidebarItem
                isActive={activeSidebar === '/dashboard/logout'}
                title="Logout"
                href="#"
                icon={
                  <LogOut size={22} color={getIconColor('/dashboard/logout')} />
                }
                onClick={() => logoutMutation.mutate()} // call mutation
              />
            </SidebarMenu>
          </div>
        </Sidebar.Body>
      </div>
    </Box>
  );
};

export default SidebarWrapper;
