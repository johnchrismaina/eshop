// components/ImagePlaceholder.tsx
import React from 'react';

type ImagePlaceholderProps = {
  images: string[];
  index: number;
  small?: boolean;
  aspect?: 'square' | 'portrait';
  size?: string;
  pictureUploadingLoader?: boolean;
  setOpenImageModal?: (open: boolean) => void;
  //   setSelectedImage?: (index: number) => void;
  setSelectedImage?: (url: string) => void; // ✅ expects string now
  onImageChange?: (file: File | null, index: number) => void;
  onRemove?: (index: number) => void;
};

const ImagePlaceholderPreview: React.FC<ImagePlaceholderProps> = ({
  images,
  index,
  small = false,
  aspect = 'square',
  size,
  pictureUploadingLoader,
  setOpenImageModal,
  setSelectedImage,
  onImageChange,
  onRemove,
}) => {
  const imageUrl = images[index]; // ✅ pick the correct URL
  console.log('ImagePlaceholderPreview received images:', images);
  console.log('ImagePlaceholderPreview using imageUrl:', imageUrl);

  return (
    <div
      className={`relative ${
        small ? 'w-24 h-24' : 'w-full h-full'
      } rounded-md overflow-hidden`}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Preview"
          className="object-cover w-full h-full"
        />
      ) : (
        <div className="flex items-center justify-center bg-gray-100 text-gray-400">
          No image
        </div>
      )}

      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default ImagePlaceholderPreview;
