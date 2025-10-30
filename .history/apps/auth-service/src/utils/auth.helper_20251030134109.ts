import crypto from 'crypto';
import { ValidationError } from '@packages/error-handler';
// import redis from '@packages/libs/redis';
import { Redis } from '@upstash/redis';
import 'dotenv/config';
import { sendEmail } from '../utils/sendMail';
import { Request, Response, NextFunction } from 'express';
import { prisma } from '@eshop/libs/prisma';
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
  email: string
): Promise<ValidationError | null> => {
  if (await redis.get(`otp_lock:${email}`)) {
    return new ValidationError(
      'Account locked due to multiple failed attempts! Try again after 30 minutes.'
    );
  }

  if (await redis.get(`otp_spam_lock:${email}`)) {
    return new ValidationError(
      'Too many OTP requests! Please wait 1 hour before requesting again.'
    );
  }

  if (await redis.get(`otp_cooldown:${email}`)) {
    return new ValidationError(
      'Please wait 1 minute before requesting another OTP.'
    );
  }

  return null; // No restriction
};

export const trackOtpRequests = async (
  email: string
): Promise<ValidationError | null> => {
  // Spam lock: too many requests in short time
  const spamCount = await redis.incr(`otp_spam_count:${email}`);
  if (spamCount === 1) {
    await redis.expire(`otp_spam_count:${email}`, 3600); // 1 hour window
  }
  if (spamCount > 5) {
    await redis.set(`otp_spam_lock:${email}`, '1', { ex: 3600 }); // lock for 1 hour
    return new ValidationError(
      'Too many OTP requests! Please wait 1 hour before requesting again.'
    );
  }

  // Cooldown: 1 minute between requests
  const cooldown = await redis.get(`otp_cooldown:${email}`);
  if (!cooldown) {
    await redis.set(`otp_cooldown:${email}`, '1', { ex: 60 }); // 1 minute cooldown
  }

  return null;
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

export const handleForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
  userType: 'user' | 'seller'
) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new ValidationError('Email is required!');
    }

    // Find user in DB
    const user =
      userType === 'user' ?
      (await prisma.users.findUnique({ where: { email } }));

    if (!user) {
      throw new ValidationError(`${userType} not found`);
    }

    // Check OTP restrictions
    const restrictionError = await checkOtpRestrictions(email);
    if (restrictionError) return next(restrictionError);

    // Track OTP request
    const trackingError = await trackOtpRequests(email);
    if (trackingError) return next(trackingError);

    // Generate OTP and send email
    await sendOtp(
      user.name,
      email,
      userType === 'user'
        ? 'forgot-password-user-mail'
        : 'forgot-password-seller-mail'
    );

    return res.status(200).json({
      message: 'OTP sent to mail. Please verify your account',
    });
  } catch (error) {
    return next(error);
  }
};

export const verifyForgotPasswordOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      throw new ValidationError('Email and OTP are required!');

    await verifyOtp(email, otp, next);

    res.status(200).json({
      message: 'OTP verified successfully. You can now reset your password.',
    });
  } catch (error) {
    next(error);
  }
};
