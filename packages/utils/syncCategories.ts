import * as fs from 'fs';
import * as path from 'path';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();
// import { prisma } from '@eshop/libs/prisma';
import { prisma } from '../libs/prisma/index.js'; // import prisma from '../libs/prisma/index.js';
// import { prisma } from 'D:/Chris/Coding/00_Projects/eshop/packages/libs/prisma/index.js';

export const syncCategoriesFromJson = async () => {
  const jsonPath = path.join(__dirname, 'shopCategories.json');
  if (!fs.existsSync(jsonPath)) {
    console.log('❌ No categories JSON found.');
    return;
  }

  const raw = fs.readFileSync(jsonPath, 'utf-8');
  const parsed = JSON.parse(raw);

  for (const cat of parsed.categories) {
    // Upsert category
    const category = await prisma.category.upsert({
      where: { name: cat.label },
      update: { name: cat.label },
      create: { name: cat.label },
    });

    // Upsert subcategories (exclusive to one category)
    for (const sub of cat.subCategories) {
      await prisma.sub_category.upsert({
        where: { name: sub }, // globally unique
        update: { categoryId: category.id },
        create: { name: sub, categoryId: category.id },
      });
    }
  }

  console.log('✅ Categories and exclusive subcategories synced successfully.');
};
