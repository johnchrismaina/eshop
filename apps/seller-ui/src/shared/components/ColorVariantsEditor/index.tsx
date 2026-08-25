import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import ImagePlaceholder from 'apps/seller-ui/src/shared/components/image-placeholder';
import { X } from 'lucide-react';
import AutoResizeTextarea from 'packages/components/AutoResizeTextArea';

interface UploadedImage {
  fileId: string;
  file_url: string;
}

type ColorVariant = {
  name: string;
  hex: string;
  title: string;
  price: number;
  images: (UploadedImage | null)[];
  isDefault: boolean;
};

interface Props {
  onHasColorsChange?: (hasColors: boolean) => void; // ✅ notify parent
}

export default function ColorVariantsEditor({ onHasColorsChange }: Props) {
  const [variants, setVariants] = useState<ColorVariant[]>([]);
  const [variantUploading, setVariantUploading] = useState<
    Record<string, boolean>
  >({});

  // Variant images preview state
  const [variantPreviewImage, setVariantPreviewImage] = useState<string | null>(
    null
  );
  const [openVariantPreviewModal, setOpenVariantPreviewModal] = useState(false);

  //  const [openPreviewModal, setOpenPreviewModal] = useState(false);
  // const [selectedPreviewImage, setSelectedPreviewImage] = useState<
  //   string | null
  // >(null);

  // ✅ Hook form setup
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data: any) => {
    console.log('Form data:', data);
    console.log('Variants:', variants);
  };

  // Add new variant
  const addVariant = () => {
    const newVariants = [
      ...variants,
      {
        name: '',
        hex: '#000000',
        title: '',
        price: 0,
        images: Array(8).fill(null),
        isDefault: false,
      },
    ];
    setVariants(newVariants);
    onHasColorsChange?.(true); // ✅ disable main images
  };

  // Update field
  const updateVariant = <K extends keyof ColorVariant>(
    index: number,
    field: K,
    value: ColorVariant[K]
  ) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  // Handle image upload
  const handleVariantImageUpload = (
    variantIndex: number,
    imageIndex: number,
    file: File | null
  ) => {
    const updated = [...variants];
    updated[variantIndex].images[imageIndex] = file
      ? { fileId: crypto.randomUUID(), file_url: URL.createObjectURL(file) }
      : null;
    setVariants(updated);
  };

  // Handle image upload
  const handleImageUpload = (
    variantIndex: number,
    imageIndex: number,
    file: File | null
  ) => {
    const updated = [...variants];
    if (file) {
      updated[variantIndex].images[imageIndex] = {
        fileId: crypto.randomUUID(),
        file_url: URL.createObjectURL(file),
      };
    } else {
      updated[variantIndex].images[imageIndex] = null;
    }
    setVariants(updated);
  };

  // Set default
  const setAsDefault = (index: number) => {
    const updated = variants.map((v, i) => ({
      ...v,
      isDefault: i === index,
    }));
    setVariants(updated);
  };

  // ✅ Delete variant + reset logic
  const deleteVariant = (index: number) => {
    const updated = variants.filter((_, i) => i !== index);
    setVariants(updated);

    if (updated.length === 0) {
      onHasColorsChange?.(false); // ✅ re-enable main images
    }
  };

  // This ensures every edit — adding a swatch, uploading/removing an image, changing hex/name/title/price — is persisted
  useEffect(() => {
    if (variants.length > 0) {
      localStorage.setItem('colorVariantsDraft', JSON.stringify(variants));
    }
  }, [variants]);

  // Restore variants from localStorage
  // On mount, check if a draft exists and load it
  useEffect(() => {
    const saved = localStorage.getItem('colorVariantsDraft');
    if (saved) {
      try {
        const parsed: ColorVariant[] = JSON.parse(saved);
        setVariants(parsed);
        if (parsed.length > 0) {
          onHasColorsChange?.(true); // ✅ disable main images if variants exist
        }
      } catch (err) {
        console.error('Failed to parse saved color variants:', err);
      }
    }
  }, []);

  // Color swatch reset function
  const resetVariants = () => {
    setVariants([]); // clear state
    localStorage.removeItem('colorVariantsDraft'); // clear draft
    onHasColorsChange?.(false); // ✅ re-enable main images
  };

  return (
    <div className="w-full mt-2 space-y-2">
      <h2 className="font-bold">Color Variants</h2>

      {variants.map((variant, vIndex) => (
        <div key={vIndex} className="border p-3 rounded-md space-y-3 relative">
          {/* Delete button */}
          <button
            type="button"
            onClick={() => deleteVariant(vIndex)}
            className="absolute top-2 right-2 text-red-600 hover:text-red-800 p-2 bg-gray-200 rounded-md"
          >
            <X />
          </button>

          <div className="flex flex-col items-start justify-center space-y-2">
            {/* Hex value */}
            <div className="flex items-center justify-center gap-6">
              <label className="block text-[15px] font-semibold text-gray-800 mb-1">
                Hex value:
              </label>{' '}
              <input
                type="color"
                value={variant.hex}
                onChange={(e) => updateVariant(vIndex, 'hex', e.target.value)}
                className="rounded-full"
              />
            </div>

            {/* Color name * */}
            <div className="w-full flex items-start justify-start gap-2 p-0 rounded-md">
              <label className="block text-[15px] font-semibold text-gray-800 mb-1">
                Color name *
              </label>
              <input
                type="text"
                placeholder="Color name"
                value={variant.name}
                onChange={(e) => updateVariant(vIndex, 'name', e.target.value)}
                className="px-6 py-1 border border-gray-300 rounded-md"
              />
            </div>

            {/* Product Title * */}
            <div className="w-full flex items-start justify-start gap-2 p-0 rounded-md">
              <label className="block shrink-0 text-[15px] font-semibold  text-gray-800 mb-0">
                Product Title *
              </label>
              <AutoResizeTextarea
                label=""
                rows={2}
                placeholder="Enter product title"
                {...register('title', { required: 'Title is required' })}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.title.message as string}
                </p>
              )}
            </div>

            <div className="w-full flex items-start justify-start gap-2 p-0 rounded-md">
              <label className="block text-[15px] font-semibold  text-gray-800 mb-1">
                Price *
              </label>
              <input
                type="number"
                placeholder="Price"
                value={variant.price}
                onChange={(e) =>
                  updateVariant(vIndex, 'price', parseFloat(e.target.value))
                }
                className="px-6 py-1 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          {/* Color Variant Image Grid */}
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => {
              const key = `${vIndex}-${i}`;
              return (
                <ImagePlaceholder
                  key={i}
                  aspect={watch('aspect')} // ✅ square or portrait thumbnails
                  pictureUploadingLoader={variantUploading[key] ?? false} // ✅ per-slot loader
                  image={variant.images[i]} // ✅ scoped to this variant only
                  index={i}
                  onImageChange={async (file) => {
                    if (!file) return;
                    setVariantUploading((prev) => ({ ...prev, [key]: true }));
                    await handleVariantImageUpload(vIndex, i, file); // ✅ use variant-specific handler
                    setVariantUploading((prev) => ({ ...prev, [key]: false }));
                  }}
                  onRemove={() => handleVariantImageUpload(vIndex, i, null)} // ✅ remove only from this variant
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

      <div className="flex items-center justify-start gap-4">
        <button
          type="button"
          onClick={addVariant}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 mt-4 rounded-lg "
        >
          + Add Color Swatch
        </button>

        <button
          type="button"
          onClick={resetVariants}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 mt-2 rounded-lg"
        >
          Reset Variants
        </button>
      </div>

      {openVariantPreviewModal && variantPreviewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="relative bg-white p-4 rounded-lg shadow-lg">
            <img
              src={variantPreviewImage}
              alt="Preview"
              className="max-w-[500px] max-h-[600px] object-contain rounded-md"
            />
            <button
              type="button"
              onClick={() => setOpenVariantPreviewModal(false)}
              className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
