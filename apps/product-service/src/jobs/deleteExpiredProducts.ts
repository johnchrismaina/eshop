import cron from 'node-cron';
// import { PrismaClient } from '@prisma/client';
import { prisma } from '@eshop/libs/prisma';

// const prisma = new PrismaClient();

// Runs every day at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('🧹 Running cleanup job...');

  try {
    // Delete expired products
    await prisma.products.deleteMany({
      where: {
        isDeleted: true,
        deletedAt: { lt: new Date() }, // expired
      },
    });

    // Delete expired deals
    await prisma.deals.deleteMany({
      where: {
        isDeleted: true,
        deletedAt: { lt: new Date() }, // expired
      },
    });

    console.log('✅ Cleanup job completed');
  } catch (error) {
    console.error('❌ Cleanup job failed:', error);
  }
});
