import { Response } from 'express';

export const setCookie = (res: Response, name: string, value: string) => {
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie(name, value, {
    httpOnly: true,
    secure: isProduction, // true in production, false in development
    sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-site cookies in prod, 'lax' for dev
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};
