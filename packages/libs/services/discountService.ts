import { prisma } from '../prisma/index.js';

export async function redeemDiscountCode(discountCodeId: string) {
  return await prisma.$transaction(async (tx) => {
    const discount = await tx.discount_codes.findUnique({
      where: { id: discountCodeId },
    });

    if (!discount) throw new Error('Discount code not found');

    if (
      discount.available_tickets === null ||
      discount.available_tickets <= 0
    ) {
      throw new Error('No tickets remaining for this discount');
    }

    const updated = await tx.discount_codes.update({
      where: { id: discountCodeId },
      data: {
        available_tickets: { decrement: 1 },
      },
    });

    await tx.deals.updateMany({
      where: { dealDiscountCodes: { some: { discountId: discountCodeId } } },
      data: { redemptions: { increment: 1 } },
    });

    return updated;
  });
}
