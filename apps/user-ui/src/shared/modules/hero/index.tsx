'use client';

import { Carousel } from '../../components/carousel';

const bannerImages = [
  {
    src: 'https://ik.imagekit.io/johnchrismaina/Images%20and%20Banners/71qcoYgEhzL._SX3000_.jpg?updatedAt=1783286369249',
    // src: 'https://ik.imagekit.io/johnchrismaina/Images%20and%20Banners/Homepage-Promo-Model-Y-L-Seats-Desktop-AU-NZ.png?updatedAt=1783850203759',
    // src: 'https://ik.imagekit.io/johnchrismaina/Images%20and%20Banners/d56f0c6b88f447dba2d307d2ba8d591c_718ad30fe844.avif?updatedAt=1784395763702',
    // src: 'https://ik.imagekit.io/johnchrismaina/Images%20and%20Banners/quaritsch-photography-bKOfm4KNt64-unsplash.jpg?updatedAt=1787420877171',

    alt: 'Green electric kettle',
  },
  {
    src: 'https://ik.imagekit.io/johnchrismaina/Images%20and%20Banners/61mRzX3wg9L._SX3000_.jpg?updatedAt=1771419784274',
    // src: 'https://ik.imagekit.io/johnchrismaina/Images%20and%20Banners/Homepage-Promo-Model-3-Desktop-US.png?updatedAt=1783850204820',
    // src: 'https://ik.imagekit.io/johnchrismaina/Images%20and%20Banners/62620f64e0024df6a8ebfe2c7c39f56c_44167d16d5ab.avif?updatedAt=1784395763979',
    // src: 'https://ik.imagekit.io/johnchrismaina/Images%20and%20Banners/istockphoto-1128687123-2048x2048.jpg?updatedAt=1783596671829',
    alt: 'Yellow toaster',
  },
  {
    src: 'https://ik.imagekit.io/johnchrismaina/Images%20and%20Banners/71ROLBmB4AL._SX3000_.jpg?updatedAt=1783286350355',
    // src: 'https://ik.imagekit.io/johnchrismaina/Images%20and%20Banners/Homepage-Promo-Model-Y-L-Family-Desktop-NA.png?updatedAt=1783850204653',
    // src: 'https://ik.imagekit.io/johnchrismaina/Images%20and%20Banners/f37eef55c7ff2b71922409f9687f2575_ed2e2fb39e0f.avif?updatedAt=1784395764509',
    // src: 'https://ik.imagekit.io/johnchrismaina/Images%20and%20Banners/C2603053_101_3_DT.webp?updatedAt=1784372588501',
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
