import { Request, Response, NextFunction } from 'express';
import {
  sendOtp,
  validateRegistrationData,
  checkOtpRestrictions,
  trackOtpRequests,
  verifyOtp,
  verifyForgotPasswordOtp,
} from '../utils/auth.helper';
import bcrypt from 'bcryptjs';
import { prisma } from '@eshop/libs/prisma';
import { AuthError, ValidationError } from '../../../../packages/error-handler';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import { setCookie } from '@auth/utils/cookies/setCookie';

//Register a new user
export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegistrationData(req.body, 'user');
    const { name, email } = req.body;

    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return next(new ValidationError('User with this email already exists!'));
    }

    await checkOtpRestrictions(email);
    await trackOtpRequests(email);
    await sendOtp(name, email, 'user-activation-mail');

    res.status(200).json({
      message: 'OTP sent to your email. Please verify your account!',
    });
  } catch (error) {
    next(error);
  }
};

// Verify user with otp
export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, password, name } = req.body;
    if (!email || !otp || !password || !name) {
      return next(
        new ValidationError('Email, OTP, name and password are required!')
      );
    }
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return next(new ValidationError('User already exists with this email!'));
    }

    await verifyOtp(email, otp, next);
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.users.create({
      data: { name, email, password: hashedPassword },
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Login user
export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // const { email, password } = req.body;
    const email = String(req.body.email || '')
      .trim()
      .toLowerCase();
    const password = String(req.body.password || '').trim();

    if (!email || !password) {
      return next(new ValidationError('Email and password are required!'));
    }
    // if email and password are present, check if user exists
    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) {
      return next(new AuthError("User doesn't exist!"));
    }

    // verify password if the user is available in our database
    const isMatch = await bcrypt.compare(password, user.password!);

    if (!isMatch) {
      return next(new AuthError('Invalid email or password!'));
    }

    // Generate token and refresh token
    const accessToken = jwt.sign(
      { Id: user.id, role: 'user' },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { Id: user.id, role: 'user' },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: '7d' }
    );

    //  store the refresh and access token in httpOnly secure cookies
    setCookie(res, 'refresh_token', refreshToken);
    setCookie(res, 'access_token', accessToken);

    res.status(200).json({
      message: 'Login successful!',
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    return next(error);
  }
};

// Refresh token user
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      return new ValidationError('Unauthorized! No refresh token');
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as { id: string; role: string };

    if (!decoded || !decoded.id || !decoded.role) {
      return new JsonWebTokenError('Forbidden! Invalid refresh token.');
    }

    // let account;
    // if(decoded.role === "user")
    await prisma.users.findUnique({ where: { id: decoded.id } });

  } catch (error) {
    return next(error);
  }
};

// user forgot password
export const userForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new ValidationError('Email is required!');
    }

    // Find user in DB
    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) {
      throw new ValidationError('User not found');
    }

    // Check OTP restrictions
    const restrictionError = await checkOtpRestrictions(email);
    if (restrictionError) return next(restrictionError);

    // Track OTP request
    const trackingError = await trackOtpRequests(email);
    if (trackingError) return next(trackingError);

    // Send OTP email
    await sendOtp(user.name, email, 'forgot-password-user-mail');

    return res.status(200).json({
      message: 'OTP sent to mail. Please verify your account',
    });
  } catch (error) {
    return next(error);
  }
};

// Verify forgot password otp
export const verifyUserForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await verifyForgotPasswordOtp(req, res, next);
};

// Reset user password
export const resetUserPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword)
      return next(new ValidationError('Email and new password are required!'));

    // Search user in database
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return next(new ValidationError('User not found!'));

    // compare new password with old password if user is found
    const isSamePassword = await bcrypt.compare(newPassword, user.password!);
    if (isSamePassword) {
      return next(
        new ValidationError(
          'New password must be different from the old password!'
        )
      );
    }

    // hash the new paswword and update in database
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.users.update({
      where: { email },
      data: { password: hashedPassword },
    });
    res.status(200).json({ message: 'Password reset successful!' });
  } catch (error) {
    next(error);
  }
};
