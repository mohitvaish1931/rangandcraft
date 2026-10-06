import { useEffect, useMemo, useState } from 'react';
import { API_ENDPOINTS, fetchJSON } from '../../utils/api';
import type { AdminOrder, AdminUser } from '../../lib/adminTypes';

/** Orders and users for the report pages. Only paid orders count as sales. */
export const useAdminData = () => {
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    Promise.all([fetchJSON<AdminOrder[]>(API_ENDPOINTS.ORDERS.BASE), fetchJSON<AdminUser[]>(API_ENDPOINTS.USERS)])
      .then(([o, u]) => { if (alive) { setOrders(o); setUsers(u); } })
      .catch((err) => alive && setError(err instanceof Error ? err.message : 'Failed to load data'));
    return () => { alive = false; };
  }, []);

  const paid = useMemo(() => (orders ?? []).filter((o) => o.isPaid || o.paymentStatus === 'Paid'), [orders]);
  return { orders, users, paid, error, loading: !error && (orders === null || users === null) };
};

export const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

export const customerKey = (o: AdminOrder) =>
  (o.shippingAddress?.email || '').toLowerCase() || (typeof o.user === 'string' ? o.user : o.user?._id) || 'guest';
