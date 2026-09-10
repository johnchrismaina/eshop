import { useEffect, useState } from 'react';
import { useForm, UseFormSetValue } from 'react-hook-form';
import type { FormValues } from '../ProductForm'; // adjust path
import ImagePlaceholder from 'apps/seller-ui/src/shared/components/image-placeholder';
import { Info, Plus, X } from 'lucide-react';
import AutoResizeTextarea from 'packages/components/AutoResizeTextArea';
import axiosProduct from 'apps/seller-ui/src/utils/axiosProduct';
import toast from 'react-hot-toast';

interface UploadedImage {
  fileId: string;
  file_url: string;
}

type VariantImage = {
  fileId: string;
  file_url: string;
};

type ColorVariant = {
  name: string;
  title: string;
  price: number;
  // images: (UploadedImage | null)[];
  images: (VariantImage | null)[]; // ✅ always objects with file_url
  isDefault: boolean;
};

interface ColorVariantsEditorProps {
  aspect: 'square' | 'portrait'; // ✅ passed from parent form
  onHasColorsChange?: (hasColors: boolean) => void; // ✅ notify parent to disable main images
  setValue: UseFormSetValue<FormValues>; // ✅ sync with parent form
  productTitle: string; // ✅ new
  variants: FormValues['colorVariants'];
}

const ColorVariantsEditor: React.FC<ColorVariantsEditorProps> = ({
  setValue,
  aspect,
  onHasColorsChange,
  productTitle,
  variants,
}) => {
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
    const newVariants = [
      ...variants,
      {
        name: '',
        title: '',
        price: 0,
        images: Array(8).fill(null),
        isDefault: false,
      },
    ];
    // setVariants(newVariants);
    setValue('colorVariants', newVariants, { shouldValidate: true });
    onHasColorsChange?.(true); // disable main images when variants exist
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
  const deleteVariant = (index: number) => {
    const updated = variants.filter((_, i) => i !== index);
    // setVariants(updated);
    setValue('colorVariants', updated, { shouldValidate: true });
    if (updated.length === 0) {
      onHasColorsChange?.(false); // re-enable main images when no variants
    }
  };

  // ✅ Reset all variants
  // const resetVariants = () => {
  //   setValue('colorVariants', [], { shouldValidate: true });
  //   localStorage.removeItem(draftKey);
  //   onHasColorsChange?.(false);
  // };

  useEffect(() => {
    if (!variants || variants.length === 0) {
      onHasColorsChange?.(false);
    } else {
      onHasColorsChange?.(true);
    }
  }, [variants, onHasColorsChange]);

  return (
    <div className="w-full space-y-2 rounded-sm px-6 py-4 bg-white">
      <h2 className="font-bold">Color Variants</h2>

      {variants.map((variant, vIndex) => (
        <div key={vIndex} className="border p-3 rounded-md space-y-3 relative">
          {/* Delete button */}
          <button
            type="button"
            onClick={() => deleteVariant(vIndex)}
            className="absolute top-2 right-2 text-red-600 p-2 bg-gray-100 hover:bg-gray-200 rounded-md"
            aria-label="Delete variant"
          >
            <X />
          </button>

          <div className="flex flex-col items-start justify-center space-y-2 ">
            {/* Color name */}
            <div className="w-full flex items-center gap-3">
              <p className="flex items-start justify-center gap-1 text-gray-600">
                <label className="block shrink-0 text-[15px] font-bold text-gray-800 mb-0">
                  Color Name *
                </label>
                <span>
                  <Info size={16} />
                </span>
              </p>
              <input
                type="text"
                placeholder="Color name"
                value={variant.name}
                onChange={(e) => updateVariant(vIndex, 'name', e.target.value)}
                className="px-6 py-1 border border-gray-300 rounded-md"
              />
            </div>

            {/* Main title */}
            <div className="w-full flex items-center gap-3 pt-2 ">
              <p className="flex items-start justify-center gap-1 text-gray-600">
                <label className="block shrink-0 text-[15px] font-bold text-gray-800 mb-0">
                  Main title
                </label>
                <span>
                  <Info size={16} />
                </span>
              </p>
              <span className="truncate w-full flex-1 text-sm text-yellow-950 px-3 py-2 border border-gray-100 bg-yellow-100 rounded-md">
                {productTitle || 'No title yet'}
              </span>
            </div>

            {/* Duplicate product title with insert button */}
            <div className="flex items-center gap-3 pt-2 text-sm text-gray-600">
              <p className="flex items-start justify-center gap-1 text-gray-600">
                <label className="block shrink-0 text-[15px] font-bold text-gray-800 mb-0">
                  Get Main title
                </label>
                <span>
                  <Info size={16} />
                </span>
              </p>
              <button
                type="button"
                onClick={() => updateVariant(vIndex, 'title', productTitle)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg"
                aria-label="Insert product title"
              >
                <Plus /> Insert title
              </button>
            </div>

            {/* Custom Title */}
            <div className="w-full flex items-start gap-3 pt-2">
              <p className="flex items-start justify-center gap-1 text-gray-600">
                <label className="block shrink-0 text-[15px] font-bold text-gray-800 mb-0">
                  Custom Title *
                </label>
                <span>
                  <Info size={16} />
                </span>
              </p>
              <div className="flex-1">
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

          {/* Color Variant Image Grid */}
          <div className="grid grid-cols-4 gap-3">
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
                    setVariantUploading((prev) => ({ ...prev, [key]: true }));
                    await handleVariantImageUpload(vIndex, i, file);
                    setVariantUploading((prev) => ({ ...prev, [key]: false }));
                  }}
                  onRemove={() => handleVariantImageUpload(vIndex, i, null)}
                  setOpenPreviewModal={setOpenVariantPreviewModal}
                  setSelectedPreviewImage={setVariantPreviewImage}
                />
              );
            })}
          </div>

          {/* Default toggle */}
          <label className="flex items-center gap-2 font-semibold mt-2">
            <input
              type="radio"
              name="defaultColor"
              checked={variant.isDefault}
              onChange={() => setAsDefault(vIndex)}
              className="size-4"
            />
            Set as default
          </label>
        </div>
      ))}

      <div className="flex items-center justify-start pt-2 gap-6">
        <button
          type="button"
          onClick={addVariant}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          + Add Color Swatch
        </button>

        <button
          type="button"
          // onClick={resetVariants}
          className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
        >
          Reset Variants
        </button>
      </div>

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
  );
};

export default ColorVariantsEditor;
