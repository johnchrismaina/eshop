import { ValidationError } from '@eshop/error-handler';
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
          stock: true,
          createdAt: true,
          ratings: true,
          category: true,
          images: { select: { url: true }, take: 1 },
          Shop: { select: { name: true } },
        },
      }),
      prisma.products.count(),
    ]);

    // console.log('Admin all products', products);

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

// get all events
export const getAllEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [events, totalEvents] = await Promise.all([
      prisma.products.findMany({
        where: {
          starting_date: {
            not: null,
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          sale_price: true,
          stock: true,
          createdAt: true,
          ratings: true,
          category: true,
          images: { select: { url: true }, take: 1 },
          Shop: { select: { name: true } },
        },
      }),
      prisma.products.count({
        where: {
          starting_date: {
            not: null,
          },
        },
      }),
    ]);

    // console.log('Admin all products', events);

    const totalPages = Math.ceil(totalEvents / limit);

    res.set('Cache-Control', 'no-store');

    res.status(200).json({
      success: true,
      data: events,
      meta: {
        totalEvents,
        currentPage: page,
        totalPages,
      },
    });
  } catch (error) {
    console.error('getAllProducts error:', error);
    next(error);
  }
};

// get all admins
export const getAllAdmins = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const admins = await prisma.admins.findMany({
      where: {
        role: 'admin',
      },
    });

    res.status(201).json({
      success: true,
      admins,
    });
  } catch (error) {
    next(error);
  }
};

// get all admins
export const addNewAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, role } = req.body;

    const isUser = await prisma.admins.findUnique({ where: { email } });
    if (!isUser) {
      return next(new ValidationError('Something went wrong!'));
    }

    const updateRole = await prisma.admins.update({
      where: { email },
      data: {
        role,
      },
    });

    res.status(201).json({
      success: true,
      updateRole,
    });
  } catch (error) {
    next(error);
  }
};

// fetch all customizations
export const getAllCustomizations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const config = await prisma.site_config.findFirst();

    return res.status(200).json({
      categories: config?.categories || [],
      subCategories: config?.subCategories || [],
      logo: config?.logo || null,
      banner: config?.banner || null,
    });
  } catch (error) {
    return next(error);
  }
};

// get all users
export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [users, totalUsers] = await Promise.all([
      prisma.users.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
      prisma.users.count(),
    ]);

    // console.log('Admin all products', products);

    const totalPages = Math.ceil(totalUsers / limit);

    res.set('Cache-Control', 'no-store');

    res.status(200).json({
      success: true,
      data: users,
      meta: {
        totalUsers,
        currentPage: page,
        totalPages,
      },
    });
  } catch (error) {
    console.error('getAllUsers error:', error);
    next(error);
  }
};

// get all sellers
export const getAllSellers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [sellers, totalSellers] = await Promise.all([
      prisma.sellers.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          shop: {
            select: {
              name: true,
              avatar: true,
              address: true,
            },
          },
        },
      }),
      prisma.sellers.count(),
    ]);

    // console.log('Admin all products', products);

    const totalPages = Math.ceil(totalSellers / limit);

    res.set('Cache-Control', 'no-store');

    res.status(200).json({
      success: true,
      data: sellers,
      meta: {
        totalSellers,
        currentPage: page,
        totalPages,
      },
    });
  } catch (error) {
    console.error('getAllSellers error:', error);
    next(error);
  }
};

// --------site config ---------

// Helper type for subCategories JSON
// type SubCategoryMap = Record<string, string[]>;

// get site config
export const getSiteConfig = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const config = await prisma.site_config.findFirst();
    res.json(config);
  } catch (error) {
    next(error);
  }
};

// add new category
export const addCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log('addCategory called');
  try {
    // 1. Extract category from request body
    const { category } = req.body;

    // 2. Validate input: ensure category is provided and is a string
    if (!category || typeof category !== 'string') {
      return res.status(400).json({ message: 'Category is required' });
    }

    // 3. Try to find existing site_config record
    let config = await prisma.site_config.findFirst();

    if (!config) {
      // 4a. If no config exists, create one with the new category
      config = await prisma.site_config.create({
        data: { categories: [category.trim()], subCategories: {} },
      });
    } else {
      // 4b. If config exists, merge new category with existing ones
      // - Use Set to prevent duplicates
      // - Use filter(Boolean) to remove undefined/null values
      // - Use sort() to keep categories alphabetically ordered
      const updatedCategories = Array.from(
        new Set([...config.categories, category.trim()])
      )
        .filter(Boolean)
        .sort();

      // 5. Update the existing config with the new categories array
      config = await prisma.site_config.update({
        where: { id: config.id },
        data: { categories: updatedCategories },
      });
    }

    // 6. Send back a success response with updated config
    return res.status(200).json({
      success: true,
      message: 'Category saved successfully!',
      data: config,
    });
  } catch (error) {
    // 7. Pass any errors to Express error handler middleware
    return next(error);
  }
};

// add sub category
export const addSubCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log('addSubCategory called');
  try {
    // 1. Extract category and subCategory from request body
    const { category, subCategory } = req.body;

    // 2. Validate input: both must be non-empty strings
    if (!category || typeof category !== 'string') {
      return res.status(400).json({ message: 'Category is required' });
    }
    if (!subCategory || typeof subCategory !== 'string') {
      return res.status(400).json({ message: 'Subcategory is required' });
    }

    // 3. Find existing site_config record
    let config = await prisma.site_config.findFirst();

    if (!config) {
      // 4a. If no config exists, create one with empty categories/subCategories
      config = await prisma.site_config.create({
        data: { categories: [], subCategories: {} },
      });
    }

    // 4b. Work with existing subCategories map
    const subs = (config.subCategories || {}) as Record<string, string[]>;

    // 5. Build updated subcategories for the given category
    // - Merge existing subs with the new one
    // - Use Set to prevent duplicates
    // - Use filter(Boolean) to remove undefined/null
    // - Use sort() for alphabetical order
    const updatedSubs: Record<string, string[]> = {
      ...subs,
      [category]: Array.from(
        new Set([...(subs[category] || []), subCategory.trim()])
      )
        .filter(Boolean)
        .sort(),
    };

    // 6. Update the site_config record with new subCategories
    config = await prisma.site_config.update({
      where: { id: config.id },
      data: { subCategories: updatedSubs },
    });

    // 7. Send back success response
    return res.status(200).json({
      success: true,
      message: 'Subcategory saved successfully!',
      data: config,
    });
  } catch (error) {
    // 8. Pass errors to Express error handler
    return next(error);
  }
};

// add logo
export const updateLogo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { logoUrl } = req.body;
    let config = await prisma.site_config.findFirst();

    if (!config) {
      config = await prisma.site_config.create({
        data: { categories: [], subCategories: {}, logo: logoUrl },
      });
    } else {
      config = await prisma.site_config.update({
        where: { id: config.id },
        data: { logo: logoUrl },
      });
    }

    res.json({ message: 'Logo saved!', config });
  } catch (error) {
    next(error);
  }
};

// add banner
export const updateBanner = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { bannerUrl } = req.body;
    let config = await prisma.site_config.findFirst();

    if (!config) {
      config = await prisma.site_config.create({
        data: {
          categories: [],
          subCategories: {},
          logo: null,
          banner: bannerUrl,
        },
      });
    } else {
      config = await prisma.site_config.update({
        where: { id: config.id },
        data: { banner: bannerUrl },
      });
    }

    res.json({ message: 'Banner saved!', config });
  } catch (error) {
    next(error);
  }
};

// get all notifications
export const getAllNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const notifications = await prisma.notifications.findMany({
      where: {
        receiverId: 'admin',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

// get all users notifications
export const getUserNotifications = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const notifications = await prisma.notifications.findMany({
      where: {
        receiverId: req.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    next(error);
  }
};
