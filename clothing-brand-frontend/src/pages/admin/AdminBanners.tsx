import { useState } from 'react';
import { 
  Image as ImageIcon, Plus, Trash2, ArrowUp, ArrowDown
} from 'lucide-react';
import { useAppContext, type Banner } from '../../context/AppContext';
import { API_ENDPOINTS } from '../../utils/api';

const AdminBanners = () => {
  const { state, dispatch } = useAppContext();
  const [text, setText] = useState('');
  const [type, setType] = useState<'info' | 'hot' | 'new' | 'sold-out'>('info');

  const addBanner = async () => {
    if (!text) { alert('Please enter banner text'); return; }
    try {
      const res = await fetch(API_ENDPOINTS.BANNERS, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ text, type }),
        credentials: 'include' 
      });
      if (res.ok) {
        const b = await res.json();
        dispatch({ type: 'SET_BANNERS', payload: [b, ...state.banners] });
        setText('');
      }
    } catch (e) {
      console.error('Failed to add banner:', e);
    }
  };

  const deleteBanner = async (id: string) => {
    if (!window.confirm('Delete this banner?')) return;
    try {
      const res = await fetch(`${API_ENDPOINTS.BANNERS}/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        dispatch({ type: 'SET_BANNERS', payload: state.banners.filter((b) => b._id !== id && b.id !== id) });
      }
    } catch (e) {
      console.error('Failed to delete banner:', e);
    }
  };

  const moveBanner = (index: number, direction: 'up' | 'down') => {
    const next = [...state.banners];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= next.length) return;
    
    const tmp = next[target];
    next[target] = next[index];
    next[index] = tmp;
    dispatch({ type: 'SET_BANNERS', payload: next });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center text-yellow-600">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Banner Management</h1>
            <p className="text-xs text-gray-500 font-medium">Storefront promotional tags</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Add New Banner</h3>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Banner Text</label>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="e.g. Free Shipping on Orders Over ₹2000"
                className="w-full p-2.5 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-yellow-600/20 outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Banner Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as NonNullable<Banner['type']>)}
                className="w-full p-2.5 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-yellow-600/20 outline-none transition-all"
              >
                <option value="info">Information (Blue)</option>
                <option value="hot">Hot Deal (Red)</option>
                <option value="new">New Arrival (Gold)</option>
                <option value="sold-out">Announcement (Gray)</option>
              </select>
            </div>
            <button
              onClick={addBanner}
              className="w-full py-3 bg-yellow-600 text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Banner
            </button>
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest px-2">Active Banners</h3>
          <div className="space-y-3">
            {state.banners.map((b, i: number) => (
              <div key={b._id || b.id || i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-10 rounded-full ${
                    b.type === 'hot' ? 'bg-red-500' :
                    b.type === 'new' ? 'bg-yellow-500' :
                    b.type === 'info' ? 'bg-blue-500' : 'bg-gray-400'
                  }`} />
                  <div>
                    <p className="text-sm font-bold text-gray-800">{b.text}</p>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">{b.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => moveBanner(i, 'up')} className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-50 rounded-lg">
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button onClick={() => moveBanner(i, 'down')} className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-50 rounded-lg">
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteBanner(b._id || b.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg ml-2">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBanners;
