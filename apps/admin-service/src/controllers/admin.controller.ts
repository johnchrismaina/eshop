import { prisma } from '@eshop/libs/prisma';
import { NextFunction, Request, Response } from 'express';

// get all products
export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [products, totalProducts] = await Promise.all([
      prisma.products.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          sale_price: true,
          createdAt: true,
          ratings: true,
          category: true,
          images: { select: { url: true }, take: 1 },
          Shop: { select: { name: true } },
        },
      }),
      prisma.products.count(),
    ]);

    const totalPages = Math.ceil(totalProducts / limit);

    res.set('Cache-Control', 'no-store');

    res.status(200).json({
      success: true,
      data: products,
      meta: {
        totalProducts,
        currentPage: page,
        totalPages,
      },
    });
  } catch (error) {
    console.error('getAllProducts error:', error);
    next(error);
  }
};
