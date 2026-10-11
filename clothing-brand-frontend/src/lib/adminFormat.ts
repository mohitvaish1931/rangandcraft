import type { AdminOrder } from './adminTypes';
import type { Tone } from '../components/admin/ui';

export const inr = (n: number | undefined | null) => `₹${Math.round(Number(n) || 0).toLocaleString('en-IN')}`;

/** Compact rupees for chart axes: ₹1.2L, ₹45K. */
export const inrShort = (n: number) => {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(n % 1e7 ? 1 : 0)}Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(n % 1e5 ? 1 : 0)}L`;
  if (n >= 1e3) return `₹${(n / 1e3).toFixed(n % 1e3 ? 1 : 0)}K`;
  return `₹${Math.round(n)}`;
};

export const isPaid = (o: AdminOrder) => Boolean(o.isPaid || o.paymentStatus === 'Paid');
export const orderTotal = (o: AdminOrder) => o.totalPrice || o.totalAmount || 0;
export const orderItems = (o: AdminOrder) => o.orderItems || o.items || [];

export const orderStatus = (o: AdminOrder): { label: string; tone: Tone } => {
  if (o.status === 'Cancelled') return { label: 'Cancelled', tone: 'danger' };
  if (o.status === 'Delivered') return { label: 'Delivered', tone: 'success' };
  if (o.status === 'Shipped') return { label: 'Shipped', tone: 'info' };
  if (!isPaid(o)) return { label: 'Awaiting payment', tone: 'neutral' };
  return { label: 'To ship', tone: 'warning' };
};

export const timeAgo = (iso?: string) => {
  if (!iso) return '';
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)} d ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const pctChange = (current: number, previous: number) => (previous > 0 ? ((current - previous) / previous) * 100 : null);

const DAY = 86_400_000;

/** `n` calendar days ending today (oldest first) with a bucket finder. */
export const lastDays = (n: number) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Array.from({ length: n }, (_, i) => new Date(today.getTime() - (n - 1 - i) * DAY));
  const start = days[0].getTime();
  const index = (iso?: string) => {
    if (!iso) return -1;
    const i = Math.floor((new Date(iso).getTime() - start) / DAY);
    return i >= 0 && i < n ? i : -1;
  };
  const inPrevious = (iso?: string) => {
    if (!iso) return false;
    const t = new Date(iso).getTime();
    return t >= start - n * DAY && t < start;
  };
  return { days, index, inPrevious };
};

export const initials = (name?: string) =>
  (name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('') || '?';
