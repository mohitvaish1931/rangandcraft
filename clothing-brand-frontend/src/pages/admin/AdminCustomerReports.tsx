import { useMemo } from 'react';
import { Repeat, UserPlus, Users } from 'lucide-react';
import { customerKey, inr, useAdminData } from './useAdminData';

const AdminCustomerReports = () => {
  const { users, paid, loading, error } = useAdminData();

  const insights = useMemo(() => {
    const byCustomer = new Map<string, { name: string; email: string; orders: number; spent: number }>();
    paid.forEach((o) => {
      const key = customerKey(o);
      const row = byCustomer.get(key) || { name: o.shippingAddress?.name || 'Guest', email: o.shippingAddress?.email || '', orders: 0, spent: 0 };
      row.orders += 1;
      row.spent += o.totalPrice || 0;
      byCustomer.set(key, row);
    });
    const customers = [...byCustomer.values()];
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
    return {
      buyers: customers.length,
      returning: customers.filter((c) => c.orders > 1).length,
      newSignups: (users ?? []).filter((u) => u.createdAt && new Date(u.createdAt) >= monthStart).length,
      top: customers.sort((a, b) => b.spent - a.spent).slice(0, 10),
    };
  }, [paid, users]);

  const cards = [
    { label: 'Customers with a paid order', value: insights.buyers, icon: Users },
    { label: 'New sign-ups this month', value: insights.newSignups, icon: UserPlus },
    { label: 'Returning customers', value: insights.buyers ? `${insights.returning} (${Math.round((insights.returning / insights.buyers) * 100)}%)` : '0', icon: Repeat },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Customer Insights</h1>
      {error ? <p className="text-red-600">{error}</p> : loading ? <p className="text-gray-400">Loading…</p> : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {cards.map((c) => (
              <div key={c.label} className="border border-gray-100 rounded-xl p-6 text-center">
                <c.icon className="w-6 h-6 mx-auto mb-3 text-[#1f4645]" />
                <p className="text-gray-500 text-sm mb-1">{c.label}</p>
                <p className="text-3xl font-bold text-gray-900">{c.value}</p>
              </div>
            ))}
          </div>
          <div className="border border-gray-100 rounded-xl p-6">
            <h3 className="font-bold text-lg mb-4">Top customers by spend</h3>
            {insights.top.length === 0 ? <p className="text-gray-500 text-sm">No paid orders yet.</p> : (
              <table className="w-full text-sm">
                <thead><tr className="text-left text-gray-500"><th className="py-2 font-medium">Customer</th><th className="py-2 font-medium">Orders</th><th className="py-2 font-medium text-right">Spent</th></tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {insights.top.map((c) => (
                    <tr key={c.email || c.name}><td className="py-2"><div className="font-medium text-gray-900">{c.name}</div><div className="text-xs text-gray-400">{c.email}</div></td><td className="py-2">{c.orders}</td><td className="py-2 text-right font-semibold">{inr(c.spent)}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminCustomerReports;
