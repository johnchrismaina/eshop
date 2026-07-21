// import React from 'react';
import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { Plus } from 'lucide-react';

const defaultColors = [
  '#000000', // Black
  '#ffffff', // White
  '#ff0000', // Red
  '#00ff00', // Green
  '#0000ff', // Blue
  '#ffff00', // Yellow
  '#ff00ff', // Magenta
  '#00ffff', // Cyan
];

const ColorSelector = ({ control, errors }: any) => {
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [newColor, setNewColor] = useState('#ffffff');

  return (
    <div className="mt-2">
      <label className="block font-semibold text-[15px] text-gray-700 mb-1">
        Colors
      </label>
      <Controller
        name="colors"
        control={control}
        render={({ field }) => (
          <div className="flex gap-3 flex-wrap ">
            {[...defaultColors, ...customColors].map((color) => {
              const isSelected = (field.value || []).includes(color);
              const isLightColor = ['#ffffff', '#ffff00'].includes(color);

              return (
                <button
                  type="button"
                  key={color}
                  onClick={() =>
                    field.onChange(
                      isSelected
                        ? field.value.filter((c: string) => c !== color)
                        : [...(field.value || []), color]
                    )
                  }
                  className={`w-7 h-7 p-2 rounded-none my-1 flex items-center justify-center transition ${
                    isSelected ? 'ring-2 ring-gray-950 ring-offset-2' : 'ring-0'
                  } ${
                    isLightColor
                      ? 'border border-gray-600'
                      : 'border border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              );
            })}

            {/* Add new color */}
            <button
              type="button"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 transition"
              onClick={() => setShowColorPicker(!showColorPicker)}
            >
              <Plus size={16} color="white" />
            </button>

            {/* Color picker */}
            {showColorPicker && (
              <div className="relative flex items-center gap-2 ">
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  // onChange={(e) =>
                  //   setNewColor((e.target as HTMLInputElement).value)
                  // }
                  className="w-10 h-10 p-0 rounded-sm border-none cursor-pointer "
                />
                <button
                  type="button"
                  onClick={() => {
                    setCustomColors([...customColors, newColor]);
                    setShowColorPicker(false);
                  }}
                  className="px-3 py-1 bg-gray-700 text-white rounded-md text-sm"
                >
                  Add
                </button>
              </div>
            )}
          </div>
        )}
      />
    </div>
  );
};

export default ColorSelector;
