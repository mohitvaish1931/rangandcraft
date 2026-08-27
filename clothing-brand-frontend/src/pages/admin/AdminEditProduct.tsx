import { useState, useEffect, type ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit, X, Plus, Trash2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { API_ENDPOINTS } from '../../utils/api';
import { getImageUrl } from '../../utils/mediaHelper';

const AdminEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  
  const [localForm, setLocalForm] = useState<any>(null);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [soldOut, setSoldOut] = useState(false);
  const [isBOGO, setIsBOGO] = useState(false);
  const [showOnHomepage, setShowOnHomepage] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const product = state.products.find(p => ((p as any)._id || p.id) === id);
    if (product) {
      setLocalForm({
        ...product,
        images: [...(product.images || [])],
        sizes_raw: product.sizes?.join(', ') || '',
        colors_raw: product.colors?.join(', ') || '',
        materials_raw: product.materials?.join('\n') || '',
        specifications_raw: product.specifications?.join('\n') || '',
        careInstructions_raw: product.careInstructions?.join('\n') || ''
      });
      setSoldOut(!!product.soldOut);
      setIsBOGO(!!product.isBOGO);
      setShowOnHomepage(product.showOnHomepage !== false);
    }
  }, [id, state.products]);

  if (!localForm) return <div className="p-10 text-center text-gray-400">Loading product...</div>;

  const handleDeleteImage = (idx: number) => {
    const updated = localForm.images.filter((_: string, i: number) => i !== idx);
    setLocalForm({ ...localForm, images: updated });
  };

  const handleAddImages = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewImageFiles(prev => [...prev, ...files]);
    const previews = files.map(file => URL.createObjectURL(file));
    setNewImagePreviews(prev => [...prev, ...previews]);
  };

  const handleRemoveNewImage = (idx: number) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== idx));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const fd = new FormData(e.target as HTMLFormElement);
    
    // Remove default file input
    fd.delete('image');
    
    // Add new image files
    newImageFiles.forEach(file => fd.append('image', file));
    
    // Send existing images that user kept (after deleting some)
    if (localForm.images && localForm.images.length > 0) {
      fd.append('existing_images', JSON.stringify(localForm.images));
    }

    fd.append('soldOut', String(soldOut));
    fd.append('isBOGO', String(isBOGO));
    fd.append('showOnHomepage', String(showOnHomepage));

    const parseRaw = (name: string, target: string) => {
      const raw = fd.get(name)?.toString() || '';
      if (raw) {
        const arr = name.includes('raw') && (name.includes('Instructions') || name.includes('materials') || name.includes('specifications'))
          ? raw.split('\n').map(s => s.trim()).filter(Boolean)
          : raw.split(',').map(s => s.trim()).filter(Boolean);
        fd.append(target, JSON.stringify(arr));
      }
      fd.delete(name);
    };

    parseRaw('sizes_raw', 'sizes');
    parseRaw('colors_raw', 'colors');
    parseRaw('materials_raw', 'materials');
    parseRaw('specifications_raw', 'specifications');
    parseRaw('careInstructions_raw', 'careInstructions');

    try {
      const res = await fetch(`${API_ENDPOINTS.PRODUCTS}/${id}`, {
        method: 'PUT',
        body: fd
      });
      if (!res.ok) throw new Error('Update failed');
      const updated = await res.json();
      dispatch({ type: 'UPDATE_PRODUCT', payload: updated });
      alert('✅ Product updated successfully!');
      navigate('/admin/products');
    } catch (err) {
      console.error(err);
      alert('❌ Failed to update product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
            <Edit className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Edit Product</h1>
            <p className="text-xs text-gray-500 font-medium">Editing: {localForm.name}</p>
          </div>
        </div>
        <button onClick={() => navigate('/admin/products')} className="text-xs font-bold text-gray-400 hover:text-gray-800 uppercase tracking-widest">
          Discard Changes
        </button>
      </div>

      <div className="bg-white border border-gray-100 p-10 rounded-[2.5rem] shadow-sm">
        <form className="space-y-10" onSubmit={handleSubmit}>
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Product Name</label>
              <input name="name" defaultValue={localForm.name} className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:border-indigo-600/20 transition-all outline-none" />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Price (₹)</label>
              <input name="price" type="number" defaultValue={localForm.price} className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:border-indigo-600/20 transition-all outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Original Price (₹)</label>
              <input name="originalPrice" type="number" defaultValue={localForm.originalPrice || ''} className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:border-indigo-600/20 transition-all outline-none" />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Category</label>
              <select name="category" defaultValue={localForm.category} className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:border-indigo-600/20 transition-all outline-none">
                <option value="">Select category</option>
                <option value="Short Kurtas">Short Kurtas</option>
                <option value="Suits">Suits</option>
                <option value="Half Sleeves Shirts">Half Sleeves Shirts</option>
                <option value="Three Piece Half Sleeves Shirts">Three Piece Half Sleeves Shirts</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Description</label>
            <textarea name="description" rows={4} defaultValue={localForm.description} className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:border-indigo-600/20 transition-all outline-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Sizes (Comma sep.)</label>
              <input name="sizes_raw" defaultValue={localForm.sizes_raw} className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:border-indigo-600/20 transition-all outline-none" placeholder="S, M, L, XL" />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Colors (Comma sep.)</label>
              <input name="colors_raw" defaultValue={localForm.colors_raw} className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:border-indigo-600/20 transition-all outline-none" placeholder="Red, Blue, Green" />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Stock</label>
              <input name="stock" type="number" defaultValue={localForm.stock || 0} className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:border-indigo-600/20 transition-all outline-none" />
            </div>
          </div>

          {/* ═══════════ IMAGE MANAGER ═══════════ */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                Product Images ({localForm.images?.length || 0} existing{newImageFiles.length > 0 ? ` + ${newImageFiles.length} new` : ''})
              </label>
            </div>

            {/* Existing Images Grid */}
            {localForm.images && localForm.images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {localForm.images.map((img: string, idx: number) => (
                  <div
                    key={idx}
                    className="relative group rounded-2xl overflow-hidden border-2 border-gray-100 hover:border-red-300 transition-all duration-200 shadow-sm hover:shadow-lg"
                  >
                    <img
                      src={getImageUrl(img)}
                      alt={`Image ${idx + 1}`}
                      className="w-full h-36 object-cover"
                    />
                    {/* Image number badge */}
                    <span className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">
                      {idx + 1}
                    </span>
                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(idx)}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-xl flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                      title="Remove this image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/5 transition-all duration-200 pointer-events-none" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <p className="text-sm text-gray-400 italic">No images uploaded yet</p>
              </div>
            )}

            {/* New Images Preview */}
            {newImagePreviews.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-bold text-green-600 px-1">✓ {newImagePreviews.length} new image(s) will be added on save</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {newImagePreviews.map((preview, idx) => (
                    <div key={idx} className="relative group rounded-2xl overflow-hidden border-2 border-green-200 shadow-sm">
                      <img src={preview} alt={`New ${idx + 1}`} className="w-full h-36 object-cover" />
                      <span className="absolute top-2 left-2 bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">NEW</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(idx)}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-xl flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                        title="Remove this new image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Images Button */}
            <div className="border-2 border-dashed border-indigo-200 rounded-2xl p-6 bg-indigo-50/30 hover:bg-indigo-50/60 transition-colors">
              <label className="cursor-pointer flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Add More Images</span>
                <span className="text-[10px] text-gray-400">Click to select images (JPG, PNG, WebP)</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleAddImages}
                  className="hidden"
                  name="image"
                />
              </label>
            </div>
          </div>

          {/* Materials & Specs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Materials (One per line)</label>
              <textarea name="materials_raw" rows={3} defaultValue={localForm.materials_raw} className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:border-indigo-600/20 transition-all outline-none" placeholder="Pure Cotton&#10;Silk Blend" />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Specifications (One per line)</label>
              <textarea name="specifications_raw" rows={3} defaultValue={localForm.specifications_raw} className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:border-indigo-600/20 transition-all outline-none" placeholder="Machine Washable&#10;Pre-shrunk" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Care Instructions (One per line)</label>
            <textarea name="careInstructions_raw" rows={3} defaultValue={localForm.careInstructions_raw} className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:border-indigo-600/20 transition-all outline-none" placeholder="Wash with cold water&#10;Do not bleach" />
          </div>

          {/* Status & Visibility */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Status & Visibility</label>
              <div className="flex gap-6 flex-wrap">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" checked={soldOut} onChange={e => setSoldOut(e.target.checked)} className="w-4 h-4 rounded-md border-gray-300 text-indigo-600 focus:ring-indigo-600/20" />
                  <span className="text-xs font-bold text-gray-600 group-hover:text-gray-800 transition-colors">Sold Out</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" checked={isBOGO} onChange={e => setIsBOGO(e.target.checked)} className="w-4 h-4 rounded-md border-gray-300 text-purple-600 focus:ring-purple-600/20" />
                  <span className="text-xs font-bold text-purple-600 group-hover:text-purple-800 transition-colors">Buy 1 Get 1</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" checked={showOnHomepage} onChange={e => setShowOnHomepage(e.target.checked)} className="w-4 h-4 rounded-md border-gray-300 text-teal-600 focus:ring-teal-600/20" />
                  <span className="text-xs font-bold text-teal-600 group-hover:text-teal-800 transition-colors">Show On Homepage</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-10 border-t border-gray-50 gap-4">
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="px-8 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:shadow-2xl hover:shadow-indigo-600/20 transition-all disabled:opacity-50"
            >
              {isLoading ? '⏳ Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminEditProduct;
