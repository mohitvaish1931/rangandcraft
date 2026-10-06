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
