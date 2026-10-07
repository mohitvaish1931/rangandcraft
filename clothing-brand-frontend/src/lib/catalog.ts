import type { Product } from '../context/AppContext';

export type SortKey = 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'discount';

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'discount', label: 'Biggest Savings' },
];

export const isOnSale = (p: Product) => Boolean(p.originalPrice && p.originalPrice > p.price);
export const isSoldOut = (p: Product) => Boolean(p.soldOut) || (p.countInStock !== undefined && p.countInStock <= 0);
const savings = (p: Product) => (isOnSale(p) ? (p.originalPrice! - p.price) / p.originalPrice! : 0);

export const sortProducts = (list: Product[], sort: SortKey) => {
  const copy = [...list];
  switch (sort) {
    case 'newest':
      return copy.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    case 'price-asc':
      return copy.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return copy.sort((a, b) => b.price - a.price);
    case 'discount':
      return copy.sort((a, b) => savings(b) - savings(a));
    default:
      // Keep the admin-defined order, but push sold-out pieces to the end.
      return copy.sort((a, b) => Number(isSoldOut(a)) - Number(isSoldOut(b)));
  }
};

export const matchesQuery = (p: Product, query: string) => {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [p.name, p.category, p.subcategory, p.description, ...(p.colors || []), ...(p.materials || [])]
    .filter(Boolean)
    .some((field) => String(field).toLowerCase().includes(q));
};

/** Categories present in the catalogue, most stocked first. */
export const categoriesOf = (products: Product[]) => {
  const counts = new Map<string, { count: number; image?: string }>();
  for (const p of products) {
    if (!p.category) continue;
    const entry = counts.get(p.category) || { count: 0, image: undefined };
    entry.count += 1;
    if (!entry.image && p.image) entry.image = p.image;
    counts.set(p.category, entry);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .map(([name, { count, image }]) => ({ name, count, image }));
};

const DEFAULT_CATEGORIES = ['Short Kurtas', 'Long Kurtas', 'Half Sleeves Shirts', 'Full Sleeves Shirts', 'Three Piece Half Sleeves Shirts', 'Suits'];

/** Category choices for admin forms: defaults plus everything already in use. */
export const categoryOptions = (products: Product[], current?: string) =>
  [...new Set([...DEFAULT_CATEGORIES, ...products.map((p) => p.category), current].filter(Boolean) as string[])].sort();

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', 'XXXL', '4XL', 'FREE SIZE'];
const sizeRank = (s: string) => {
  const i = SIZE_ORDER.indexOf(s.toUpperCase());
  return i === -1 ? SIZE_ORDER.length + (Number.parseFloat(s) || 0) : i;
};

/** Every size offered across the catalogue, in wearing order. */
export const sizesOf = (products: Product[]) =>
  [...new Set(products.flatMap((p) => p.sizes || []).map((s) => s.trim()).filter(Boolean))]
    .sort((a, b) => sizeRank(a) - sizeRank(b) || a.localeCompare(b));

export const PRICE_RANGES = [
  { value: '0-799', label: 'Under ₹800', min: 0, max: 799 },
  { value: '800-1199', label: '₹800 – ₹1,199', min: 800, max: 1199 },
  { value: '1200-1999', label: '₹1,200 – ₹1,999', min: 1200, max: 1999 },
  { value: '2000-', label: '₹2,000 & above', min: 2000, max: Infinity },
];

export const inPriceRanges = (p: Product, ranges: string[]) =>
  !ranges.length || PRICE_RANGES.some((r) => ranges.includes(r.value) && p.price >= r.min && p.price <= r.max);

export const hasAnySize = (p: Product, sizes: string[]) =>
  !sizes.length || (p.sizes || []).some((s) => sizes.includes(s.trim()));
