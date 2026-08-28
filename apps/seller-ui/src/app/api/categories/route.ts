import { NextResponse } from 'next/server';
import { loadShopCategories } from 'packages/libs/prisma/loadShopCategories';
// import { loadShopCategories } from '../../../utils/loadShopCategories';

export async function GET() {
  const categories = loadShopCategories();
  return NextResponse.json(categories);
}
