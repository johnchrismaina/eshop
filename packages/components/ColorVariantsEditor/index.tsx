import { useState } from 'react';

type ColorVariant = {
  name: string;
  hex: string;
  title: string;
  price: number;
  images: string[];
  isDefault: boolean;
};

export default function ColorVariantsEditor() {
  const [variants, setVariants] = useState<ColorVariant[]>([]);

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        name: '',
        hex: '#000000',
        title: '',
        price: 0,
        images: [],
        isDefault: false,
      },
    ]);
  };

  const updateVariant = <K extends keyof ColorVariant>(
    index: number,
    field: K,
    value: ColorVariant[K]
  ) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  const handleImageUpload = (index: number, files: FileList | null) => {
    if (!files) return;

    const updated = [...variants];
    const urls = Array.from(files)
      .slice(0, 8)
      .map((file) => URL.createObjectURL(file));

    updated[index].images = urls;
    setVariants(updated);
  };

  const setAsDefault = (index: number) => {
    const updated = variants.map((v, i) => ({
      ...v,
      isDefault: i === index,
    }));
    setVariants(updated);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Color Variants</h2>

      {variants.map((variant, index) => (
        <div key={index} className="border p-3 rounded-md space-y-3">
          {/* Swatch + Thumbnail */}
          <div className="flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-full border"
              style={{ backgroundColor: variant.hex }}
            ></div>
            {variant.images[0] ? (
              <img
                src={variant.images[0]}
                alt={variant.name}
                className="w-12 h-12 object-cover rounded border"
              />
            ) : (
              <div className="w-12 h-12 flex items-center justify-center border rounded text-xs text-gray-400">
                No image
              </div>
            )}
          </div>

          {/* Inputs */}
          <input
            type="text"
            placeholder="Color name"
            value={variant.name}
            onChange={(e) => updateVariant(index, 'name', e.target.value)}
            className="border rounded px-2 py-1 w-full"
          />

          <input
            type="text"
            placeholder="Variant title"
            value={variant.title}
            onChange={(e) => updateVariant(index, 'title', e.target.value)}
            className="border rounded px-2 py-1 w-full"
          />

          <input
            type="number"
            placeholder="Price"
            value={variant.price}
            onChange={(e) =>
              updateVariant(index, 'price', parseFloat(e.target.value))
            }
            className="border rounded px-2 py-1 w-full"
          />

          <input
            type="color"
            value={variant.hex}
            onChange={(e) => updateVariant(index, 'hex', e.target.value)}
            className="w-10 h-10 border rounded"
          />

          {/* Image Upload (max 8) */}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleImageUpload(index, e.target.files)}
          />

          {/* Preview Grid */}
          <div className="grid grid-cols-4 gap-2 mt-2">
            {variant.images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={variant.name}
                className="w-20 h-20 object-cover border rounded"
              />
            ))}
          </div>

          {/* Default toggle */}
          <label className="flex items-center gap-2 mt-2">
            <input
              type="radio"
              name="defaultColor"
              checked={variant.isDefault}
              onChange={() => setAsDefault(index)}
            />
            Set as default
          </label>
        </div>
      ))}

      {/* Button to add new swatch */}
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
