'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImagePreviewModalProps {
  images: string[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  getImageUrl: (img: string) => string;
  activeAspect: 'square' | 'portrait';
}

const ImagePreviewModal = ({
  images,
  currentIndex,
  onIndexChange,
  onClose,
  getImageUrl,
  activeAspect,
}: ImagePreviewModalProps) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(onClose, 150); // matches fade-scale-out duration
  }, [onClose]);

  const goPrev = useCallback(() => {
    onIndexChange(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  }, [currentIndex, images.length, onIndexChange]);

  const goNext = useCallback(() => {
    onIndexChange(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  }, [currentIndex, images.length, onIndexChange]);

  const aspectClass =
    activeAspect === 'square' ? 'aspect-square' : 'aspect-[3/4]';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClose, goPrev, goNext]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 bg-white flex px-4 ${
        isClosing ? 'animate-fade-scale-out' : 'animate-fade-scale-in'
      }`}
    >
      <button
        onClick={handleClose}
        className="absolute top-6 right-6 z-10 text-gray-700 hover:text-black transition-colors"
        aria-label="Close preview"
      >
        <X size={28} strokeWidth={1.5} />
      </button>

      {/* Thumbnail rail */}
      <div className="w-[110px] shrink-0 pt-[20px] pb-8 px-4 overflow-y-auto flex flex-col gap-3">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => onIndexChange(idx)}
            className={`relative w-full ${aspectClass} rounded-md overflow-hidden border transition-colors ${
              idx === currentIndex
                ? 'border-gray-800'
                : 'border-gray-200 hover:border-gray-400'
            }`}
          >
            <img
              src={getImageUrl(img)}
              alt={`Thumbnail ${idx + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Main image + nav */}
      <div className="flex-1 flex items-start justify-center relative px-16 pt-[20px]">
        {/* Back button */}
        <button
          onClick={goPrev}
          className="absolute left-52 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Previous image"
        >
          <ChevronLeft size={30} strokeWidth={1.5} />
        </button>

        <div className={`relative h-[95vh] ${aspectClass}`}>
          <Image
            src={getImageUrl(images[currentIndex])}
            alt="Product preview"
            fill
            className="object-contain"
            sizes="600px"
            priority
          />
        </div>

        {/* Forward button */}
        <button
          onClick={goNext}
          className="absolute right-52 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Next image"
        >
          <ChevronRight size={30} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
};

export default ImagePreviewModal;
