import { useState } from 'react';
import ImagePlaceholder from 'apps/seller-ui/src/shared/components/image-placeholder';

interface UploadedImage {
  fileId: string;
  file_url: string;
}

type ColorVariant = {
  name: string;
  hex: string;
  title: string;
  price: number;
  images: (UploadedImage | null)[]; // ✅ allow empty slots
  isDefault: boolean;
};

export default function ColorVariantsEditor() {
  const [variants, setVariants] = useState<ColorVariant[]>([]);
  const [openPreviewModal, setOpenPreviewModal] = useState(false);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<
    string | null
  >(null);

  // Add new variant with 8 empty slots
  const addVariant = () => {
    setVariants([
      ...variants,
      {
        name: '',
        hex: '#000000',
        title: '',
        price: 0,
        images: Array(8).fill(null), // ✅ 8 placeholders
        isDefault: false,
      },
    ]);
  };

  // Update any field safely
  const updateVariant = <K extends keyof ColorVariant>(
    index: number,
    field: K,
    value: ColorVariant[K]
  ) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  // Handle image upload for a specific slot
  const handleImageUpload = (
    variantIndex: number,
    imageIndex: number,
    file: File | null
  ) => {
    const updated = [...variants];
    if (file) {
      updated[variantIndex].images[imageIndex] = {
        fileId: crypto.randomUUID(), // or your backend ID
        file_url: URL.createObjectURL(file),
      };
    } else {
      updated[variantIndex].images[imageIndex] = null;
    }
    setVariants(updated);
  };

  // Mark one variant as default
  const setAsDefault = (index: number) => {
    const updated = variants.map((v, i) => ({
      ...v,
      isDefault: i === index,
    }));
    setVariants(updated);
  };

  return (
    <div className="w-full mt-2 space-y-4">
      <h2 className="text-lg font-semibold">Color Variants</h2>

      {variants.map((variant, vIndex) => (
        <div key={vIndex} className="border p-3 rounded-md space-y-3">
          {/* Inputs */}
          <input
            type="text"
            placeholder="Color name"
            value={variant.name}
            onChange={(e) => updateVariant(vIndex, 'name', e.target.value)}
          />
          <input
            type="text"
            placeholder="Variant title"
            value={variant.title}
            onChange={(e) => updateVariant(vIndex, 'title', e.target.value)}
          />
          <input
            type="number"
            placeholder="Price"
            value={variant.price}
            onChange={(e) =>
              updateVariant(vIndex, 'price', parseFloat(e.target.value))
            }
          />
          <input
            type="color"
            value={variant.hex}
            onChange={(e) => updateVariant(vIndex, 'hex', e.target.value)}
          />

          {/* Image grid with placeholders */}
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
          <label className="flex items-center gap-2 mt-2">
            <input
              type="radio"
              name="defaultColor"
              checked={variant.isDefault}
              onChange={() => setAsDefault(vIndex)}
            />
            Set as default
          </label>
        </div>
      ))}

      <button
        type="button"
        onClick={addVariant}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        + Add Color Swatch
      </button>
    </div>
  );
}
