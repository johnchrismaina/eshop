import { prisma } from '../libs/prisma/index.js';
import { Response, NextFunction } from 'express';
import jwt, { TokenExpiredError } from 'jsonwebtoken';

const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
  try {
    console.log('Cookies:', req.cookies);
    console.log('isAuthenticated middleware called');

    const token =
      req.cookies['access_token'] ||
      req.cookies['seller-access-token'] ||
      req.cookies['admin-access-token'];

    // ✅ If no token, treat as guest
    if (!token) {
      console.log('No token found in cookies → guest');
      req.role = 'guest';
      req.user = null;
      req.seller = null;
      req.admin = null;
      return next();
    }

    let decoded: { id: string; role: 'user' | 'seller' | 'admin' } | null =
      null;

    try {
      decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
        id: string;
        role: 'user' | 'seller' | 'admin';
      };
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        console.log('Token expired → clearing cookie and guest fallback');
        // Clear whichever cookie was set
        res.clearCookie('access_token');
        res.clearCookie('seller-access-token');
        res.clearCookie('admin-access-token');
      } else {
        console.log('JWT verification failed:', err);
      }

      req.role = 'guest';
      req.user = null;
      req.seller = null;
      req.admin = null;
      return next();
    }

    if (!decoded) {
      console.log('Invalid token → guest');
      req.role = 'guest';
      return next();
    }

    req.role = decoded.role;

    let account;

    if (decoded.role === 'user') {
      account = await prisma.users.findUnique({ where: { id: decoded.id } });
      req.user = account;
    } else if (decoded.role === 'seller') {
      account = await prisma.sellers.findUnique({
        where: { id: decoded.id },
        include: { shops: true },
      });
      req.seller = account;

      // ✅ Normalize: attach first shop as req.seller.shop
      if (account?.shops && account.shops.length > 0) {
        req.seller.shop = account.shops[0];
      }

      // Optional: also attach all shop IDs for multi-shop checks
      req.seller.shopIds = account?.shops.map((s) => s.id) || [];
    } else if (decoded.role === 'admin') {
      account = await prisma.admins.findUnique({ where: { id: decoded.id } });
      req.admin = account;
    }

    if (!account) {
      console.log('Account not found → guest');
      req.role = 'guest';
      return next();
    }

    // console.log('Decoded role:', req.role);
    // console.log('Attached user:', req.user);
    // console.log('Attached seller:', req.seller);
    // console.log('Attached admin:', req.admin);

    return next();
  } catch (error) {
    console.log('Unexpected error in isAuthenticated:', error);
    req.role = 'guest';
    req.user = null;
    req.seller = null;
    req.admin = null;
    return next();
  }
};

export default isAuthenticated;
