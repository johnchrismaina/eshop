import CategoryCard from './CategoryCard';

export default function CategoriesGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-5 bg-gray-100 ">
      <CategoryCard
        title="Home essentials"
        items={[
          {
            label: 'Kitchen Essentials',
            href: '/gaming/consoles',
            image:
              'https://ik.imagekit.io/johnchrismaina/Home%20essentials/dada_design-aJDt_9OFXBQ-unsplash.jpg',
          },
          {
            label: 'Cleaning Supplies',
            href: '/gaming/accessories',
            image:
              'https://ik.imagekit.io/johnchrismaina/Home%20essentials/le-quan-zOsS4vz1Lbg-unsplash.jpg',
          },
          {
            label: 'Home Decor',
            href: '/gaming/pc',
            image:
              'https://ik.imagekit.io/johnchrismaina/Home%20essentials/le-quan-zOsS4vz1Lbg-unsplash.jpg',
          },
          {
            label: 'Bedding',
            href: '/gaming/vr',
            image:
              'https://ik.imagekit.io/johnchrismaina/Home%20essentials/lotus-design-n-print-8qNuR1lIv_k-unsplash.jpg',
          },
        ]}
        // itemWidth={200} // set width
        // itemHeight={60} // set height
        seeMoreHref="/gaming"
      />
      <CategoryCard
        title="Computers & Gaming"
        items={[
          {
            label: 'Computers',
            href: '/gaming/consoles',
            image:
              'https://ik.imagekit.io/johnchrismaina/Card%20categories/alienware-unsplash%20(1).jpg',
          },
        ]}
        // itemWidth={150}
        // itemHeight={80}
        seeMoreHref="/gaming"
      />
      <CategoryCard
        title="Shop Fashion"
        items={[
          {
            label: 'Kitchen Essentials',
            href: '/gaming/consoles',
            image:
              'https://ik.imagekit.io/johnchrismaina/Home%20essentials/dada_design-aJDt_9OFXBQ-unsplash.jpg',
          },
          {
            label: 'Cleaning Supplies',
            href: '/gaming/accessories',
            image:
              'https://ik.imagekit.io/johnchrismaina/Home%20essentials/le-quan-zOsS4vz1Lbg-unsplash.jpg',
          },
          {
            label: 'Home Decor',
            href: '/gaming/pc',
            image:
              'https://ik.imagekit.io/johnchrismaina/Home%20essentials/le-quan-zOsS4vz1Lbg-unsplash.jpg',
          },
          {
            label: 'Bedding',
            href: '/gaming/vr',
            image:
              'https://ik.imagekit.io/johnchrismaina/Home%20essentials/lotus-design-n-print-8qNuR1lIv_k-unsplash.jpg',
          },
        ]}
        // itemWidth={200} // set width
        // itemHeight={60} // set height
        seeMoreHref="/gaming"
      />

      {/* Add more CategoryCard blocks here */}
    </div>
  );
}
