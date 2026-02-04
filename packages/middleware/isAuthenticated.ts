import { prisma } from '@eshop/libs/prisma';
import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
  try {
    console.log('Cookies:', req.cookies);
    // console.log('Auth header:', req.headers.authorization);

    console.log('isAuthenticated middleware called');

    const token =
      req.cookies['access_token'] ||
      req.cookies['seller-access-token'] ||
      req.cookies['admin-access-token'];
    // req.headers.authorization?.split(' ')[1];

    if (!token) {
      console.log('No token found in cookies');
      return res.status(401).json({ message: 'Unauthorized! token missing.' });
    }
    // verify token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
      id: string;
      role: 'user' | 'seller' | 'admin';
    };

    if (!decoded) {
      return res.status(401).json({ message: 'Unauthorized! Invalid token.' });
    }

    req.role = decoded.role; // ✅ set role immediately

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
      console.log('Decoded admin token, role:', req.role);
      account = await prisma.admins.findUnique({ where: { id: decoded.id } });
      req.admin = account;
    }

    if (!account) {
      return res.status(401).json({ message: 'Account not found!' });
    }

    console.log('Decoded role:', req.role);
    console.log('Attached user:', req.user);
    console.log('Attached seller:', req.seller);
    console.log('Attached admin:', req.admin);

    console.log('Decoded JWT:', decoded);

    return next();
  } catch (error) {
    console.log('JWT verification failed:', error);
    return res
      .status(401)
      .json({ message: 'Unauthorized! Token expired or invalid.' });
  }
};

export default isAuthenticated;
