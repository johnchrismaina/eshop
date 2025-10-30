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

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <h3 className="text-2xl font-semibold text-center mb-4">
          Setup new shop
        </h3>

        <label className="block text-gray-700 mb1">Name *</label>
        <input
        type={passwordVisible ? 'text' : 'password'}
        placeholder="Min. 6 characters"
        className="w-full p-2 border border-gray-300 outline-0 !rounded mb-1"
        {...register('password', {
            required: 'Password is required',
            minLength: {
            value: 6,
            message: 'Password must be at least 6 characters',
            },
        })}
        />

        {errors.password && (
                <p className="text-red-500 text-sm">
                  {String(errors.password.message)}
                </p>
              )}

      </form>
    </div>
  );
};

export default CreateShop;
