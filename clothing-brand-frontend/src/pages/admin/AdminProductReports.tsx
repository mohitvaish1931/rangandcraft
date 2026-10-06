import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { inr, useAdminData } from './useAdminData';

const LOW_STOCK = 5;

const AdminProductReports = () => {
  const { state } = useAppContext();
  const { paid, loading, error } = useAdminData();

  const top = useMemo(() => {
    const sales = new Map<string, { name: string; qty: number; revenue: number }>();
    paid.forEach((o) => o.orderItems?.forEach((i) => {
      const key = String(i.product);
      const row = sales.get(key) || { name: i.name, qty: 0, revenue: 0 };
      row.qty += i.qty;
      row.revenue += i.qty * i.price;
      sales.set(key, row);
    }));
    return [...sales.entries()].sort((a, b) => b[1].qty - a[1].qty).slice(0, 10);
  }, [paid]);

  const lowStock = useMemo(
    () => state.products
      .filter((p) => !p.soldOut && (p.countInStock ?? 0) <= LOW_STOCK)
      .sort((a, b) => (a.countInStock ?? 0) - (b.countInStock ?? 0)),
    [state.products]
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Product Reports</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-gray-100 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="text-[#1f4645]" />
            <h3 className="font-bold text-lg">Best sellers (paid orders)</h3>
          </div>
          {error ? <p className="text-red-600 text-sm">{error}</p> : loading ? <p className="text-gray-400 text-sm">Loading…</p> : top.length === 0 ? (
            <p className="text-gray-500 text-sm">No paid orders yet.</p>
          ) : (
            <ul className="space-y-3">
              {top.map(([id, row], i) => (
                <li key={id} className="flex justify-between items-center gap-4 border-b border-gray-50 pb-2 text-sm">
                  <span className="text-gray-700"><span className="text-gray-400 mr-2">{i + 1}.</span>{row.name}</span>
                  <span className="text-right whitespace-nowrap"><span className="font-semibold">{row.qty} sold</span><span className="block text-xs text-gray-400">{inr(row.revenue)}</span></span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border border-gray-100 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="text-amber-500" />
            <h3 className="font-bold text-lg">Low inventory (≤ {LOW_STOCK})</h3>
          </div>
          {lowStock.length === 0 ? (
            <p className="text-gray-500 text-sm">All products are well stocked.</p>
          ) : (
            <ul className="space-y-3">
              {lowStock.map((p) => (
                <li key={p._id || p.id} className="flex justify-between items-center gap-4 border-b border-gray-50 pb-2 text-sm">
                  <Link to={`/admin/products/${p._id || p.id}/edit`} className="text-gray-700 hover:text-gray-900 hover:underline">{p.name}</Link>
                  <span className={`font-semibold px-2 py-1 rounded whitespace-nowrap ${(p.countInStock ?? 0) === 0 ? 'text-red-700 bg-red-50' : 'text-amber-700 bg-amber-50'}`}>
                    {(p.countInStock ?? 0) === 0 ? 'Out of stock' : `${p.countInStock} left`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProductReports;
