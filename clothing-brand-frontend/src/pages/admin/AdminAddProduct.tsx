import { useState, type ChangeEvent } from 'react';
import { 
  ShoppingBag, ChevronRight
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { API_ENDPOINTS } from '../../utils/api';
import { useNavigate } from 'react-router-dom';



const AdminAddProduct = () => {
  const { dispatch } = useAppContext();
  const navigate = useNavigate();
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [videoFiles] = useState<File[]>([]);
  const [videoUrls] = useState<string[]>(['', '']);
  const [soldOut, setSoldOut] = useState(false);
  const [isBOGO, setIsBOGO] = useState(false);
  const [showOnHomepage, setShowOnHomepage] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files: File[] = Array.from(e.target.files || []);
    setImageFiles(files);
    const previews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(previews);
    setError('');
  };



  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    
    fd.delete('image');
    imageFiles.forEach((file) => {
      fd.append('image', file);
    });
    
    videoFiles.forEach((file) => {
      fd.append('videos_file', file);
    });
    
    const validUrls = videoUrls.filter(url => url.trim());
    if (validUrls.length > 0 || videoFiles.length > 0) {
      const finalVideos = [...validUrls, ...videoFiles.map((_, i) => `__file_${i}__`)];
      fd.append('videos', JSON.stringify(finalVideos));
    }

    fd.append('soldOut', String(soldOut));
    fd.append('isBOGO', String(isBOGO));
    fd.append('showOnHomepage', String(showOnHomepage));

    const parseRaw = (name: string, target: string, isJson: boolean = true) => {
      const raw = fd.get(name)?.toString() || '';
      if (raw) {
        const arr = name.includes('Instructions') || name.includes('materials') || name.includes('specifications')
          ? raw.split('\n').map(s => s.trim()).filter(s => s.length > 0)
          : [...new Set(raw.split(',').map(s => s.trim()).filter(s => s.length > 0))];
        fd.append(target, isJson ? JSON.stringify(arr) : arr.join(','));
      }
      fd.delete(name);
    };

    parseRaw('specifications_raw', 'specifications');
    parseRaw('materials_raw', 'materials');
    parseRaw('sizes_raw', 'sizes');
    parseRaw('shapes_raw', 'shapes');
    parseRaw('colors_raw', 'colors');
    parseRaw('careInstructions_raw', 'careInstructions');
    
    try {
      const res = await fetch(API_ENDPOINTS.PRODUCTS, { method: 'POST', body: fd, credentials: 'include' });
      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload?.error || payload?.message || 'Create failed');
      }
      const created = await res.json();
      dispatch({ type: 'ADD_PRODUCT', payload: created });
      alert('✅ Product added successfully!');
      navigate('/admin/products');
    } catch (err) {
      console.error('API error:', err);
      const message = err instanceof Error ? err.message : 'Failed to add product';
      setError(message);
      alert(`❌ Error: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-purple/5 rounded-2xl flex items-center justify-center text-primary-purple">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Add New Acquisition</h1>
            <p className="text-xs text-gray-500 font-medium">Create a new premium catalog entry</p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/admin/products')}
          className="text-xs font-bold text-gray-400 hover:text-gray-800 uppercase tracking-widest flex items-center gap-2"
        >
          Cancel Addition
        </button>
      </div>

      <div className="bg-white border border-gray-100 p-10 rounded-[2.5rem] shadow-sm">
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold uppercase tracking-widest">
            {error}
          </div>
        )}

        <form className="space-y-10" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Product Name</label>
              <input
                name="name"
                type="text"
                required
                className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:border-primary-purple/20 transition-all outline-none"
                placeholder="Enter item name..."
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Primary Category</label>
              <select 
                name="category" 
                required
                className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:border-primary-purple/20 transition-all outline-none"
                onChange={() => {}}
              >
                <option value="">Select category</option>
                <option value="Short Kurtas">Short Kurtas</option>
                <option value="Suits">Suits</option>
                <option value="Half Sleeves Shirts">Half Sleeves Shirts</option>
                <option value="Three Piece Half Sleeves Shirts">Three Piece Half Sleeves Shirts</option>
                <option value="Sarees">Sarees</option>
                <option value="Lehengas">Lehengas</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Valuation (₹)</label>
              <input name="price" type="number" required className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:border-primary-purple/20 transition-all outline-none" placeholder="0" />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Original Valuation (₹)</label>
              <input name="originalPrice" type="number" className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:border-primary-purple/20 transition-all outline-none" placeholder="0" />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Initial Stock</label>
              <input name="stock" type="number" className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:border-primary-purple/20 transition-all outline-none" placeholder="10" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Narrative (Description)</label>
            <textarea
              name="description"
              rows={4}
              className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm focus:bg-white focus:border-primary-purple/20 transition-all outline-none"
              placeholder="Describe the luxury essence of this item..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <h3 className="text-xs font-black text-gray-800 uppercase tracking-[0.2em] border-b border-gray-50 pb-2">Visual Assets</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">High-Res Images</label>
                  <input
                    name="image"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-primary-purple/5 file:text-primary-purple hover:file:bg-primary-purple/10 cursor-pointer"
                  />
                  {previewImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-4 gap-2">
                      {previewImages.map((preview, idx) => (
                        <img key={idx} src={preview} alt="" className="w-full h-16 object-cover rounded-xl border border-gray-100" />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xs font-black text-gray-800 uppercase tracking-[0.2em] border-b border-gray-50 pb-2">Specifications</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Sizes (Comma separated)</label>
                  <input name="sizes_raw" type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-transparent rounded-xl text-xs outline-none" placeholder="S, M, L, XL" />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Colors (Comma separated)</label>
                  <input name="colors_raw" type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-transparent rounded-xl text-xs outline-none" placeholder="Emerald, Ruby, Sapphire" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-10 border-t border-gray-50">
            <div className="flex gap-8">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" checked={soldOut} onChange={e => setSoldOut(e.target.checked)} className="w-4 h-4 rounded-md border-gray-300 text-primary-purple focus:ring-primary-purple/20" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-gray-800 transition-colors">Mark as Sold Out</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" checked={isBOGO} onChange={e => setIsBOGO(e.target.checked)} className="w-4 h-4 rounded-md border-gray-300 text-indigo-600 focus:ring-indigo-600/20" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">BOGO Promotion</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" checked={showOnHomepage} onChange={e => setShowOnHomepage(e.target.checked)} className="w-4 h-4 rounded-md border-gray-300 text-teal-600 focus:ring-teal-600/20" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-teal-600 transition-colors">Show On Homepage</span>
              </label>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="px-10 py-4 bg-primary-purple text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:shadow-2xl hover:shadow-primary-purple/20 transition-all disabled:opacity-50 flex items-center gap-3"
            >
              {isLoading ? '⏳ Finalizing...' : 'Acquire Item'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAddProduct;
