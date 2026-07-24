import { prisma } from '@packages/libs/prisma/';
import { PrismaClient } from '@prisma/client';
import {
  AuthError,
  NotFoundError,
  ValidationError,
} from '@packages/error-handler';
import { imagekit } from '@packages/libs/imagekit';
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

// Create product (no deal fields)
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
      product_details = {},
      video_url,
      category,
      discountCodes,
      stock,
      regular_price,
      subCategory,
      custom_properties = {},
      product_specifications = {},
      images = [],
    } = req.body;

    if (
      !title ||
      !slug ||
      !short_description ||
      !category ||
      !subCategory ||
      !regular_price ||
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
        custom_properties,
        product_specifications,
        product_details,
        category,
        subCategory,
        shopId: req.seller.shops[0].id,
        stock: parseInt(stock),
        regular_price: parseFloat(regular_price),
        discount_codes: discountCodes ?? [],
        video_url,
        isDeal: false, // ✅ always false at creation
        images: {
          create: images
            .filter((img: any) => img && img.fileId && img.file_url)
            .map((img: any) => ({
              file_id: img.fileId,
              url: img.file_url,
            })),
        },
      },
    });

    const productWithRelations = await prisma.products.findUnique({
      where: { id: newProduct.id },
      include: { images: true },
    });

    res.status(201).json({
      success: true,
      product: productWithRelations,
    });
  } catch (error) {
    console.error('💥 Error in createProduct:', error);
    next(error);
  }
};

// Create deal (direct or promote)
export const createDeal = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  console.log('➡️ Entered createDeal controller');

  try {
    const {
      productId,
      title,
      slug,
      category,
      subCategory,
      short_description,
      detailed_description,
      tags,
      sizes,
      colors,
      custom_properties,
      product_specifications,
      product_details,
      stock,
      regular_price = 0,
      sale_price,
      deal_start,
      deal_end,
      images = [],
    } = req.body;

    if (!deal_start || !deal_end || !sale_price) {
      return next(new ValidationError('Missing required fields'));
    }

    if (!req.seller?.id || !req.seller?.shops?.length) {
      return next(
        new AuthError(
          'Only authenticated sellers with a shop can create deals!'
        )
      );
    }

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

    const parsedSalePrice = parseFloat(sale_price);
    if (isNaN(parsedSalePrice) || parsedSalePrice < 0) {
      return next(new ValidationError('Invalid sale price'));
    }

    let product;

    if (productId) {
      // Promote existing product
      product = await prisma.products.findUnique({ where: { id: productId } });
      if (!product) return next(new ValidationError('Product not found'));

      product = await prisma.products.update({
        where: { id: productId },
        data: {
          isDeal: true,
          sale_price: parsedSalePrice,
          deal_start: startDate,
          deal_end: endDate,
        },
      });
    } else {
      // Create product directly from deal form
      product = await prisma.products.create({
        data: {
          title,
          slug,
          category:
            category && category.trim() !== '' ? category : 'Uncategorized',
          subCategory: subCategory ?? null,
          short_description:
            short_description && short_description.trim() !== ''
              ? short_description
              : 'No description',
          detailed_description: detailed_description ?? null,
          stock: parseInt(stock),
          regular_price: parseFloat(regular_price),
          isDeal: true,
          sale_price: parsedSalePrice,
          deal_start: startDate,
          deal_end: endDate,
          Shop: { connect: { id: req.seller.shops[0].id } },
          tags: tags || [],
          colors: colors || [],
          sizes: sizes || [],
          custom_properties: custom_properties ?? null,
          product_specifications: product_specifications ?? null,
          product_details: product_details ?? null,
          images: {
            create: images
              .filter((img: any) => img?.fileId && img?.file_url)
              .map((img: any) => ({
                file_id: img.fileId,
                url: img.file_url,
              })),
          },
        },
      });
    }

    // Create deal record linked to product
    const newDeal = await prisma.deals.create({
      data: {
        productId: product.id,
        slug: product.slug.includes('-deal')
          ? product.slug
          : product.slug + '-deal',
        deal_start: startDate,
        deal_end: endDate,
        regular_price: parseFloat(regular_price) || product.regular_price,
        sale_price: parsedSalePrice,
        shopId: req.seller.shops[0].id,

        // ✅ required fields
        category:
          category && category.trim() !== ''
            ? category
            : product.category || 'Uncategorized',
        short_description:
          short_description && short_description.trim() !== ''
            ? short_description
            : product.short_description || 'No description',

        // snapshot fields
        subCategory: subCategory ?? product.subCategory ?? null,
        tags: tags || product.tags || [],
        colors: colors || product.colors || [],
        sizes: sizes || product.sizes || [],
        product_specifications:
          product_specifications ?? product.product_specifications ?? null,
        product_details: product_details ?? product.product_details ?? null,

        images: {
          create: images
            .filter((img: any) => img?.fileId && img?.file_url)
            .map((img: any) => ({
              file_id: img.fileId,
              url: img.file_url,
            })),
        },
      },
      include: { images: true, product: true },
    });

    console.log('✅ Deal created successfully:', newDeal.id);

    return res.status(201).json({ success: true, product, deal: newDeal });
  } catch (error) {
    console.error('💥 Error in createDeal:', error);
    return next(error);
  }
};

// Update product by slug and sync deal
export const updateProductBySlug = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;
    const {
      title,
      category,
      subCategory,
      short_description,
      detailed_description,
      tags,
      sizes,
      colors,
      custom_properties,
      product_specifications,
      product_details,
      regular_price,
      sale_price,
      deal_start,
      deal_end,
      stock,
      images,
      enableDeal,
      video_url,
      ratings,
    } = req.body;

    const product = await prisma.products.findUnique({
      where: { slug },
      include: { deals: true },
    });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: 'Product not found' });
    }

    // ✅ Update product with all fields
    const updatedProduct = await prisma.products.update({
      where: { slug },
      data: {
        title,
        category:
          category && category.trim() !== ''
            ? category
            : product.category || 'Uncategorized', // ✅ always a string
        subCategory: subCategory ?? product.subCategory ?? null,
        short_description:
          short_description && short_description.trim() !== ''
            ? short_description
            : product.short_description || 'No description', // ✅ required in deals
        detailed_description:
          detailed_description ?? product.detailed_description ?? null,
        regular_price,
        sale_price: enableDeal ? sale_price : null,
        deal_start: enableDeal ? deal_start : null,
        deal_end: enableDeal ? deal_end : null,
        isDeal: enableDeal,
        stock,
        tags: tags || product.tags || [],
        colors: colors || product.colors || [],
        sizes: sizes || product.sizes || [],
        custom_properties:
          custom_properties ?? product.custom_properties ?? null,
        product_specifications:
          product_specifications ?? product.product_specifications ?? null,
        product_details: product_details ?? product.product_details ?? null,
        video_url,
        ratings,
        images: {
          deleteMany: {},
          create: (images || [])
            .filter((img: any) => img?.fileId && img?.file_url)
            .map((img: any) => ({
              file_id: img.fileId,
              url: img.file_url,
            })),
        },
      },
      include: { images: true, deals: true },
    });

    // ✅ Sync deal table if product is a deal
    let updatedDeal = null;
    if (enableDeal) {
      const activeDeal = product.deals.find(
        (d) => d.status === 'Active' && (!d.deal_end || d.deal_end > new Date())
      );

      if (activeDeal) {
        // Update existing deal
        updatedDeal = await prisma.deals.update({
          where: { id: activeDeal.id },
          data: {
            sale_price,
            deal_start,
            deal_end,
            regular_price,
            tags: tags || product.tags || [],
            colors: colors || product.colors || [],
            sizes: sizes || product.sizes || [],
            category:
              category && category.trim() !== ''
                ? category
                : product.category || 'Uncategorized',
            subCategory: subCategory ?? product.subCategory ?? null,
            short_description:
              short_description && short_description.trim() !== ''
                ? short_description
                : product.short_description || 'No description',
            product_specifications:
              product_specifications ?? product.product_specifications ?? null,
            product_details: product_details ?? product.product_details ?? null,
          },
        });
      } else {
        // Create new deal
        updatedDeal = await prisma.deals.create({
          data: {
            productId: product.id,
            slug: product.slug.includes('-deal')
              ? product.slug
              : product.slug + '-deal',
            deal_start,
            deal_end,
            regular_price,
            sale_price,
            shopId: product.shopId,
            tags: tags || [],
            colors: colors || [],
            sizes: sizes || [],
            category:
              category && category.trim() !== ''
                ? category
                : product.category || 'Uncategorized',
            subCategory: subCategory ?? null,
            short_description:
              short_description && short_description.trim() !== ''
                ? short_description
                : product.short_description || 'No description',
            product_specifications: product_specifications ?? null,
            product_details: product_details ?? null,
          },
        });
      }
    }

    return res.status(200).json({
      success: true,
      product: updatedProduct,
      deal: updatedDeal,
    });
  } catch (error) {
    return next(error);
  }
};

// Update product
export const updateProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      productId,
      title,
      short_description,
      detailed_description,
      stock,
      regular_price,
      images,
    } = req.body;

    const updatedProduct = await prisma.products.update({
      where: { id: productId },
      data: {
        title,
        short_description,
        detailed_description,
        stock: parseInt(stock),
        regular_price: parseFloat(regular_price),
        images: {
          upsert: images.map((img: any) => ({
            where: { file_id: img.fileId },
            update: { url: img.file_url },
            create: { file_id: img.fileId, url: img.file_url },
          })),
        },
      },
      include: { images: true },
    });

    res.json({ success: true, product: updatedProduct });
  } catch (error) {
    next(error);
  }
};

// Update deal
export const updateDeal = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { dealId, productId, sale_price, deal_start, deal_end } = req.body;

    const parsedSalePrice = parseFloat(sale_price);

    const [updatedProduct, updatedDeal] = await prisma.$transaction([
      prisma.products.update({
        where: { id: productId },
        data: {
          sale_price: parsedSalePrice,
          deal_start: new Date(deal_start),
          deal_end: new Date(deal_end),
        },
      }),
      prisma.deals.update({
        where: { id: dealId },
        data: {
          sale_price: parsedSalePrice,
          deal_start: new Date(deal_start),
          deal_end: new Date(deal_end),
        },
      }),
    ]);

    res.json({ success: true, product: updatedProduct, deal: updatedDeal });
  } catch (error) {
    next(error);
  }
};

// Promote product to deal
export const promoteToDeal = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId, sale_price, deal_start, deal_end } = req.body;

    const product = await prisma.products.findUnique({
      where: { id: productId },
    });
    if (!product) return next(new ValidationError('Product not found'));

    const parsedSalePrice = parseFloat(sale_price);

    const [updatedProduct, newDeal] = await prisma.$transaction([
      prisma.products.update({
        where: { id: productId },
        data: {
          isDeal: true,
          sale_price: parsedSalePrice,
          deal_start: new Date(deal_start),
          deal_end: new Date(deal_end),
        },
      }),
      prisma.deals.create({
        data: {
          productId,
          slug: product.slug.includes('-deal')
            ? product.slug // ✅ don’t append again
            : product.slug + '-deal',
          deal_start: new Date(deal_start),
          deal_end: new Date(deal_end),
          regular_price: product.regular_price,
          sale_price: parsedSalePrice,
          shopId: product.shopId,
        },
      }),
    ]);

    res
      .status(201)
      .json({ success: true, product: updatedProduct, deal: newDeal });
  } catch (error) {
    next(error);
  }
};

// Demote deal back to product
export const demoteToProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId, dealId } = req.body;

    const product = await prisma.products.findUnique({
      where: { id: productId },
    });
    if (!product) return next(new ValidationError('Product not found'));

    const [updatedProduct, updatedDeal] = await prisma.$transaction([
      prisma.products.update({
        where: { id: productId },
        data: {
          isDeal: false,
          sale_price: null,
          deal_start: null,
          deal_end: null,
        },
      }),
      prisma.deals.update({
        where: { id: dealId },
        data: {
          status: 'Expired',
          deal_end: new Date(), // mark end now
        },
      }),
    ]);

    res.json({ success: true, product: updatedProduct, deal: updatedDeal });
  } catch (error) {
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
      include: {
        images: true,
        deal: true, // 👈 include relation so frontend sees deal fields
      },
    });

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    // ✅ Unified response: product always includes deal + images
    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// Get logged in seller's products that are deals
export const getShopDeals = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const deals = await prisma.products.findMany({
      where: {
        isDeal: true, // ✅ only products marked as deals
        Shop: {
          id: req?.seller?.shops?.[0]?.id, // ✅ filter by seller's shop
        },
      },
      include: {
        images: true, // include product images
        Shop: true, // optional: include shop info
      },
    });

    res.status(200).json({
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

    // Case 1: latest products
    if (type === 'latest') {
      const [products, total, top10Products] = await Promise.all([
        prisma.products.findMany({
          skip,
          take: limit,
          include: { images: true, Shop: true },
          where: baseFilter,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.products.count({ where: baseFilter }),
        prisma.products.findMany({
          take: 10,
          where: baseFilter,
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      return res.status(200).json({
        products,
        top10By: 'latest',
        top10Products,
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      });
    }

    // Case 2: trending products by total sales
    const trending = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10,
    });

    const productIds = trending.map((t) => t.productId);

    const [products, total, top10Products] = await Promise.all([
      prisma.products.findMany({
        skip,
        take: limit,
        include: { images: true, Shop: true },
        where: baseFilter,
      }),
      prisma.products.count({ where: baseFilter }),
      prisma.products.findMany({
        where: { id: { in: productIds } },
        include: { images: true, Shop: true },
      }),
    ]);

    // Merge sales counts into product objects
    const top10WithSales = top10Products.map((p) => ({
      ...p,
      totalSales:
        trending.find((t) => t.productId === p.id)?._sum.quantity ?? 0,
    }));

    res.status(200).json({
      products,
      top10By: 'topSales',
      top10Products: top10WithSales,
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
