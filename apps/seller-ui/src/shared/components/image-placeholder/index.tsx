import { Pencil, Eye, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Spinner from 'packages/components/spinner';
import React, { useState, useEffect } from 'react';

interface UploadedImage {
  fileId: string;
  file_url: string;
}

interface ImagePlaceholderProps {
  aspect: 'square' | 'portrait';
  pictureUploadingLoader: boolean;
  image: UploadedImage | null;
  index: number;
  onImageChange: (file: File | null, index: number) => void;
  onRemove: (index: number) => void;
  setOpenPreviewModal: (open: boolean) => void;
  setSelectedPreviewImage: (url: string) => void;
  className?: string; // optional extra styling
}

const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
  aspect,
  pictureUploadingLoader,
  image,
  index,
  onImageChange,
  onRemove,
  setOpenPreviewModal,
  setSelectedPreviewImage,
  className,
}) => {
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [visible, setVisible] = useState(false);

  const preview = image?.file_url ?? localPreview;

  // Flip visibility only when a valid preview exists
  useEffect(() => {
    if (preview) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [preview]);

  // Cleanup blob when slot resets
  useEffect(() => {
    if (!image && localPreview) {
      URL.revokeObjectURL(localPreview);
      setLocalPreview(null);
    }
  }, [image]);

  const handleFileChange = (file: File | null) => {
    if (file) {
      if (localPreview) {
        URL.revokeObjectURL(localPreview);
      }
      const newPreview = URL.createObjectURL(file);
      setLocalPreview(newPreview);
      onImageChange(file, index);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    handleFileChange(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0] ?? null;
    handleFileChange(file);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      className={`relative border rounded-lg flex items-center justify-center cursor-pointer
        ${aspect === 'square' ? 'aspect-square' : 'aspect-[3/4]'}
        ${dragActive ? 'border-blue-500 bg-blue-50' : 'bg-gray-200'}
        ${className ?? ''}
      `}
    >
      <input
        type="file"
        accept="image/*"
        className="hidden"
        id={`image-upload-${index}`}
        onChange={handleInputChange}
      />

      {preview ? (
        <>
          <img
            src={preview}
            alt="uploaded"
            className={`w-full h-full object-cover rounded-lg transition-opacity duration-300 ease-in-out ${
              visible ? 'opacity-100' : 'opacity-0'
            }`}
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
              className="p-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded shadow cursor-pointer"
            >
              <Pencil size={16} />
            </label>

            <button
              type="button"
              onClick={() => {
                setSelectedPreviewImage(preview);
                setOpenPreviewModal(true);
              }}
              className="p-2 bg-blue-500/50 hover:bg-blue-500 text-white rounded shadow"
            >
              <Eye size={16} />
            </button>
          </div>

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
          <span className="text-xs">
            {dragActive ? 'Drop image here' : 'Upload or Drag Here'}
          </span>
        </label>
      )}
    </div>
  );
};

export default ImagePlaceholder;
