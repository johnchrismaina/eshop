import { PrismaClient } from './generated/client';

declare global {
  namespace globalThis {
    var prismadb: PrismaClient | undefined;
  }
}

// Reuse PrismaClient in dev to avoid exhausting database connections
export const prisma = globalThis.prismadb ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismadb = prisma;
}
