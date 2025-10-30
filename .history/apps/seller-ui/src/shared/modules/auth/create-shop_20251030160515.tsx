import { useMutation } from '@tanstack/react-query';
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
    mutationFn: async(data:FormData) =>
  })
  return <div></div>;
};

export default CreateShop;
