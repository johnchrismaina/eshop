import cron from 'node-cron';
import { prisma } from '@eshop/libs/prisma';

async function expireOldDiscounts() {
  const now = new Date();
  await prisma.discount_codes.updateMany({
    where: {
      OR: [{ available_tickets: { lte: 0 } }, { discount_end: { lt: now } }],
      status: 'Active',
    },
    data: { status: 'Expired' },
  });
}

// Run daily at midnight
cron.schedule('0 0 * * *', async () => {
  try {
    await expireOldDiscounts();
  } catch (err) {
    console.error('Error updating deal rank scores:', err);
  }
});
