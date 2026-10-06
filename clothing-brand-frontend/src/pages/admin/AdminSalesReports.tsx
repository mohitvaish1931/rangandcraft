import { useMemo, useState } from 'react';
import { IndianRupee, ShoppingCart, TrendingUp, Clock } from 'lucide-react';
import { inr, useAdminData } from './useAdminData';

const RANGES = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'All time', days: 0 },
];

const AdminSalesReports = () => {
  const { orders, paid, loading, error } = useAdminData();
  const [days, setDays] = useState(30);
  const [now] = useState(() => Date.now());

  const report = useMemo(() => {
    const since = days ? now - days * 86400000 : 0;
    const inRange = paid.filter((o) => new Date(o.createdAt).getTime() >= since);
    const revenue = inRange.reduce((s, o) => s + (o.totalPrice || 0), 0);
    const pending = (orders ?? []).filter((o) => !o.isPaid && o.paymentStatus !== 'Paid' && new Date(o.createdAt).getTime() >= since).length;

    // Revenue per day (or per month for long ranges).
    const byMonth = !days || days > 31;
    const buckets = new Map<string, number>();
    inRange.forEach((o) => {
      const d = new Date(o.createdAt);
      const key = byMonth ? d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }) : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      buckets.set(key, (buckets.get(key) || 0) + (o.totalPrice || 0));
    });
    const series = [...buckets.entries()].reverse();
    return { inRange, revenue, pending, series, aov: inRange.length ? revenue / inRange.length : 0 };
  }, [paid, orders, days, now]);

  const max = Math.max(1, ...report.series.map(([, v]) => v));
  const stats = [
    { label: 'Revenue (paid)', value: inr(report.revenue), icon: IndianRupee },
    { label: 'Paid orders', value: String(report.inRange.length), icon: ShoppingCart },
    { label: 'Average order value', value: inr(report.aov), icon: TrendingUp },
    { label: 'Unpaid / abandoned', value: String(report.pending), icon: Clock },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Sales Reports</h1>
        <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium">
          {RANGES.map((r) => <option key={r.days} value={r.days}>{r.label}</option>)}
        </select>
      </div>

      {error ? <p className="text-red-600">{error}</p> : loading ? <p className="text-gray-400">Loading…</p> : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((s) => (
              <div key={s.label} className="p-6 border border-gray-100 rounded-xl">
                <div className="p-3 bg-teal-50 text-[#1f4645] rounded-lg w-fit mb-4"><s.icon className="w-5 h-5" /></div>
                <h3 className="text-gray-500 text-sm font-medium mb-1">{s.label}</h3>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="border border-gray-100 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-6">Revenue over time</h3>
            {report.series.length === 0 ? (
              <p className="text-gray-500 text-sm py-16 text-center">No paid orders in this period yet.</p>
            ) : (
              <div className="flex items-end gap-2 h-64 overflow-x-auto pb-2">
                {report.series.map(([label, value]) => (
                  <div key={label} className="flex flex-col items-center gap-2 min-w-[44px] flex-1 h-full justify-end" title={`${label}: ${inr(value)}`}>
                    <span className="text-[10px] text-gray-500">{inr(value)}</span>
                    <div className="w-full bg-[#1f4645] rounded-t-md" style={{ height: `${(value / max) * 80}%`, minHeight: 4 }} />
                    <span className="text-[10px] text-gray-500 whitespace-nowrap">{label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminSalesReports;
