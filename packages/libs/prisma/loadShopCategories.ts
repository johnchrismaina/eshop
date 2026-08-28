import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface ShopCategory {
  value: string;
  label: string;
  subCategories?: ShopCategory[];
  filterGroups?: any[];
  highlights?: { ref: string }[];
}

export function loadShopCategories(): ShopCategory[] {
  const categoriesPath = resolve(__dirname, '../../utils/shopCategories.json');
  const data = JSON.parse(readFileSync(categoriesPath, 'utf-8'));
  return data.categories as ShopCategory[];
}
