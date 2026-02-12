// apps/api-gateway/src/controllers/siteConfigController.ts
import { prisma } from '@eshop/libs/prisma';
import { Request, Response, NextFunction } from 'express';

// Helper type for subCategories JSON
type SubCategoryMap = Record<string, string[]>;

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
    const { category } = req.body;
    let config = await prisma.site_config.findFirst();

    if (!config) {
      config = await prisma.site_config.create({
        data: { categories: [category], subCategories: {} },
      });
    } else {
      // Prevent duplicates + sort alphabetically
      const updatedCategories = Array.from(
        new Set([...config.categories, category])
      ).sort();

      config = await prisma.site_config.update({
        where: { id: config.id },
        data: { categories: updatedCategories },
      });
    }

    res.json({ message: 'Category saved!', config });
  } catch (error) {
    next(error);
  }
};

// add sub category
export const addSubCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { category, subCategory } = req.body;
    let config = await prisma.site_config.findFirst();

    if (!config) {
      config = await prisma.site_config.create({
        data: { categories: [], subCategories: {} },
      });
    }

    const subs = (config.subCategories || {}) as SubCategoryMap;

    const updatedSubs: SubCategoryMap = {
      ...subs,
      [category]: Array.from(
        new Set([...(subs[category] || []), subCategory])
      ).sort(),
    };

    config = await prisma.site_config.update({
      where: { id: config.id },
      data: { subCategories: updatedSubs },
    });

    res.json({ message: 'Subcategory saved!', config });
  } catch (error) {
    next(error);
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
        data: { categories: [], subCategories: {}, banner: bannerUrl },
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
