import CategoryCard from './CategoryCard';

export default function CategoriesGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-0 pt-4 bg-gray-100">
      <CategoryCard
        title="Computers & Gaming"
        items={[
          {
            // label: 'Consoles',
            href: '/gaming/consoles',
            image:
              'https://ik.imagekit.io/johnchrismaina/products/pexels-adonisariass-11288110.jpg',
          },
        ]}
        itemWidth={200} // set width
        itemHeight={400} // set height
        seeMoreHref="/gaming"
      />
      <CategoryCard
        title="Shop for your home essentials"
        items={[
          {
            label: 'Kitchen Essentials',
            href: '/gaming/consoles',
            image:
              'https://ik.imagekit.io/johnchrismaina/Home%20essentials/kitchen-essentials.jpg?updatedAt=1771010034631',
          },
          {
            label: 'Cleaning Supplies',
            href: '/gaming/accessories',
            image:
              'https://ik.imagekit.io/johnchrismaina/Home%20essentials/cleaning-supplies.jpg?updatedAt=1771009982422',
          },
          {
            label: 'Home Decor',
            href: '/gaming/pc',
            image:
              'https://ik.imagekit.io/johnchrismaina/Home%20essentials/home-decor.jpg?updatedAt=1771011111777',
          },
          {
            label: 'Bedding',
            href: '/gaming/vr',
            image:
              'https://ik.imagekit.io/johnchrismaina/Home%20essentials/bedding.jpg?updatedAt=1771012411246',
          },
        ]}
        itemWidth={200} // set width
        itemHeight={60} // set height
        seeMoreHref="/gaming"
      />
      <CategoryCard
        title="Top categories in Kitchen appliances"
        items={[
          {
            label: 'Consoles',
            href: '/gaming/consoles',
            image:
              'https://ik.imagekit.io/johnchrismaina/products/Daawat-Rice-800-x-800-px-2025-01-30T144802%20(1).webp',
          },
          {
            label: 'Accessories',
            href: '/gaming/accessories',
            image:
              'https://ik.imagekit.io/johnchrismaina/products/Daawat-Rice-800-x-800-px-2025-01-30T144802%20(1).webp',
          },
          {
            label: 'PC Gaming',
            href: '/gaming/pc',
            image:
              'https://ik.imagekit.io/johnchrismaina/products/Daawat-Rice-800-x-800-px-2025-01-30T144802%20(1).webp',
          },
          {
            label: 'VR',
            href: '/gaming/vr',
            image:
              'https://ik.imagekit.io/johnchrismaina/products/Daawat-Rice-800-x-800-px-2025-01-30T144802%20(1).webp',
          },
        ]}
        itemWidth={120} // set width
        itemHeight={80} // set height
        seeMoreHref="/gaming"
      />
      <CategoryCard
        title="Shop Fashion"
        items={[
          {
            label: 'Consoles',
            href: '/gaming/consoles',
            image:
              'https://ik.imagekit.io/johnchrismaina/products/Daawat-Rice-800-x-800-px-2025-01-30T144802%20(1).webp',
          },
          {
            label: 'Accessories',
            href: '/gaming/accessories',
            image:
              'https://ik.imagekit.io/johnchrismaina/products/Daawat-Rice-800-x-800-px-2025-01-30T144802%20(1).webp',
          },
          {
            label: 'PC Gaming',
            href: '/gaming/pc',
            image:
              'https://ik.imagekit.io/johnchrismaina/products/Daawat-Rice-800-x-800-px-2025-01-30T144802%20(1).webp',
          },
          {
            label: 'VR',
            href: '/gaming/vr',
            image:
              'https://ik.imagekit.io/johnchrismaina/products/Daawat-Rice-800-x-800-px-2025-01-30T144802%20(1).webp',
          },
        ]}
        itemWidth={120} // set width
        itemHeight={80} // set height
        seeMoreHref="/gaming"
      />

      {/* Add more CategoryCard blocks here */}
    </div>
  );
}
