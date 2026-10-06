import { useState, useEffect } from 'react';
import { 
  ShoppingBag
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { API_ENDPOINTS } from '../../utils/api';
import { orderUserName, type AdminOrder } from '../../lib/adminTypes';
import { shortOrderId } from '../../lib/format';

const AdminOrders = () => {
  const { dispatch } = useAppContext();
  const [orders, setOrders] = useState<AdminOrder[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.ORDERS.BASE);
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="space-y-10">
      <div className="bg-white p-8 rounded-3xl border border-gold-primary/10 shadow-sm flex items-center justify-between relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-black text-text-primary luxury-serif tracking-widest uppercase mb-1">Order Management</h2>
          <div className="w-12 h-1 bg-primary-purple rounded-full"></div>
        </div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="text-right">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Status Overview</p>
            <p className="text-sm font-black text-gold-primary uppercase tracking-widest tabular-nums">
              {orders.filter(o => o.status === 'Processing').length} Pending
            </p>
          </div>
          <div className="flex items-center space-x-3 bg-white/30 px-4 py-3 rounded-2xl border border-gold-primary/10 shadow-inner">
            <ShoppingBag className="h-5 w-5 text-primary-purple" />
            <span className="text-xs font-bold text-text-primary uppercase tracking-wider">{orders.length} Total</span>
          </div>
        </div>
        <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-primary-purple/5 rounded-full blur-2xl"></div>
      </div>

      <div className="bg-white border border-gold-primary/10 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-[#FDFBF9]">
                <th className="px-8 py-5 text-left text-[10px] font-bold text-text-muted uppercase tracking-widest">Order Info</th>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-text-muted uppercase tracking-widest">Customer Detail</th>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-text-muted uppercase tracking-widest">Items</th>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-text-muted uppercase tracking-widest">Total</th>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-text-muted uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-right text-[10px] font-bold text-text-muted uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold-primary/5">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-white/10 transition-all duration-200 group">
                  <td className="px-8 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-text-primary tabular-nums">
                        {shortOrderId(order._id)}
                      </span>
                      <span className="text-[10px] text-text-muted font-medium">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-text-primary">
                        {order.shippingAddress?.name || orderUserName(order) || 'Guest'}
                      </span>
                      <span className="text-[10px] text-text-muted">{order.shippingAddress?.email}</span>
                      <span className="text-[10px] text-text-muted">{order.shippingAddress?.phoneNumber}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4 whitespace-nowrap">
                    <div className="flex flex-col max-w-[200px]">
                      <span className="text-xs text-text-secondary truncate font-medium">
                        {(order.orderItems || order.items)?.map((it) => it.name).join(', ')}
                      </span>
                      <span className="text-[10px] text-text-muted">{(order.orderItems || order.items)?.length || 0} item(s)</span>
                    </div>
                  </td>
                  <td className="px-8 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-text-primary luxury-serif">₹{(order.totalPrice || order.totalAmount)?.toLocaleString('en-IN')}</span>
                      <span className={`text-[8px] font-bold uppercase tracking-tighter ${order.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-orange-600'}`}>
                        {order.paymentStatus === 'Paid' ? '✓ Paid' : '⏳ Pending'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-full shadow-sm ${
                      order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      order.status === 'Shipped' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                      order.status === 'Processing' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                      'bg-gray-50 text-gray-700 border border-gray-100'
                    }`}>
                      <span className={`w-1 h-1 rounded-full ${
                        order.status === 'Delivered' ? 'bg-emerald-600' :
                        order.status === 'Shipped' ? 'bg-blue-600' :
                        order.status === 'Processing' ? 'bg-orange-600' :
                        'bg-gray-600'
                      }`}></span>
                      {order.status || 'Processing'}
                    </span>
                  </td>
                  <td className="px-8 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-3">
                      <select 
                        value={order.status}
                        onChange={async (e) => {
                          try {
                            const res = await fetch(`${API_ENDPOINTS.ORDERS.BASE}/${order._id}/status`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ status: e.target.value })
                            });
                            if (res.ok) {
                              const updated = await res.json();
                              setOrders(orders.map(o => o._id === order._id ? updated : o));
                              dispatch({ type: 'UPDATE_ORDER', payload: updated });
                            }
                          } catch (err) {
                            console.error('Failed to update order status:', err);
                          }
                        }}
                        className="bg-white border border-gray-100 rounded-lg py-1 px-3 text-[10px] font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-purple/20 transition-all"
                      >
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
