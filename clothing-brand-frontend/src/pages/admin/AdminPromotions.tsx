import { useState } from 'react';
import { 
  Tag, Plus, Trash2, Power, PowerOff
} from 'lucide-react';
import { useAppContext, type Coupon } from '../../context/AppContext';
import { API_ENDPOINTS } from '../../utils/api';

const AdminPromotions = () => {
  const { state, dispatch } = useAppContext();
  const [discount, setDiscount] = useState(10);
  const [productId, setProductId] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [usageLimit, setUsageLimit] = useState<string>('');

  const generateCoupon = async () => {
    const code = 'RC' + Math.random().toString(36).slice(2, 8).toUpperCase();
    const payload = { 
      code, 
      discountPercent: discount, 
      active: true, 
      productId: productId === '' ? null : productId, 
      expiresAt: expiresAt === '' ? null : expiresAt, 
      usageLimit: usageLimit === '' ? null : Number(usageLimit), 
      used: 0 
    };
    try {
      const res = await fetch(API_ENDPOINTS.COUPONS, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
      });
      if (res.ok) {
        const c = await res.json();
        dispatch({ type: 'ADD_COUPON', payload: c });
        // Reset form
        setProductId('');
        setExpiresAt('');
        setUsageLimit('');
      }
    } catch (e) {
      console.error('Failed to create coupon:', e);
    }
  };

  const toggleCoupon = async (coupon: Coupon) => {
    try {
      const res = await fetch(`${API_ENDPOINTS.COUPONS}/${coupon.code}`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ ...coupon, active: !coupon.active }) 
      });
      if (res.ok) {
        const updated = await res.json();
        dispatch({ type: 'UPDATE_COUPON', payload: updated });
      }
    } catch (e) {
      console.error('Failed to toggle coupon:', e);
    }
  };

  const deleteCoupon = async (code: string) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      const res = await fetch(`${API_ENDPOINTS.COUPONS}/${code}`, { method: 'DELETE' });
      if (res.ok) {
        dispatch({ type: 'REMOVE_COUPON', payload: code });
      }
    } catch (e) {
      console.error('Failed to delete coupon:', e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Promotions & Coupons</h1>
            <p className="text-xs text-gray-500 font-medium">Manage discount codes and offers</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Generate Promo Code</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Discount (%)</label>
              <input 
                type="number" 
                value={discount} 
                onChange={e => setDiscount(Number(e.target.value))} 
                className="w-full p-2.5 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-purple-600/20 outline-none transition-all"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Apply to Product</label>
              <select 
                value={productId} 
                onChange={e => setProductId(e.target.value)} 
                className="w-full p-2.5 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-purple-600/20 outline-none transition-all"
              >
                <option value="">All Products</option>
                {state.products.map(p => <option key={p.id} value={p._id || p.id}>{p.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Expiry Date</label>
                <input 
                  type="date" 
                  value={expiresAt} 
                  onChange={e => setExpiresAt(e.target.value)} 
                  className="w-full p-2.5 bg-gray-50 border border-transparent rounded-xl text-[11px] focus:bg-white focus:border-purple-600/20 outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Usage Limit</label>
                <input 
                  type="number" 
                  value={usageLimit} 
                  onChange={e => setUsageLimit(e.target.value)} 
                  placeholder="∞"
                  className="w-full p-2.5 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-purple-600/20 outline-none transition-all"
                />
              </div>
            </div>

            <button
              onClick={generateCoupon}
              className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
            >
              <Plus className="w-4 h-4" />
              Generate Code
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest px-2">Active Promotions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.coupons.map((c) => (
              <div key={c.code} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3 group hover:border-purple-100 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-2 py-1 bg-purple-50 text-purple-600 rounded text-[10px] font-black uppercase tracking-widest border border-purple-100">
                      {c.code}
                    </span>
                    <p className="text-xl font-black text-gray-800 mt-2">{c.discountPercent}% OFF</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => toggleCoupon(c)} className={`p-2 rounded-lg transition-all ${c.active ? 'text-emerald-500 hover:bg-emerald-50' : 'text-gray-300 hover:bg-gray-50'}`}>
                      {c.active ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                    </button>
                    <button onClick={() => deleteCoupon(c.code)} className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-1.5 pt-2 border-t border-gray-50">
                  <p className="text-[10px] text-gray-500 flex justify-between">
                    <span>Applicable:</span>
                    <span className="font-bold text-gray-700 truncate max-w-[120px]">
                      {c.productId ? state.products.find(p => (p._id || p.id) === c.productId)?.name : 'All Products'}
                    </span>
                  </p>
                  <p className="text-[10px] text-gray-500 flex justify-between">
                    <span>Expires:</span>
                    <span className="font-bold text-gray-700">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'Never'}</span>
                  </p>
                  <p className="text-[10px] text-gray-500 flex justify-between">
                    <span>Usage:</span>
                    <span className="font-bold text-gray-700">{c.used || 0} / {c.usageLimit || '∞'}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPromotions;
