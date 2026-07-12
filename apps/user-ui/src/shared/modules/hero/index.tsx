'use client';

import { Carousel } from '../../components/carousel';

const bannerImages = [
  {
    // src: 'https://ik.imagekit.io/johnchrismaina/Images%20and%20Banners/71qcoYgEhzL._SX3000_.jpg?updatedAt=1783286369249',
    src: 'https://ik.imagekit.io/johnchrismaina/Images%20and%20Banners/Homepage-Promo-Model-Y-L-Seats-Desktop-AU-NZ.png?updatedAt=1783850203759',
    // src: 'https://ik.imagekit.io/johnchrismaina/Images%20and%20Banners/pexels-yaroslav-shuraev-8851929.jpg?updatedAt=1783596671075',
    alt: 'Green electric kettle',
  },
  {
    // src: 'https://ik.imagekit.io/johnchrismaina/Images%20and%20Banners/61mRzX3wg9L._SX3000_.jpg?updatedAt=1771419784274',
    src: 'https://ik.imagekit.io/johnchrismaina/Images%20and%20Banners/Homepage-Promo-Model-3-Desktop-US.png?updatedAt=1783850204820',
    alt: 'Yellow toaster',
  },
  {
    // src: 'https://ik.imagekit.io/johnchrismaina/Images%20and%20Banners/71ROLBmB4AL._SX3000_.jpg?updatedAt=1783286350355',
    src: 'https://ik.imagekit.io/johnchrismaina/Images%20and%20Banners/Homepage-Promo-Model-Y-L-Family-Desktop-NA.png?updatedAt=1783850204653',
    alt: 'White cooking pot',
  },
  // { src: '/images/bottle.png', alt: 'Green bottle' },
  // { src: '/images/nescafe.png', alt: 'Nescafé coffee' },
];

const Hero = () => {
  return (
    <div className="w-full">
      <Carousel data={bannerImages} />
    </div>
  );
};

export default Hero;
