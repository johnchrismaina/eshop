import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';

interface ShopCategory {
  value: string;
  label: string;
  subCategories?: ShopCategory[];
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

// Load JSON manually
const categoriesPath = resolve(__dirname, '../../utils/shopCategories.json');
const categories = JSON.parse(readFileSync(categoriesPath, 'utf-8'));

async function seedCategory(cat: ShopCategory, parentId: string | null = null) {
  // Upsert category
  const category = await prisma.category.upsert({
    where: { name: cat.label },
    update: { parentId }, // link to parent if exists
    create: { name: cat.label, parentId },
  });

  // If subCategories exist, recurse
  if (cat.subCategories && cat.subCategories.length > 0) {
    for (const sub of cat.subCategories) {
      await seedCategory(sub, category.id);
    }
  }
}

async function main() {
  for (const cat of categories.categories) {
    await seedCategory(cat);
  }
}

main()
  .then(() => {
    console.log('✅ Categories seeded with nested hierarchy');
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
