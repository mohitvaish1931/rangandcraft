import { 
  Package, Edit
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../../utils/mediaHelper';

const AdminInventory = () => {
  const { state } = useAppContext();
  const navigate = useNavigate();

  return (
    <div className="space-y-10">
      <div className="bg-white p-10 rounded-[3rem] border border-gold-primary/10 shadow-sm flex items-center justify-between relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-text-primary luxury-serif tracking-widest uppercase mb-2">Live Inventory</h2>
          <div className="w-16 h-1 bg-primary-purple rounded-full"></div>
        </div>
        <div className="flex items-center gap-10 relative z-10">
          <div className="text-right">
            <p className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Health Score</p>
            <p className="text-lg font-black text-emerald-600 tracking-widest">98.5%</p>
          </div>
          <div className="flex items-center space-x-4 bg-white/5 px-6 py-4 rounded-[2rem] border border-gold-primary/10 shadow-inner">
            <Package className="h-6 w-6 text-primary-purple" />
            <span className="text-sm font-black text-text-primary uppercase tracking-widest">{state.products.length} Total SKUs</span>
          </div>
        </div>
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-gold-primary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="bg-white border border-gold-primary/10 rounded-[3rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="min-w-full">
            <thead>
              <tr className="bg-white/5">
                <th className="px-10 py-6 text-left text-[11px] font-black text-text-muted uppercase tracking-[0.3em]">Item Specification</th>
                <th className="px-10 py-6 text-left text-[11px] font-black text-text-muted uppercase tracking-[0.3em]">Category</th>
                <th className="px-10 py-6 text-center text-[11px] font-black text-text-muted uppercase tracking-[0.3em]">Quantity</th>
                <th className="px-10 py-6 text-left text-[11px] font-black text-text-muted uppercase tracking-[0.3em]">Stock Health</th>
                <th className="px-10 py-6 text-right text-[11px] font-black text-text-muted uppercase tracking-[0.3em]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold-primary/5">
              {state.products.map((product) => (
                <tr key={product.id} className="hover:bg-white/[0.02] transition-all duration-300 group">
                  <td className="px-10 py-6 whitespace-nowrap">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 overflow-hidden border border-gold-primary/10 shadow-sm relative group-hover:scale-105 transition-transform duration-500">
                        <img src={getImageUrl(product.images?.[0] || product.image)} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-text-primary tracking-wide">{product.name}</span>
                        <span className="text-[10px] text-text-muted font-bold tracking-widest uppercase mt-0.5">ID: {String(product._id || product.id).substring(0,8)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6 whitespace-nowrap">
                    <span className="px-4 py-1.5 bg-white/5 rounded-full text-[10px] font-black text-gold-primary border border-gold-primary/10 uppercase tracking-widest">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-10 py-6 whitespace-nowrap text-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className={`text-2xl font-black luxury-serif ${(product.countInStock ?? product.stock ?? 0) <= 5 ? 'text-primary-purple' : 'text-text-primary'}`}>
                        {product.countInStock ?? product.stock ?? 0}
                      </span>
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className={`h-full bg-gradient-to-r ${(product.countInStock ?? product.stock ?? 0) <= 5 ? 'from-red-600 to-red-400' : 'from-gold-primary to-gold-light'} transition-all duration-1000`} 
                          style={{ width: `${Math.min((product.countInStock ?? product.stock ?? 0) * 10, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6 whitespace-nowrap">
                    {(product.countInStock ?? product.stock ?? 0) > 5 ? (
                      <span className="inline-flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        In Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-full bg-red-50 text-red-700 border border-red-100 shadow-sm">
                        <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                        Low Stock
                      </span>
                    )}
                  </td>
                  <td className="px-10 py-6 whitespace-nowrap text-right">
                    <button
                      onClick={() => navigate(`/admin/products/${product._id || product.id}/edit`)}
                      className="p-3 bg-white border border-gold-primary/10 rounded-2xl text-text-muted hover:text-gold-primary hover:border-gold-primary/30 transition-all shadow-sm hover:shadow-xl hover:-translate-y-0.5"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
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

export default AdminInventory;
