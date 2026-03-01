import { prisma } from '../packages/libs/prisma/index.js'; // include `.js` if needed

async function main() {
  const seller = await prisma.sellers.findUnique({
    where: { id: '690b2a10bb652a9b1daf0ce2' },
    include: { shops: true },
  });

  console.log(JSON.stringify(seller, null, 2));
}

main().finally(() => prisma.$disconnect());
