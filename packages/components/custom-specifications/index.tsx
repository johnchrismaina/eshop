import React from 'react';
import { Controller, useFieldArray } from 'react-hook-form';
import Input from '../input';
import { PlusCircle, Trash2 } from 'lucide-react';

const CustomSpecifications = ({ control, errors }: any) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'custom_specifications',
  });

  return (
    <div>
      <label className="block font-semibold text-gray-700 mb-2 ">
        Product specifications
      </label>
      <div className="flex flex-col gap-4 mt-2">
        {fields.map((item, index) => (
          <div key={item.id} className="flex gap-2 pb-4 items-center ">
            <Controller
              name={`custom_specifications.${index}.name`}
              control={control}
              rules={{ required: 'Specification name is required' }}
              render={({ field }) => (
                <Input
                  label="Name"
                  placeholder="e.g. Brand, Material, Battery Life, Weight"
                  {...field}
                />
              )}
            />
            {errors?.custom_specifications?.[index]?.name && (
              <p className="text-red-500 text-xs">
                {errors.custom_specifications[index].name.message}
              </p>
            )}

            <Controller
              name={`custom_specifications.${index}.value`}
              control={control}
              rules={{ required: 'Value is required' }}
              render={({ field }) => (
                <Input
                  label="Value"
                  placeholder="e.g. Apple, Aluminium, 4000mAh, 1.5kg"
                  {...field}
                />
              )}
            />
            {errors?.custom_specifications?.[index]?.value && (
              <p className="text-red-500 text-xs">
                {errors.custom_specifications[index].value.message}
              </p>
            )}

            <button
              type="button"
              className="text-red-500 hover:text-red-700"
              onClick={() => remove(index)}
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}

        <button
          type="button"
          className="flex items-center justify-center gap-2 text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-md w-[200px]"
          onClick={() => append({ name: '', value: '' })}
        >
          <PlusCircle size={20} /> Add Specifications
        </button>
      </div>
    </div>
  );
};

export default CustomSpecifications;
