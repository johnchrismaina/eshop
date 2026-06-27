import cron from 'node-cron';
import { prisma } from '@eshop/libs/prisma';
import { calculateDealRankScore } from '../utils/dealRankScore';

async function updateDealRankScores() {
  // Fetch all deals (no Deal relation anymore)
  const deals = await prisma.deal.findMany();

  for (const deal of deals) {
    const score = calculateDealRankScore(deal);

    await prisma.deals.update({
      where: { id: deal.id },
      data: { dealRankScore: score },
    });
  }

  console.log(`[${new Date().toISOString()}] Deal rank scores updated`);
}

// Run daily at midnight
cron.schedule('0 0 * * *', async () => {
  try {
    await updateDealRankScores();
  } catch (err) {
    console.error('Error updating deal rank scores:', err);
  }
});
