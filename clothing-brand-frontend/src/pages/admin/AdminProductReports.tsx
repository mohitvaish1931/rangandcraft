import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Boxes, CheckCircle2, Hourglass, Package, ShoppingBag, TrendingUp } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { isSoldOut } from '../../lib/catalog';
import { productId } from '../../lib/format';
import { getImageUrl } from '../../utils/mediaHelper';
import { lastDays, orderItems, pctChange } from '../../lib/adminFormat';
import { Badge, Card, EmptyState, PageHeader, SkeletonRows, Stat, Tabs } from '../../components/admin/ui';
import { RANGE_TABS, inr, lineQty, previousText, rangeText, useAdminData, useReportRange } from './useAdminData';
import '../../styles/admin-insights.css';

const LOW_STOCK = 5;
const SHOW = 8;

const AdminProductReports = () => {
  const { state } = useAppContext();
  const { paid, loading: ordersLoading } = useAdminData();
  const [range, setRange] = useReportRange();
  const n = Number(range);
  const loading = ordersLoading || state.productsStatus === 'loading';

  const report = useMemo(() => {
    const { index, inPrevious } = lastDays(n);
    const byId = new Map(state.products.map((p) => [productId(p), p]));
    const sales = new Map<string, { id: string; name: string; image: string; category: string; units: number; revenue: number }>();
    let prevUnits = 0;
    for (const o of paid) {
      const current = index(o.createdAt) >= 0;
      if (!current) {
        if (inPrevious(o.createdAt)) prevUnits += orderItems(o).reduce((s, it) => s + lineQty(it), 0);
        continue;
      }
      for (const it of orderItems(o)) {
        const id = String(it.product || it.name);
        const p = byId.get(id);
        const row = sales.get(id) || { id, name: p?.name || it.name, image: p?.image || it.image, category: p?.category || '', units: 0, revenue: 0 };
        row.units += lineQty(it);
        row.revenue += it.price * lineQty(it);
        sales.set(id, row);
      }
    }
    const rows = [...sales.values()].sort((a, b) => b.revenue - a.revenue || b.units - a.units);
    const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0);
    const units = rows.reduce((s, r) => s + r.units, 0);

    const live = state.products.filter((p) => p.status !== 'pre-upload');
    const slow = live
      .filter((p) => !isSoldOut(p) && !sales.has(productId(p)))
      .map((p) => ({ p, stock: p.countInStock ?? 0, value: (p.countInStock ?? 0) * p.price }))
      .sort((a, b) => b.value - a.value);
    const low = live
      .filter((p) => isSoldOut(p) || (p.countInStock ?? 99) <= LOW_STOCK)
      .sort((a, b) => Number(isSoldOut(b)) - Number(isSoldOut(a)) || (a.countInStock ?? 0) - (b.countInStock ?? 0));

    return {
      rows: rows.slice(0, 10),
      totalRevenue,
      units,
      sold: rows.length,
      catalogue: live.length,
      unitsDelta: pctChange(units, prevUnits),
      slow,
      low,
      unitsSold: (id: string) => sales.get(id)?.units ?? 0,
    };
  }, [paid, n, state.products]);

  const label = rangeText(range);
  const editLink = (id: string) => `/admin/products/${id}/edit`;

  return (
    <>
      <PageHeader
        title="Product performance"
        description="What’s selling, what isn’t, and what to restock. Based on paid orders."
        actions={<Tabs label="Date range" value={range} onChange={setRange} items={RANGE_TABS} />}
      />

      <div className="ad-grid ad-grid--stats" style={{ marginBottom: 20 }}>
        <Stat label="Pieces sold" icon={ShoppingBag} value={loading ? '—' : report.units} delta={loading ? undefined : report.unitsDelta} meta={previousText(range)} />
        <Stat label="Products that sold" icon={TrendingUp} value={loading ? '—' : report.sold} meta={loading ? label : `of ${report.catalogue} in your shop`} />
        <Stat label="No sales yet" icon={Hourglass} tone="gold" value={loading ? '—' : report.slow.length} meta={`in stock, nothing sold ${label}`} />
        <Stat label="Low or sold out" icon={Boxes} tone="gold" value={loading ? '—' : report.low.length} meta={`${LOW_STOCK} or fewer pieces left`} />
      </div>

      <Card
        title="Best sellers"
        description={loading ? 'Loading…' : report.rows.length ? `Top ${report.rows.length} by revenue, ${label} · ${inr(report.totalRevenue)} in item sales` : label}
        flush
      >
        {loading ? <SkeletonRows rows={5} /> : report.rows.length === 0 ? (
          <EmptyState icon={TrendingUp} title="No sales in this period" text="Try a longer date range. Your best sellers will be ranked here." />
        ) : (
          <div className="ad-table-wrap">
            <table className="ad-table ad-table--stack">
              <thead><tr><th>Product</th><th className="num">Pieces sold</th><th className="num">Revenue</th><th className="num">Share of revenue</th></tr></thead>
              <tbody>
                {report.rows.map((r, i) => {
                  const share = report.totalRevenue ? r.revenue / report.totalRevenue : 0;
                  return (
                    <tr key={r.id}>
                      <td className="is-primary">
                        <Link to={editLink(r.id)} className="ad-cell-main">
                          <span className="ad-rank">{i + 1}</span>
                          <img src={getImageUrl(r.image, 100)} alt="" />
                          <span style={{ minWidth: 0 }}>
                            <strong>{r.name}</strong>
                            <span>{r.category || 'Uncategorised'}</span>
                          </span>
                        </Link>
                      </td>
                      <td data-label="Pieces sold" className="num">{r.units}</td>
                      <td data-label="Revenue" className="num" style={{ fontWeight: 500 }}>{inr(r.revenue)}</td>
                      <td data-label="Share of revenue" className="num">
                        <span className="ad-insights-share">
                          <span className="ad-meter" aria-hidden><span style={{ width: `${Math.max(2, share * 100)}%` }} /></span>
                          <small>{Math.round(share * 100)}%</small>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="ad-grid ad-grid--2" style={{ marginTop: 20, alignItems: 'start' }}>
        <div>
        <Card
          title="Not selling"
          description={`In stock but no paid orders, ${label}. Most stock value first.`}
          flush
          footer={report.slow.length > SHOW ? <span className="ad-hint">and {report.slow.length - SHOW} more</span> : undefined}
        >
          {loading ? <SkeletonRows rows={4} /> : report.slow.length === 0 ? (
            <EmptyState icon={CheckCircle2} title="Everything is selling" text={`Every product in stock sold at least once, ${label}.`} />
          ) : (
            <ul className="ad-list">
              {report.slow.slice(0, SHOW).map(({ p, stock, value }) => (
                <li key={productId(p)}>
                  <img className="ad-list__thumb" src={getImageUrl(p.image, 100)} alt="" />
                  <div className="ad-list__main">
                    <strong><Link to={editLink(productId(p))}>{p.name}</Link></strong>
                    <span>{p.category} · {inr(p.price)} · {stock} in stock</span>
                  </div>
                  <span style={{ textAlign: 'right', flexShrink: 0 }} title="Stock on hand at selling price">
                    <strong className="tabular" style={{ display: 'block', fontWeight: 500 }}>{inr(value)}</strong>
                    <span style={{ fontSize: 12, color: 'var(--ad-muted)' }}>stock value</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        </div>

        <div>
        <Card
          title="Restock soon"
          description={`Sold out or ${LOW_STOCK} or fewer pieces left.`}
          actions={<Link to="/admin/inventory" className="ad-link">Inventory <ArrowRight aria-hidden /></Link>}
          flush
          footer={report.low.length > SHOW ? <span className="ad-hint">and {report.low.length - SHOW} more in Inventory</span> : undefined}
        >
          {state.productsStatus === 'loading' ? <SkeletonRows rows={4} /> : report.low.length === 0 ? (
            <EmptyState icon={Package} title="Stock looks healthy" text={`Every product has more than ${LOW_STOCK} pieces left.`} />
          ) : (
            <ul className="ad-list">
              {report.low.slice(0, SHOW).map((p) => {
                const sold = report.unitsSold(productId(p));
                return (
                  <li key={productId(p)}>
                    <img className="ad-list__thumb" src={getImageUrl(p.image, 100)} alt="" />
                    <div className="ad-list__main">
                      <strong><Link to={editLink(productId(p))}>{p.name}</Link></strong>
                      <span>{sold ? `${sold} sold ${label}` : `No sales ${label}`}</span>
                    </div>
                    {isSoldOut(p) ? <Badge tone="danger">Sold out</Badge> : <Badge tone="warning">{p.countInStock} left</Badge>}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
        </div>
      </div>

      {!loading && report.low.some(isSoldOut) && (
        <div className="ad-alert ad-alert--warning" style={{ marginTop: 20 }}>
          <AlertTriangle aria-hidden />
          <span>Sold-out products can’t be bought until you add stock. Update quantities from Inventory.</span>
        </div>
      )}
    </>
  );
};

export default AdminProductReports;
