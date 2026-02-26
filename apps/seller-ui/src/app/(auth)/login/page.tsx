'use client';

import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Spinner from 'packages/components/spinner';
import React, { useState } from 'react';
// import layout from '../layout';
import { useForm } from 'react-hook-form';
// import useLayout from 'apps/user-ui/src/hooks/useLayout';
import useLayout from '../../../hooks/useLayout';

type FormData = {
  email: 'string';
  password: 'string';
};

const Login = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  // const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const { layout } = useLayout();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const loginMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/login-seller`,
        data,
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: (data) => {
      setServerError(null);
      router.push('/dashboard');
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        'Invalid credentials!';
      setServerError(errorMessage);
    },
  });

  const onSubmit = (data: FormData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="w-full py-2 min-h-screen bg-white flex flex-col items-center gap-4">
      {/* logo */}
      <div>
        {/* <Link href="/">
          <Image
            src={layout?.logo || ''}
            alt=""
            width={150}
            height={50}
            className="object-cover"
            unoptimized
          />
        </Link> */}
      </div>

      <div className="w-full flex flex-col items-center justify-center">
        <div className="flex flex-col justify-start gap-4">
          <span className="text-2xl font-extrabold text-gray-800 tracking-tight">
            Sokonis seller account
          </span>
          <div className="md:w-[380px] px-8 py-6 bg-[#f1f1f1] rounded-lg flex flex-col justify-start">
            <h3 className="text-2xl font-semibold text-start mb-4">Login</h3>

            {/* <div className="flex items-center my-5 text-gray-400 text-sm">
            <div className="flex-1 border-t border-gray-300" />
            <span className="px-3">or Sign in with Email</span>
            <div className="flex-1 border-t border-gray-300" />
          </div> */}

            <form onSubmit={handleSubmit(onSubmit)}>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                // placeholder="john@gmail.com"
                className="w-full px-3 py-1 text-base font-medium border border-gray-300 outline-0 !rounded mb-1"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                    message: 'Invalid email address',
                  },
                })}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">
                  {String(errors.email.message)}
                </p>
              )}

              <div className="flex justify-between items-center">
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Password
                </label>
                <Link
                  href={'/forgot-password'}
                  className="text-blue-500 text-sm font-semibold no-underline hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              <div className="relative mb-6">
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  className="w-full px-3 py-1 pr-10 text-base font-medium border border-gray-300 outline-0 !rounded"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                />

                <button
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400"
                >
                  {passwordVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
                {errors.password && (
                  <p className="text-red-500 text-sm -mt-5 mb-4">
                    {String(errors.password.message)}
                  </p>
                )}
              </div>

              {/* <div className="flex justify-between items-center my-4">
              <label className="flex items-center text-gray-600">
                <input
                  type="checkbox"
                  className="mr-2 "
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                Remember me
              </label>
            </div> */}

              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full text-base font-semibold cursor-pointer bg-amber-300 hover:bg-amber-400 transition-colors text-gray-800 py-2 rounded-lg relative flex items-center justify-center"
              >
                {/* Keep the text in DOM but hide it when loading */}
                <span
                  className={
                    loginMutation?.isPending ? 'opacity-0' : 'opacity-100'
                  }
                >
                  Login
                </span>

                {/* Spinner centered absolutely */}
                {loginMutation?.isPending && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <Spinner size={16} borderColor="border-gray-800" />
                  </span>
                )}
              </button>

              {serverError && (
                <p className="text-red-500 text-sm mt-2">{serverError}</p>
              )}

              <div className="flex-1 border-t border-gray-300 mt-6 mb-4" />
              <p className=" text-gray-600">
                Don't have an account?{' '}
                <Link
                  href={'/signup'}
                  className="text-blue-600 no-underline hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
