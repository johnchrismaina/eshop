import React from 'react';
import { Controller } from 'react-hook-form';

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

const SizeSelector = ({ control, errors }: any) => {
  return (
    <div className="mt-2">
      <label className="block font-bold text-[15px] text-gray-700 mb-2">
        Sizes
      </label>
      <Controller
        name="sizes"
        control={control}
        render={({ field }) => (
          <div className="flex gap-3 flex-wrap">
            {sizes.map((size) => {
              const isSelected = (field.value || []).includes(size);

              return (
                <button
                  type="button"
                  key={size}
                  onClick={() =>
                    field.onChange(
                      isSelected
                        ? field.value.filter((s: string) => s !== size)
                        : [...(field.value || []), size]
                    )
                  }
                  className={`px-2 py-1 rounded-lg font-poppins transition-colors w-[70px] ${
                    isSelected
                      ? 'bg-white text-gray-700 ring ring-gray-800 ring-offset-0'
                      : 'bg-white text-gray-700 border border-gray-300'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        )}
      />
    </div>
  );
};

export default SizeSelector;
