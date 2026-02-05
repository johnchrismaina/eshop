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
import {
  AuthError,
  NotFoundError,
  ValidationError,
} from '../../../../packages/error-handler';
// import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';
import { setCookie } from '@auth/utils/cookies/setCookie';
import Stripe from 'stripe';
import { sendLog } from '@packages/utils/logs/send-logs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

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
    const email = String(req.body.email || '')
      .trim()
      .toLowerCase();
    const password = String(req.body.password || '').trim();

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required!' });
    }

    // Check if user exists
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "User doesn't exist!" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password!' });
    }

    // Clear any seller/admin cookies
    res.clearCookie('seller-access-token');
    res.clearCookie('seller-refresh-token');
    res.clearCookie('admin-access-token');
    res.clearCookie('admin-refresh-token');

    // Generate tokens
    const accessToken = jwt.sign(
      { id: user.id, role: 'user' },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id, role: 'user' },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: '7d' }
    );

    // Store tokens in httpOnly cookies
    setCookie(res, 'access_token', accessToken);
    setCookie(res, 'refresh_token', refreshToken);

    return res.status(200).json({
      message: 'Login successful!',
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    return next(error);
  }
};

// Refresh token
export const refreshToken = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('refresh token called');
    console.log('Incoming cookies:', req.cookies);

    const refreshToken =
      req.cookies['refresh_token'] ||
      req.cookies['seller-refresh-token'] ||
      req.cookies['admin-refresh-token'];

    if (!refreshToken) {
      return res
        .status(401)
        .json({ message: 'Unauthorized! No refresh token' });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as {
        id: string;
        role: 'user' | 'seller' | 'admin';
      };
    } catch (err) {
      console.log('JWT refresh verification failed:', err);
      return res
        .status(403)
        .json({ message: 'Forbidden! Invalid refresh token.' });
    }

    // validate account exists
    let account;
    if (decoded.role === 'user') {
      account = await prisma.users.findUnique({ where: { id: decoded.id } });
    } else if (decoded.role === 'seller') {
      account = await prisma.sellers.findUnique({
        where: { id: decoded.id },
        include: { shop: true },
      });
    } else if (decoded.role === 'admin') {
      account = await prisma.admins.findUnique({ where: { id: decoded.id } });
    }

    if (!account) {
      return res
        .status(401)
        .json({ message: `Unauthorized! ${decoded.role} not found.` });
    }

    // issue new access token
    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: '15m' }
    );

    // set cookie
    if (decoded.role === 'user') {
      setCookie(res, 'access_token', newAccessToken);
    } else if (decoded.role === 'seller') {
      setCookie(res, 'seller-access-token', newAccessToken);
    } else if (decoded.role === 'admin') {
      setCookie(res, 'admin-access-token', newAccessToken);
    }

    console.log('Set-Cookie header:', res.getHeaders()['set-cookie']);

    return res.status(200).json({ success: true });
  } catch (error) {
    return next(error);
  }
};

// get logged in user
export const getUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    console.log('Reached logged-in-user route');

    // role is always set by isAuthenticated middleware
    const role = req.role || 'guest';

    // Only attach user account if role === 'user'
    let user = null;
    if (role === 'user') {
      user = req.user;
    }

    // For guest, user stays null
    res.status(200).json({
      success: true,
      role, // "user" or "guest"
      user, // user object if logged in, null if guest
    });
  } catch (error) {
    next(error);
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

// Update user password
export const updateUserPassword = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return next(new ValidationError('All fields are required'));
    }

    if (newPassword !== confirmPassword) {
      return next(new ValidationError('New passwords do not match'));
    }

    if (currentPassword === newPassword) {
      return next(
        new ValidationError(
          'New password cannot be the same as the current password'
        )
      );
    }

    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password) {
      return next(new AuthError('User not found or password not set'));
    }

    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordCorrect) {
      return next(new AuthError('Current password is incorrect'));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.users.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

// Login admin
export const loginAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ValidationError('Email and password are required!'));
    }

    const admin = await prisma.admins.findUnique({ where: { email } });

    if (!admin) return next(new AuthError('Admin does not exist! '));

    // verify password
    const isMatch = await bcrypt.compare(password, admin.password!);
    if (!isMatch) {
      return next(new AuthError('Invalid email or password'));
    }

    const isAdmin = admin.role === 'admin';

    if (!isAdmin) {
      sendLog({
        type: 'error',
        message: `Admin login failed for ${email} - not an admin`,
        source: 'auth-service',
      });
      return next(new AuthError('Invalid access!'));
    }

    sendLog({
      type: 'success',
      message: `Admin login successful: ${email}`,
      source: 'auth-service',
    });

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    res.clearCookie('seller-access-token');
    res.clearCookie('seller-refresh-token');

    // Generate access and refresh token
    const accessToken = jwt.sign(
      { id: admin.id, role: 'admin' },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: '15m',
      }
    );

    const refreshToken = jwt.sign(
      { id: admin.id, role: 'admin' },
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: '7d',
      }
    );

    // Store the refresh and access token in an httpOnly secure cookie
    setCookie(res, 'admin-refresh-token', refreshToken);
    setCookie(res, 'admin-access-token', accessToken);

    res.status(200).json({
      message: 'Login successful!',
      admin: { id: admin.id, email: admin.email },
    });
  } catch (error) {
    return next(error);
  }
};

// get logged in admin
export const getAdmin = async (req: any, res: Response, next: NextFunction) => {
  try {
    console.log('getAdmin middleware called');

    const admin = req.admin;
    res.status(201).json({
      success: true,
      admin,
    });
  } catch (error) {
    next(error);
  }
};

// Rgister a new seller
export const registerSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegistrationData(req.body, 'seller');
    const { name, email } = req.body;

    const existingSeller = await prisma.sellers.findUnique({
      where: { email },
    });

    if (existingSeller) {
      throw new ValidationError('Seller already exists with this email');
    }

    await checkOtpRestrictions(email);
    await trackOtpRequests(email);
    await sendOtp(name, email, 'seller-activation');

    res
      .status(200)
      .json({ message: 'OTP sent to email. Please verify your account.' });
  } catch (error) {
    next(error);
  }
};

// Verify seller with OTP
export const verifySeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, password, name, phone_number, country } = req.body;
    if (!email || !otp || !password || !name || !phone_number || !country) {
      return next(new ValidationError('All fields are required!'));
    }

    const existingSeller = await prisma.sellers.findUnique({
      where: { email },
    });

    if (existingSeller)
      return next(new ValidationError('Seller with this email already exists'));

    await verifyOtp(email, otp, next);
    const hashedPassword = await bcrypt.hash(password, 10);

    const seller = await prisma.sellers.create({
      data: {
        name,
        email,
        password: hashedPassword,
        country,
        phone_number,
      },
    });

    res
      .status(201)
      .json({ seller, message: 'Seller registered successfully!' });
  } catch (error) {
    next(error);
  }
};

//  login seller
export const loginSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return next(new ValidationError('Email and password as requried!'));

    const seller = await prisma.sellers.findUnique({ where: { email } });
    if (!seller)
      return next(new ValidationError('Invalid email and password!'));

    // Verify password
    const isMatch = await bcrypt.compare(password, seller.password!);
    if (!isMatch)
      return next(new ValidationError('Invalid email and password!'));

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    res.clearCookie('admin-access-token');
    res.clearCookie('admin-refresh-token');

    // Generate access and refresh token
    const accessToken = jwt.sign(
      { id: seller.id, role: 'seller' },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: seller.id, role: 'seller' },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: '7d' }
    );

    //  store refresh and access token in http Only secure cookies
    setCookie(res, 'seller-refresh-token', refreshToken);
    setCookie(res, 'seller-access-token', accessToken);

    res.status(200).json({
      message: 'Login successful!',
      seller: { id: seller.id, email: seller.email, name: seller.name },
    });
  } catch (error) {
    next(error);
  }
};

// get logged in seller
export const getSeller = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const seller = req.seller;
    res.status(201).json({
      success: true,
      seller,
    });
  } catch (error) {
    next(error);
  }
};

// logout seller
export const logoutSeller = async (req: Request, res: Response) => {
  try {
    // Clear seller cookies
    res.clearCookie('seller-access-token', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });
    res.clearCookie('seller-refresh-token', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    // Optional: invalidate refresh token in DB/Redis if you store them
    // await redis.del(`seller-refresh:${req.seller?.id}`);

    return res.status(200).json({ message: 'Seller logged out successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Logout failed', error });
  }
};

// Create a new shop
export const createShop = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, bio, address, opening_hours, website, category, sellerId } =
      req.body;

    if (
      !name ||
      !bio ||
      !address ||
      !opening_hours ||
      !website ||
      !category ||
      !sellerId
    ) {
      return next(new ValidationError('All fields are required!'));
    }

    const shopData: any = {
      name,
      bio,
      address,
      opening_hours,
      category,
      sellerId,
    };

    if (website && website.trim() !== '') {
      shopData.website = website;
    }

    const shop = await prisma.shops.create({
      data: shopData,
    });

    res.status(201).json({
      success: true,
      shop,
    });
  } catch (error) {
    next(error);
  }
};

// Create stripe connect account link
export const createStripeConnectLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sellerId } = req.body;

    if (!sellerId) return next(new ValidationError('Seller ID is required!'));

    const seller = await prisma.sellers.findUnique({
      where: {
        id: sellerId,
      },
    });

    if (!seller) {
      return next(new ValidationError('Seller is not available with this Id'));
    }

    const account = await stripe.accounts.create({
      type: 'express',
      email: seller?.email,
      country: 'US',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    await prisma.sellers.update({
      where: {
        id: sellerId,
      },
      data: {
        stripeId: account.id,
      },
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `http://localhost:3000/success`,
      return_url: `http://localhost:3000/success`,
      type: 'account_onboarding',
    });

    res.json({ url: accountLink.url });
  } catch (error) {
    return next(error);
  }
};

// Add new address
export const addUserAddress = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { label, name, street, city, zip, country, isDefault } = req.body;

    if (!label || !name || !street || !city || !zip || !country) {
      return next(new ValidationError('All fields are required'));
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: {
          userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId,
        label,
        name,
        street,
        city,
        zip,
        country,
        isDefault,
      },
    });

    res.status(201).json({
      success: true,
      address: newAddress,
    });
  } catch (error) {
    return next(error);
  }
};

// Delete user address
export const deleteUserAddress = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { addressId } = req.params;

    if (!addressId) {
      return next(new ValidationError('Address ID is required'));
    }

    const existingAddress = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId,
      },
    });

    if (!existingAddress) {
      return next(new NotFoundError('Address not found or unauthorized'));
    }

    await prisma.address.delete({
      where: {
        id: addressId,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully',
    });
  } catch (error) {
    return next(error);
  }
};

// Get user addresses
export const getUserAddresses = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    const addresses = await prisma.address.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      success: true,
      addresses,
    });
  } catch (error) {
    return next(error);
  }
};

// fetch layout data
export const getLayoutData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const layout = await prisma.site_config.findFirst();

    res.status(200).json({
      success: true,
      layout,
    });
  } catch (error) {
    next(error);
  }
};
