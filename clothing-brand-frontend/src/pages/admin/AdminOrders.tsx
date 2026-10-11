import { useEffect, useMemo, useState } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { Ban, CheckCircle2, Copy, Download, ExternalLink, MapPin, Package, Truck } from 'lucide-react';
import { API_ENDPOINTS, fetchJSON, postJSON } from '../../utils/api';
import { orderUserName, type AdminOrder } from '../../lib/adminTypes';
import { errorMessage, formatDate, shortOrderId } from '../../lib/format';
import { getImageUrl } from '../../utils/mediaHelper';
import { useToast } from '../../lib/toast';
import { inr, isPaid, orderItems, orderStatus, orderTotal, timeAgo } from '../../lib/adminFormat';
import { Badge, Card, Drawer, EmptyState, Field, PageHeader, SearchBox, SkeletonRows, Tabs } from '../../components/admin/ui';
import WhatsAppIcon from '../../components/WhatsAppIcon';

type FilterKey = 'to-ship' | 'shipped' | 'delivered' | 'unpaid' | 'cancelled' | 'all';

const FILTERS: { key: FilterKey; label: string; test: (o: AdminOrder) => boolean }[] = [
  { key: 'to-ship', label: 'To ship', test: (o) => isPaid(o) && (o.status === 'Processing' || o.status === 'Pending') },
  { key: 'shipped', label: 'Shipped', test: (o) => o.status === 'Shipped' },
  { key: 'delivered', label: 'Delivered', test: (o) => o.status === 'Delivered' },
  { key: 'unpaid', label: 'Unpaid', test: (o) => !isPaid(o) && o.status !== 'Cancelled' },
  { key: 'cancelled', label: 'Cancelled', test: (o) => o.status === 'Cancelled' },
  { key: 'all', label: 'All', test: () => true },
];

const customerName = (o: AdminOrder) => o.shippingAddress?.name || orderUserName(o) || 'Guest';
const units = (o: AdminOrder) => orderItems(o).reduce((s, i) => s + (i.qty ?? i.quantity ?? 1), 0);

const toCsv = (orders: AdminOrder[]) => {
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = orders.map((o) => [
    shortOrderId(o._id), o.createdAt ? new Date(o.createdAt).toISOString().slice(0, 10) : '', customerName(o), o.shippingAddress?.email,
    o.shippingAddress?.phoneNumber, `${o.shippingAddress?.address ?? ''}, ${o.shippingAddress?.city ?? ''} ${o.shippingAddress?.postalCode ?? ''}`,
    orderItems(o).map((i) => `${i.name}${i.selectedSize ? ` (${i.selectedSize})` : ''} x${i.qty ?? i.quantity ?? 1}`).join('; '),
    orderTotal(o), isPaid(o) ? 'Paid' : 'Unpaid', o.status, o.courierName, o.awbNumber,
  ].map(esc).join(','));
  return ['Order,Date,Customer,Email,Phone,Address,Items,Total,Payment,Status,Courier,AWB', ...rows].join('\n');
};

const AdminOrders = () => {
  const toast = useToast();
  const { refreshSummary } = useOutletContext<{ refreshSummary?: () => void }>() ?? {};
  const [params, setParams] = useSearchParams();
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [filter, setFilter] = useState<FilterKey>('to-ship');
  const [query, setQuery] = useState('');
  const openId = params.get('open');

  useEffect(() => {
    fetchJSON<AdminOrder[]>(API_ENDPOINTS.ORDERS.BASE)
      .then(setOrders)
      .catch((err) => { toast.error(errorMessage(err)); setOrders([]); });
  }, [toast]);

  const counts = useMemo(
    () => Object.fromEntries(FILTERS.map((f) => [f.key, (orders || []).filter(f.test).length])) as Record<FilterKey, number>,
    [orders],
  );

  const visible = useMemo(() => {
    const f = FILTERS.find((x) => x.key === filter)!;
    const q = query.trim().toLowerCase().replace(/^#/, '');
    return (orders || []).filter(f.test).filter((o) => !q || [
      String(o._id).slice(-8), customerName(o), o.shippingAddress?.email, o.shippingAddress?.phoneNumber, o.awbNumber,
    ].some((v) => String(v || '').toLowerCase().includes(q)));
  }, [orders, filter, query]);

  const setOpen = (id: string | null) => {
    const next = new URLSearchParams(params);
    if (id) next.set('open', id); else next.delete('open');
    setParams(next, { replace: true });
  };

  const update = async (id: string, body: Record<string, unknown>, success?: string) => {
    try {
      const updated = await postJSON<AdminOrder>(`${API_ENDPOINTS.ORDERS.BASE}/${id}/status`, body, 'PUT');
      setOrders((list) => (list || []).map((o) => (o._id === id ? updated : o)));
      if (success) toast.success(success);
      refreshSummary?.();
      return true;
    } catch (err) {
      toast.error(errorMessage(err));
      return false;
    }
  };

  const exportCsv = () => {
    const url = URL.createObjectURL(new Blob([toCsv(visible)], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${filter}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const open = orders?.find((o) => o._id === openId) || null;

  return (
    <>
      <PageHeader
        title="Orders"
        description={orders ? `${counts['to-ship']} waiting to ship · ${orders.length} in total` : 'Loading orders…'}
        actions={<button type="button" className="ad-btn ad-btn--secondary" onClick={exportCsv} disabled={!visible.length}><Download aria-hidden /> Export CSV</button>}
      />

      <div className="ad-toolbar">
        <Tabs label="Filter orders" value={filter} onChange={setFilter} items={FILTERS.map((f) => ({ key: f.key, label: f.label, count: counts[f.key] ?? 0 }))} />
        <div className="ad-toolbar__grow" />
        <SearchBox value={query} onChange={setQuery} placeholder="Order #, name, phone or AWB" label="Search orders" />
      </div>

      <Card flush>
        {orders === null ? <SkeletonRows /> : visible.length === 0 ? (
          <EmptyState
            icon={filter === 'to-ship' ? CheckCircle2 : Package}
            title={query ? 'No matching orders' : filter === 'to-ship' ? 'Nothing to ship right now' : 'No orders here yet'}
            text={query ? 'Try a different order number, name or phone.' : filter === 'to-ship' ? 'New paid orders will appear here, ready to pack.' : undefined}
          />
        ) : (
          <div className="ad-table-wrap">
            <table className="ad-table ad-table--stack">
              <thead>
                <tr><th>Order</th><th>Customer</th><th>Items</th><th>Payment</th><th>Status</th><th className="num">Total</th></tr>
              </thead>
              <tbody>
                {visible.map((o) => {
                  const st = orderStatus(o);
                  const first = orderItems(o)[0];
                  return (
                    <tr key={o._id} className="is-clickable" onClick={() => setOpen(o._id)}>
                      <td className="is-primary">
                        <button type="button" className="ad-cell-main" style={{ border: 0, background: 'none', padding: 0, textAlign: 'left', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); setOpen(o._id); }}>
                          {first && <img src={getImageUrl(first.image, 100)} alt="" />}
                          <span style={{ minWidth: 0 }}>
                            <strong>{shortOrderId(o._id)}</strong>
                            <span title={o.createdAt ? formatDate(o.createdAt) : ''}>{timeAgo(o.createdAt)}</span>
                          </span>
                        </button>
                      </td>
                      <td data-label="Customer">
                        <span>
                          <span style={{ fontWeight: 500 }}>{customerName(o)}</span>
                          {o.shippingAddress?.city && <span className="muted"> · {o.shippingAddress.city}</span>}
                        </span>
                      </td>
                      <td data-label="Items" className="muted">{units(o)} item{units(o) === 1 ? '' : 's'}</td>
                      <td data-label="Payment">{isPaid(o) ? <Badge tone="success">Paid</Badge> : <Badge>Unpaid</Badge>}</td>
                      <td data-label="Status"><Badge tone={st.tone}>{st.label}</Badge></td>
                      <td data-label="Total" className="num" style={{ fontWeight: 500 }}>{inr(orderTotal(o))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {open && <OrderDrawer key={open._id} order={open} onClose={() => setOpen(null)} onUpdate={update} />}
    </>
  );
};

interface DrawerProps {
  order: AdminOrder;
  onClose: () => void;
  onUpdate: (id: string, body: Record<string, unknown>, success?: string) => Promise<boolean>;
}

const OrderDrawer = ({ order, onClose, onUpdate }: DrawerProps) => {
  const toast = useToast();
  const [form, setForm] = useState({ courierName: order.courierName || '', awbNumber: order.awbNumber || '', trackingUrl: order.trackingUrl || '' });
  const [saving, setSaving] = useState(false);
  const a = order.shippingAddress || {};
  const st = orderStatus(order);
  const shipped = order.status === 'Shipped' || order.status === 'Delivered';
  const paid = isPaid(order);
  const addressText = [a.name, a.address, `${a.city ?? ''} – ${a.postalCode ?? ''}`, a.phoneNumber].filter(Boolean).join('\n');
  const phoneDigits = (a.phoneNumber || '').replace(/\D/g, '').slice(-10);

  const ship = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const ok = await onUpdate(
      order._id,
      { ...form, ...(shipped ? {} : { status: 'Shipped' }) },
      shipped ? 'Shipment details saved' : 'Marked as shipped. The customer has been emailed their tracking details.',
    );
    setSaving(false);
    if (ok && !shipped) onClose();
  };

  const setStatus = async (status: string, msg: string) => {
    if (status === 'Cancelled' && !window.confirm('Cancel this order? Refund the customer separately from your Razorpay dashboard.')) return;
    await onUpdate(order._id, { status }, msg);
  };

  const copyAddress = async () => {
    try { await navigator.clipboard.writeText(addressText); toast.success('Address copied'); } catch { toast.error('Couldn’t copy. Select the address instead.'); }
  };

  return (
    <Drawer
      title={`Order ${shortOrderId(order._id)}`}
      description={<>{order.createdAt ? formatDate(order.createdAt) : ''} · <Badge tone={st.tone}>{st.label}</Badge></>}
      onClose={onClose}
      footer={(
        <>
          {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
            <button type="button" className="ad-btn ad-btn--danger" onClick={() => setStatus('Cancelled', 'Order cancelled')}><Ban aria-hidden /> Cancel order</button>
          )}
          <div style={{ flex: 1 }} />
          {order.status === 'Shipped' && (
            <button type="button" className="ad-btn" onClick={() => setStatus('Delivered', 'Marked as delivered')}><CheckCircle2 aria-hidden /> Mark delivered</button>
          )}
        </>
      )}
    >
      <section>
        <div className="ad-section-title">Items</div>
        <ul className="ad-list" style={{ border: '1px solid var(--ad-line)', borderRadius: 12 }}>
          {orderItems(order).map((it, i) => (
            <li key={i}>
              <img className="ad-list__thumb" src={getImageUrl(it.image, 100)} alt="" />
              <div className="ad-list__main">
                <strong>{it.name}</strong>
                <span>Qty {it.qty ?? it.quantity ?? 1}{it.selectedSize ? ` · Size ${it.selectedSize}` : ''}</span>
              </div>
              <span className="tabular">{inr(it.price * (it.qty ?? it.quantity ?? 1))}</span>
            </li>
          ))}
        </ul>
        <dl className="ad-kv" style={{ marginTop: 14 }}>
          {order.itemsPrice ? <div><dt>Subtotal</dt><dd>{inr(order.itemsPrice)}</dd></div> : null}
          {order.offerDiscount ? <div className="is-good"><dt>Bundle offer</dt><dd>−{inr(order.offerDiscount)}</dd></div> : null}
          {order.discountAmount ? <div className="is-good"><dt>Coupon{order.couponCode ? ` (${order.couponCode})` : ''}</dt><dd>−{inr(order.discountAmount)}</dd></div> : null}
          <div><dt>Shipping</dt><dd>{order.shippingPrice ? inr(order.shippingPrice) : 'Free'}</dd></div>
          <div className="is-total"><dt>Total {paid ? '(paid)' : '(unpaid)'}</dt><dd>{inr(orderTotal(order))}</dd></div>
        </dl>
      </section>

      <section>
        <div className="ad-section-title"><MapPin aria-hidden /> Customer & delivery</div>
        <div className="ad-boxed" style={{ whiteSpace: 'pre-line' }}>
          <strong style={{ fontWeight: 600 }}>{a.name}</strong>
          {`\n${a.address ?? ''}\n${a.city ?? ''} – ${a.postalCode ?? ''}\n`}
          <a href={`tel:${a.phoneNumber}`} className="ad-link">{a.phoneNumber}</a>{' · '}<a href={`mailto:${a.email}`} className="ad-link">{a.email}</a>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          <button type="button" className="ad-btn ad-btn--secondary ad-btn--sm" onClick={copyAddress}><Copy aria-hidden /> Copy address</button>
          {phoneDigits.length === 10 && (
            <a className="ad-btn ad-btn--secondary ad-btn--sm" href={`https://wa.me/91${phoneDigits}?text=${encodeURIComponent(`Hi ${a.name?.split(' ')[0] ?? ''}, this is Rang and Craft about your order ${shortOrderId(order._id)}.`)}`} target="_blank" rel="noreferrer">
              <WhatsAppIcon width={15} height={15} /> WhatsApp customer
            </a>
          )}
        </div>
      </section>

      <form onSubmit={ship}>
        <div className="ad-section-title"><Truck aria-hidden /> Shipment</div>
        {!paid ? (
          <div className="ad-alert ad-alert--warning">This order hasn’t been paid, so it can’t be shipped yet.</div>
        ) : (
          <>
            <div className="ad-form-grid">
              <Field label="Courier" htmlFor="ship-courier">
                <input id="ship-courier" className="ad-input" required value={form.courierName} onChange={(e) => setForm((f) => ({ ...f, courierName: e.target.value }))} placeholder="e.g. Delhivery" />
              </Field>
              <Field label="AWB / tracking number" htmlFor="ship-awb">
                <input id="ship-awb" className="ad-input" required value={form.awbNumber} onChange={(e) => setForm((f) => ({ ...f, awbNumber: e.target.value }))} placeholder="e.g. 1234567890" />
              </Field>
              <Field label="Tracking link" optional htmlFor="ship-url" className="ad-span-2">
                <input id="ship-url" className="ad-input" type="url" value={form.trackingUrl} onChange={(e) => setForm((f) => ({ ...f, trackingUrl: e.target.value }))} placeholder="https://…" />
              </Field>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap', alignItems: 'center' }}>
              <button type="submit" className="ad-btn" disabled={saving || order.status === 'Cancelled'}>
                {saving ? <span className="ad-spinner" /> : <Truck aria-hidden />}
                {shipped ? 'Save shipment details' : 'Mark shipped & email customer'}
              </button>
              {order.trackingUrl && <a href={order.trackingUrl} target="_blank" rel="noreferrer" className="ad-link">Open tracking <ExternalLink aria-hidden /></a>}
            </div>
          </>
        )}
      </form>
    </Drawer>
  );
};

export default AdminOrders;
