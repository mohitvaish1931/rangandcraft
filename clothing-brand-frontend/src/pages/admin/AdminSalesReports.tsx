import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Clock, Download, IndianRupee, LayoutGrid, ReceiptText, ShoppingBag } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { productId } from '../../lib/format';
import { inrShort, isPaid, lastDays, orderItems, orderTotal, pctChange } from '../../lib/adminFormat';
import { AreaChart, Card, EmptyState, PageHeader, SkeletonRows, Stat, Tabs } from '../../components/admin/ui';
import {
  RANGE_TABS, downloadCsv, inr, lineCategory, lineQty, previousText, rangeText, useAdminData, useReportRange,
} from './useAdminData';
import '../../styles/admin-insights.css';

const DAY = 86_400_000;
const short = (d: Date) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

const AdminSalesReports = () => {
  const { state } = useAppContext();
  const { orders, paid, loading } = useAdminData();
  const [range, setRange] = useReportRange();
  const n = Number(range);

  const report = useMemo(() => {
    const { days, index, inPrevious } = lastDays(n);
    const revenue = days.map(() => 0);
    const count = days.map(() => 0);
    const categoryOf = new Map(state.products.map((p) => [productId(p), p.category]));
    const categories = new Map<string, { revenue: number; units: number }>();
    const money = { items: 0, offers: 0, coupons: 0, shipping: 0 };
    let prevRevenue = 0;
    let prevCount = 0;

    for (const o of paid) {
      const i = index(o.createdAt);
      if (i < 0) {
        if (inPrevious(o.createdAt)) { prevRevenue += orderTotal(o); prevCount += 1; }
        continue;
      }
      revenue[i] += orderTotal(o);
      count[i] += 1;
      let itemSum = 0;
      for (const it of orderItems(o)) {
        const qty = lineQty(it);
        const cat = lineCategory(it) || categoryOf.get(String(it.product)) || 'Other';
        const row = categories.get(cat) || { revenue: 0, units: 0 };
        row.revenue += it.price * qty;
        row.units += qty;
        categories.set(cat, row);
        itemSum += it.price * qty;
      }
      money.items += o.itemsPrice ?? itemSum;
      money.offers += o.offerDiscount || 0;
      money.coupons += o.discountAmount || 0;
      money.shipping += o.shippingPrice || 0;
    }

    let unpaid = 0;
    let unpaidValue = 0;
    for (const o of orders ?? []) {
      if (isPaid(o)) continue;
      if (index(o.createdAt) >= 0) { unpaid += 1; unpaidValue += orderTotal(o); }
    }

    const total = revenue.reduce((a, b) => a + b, 0);
    const orderCount = count.reduce((a, b) => a + b, 0);
    const aov = orderCount ? total / orderCount : 0;
    const prevAov = prevCount ? prevRevenue / prevCount : 0;

    // Daily points, or weekly for the 12-month view so the chart stays readable.
    let chart: { label: string; value: number; detail: string }[];
    if (n > 90) {
      const offset = (7 - (n % 7)) % 7; // last bucket always ends today
      const weeks = Math.ceil((n + offset) / 7);
      const wRev = Array.from({ length: weeks }, () => 0);
      const wCount = Array.from({ length: weeks }, () => 0);
      revenue.forEach((v, i) => { const w = Math.floor((i + offset) / 7); wRev[w] += v; wCount[w] += count[i]; });
      chart = wRev.map((v, w) => {
        const start = days[Math.max(0, w * 7 - offset)];
        return {
          label: short(start),
          value: v,
          detail: `Week of ${short(start)} · ${wCount[w]} order${wCount[w] === 1 ? '' : 's'}`,
        };
      });
    } else {
      chart = days.map((d, i) => ({
        label: n <= 7 ? d.toLocaleDateString('en-IN', { weekday: 'short' }) : short(d),
        value: revenue[i],
        detail: `${d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} · ${count[i]} order${count[i] === 1 ? '' : 's'}`,
      }));
    }

    const catTotal = [...categories.values()].reduce((s, c) => s + c.revenue, 0);
    const byCategory = [...categories.entries()]
      .map(([name, c]) => ({ name, ...c, share: catTotal ? c.revenue / catTotal : 0 }))
      .sort((a, b) => b.revenue - a.revenue);

    const bestDays = days
      .map((d, i) => ({ d, revenue: revenue[i], count: count[i] }))
      .filter((x) => x.revenue > 0)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      days, revenue, count, chart, total, orderCount, aov, unpaid, unpaidValue, byCategory, bestDays, money,
      revenueDelta: pctChange(total, prevRevenue),
      countDelta: pctChange(orderCount, prevCount),
      aovDelta: pctChange(aov, prevAov),
      spark: n > 90 ? chart.map((p) => p.value) : revenue,
    };
  }, [orders, paid, n, state.products]);

  const exportCsv = () => {
    const unpaidByDay = report.days.map(() => 0);
    const start = report.days[0].getTime();
    for (const o of orders ?? []) {
      if (isPaid(o)) continue;
      const i = Math.floor((new Date(o.createdAt).getTime() - start) / DAY);
      if (i >= 0 && i < unpaidByDay.length) unpaidByDay[i] += 1;
    }
    downloadCsv(
      `sales-${rangeText(range).replace(/\s+/g, '-')}-${new Date().toLocaleDateString('en-CA')}.csv`,
      ['Date', 'Paid orders', 'Revenue (INR)', 'Average order (INR)', 'Unpaid orders'],
      report.days.map((d, i) => [
        d.toLocaleDateString('en-CA'), report.count[i], Math.round(report.revenue[i]),
        report.count[i] ? Math.round(report.revenue[i] / report.count[i]) : 0, unpaidByDay[i],
      ]),
    );
  };

  const label = rangeText(range);
  const vs = previousText(range);
  const m = report.money;

  return (
    <>
      <PageHeader
        title="Sales"
        description="How much you’ve sold and when. Only paid orders count as sales."
        actions={(
          <>
            <Tabs label="Date range" value={range} onChange={setRange} items={RANGE_TABS} />
            <button type="button" className="ad-btn ad-btn--secondary" onClick={exportCsv} disabled={loading}><Download aria-hidden /> Export CSV</button>
          </>
        )}
      />

      <div className="ad-grid ad-grid--stats" style={{ marginBottom: 20 }}>
        <Stat label="Revenue" icon={IndianRupee} value={loading ? '—' : inr(report.total)} delta={loading ? undefined : report.revenueDelta} meta={vs} spark={loading ? undefined : report.spark} />
        <Stat label="Paid orders" icon={ShoppingBag} value={loading ? '—' : report.orderCount} delta={loading ? undefined : report.countDelta} meta={vs} />
        <Stat label="Average order" icon={ReceiptText} tone="gold" value={loading ? '—' : inr(report.aov)} delta={loading ? undefined : report.aovDelta} meta={vs} />
        <Stat
          label="Unpaid or abandoned"
          icon={Clock}
          tone="gold"
          value={loading ? '—' : report.unpaid}
          meta={loading ? label : report.unpaid ? `${inr(report.unpaidValue)} not collected` : 'nothing waiting on payment'}
        />
      </div>

      <Card
        title={n > 90 ? 'Revenue per week' : 'Revenue per day'}
        description={loading ? 'Loading…' : `${inr(report.total)} from ${report.orderCount} paid order${report.orderCount === 1 ? '' : 's'}, ${label}`}
      >
        {loading ? <span className="ad-skel" style={{ height: 260 }} /> : report.orderCount === 0 ? (
          <EmptyState icon={CalendarDays} title="No paid orders in this period" text="Try a longer date range, or check back once orders come in." />
        ) : (
          <AreaChart data={report.chart} format={inrShort} height={260} />
        )}
      </Card>

      <div className="ad-grid ad-grid--main" style={{ marginTop: 20 }}>
        <Card title="Revenue by category" description={`Item sales before discounts and shipping, ${label}`} flush>
          {loading ? <SkeletonRows rows={4} /> : report.byCategory.length === 0 ? (
            <EmptyState icon={LayoutGrid} title="Nothing sold yet" text="Categories will be ranked here once you have paid orders in this period." action={<Link to="/admin/products" className="ad-btn ad-btn--secondary">View products</Link>} />
          ) : (
            <div className="ad-table-wrap">
              <table className="ad-table ad-table--stack">
                <thead><tr><th>Category</th><th className="num">Units</th><th className="num">Revenue</th><th className="num">Share</th></tr></thead>
                <tbody>
                  {report.byCategory.map((c) => (
                    <tr key={c.name}>
                      <td className="is-primary" style={{ fontWeight: 500 }}>{c.name}</td>
                      <td data-label="Units" className="num">{c.units}</td>
                      <td data-label="Revenue" className="num" style={{ fontWeight: 500 }}>{inr(c.revenue)}</td>
                      <td data-label="Share" className="num">
                        <span className="ad-insights-share">
                          <span className="ad-meter" aria-hidden><span style={{ width: `${Math.max(2, c.share * 100)}%` }} /></span>
                          <small>{Math.round(c.share * 100)}%</small>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div className="ad-stack">
          <Card title="Where the money came from" description={label}>
            {loading ? <SkeletonRows rows={2} /> : (
              <dl className="ad-kv">
                <div><dt>Item sales</dt><dd>{inr(m.items)}</dd></div>
                <div><dt>Bundle offer savings</dt><dd>{m.offers ? `−${inr(m.offers)}` : inr(0)}</dd></div>
                <div><dt>Coupon discounts</dt><dd>{m.coupons ? `−${inr(m.coupons)}` : inr(0)}</dd></div>
                <div><dt>Shipping charged</dt><dd>{inr(m.shipping)}</dd></div>
                <div className="is-total"><dt>Revenue</dt><dd>{inr(report.total)}</dd></div>
              </dl>
            )}
          </Card>

          <Card title="Best days" description={`Highest revenue, ${label}`} flush>
            {loading ? <SkeletonRows rows={3} /> : report.bestDays.length === 0 ? (
              <EmptyState icon={CalendarDays} title="No sales yet" text="Your strongest days will show up here." />
            ) : (
              <ul className="ad-list">
                {report.bestDays.map((x, i) => (
                  <li key={x.d.getTime()}>
                    <span className="ad-rank">{i + 1}</span>
                    <div className="ad-list__main">
                      <strong>{x.d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</strong>
                      <span>{x.count} paid order{x.count === 1 ? '' : 's'}</span>
                    </div>
                    <strong className="tabular">{inr(x.revenue)}</strong>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
};

export default AdminSalesReports;
