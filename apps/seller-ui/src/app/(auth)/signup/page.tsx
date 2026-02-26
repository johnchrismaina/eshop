'use client';

import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios, { AxiosError } from 'axios';
import { countries } from '../../../utils/countries';
import Link from 'next/link';
import CreateShop from 'apps/seller-ui/src/shared/modules/auth/create-shop';
import Spinner from 'packages/components/spinner';

const Signup = () => {
  const [activeStep, setActiveStep] = useState(1);

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(60);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [sellerData, setSellerData] = useState<FormData | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [sellerId, setSellerId] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

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
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/seller-registration`,
        data
      );
      return response.data;
    },
    onSuccess: (_, formData) => {
      setSellerData(formData);
      setShowOtp(true);
      setCanResend(false);
      setTimer(60);
      startResendTimer();
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!sellerData) return;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/verify-seller`,
        {
          ...sellerData,
          otp: otp.join(''),
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      setSellerId(data?.seller?.id);
      setActiveStep(2);
    },
  });

  const onSubmit = (data: any) => {
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
    if (sellerData) {
      signupMutation.mutate(sellerData);
    }
  };

  const connectStripe = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/create-stripe-link`,
        { sellerId }
      );

      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Stripe Connection Error:', error);
    }
  };

  return (
    <div className="w-full flex flex-col items-center min-h-screen ">
      <div className="flex items-center justify-between border border-b-1 border-gray-100 w-full mx-auto py-0 px-6 mb-6">
        <span className="text-2xl font-extrabold text-gray-800 tracking-tight">
          Sell with Sokonis
        </span>

        {/* Stepper */}
        <div className="relative flex items-center justify-center p-3 gap-8 md:w-[50%] ">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className="flex items-center gap-2 text-sm shrink-0"
            >
              {/* Circle */}
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full text-white font-bold ${
                  step <= activeStep ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                {step}
              </div>
              {/* Label */}
              <span className="text-sm font-bold tracking-tight">
                {step === 1
                  ? 'CREATE ACCOUNT'
                  : step === 2
                  ? 'SETUP SHOP'
                  : 'CONNECT BANK'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Steps content */}
      <div className="md:w-[380px] px-8 py-6 bg-[#f1f1f1] rounded-lg">
        {activeStep === 1 && (
          <>
            {!showOtp ? (
              <form onSubmit={handleSubmit(onSubmit)}>
                <h3 className="text-2xl font-semibold text-start mb-4">
                  Create Account
                </h3>
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
                      value:
                        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
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
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+254700123456"
                  className="w-full px-3 py-1 text-sm font-medium border border-gray-300 outline-0 !rounded mb-1"
                  {...register('phone_number', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^\+?[1-9]\d{1,14}$/,
                      message: 'Invalid phone number format',
                    },
                    minLength: {
                      value: 10,
                      message: 'Phone number must be at least 10 digits',
                    },
                    maxLength: {
                      value: 15,
                      message: 'Phone number cannot exceed 15 digits',
                    },
                  })}
                />

                {errors.phone_number && (
                  <p className="text-red-500 text-sm">
                    {String(errors.phone_number.message)}
                  </p>
                )}

                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Country
                </label>
                <select
                  className="w-full px-3 py-1 mb-1 text-sm font-medium border border-gray-300 outline-0 rounded-[4px]"
                  {...register('country', { required: 'Country is required' })}
                >
                  <option value="">Select your country</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>

                {errors.country && (
                  <p className="text-red-500 text-sm">
                    {String(errors.country.message)}
                  </p>
                )}

                {/* Password label */}
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={passwordVisible ? 'text' : 'password'}
                    // placeholder="Min. 6 characters"
                    className="w-full px-3 py-1 text-base font-medium border border-gray-300 outline-0 !rounded mb-1"
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
                    className="absolute top-1/2 -translate-y-1/2 right-3 flex items-center text-gray-400"
                  >
                    {passwordVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                  {errors.password && (
                    <p className="text-red-500 text-sm">
                      {String(errors.password.message)}
                    </p>
                  )}
                </div>

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
                    Sign up
                  </span>

                  {/* Spinner centered absolutely */}
                  {signupMutation?.isPending && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <Spinner size={16} borderColor="border-gray-800" />
                    </span>
                  )}
                </button>

                {signupMutation.isError &&
                  signupMutation.error instanceof AxiosError && (
                    <p className="text-red-500 text-sm mt-2">
                      {signupMutation.error.response?.data?.message ||
                        signupMutation.error.message}
                    </p>
                  )}

                <div className="flex-1 border-t border-gray-300 mt-6 mb-4" />
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <Link
                    href={'/login'}
                    className="text-blue-600 no-underline hover:underline"
                  >
                    Login
                  </Link>
                </p>
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
                  className="w-full mt-4 text-lg font-medium cursor-pointer bg-amber-300 hover:bg-amber-400 transition-colors text-white py-2 rounded-lg"
                  disabled={verifyOtpMutation.isPending}
                  onClick={() => verifyOtpMutation.mutate()}
                >
                  {verifyOtpMutation.isPending ? 'Verifying...' : 'Verify OTP'}
                </button>
                <p className="text-center text-sm mt-4">
                  {canResend ? (
                    <button
                      onClick={resendOtp}
                      className="text-blue-500 cursor-pointer"
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
          </>
        )}
        {activeStep === 2 && (
          <CreateShop sellerId={sellerId} setActiveStep={setActiveStep} />
        )}
        {activeStep === 3 && (
          <div className="text-center">
            <h3 className="text-2xl font-semibold">Withdraw Method</h3>
            <br />
            <button
              onClick={connectStripe}
              className="w-full m-auto flex items-center justify-center gap-3 text-lg bg-[#334155] text-white py-2 rounded-lg"
            >
              Connect Stripe
              {/* <StripeLogo /> */}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup;
