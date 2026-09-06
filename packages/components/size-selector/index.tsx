import React from 'react';
import { Controller } from 'react-hook-form';

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

interface SizeSelectorProps {
  control: any; // ✅ react-hook-form control
  errors: any; // ✅ react-hook-form errors
}

const SizeSelector: React.FC<SizeSelectorProps> = ({ control, errors }) => {
  return (
    <div className="mt-2">
      <label className="block font-bold text-[15px] text-gray-700 mb-2">
        Sizes
      </label>

      <Controller
        name="sizes"
        control={control}
        rules={{
          required: 'Please select at least one size', // ✅ validation rule
        }}
        render={({ field }) => {
          const selected = field.value || [];

          return (
            <div className="flex gap-3 flex-wrap">
              {sizes.map((size) => {
                const isSelected = selected.includes(size);

                return (
                  <button
                    type="button"
                    key={size}
                    onClick={() =>
                      field.onChange(
                        isSelected
                          ? selected.filter((s: string) => s !== size) // ✅ remove if selected
                          : [...selected, size] // ✅ add if not selected
                      )
                    }
                    className={`px-2 py-1 rounded-lg font-poppins transition-all duration-150 w-[70px] ${
                      isSelected
                        ? 'bg-gray-800 text-white'
                        : 'bg-white text-gray-700 border border-gray-300'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          );
        }}
      />

      {/* ✅ Show validation error */}
      {errors.sizes && (
        <p className="text-red-500 text-sm mt-1">
          {errors.sizes.message as string}
        </p>
      )}
    </div>
  );
};

export default SizeSelector;
