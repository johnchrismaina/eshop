import { useState } from 'react';
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
  const [openPreviewModal, setOpenPreviewModal] = useState(false);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<
    string | null
  >(null);

  // ✅ Hook form setup
  const {
    register,
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

          {/* Image grid */}
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <ImagePlaceholder
                key={i}
                aspect="square"
                pictureUploadingLoader={false}
                image={variant.images[i]}
                index={i}
                onImageChange={(file) => handleImageUpload(vIndex, i, file)}
                onRemove={() => handleImageUpload(vIndex, i, null)}
                setOpenPreviewModal={setOpenPreviewModal}
                setSelectedPreviewImage={setSelectedPreviewImage}
              />
            ))}
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

      <button
        type="button"
        onClick={addVariant}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 mt-4 rounded-lg "
      >
        + Add Color Swatch
      </button>
    </div>
  );
}
