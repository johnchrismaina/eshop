import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const slug = 'franclia-womens-blouse'; // change to your product slug

  const product = await prisma.products.findUnique({
    where: { slug },
    include: {
      images: true,
      colorVariants: true, // ✅ matches schema
      product_specifications: true,
      deals: true, // ✅ plural, matches schema
      Shop: true,
    },
  });

  console.log('🟢 Prisma product:', product);

  if (product) {
    console.log('🟢 Images:', product.images);
    console.log('🟢 Color Variants:', product.colorVariants);
    console.log('🟢 Deals:', product.deals);
  } else {
    console.log('⚠️ No product found for slug:', slug);
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
