import cron from 'node-cron';
import { prisma } from '@eshop/libs/prisma';
import { calculateEventRankScore } from '../utils/eventRankScore';

async function updateEventRankScores() {
  // Fetch all events (no Deal relation anymore)
  const events = await prisma.events.findMany();

  for (const event of events) {
    const score = calculateEventRankScore(event);

    await prisma.events.update({
      where: { id: event.id },
      data: { eventRankScore: score },
    });
  }

  console.log(`[${new Date().toISOString()}] Event rank scores updated`);
}

// Run daily at midnight
cron.schedule('0 0 * * *', async () => {
  try {
    await updateEventRankScores();
  } catch (err) {
    console.error('Error updating event rank scores:', err);
  }
});
