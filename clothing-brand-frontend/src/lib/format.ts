const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export const formatPrice = (value: number | undefined | null) => inr.format(Math.round(Number(value) || 0));

export const discountPercent = (price?: number, originalPrice?: number) =>
  originalPrice && price && originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

export const shortOrderId = (id: string) => `#${String(id).slice(-8).toUpperCase()}`;

export const formatDate = (value: string | number | Date) =>
  new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const productId = (p: { _id?: string; id?: string | number }) => String(p._id ?? p.id ?? '');

export const slugToTitle = (s: string) => s.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export const errorMessage = (err: unknown, fallback = 'Something went wrong. Please try again.') =>
  err instanceof Error && err.message ? err.message : fallback;
