import { PrismaClient } from '@prisma/client';
declare global {
  // allow global prisma reuse in dev
  // eslint-disable-next-line no-var
  var prismadb: PrismaClient | undefined;
}

export const prisma = globalThis.prismadb ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismadb = prisma;
}

export {};
