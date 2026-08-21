"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
exports.prisma = globalThis.prismadb ?? new client_1.PrismaClient();
if (process.env.NODE_ENV !== 'production') {
    globalThis.prismadb = exports.prisma;
}
