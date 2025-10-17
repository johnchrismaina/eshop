import crypto from 'crypto';
import { ValidationError } from '@packages/error-handler';
// import redis from '@packages/libs/redis';
import { Redis } from '@upstash/redis';
import 'dotenv/config';
import { sendEmail } from '../utils/sendMail';
import { NextFunction } from 'express';
// import { parse } from 'path';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegistrationData = (
  data: any,
  userType: 'user' | 'seller'
) => {
  const { name, email, password, phone_number, country } = data;

  if (
    !name ||
    !email ||
    !password ||
    (userType === 'seller' && (!phone_number || !country))
  ) {
    throw new ValidationError('Missing required fields');
  }

  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format!');
  }
};

export const checkOtpRestrictions = async (
  email: string,
  next: NextFunction
) => {
  if (await redis.get(`otp_lock:${email}`)) {
    return next(
      new ValidationError(
        'Account locked due to multiple failed attempts! Try again after 30 minutes.'
      )
    );
  }
  if (await redis.get(`otp_spam_lock:${email}`)) {
    return next(
      new ValidationError(
        'Too many OTP requests! Please wait 1 hour before requesting again.'
      )
    );
  }
  if (await redis.get(`otp_cooldown:${email}`)) {
    return next(
      new ValidationError('Please wait 1 minute before requesting another OTP.')
    );
  }
};

export const trackOtpRequests = async (email: string, next: NextFunction) => {
  const otpRequestKey = `otp_request_count:${email}`;
  let otpRequests = parseInt((await redis.get(otpRequestKey)) || '0');

  if (otpRequests >= 2) {
    await redis.set(`otp_spam_lock:${email}`, 'locked', { ex: 3600 }); // lock for 1 hour lock
    return next(
      new ValidationError(
        'Too many OTP requests! Please wait 1 hour before requesting again.'
      )
    );
  }

  await redis.set(otpRequestKey, otpRequests + 1, { ex: 3600 }); // count resets for 1 hour
};

export const sendOtp = async (
  name: string,
  email: string,
  template: string
) => {
  const otp = crypto.randomInt(1000, 9999).toString();
  await sendEmail(email, 'Verify your email', template, { name, otp });
  await redis.set(`otp:${email}`, otp, {
    ex: 300, // expires in 5 minutes
  });

  //otp attempts
  await redis.set(`otp_cooldown:${email}`, 'true', {
    ex: 60,
    nx: true, // optional: only set if key doesn't exist
  });
  // Cooldown of 60 seconds
};

export const verifyOtp = async (
  email: string,
  otp: string,
  next: NextFunction
) => {
  const storedOtpRaw = await redis.get(`otp:${email}`);
  const storedOtp = String(storedOtpRaw).trim();
  const submittedOtp = String(otp).trim();

  console.log('Stored OTP:', storedOtp);
  console.log('Submitted OTP:', submittedOtp);

  if (!storedOtp) {
    throw new ValidationError('Invalid or expired OTP!');
  }

  const failedAttemptsKey = `otp_attempts:${email}`;
  const failedAttempts = parseInt((await redis.get(failedAttemptsKey)) || '0');

  if (storedOtp !== submittedOtp) {
    if (failedAttempts >= 2) {
      await redis.set(`otp_lock:${email}`, 'locked', { ex: 1800 });
      await redis.del(`otp:${email}`, failedAttemptsKey);
      throw new ValidationError(
        'Account locked due to multiple failed attempts! Try again after 30 minutes.'
      );
    }
    await redis.set(failedAttemptsKey, failedAttempts + 1, { ex: 300 });
    throw new ValidationError(
      `Incorrect OTP! ${2 - failedAttempts} attempts left.`
    );
  }

  await redis.del(`otp:${email}`, failedAttemptsKey);
};
