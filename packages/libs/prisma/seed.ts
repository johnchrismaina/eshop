import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123456789', 10);

  console.log('🚀 Seed script starting...');
  // 1. Create sample users
  console.log('Creating users...');

  const alice = await prisma.users.upsert({
    where: { email: 'alice@example.com' },
    update: {}, // nothing to update for now
    create: {
      name: 'Alice',
      email: 'alice@example.com',
      password: 'hashedpassword',
    },
  });

  const bob = await prisma.users.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      name: 'Bob',
      email: 'bob@example.com',
      password: 'hashedpassword',
    },
  });

  const charlie = await prisma.users.upsert({
    where: { email: 'charlie@example.com' },
    update: {},
    create: {
      name: 'Charlie',
      email: 'charlie@example.com',
      password: 'hashedpassword',
    },
  });

  // Create an admin record
  const admin = await prisma.admins.create({
    data: {
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin', // matches your Role enum
    },
  });
  console.log('Seeded admin:', admin);

  // 2. Create shops with sellers
  console.log('Creating shops...');

  const fashionHub = await prisma.shops.upsert({
    where: { sellerId: alice.id }, // sellerId is unique
    update: {}, // nothing to update for now
    create: {
      name: 'Fashion Hub',
      avatar:
        'https://ik.imagekit.io/johnchrismaina/3d-portrait-businessman-min.jpg',
      coverBanner: 'https://ik.imagekit.io/johnchrismaina/fashion-banner.png',
      address: 'Nakuru',
      ratings: 4.5,
      category: 'Fashion',
      sellerId: alice.id,
      followers: {
        create: [{ userId: bob.id }, { userId: charlie.id }],
      },
    },
  });

  const techWorld = await prisma.shops.upsert({
    where: { sellerId: bob.id },
    update: {},
    create: {
      name: 'Tech World',
      avatar:
        'https://ik.imagekit.io/johnchrismaina/3d-portrait-businessman-min.jpg',
      coverBanner: 'https://ik.imagekit.io/johnchrismaina/fashion-banner.png',
      address: 'Nairobi',
      ratings: 4.2,
      category: 'Electronics',
      sellerId: bob.id,
      followers: {
        create: [{ userId: alice.id }],
      },
    },
  });

  // 3. Create orders linked to shops
  await prisma.orders.upsert({
    where: { id: fashionHub.id },
    update: {},
    create: {
      shop: { connect: { id: fashionHub.id } },
      user: { connect: { id: alice.id } },
      total: 5000,
      status: 'Paid',
      deliveryStatus: 'Ordered',
    },
  });

  await prisma.orders.upsert({
    where: { id: techWorld.id },
    update: {},
    create: {
      shop: { connect: { id: techWorld.id } },
      user: { connect: { id: bob.id } },
      total: 3000,
      status: 'Paid',
      deliveryStatus: 'Ordered',
    },
  });

  await prisma.orders.upsert({
    where: { id: fashionHub.id },
    update: {},
    create: {
      shop: { connect: { id: fashionHub.id } },
      user: { connect: { id: alice.id } },
      total: 2000,
      status: 'Paid',
      deliveryStatus: 'Ordered',
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
