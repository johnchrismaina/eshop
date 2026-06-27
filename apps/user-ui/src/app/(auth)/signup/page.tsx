'use client';

export const dynamic = 'force-dynamic';

import { useMutation } from '@tanstack/react-query';
// import GoogleButton from 'apps/user-ui/src/shared/components/google-button';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios, { AxiosError } from 'axios';
import Image from 'next/image';
import useLayout from 'apps/user-ui/src/hooks/useLayout';
import Spinner from 'packages/components/spinner';

type FormData = {
  name: 'string';
  email: 'string';
  password: 'string';
};

const Signup = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(60);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [userData, setUserData] = useState<FormData | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const router = useRouter();

  // const layout = useLayout();
  const { layout } = useLayout();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const startResendTimer = () => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const signupMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/user-registration`,
        data
      );
      return response.data;
    },
    onSuccess: (_, formData) => {
      setUserData(formData);
      setShowOtp(true);
      setCanResend(false);
      setTimer(60);
      startResendTimer();
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!userData) return;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/verify-user`,
        {
          ...userData,
          otp: otp.join(''),
        }
      );
      return response.data;
    },
    onSuccess: () => {
      router.push('/login');
    },
  });

  const onSubmit = (data: FormData) => {
    signupMutation.mutate(data);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const resendOtp = () => {
    if (userData) {
      signupMutation.mutate(userData);
    }
  };

  return (
    <div className="w-full py-2 min-h-[85vh] bg-white flex flex-col items-center gap-4">
      {/* logo */}
      <div>
        <Link href="/">
          <Image
            src={
              layout?.logo ||
              'https://ik.imagekit.io/johnchrismaina/Assets/sokonis_logo1.svg'
            }
            alt=""
            width={150}
            height={50}
            className="object-cover"
            unoptimized
          />
        </Link>
      </div>

      <div className="w-full flex justify-center">
        <div className="md:w-[380px] px-8 py-6 bg-[#f1f1f1] rounded-lg flex flex-col justify-start">
          <h3 className="text-2xl font-semibold mb-4">Sign up</h3>

          {/* <GoogleButton />
          <div className="flex items-center my-5 text-gray-400 text-sm">
            <div className="flex-1 border-t border-gray-300" />
            <span className="px-3">or Sign in with Email</span>
            <div className="flex-1 border-t border-gray-300" />
          </div> */}

          {!showOtp ? (
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Name label */}
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                // placeholder="john"
                className="w-full px-3 py-1 pr-10 text-base font-medium border border-gray-300 outline-0 !rounded mb-1"
                {...register('name', {
                  required: 'Name is required',
                })}
              />
              {errors.name && (
                <p className="text-red-500 text-sm">
                  {String(errors.name.message)}
                </p>
              )}

              {/* Email label */}
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

              <label className="block text-sm font-bold text-gray-700 mb-1">
                Password
              </label>
              <div className="relative ">
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  // placeholder="Min. 6 characters"
                  className="w-full px-3 py-1 pr-10 text-base font-medium border border-gray-300 outline-0 !rounded mb-1"
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
                  // className="absolute inset-y-0 right-3 flex items-center text-gray-400"
                  className="absolute top-1/2 -translate-y-1/2 right-3 flex items-center text-gray-400"
                >
                  {passwordVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {String(errors.password.message)}
                </p>
              )}

              <button
                type="submit"
                disabled={signupMutation.isPending}
                className="w-full text-base font-semibold cursor-pointer mt-4 bg-amber-300 hover:bg-amber-400 transition-colors text-gray-800 py-2 rounded-lg flex items-center justify-center relative"
              >
                {/* Keep the text in DOM but hide it when loading */}
                <span
                  className={
                    signupMutation?.isPending ? 'opacity-0' : 'opacity-100'
                  }
                >
                  Sign Up
                </span>

                {/* Spinner centered absolutely */}
                {signupMutation?.isPending && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <Spinner size={16} borderColor="border-gray-800" />
                  </span>
                )}
              </button>
            </form>
          ) : (
            <div>
              <h3 className="text-xl font-semibold text-center mb-4">
                Enter OTP
              </h3>
              <div className="flex justify-center gap-6">
                {otp?.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    ref={(el) => {
                      if (el) inputRefs.current[index] = el;
                    }}
                    maxLength={1}
                    className="w-12 h-12 text-center border border-gray-300 outline-none !rounded"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  />
                ))}
              </div>
              <button
                className="w-full mt-4 text-lg font-medium cursor-pointer bg-blue-500 text-white py-2 rounded-lg"
                disabled={verifyOtpMutation.isPending}
                onClick={() => verifyOtpMutation.mutate()}
              >
                {verifyOtpMutation.isPending ? 'Verifying...' : 'Verify OTP'}
              </button>
              <p className="text-center text-sm mt-4">
                {canResend ? (
                  <button
                    onClick={resendOtp}
                    className="bg-blue-700 hover:bg-blue-800 transition-colors text-white cursor-pointer"
                  >
                    Resend OTP
                  </button>
                ) : (
                  `Resend OTP in ${timer}s`
                )}
              </p>
              {verifyOtpMutation?.isError &&
                verifyOtpMutation.error instanceof AxiosError && (
                  <p className="text-red-500 text-sm mt-2">
                    {verifyOtpMutation.error.response?.data?.message ||
                      verifyOtpMutation.error.message}
                  </p>
                )}
            </div>
          )}

          <div className="flex-1 border-t border-gray-300 mt-6 mb-5" />
          <p className="text-gray-600 ">
            Already have an account?{' '}
            <Link
              href={'/login'}
              className="text-blue-600 no-underline hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
