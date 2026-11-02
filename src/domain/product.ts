export const PRODUCT_UNITS = ['unit', 'g', 'kg', 'ml', 'L', 'package'] as const;
export type ProductUnit = (typeof PRODUCT_UNITS)[number];

export const PRODUCT_CATEGORIES = [
  'produce',
  'dairy',
  'pantry_staples',
  'canned_goods',
  'bakery',
  'meat_eggs',
  'snacks_other'
] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export interface Product {
  id: string;
  name: string;
  quantity: number;
  unit: ProductUnit;
  category: ProductCategory;
  expirationDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ProductInput = Pick<Product, 'name' | 'quantity' | 'unit' | 'category' | 'expirationDate'>;
