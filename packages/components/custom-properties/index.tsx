import React, { useEffect, useState } from 'react';
import { Controller } from 'react-hook-form';
import Input from '../input';
import { Plus, X } from 'lucide-react';

const CustomProperties = ({ control, errors }: any) => {
  const [properties, setProperties] = useState<
    { label: string; values: string[] }[]
  >([]);

  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState('');

  return (
    <div>
      <div className="flex flex-col gap-4 mt-2 mb-4">
        <Controller
          name="customProperties"
          control={control}
          render={({ field }) => {
            useEffect(() => {
              field.onChange(properties);
            }, [properties]);

            const addProperty = () => {
              if (!newLabel.trim()) return;
              setProperties([...properties, { label: newLabel, values: [] }]);
              setNewLabel('');
            };

            const addValue = (index: number) => {
              if (!newValue.trim()) return;
              const updatedProperties = [...properties];
              updatedProperties[index].values.push(newValue);
              setProperties(updatedProperties);
              setNewValue('');
            };

            const removeProperty = (index: number) => {
              setProperties(properties.filter((_, i) => i !== index));
            };

            return (
              <div className="mt-2">
                <label className="block font-semibold text-gray-700 mb-1">
                  Custom Properties
                </label>

                <div className="flex flex-col gap-3">
                  {/* Existing properties */}
                  {properties.map((property, index) => (
                    <div
                      key={index}
                      className="border border-gray-400 p-3 rounded-lg bg-gray-200"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700 font-medium">
                          {property.label}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeProperty(index)}
                        >
                          <X size={18} className="text-red-500" />
                        </button>
                      </div>

                      {/* Add Values to property */}
                      <div className="flex items-center mt-2 gap-2">
                        <input
                          type="text"
                          className="border outline-none border-gray-300 bg-gray-100 p-2 rounded-md text-gray-700 w-full"
                          placeholder="Enter value..."
                          value={newValue}
                          onChange={(e) => setNewValue(e.target.value)}
                        />
                        <button
                          type="button"
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                          onClick={() => addValue(index)}
                        >
                          Add
                        </button>
                      </div>

                      {/* Show Values */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {property.values.map((value, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-gray-700 text-white rounded-md text-sm"
                          >
                            {value}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Add New Property */}
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      placeholder="Enter property label (e.g. Material, Warranty)"
                      value={newLabel}
                      onChange={(e: any) => setNewLabel(e.target.value)}
                    />
                    <button
                      type="button"
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center justify-center gap-1"
                      onClick={addProperty}
                    >
                      <Plus size={16} /> Add
                    </button>
                  </div>
                </div>

                {errors?.custom_properties && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.custom_properties.message as string}
                  </p>
                )}
              </div>
            );
          }}
        />
      </div>
    </div>
  );
};

export default CustomProperties;
