import { Request, Response, NextFunction } from 'express';
import {
  sendOtp,
  validateRegistrationData,
  checkOtpRestrictions,
  trackOtpRequests,
} from '../utils/auth.helper';
// import prisma from '../../../../packages/libs/prisma';
import { PrismaClient } from '@prisma/client';
import { ValidationError } from '../../../../packages/error-handler';

//Register a new user
export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegistrationData(req.body, 'user');
    const { name, email } = req.body;

    const existingUser = await PrismaClient.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return next(new ValidationError('User with this email already exists!'));
    }

    await checkOtpRestrictions(email, next);
    await trackOtpRequests(email, next);
    await sendOtp(email, name, 'user-activation-mail');

    res.status(200).json({
      message: 'OTP sent to your email. Please verify your account!',
    });
  } catch (error) {
    next(error);
  }
};
