import CategoryCard from './CategoryCard';

export default function CategoriesGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 bg-white ">
      <CategoryCard
        title="Computer & Gaming"
        items={[
          {
            label: 'Kitchen Essentials',
            href: '/gaming/consoles',
            image:
              'https://ik.imagekit.io/johnchrismaina/Card%20categories/alienware-unsplash%20(1).jpg?updatedAt=1771095541753',
          },
          // {
          //   label: 'Cleaning Supplies',
          //   href: '/gaming/accessories',
          //   image:
          //     'https://ik.imagekit.io/johnchrismaina/Card%20categories/Hee2d2dcb5eeb4775ab96d97200097968w.jpg_480x480.avif',
          // },
        ]}
        seeMoreHref="/gaming"
      />
      <CategoryCard
        title="Home essentials"
        items={[
          {
            label: 'Kitchen Essentials',
            href: '/gaming/consoles',
            image:
              'https://ik.imagekit.io/johnchrismaina/Card%20categories/unnamed%20(2).png',
          },
          {
            label: 'Cleaning Supplies',
            href: '/gaming/accessories',
            image:
              'https://ik.imagekit.io/johnchrismaina/Card%20categories/unnamed%20(1).png',
          },
          {
            label: 'Home Decor',
            href: '/gaming/pc',
            image:
              'https://ik.imagekit.io/johnchrismaina/Card%20categories/unnamed%20(4).png',
          },
          {
            label: 'Bedding',
            href: '/gaming/vr',
            image:
              'https://ik.imagekit.io/johnchrismaina/Card%20categories/unnamed2.jpg',
          },
        ]}
        seeMoreHref="/gaming"
      />
      {/* <CategoryCard
        title="Computers & Gaming"
        items={[
          {
            label: 'Computers',
            href: '/gaming/consoles',
            image:
              'https://ik.imagekit.io/johnchrismaina/Card%20categories/alienware-unsplash%20(1).jpg',
          },
        ]}
        seeMoreHref="/gaming"
      /> */}
      <CategoryCard
        title="Shop Fashion"
        items={[
          {
            label: 'Kitchen Essentials',
            href: '/gaming/consoles',
            image:
              'https://ik.imagekit.io/johnchrismaina/Cards%20No%20Background/Beauty_and_Health-removebg-preview.png',
          },
          {
            label: 'Cleaning Supplies',
            href: '/gaming/accessories',
            image:
              'https://ik.imagekit.io/johnchrismaina/Cards%20No%20Background/Womens_Clothing-removebg-preview.png',
          },
          {
            label: 'Home Decor',
            href: '/gaming/pc',
            image:
              'https://ik.imagekit.io/johnchrismaina/Cards%20No%20Background/Lingerie_and_Loungewear-removebg-preview.png',
          },
          {
            label: 'Bedding',
            href: '/gaming/vr',
            image:
              'https://ik.imagekit.io/johnchrismaina/Cards%20No%20Background/Jewerly_and_Watches-removebg-preview.png',
          },
        ]}
        seeMoreHref="/gaming"
      />

      {/* Add more CategoryCard blocks here */}
    </div>
  );
}
