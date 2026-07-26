import { Pencil, WandSparkles, X } from 'lucide-react';
import Image from 'next/image';
import Spinner from 'packages/components/spinner';
import React, { useState, useEffect } from 'react';

interface UploadedImage {
  fileId: string;
  file_url: string;
}

const ImagePlaceholder = ({
  size,
  small,
  aspect = 'square',
  onImageChange,
  pictureUploadingLoader,
  onRemove,
  defaultImage = null,
  index,
  setSelectedImage,
  setOpenImageModal,
  images,
}: {
  size: string;
  small?: boolean;
  aspect?: 'square' | 'portrait';
  pictureUploadingLoader: boolean;
  onImageChange: (file: File | null, index: number) => void;
  onRemove?: (index: number) => void;
  defaultImage?: string | null;
  setSelectedImage: (e: string) => void;
  images: (UploadedImage | null)[];
  setOpenImageModal: (openImageModal: boolean) => void;
  index: number;
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(defaultImage);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      onImageChange(file, index);
    }
  };

  // Sync main preview with first uploaded image
  useEffect(() => {
    if (index === 0 && images && images[0] && images[0].file_url) {
      setSelectedImage(images[0].file_url);
    }
  }, [images, index, setSelectedImage]);

  return (
    <div
      className={`relative w-full cursor-pointer bg-gray-200 border rounded-none flex flex-col justify-center items-center
        ${aspect === 'square' ? 'aspect-square' : 'aspect-[3/4]'}
      `}
      onMouseEnter={() => {
        if (imagePreview) setSelectedImage(imagePreview);
      }}
    >
      <input
        type="file"
        accept="image/*"
        className="hidden"
        id={`image-upload-${index}`}
        onChange={handleFileChange}
      />

      {imagePreview ? (
        <>
          <div className="absolute top-3 right-3 flex gap-2 z-10">
            {/* Remove button */}
            <button
              type="button"
              disabled={pictureUploadingLoader}
              onClick={() => onRemove?.(index)}
              className="p-2 !rounded bg-red-600 shadow-lg"
            >
              <X size={16} />
            </button>

            {/* Edit / Magic button */}
            <button
              type="button"
              disabled={pictureUploadingLoader}
              className="p-2 !rounded bg-blue-500 shadow-lg cursor-pointer"
              onClick={() => {
                setOpenImageModal(true);
                if (images[index]) {
                  setSelectedImage(images[index]!.file_url);
                }
              }}
            >
              <WandSparkles size={16} />
            </button>

            {/* ✅ Pencil always visible on main preview (index === 0) */}
            {index === 0 && (
              <label
                htmlFor={`image-upload-${index}`}
                className="p-2 !rounded bg-slate-700 text-gray-100 shadow-lg cursor-pointer"
              >
                <Pencil size={16} />
              </label>
            )}
          </div>

          <Image
            width={400}
            height={300}
            src={imagePreview}
            alt="uploaded"
            className="w-full h-full object-cover rounded-lg transition-all duration-300"
          />

          {/* Upload animation overlay */}
          {pictureUploadingLoader && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 animate-pulse">
              {/* <span className="text-white text-sm">Uploading...</span> */}
              <Spinner size={18} />
            </div>
          )}
        </>
      ) : (
        <label
          htmlFor={`image-upload-${index}`}
          className="absolute top-3 right-3 p-2 !rounded bg-slate-700 text-gray-100 shadow-lg cursor-pointer"
        >
          <Pencil size={16} />
        </label>
      )}

      {!imagePreview && (
        <p
          className={`text-gray-600 ${
            small ? 'text-lg' : 'text-xl'
          } font-semibold`}
        >
          {size}
        </p>
      )}
    </div>
  );
};

export default ImagePlaceholder;
