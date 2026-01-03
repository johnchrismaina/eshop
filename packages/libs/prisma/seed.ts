import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Seed script starting...');
  // 1. Create sample users
  console.log('Creating users...');
  const alice = await prisma.users.create({
    data: {
      name: 'Alice',
      email: 'alice@example.com',
      password: 'password123', // optional since it's String?
    },
  });
  console.log('Alice created:', alice);

  const bob = await prisma.users.create({
    data: {
      name: 'Bob',
      email: 'bob@example.com',
    },
  });

  const charlie = await prisma.users.create({
    data: {
      name: 'Charlie',
      email: 'charlie@example.com',
    },
  });

  // 2. Create shops with sellers
  console.log('Creating shops...');
  const fashionHub = await prisma.shops.create({
    data: {
      name: 'Fashion Hub',
      avatar:
        'https://ik.imagekit.io/johnchrismaina/3d-portrait-businessman-min.jpg?updatedAt=1767361896968',
      coverBanner: 'https://ik.imagekit.io/johnchrismaina/fashion-banner.png',
      address: 'Nakuru',
      ratings: 4.5,
      category: 'Fashion',
      sellerId: alice.id, // required relation
      followers: {
        create: [
          { userId: bob.id }, // Bob follows Fashion Hub
          { userId: charlie.id }, // Charlie follows Fashion Hub
        ],
      },
    },
  });
  console.log('Fashion Hub created:', fashionHub);

  const techWorld = await prisma.shops.create({
    data: {
      name: 'Tech World',
      avatar:
        'https://ik.imagekit.io/johnchrismaina/3d-portrait-businessman-min.jpg?updatedAt=1767361896968',
      coverBanner: 'https://ik.imagekit.io/johnchrismaina/fashion-banner.png',
      address: 'Nairobi',
      ratings: 4.2,
      category: 'Electronics',
      sellerId: bob.id,
      followers: {
        create: [{ userId: alice.id }], // Alice follows Tech World
      },
    },
  });

  // 3. Create orders linked to shops
  await prisma.order.create({
    data: {
      shopId: fashionHub.id,
      total: 5000,
    },
  });

  await prisma.order.create({
    data: {
      shopId: techWorld.id,
      total: 3000,
    },
  });

  await prisma.order.create({
    data: {
      shopId: fashionHub.id,
      total: 2000,
    },
  });

  console.log('Seed data created successfully!');
}

main()
  .then(async () => {
    console.log('✅ Seed script finished successfully');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });

console.log('✅ Seed script finished successfully');
