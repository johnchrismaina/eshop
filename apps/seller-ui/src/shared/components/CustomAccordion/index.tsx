import React from 'react';
import { Controller, useFieldArray } from 'react-hook-form';
import { ChevronDown, PlusCircle, Trash2 } from 'lucide-react';
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react';
import Input from 'packages/components/input';
// import RichTextEditor from '../RichTextEditor'; // your editor component
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(
  () => import('packages/components/rich-text-editor'),
  { ssr: false }
);

const CustomAccordion = ({ control, errors }: any) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'product_details',
  });

  return (
    <div>
      <label className="block text-[15px] font-bold text-gray-700 mb-2">
        Product Details - Accordions (max 3)
      </label>

      <div className="flex flex-col gap-4 mt-2">
        {fields.map((item, index) => (
          <Disclosure key={item.id}>
            {({ open }) => (
              <div className="border border-gray-600 rounded-lg p-2">
                {/* Title input field */}
                <div className="flex items-center justify-between gap-2">
                  <Controller
                    name={`product_details.${index}.title`}
                    control={control}
                    rules={{ required: 'Title is required' }}
                    render={({ field }) => (
                      <Input
                        placeholder="Accordion title (e.g. Top Highlights)"
                        {...field}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          // Auto-capitalize each word
                          const formatted = e.target.value.replace(
                            /\b\w/g,
                            (char: string) => char.toUpperCase() // ✅ typed parameter
                          );
                          field.onChange(formatted);
                        }}
                      />
                    )}
                  />
                  <div
                    className="px-4 py-2 bg-red-100 text-red-600 hover:text-red-700 rounded-md cursor-pointer"
                    onClick={() => remove(index)}
                  >
                    <Trash2
                      size={20}
                      // className="text-red-600 hover:text-red-700 "
                      // onClick={() => remove(index)}
                    />
                  </div>
                </div>

                {/* Toggle button */}
                <DisclosureButton className="flex w-full items-center justify-between rounded-lg bg-gray-200 px-4 py-2 mt-2 text-left text-sm font-medium text-gray-700  transition-colors duration-300">
                  <span className="font-bold">Add Product Details</span>
                  <ChevronDown color="#757575" />
                </DisclosureButton>

                {/* Content editor */}
                <DisclosurePanel className="px-4 pt-4 pb-2 text-sm text-gray-200">
                  <Controller
                    name={`product_details.${index}.content`}
                    control={control}
                    rules={{ required: 'Content is required' }}
                    render={({ field }) => (
                      <RichTextEditor
                        id={`accordion-editor-${index}`} // ✅ unique id per editor
                        value={field.value || ''}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  {errors?.accordions?.[index]?.content && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.accordions[index].content.message}
                    </p>
                  )}
                </DisclosurePanel>
              </div>
            )}
          </Disclosure>
        ))}

        {fields.length < 3 && (
          <button
            type="button"
            className="flex items-center justify-center gap-2 text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-md w-[200px]"
            onClick={() => append({ title: '', content: '' })}
          >
            <PlusCircle size={20} /> Add Accordion
          </button>
        )}
      </div>
    </div>
  );
};

export default CustomAccordion;
