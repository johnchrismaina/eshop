'use client';

import { Carousel } from '../../components/carousel';

const bannerImages = [
  {
    src: 'https://ik.imagekit.io/johnchrismaina/Images%20and%20Banners/71ROLBmB4AL._SX3000_.jpg?updatedAt=1783286350355',
    // src: 'https://ik.imagekit.io/johnchrismaina/Images%20and%20Banners/pOFQGoc1cV2jO67ud24p913kFxFAKOnezchVOvif.jpg?updatedAt=1783167204143',
    // src: 'https://ik.imagekit.io/johnchrismaina/Images%20and%20Banners/pexels-robert-owen-wahl-98047099-11509918.jpg',
    // src: 'https://ik.imagekit.io/johnchrismaina/Images%20and%20Banners/pexels-yuslava-36897781.jpg?updatedAt=1783607543593',

    alt: 'Green electric kettle',
  },
  {
    src: 'https://ik.imagekit.io/johnchrismaina/Images%20and%20Banners/61mRzX3wg9L._SX3000_.jpg?updatedAt=1771419784274',
    // src: 'https://ik.imagekit.io/johnchrismaina/Images%20and%20Banners/nike-just-do-it.avif?updatedAt=1783611373913',
    // src: 'https://ik.imagekit.io/johnchrismaina/Images%20and%20Banners/istockphoto-1128687123-2048x2048.jpg?updatedAt=1783596671829',
    // src: 'https://ik.imagekit.io/johnchrismaina/Images%20and%20Banners/2026_06_1782452782-TTT19.webp?updatedAt=1783461452311',

    alt: 'Yellow toaster',
  },
  {
    src: 'https://ik.imagekit.io/johnchrismaina/Images%20and%20Banners/71qcoYgEhzL._SX3000_.jpg?updatedAt=1783286369249',
    // src: 'https://ik.imagekit.io/johnchrismaina/Images%20and%20Banners/rUIRHlLijQdSC46zb8uij0S0WYGEIclsD8oA8hG7.jpg',
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
