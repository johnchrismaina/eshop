"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncCategoriesFromJson = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();
// import { prisma } from '@eshop/libs/prisma';
const index_js_1 = require("../libs/prisma/index.js"); // import prisma from '../libs/prisma/index.js';
// import { prisma } from 'D:/Chris/Coding/00_Projects/eshop/packages/libs/prisma/index.js';
const syncCategoriesFromJson = async () => {
    const jsonPath = path.join(__dirname, 'shopCategories.json');
    if (!fs.existsSync(jsonPath)) {
        console.log('❌ No categories JSON found.');
        return;
    }
    const raw = fs.readFileSync(jsonPath, 'utf-8');
    const parsed = JSON.parse(raw);
    for (const cat of parsed.categories) {
        // Upsert category
        const category = await index_js_1.prisma.category.upsert({
            where: { name: cat.label },
            update: { name: cat.label },
            create: { name: cat.label },
        });
        // Upsert subcategories (exclusive to one category)
        for (const sub of cat.subCategories) {
            await index_js_1.prisma.sub_category.upsert({
                where: { name: sub }, // globally unique
                update: { categoryId: category.id },
                create: { name: sub, categoryId: category.id },
            });
        }
    }
    console.log('✅ Categories and exclusive subcategories synced successfully.');
};
exports.syncCategoriesFromJson = syncCategoriesFromJson;
