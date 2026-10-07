import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Search, ShoppingBag, Truck, X } from 'lucide-react';
import { API_ENDPOINTS, fetchJSON, postJSON } from '../../utils/api';
import { orderUserName, type AdminOrder } from '../../lib/adminTypes';
import { errorMessage, formatDate, formatPrice, shortOrderId } from '../../lib/format';
import { getImageUrl } from '../../utils/mediaHelper';
import { useToast } from '../../lib/toast';

const STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as const;

const FILTERS = [
  { key: 'to-ship', label: 'To ship', test: (o: AdminOrder) => Boolean(o.isPaid) && (o.status === 'Processing' || o.status === 'Pending') },
  { key: 'shipped', label: 'Shipped', test: (o: AdminOrder) => o.status === 'Shipped' },
  { key: 'delivered', label: 'Delivered', test: (o: AdminOrder) => o.status === 'Delivered' },
  { key: 'unpaid', label: 'Unpaid', test: (o: AdminOrder) => !o.isPaid && o.status !== 'Cancelled' },
  { key: 'cancelled', label: 'Cancelled', test: (o: AdminOrder) => o.status === 'Cancelled' },
  { key: 'all', label: 'All', test: () => true },
] as const;

const STATUS_STYLES: Record<string, string> = {
  Delivered: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Shipped: 'bg-blue-50 text-blue-700 border-blue-100',
  Processing: 'bg-orange-50 text-orange-700 border-orange-100',
  Cancelled: 'bg-red-50 text-red-700 border-red-100',
  Pending: 'bg-gray-50 text-gray-700 border-gray-100',
};

const items = (o: AdminOrder) => o.orderItems || o.items || [];
const customerName = (o: AdminOrder) => o.shippingAddress?.name || orderUserName(o) || 'Guest';

const AdminOrders = () => {
  const toast = useToast();
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['key']>('to-ship');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    fetchJSON<AdminOrder[]>(API_ENDPOINTS.ORDERS.BASE)
      .then(setOrders)
      .catch((err) => { toast.error(errorMessage(err)); setOrders([]); });
  }, [toast]);

  const counts = useMemo(
    () => Object.fromEntries(FILTERS.map((f) => [f.key, (orders || []).filter(f.test).length])),
    [orders],
  );

  const visible = useMemo(() => {
    const f = FILTERS.find((x) => x.key === filter)!;
    const q = query.trim().toLowerCase().replace(/^#/, '');
    return (orders || []).filter(f.test).filter((o) => !q || [
      String(o._id).slice(-8), customerName(o), o.shippingAddress?.email, o.shippingAddress?.phoneNumber, o.awbNumber,
    ].some((v) => String(v || '').toLowerCase().includes(q)));
  }, [orders, filter, query]);

  const update = async (id: string, body: Record<string, unknown>, success?: string) => {
    try {
      const updated = await postJSON<AdminOrder>(`${API_ENDPOINTS.ORDERS.BASE}/${id}/status`, body, 'PUT');
      setOrders((list) => (list || []).map((o) => (o._id === id ? updated : o)));
      if (success) toast.success(success);
      return true;
    } catch (err) {
      toast.error(errorMessage(err));
      return false;
    }
  };

  const open = orders?.find((o) => o._id === openId) || null;

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-3xl border border-gold-primary/10 shadow-sm flex flex-wrap gap-6 items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-text-primary luxury-serif tracking-widest uppercase mb-1">Order Management</h2>
          <div className="w-12 h-1 bg-primary-purple rounded-full"></div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Waiting to ship</p>
            <p className="text-sm font-black text-gold-primary uppercase tracking-widest tabular-nums">{counts['to-ship'] ?? 0} orders</p>
          </div>
          <div className="flex items-center space-x-3 px-4 py-3 rounded-2xl border border-gold-primary/10">
            <ShoppingBag className="h-5 w-5 text-primary-purple" />
            <span className="text-xs font-bold text-text-primary uppercase tracking-wider">{orders?.length ?? 0} Total</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter orders">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={filter === f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition ${filter === f.key ? 'bg-primary-purple text-white border-primary-purple' : 'bg-white text-text-secondary border-gray-200 hover:border-primary-purple'}`}
            >
              {f.label} <span className="opacity-70 tabular-nums">{counts[f.key] ?? 0}</span>
            </button>
          ))}
        </div>
        <label className="relative">
          <span className="sr-only">Search orders</span>
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Order #, name, phone, AWB"
            className="pl-9 pr-3 py-2 rounded-full border border-gray-200 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary-purple/20"
          />
        </label>
      </div>

      <div className="bg-white border border-gold-primary/10 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-[#FDFBF9]">
                {['Order', 'Customer', 'Items', 'Total', 'Status', ''].map((h) => (
                  <th key={h} className="px-6 py-4 text-left text-[10px] font-bold text-text-muted uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gold-primary/5">
              {orders === null && (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-sm text-text-muted">Loading orders…</td></tr>
              )}
              {orders && visible.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-sm text-text-muted">No orders here.</td></tr>
              )}
              {visible.map((order) => (
                <tr key={order._id} className="hover:bg-[#FDFBF9] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button type="button" onClick={() => setOpenId(order._id)} className="text-sm font-bold text-primary-purple underline-offset-2 hover:underline tabular-nums">
                      {shortOrderId(order._id)}
                    </button>
                    <div className="text-[11px] text-text-muted">{order.createdAt ? formatDate(order.createdAt) : '—'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-text-primary">{customerName(order)}</div>
                    <div className="text-[11px] text-text-muted">{order.shippingAddress?.phoneNumber} · {order.shippingAddress?.city}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-text-secondary max-w-[240px] truncate">
                      {items(order).map((it) => `${it.name}${it.selectedSize ? ` (${it.selectedSize})` : ''} ×${it.qty ?? it.quantity ?? 1}`).join(', ')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-black text-text-primary">{formatPrice(order.totalPrice || order.totalAmount)}</div>
                    <div className={`text-[10px] font-bold uppercase ${order.isPaid ? 'text-emerald-600' : 'text-orange-600'}`}>{order.isPaid ? 'Paid' : 'Unpaid'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      aria-label={`Status of order ${shortOrderId(order._id)}`}
                      value={order.status || 'Pending'}
                      onChange={(e) => {
                        if (e.target.value === 'Shipped' && !order.awbNumber) { setOpenId(order._id); return; }
                        update(order._id, { status: e.target.value }, `Order ${shortOrderId(order._id)} marked ${e.target.value}`);
                      }}
                      className={`border rounded-full py-1 px-3 text-[11px] font-bold focus:outline-none focus:ring-2 focus:ring-primary-purple/20 ${STATUS_STYLES[order.status] || STATUS_STYLES.Pending}`}
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button type="button" onClick={() => setOpenId(order._id)} className="text-xs font-bold uppercase tracking-wider text-primary-purple hover:underline">
                      {order.isPaid && order.status === 'Processing' ? 'Ship' : 'View'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {open && <OrderPanel key={open._id} order={open} onClose={() => setOpenId(null)} onUpdate={update} />}
    </div>
  );
};

interface PanelProps {
  order: AdminOrder;
  onClose: () => void;
  onUpdate: (id: string, body: Record<string, unknown>, success?: string) => Promise<boolean>;
}

const OrderPanel = ({ order, onClose, onUpdate }: PanelProps) => {
  const [form, setForm] = useState({ courierName: order.courierName || '', awbNumber: order.awbNumber || '', trackingUrl: order.trackingUrl || '' });
  const [saving, setSaving] = useState(false);
  const a = order.shippingAddress || {};

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const ship = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const markShipped = order.status !== 'Shipped' && order.status !== 'Delivered';
    const ok = await onUpdate(
      order._id,
      { ...form, ...(markShipped ? { status: 'Shipped' } : {}) },
      markShipped ? 'Marked as shipped. The customer has been emailed their tracking details.' : 'Shipment details saved',
    );
    setSaving(false);
    if (ok && markShipped) onClose();
  };

  const row = (label: string, value: number | undefined, negative = false) =>
    value ? <div className="flex justify-between text-sm"><span className="text-text-muted">{label}</span><span>{negative ? '−' : ''}{formatPrice(value)}</span></div> : null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={`Order ${shortOrderId(order._id)}`}>
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close" onClick={onClose} />
      <div className="relative w-full max-w-lg h-full overflow-y-auto bg-white shadow-2xl p-8 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Order</p>
            <h3 className="text-2xl font-black text-text-primary luxury-serif">{shortOrderId(order._id)}</h3>
            <p className="text-xs text-text-muted">{order.createdAt ? formatDate(order.createdAt) : ''} · {order.isPaid ? 'Paid' : 'Unpaid'} · {order.status}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-100" aria-label="Close order"><X size={18} /></button>
        </div>

        <section className="space-y-3">
          {items(order).map((it, i) => (
            <div key={i} className="flex gap-3 items-center">
              <img src={getImageUrl(it.image, 120)} alt="" className="w-12 h-14 object-cover rounded-lg bg-gray-100" />
              <div className="flex-1 text-sm">
                <div className="font-bold text-text-primary">{it.name}</div>
                <div className="text-xs text-text-muted">Qty {it.qty ?? it.quantity ?? 1}{it.selectedSize ? ` · Size ${it.selectedSize}` : ''}</div>
              </div>
              <div className="text-sm">{formatPrice(it.price * (it.qty ?? it.quantity ?? 1))}</div>
            </div>
          ))}
          <div className="border-t pt-3 space-y-1">
            {row('Subtotal', order.itemsPrice)}
            {row('Bundle offer', order.offerDiscount, true)}
            {row(`Coupon${order.couponCode ? ` (${order.couponCode})` : ''}`, order.discountAmount, true)}
            <div className="flex justify-between text-sm"><span className="text-text-muted">Shipping</span><span>{order.shippingPrice ? formatPrice(order.shippingPrice) : 'Free'}</span></div>
            <div className="flex justify-between text-base font-black pt-1"><span>Total</span><span>{formatPrice(order.totalPrice)}</span></div>
          </div>
        </section>

        <section className="rounded-2xl bg-[#FDFBF9] p-4 text-sm leading-relaxed">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Ship to</p>
          <p className="font-bold">{a.name}</p>
          <p>{a.address}</p>
          <p>{a.city} – {a.postalCode}</p>
          <p>{a.phoneNumber} · <a className="underline" href={`mailto:${a.email}`}>{a.email}</a></p>
        </section>

        <form onSubmit={ship} className="space-y-3">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-2"><Truck size={14} /> Shipment</p>
          {(['courierName', 'awbNumber', 'trackingUrl'] as const).map((key) => (
            <label key={key} className="block">
              <span className="text-xs font-bold text-text-secondary">{{ courierName: 'Courier', awbNumber: 'AWB / tracking number', trackingUrl: 'Tracking link (optional)' }[key]}</span>
              <input
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                type={key === 'trackingUrl' ? 'url' : 'text'}
                required={key !== 'trackingUrl'}
                placeholder={{ courierName: 'e.g. Delhivery', awbNumber: 'e.g. 1234567890', trackingUrl: 'https://…' }[key]}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-purple/20"
              />
            </label>
          ))}
          {order.trackingUrl && (
            <a href={order.trackingUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary-purple underline">
              Open current tracking link <ExternalLink size={12} />
            </a>
          )}
          <button
            type="submit"
            disabled={saving || !order.isPaid}
            className="w-full bg-primary-purple text-white rounded-xl py-3 text-xs font-bold uppercase tracking-widest disabled:opacity-50"
          >
            {saving ? 'Saving…' : order.status === 'Shipped' || order.status === 'Delivered' ? 'Save shipment details' : 'Mark as shipped & email customer'}
          </button>
          {!order.isPaid && <p className="text-xs text-orange-600">This order hasn’t been paid, so it can’t be shipped yet.</p>}
        </form>
      </div>
    </div>
  );
};

export default AdminOrders;
