import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import PauseIcon from 'apps/user-ui/src/assets/svgs/pause-icon';

type CarouselItem = {
  src: string;
  alt: string;
};

type CarouselProps = {
  data: CarouselItem[];
};

export const Carousel: React.FC<CarouselProps> = ({ data }) => {
  const [slide, setSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false); // 👈 new state

  const nextSlide = () => {
    setSlide(slide === data.length - 1 ? 0 : slide + 1);
  };

  const prevSlide = () => {
    setSlide(slide === 0 ? data.length - 1 : slide - 1);
  };

  useEffect(() => {
    if (isPaused) return; // 👈 skip interval if paused
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [slide, isPaused]);

  return (
    <div className="relative flex justify-center items-center w-full bg-transparent px-0 h-[38vh] overflow-hidden">
      {data.map((item, idx) => (
        <img
          src={item.src}
          alt={item.alt}
          key={idx}
          className={`w-full h-full object-top object-cover transition-opacity duration-1000 rounded-lg ${
            slide === idx ? 'opacity-100 ring-1 ' : 'opacity-0 absolute ring-1 '
          }`}
        />
      ))}

      {/* The Dark Overlay */}
      {/* <div className="absolute inset-0 bg-black bg-opacity-5 z-10"></div> */}

      <div className="absolute bottom-4 right-6 flex items-center justify-center gap-2">
        {/* Pause/Play button */}
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="  bg-gray-800/40 flex items-center justify-center w-9 h-9 rounded-full text-gray-700 z-10 hover:bg-gray-800/60 transition-colors duration-300"
        >
          {isPaused ? (
            <Play size={14} color="#fff" fill="#fff" />
          ) : (
            // <Pause size={18} color="#1F2937B3" fill="#fff" />
            <PauseIcon size={20} color="#fff" />
          )}
        </button>

        <ChevronLeft
          onClick={prevSlide}
          className="p-1.5 rounded-full text-gray-700 w-8 h-8 bg-white/60 hover:bg-white/90 transition-colors duration-300 drop-shadow-lg cursor-pointer z-10"
        />

        <ChevronRight
          onClick={nextSlide}
          className="p-1.5 rounded-full text-gray-700 w-8 h-8 bg-white/60 hover:bg-white/90 transition-colors duration-300 drop-shadow-lg cursor-pointer z-20 "
        />
      </div>

      <span className="flex absolute bottom-4 space-x-2">
        {data.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setSlide(idx)}
            className={`h-2 w-2 rounded-full ring-transparent ring-[#f5f5f5] ${
              slide === idx ? 'bg-white' : 'bg-transparent'
            }`}
          ></button>
        ))}
      </span>
    </div>
  );
};
