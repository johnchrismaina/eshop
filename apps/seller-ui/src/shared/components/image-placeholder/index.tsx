import { Pencil, Eye, Plus, Trash2, WandSparkles, X } from 'lucide-react';
import Image from 'next/image';
import Spinner from 'packages/components/spinner';
import React, { useState, useEffect } from 'react';

interface UploadedImage {
  fileId: string;
  file_url: string;
}

const ImagePlaceholder = ({
  aspect,
  pictureUploadingLoader,
  image,
  index,
  onImageChange,
  onRemove,
  setOpenPreviewModal, // ✅ new prop
  setSelectedPreviewImage, // ✅ new prop
}: // setOpenImageModal,
// setSelectedImage,
{
  aspect: 'square' | 'portrait';
  pictureUploadingLoader: boolean;
  image: UploadedImage | null;
  index: number;
  onImageChange: (file: File | null, index: number) => void;
  onRemove: (index: number) => void;
  setOpenPreviewModal: (open: boolean) => void;
  setSelectedPreviewImage: (url: string) => void;
  // setOpenImageModal: (open: boolean) => void;
  // setSelectedImage: (url: string) => void;
}) => {
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const preview = image?.file_url ?? localPreview;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLocalPreview(URL.createObjectURL(file));
      onImageChange(file, index);
    }
  };

  return (
    <div
      className={`relative bg-gray-200 border rounded-lg flex items-center justify-center cursor-pointer
        ${aspect === 'square' ? 'aspect-square' : 'aspect-[3/4]'}
      `}
    >
      <input
        type="file"
        accept="image/*"
        className="hidden"
        id={`image-upload-${index}`}
        onChange={handleFileChange}
      />

      {preview ? (
        <>
          <img
            src={preview}
            alt="uploaded"
            className="w-full h-full object-cover rounded-lg"
          />

          {/* Action buttons */}
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="p-2 bg-red-600 text-white rounded shadow"
            >
              <Trash2 size={16} />
            </button>
            <label
              htmlFor={`image-upload-${index}`}
              className="p-2 bg-slate-700 text-white rounded shadow cursor-pointer"
            >
              <Pencil size={16} />
            </label>
            <button
              type="button"
              onClick={() => {
                setSelectedPreviewImage(preview); // ✅ set image
                setOpenPreviewModal(true); // ✅ open modal
              }}
              className="p-2 bg-blue-500 text-white rounded shadow"
            >
              <Eye size={16} />
            </button>
          </div>

          {/* Upload animation */}
          {pictureUploadingLoader && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 animate-pulse">
              <Spinner size={18} />
            </div>
          )}
        </>
      ) : (
        <label
          htmlFor={`image-upload-${index}`}
          className="flex flex-col items-center justify-center w-full h-full text-gray-500"
        >
          <Plus size={24} />
          <span className="text-xs">Upload</span>
        </label>
      )}
    </div>
  );
};

export default ImagePlaceholder;
