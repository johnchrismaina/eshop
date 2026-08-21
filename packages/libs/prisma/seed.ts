import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

// Load JSON manually (avoids import assert headaches)
const categoriesPath = resolve(__dirname, '../../utils/shopCategories.json');
const categories = JSON.parse(readFileSync(categoriesPath, 'utf-8'));

async function main() {
  for (const cat of categories.categories) {
    const category = await prisma.category.upsert({
      where: { name: cat.label },
      update: {},
      create: { name: cat.label },
    });

    for (const sub of cat.subCategories) {
      await prisma.sub_category.upsert({
        where: { name: sub },
        update: { categoryId: category.id },
        create: { name: sub, categoryId: category.id },
      });
    }
  }
}

main()
  .then(() => {
    console.log('✅ Categories seeded');
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
