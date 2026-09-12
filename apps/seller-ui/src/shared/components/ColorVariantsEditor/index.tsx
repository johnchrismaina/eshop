import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { UseFormSetValue } from 'react-hook-form';
import type { FormValues } from '../ProductForm'; // adjust path
import { ColorVariant } from '../ProductForm'; // adjust path
import ImagePlaceholder from 'apps/seller-ui/src/shared/components/image-placeholder';
import { ClipboardPaste, Info, Plus, RotateCcw, X } from 'lucide-react';
import AutoResizeTextarea from 'packages/components/AutoResizeTextArea';
import axiosProduct from 'apps/seller-ui/src/utils/axiosProduct';
import toast from 'react-hot-toast';

export interface ColorVariantsEditorHandle {
  addVariant: () => void;
  resetVariants: () => void;
}

interface UploadedImage {
  fileId: string;
  file_url: string;
}

type VariantImage = {
  fileId: string;
  file_url: string;
};

// type ColorVariant = {
//   name: string;
//   title: string;
//   price: number;
//   images: (VariantImage | null)[]; // ✅ always objects with file_url
//   isDefault: boolean;
// };

// Define what the ref exposes — this is the "public API" the parent can call
export interface ColorVariantsEditorHandle {
  addVariant: () => void;
  resetVariants: () => void;
}

interface ColorVariantsEditorProps {
  aspect: 'square' | 'portrait'; // ✅ passed from parent form
  onHasColorsChange?: (hasColors: boolean) => void; // ✅ notify parent to disable main images
  setValue: UseFormSetValue<FormValues>; // ✅ sync with parent form
  productTitle: string; // ✅ new
  variants: FormValues['colorVariants'];
}

const ColorVariantsEditor = forwardRef<
  ColorVariantsEditorHandle,
  ColorVariantsEditorProps
>(function ColorVariantsEditor(
  { aspect, onHasColorsChange, setValue, productTitle, variants },
  ref
) {
  // const [variants, setVariants] = useState<ColorVariant[]>([]);
  const [variantUploading, setVariantUploading] = useState<
    Record<string, boolean>
  >({});
  const [variantPreviewImage, setVariantPreviewImage] = useState<string | null>(
    null
  );
  const [openVariantPreviewModal, setOpenVariantPreviewModal] = useState(false);

  // ✅ Add new variant
  const addVariant = () => {
    const newVariant: ColorVariant = {
      id: crypto.randomUUID(),
      name: '',
      title: '',
      price: 0,
      images: Array(8).fill(null),
      isDefault: variants.length === 0,
    };

    setValue('colorVariants', [...variants, newVariant], {
      shouldValidate: true,
    });
    onHasColorsChange?.(true);
  };

  // ✅ Update a specific field in a variant
  const updateVariant = <K extends keyof ColorVariant>(
    index: number,
    field: K,
    value: ColorVariant[K]
  ) => {
    const updated = [...variants];
    // updated[index][field] = value;
    // setVariants(updated);
    updated[index] = { ...updated[index], [field]: value };
    setValue('colorVariants', updated, { shouldValidate: true });
  };

  // ✅ Handle image upload/remove for a specific variant slot
  const handleVariantImageUpload = async (
    variantIndex: number,
    imageIndex: number,
    file: File | null
  ) => {
    const updated = [...variants];

    if (file) {
      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await axiosProduct.post(
          '/upload-variant-image',
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        );

        updated[variantIndex].images[imageIndex] = {
          fileId: response.data.fileId,
          file_url: response.data.file_url, // ✅ permanent ImageKit URL
        };
      } catch (error) {
        toast.error('Variant image upload failed');
        return;
      }
    } else {
      updated[variantIndex].images[imageIndex] = null;
    }

    // setVariants(updated);
    setValue('colorVariants', updated, { shouldValidate: true });
  };

  // ✅ Set one variant as default
  const setAsDefault = (index: number) => {
    const updated = variants.map((v, i) => ({
      ...v,
      isDefault: i === index,
    }));
    // setVariants(updated);
    setValue('colorVariants', updated, { shouldValidate: true });
  };

  // ✅ Delete variant
  const deleteVariant = (vIndex: number) => {
    const newVariants = variants.filter((_, i) => i !== vIndex);
    setValue('colorVariants', newVariants, { shouldValidate: true });
    onHasColorsChange?.(newVariants.length > 0);
  };

  // ✅ Reset all variants
  const resetVariants = () => {
    setValue('colorVariants', [], { shouldValidate: true });
    onHasColorsChange?.(false);
  };

  useImperativeHandle(ref, () => ({ addVariant, resetVariants }));

  useEffect(() => {
    if (!variants || variants.length === 0) {
      onHasColorsChange?.(false);
    } else {
      onHasColorsChange?.(true);
    }
  }, [variants, onHasColorsChange]);

  return (
    <div className="w-full space-y-2 rounded-lg  ">
      {/* <h2 className="font-bold">Color Variants</h2> */}
      {variants.map((variant, vIndex) => (
        <div
          key={variant.id ?? vIndex}
          className="p-4 space-y-3 relative border border-gray-200 rounded-lg"
        >
          {/* Delete button */}
          <button
            type="button"
            onClick={() => deleteVariant(vIndex)}
            className="absolute top-6 right-4 text-gray-700 p-1.5 hover:bg-gray-200 rounded-md transition-all duration-150"
            aria-label="Delete variant"
          >
            <X strokeWidth={1.5} />
          </button>

          <div className="flex items-center justify-start mt-0 ">
            <span className="font-bold">Color Swatch </span>
          </div>

          {/* Color Variant Image Grid */}
          <div className="grid grid-cols-4 gap-3 ">
            {Array.from({ length: 8 }).map((_, i) => {
              const key = `${vIndex}-${i}`;
              const imgObj = variant.images[i]; // ✅ object with fileId + file_url or null
              return (
                <ImagePlaceholder
                  key={i}
                  idPrefix={`variant-${vIndex}`}
                  index={i}
                  aspect={aspect}
                  pictureUploadingLoader={variantUploading[key] ?? false}
                  image={imgObj} // ✅ pass the object directly
                  onImageChange={async (file) => {
                    setVariantUploading((prev) => ({
                      ...prev,
                      [key]: true,
                    }));
                    await handleVariantImageUpload(vIndex, i, file);
                    setVariantUploading((prev) => ({
                      ...prev,
                      [key]: false,
                    }));
                  }}
                  onRemove={() => handleVariantImageUpload(vIndex, i, null)}
                  setOpenPreviewModal={setOpenVariantPreviewModal}
                  setSelectedPreviewImage={setVariantPreviewImage}
                />
              );
            })}
          </div>

          <div className="flex flex-col items-end justify-center space-y-2 pt-2 ">
            {/* Color name */}

            <div className="w-full flex items-center justify-end gap-3">
              <p className="flex items-start justify-center gap-1 text-gray-600">
                <label className="block shrink-0 text-[15px] font-bold text-gray-800 mb-0">
                  Color Name *
                </label>
                <span>
                  <Info size={16} />
                </span>
              </p>
              <div className="w-[780px] flex items-center justify-start">
                <input
                  type="text"
                  placeholder="Color name"
                  value={variant.name}
                  onChange={(e) =>
                    updateVariant(vIndex, 'name', e.target.value)
                  }
                  className="px-6 py-1 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            {/* Main title */}
            <div className="w-full flex items-center justify-end gap-3 pt-2 ">
              <p className="flex items-start justify-center gap-1 text-gray-600">
                <label className="block shrink-0 text-[15px] font-bold text-gray-800 mb-0">
                  Main title
                </label>
                <span>
                  <Info size={16} />
                </span>
              </p>
              <div className="w-[780px] flex items-start justify-start">
                <span className="truncate w-full flex-1 text-sm text-yellow-950 px-3 py-2 border border-gray-100 bg-yellow-100 rounded-md">
                  {productTitle || 'No title yet'}
                </span>
              </div>
            </div>

            {/* Duplicate product title with insert button */}
            <div className="w-full flex items-center justify-end gap-3 pt-2 text-sm text-gray-600">
              <p className="flex items-start justify-center gap-1 text-gray-600">
                <label className="block shrink-0 text-[15px] font-bold text-gray-800 mb-0">
                  Get Main title
                </label>
                <span>
                  <Info size={16} />
                </span>
              </p>
              <div className="w-[780px] flex items-center justify-start">
                <button
                  type="button"
                  onClick={() => updateVariant(vIndex, 'title', productTitle)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md"
                  aria-label="Insert product title"
                >
                  <ClipboardPaste size={16} /> Insert title
                </button>
              </div>
            </div>

            {/* Custom Title */}
            <div className="w-full flex items-start justify-end gap-3 pt-2">
              <p className="flex items-start justify-center gap-1 text-gray-600">
                <label className="block shrink-0 text-[15px] font-bold text-gray-800 mb-0">
                  Custom Title *
                </label>
                <span>
                  <Info size={16} />
                </span>
              </p>
              <div className="w-[780px]">
                <AutoResizeTextarea
                  label=""
                  rows={2}
                  placeholder="Enter Custom title or Copy and customize the Main title"
                  // value={variant.title}
                  // onChange={(e) => updateVariant(vIndex, 'title', e.target.value)}
                  value={variant.title}
                  onChange={(e) =>
                    updateVariant(vIndex, 'title', e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          {/* Default toggle */}
          <label className="w-[200px] flex items-center gap-2 font-semibold mt-2 px-4 py-2 border border-gray-400 rounded-md">
            <input
              type="radio"
              name="defaultColor"
              checked={variant.isDefault}
              onChange={() => setAsDefault(vIndex)}
              className="size-4"
            />
            Set as default
          </label>

          {/* Bottom "add" button — same action as the top-bar one, closer to where sellers are working */}
          <div className="flex items-center justify-start gap-4 pt-2 pb-2">
            <button
              type="button"
              onClick={addVariant}
              className="flex items-center gap-2 px-4 py-2 rounded-md font-medium bg-blue-600 hover:bg-blue-700 text-white transition"
            >
              <Plus size={16} /> Add Color Swatch
            </button>

            <button
              type="button"
              onClick={resetVariants}
              className="flex items-center gap-1 px-4 py-2 rounded-md font-medium bg-gray-800 hover:bg-gray-700 text-white transition"
            >
              <RotateCcw size={14} /> Reset Variants
            </button>
          </div>

          {/* <hr className="border-t border-slate-400 pb-6" /> */}

          {/* Variant preview modal */}
          {openVariantPreviewModal && variantPreviewImage && (
            <div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-hidden"
              style={{ overscrollBehavior: 'contain' }}
            >
              <button
                className="absolute top-4 right-6 bg-[#f6f6f6] hover:bg-red-100 text-gray-800 p-2 rounded-lg transition-all duration-150"
                onClick={() => setOpenVariantPreviewModal(false)}
                aria-label="Close preview"
              >
                <X />
              </button>
              <div
                className={`relative bg-white p-4 rounded-lg shadow-lg overflow-hidden ${
                  aspect === 'square'
                    ? 'aspect-square w-[500px]'
                    : 'aspect-[3/4] w-[500px]'
                }`}
              >
                <img
                  src={variantPreviewImage} // ✅ permanent ImageKit URL
                  alt="Preview"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
});

export default ColorVariantsEditor;
