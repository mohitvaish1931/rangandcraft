import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, ArrowRight, Boxes, CheckCircle2, IndianRupee, Inbox, Package, Plus, ReceiptText, ShoppingBag, Star, Users,
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { API_ENDPOINTS, fetchJSON } from '../../utils/api';
import type { AdminOrder } from '../../lib/adminTypes';
import { isSoldOut } from '../../lib/catalog';
import { getImageUrl } from '../../utils/mediaHelper';
import { productId, shortOrderId } from '../../lib/format';
import { inr, inrShort, isPaid, lastDays, orderItems, orderStatus, orderTotal, pctChange, timeAgo } from '../../lib/adminFormat';
import { AreaChart, Badge, Card, EmptyState, PageHeader, SkeletonRows, Stat, Tabs } from '../../components/admin/ui';

type Range = '7' | '30' | '90';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

const AdminDashboard = () => {
  const { state } = useAppContext();
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [attention, setAttention] = useState<{ pendingReviews: number; newMessages: number } | null>(null);
  const [range, setRange] = useState<Range>('30');

  useEffect(() => {
    fetchJSON<AdminOrder[]>(API_ENDPOINTS.ORDERS.BASE).then(setOrders).catch(() => setOrders([]));
    fetchJSON<{ pendingReviews: number; newMessages: number }>(API_ENDPOINTS.ADMIN_SUMMARY)
      .then(setAttention).catch(() => {});
  }, []);

  const data = useMemo(() => {
    const list = orders ?? [];
    const paid = list.filter(isPaid);
    const n = Number(range);
    const { days, index, inPrevious } = lastDays(n);
    const revenue = days.map(() => 0);
    const count = days.map(() => 0);
    const customers = new Set<string>();
    const prevCustomers = new Set<string>();
    let prevRevenue = 0;
    let prevCount = 0;
    const key = (o: AdminOrder) => (o.shippingAddress?.email || '').toLowerCase() || String(o._id);
    for (const o of paid) {
      const i = index(o.createdAt);
      if (i >= 0) { revenue[i] += orderTotal(o); count[i] += 1; customers.add(key(o)); }
      else if (inPrevious(o.createdAt)) { prevRevenue += orderTotal(o); prevCount += 1; prevCustomers.add(key(o)); }
    }
    const totalRevenue = revenue.reduce((a, b) => a + b, 0);
    const totalCount = count.reduce((a, b) => a + b, 0);
    const aov = totalCount ? totalRevenue / totalCount : 0;
    const prevAov = prevCount ? prevRevenue / prevCount : 0;

    const sold = new Map<string, { name: string; image: string; qty: number; revenue: number }>();
    for (const o of paid) {
      if (index(o.createdAt) < 0) continue;
      for (const it of orderItems(o)) {
        const id = String(it.product || it.name);
        const qty = it.qty ?? it.quantity ?? 1;
        const row = sold.get(id) || { name: it.name, image: it.image, qty: 0, revenue: 0 };
        row.qty += qty;
        row.revenue += it.price * qty;
        sold.set(id, row);
      }
    }
    const fmtDay = (d: Date) => d.toLocaleDateString('en-IN', n <= 7 ? { weekday: 'short' } : { day: 'numeric', month: 'short' });
    return {
      chart: days.map((d, i) => ({ label: fmtDay(d), value: revenue[i], detail: `${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · ${count[i]} order${count[i] === 1 ? '' : 's'}` })),
      revenue, count, totalRevenue, totalCount, aov,
      revenueDelta: pctChange(totalRevenue, prevRevenue),
      countDelta: pctChange(totalCount, prevCount),
      aovDelta: pctChange(aov, prevAov),
      customers: customers.size,
      customersDelta: pctChange(customers.size, prevCustomers.size),
      top: [...sold.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5),
      toShip: paid.filter((o) => o.status === 'Processing' || o.status === 'Pending').length,
      recent: list.slice(0, 6),
    };
  }, [orders, range]);

  const lowStock = state.products.filter((p) => !isSoldOut(p) && (p.countInStock ?? 99) <= 3);
  const soldOut = state.products.filter(isSoldOut);
  const firstName = (state.user?.name || '').split(' ')[0];
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
  const loading = orders === null;
  const rangeLabel = `last ${range} days`;

  const todo = [
    { n: data.toShip, label: data.toShip === 1 ? 'order to ship' : 'orders to ship', to: '/admin/orders', icon: Package },
    { n: attention?.pendingReviews ?? 0, label: (attention?.pendingReviews ?? 0) === 1 ? 'review to approve' : 'reviews to approve', to: '/admin/reviews', icon: Star },
    { n: attention?.newMessages ?? 0, label: (attention?.newMessages ?? 0) === 1 ? 'new message' : 'new messages', to: '/admin/inbox', icon: Inbox },
    { n: lowStock.length + soldOut.length, label: 'products low or sold out', to: '/admin/inventory', icon: Boxes },
  ].filter((t) => t.n > 0);

  return (
    <>
      <PageHeader
        eyebrow={today}
        title={`${greeting()}${firstName ? `, ${firstName}` : ''}`}
        description="Here’s how Rang and Craft is doing."
        actions={(
          <>
            <Link to="/admin/orders" className="ad-btn ad-btn--secondary"><ReceiptText aria-hidden /> Orders</Link>
            <Link to="/admin/products/add" className="ad-btn"><Plus aria-hidden /> Add product</Link>
          </>
        )}
      />

      {!loading && (
        todo.length ? (
          <div className="ad-attn" role="list" aria-label="Needs your attention">
            {todo.map((t) => (
              <Link key={t.to} to={t.to} className="ad-attn__item" role="listitem">
                <span className="ad-attn__icon"><t.icon aria-hidden /></span>
                <span><strong>{t.n}</strong> {t.label}</span>
                <ArrowRight aria-hidden />
              </Link>
            ))}
          </div>
        ) : (
          <div className="ad-alert ad-alert--success" style={{ marginBottom: 20 }}>
            <CheckCircle2 aria-hidden /> You’re all caught up. Nothing is waiting on you right now.
          </div>
        )
      )}

      <div className="ad-grid ad-grid--stats" style={{ marginBottom: 20 }}>
        <Stat label="Revenue" icon={IndianRupee} value={loading ? '—' : inr(data.totalRevenue)} delta={data.revenueDelta} meta={`vs previous ${range} days`} spark={data.revenue} />
        <Stat label="Paid orders" icon={ShoppingBag} value={loading ? '—' : data.totalCount} delta={data.countDelta} meta={`vs previous ${range} days`} spark={data.count} />
        <Stat label="Average order" icon={ReceiptText} tone="gold" value={loading ? '—' : inr(data.aov)} delta={data.aovDelta} meta={rangeLabel} />
        <Stat label="Customers" icon={Users} tone="gold" value={loading ? '—' : data.customers} delta={data.customersDelta} meta={`who paid, ${rangeLabel}`} />
      </div>

      <div className="ad-grid ad-grid--main">
        <div className="ad-stack">
          <Card
            title="Sales"
            description={`${inr(data.totalRevenue)} from ${data.totalCount} paid order${data.totalCount === 1 ? '' : 's'}, ${rangeLabel}`}
            actions={<Tabs label="Date range" value={range} onChange={setRange} items={[{ key: '7', label: '7D' }, { key: '30', label: '30D' }, { key: '90', label: '90D' }]} />}
          >
            {loading ? <span className="ad-skel" style={{ height: 240 }} /> : <AreaChart data={data.chart} format={inrShort} />}
          </Card>

          <Card title="Recent orders" actions={<Link to="/admin/orders" className="ad-link">View all <ArrowRight aria-hidden /></Link>} flush>
            {loading ? <SkeletonRows rows={4} /> : data.recent.length === 0 ? (
              <EmptyState icon={Package} title="No orders yet" text="When customers place orders they’ll show up here." />
            ) : (
              <div className="ad-table-wrap">
                <table className="ad-table ad-table--stack">
                  <thead><tr><th>Order</th><th>Customer</th><th>Status</th><th className="num">Total</th></tr></thead>
                  <tbody>
                    {data.recent.map((o) => {
                      const st = orderStatus(o);
                      const first = orderItems(o)[0];
                      return (
                        <tr key={o._id}>
                          <td className="is-primary">
                            <Link to={`/admin/orders?open=${o._id}`} className="ad-cell-main">
                              {first && <img src={getImageUrl(first.image, 100)} alt="" />}
                              <span style={{ minWidth: 0 }}>
                                <strong>{shortOrderId(o._id)}</strong>
                                <span>{timeAgo(o.createdAt)} · {orderItems(o).reduce((s, i) => s + (i.qty ?? i.quantity ?? 1), 0)} item(s)</span>
                              </span>
                            </Link>
                          </td>
                          <td data-label="Customer">{o.shippingAddress?.name || 'Guest'}</td>
                          <td data-label="Status"><Badge tone={st.tone}>{st.label}</Badge></td>
                          <td data-label="Total" className="num">{inr(orderTotal(o))}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <div className="ad-stack">
          <Card title="Top products" description={rangeLabel} flush>
            {loading ? <SkeletonRows rows={3} /> : data.top.length === 0 ? (
              <EmptyState icon={ShoppingBag} title="No sales yet" text={`Best sellers from the ${rangeLabel} will appear here.`} />
            ) : (
              <ul className="ad-list">
                {data.top.map((p, i) => (
                  <li key={p.name}>
                    <span className="ad-rank">{i + 1}</span>
                    <img className="ad-list__thumb" src={getImageUrl(p.image, 100)} alt="" />
                    <div className="ad-list__main"><strong>{p.name}</strong><span>{p.qty} sold</span></div>
                    <strong className="tabular">{inr(p.revenue)}</strong>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Inventory" actions={<Link to="/admin/inventory" className="ad-link">Manage <ArrowRight aria-hidden /></Link>} flush>
            {lowStock.length + soldOut.length === 0 ? (
              <EmptyState icon={CheckCircle2} title="Stock looks healthy" text="Every product has more than 3 pieces left." />
            ) : (
              <ul className="ad-list">
                {[...soldOut, ...lowStock].slice(0, 5).map((p) => (
                  <li key={productId(p)}>
                    <img className="ad-list__thumb" src={getImageUrl(p.image, 100)} alt="" />
                    <div className="ad-list__main"><strong>{p.name}</strong><span>{p.category}</span></div>
                    {isSoldOut(p) ? <Badge tone="danger">Sold out</Badge> : <Badge tone="warning">{p.countInStock} left</Badge>}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {soldOut.length > 0 && (
            <div className="ad-alert ad-alert--warning">
              <AlertTriangle aria-hidden />
              <span>{soldOut.length} product{soldOut.length === 1 ? ' is' : 's are'} sold out and hidden from shoppers’ size choices. Restock from Inventory.</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
