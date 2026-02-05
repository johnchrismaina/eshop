import { prisma } from '@eshop/libs/prisma';
import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

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
      return next(); // allow request to continue as guest
    }

    // verify token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
      id: string;
      role: 'user' | 'seller' | 'admin';
    };

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
        include: { shop: true },
      });
      req.seller = account;
    } else if (decoded.role === 'admin') {
      account = await prisma.admins.findUnique({ where: { id: decoded.id } });
      req.admin = account;
    }

    if (!account) {
      console.log('Account not found → guest');
      req.role = 'guest';
      return next();
    }

    console.log('Decoded role:', req.role);
    console.log('Attached user:', req.user);
    console.log('Attached seller:', req.seller);
    console.log('Attached admin:', req.admin);

    return next();
  } catch (error) {
    console.log('JWT verification failed:', error);
    // ✅ fallback to guest instead of 401
    req.role = 'guest';
    req.user = null;
    req.seller = null;
    req.admin = null;
    return next();
  }
};

export default isAuthenticated;
