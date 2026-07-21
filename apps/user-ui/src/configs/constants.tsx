export const navItems: NavItemsTypes[] = [
  {
    title: "Today's Deals",
    href: '/offers',
    accent: true,
  },
  {
    title: 'Electronics',
    href: '/electronics',
    accent: false,
  },
  {
    title: 'Fashion',
    href: '/fashion',
    accent: false,
  },
  {
    title: 'Home ',
    href: '/home',
    accent: false,
  },
  {
    title: 'Groceries',
    href: '/groceries',
    accent: false,
  },

  {
    title: 'Customer Service',
    href: '/contact',
    accent: false,
  },
  {
    title: 'Sell ',
    href: `${process.env.NEXT_PUBLIC_SELLER_SERVER_URI}/signup`,
    accent: false,
  },
  // {
  //   title: 'Products',
  //   href: '/products',
  //   accent: false,
  // },
  // {
  //   title: 'Shops',
  //   href: '/shops',
  //   accent: false,
  // },
  // {
  //   title: 'Trending',
  //   href: '/trending',
  //   accent: false,
  // },
];
