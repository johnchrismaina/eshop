import { prisma } from '@packages/libs/prisma/';
import { PrismaClient } from '@prisma/client';
import {
  AuthError,
  NotFoundError,
  ValidationError,
} from '@packages/error-handler';
import { imagekit } from '@packages/libs/imagekit';
import { Prisma } from '@packages/libs/prisma/generated/client';
import { NextFunction, Request, Response } from 'express';
import Stripe from 'stripe';
import { products, deals } from '@prisma/client';
// import { parse } from 'path';
// import { ApiVersion } from 'stripe/types/apiVersion';

//get product categories
export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // const config = await prisma.site_config.findFirst();
    const config = await prisma.site_config.findFirst();
    console.log('Config:', config);

    if (!config) {
      return res.status(404).json({ message: 'Categories not found' });
    }

    return res.status(200).json({
      categories: config.categories,
      subCategories: config.subCategories,
    });
  } catch (error) {
    return next(error);
  }
};

// Create discount codes
export const createDiscountCodes = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { public_name, discountType, discountValue, discountCode } = req.body;

    const isDiscountCodeExist = await prisma.discount_codes.findUnique({
      where: {
        discountCode,
      },
    });
    if (isDiscountCodeExist) {
      return next(
        new ValidationError(
          'Discount code already exists, please use a different code!'
        )
      );
    }

    const discount_code = await prisma.discount_codes.create({
      data: {
        public_name,
        discountType,
        discountValue: parseFloat(discountValue),
        discountCode,
        sellerId: req.seller.id,
      },
    });

    res.status(201).json({
      success: true,
      discount_code,
    });
  } catch (error) {
    return next(error);
  }
};

// Get discount codes
export const getDiscountCodes = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const discount_codes = await prisma.discount_codes.findMany({
      where: {
        sellerId: req.seller.id,
      },
    });

    res.status(201).json({
      success: true,
      discount_codes,
    });
  } catch (error) {
    return next(error);
  }
};

// Delete discount code
export const deleteDiscountCode = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const sellerId = req.seller?.id;

    const discountCode = await prisma.discount_codes.findUnique({
      where: { id },
      select: { id: true, sellerId: true },
    });

    if (!discountCode) {
      return next(new NotFoundError('Discount code not found'));
    }

    if (discountCode.sellerId !== sellerId) {
      return next(new ValidationError('Unauthorized access!'));
    }

    await prisma.discount_codes.delete({ where: { id } });

    res.status(200).json({
      message: 'Discount code successfully deleted',
    });
  } catch (error) {
    next(error);
  }
};

// Upload product image
export const uploadProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const fileBuffer = req.file?.buffer;

    if (!fileBuffer) {
      res.status(400).json({ error: 'No image file provided' });
      return; // ✅ Explicit return to satisfy TypeScript
    }

    const response = await imagekit.upload({
      file: fileBuffer,
      fileName: `product-${Date.now()}.jpg`,
      folder: '/products',
    });

    res.status(201).json({
      file_url: response.url,
      fileId: response.fileId,
    });
  } catch (error) {
    next(error);
  }
};

// Delete product image
export const deleteProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileId } = req.body;

    const response = await imagekit.deleteFile(fileId);

    res.status(201).json({
      success: true,
      message: 'Image deleted successfully',
      response,
    });
  } catch (error) {
    next(error);
  }
};

// Create product
export const createProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  console.log('➡️ Entered createProduct controller');

  try {
    const {
      title,
      slug,
      tags,
      short_description,
      detailed_description,
      accordions = [], // ✅ seller-provided accordions
      video_url,
      category,
      discountCodes,
      stock,
      regular_price,
      sale_price,
      subCategory,
      customProperties = {},
      custom_specifications,
      images = [],
      // ✅ Deal fields
      deal_start,
      deal_end,
    } = req.body;

    if (
      !title ||
      !slug ||
      !short_description ||
      !category ||
      !subCategory ||
      !regular_price ||
      !sale_price ||
      !images ||
      !tags ||
      !stock
    ) {
      return next(new ValidationError('Missing required fields'));
    }

    if (!req.seller.id) {
      return next(new AuthError('Only seller can create products!'));
    }

    // Slug uniqueness check
    const slugChecking = await prisma.products.findUnique({ where: { slug } });
    if (slugChecking) {
      return next(
        new ValidationError('Slug already exists! Please use a different slug!')
      );
    }

    // ✅ Create product
    const newProduct = await prisma.products.create({
      data: {
        title,
        slug,
        tags: Array.isArray(tags) ? tags : tags.split(','),
        short_description,
        detailed_description,
        customProperties,
        custom_specifications,
        accordions, // ✅ save directly as JSON
        category,
        subCategory,
        shopId: req.seller.shops[0].id,
        stock: parseInt(stock),
        regular_price: parseFloat(regular_price),
        discount_codes: discountCodes ?? [],
        video_url,
        images: {
          create: images
            .filter((img: any) => img && img.fileId && img.file_url)
            .map((img: any) => ({
              file_id: img.fileId,
              url: img.file_url,
            })),
        },
      },
      include: { images: true },
    });

    // ✅ Handle deal creation/update with analytics initialization
    let dealRecord = null;
    if (deal_start && deal_end) {
      const existingDeal = await prisma.deals.findUnique({
        where: { productId: newProduct.id },
      });

      if (existingDeal) {
        dealRecord = await prisma.deals.update({
          where: { productId: newProduct.id },
          data: {
            deal_start: new Date(deal_start),
            deal_end: new Date(deal_end),
            sale_price: parseFloat(sale_price),
            regular_price: parseFloat(regular_price),
            // Reset analytics if updating
            views: 0,
            clicks: 0,
            redemptions: 0,
            revenue: 0,
            conversionRate: 0,
            dealRankScore: 0,
            totalSales: 0,
            totalAddToCart: 0,
          },
        });
        console.log('🔄 Deal updated for product:', newProduct.id);
      } else {
        dealRecord = await prisma.deals.create({
          data: {
            slug: slug.trim(), // ✅ required
            deal_start: new Date(deal_start),
            deal_end: new Date(deal_end),
            sale_price: parseFloat(sale_price),
            regular_price: parseFloat(regular_price),
            productId: newProduct.id,
            shopId: req.seller.shops[0].id,
            total_tickets: parseInt(stock), // ✅ initialize from product stock
            available_tickets: parseInt(stock), // ✅ same as total initially
            // ✅ Initialize analytics
            views: 0,
            clicks: 0,
            redemptions: 0,
            revenue: 0,
            conversionRate: 0,
            dealRankScore: 0,
            totalSales: 0,
            totalAddToCart: 0,
          },
        });
        console.log('✅ Deal created for product:', newProduct.id);
      }
    }

    res.status(201).json({
      success: true,
      product: newProduct,
      deal: dealRecord,
    });
  } catch (error) {
    console.error('💥 Error in createProduct:', error);
    next(error);
  }
};

// Create deal
export const createDeal = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  console.log('➡️ Entered createDeal controller');

  try {
    const {
      productId, // ✅ expect productId from client
      slug,
      deal_start,
      deal_end,
      regular_price = 0,
      sale_price,
      total_tickets,
      images = [],
    } = req.body;

    console.log('📦 Incoming body:', req.body);

    // ✅ Required field validation
    if (
      !productId ||
      !deal_start ||
      !deal_end ||
      !sale_price ||
      !total_tickets
    ) {
      return next(new ValidationError('Missing required fields'));
    }

    // ✅ Seller + Shop validation
    if (!req.seller?.id || !req.seller?.shops?.length) {
      return next(
        new AuthError(
          'Only authenticated sellers with a shop can create deals!'
        )
      );
    }

    // ✅ Date validation
    const startDate = new Date(deal_start);
    const endDate = new Date(deal_end);
    const now = new Date();

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return next(new ValidationError('Invalid date format'));
    }
    if (startDate < now) {
      return next(new ValidationError('Deal cannot start in the past'));
    }
    if (startDate > endDate) {
      return next(new ValidationError('Start date cannot be after end date'));
    }

    // ✅ Ticket validation
    const parsedTotalTickets = parseInt(total_tickets);
    if (isNaN(parsedTotalTickets) || parsedTotalTickets <= 0) {
      return next(new ValidationError('Invalid total tickets value'));
    }

    const parsedSalePrice = parseFloat(sale_price);
    if (isNaN(parsedSalePrice) || parsedSalePrice < 0) {
      return next(new ValidationError('Invalid ticket price'));
    }

    // ✅ Ensure product exists
    const product = await prisma.products.findUnique({
      where: { id: productId },
    });
    if (!product) {
      return next(new ValidationError('Product not found for this deal'));
    }

    console.log('🛠 Creating deal in DB...');

    const newDeal = await prisma.deals.create({
      data: {
        productId, // ✅ link to product
        slug: slug.trim(), // ✅ required if schema has slug
        deal_start: startDate,
        deal_end: endDate,
        regular_price: parseFloat(regular_price),
        sale_price: parsedSalePrice,
        total_tickets: parsedTotalTickets, // ✅ camelCase
        available_tickets: parsedTotalTickets, // ✅ camelCase
        shopId: req.seller.shops[0].id,
        views: 0,
        clicks: 0,
        redemptions: 0,
        revenue: 0,
        conversionRate: 0,
        dealRankScore: 0,
        totalSales: 0,
        totalAddToCart: 0,
        images: {
          create: images
            .filter((img: any) => img && img.fileId && img.file_url)
            .map((img: any) => ({
              file_id: img.fileId,
              url: img.file_url,
            })),
        },
      },
      include: {
        images: true,
        product: true,
      },
    });

    console.log('✅ Deal created successfully:', newDeal.id);

    return res.status(201).json({
      success: true,
      newDeal,
    });
  } catch (error) {
    console.error('💥 Error in createDeal:', error);
    next(error);
  }
};

// Get logged in seller products
export const getShopProducts = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await prisma.products.findMany({
      where: {
        shopId: req?.seller?.shop?.id,
      },
      include: {
        images: true,
      },
    });

    res.status(201).json({
      success: true,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// Get single product by slug
export const getProductBySlug = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await prisma.products.findUnique({
      where: { slug: req.params.slug },
      include: { images: true },
    });

    if (!product) {
      // Always send a response here
      res.status(404).json({ success: false, message: 'Product not found' });
      return; // exit early so TS knows this path is covered
    }

    // Success path
    res.status(200).json({ success: true, product });
  } catch (error) {
    // Error path
    next(error);
  }
};

// Get logged in seller deals
export const getShopDeals = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const deals = await prisma.deals.findMany({
      where: {
        shopId: req?.seller?.shop?.id,
      },
      include: {
        images: true,
      },
    });

    res.status(201).json({
      success: true,
      deals,
    });
  } catch (error) {
    next(error);
  }
};

// Delete product
export const deleteProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;

    console.log('DeleteProduct controller hit, productId:', productId);

    if (!req.seller) {
      console.log('No seller attached → Unauthorized');
      return next(new ValidationError('Unauthorized action'));
    }

    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: { id: true, shopId: true, isDeleted: true },
    });

    if (!product) {
      console.log('Product not found in DB');
      return next(new ValidationError('Product not found'));
    }

    console.log('Product shopId:', product.shopId);
    console.log('Seller shopIds:', req.seller.shopIds);

    if (!req.seller.shopIds.includes(product.shopId)) {
      console.log('Shop mismatch → Unauthorized');
      return next(new ValidationError('Unauthorized action'));
    }

    if (product.isDeleted) {
      console.log('Product already deleted');
      return next(new ValidationError('Product is already deleted'));
    }

    const deletedProduct = await prisma.products.update({
      where: { id: productId },
      data: {
        isDeleted: true,
        deletedAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    console.log('req.seller.shopIds:', req.seller.shopIds);
    console.log('product.shopId:', product.shopId);
    console.log('product.isDeleted:', product.isDeleted);

    console.log('Delete response sent');

    return res.status(200).json({
      message:
        'Product is scheduled for deletion in 24 hours. You can restore it within this time',
      deletedAt: deletedProduct.deletedAt,
    });
  } catch (error) {
    return next(error);
  }
};

// Delete deal
export const deleteDeal = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { dealId } = req.params;
    const sellerId = req.seller?.shops?.[0]?.id; // ✅ use shops[0].id

    const deal = await prisma.deals.findUnique({
      where: { id: dealId },
      select: { id: true, shopId: true, isDeleted: true },
    });

    if (!deal) {
      return next(new ValidationError('Deal not found'));
    }

    if (deal.shopId !== sellerId) {
      return next(new ValidationError('Unauthorized action'));
    }

    if (deal.isDeleted) {
      return next(new ValidationError('Deal is already deleted'));
    }

    const deletedDeal = await prisma.deals.update({
      where: { id: dealId },
      data: {
        isDeleted: true,
        deletedAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // ✅ 2 hours
      },
    });

    return res.status(200).json({
      message:
        'Deal is scheduled for deletion in 2 hours. You can restore it within this time',
      deletedAt: deletedDeal.deletedAt,
    });
  } catch (error) {
    return next(error);
  }
};

// Restore product
export const restoreProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;

    // const sellerId = req.seller?.shop?.id;
    // ✅ Use all shop IDs attached in middleware
    const sellerShopIds = req.seller?.shopIds || [];

    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: { id: true, shopId: true, isDeleted: true },
    });

    if (!product) {
      return next(new ValidationError('Product not found'));
    }

    // if (product.shopId !== sellerId) {
    //   return next(new ValidationError('Unauthorized action'));
    // }
    // ✅ Check against all shop IDs
    if (!sellerShopIds.includes(product.shopId)) {
      return next(new ValidationError('Unauthorized action'));
    }

    if (!product.isDeleted) {
      return res
        .status(400)
        .json({ message: 'Product is not in deleted state' });
    }

    await prisma.products.update({
      where: { id: productId },
      data: { isDeleted: false, deletedAt: null },
    });

    return res.status(200).json({ message: 'Product successfully restored!' });
  } catch (error) {
    return res.status(500).json({ message: 'Error restoring product', error });
  }
};

// Restore deal
export const restoreDeal = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { dealId } = req.params;
    const sellerId = req.seller?.shops?.[0]?.id; // ✅ match deleteDeal logic

    const deal = await prisma.deals.findUnique({
      where: { id: dealId },
      select: { id: true, shopId: true, isDeleted: true, deletedAt: true },
    });

    if (!deal) {
      return next(new ValidationError('Deal not found'));
    }

    if (deal.shopId !== sellerId) {
      return next(new ValidationError('Unauthorized action'));
    }

    if (!deal.isDeleted) {
      return res.status(400).json({ message: 'Deal is not in deleted state' });
    }

    // ✅ Optional: check if restore window expired
    if (deal.deletedAt && deal.deletedAt < new Date()) {
      return res.status(400).json({
        message: 'Restore window has expired. Deal is permanently deleted.',
      });
    }

    await prisma.deals.update({
      where: { id: dealId },
      data: { isDeleted: false, deletedAt: null },
    });

    return res.status(200).json({ message: 'Deal successfully restored!' });
  } catch (error) {
    return next(error);
  }
};

// Get seller stripe information
export const getStripeAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: '2025-10-29.clover', // always pin API version
    });

    // 1. Extract sellerId from request (could be params or auth middleware)
    const { sellerId } = req.params;

    if (!sellerId) {
      return res.status(400).json({ error: 'Seller ID is required' });
    }

    // 2. Look up seller in DB
    const seller = await prisma.sellers.findUnique({
      where: { id: sellerId },
      select: { stripeId: true },
    });

    if (!seller || !seller.stripeId) {
      return res
        .status(404)
        .json({ error: 'Seller or Stripe account not found' });
    }

    // 3. Fetch account details from Stripe
    const account = await stripe.accounts.retrieve(seller.stripeId);

    // 4. Return safe subset of account info
    return res.status(200).json({
      id: account.id,
      email: account.email,
      business_type: account.business_type,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      requirements: account.requirements,
    });
  } catch (err) {
    console.error('Error fetching Stripe account:', err);
    return next(err); // pass to error middleware
  }
};

// Get all products
export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const prisma = new PrismaClient();
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const type = req.query.type;

    const baseFilter = {
      isDeleted: false,
    };

    const orderBy: Prisma.productsOrderByWithRelationInput =
      type === 'latest'
        ? { createdAt: 'desc' }
        : ({ totalSales: 'desc' } as Prisma.productsOrderByWithRelationInput);

    const [products, total, top10Products] = await Promise.all([
      prisma.products.findMany({
        skip,
        take: limit,
        include: {
          images: true,
          Shop: true,
        },
        where: baseFilter,
        orderBy,
      }),

      prisma.products.count({ where: baseFilter }),
      prisma.products.findMany({
        take: 10,
        where: baseFilter,
        orderBy,
      }),
    ]);

    res.status(200).json({
      products,
      top10By: type === 'latest' ? 'latest' : 'topSales',
      top10Products,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

// Get product details
export const getProductDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let product: ((products | deals) & { images: any; Shop: any }) | null =
      null;

    product = await prisma.products.findUnique({
      where: { slug: req.params.slug! },
      include: { images: true, Shop: true },
    });

    if (!product) {
      product = await prisma.deals.findUnique({
        where: { slug: req.params.slug! },
        include: { images: true, Shop: true },
      });
    }

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// Get filtered products
export const getFilteredProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      priceRange = [0, 10000],
      categories = [],
      colors = [],
      sizes = [],
      page = 1,
      limit = 12,
    } = req.query;

    const parsedPriceRange =
      typeof priceRange === 'string'
        ? priceRange.split(',').map(Number)
        : [0, 10000];

    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    const skip = (parsedPage - 1) * parsedLimit;

    const filters: Record<string, any> = {
      sale_price: {
        gte: parsedPriceRange[0],
        lte: parsedPriceRange[1],
      },
      // starting_date: null,
    };

    if (categories && (categories as string[]).length > 0) {
      filters.category = {
        in: Array.isArray(categories)
          ? categories
          : String(categories).split(','),
      };
    }

    if (colors && (colors as string[]).length > 0) {
      filters.colors = {
        hasSome: Array.isArray(colors) ? colors : [colors],
      };
    }

    if (sizes && (sizes as string[]).length > 0) {
      filters.sizes = {
        hasSome: Array.isArray(sizes) ? sizes : [sizes],
      };
    }

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where: filters,
        skip,
        take: parsedLimit,
        include: {
          images: true,
          Shop: true,
        },
      }),
      prisma.products.count({ where: filters }),
    ]);

    const totalPages = Math.ceil(total / parsedLimit);

    res.json({
      products,
      pagination: {
        total,
        page: parsedPage,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all deals
export const getAllDeals = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Base filter: only deals with valid dates and not deleted
    const baseFilter = {
      AND: [
        { deal_start: { not: undefined } },
        { deal_end: { not: undefined } },
        { isDeleted: false },
      ],
    };

    // Count total deals
    const total = await prisma.deals.count({ where: baseFilter });

    // ✅ Default ordering: use dealtRankScore if we have enough deals
    let orderLogic: any = { createdAt: 'desc' };

    if (total >= 10) {
      orderLogic = { dealRankScore: 'desc' }; // rank by score
    }

    const [deals, top10Upcoming] = await Promise.all([
      prisma.deals.findMany({
        skip,
        take: limit,
        where: baseFilter,
        include: {
          images: true,
          Shop: true,
        },
        orderBy: orderLogic,
      }),

      prisma.deals.findMany({
        where: baseFilter,
        take: 10,
        orderBy: { deal_start: 'asc' }, // upcoming deals list
      }),
    ]);

    res.status(200).json({
      deals: deals || [],
      top10Upcoming: top10Upcoming || [],
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('getAllDeals error:', error);
    res.status(500).json({ message: 'Failed to fetch deals', deals: [] });
  }
};

// Get filtered offers
export const getFilteredDeals = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      priceRange = [0, 10000],
      categories = [],
      colors = [],
      sizes = [],
      page = 1,
      limit = 12,
    } = req.query;

    const parsedPriceRange =
      typeof priceRange === 'string'
        ? priceRange.split(',').map(Number)
        : [0, 10000];

    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    const skip = (parsedPage - 1) * parsedLimit;

    const filters: Record<string, any> = {
      sale_price: {
        gte: parsedPriceRange[0],
        lte: parsedPriceRange[1],
      },
      NOT: { deal_start: null },
    };

    if (categories && (categories as string[]).length > 0) {
      filters.category = {
        in: Array.isArray(categories)
          ? categories
          : String(categories).split(','),
      };
    }

    if (colors && (colors as string[]).length > 0) {
      filters.colors = {
        hasSome: Array.isArray(colors) ? colors : [colors],
      };
    }

    if (sizes && (sizes as string[]).length > 0) {
      filters.sizes = {
        hasSome: Array.isArray(sizes) ? sizes : [sizes],
      };
    }

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where: filters,
        skip,
        take: parsedLimit,
        include: {
          images: true,
          Shop: true,
        },
      }),
      prisma.products.count({ where: filters }),
    ]);

    const totalPages = Math.ceil(total / parsedLimit);

    res.json({
      products,
      pagination: {
        total,
        page: parsedPage,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get filtered shops
export const getFilteredShops = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { categories = [], countries = [], page = 1, limit = 12 } = req.query;

    const parsedPage = Number(page);
    const parsedLimit = Number(limit);
    const skip = (parsedPage - 1) * parsedLimit;

    const filters: Record<string, any> = {};

    if (categories && String(categories).length > 0) {
      filters.category = {
        in: Array.isArray(categories)
          ? categories
          : String(categories).split(','),
      };
    }

    if (countries && String(countries).length > 0) {
      filters.country = {
        in: Array.isArray(countries) ? countries : String(countries).split(','),
      };
    }

    const [shops, total] = await Promise.all([
      prisma.shops.findMany({
        where: filters,
        skip,
        take: parsedLimit,
        include: {
          seller: true,
          followers: true,
          products: true,
        },
      }),
      prisma.shops.count({ where: filters }),
    ]);

    const totalPages = Math.ceil(total / parsedLimit);

    res.json({
      shops,
      pagination: {
        total,
        page: parsedPage,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Search products
export const searchProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = req.query.q as string;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: 'Search query is required.' });
    }

    const products = await prisma.products.findMany({
      where: {
        OR: [
          {
            title: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
      },
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json({ products });
  } catch (error) {
    return next(error);
  }
};

//  Top shops
export const topShops = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Quick debug: check if any orders exist
    // const orders = await prisma.order.findMany({ take: 5 });
    // console.log('orders sample:', orders);

    // Aggregate total sales per shop from orders
    const topShopsData = await prisma.orders.groupBy({
      by: ['shopId'],
      _sum: {
        total: true,
      },
      orderBy: {
        _sum: {
          total: 'desc',
        },
      },
      take: 10,
    });

    // console.log('topShopsData', topShopsData);

    const shopIds = topShopsData.map((item) => item.shopId);

    // console.log('shopIds', shopIds);

    const shops = await prisma.shops.findMany({
      where: {
        id: {
          in: shopIds,
        },
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        coverBanner: true,
        address: true,
        ratings: true,
        followers: true,
        category: true,
      },
    });

    // Merge sales with shop data
    const enrichedShops = shops.map((shop) => {
      const salesData = topShopsData.find((s) => s.shopId === shop.id);
      return {
        ...shop,
        totalSales: salesData?._sum.total ?? 0,
      };
    });

    const top10Shops = enrichedShops
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 10);

    return res.status(200).json({ shops: top10Shops });
  } catch (error) {
    console.error('Error fetching top shops:', error);
    return next(error);
  }
};

// Update shop details
export const updateShopDetails = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      shopId, // the specific shop the seller wants to update
      bio,
      address,
      opening_hours,
      coverBanner,
      avatar,
      website,
      socialLinks, // JSON object for social links
    } = req.body;

    // Update the specific shop
    const shop = await prisma.shops.update({
      where: {
        id: shopId,
      },
      data: {
        bio,
        address,
        opening_hours,
        coverBanner,
        avatar,
        website,
        socialLinks,
      },
    });

    res.status(200).json({
      success: true,
      shop,
    });
  } catch (error) {
    return next(error);
  }
};
