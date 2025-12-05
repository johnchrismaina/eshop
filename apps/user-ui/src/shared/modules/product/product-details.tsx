'use client';
import React, { useState } from 'react';
// import ReactImageMagnify from 'react-image-magnify';
import ReactImageMagnify from '@blacklab/react-image-magnify';

const ProductDetails = ({ productDetails }: { productDetails: any }) => {
  const [currentImage, setCurrentImage] = useState(
    productDetails?.images[0]?.url
  );
  return (
    <div className="w-full bg-[#f5f5f5] py-5">
      <div className="w-[90%] bg-white lg:w-[80%] mx-auto pt-6 grid grid-cols-1 lg:grid-cols-[28%_44%_28%] gap-6 overflow-hidden">
        {/* left column - product images */}
        <div className="p-4">
          <div className="relative w-full">
            {/* main image with zoom */}
            <ReactImageMagnify
              {...{
                smallImage: {
                  alt: 'product Image',
                  isFluidWidth: true,
                  src: currentImage || '',
                },
                largeImage: {
                  src: currentImage || '',
                  width: 1200,
                  height: 1200,
                },
                enlargedImageContainerDimensions: {
                  width: '150%',
                  height: '150%',
                },
                enlargedImageStyle: {
                  border: 'none',
                  boxShadow: 'none',
                },
                enlargedImagePosition: 'right',

                // ✅ Add these to satisfy TypeScript
                imageProps: {
                  src: currentImage,
                },
                magnifiedImageProps: {
                  src: currentImage,
                  width: 1200,
                  height: 1200,
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
