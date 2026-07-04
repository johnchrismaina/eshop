import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// ✅ Type goes here
type CarouselItem = {
  src: string;
  alt: string;
};

type CarouselProps = {
  data: CarouselItem[];
};

export const Carousel: React.FC<CarouselProps> = ({ data }) => {
  const [slide, setSlide] = useState(0);

  const nextSlide = () => {
    setSlide(slide === data.length - 1 ? 0 : slide + 1);
  };

  const prevSlide = () => {
    setSlide(slide === 0 ? data.length - 1 : slide - 1);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [slide]);

  return (
    <div className="relative flex justify-center items-center w-full h-[40vh] overflow-hidden">
      <ChevronLeft
        onClick={prevSlide}
        className="absolute left-4 text-gray-200 w-16 h-16 drop-shadow-lg cursor-pointer z-10"
      />

      {data.map((item, idx) => (
        <img
          src={item.src}
          alt={item.alt}
          key={idx}
          className={`rounded-md shadow-md w-full h-full object-top object-cover transition-opacity duration-700 ${
            slide === idx ? 'opacity-100' : 'opacity-0 absolute'
          }`}
        />
      ))}

      <ChevronRight
        onClick={nextSlide}
        className="absolute right-4 text-gray-200 w-16 h-16 drop-shadow-lg cursor-pointer z-10"
      />

      <span className="flex absolute bottom-4 space-x-2">
        {data.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setSlide(idx)}
            className={`h-2 w-2 rounded-full shadow-md ${
              slide === idx ? 'bg-white' : 'bg-gray-400'
            }`}
          ></button>
        ))}
      </span>
    </div>
  );
};
