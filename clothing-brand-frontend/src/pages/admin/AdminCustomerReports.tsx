import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ReceiptText, Repeat, UserPlus, Users } from 'lucide-react';
import { orderUserName } from '../../lib/adminTypes';
import { initials, lastDays, orderTotal, pctChange, timeAgo } from '../../lib/adminFormat';
import { Badge, Card, Delta, EmptyState, PageHeader, SkeletonRows, Stat, Tabs } from '../../components/admin/ui';
import { RANGE_TABS, customerKey, inr, previousText, rangeText, useAdminData, useReportRange } from './useAdminData';
import '../../styles/admin-insights.css';

const DAY = 86_400_000;
const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);

const AdminCustomerReports = () => {
  const { users, paid, loading } = useAdminData();
  const [range, setRange] = useReportRange();
  const n = Number(range);

  const report = useMemo(() => {
    const { days, index, inPrevious } = lastDays(n);
    const start = days[0].getTime();
    const prevStart = start - n * DAY;
    const t = (iso?: string) => (iso ? new Date(iso).getTime() : 0);

    // Lifetime view of every customer, so we know who is new and who came back.
    const first = new Map<string, number>();
    const lifetime = new Map<string, number>();
    for (const o of paid) {
      const k = customerKey(o);
      const when = t(o.createdAt);
      if (!first.has(k) || when < first.get(k)!) first.set(k, when);
      lifetime.set(k, (lifetime.get(k) || 0) + 1);
    }

    const rows = new Map<string, { key: string; name: string; email: string; orders: number; spent: number; last: string }>();
    const prevKeys = new Set<string>();
    let revenue = 0;
    let count = 0;
    let prevRevenue = 0;
    let prevCount = 0;
    for (const o of paid) {
      const k = customerKey(o);
      if (index(o.createdAt) >= 0) {
        const row = rows.get(k) || { key: k, name: o.shippingAddress?.name || orderUserName(o) || 'Guest', email: o.shippingAddress?.email || '', orders: 0, spent: 0, last: o.createdAt };
        row.orders += 1;
        row.spent += orderTotal(o);
        if (t(o.createdAt) > t(row.last)) row.last = o.createdAt;
        rows.set(k, row);
        revenue += orderTotal(o);
        count += 1;
      } else if (inPrevious(o.createdAt)) {
        prevKeys.add(k);
        prevRevenue += orderTotal(o);
        prevCount += 1;
      }
    }

    const list = [...rows.values()];
    const isNew = (k: string) => (first.get(k) ?? 0) >= start;
    const fresh = list.filter((c) => isNew(c.key));
    const returning = list.length - fresh.length;
    const newRevenue = fresh.reduce((s, c) => s + c.spent, 0);
    const prevNew = [...prevKeys].filter((k) => { const f = first.get(k) ?? 0; return f >= prevStart && f < start; }).length;
    const repeaters = list.filter((c) => (lifetime.get(c.key) || 0) > 1).length;
    const aov = count ? revenue / count : 0;
    const prevAov = prevCount ? prevRevenue / prevCount : 0;

    const shoppers = (users ?? []).filter((u) => !u.isAdmin);
    const signups = shoppers.filter((u) => u.createdAt && index(u.createdAt) >= 0).length;
    const prevSignups = shoppers.filter((u) => u.createdAt && inPrevious(u.createdAt)).length;

    return {
      customers: list.length,
      customersDelta: pctChange(list.length, prevKeys.size),
      fresh: fresh.length,
      freshDelta: pctChange(fresh.length, prevNew),
      returning,
      newRevenue,
      returningRevenue: revenue - newRevenue,
      revenue,
      repeaters,
      repeatRate: pct(repeaters, list.length),
      aov,
      aovDelta: pctChange(aov, prevAov),
      signups,
      signupsDelta: pctChange(signups, prevSignups),
      top: list.sort((a, b) => b.spent - a.spent).slice(0, 10).map((c) => ({ ...c, isNew: isNew(c.key), lifetime: lifetime.get(c.key) || 0 })),
    };
  }, [paid, users, n]);

  const label = rangeText(range);
  const vs = previousText(range);
  const r = report;

  return (
    <>
      <PageHeader
        title="Customers"
        description="Who is buying, who comes back, and who spends the most. Based on paid orders."
        actions={<Tabs label="Date range" value={range} onChange={setRange} items={RANGE_TABS} />}
      />

      <div className="ad-grid ad-grid--stats" style={{ marginBottom: 20 }}>
        <Stat label="Customers who bought" icon={Users} value={loading ? '—' : r.customers} delta={loading ? undefined : r.customersDelta} meta={vs} />
        <Stat label="New customers" icon={UserPlus} value={loading ? '—' : r.fresh} delta={loading ? undefined : r.freshDelta} meta="first order ever" />
        <Stat label="Repeat rate" icon={Repeat} tone="gold" value={loading ? '—' : `${r.repeatRate}%`} meta={loading ? label : `${r.repeaters} of ${r.customers} have ordered more than once`} />
        <Stat label="Average order" icon={ReceiptText} tone="gold" value={loading ? '—' : inr(r.aov)} delta={loading ? undefined : r.aovDelta} meta={vs} />
      </div>

      <div className="ad-grid ad-grid--main">
        <Card
          title="Top customers"
          description={`By amount spent, ${label}`}
          actions={<Link to="/admin/customers" className="ad-link">All customers <ArrowRight aria-hidden /></Link>}
          flush
        >
          {loading ? <SkeletonRows rows={5} /> : r.top.length === 0 ? (
            <EmptyState icon={Users} title="No paying customers in this period" text="Try a longer date range. Your best customers will be listed here." />
          ) : (
            <div className="ad-table-wrap">
              <table className="ad-table ad-table--stack">
                <thead><tr><th>Customer</th><th>Type</th><th className="num">Orders</th><th className="num">Spent</th><th>Last order</th></tr></thead>
                <tbody>
                  {r.top.map((c) => (
                    <tr key={c.key}>
                      <td className="is-primary">
                        <div className="ad-cell-main">
                          <div className="ad-avatar ad-avatar--sm ad-avatar--soft" aria-hidden>{initials(c.name)}</div>
                          <span style={{ minWidth: 0 }}>
                            <strong>{c.name}</strong>
                            <span>{c.email || 'No email'}</span>
                          </span>
                        </div>
                      </td>
                      <td data-label="Type">{c.isNew ? <Badge tone="brand">New</Badge> : <Badge tone="gold">Returning</Badge>}</td>
                      <td data-label="Orders" className="num">
                        {c.orders}
                        {c.lifetime > c.orders && <span className="muted" style={{ fontSize: 12 }}> · {c.lifetime} all time</span>}
                      </td>
                      <td data-label="Spent" className="num" style={{ fontWeight: 500 }}>{inr(c.spent)}</td>
                      <td data-label="Last order" className="muted">{timeAgo(c.last)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div className="ad-stack">
          <Card title="New vs returning" description={`Customers who paid, ${label}`}>
            {loading ? <span className="ad-skel" style={{ height: 120 }} /> : r.customers === 0 ? (
              <p className="ad-hint">No paid orders in this period yet.</p>
            ) : (
              <>
                <div className="ad-insights-split" role="img" aria-label={`${r.fresh} new and ${r.returning} returning customers`}>
                  {r.fresh > 0 && <span style={{ width: `${(r.fresh / r.customers) * 100}%`, background: 'var(--ad-brand)' }} />}
                  {r.returning > 0 && <span style={{ width: `${(r.returning / r.customers) * 100}%`, background: 'var(--ad-gold)' }} />}
                </div>
                <div className="ad-insights-legend">
                  <div>
                    <span><i style={{ background: 'var(--ad-brand)' }} /> New</span>
                    <strong>{r.fresh}</strong>
                    <small>{inr(r.newRevenue)} · {pct(r.newRevenue, r.revenue)}% of sales</small>
                  </div>
                  <div>
                    <span><i style={{ background: 'var(--ad-gold)' }} /> Returning</span>
                    <strong>{r.returning}</strong>
                    <small>{inr(r.returningRevenue)} · {pct(r.returningRevenue, r.revenue)}% of sales</small>
                  </div>
                </div>
              </>
            )}
          </Card>

          <Card title="Accounts created" description={label}>
            {loading ? <span className="ad-skel" style={{ height: 48 }} /> : (
              <>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span className="ad-stat__value" style={{ marginTop: 0 }}>{r.signups}</span>
                  <span className="ad-hint">new account{r.signups === 1 ? '' : 's'}</span>
                </div>
                {r.signupsDelta !== null && <div className="ad-stat__meta"><Delta value={r.signupsDelta} /> {vs}</div>}
              </>
            )}
            <p className="ad-hint" style={{ marginTop: 8 }}>Many customers check out as guests, so sign-ups are usually lower than buyers.</p>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AdminCustomerReports;
