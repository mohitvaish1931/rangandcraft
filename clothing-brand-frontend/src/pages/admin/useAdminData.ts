import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { API_ENDPOINTS, fetchJSON } from '../../utils/api';
import type { AdminOrder, AdminOrderItem, AdminUser } from '../../lib/adminTypes';
import { isPaid } from '../../lib/adminFormat';
import { errorMessage } from '../../lib/format';
import { useToast } from '../../lib/toast';

export { inr } from '../../lib/adminFormat';

/** Orders and users for the report pages. Only paid orders count as sales. */
export const useAdminData = () => {
  const toast = useToast();
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    Promise.all([fetchJSON<AdminOrder[]>(API_ENDPOINTS.ORDERS.BASE), fetchJSON<AdminUser[]>(API_ENDPOINTS.USERS)])
      .then(([o, u]) => { if (alive) { setOrders(Array.isArray(o) ? o : []); setUsers(Array.isArray(u) ? u : []); } })
      .catch((err) => {
        if (!alive) return;
        const msg = errorMessage(err, 'Couldn’t load your sales data');
        setError(msg);
        setOrders([]);
        setUsers([]);
        toast.error(msg);
      });
    return () => { alive = false; };
  }, [toast]);

  const paid = useMemo(() => (orders ?? []).filter(isPaid), [orders]);
  return { orders, users, paid, error, loading: !error && (orders === null || users === null) };
};

export const customerKey = (o: AdminOrder) =>
  (o.shippingAddress?.email || '').toLowerCase() || (typeof o.user === 'string' ? o.user : o.user?._id) || 'guest';

/* ---------- Report date ranges ---------- */

export type RangeKey = '7' | '30' | '90' | '365';

export const RANGE_TABS: { key: RangeKey; label: string }[] = [
  { key: '7', label: '7 days' },
  { key: '30', label: '30 days' },
  { key: '90', label: '90 days' },
  { key: '365', label: '12 months' },
];

const isRange = (v: string | null): v is RangeKey => RANGE_TABS.some((t) => t.key === v);

/** The selected report range, kept in the URL (?range=90) so it survives reloads and can be shared. */
export const useReportRange = (fallback: RangeKey = '30') => {
  const [params, setParams] = useSearchParams();
  const raw = params.get('range');
  const range: RangeKey = isRange(raw) ? raw : fallback;
  const setRange = (next: RangeKey) => {
    const p = new URLSearchParams(params);
    if (next === fallback) p.delete('range'); else p.set('range', next);
    setParams(p, { replace: true });
  };
  return [range, setRange] as const;
};

export const rangeText = (r: RangeKey) => (r === '365' ? 'last 12 months' : `last ${r} days`);
export const previousText = (r: RangeKey) => (r === '365' ? 'vs previous 12 months' : `vs previous ${r} days`);

/** Units on an order line (older orders used `quantity`). */
export const lineQty = (it: AdminOrderItem) => it.qty ?? it.quantity ?? 1;

/** Category saved on the order line, when the server recorded one. */
export const lineCategory = (it: AdminOrderItem) => (it as AdminOrderItem & { category?: string }).category;

/** Downloads rows as a CSV file (Excel and Google Sheets open it directly). */
export const downloadCsv = (filename: string, header: string[], rows: (string | number)[][]) => {
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [header, ...rows].map((r) => r.map(esc).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
