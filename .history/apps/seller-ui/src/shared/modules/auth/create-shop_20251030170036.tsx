import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import React from 'react';
import { useForm } from 'react-hook-form';

const CreateShop = ({
  sellerId,
  setActiveStep,
}: {
  sellerId: string;
  setActiveStep: (step: number) => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const shopCreateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/create-shop`,
        data
      );

      return response.data;
    },
    onSuccess: () => {
      setActiveStep(3);
    },
  });

  const onSubmit = async (data: any) => {
    const shopData = { ...data, sellerId };
    shopCreateMutation.mutate(shopData);
  };

  const countWords = (text: string) => text.trim().split(/\s+/).length;

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <h3 className="text-2xl font-semibold text-center mb-4">
          Setup new shop
        </h3>

        {/* Shop name */}
        <label className="block text-gray-700 mb1">Name *</label>
        <input
          type="text"
          placeholder="shop name"
          className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
          {...register('name', {
            required: 'Name is required',
          })}
        />
        {errors.name && (
          <p className="text-red-500 text-sm">{String(errors.name.message)}</p>
        )}

        {/* Shop bio */}
        <label className="block text-gray-700 mb1">Bio (Max 100 words) *</label>
        <input
          type="text"
          placeholder="shop bio"
          className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
          {...register('bio', {
            required: 'Shop bio is required',
            validate: (value) =>
              countWords(value) <= 100 || "Bio can't exceed 100 words",
          })}
        />
        {errors.bio && (
          <p className="text-red-500 text-sm">{String(errors.bio.message)}</p>
        )}

        {/* Shop address */}
        <label className="block text-gray-700 mb1">Address *</label>
        <input
          type="text"
          placeholder="shop location"
          className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
          {...register('address', {
            required: 'Shop address is required',
          })}
        />
        {errors.address && (
          <p className="text-red-500 text-sm">
            {String(errors.address.message)}
          </p>
        )}

        {/* Shop opening hours */}
        <label className="block text-gray-700 mb1">Address *</label>
        <input
          type="text"
          placeholder="e.g. Mon-Fri 9AM - 6PM"
          className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
          {...register('opening_hours', {
            required: 'Opening hours are required',
          })}
        />
        {errors.opening_hours && (
          <p className="text-red-500 text-sm">
            {String(errors.opening_hours.message)}
          </p>
        )}

        {/* Shop website */}
        <label className="block text-gray-700 mb1">Website</label>
        <input
          type="url"
          placeholder="https://example.com"
          className="w-full p-2 border border-gray-300 outline-0 rounded-[4px] mb-1"
          {...register('website', {
            pattern: {
              value: /^(https?:\/\/)?([\w\d-]+\.)+\w{2,}(\/.*)?$/,
              message: 'Enter a valid URL',
            },
          })}
        />
        {errors.website && (
          <p className="text-red-500 text-sm">
            {String(errors.website.message)}
          </p>
        )}

        {/* Shop category */}
        <label className="block text-gray-700 mb1">Category *</label>
        <select 
        className="" >

        </select>
      </form>
    </div>
  );
};

export default CreateShop;
