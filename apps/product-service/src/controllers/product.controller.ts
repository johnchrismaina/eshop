import { prisma } from '@eshop/libs/prisma';
import {
  AuthError,
  NotFoundError,
  ValidationError,
} from '@packages/error-handler';
import { imagekit } from '@packages/libs/imagekit';
import { NextFunction, Request, Response } from 'express';

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
      short_description,
      detailed_description,
      warranty,
      slug,
      tags,
      cash_on_delivery,
      brand,
      video_url,
      category,
      colors = [],
      sizes = [],
      discountCodes,
      stock,
      sale_price,
      regular_price,
      subCategory,
      customProperties = {},
      custom_specifications,
      images = [],
    } = req.body;

    console.log('📦 Incoming body:', req.body);

    if (
      !title ||
      !slug ||
      !short_description ||
      !category ||
      !subCategory ||
      !sale_price ||
      !images ||
      !tags ||
      !stock ||
      !regular_price
    ) {
      console.log('❌ Validation failed: missing required fields');
      return next(new ValidationError('Missing required fields'));
    }

    if (!req.seller.id) {
      console.log('❌ Auth failed: seller not found');
      return next(new AuthError('Only seller can create products!'));
    }

    console.log('Incoming images:', images);

    console.log('🔎 Checking slug uniqueness:', slug);
    const slugChecking = await prisma.products.findUnique({
      where: {
        slug,
      },
    });

    if (slugChecking) {
      console.log('❌ Slug already exists:', slug);
      return next(
        new ValidationError('Slug already exists! Please use a different slug!')
      );
    }

    console.log('🛠 Creating product in DB...');
    const newProduct = await prisma.products.create({
      data: {
        title,
        short_description,
        detailed_description,
        warranty,
        cashOnDelivery: cash_on_delivery,
        slug,
        shopId: req.seller?.shop?.id!,
        tags: Array.isArray(tags) ? tags : tags.split(','),
        brand,
        video_url,
        category,
        subCategory,
        colors: colors || [],
        discount_codes: discountCodes ?? [],
        sizes: sizes || [],
        stock: parseInt(stock),
        sale_price: parseFloat(sale_price),
        regular_price: parseFloat(regular_price),
        customProperties: customProperties || {},
        custom_specifications: custom_specifications || {},
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

    console.log('✅ Product created successfully:', newProduct.id);

    res.status(201).json({
      success: true,
      newProduct,
    });
    console.log('📤 Response sent to client');
  } catch (error) {
    console.error('💥 Error in createProduct:', error);
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

// Delete product
export const deleteProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;
    const sellerId = req.seller?.shop?.id;

    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: { id: true, shopId: true, isDeleted: true },
    });

    if (!product) {
      return next(new ValidationError('Product not found'));
    }

    if (product.shopId !== sellerId) {
      return next(new ValidationError('Unauthorized action'));
    }

    if (product.isDeleted) {
      return next(new ValidationError('Product is already deleted'));
    }

    const deleteProduct = await prisma.products.update({
      where: { id: productId },
      data: {
        isDeleted: true,
        deletedAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    return res.status(200).json({
      message:
        'Product is scheduled for deletion in 2 hours. You can restore it within this time',
      deletedAt: deleteProduct.deletedAt,
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
    const sellerId = req.seller?.shop?.id;

    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: { id: true, shopId: true, isDeleted: true },
    });

    if (!product) {
      return next(new ValidationError('Product not found'));
    }

    if (product.shopId !== sellerId) {
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
