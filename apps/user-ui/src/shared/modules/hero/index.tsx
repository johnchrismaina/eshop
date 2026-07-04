'use client';

import { Carousel } from '../../components/carousel';

const bannerImages = [
  {
    src: 'https://ik.imagekit.io/johnchrismaina/Images%20and%20Banners/61mRzX3wg9L._SX3000_.jpg?updatedAt=1771419784274',
    alt: 'Green electric kettle',
  },
  {
    src: 'https://ik.imagekit.io/johnchrismaina/Images%20and%20Banners/61uMN8JVocL._SX3000_.jpg?updatedAt=1771419784532',
    alt: 'Yellow toaster',
  },
  {
    src: 'https://ik.imagekit.io/johnchrismaina/Images%20and%20Banners/71spMfddxoL._SX3000_.jpg?updatedAt=1771419784535',
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
