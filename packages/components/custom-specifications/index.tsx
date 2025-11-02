import React from 'react';
import { Controller, useFieldArray } from 'react-hook-form';
import Input from '../input';

const CustomSpecifications = ({ control, errors }: any) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'custom_specifications',
  });
  return (
    <div>
      <label className="block font-semibold text-gray-300 mb-1">
        Custom Specifications
      </label>
      <div className="flex flex-col gep-3">
        {fields?.map((item, index) => (
          <div key={index} className="flex gap-2 items-center">
            <Controller
              name={`custom_specifications.${index}.name`}
              control={control}
              rules={{ required: 'Specification name is required' }}
              render={({ field }) => (
                <Input
                  label="Specification Name"
                  placeholder="e.g. Battery Life, Weight, Material"
                  {...field}
                />
              )}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomSpecifications;
