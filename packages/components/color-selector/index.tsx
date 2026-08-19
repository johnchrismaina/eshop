// import React from 'react';
import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { Plus, X } from 'lucide-react';

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
    <div className="mt-2 ">
      <label className="block font-bold text-[15px] text-gray-700 mb-1">
        Colors
      </label>
      <Controller
        name="colors"
        control={control}
        render={({ field }) => (
          <div className="flex items-center justify-start gap-3 flex-wrap ">
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
                  className={`w-8 h-8 p-2 rounded-full my-1 flex items-center justify-center transition ${
                    isSelected
                      ? 'ring-2 ring-slate-600 ring-offset-2'
                      : 'ring-0'
                  } ${
                    isLightColor
                      ? 'border border-slate-600'
                      : 'border border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              );
            })}

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
                  className="w-8 h-8 rounded-md border border-green-700 cursor-pointer appearance-none p-0 ml-4"
                />
                <button
                  type="button"
                  onClick={() => {
                    setCustomColors([...customColors, newColor]);
                    setShowColorPicker(false);
                  }}
                  className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md text-sm"
                >
                  Add color
                </button>
              </div>
            )}

            {/* Add new color */}
            <button
              type="button"
              className={`flex items-center justify-center gap-2 rounded-full w-9 h-9 py-1 ml-2 text-gray-700 hover:bg-text-[#000] border border-gray-400 transition-all duration-150 ${
                showColorPicker ? 'bg-red-200 ' : 'bg-blue-200'
              }`}
              onClick={() => setShowColorPicker(!showColorPicker)}
            >
              {showColorPicker ? <X size={20} /> : <Plus size={20} />}
            </button>
          </div>
        )}
      />
    </div>
  );
};

export default ColorSelector;
