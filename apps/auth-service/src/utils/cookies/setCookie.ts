import { Response } from 'express';

export const setCookie = (res: Response, name: string, value: string) => {
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie(name, value, {
    httpOnly: true,
    // secure: isProduction ? true : false, // must be false on localhost
    secure: false,
    sameSite: isProduction ? 'none' : 'lax',
    // sameSite: 'lax', // lax for dev, none in prod
    maxAge: 7 * 24 * 60 * 60 * 1000,
    domain: 'localhost', // ensure cookie is valid for gateway domain
  });
};
