import { useState } from 'react';
import { 
  Plus, Search, Edit, Trash2, Eye, ShoppingBag
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { API_ENDPOINTS } from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../../utils/mediaHelper';

const AdminProducts = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const [productSearch, setProductSearch] = useState('');
  const [draggedProductIndex, setDraggedProductIndex] = useState<number | null>(null);
  const [dragOverProductIndex, setDragOverProductIndex] = useState<number | null>(null);

  const filteredProducts = state.products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleDeleteProduct = async (id: number | string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`${API_ENDPOINTS.PRODUCTS}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        dispatch({ type: 'REMOVE_PRODUCT', payload: id });
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  const handleDragEnterProduct = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverProductIndex(index);
  };

  const handleDragOverProduct = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEndProduct = async () => {
    if (draggedProductIndex !== null && dragOverProductIndex !== null && draggedProductIndex !== dragOverProductIndex) {
      const products = [...state.products];
      const item = products.splice(draggedProductIndex, 1)[0];
      products.splice(dragOverProductIndex, 0, item);

      dispatch({ type: 'SET_PRODUCTS', payload: products });

      const reorderPayload = products.map((p, idx) => ({
        id: p._id || p.id,
        displayOrder: idx,
      }));

      try {
        const res = await fetch(`${API_ENDPOINTS.PRODUCTS}/reorder`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ products: reorderPayload }),
        });
        if (!res.ok) throw new Error('Drag reorder failed');
      } catch (err) {
        console.error('Drag reorder update failed:', err);
      }
    }
    setDraggedProductIndex(null);
    setDragOverProductIndex(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-purple/5 rounded-2xl flex items-center justify-center text-primary-purple">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Product Management</h1>
            <p className="text-xs text-gray-500 font-medium">{state.products.length} Products listed</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-primary-purple/20 w-64 transition-all outline-none"
            />
          </div>
          <button 
            onClick={() => navigate('/admin/products/add')}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-purple text-white rounded-xl hover:shadow-lg transition-all text-sm font-bold shadow-md"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Product</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Price</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.map((product, idx) => (
                <tr 
                  key={product._id || product.id}
                  draggable
                  onDragStart={() => setDraggedProductIndex(idx)}
                  onDragEnter={(e) => handleDragEnterProduct(e, idx)}
                  onDragOver={handleDragOverProduct}
                  onDragEnd={handleDragEndProduct}
                  className={`hover:bg-gray-50/50 transition-colors cursor-move ${dragOverProductIndex === idx ? 'bg-indigo-50/50 border-2 border-indigo-200' : ''}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-16 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 shrink-0">
                        <img 
                          src={getImageUrl(product.images?.[0] || product.image)} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">{product.name}</p>
                        <p className="text-[10px] text-gray-400 font-medium">ID: {product._id?.substring(0, 8) || product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-800">₹{product.price.toLocaleString()}</span>
                      {product.originalPrice && (
                        <span className="text-[10px] text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                      product.soldOut ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {product.soldOut ? 'Sold Out' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => navigate(`/product/${product._id || product.id}`)}
                        className="p-2 text-gray-400 hover:text-primary-purple hover:bg-primary-purple/5 rounded-xl transition-all"
                        title="View Live"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => navigate(`/admin/products/${product._id || product.id}/edit`)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product._id || product.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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

export default AdminProducts;
