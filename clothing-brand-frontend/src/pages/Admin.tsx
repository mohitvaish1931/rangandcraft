import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Edit, Trash2, Eye, Package, Users, ShoppingBag, 
  TrendingUp, ArrowUp, LayoutDashboard, Tag, Settings, 
  LogOut, Bell, Search, Menu, ChevronRight, PieChart, Video, 
  Image as ImageIcon, Ticket, Home, ExternalLink
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { API_ENDPOINTS } from '../utils/api';
import { getImageUrl } from '../utils/mediaHelper';

const SUBCATEGORIES: Record<string, string[]> = {
  'Short Kurtas': ['Daily Wear', 'Festive', 'Hand-embroidered', 'Printed'],
  Suits: ['Anarkali', 'Straight Cut', 'Sharara', 'Palazzo Set', 'Gown Style']
};

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const { state, dispatch } = useAppContext();
  const [editProduct, setEditProduct] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [draggedProductIndex, setDraggedProductIndex] = useState<number | null>(null);
  const [dragOverProductIndex, setDragOverProductIndex] = useState<number | null>(null);
  const [productSearch, setProductSearch] = useState('');
  
  const [orders, setOrders] = useState<any[]>([]);


  React.useEffect(() => {
    const rawUser = localStorage.getItem('rr_user');
    if (rawUser) {
      try {
        const parsed = JSON.parse(rawUser);
        if (parsed && parsed.isAdmin) {
          if (!state.user) {
            dispatch({ type: 'SET_USER', payload: { id: parsed.id, email: parsed.email, name: parsed.name, isAdmin: parsed.isAdmin } });
          }
          return;
        }
      } catch (e) { /* ignore */ }
    }
    if (!state.user || !state.user.isAdmin) {
      navigate('/login');
    }
  }, []);

  React.useEffect(() => {
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

  const totalRevenue = orders.reduce((sum, order) => {
    if (order.paymentStatus === 'Paid') {
      return sum + (order.totalAmount || 0);
    }
    return sum;
  }, 0);

  const stats = [
    { 
      name: 'TOTAL ORDERS', 
      value: orders.length > 0 ? orders.length : 120, 
      icon: ShoppingBag, 
      color: 'bg-emerald-50', 
      iconColor: 'text-emerald-500',
      change: '12%',
      isPositive: true,
      barColor: 'bg-emerald-400'
    },
    { 
      name: 'TOTAL CUSTOMERS', 
      value: new Set(orders.map(o => o.user?._id || o.user)).size > 0 ? new Set(orders.map(o => o.user?._id || o.user)).size : 256, 
      icon: Users, 
      color: 'bg-indigo-50', 
      iconColor: 'text-indigo-500',
      change: '8%',
      isPositive: true,
      barColor: 'bg-indigo-400'
    },
    { 
      name: 'TOTAL PRODUCTS', 
      value: state.products.length > 0 ? state.products.length : 34, 
      icon: Package, 
      color: 'bg-purple-50', 
      iconColor: 'text-purple-500',
      change: '5%',
      isPositive: true,
      barColor: 'bg-purple-400'
    },
    { 
      name: 'REVENUE', 
      value: totalRevenue > 0 ? `₹${totalRevenue.toLocaleString()}` : '₹2,45,680', 
      icon: TrendingUp, 
      color: 'bg-pink-50', 
      iconColor: 'text-pink-500',
      change: '15%',
      isPositive: true,
      barColor: 'bg-pink-400'
    },
  ];

  const recentOrders = orders.slice(0, 5).map(order => ({
    id: order._id,
    orderNumber: order.orderNumber || `MOR-OLD-${order._id.substring(0, 4)}`,
    customer: order.shippingAddress?.name || order.user?.name || 'Guest',
    product: order.items?.[0]?.name + (order.items?.length > 1 ? ` +${order.items.length - 1}` : ''),
    amount: `₹${order.totalAmount?.toLocaleString()}`,
    status: order.status || 'Processing'
  }));
  


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
        id: (p as any)._id || p.id,
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



  const ProductForm = () => {
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [previewImages, setPreviewImages] = useState<string[]>([]);
    const [videoFiles, setVideoFiles] = useState<File[]>([]);
    const [videoUrls, setVideoUrls] = useState<string[]>(['', '']);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [soldOut, setSoldOut] = useState(false);
    const [isBOGO, setIsBOGO] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files: File[] = Array.from(e.target.files || []);
      setImageFiles(files);
      const previews = files.map(file => URL.createObjectURL(file));
      setPreviewImages(previews);
      setError('');
    };

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      setVideoFiles(files);
    };

    return (
      <div className="bg-white border border-gold-primary/20 p-8 rounded-2xl shadow-lg">

        <h3 className="text-lg font-bold text-text-primary mb-4">Add New Product</h3>
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}
        <form className="space-y-4" onSubmit={async (e) => {
          e.preventDefault();
          setIsLoading(true);
          setError('');
          
          const form = e.target as HTMLFormElement;
          const fd = new FormData(form);
          
          // Remove default image field from FormData
          fd.delete('image');
          
          // Explicitly append image files from state
          imageFiles.forEach((file) => {
            fd.append('image', file);
          });
          
          // Handle video files
          videoFiles.forEach((file) => {
            fd.append('videos_file', file);
          });
          
          // Collect video URLs (only non-empty ones)
          // Collect video URLs (only non-empty ones)
          const validUrls = videoUrls.filter(url => url.trim());
          if (validUrls.length > 0 || videoFiles.length > 0) {
            const finalVideos = [...validUrls, ...videoFiles.map((_, i) => `__file_${i}__`)];
            fd.append('videos', JSON.stringify(finalVideos));
          }

          // Add status and BOGO
          fd.append('soldOut', String(soldOut));
          fd.append('isBOGO', String(isBOGO));

          // Parse specifications from raw text
          const specsRaw = fd.get('specifications_raw')?.toString() || '';
          if (specsRaw) {
            const specsArray = specsRaw.split('\n').map(s => s.trim()).filter(s => s.length > 0);
            fd.append('specifications', JSON.stringify(specsArray));
          }
          fd.delete('specifications_raw');

          // Parse materials from raw text
          const matsRaw = fd.get('materials_raw')?.toString() || '';
          if (matsRaw) {
            const matsArray = matsRaw.split('\n').map(s => s.trim()).filter(s => s.length > 0);
            fd.append('materials', JSON.stringify(matsArray));
          }
          fd.delete('materials_raw');

          // Handle sizes
          const sizesRaw = fd.get('sizes_raw')?.toString() || '';
          if (sizesRaw) {
            const sizesArray = [...new Set(sizesRaw.split(',').map(s => s.trim()).filter(s => s.length > 0))];
            fd.append('sizes', JSON.stringify(sizesArray));
          }
          fd.delete('sizes_raw');

          // Handle shapes
          const shapesRaw = fd.get('shapes_raw')?.toString() || '';
          if (shapesRaw) {
            const shapesArray = [...new Set(shapesRaw.split(',').map(s => s.trim()).filter(s => s.length > 0))];
            fd.append('shapes', JSON.stringify(shapesArray));
          }
          fd.delete('shapes_raw');

          // Handle colors
          const colorsRaw = fd.get('colors_raw')?.toString() || '';
          if (colorsRaw) {
            const colorsArray = [...new Set(colorsRaw.split(',').map(s => s.trim()).filter(s => s.length > 0))];
            fd.append('colors', JSON.stringify(colorsArray));
          }
          fd.delete('colors_raw');

          // Handle care instructions
          const careRaw = fd.get('careInstructions_raw')?.toString() || '';
          if (careRaw) {
            const careArray = careRaw.split('\n').map(s => s.trim()).filter(s => s.length > 0);
            fd.append('careInstructions', JSON.stringify(careArray));
          }
          fd.delete('careInstructions_raw');
          
          try {
            const res = await fetch(API_ENDPOINTS.PRODUCTS, { method: 'POST', body: fd });
            if (!res.ok) {
              let message = 'Create failed';
              try {
                const payload = await res.json();
                message = payload?.error || payload?.message || message;
              } catch {
                // Keep fallback message if response is not JSON
              }
              throw new Error(message);
            }
            const created = await res.json();
            dispatch({ type: 'ADD_PRODUCT', payload: created });
            alert('✅ Product added successfully!');
          } catch (err) {
            console.error('API error:', err);
            const message = err instanceof Error ? err.message : 'Failed to add product';
            alert(`❌ Error adding product: ${message}`);
            setError(message);
          } finally {
            setIsLoading(false);
          }
          setShowAddProduct(false);
          setImageFiles([]);
          setPreviewImages([]);
          setVideoFiles([]);
          setVideoUrls(['', '']);
          setError('');
        }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label htmlFor="product-name" className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Product Name</label>
              <input
                id="product-name"
                name="name"
                type="text"
                autoComplete="off"
                className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary placeholder-text-muted/40 focus:ring-2 focus:ring-primary-purple/20 transition-all outline-none"
                placeholder="Enter product name"
              />
            </div>
            <div>
              <label htmlFor="product-category" className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Category</label>
              <select 
                id="product-category" 
                name="category" 
                className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary focus:ring-2 focus:ring-primary-purple/20 transition-all outline-none"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Select category</option>
                <option value="Short Kurtas">Short Kurtas</option>
                <option value="Suits">Suits</option>
              </select>
            </div>
            {selectedCategory && SUBCATEGORIES[selectedCategory]?.length > 0 && (
              <div>
                <label htmlFor="product-subcategory" className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Subcategory</label>
                <select id="product-subcategory" name="subcategory" className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary focus:ring-2 focus:ring-primary-purple/20 transition-all outline-none">
                  <option value="">Select subcategory</option>
                  {SUBCATEGORIES[selectedCategory].map(sub => (
                    <option key={sub} value={sub.toLowerCase().replace(/\s+/g, '-')}>{sub}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label htmlFor="product-price" className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Price (₹)</label>
              <input
                id="product-price"
                name="price"
                type="number"
                autoComplete="off"
                className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary placeholder-text-muted/40 focus:ring-2 focus:ring-primary-purple/20 transition-all outline-none"
                placeholder="0"
              />
            </div>
            <div>
              <label htmlFor="product-original-price" className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Original Price (₹)</label>
              <input
                id="product-original-price"
                name="originalPrice"
                type="number"
                autoComplete="off"
                className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary placeholder-text-muted/40 focus:ring-2 focus:ring-primary-purple/20 transition-all outline-none"
                placeholder="0"
              />
            </div>
            <div>
              <label htmlFor="product-stock" className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Available Stock</label>
              <input
                id="product-stock"
                name="stock"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary placeholder-text-muted/40 focus:ring-2 focus:ring-primary-purple/20 transition-all outline-none"
                placeholder="Enter stock quantity"
              />
            </div>
            <div>
              <label htmlFor="product-sizes" className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Sizes (Comma separated)</label>
              <input
                id="product-sizes"
                name="sizes_raw"
                type="text"
                className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary placeholder-text-muted/40 focus:ring-2 focus:ring-primary-purple/20 transition-all outline-none"
                placeholder="5, 6, 7, 8, 9"
              />
            </div>
            <div>
              <label htmlFor="product-shapes" className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Shapes (e.g. Heart, Round, Comma separated)</label>
              <input
                id="product-shapes"
                name="shapes_raw"
                type="text"
                className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary placeholder-text-muted/40 focus:ring-2 focus:ring-primary-purple/20 transition-all outline-none"
                placeholder="Heart, Round, Oval"
              />
            </div>
            <div>
              <label htmlFor="product-colors" className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Colors (Comma separated)</label>
              <input
                id="product-colors"
                name="colors_raw"
                type="text"
                className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary placeholder-text-muted/40 focus:ring-2 focus:ring-primary-purple/20 transition-all outline-none"
                placeholder="Gold, Rose Gold, Silver"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label htmlFor="product-link" className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Product External Link (Optional)</label>
              <input
                id="product-link"
                name="productLink"
                type="text"
                className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary placeholder-text-muted/40 focus:ring-2 focus:ring-primary-purple/20 transition-all outline-none"
                placeholder="https://instagram.com/p/..."
              />
            </div>
            <div>
              <label htmlFor="product-status" className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Publishing Status</label>
              <select id="product-status" name="status" className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary focus:ring-2 focus:ring-primary-purple/20 transition-all outline-none">
                <option value="published">Published</option>
                <option value="pre-upload">Pre-upload (Draft)</option>
              </select>
            </div>
            <div>
              <label htmlFor="product-order" className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Display Order (Numbering)</label>
              <input
                id="product-order"
                name="displayOrder"
                type="number"
                className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary focus:ring-2 focus:ring-primary-purple/20 transition-all outline-none"
                placeholder="0"
                defaultValue="0"
              />
            </div>
          </div>
          <div>
            <label htmlFor="product-description" className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Description</label>
            <textarea
              id="product-description"
              name="description"
              rows={4}
              className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary placeholder-text-muted/40 focus:ring-2 focus:ring-primary-purple/20 transition-all outline-none"
              placeholder="Enter product description"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label htmlFor="product-dimensions" className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Dimensions (e.g. 20cm x 15cm)</label>
              <input
                id="product-dimensions"
                name="dimensions"
                type="text"
                autoComplete="off"
                className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary placeholder-text-muted/40 focus:ring-2 focus:ring-primary-purple/20 transition-all outline-none"
                placeholder="Length x Width x Height"
              />
            </div>
            <div>
              <label htmlFor="product-weight" className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Weight (e.g. 50g)</label>
              <input
                id="product-weight"
                name="weight"
                type="text"
                autoComplete="off"
                className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary placeholder-text-muted/40 focus:ring-2 focus:ring-primary-purple/20 transition-all outline-none"
                placeholder="50g"
              />
            </div>
          </div>
          <div>
            <label htmlFor="product-materials" className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Materials (One per line)</label>
            <textarea
              id="product-materials"
              name="materials_raw"
              rows={2}
              className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary placeholder-text-muted/40 focus:ring-2 focus:ring-primary-purple/20 transition-all outline-none"
              placeholder="Premium Silk&#10;18k Gold PVD"
            />
          </div>
          <div>
            <label htmlFor="product-specifications" className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Specifications (One per line)</label>
            <textarea
              id="product-specifications"
              name="specifications_raw"
              rows={3}
              className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary placeholder-text-muted/40 focus:ring-2 focus:ring-primary-purple/20 transition-all outline-none"
              placeholder="Waterproof&#10;Anti-Tarnish&#10;Hypoallergenic"
            />
          </div>
          <div>
            <label htmlFor="product-care" className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Care Instructions (One per line)</label>
            <textarea
              id="product-care"
              name="careInstructions_raw"
              rows={3}
              className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary placeholder-text-muted/40 focus:ring-2 focus:ring-primary-purple/20 transition-all outline-none"
              placeholder="Waterproof and Sweatproof&#10;Chlorine and Sea water safe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Product Images (Multiple)</label>
            <input
              name="image"
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 bg-white border border-gold-primary/20 rounded-lg text-text-primary placeholder-platinum/40 focus:ring-2 focus:ring-sapphire-luxury/60 focus:border-transparent outline-none"
            />
            {previewImages.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-text-primary/70 mb-2">Selected images ({previewImages.length}):</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {previewImages.map((preview, idx) => (
                    <img key={idx} src={preview} alt={`Preview ${idx + 1}`} className="w-20 h-20 object-cover rounded border border-sapphire-luxury/40" />
                  ))}
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Product Videos (Max 2 - Upload or URLs)</label>
            <p className="text-xs text-text-primary/60 mb-3">You can upload video files (MP4, WebM) OR paste URLs (YouTube, Vimeo, or direct video links)</p>
            
            {/* Video File Upload */}
            <div className="mb-4">
              <label className="block text-sm text-text-primary/80 mb-2">Upload Video Files</label>
              <input
                type="file"
                multiple
                accept="video/*"
                onChange={handleVideoChange}
                className="w-full px-3 py-2 bg-white border border-gold-primary/20 rounded-lg text-text-primary placeholder-platinum/40 focus:ring-2 focus:ring-sapphire-luxury/60 focus:border-transparent outline-none"
              />
              {videoFiles.length > 0 && (
                <div className="mt-2 space-y-1">
                  {videoFiles.map((file, idx) => (
                    <p key={idx} className="text-xs text-gold-primary">✓ {file.name}</p>
                  ))}
                </div>
              )}
            </div>

            {/* Video URLs */}
            <div className="space-y-2">
              <label className="block text-sm text-text-primary/80">Or Add Video URLs</label>
              <input
                type="text"
                placeholder="Video 1 URL (YouTube, Vimeo, or MP4 link)"
                value={videoUrls[0]}
                onChange={(e) => {
                  const newUrls = [...videoUrls];
                  newUrls[0] = e.target.value;
                  setVideoUrls(newUrls);
                }}
                className="w-full px-3 py-2 bg-white border border-gold-primary/20 rounded-lg text-text-primary placeholder-platinum/40 focus:ring-2 focus:ring-sapphire-luxury/60 focus:border-transparent outline-none"
              />
              <input
                type="text"
                placeholder="Video 2 URL (optional)"
                value={videoUrls[1]}
                onChange={(e) => {
                  const newUrls = [...videoUrls];
                  newUrls[1] = e.target.value;
                  setVideoUrls(newUrls);
                }}
                className="w-full px-3 py-2 bg-white border border-gold-primary/20 rounded-lg text-text-primary placeholder-platinum/40 focus:ring-2 focus:ring-sapphire-luxury/60 focus:border-transparent outline-none"
              />
            </div>
          </div>
          <div className="flex items-center space-x-8">
            <label className="flex items-center space-x-2 text-text-primary cursor-pointer">
              <input
                type="checkbox"
                checked={soldOut}
                onChange={e => setSoldOut(e.target.checked)}
                className="rounded border-sapphire-luxury accent-gold-primary"
              />
              <span className="text-[10px] font-bold uppercase tracking-widest">Sold Out</span>
            </label>
            <label className="flex items-center space-x-2 text-text-primary cursor-pointer">
              <input
                type="checkbox"
                checked={isBOGO}
                onChange={e => setIsBOGO(e.target.checked)}
                className="rounded border-sapphire-luxury accent-gold-primary"
              />
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary-purple">Buy 1 Get 1 (BOGO)</span>
            </label>
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-premium-gold text-luxury-dark px-6 py-2 rounded-lg hover:shadow-glow-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '⏳ Adding...' : 'Add Product'}
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => { 
                setShowAddProduct(false); 
                setImageFiles([]);
                setPreviewImages([]); 
                setVideoFiles([]); 
                setVideoUrls(['', '']); 
                setSoldOut(false);
                setError('');
              }}
              className="bg-white text-text-primary px-6 py-2 rounded-lg border border-teal-luxury/30 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"

            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  };

  const VideoManager: React.FC = () => {
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');

    const addVideo = () => {
      if (!url) return;
      (async () => {
        try {
          const res = await fetch(API_ENDPOINTS.VIDEOS, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: title || 'Video', url }) });
          if (!res.ok) throw new Error('Video add failed');
          const v = await res.json();
          dispatch({ type: 'SET_VIDEOS', payload: [v, ...state.videos] });
        } catch (e) {
          const id = Date.now().toString();
          dispatch({ type: 'ADD_VIDEO', payload: { id, title: title || 'Video', url } });
        }
        setTitle('');
        setUrl('');
      })();
    };

    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="p-2 bg-white border border-teal-luxury/30 rounded text-text-primary placeholder-platinum/40 focus:ring-2 focus:ring-teal-luxury/60 outline-none"
          />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Video URL"
            className="p-2 bg-white border border-teal-luxury/30 rounded text-text-primary placeholder-platinum/40 focus:ring-2 focus:ring-teal-luxury/60 outline-none"
          />
          <button
            onClick={addVideo}
            className="btn-premium-gold text-luxury-dark px-4 rounded hover:shadow-glow-gold transition-all"
          >
            Add Video
          </button>
        </div>
        <div className="space-y-2">
          {state.videos.map((v, i) => (
            <div key={(v as any)._id || v.id || i} className="flex justify-between items-center p-2 bg-white border border-teal-luxury/20 rounded">
              <div>
                <div className="font-medium text-text-primary">{v.title}</div>
                <div className="text-sm text-text-primary/60 truncate max-w-md">{v.url}</div>
              </div>
              <div className="flex space-x-2">
                <a href={v.url} target="_blank" rel="noreferrer" className="text-gold-primary hover:text-gold-soft transition-colors">Open</a>
                <button
                  onClick={async () => {
                    try {
                      const videoAny = v as any;
                      const res = await fetch(`${API_ENDPOINTS.VIDEOS}/${videoAny._id || v.id}`, { method: 'DELETE' });
                      if (!res.ok) throw new Error('Delete failed');
                      dispatch({ type: 'SET_VIDEOS', payload: state.videos.filter(x => x.id !== v.id && (x as any)._id !== videoAny._id) });
                    } catch (e) {
                      dispatch({ type: 'REMOVE_VIDEO', payload: v.id });
                    }
                  }}
                  className="text-primary-wine hover:text-gold-soft transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const EditProductModal: React.FC = () => {
    const [localForm, setLocalForm] = useState<any>(null);
    const [previewImages, setPreviewImages] = useState<string[]>([]);
    const [videoFiles, setVideoFiles] = useState<File[]>([]);
    const [videoUrls, setVideoUrls] = useState<string[]>(['', '']);

    // Sync localForm whenever editProduct or showEditModal changes
    React.useEffect(() => {
      if (showEditModal && editProduct) {
        setLocalForm({
          id: editProduct.id || editProduct._id,
          name: editProduct.name || '',
          category: editProduct.category || '',
          price: editProduct.price || 0,
          originalPrice: editProduct.originalPrice || '',
          description: editProduct.description || '',
          dimensions: editProduct.dimensions || '',
          weight: editProduct.weight || '',
          materials: (() => {
            let mats = editProduct.materials;
            if (typeof mats === 'string' && mats.startsWith('[')) {
              try { mats = JSON.parse(mats); } catch (e) { /* ignore */ }
            }
            return Array.isArray(mats) ? mats.join('\n') : (mats || '');
          })(),
          specifications: (() => {
            let specs = editProduct.specifications;
            if (typeof specs === 'string' && specs.startsWith('[')) {
              try { specs = JSON.parse(specs); } catch (e) { /* ignore */ }
            }
            return Array.isArray(specs) ? specs.join('\n') : (specs || '');
          })(),
          soldOut: editProduct.soldOut || false,
          images: editProduct.images || [],
          videos: editProduct.videos || [],
          stock: editProduct.stock || 0,
          sizes: (() => {
            let s = editProduct.sizes;
            if (typeof s === 'string' && s.startsWith('[')) {
              try { s = JSON.parse(s); } catch (e) { /* ignore */ }
            }
            return Array.isArray(s) ? s.join(', ') : (s || '');
          })(),
          shapes: (() => {
            let s = editProduct.shapes;
            if (typeof s === 'string' && s.startsWith('[')) {
              try { s = JSON.parse(s); } catch (e) { /* ignore */ }
            }
            return Array.isArray(s) ? s.join(', ') : (s || '');
          })(),
          subcategory: editProduct.subcategory || '',
          productLink: editProduct.productLink || '',
          status: editProduct.status || 'published',
          displayOrder: editProduct.displayOrder || 0,
          colors: (() => {
            let c = editProduct.colors;
            if (typeof c === 'string' && c.startsWith('[')) {
              try { c = JSON.parse(c); } catch (e) { /* ignore */ }
            }
            return Array.isArray(c) ? c.join(', ') : (c || '');
          })(),
          careInstructions: (() => {
            let ci = editProduct.careInstructions;
            if (typeof ci === 'string' && ci.startsWith('[')) {
              try { ci = JSON.parse(ci); } catch (e) { /* ignore */ }
            }
            return Array.isArray(ci) ? ci.join('\n') : (ci || '');
          })(),
          isBOGO: editProduct.isBOGO || false,
        });
        setVideoUrls((editProduct?.videos && editProduct.videos.length > 0) ? editProduct.videos : ['', '']);
      } else {
        setLocalForm(null);
      }
    }, [showEditModal, editProduct]);

    if (!showEditModal || !localForm) {
      return null;
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files: File[] = Array.from(e.target.files || []);
      const previews = files.map(file => URL.createObjectURL(file));
      setPreviewImages(previews);
    };

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      setVideoFiles(files);
    };

    const submit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const fd = new FormData();
        // include fields from form state
        Object.keys(localForm).forEach(k => {
          if (localForm[k] !== undefined && localForm[k] !== null && 
              k !== 'images' && k !== 'image' && k !== 'videos' && 
              k !== 'specifications' && k !== 'materials' && 
              k !== 'sizes' && k !== 'shapes' && k !== 'colors') {
            fd.append(k, localForm[k]);
          }
        });

        // Handle specifications array
        if (localForm.specifications) {
          const specsArray = localForm.specifications.split('\n').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
          fd.append('specifications', JSON.stringify(specsArray));
        }

        // Handle materials array
        if (localForm.materials) {
          const matsArray = localForm.materials.split('\n').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
          fd.append('materials', JSON.stringify(matsArray));
        }
        
        // Handle sizes array
        if (localForm.sizes) {
          let sizesArray: string[] = [];
          if (Array.isArray(localForm.sizes)) {
            sizesArray = localForm.sizes;
          } else if (typeof localForm.sizes === 'string') {
            sizesArray = [...new Set(localForm.sizes.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0))] as string[];
          }
          fd.append('sizes', JSON.stringify(sizesArray));
        }

        // Handle shapes array
        if (localForm.shapes) {
          let shapesArray: string[] = [];
          if (Array.isArray(localForm.shapes)) {
            shapesArray = localForm.shapes;
          } else if (typeof localForm.shapes === 'string') {
            shapesArray = [...new Set(localForm.shapes.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0))] as string[];
          }
          fd.append('shapes', JSON.stringify(shapesArray));
        }

        // Handle colors array
        if (localForm.colors) {
          let colorsArray: string[] = [];
          if (Array.isArray(localForm.colors)) {
            colorsArray = localForm.colors;
          } else if (typeof localForm.colors === 'string') {
            colorsArray = [...new Set(localForm.colors.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0))] as string[];
          }
          fd.append('colors', JSON.stringify(colorsArray));
        }

        // Handle care instructions array
        if (localForm.careInstructions) {
          let careArray: string[] = [];
          if (Array.isArray(localForm.careInstructions)) {
            careArray = localForm.careInstructions;
          } else if (typeof localForm.careInstructions === 'string') {
            careArray = localForm.careInstructions.split('\n').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
          }
          fd.append('careInstructions', JSON.stringify(careArray));
        }

        // Handle video files
        videoFiles.forEach((file) => {
          fd.append('videos_file', file);
        });
        
        // Handle videos (URLs and file placeholders)
        let finalVideos: string[] = [];
        if (videoUrls && videoUrls.length > 0) {
          finalVideos = videoUrls.filter(url => url && url.trim());
        }
        if (videoFiles.length > 0) {
          finalVideos = [...finalVideos, ...videoFiles.map((_, i) => `__file_${i}__`)];
        }
        if (finalVideos.length > 0) {
          fd.append('videos', JSON.stringify(finalVideos));
        }
        
        // Handle image upload if new images were selected
        const fileInput = (e.target as HTMLFormElement).querySelector('input[type="file"][accept="image/*"]') as HTMLInputElement;
        if (fileInput?.files?.length) {
          Array.from(fileInput.files).forEach(file => {
            fd.append('image', file);
          });
        }
        
        // Send remaining existing images (after user may have deleted some)
        if (localForm.images && localForm.images.length > 0) {
          fd.append('existing_images', JSON.stringify(localForm.images));
        }
        
        const url = `${API_ENDPOINTS.PRODUCTS}/${localForm.id}`;
        const res = await fetch(url, { method: 'PUT', body: fd });
        if (!res.ok) throw new Error('Update failed');
        const updated = await res.json();
        dispatch({ type: 'UPDATE_PRODUCT', payload: updated });
      } catch (err) {
        const updated = {
          ...localForm,
          id: localForm.id,
          name: localForm.name,
          category: localForm.category,
          price: Number(localForm.price) || 0,
          originalPrice: localForm.originalPrice ? Number(localForm.originalPrice) : undefined,
          description: localForm.description || '',
          soldOut: !!localForm.soldOut,
        };
        dispatch({ type: 'UPDATE_PRODUCT', payload: updated });
      }
      setShowEditModal(false);
      setEditProduct(null);
      setPreviewImages([]);
    };

    return (
      <div className="fixed inset-0 bg-white/90 backdrop-blur-md flex items-center justify-center z-[100] overflow-y-auto py-10">
        <div className="bg-white border border-gold-primary/20 rounded-3xl shadow-2xl max-w-4xl w-full mx-4 p-8 md:p-12">
          <div className="mb-8">
            <h3 className="text-3xl font-black text-text-primary luxury-serif tracking-widest uppercase mb-1">Edit Product</h3>
            <p className="text-[10px] font-bold text-primary-purple tracking-[0.3em] uppercase">ID: {localForm?.id || localForm?._id}</p>
          </div>
          <form onSubmit={submit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Product Name</label>
                <input
                  className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary placeholder-text-muted/40 focus:ring-2 focus:ring-primary-purple/20 transition-all outline-none"
                  value={localForm?.name || ''}
                  onChange={e => setLocalForm({ ...localForm, name: e.target.value })}
                  placeholder="Product name"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Category</label>
                <select
                  className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary focus:ring-2 focus:ring-primary-purple/20 transition-all outline-none"
                  value={localForm?.category || ''}
                  onChange={e => setLocalForm({ ...localForm, category: e.target.value })}
                >
                  <option value="">Select category</option>
                  <option value="earrings">Earrings</option>
                  <option value="bracelets">Bracelets</option>
                  <option value="necklaces">Necklaces</option>
                  <option value="rings">Rings</option>
                  <option value="sets">Clothing Sets</option>
                  <option value="hand-chains">Hand Chains</option>
                </select>
              </div>
              {localForm?.category && SUBCATEGORIES[localForm.category]?.length > 0 && (
                <div>
                  <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Subcategory</label>
                  <select
                    className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary focus:ring-2 focus:ring-primary-purple/20 transition-all outline-none"
                    value={localForm?.subcategory || ''}
                    onChange={e => setLocalForm({ ...localForm, subcategory: e.target.value })}
                  >
                    <option value="">Select subcategory</option>
                    {SUBCATEGORIES[localForm.category].map(sub => (
                      <option key={sub} value={sub.toLowerCase().replace(/\s+/g, '-')}>{sub}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Current Price (₹)</label>
                <input
                  className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary placeholder-text-muted/40 focus:ring-2 focus:ring-primary-purple/20 transition-all outline-none"
                  value={localForm?.price || 0}
                  onChange={e => setLocalForm({ ...localForm, price: e.target.value })}
                  placeholder="Price"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Original Price (₹)</label>
                <input
                  className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary placeholder-text-muted/40 focus:ring-2 focus:ring-primary-purple/20 transition-all outline-none"
                  value={localForm?.originalPrice || ''}
                  onChange={e => setLocalForm({ ...localForm, originalPrice: e.target.value })}
                  placeholder="Original price"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Stock</label>
                <input
                  className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary focus:ring-2 focus:ring-primary-purple/20 outline-none"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={localForm?.stock === 0 ? '0' : (localForm?.stock || '')}
                  onChange={e => {
                    const val = e.target.value;
                    if (val === '' || /^\d+$/.test(val)) {
                      setLocalForm({ ...localForm, stock: val === '' ? '' : parseInt(val, 10) });
                    }
                  }}
                  placeholder="Enter stock quantity"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Sizes (Comma separated)</label>
                <input
                  className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary focus:ring-2 focus:ring-primary-purple/20 outline-none"
                  type="text"
                  value={localForm?.sizes || ''}
                  onChange={e => setLocalForm({ ...localForm, sizes: e.target.value })}
                  placeholder="5, 6, 7"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Shapes (Comma separated)</label>
                <input
                  className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary focus:ring-2 focus:ring-primary-purple/20 outline-none"
                  type="text"
                  value={localForm?.shapes || ''}
                  onChange={e => setLocalForm({ ...localForm, shapes: e.target.value })}
                  placeholder="Heart, Round, Oval"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Colors (Comma separated)</label>
                <input
                  className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary focus:ring-2 focus:ring-primary-purple/20 outline-none"
                  type="text"
                  value={localForm?.colors || ''}
                  onChange={e => setLocalForm({ ...localForm, colors: e.target.value })}
                  placeholder="Gold, Rose Gold, Silver"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Product External Link (Optional)</label>
                <input
                  className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary placeholder-text-muted/40 focus:ring-2 focus:ring-primary-purple/20 transition-all outline-none"
                  value={localForm?.productLink || ''}
                  onChange={e => setLocalForm({ ...localForm, productLink: e.target.value })}
                  placeholder="https://instagram.com/p/..."
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Publishing Status</label>
                <select
                  className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary focus:ring-2 focus:ring-primary-purple/20 transition-all outline-none"
                  value={localForm?.status || 'published'}
                  onChange={e => setLocalForm({ ...localForm, status: e.target.value })}
                >
                  <option value="published">Published</option>
                  <option value="pre-upload">Pre-upload (Draft)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Display Order (Numbering)</label>
                <input
                  type="number"
                  className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary focus:ring-2 focus:ring-primary-purple/20 transition-all outline-none"
                  value={localForm?.displayOrder || 0}
                  onChange={e => setLocalForm({ ...localForm, displayOrder: parseInt(e.target.value, 10) || 0 })}
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Description</label>
              <textarea
                className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary placeholder-text-muted/40 focus:ring-2 focus:ring-primary-purple/20 transition-all outline-none"
                rows={4}
                value={localForm?.description || ''}
                onChange={e => setLocalForm({ ...localForm, description: e.target.value })}
                placeholder="Description"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Dimensions</label>
                <input
                  className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary placeholder-text-muted/40 focus:ring-2 focus:ring-primary-purple/20 transition-all outline-none"
                  value={localForm?.dimensions || ''}
                  onChange={e => setLocalForm({ ...localForm, dimensions: e.target.value })}
                  placeholder="e.g. 20cm x 15cm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Weight</label>
                <input
                  className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary placeholder-text-muted/40 focus:ring-2 focus:ring-primary-purple/20 transition-all outline-none"
                  value={localForm?.weight || ''}
                  onChange={e => setLocalForm({ ...localForm, weight: e.target.value })}
                  placeholder="e.g. 50g"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Materials (One per line)</label>
              <textarea
                className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary placeholder-text-muted/40 focus:ring-2 focus:ring-primary-purple/20 transition-all outline-none"
                rows={2}
                value={localForm?.materials || ''}
                onChange={e => setLocalForm({ ...localForm, materials: e.target.value })}
                placeholder="Premium Silk&#10;18k Gold PVD"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Specifications (One per line)</label>
              <textarea
                className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary placeholder-text-muted/40 focus:ring-2 focus:ring-primary-purple/20 transition-all outline-none"
                rows={3}
                value={localForm?.specifications || ''}
                onChange={e => setLocalForm({ ...localForm, specifications: e.target.value })}
                placeholder="Premium Silk&#10;18k Gold Finish"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Care Instructions (One per line)</label>
              <textarea
                className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary placeholder-text-muted/40 focus:ring-2 focus:ring-primary-purple/20 transition-all outline-none"
                rows={3}
                value={localForm?.careInstructions || ''}
                onChange={e => setLocalForm({ ...localForm, careInstructions: e.target.value })}
                placeholder="Waterproof and Sweatproof&#10;Chlorine and Sea water safe"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">PRODUCT IMAGES</label>
              
              {/* Existing Images with delete buttons */}
              {(localForm?.images && localForm.images.length > 0) ? (
                <div className="mb-4">
                  <p className="text-xs text-text-primary/60 mb-2">Current Images ({localForm.images.length}) — Click ✕ to remove</p>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    {localForm.images.map((img: string, idx: number) => (
                      <div key={idx} className="relative group">
                        <img 
                          src={img} 
                          alt={`Image ${idx + 1}`} 
                          className="w-full h-24 object-cover rounded-xl border-2 border-gray-100 group-hover:border-red-300 transition-all" 
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = localForm.images.filter((_: string, i: number) => i !== idx);
                            setLocalForm({ ...localForm, images: updated });
                          }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg hover:bg-red-600 hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                          title="Remove this image"
                        >
                          ✕
                        </button>
                        <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded-md font-bold">
                          {idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-text-primary/50 mb-3 italic">No images yet</p>
              )}

              {/* Add new images */}
              <div className="border-2 border-dashed border-purple-200 rounded-xl p-4 bg-purple-50/30">
                <label className="block text-xs font-semibold text-purple-700 mb-2">➕ Add More Images</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full p-2 bg-white border border-purple-200 rounded-lg text-text-primary text-sm focus:ring-2 focus:ring-purple-300 outline-none"
                />
                {previewImages.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-green-600 font-semibold mb-2">✓ {previewImages.length} new image(s) will be added on save</p>
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                      {previewImages.map((preview, idx) => (
                        <img key={idx} src={preview} alt={`New ${idx + 1}`} className="w-full h-20 object-cover rounded-lg border-2 border-green-200" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Product Videos (Max 2 - Upload or URLs)</label>
              <p className="text-xs text-text-primary/60 mb-3">Upload video files OR paste URLs</p>
              
              {/* Current Videos */}
              {(localForm?.videos && localForm.videos.length > 0) && (
                <div className="mb-4">
                  <p className="text-sm text-text-primary/80 mb-2">Current Videos:</p>
                  <div className="space-y-1">
                    {localForm.videos.map((vid: string, idx: number) => (
                      <p key={idx} className="text-xs text-gold-primary">✓ {vid.substring(0, 50)}...</p>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Video File Upload */}
              <div className="mb-4">
                <label className="block text-sm text-text-primary/80 mb-2">Upload New Video Files</label>
                <input
                  type="file"
                  multiple
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="w-full p-2 bg-white border border-teal-luxury/30 rounded text-text-primary placeholder-platinum/40 focus:ring-2 focus:ring-teal-luxury/60 outline-none"
                />
                {videoFiles.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {videoFiles.map((file, idx) => (
                      <p key={idx} className="text-xs text-gold-primary">✓ {file.name}</p>
                    ))}
                  </div>
                )}
              </div>

              {/* Video URLs */}
              <div className="space-y-2">
                <label className="block text-sm text-text-primary/80">Or Add Video URLs</label>
                <input
                  type="text"
                  placeholder="Video 1 URL"
                  value={videoUrls[0] || ''}
                  onChange={e => {
                    const newUrls = [...videoUrls];
                    newUrls[0] = e.target.value;
                    setVideoUrls(newUrls);
                  }}
                  className="w-full p-2 bg-white border border-teal-luxury/30 rounded text-text-primary placeholder-platinum/40 focus:ring-2 focus:ring-teal-luxury/60 outline-none"
                />
                <input
                  type="text"
                  placeholder="Video 2 URL (optional)"
                  value={videoUrls[1] || ''}
                  onChange={e => {
                    const newUrls = [...videoUrls];
                    newUrls[1] = e.target.value;
                    setVideoUrls(newUrls);
                  }}
                  className="w-full p-2 bg-white border border-teal-luxury/30 rounded text-text-primary placeholder-platinum/40 focus:ring-2 focus:ring-teal-luxury/60 outline-none"
                />
              </div>
            </div>
            <div className="flex items-center space-x-8">
              <label className="flex items-center space-x-2 text-text-primary cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!localForm?.soldOut}
                  onChange={e => setLocalForm({ ...localForm, soldOut: e.target.checked })}
                  className="rounded border-teal-luxury accent-gold-primary"
                />
                <span className="text-[10px] font-bold uppercase tracking-widest">Sold Out</span>
              </label>
              <label className="flex items-center space-x-2 text-text-primary cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!localForm?.isBOGO}
                  onChange={e => setLocalForm({ ...localForm, isBOGO: e.target.checked })}
                  className="rounded border-teal-luxury accent-gold-primary"
                />
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary-purple">Buy 1 Get 1 (BOGO)</span>
              </label>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => { setShowEditModal(false); setEditProduct(null); setPreviewImages([]); setVideoFiles([]); setVideoUrls(['', '']); }}
                className="px-4 py-2 bg-white text-text-primary rounded border border-teal-luxury/30 hover:shadow-lg transition-all"

              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 btn-premium-gold text-luxury-dark rounded hover:shadow-glow-gold transition-all"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const BannerManager: React.FC = () => {
    const [text, setText] = useState('');
    const [type, setType] = useState<'info' | 'hot' | 'new' | 'sold-out'>('info');
    const addBanner = () => {
      if (!text) { alert('Please enter banner text'); return; }
      const id = Date.now().toString();
      (async () => {
        try {
          const res = await fetch(API_ENDPOINTS.BANNERS, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, type }) });
          if (!res.ok) throw new Error('Add banner failed');
          const b = await res.json();
          dispatch({ type: 'SET_BANNERS', payload: [b, ...state.banners] });
        } catch (e) {
          dispatch({ type: 'ADD_BANNER', payload: { id, text, type } });
        }
        setText('');
      })();
    };
    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Banner text"
            className="p-2 bg-white border border-primary-wine/30 rounded text-text-primary placeholder-platinum/40 focus:ring-2 focus:ring-primary-wine/60 outline-none col-span-3"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="p-2 bg-white border border-primary-wine/30 rounded text-text-primary focus:ring-2 focus:ring-primary-wine/60 outline-none"
          >
            <option value="info">Info</option>
            <option value="hot">Hot</option>
            <option value="new">New</option>
            <option value="sold-out">Sold Out</option>
          </select>
        </div>
        <div className="flex space-x-2 mb-4">
          <button
            onClick={addBanner}
            className="btn-premium-gold text-luxury-dark px-4 rounded hover:shadow-glow-gold transition-all"
          >
            Add Banner
          </button>
        </div>
        <div className="space-y-2">
          {state.banners.map((b, i) => (
            <div key={(b as any)._id || b.id || i} className="flex justify-between items-center p-2 bg-white border border-ruby-luxury/20 rounded">
              <div>
                <div className="font-medium text-text-primary">{b.text}</div>
                <div className="text-sm text-text-primary/60">{b.type}</div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    if (i === 0) return;
                    const next = [...state.banners];
                    const tmp = next[i - 1];
                    next[i - 1] = next[i];
                    next[i] = tmp;
                    dispatch({ type: 'SET_BANNERS', payload: next });
                  }}
                  className="text-gold-primary hover:text-rose-gold transition-colors"
                >
                  Up
                </button>
                <button
                  onClick={() => {
                    if (i === state.banners.length - 1) return;
                    const next = [...state.banners];
                    const tmp = next[i + 1];
                    next[i + 1] = next[i];
                    next[i] = tmp;
                    dispatch({ type: 'SET_BANNERS', payload: next });
                  }}
                  className="text-gold-primary hover:text-rose-gold transition-colors"
                >
                  Down
                </button>
                <button
                  onClick={async () => {
                    try {
                      const bannerAny = b as any;
                      const res = await fetch(`${API_ENDPOINTS.BANNERS}/${bannerAny._id || b.id}`, { method: 'DELETE' });
                      if (!res.ok) throw new Error('Delete failed');
                      dispatch({ type: 'SET_BANNERS', payload: state.banners.filter(x => x.id !== b.id && (x as any)._id !== bannerAny._id) });
                    } catch (e) {
                      dispatch({ type: 'REMOVE_BANNER', payload: b.id });
                    }
                  }}
                  className="text-ruby-luxury hover:text-rose-gold transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const CouponManager: React.FC = () => {
    const [discount, setDiscount] = useState(10);
    const [productId, setProductId] = useState<number | ''>('');
    const [expiresAt, setExpiresAt] = useState<string | null>(null);
    const [usageLimit, setUsageLimit] = useState<number | ''>('');
    const [customCode, setCustomCode] = useState('');

    const generateCode = () => {
      // Use custom code if provided, otherwise generate random 8 chars
      const code = customCode.trim() 
        ? customCode.trim().toUpperCase() 
        : 'RR' + Math.random().toString(36).substr(2, 6).toUpperCase();

      (async () => {
        const payload = { code, discountPercent: discount, active: true, productId: productId === '' ? null : Number(productId), expiresAt, usageLimit: usageLimit === '' ? null : Number(usageLimit), used: 0 };
        try {
          const res = await fetch(API_ENDPOINTS.COUPONS, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
          if (!res.ok) throw new Error('Create coupon failed');
          const c = await res.json();
          dispatch({ type: 'ADD_COUPON', payload: c });
          setCustomCode(''); // Reset after success
        } catch (e) {
          dispatch({ type: 'ADD_COUPON', payload });
        }
      })();
    };
    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
          <input type="text" value={customCode} onChange={e => setCustomCode(e.target.value)} placeholder="Code (leave blank for random)" className="p-2 border rounded" />
          <input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))} placeholder="Discount %" className="p-2 border rounded" />
          <select value={productId as any} onChange={e => setProductId(e.target.value === '' ? '' : Number(e.target.value))} className="p-2 border rounded">
            <option value="">All products</option>
            {state.products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input type="date" value={expiresAt || ''} onChange={e => setExpiresAt(e.target.value || null)} className="p-2 border rounded" />
          <input type="number" value={usageLimit as any} onChange={e => setUsageLimit(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Usage limit" className="p-2 border rounded" />
        </div>
        <button onClick={generateCode} className="btn-premium-gold text-luxury-dark px-4 py-2 rounded mb-6">Create Coupon</button>
        <div className="space-y-2">
          {state.coupons.map((c, i) => (
            <div key={(c as any)._id || c.code || i} className="flex justify-between items-center p-2 border rounded">
              <div>
                <div className="font-medium">{c.code} - {c.discountPercent}% {c.active ? '' : '(Inactive)'}</div>
                <div className="text-sm text-gray-600">Applies to: {c.productId ? state.products.find(p => p.id === c.productId)?.name : 'All'}</div>
                <div className="text-sm text-gray-600">Expires: {c.expiresAt || 'Never'} • Used: {c.used || 0} • Limit: {c.usageLimit || '∞'}</div>
              </div>
              <div className="flex space-x-2">
                <button onClick={async () => {
                  try {
                    const res = await fetch(`${API_ENDPOINTS.COUPONS}/${c.code}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...c, active: !c.active }) });
                    if (!res.ok) throw new Error('Toggle failed');
                    const updated = await res.json();
                    dispatch({ type: 'UPDATE_COUPON', payload: updated });
                  } catch (e) {
                    dispatch({ type: 'UPDATE_COUPON', payload: { ...c, active: !c.active } });
                  }
                }} className="text-blue-600">Toggle</button>
                <button onClick={async () => {
                  try {
                    const res = await fetch(`${API_ENDPOINTS.COUPONS}/${c.code}`, { method: 'DELETE' });
                    if (!res.ok) throw new Error('Delete failed');
                    dispatch({ type: 'REMOVE_COUPON', payload: c.code });
                  } catch (e) {
                    dispatch({ type: 'REMOVE_COUPON', payload: c.code });
                  }
                }} className="text-red-600">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const sidebarGroups = [
    {
      title: 'MANAGEMENT',
      links: [
        { id: 'products', name: 'Products', icon: ShoppingBag },
        { id: 'inventory', name: 'Inventory', icon: Package },
        { id: 'orders', name: 'Orders', icon: Ticket },
        { id: 'customers', name: 'Customers', icon: Users },
      ]
    },
    {
      title: 'STORE',
      links: [
        { id: 'content', name: 'Banners', icon: ImageIcon },
        { id: 'promotions', name: 'Promotions', icon: Tag },
        { id: 'settings', name: 'Store Settings', icon: Settings },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF9] flex">
      {/* Sidebar */}
      <aside 
        className={`bg-white transition-all duration-500 flex flex-col z-30 ${
          isSidebarOpen ? 'w-72' : 'w-24'
        } fixed inset-y-0 left-0 border-r border-gray-100 shadow-[20px_0_60px_-15px_rgba(0,0,0,0.02)]`}
      >
        <div className={`flex items-center gap-3 transition-all duration-500 ${isSidebarOpen ? 'p-8' : 'p-6 justify-center'}`}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <svg width="40" height="40" viewBox="0 0 100 100" className="text-primary-purple">
                <path fill="currentColor" d="M50 10 C 60 30, 90 30, 90 50 C 90 70, 60 70, 50 90 C 40 70, 10 70, 10 50 C 10 30, 40 30, 50 10" opacity="0.2" />
                <path fill="currentColor" d="M50 20 C 55 35, 80 35, 80 50 C 80 65, 55 65, 50 80 C 45 65, 20 65, 20 50 C 20 35, 45 35, 50 20" />
                <circle cx="50" cy="50" r="5" fill="white" />
              </svg>
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col">
                <span className="font-serif text-3xl font-black text-primary-purple tracking-tight leading-none">Rang and Craft</span>
                <span className="text-[10px] font-black tracking-[0.4em] text-gray-400 uppercase">Fashion</span>
              </div>
            )}
          </div>
        </div>

        <nav className={`flex-1 px-6 py-6 space-y-8 overflow-y-auto custom-scrollbar ${!isSidebarOpen && 'flex flex-col items-center'}`}>
          <div>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center transition-all duration-300 group relative ${
                isSidebarOpen ? 'w-full gap-4 px-4 py-3 rounded-2xl' : 'w-12 h-12 justify-center rounded-2xl'
              } ${
                activeTab === 'dashboard'
                  ? 'bg-primary-purple/5 text-primary-purple'
                  : 'text-gray-500 hover:text-primary-purple hover:bg-gray-50'
              }`}
            >
              <LayoutDashboard className={`w-5 h-5 shrink-0`} />
              {isSidebarOpen && (
                <span className="text-sm font-semibold">Dashboard</span>
              )}
            </button>
          </div>

          {sidebarGroups.map((group) => (
            <div key={group.title} className="space-y-3">
              {isSidebarOpen && (
                <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">{group.title}</p>
              )}
              <div className="space-y-1">
                {group.links.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => setActiveTab(link.id)}
                    className={`flex items-center transition-all duration-300 group relative ${
                      isSidebarOpen ? 'w-full gap-4 px-4 py-3 rounded-2xl' : 'w-12 h-12 justify-center rounded-2xl'
                    } ${
                      activeTab === link.id
                        ? 'bg-primary-purple/5 text-primary-purple shadow-sm'
                        : 'text-gray-500 hover:text-primary-purple hover:bg-gray-50'
                    }`}
                  >
                    <link.icon className={`w-5 h-5 shrink-0`} />
                    {isSidebarOpen && (
                      <span className="text-sm font-semibold">{link.name}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-6 border-t border-gray-50">
          <button 
            onClick={() => navigate('/')}
            className={`flex items-center transition-all duration-300 group ${
              isSidebarOpen ? 'w-full gap-4 px-6 py-4 text-gray-500 rounded-2xl' : 'w-12 h-12 justify-center mx-auto text-gray-500 rounded-2xl'
            } hover:bg-red-50 hover:text-red-600`}
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span className="text-sm font-semibold">Log out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-500 ${isSidebarOpen ? 'ml-72' : 'ml-24'}`}>
        {/* Top Header */}
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-20 flex items-center justify-between px-10">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all text-gray-500"
            >
              <Menu className={`w-5 h-5 transition-transform duration-500 ${!isSidebarOpen && 'rotate-90'}`} />
            </button>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search resources..." 
                className="bg-gray-50 border border-transparent rounded-xl py-2.5 pl-12 pr-6 text-sm focus:bg-white focus:border-primary-purple/20 w-80 transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all text-gray-600 border border-transparent hover:border-gray-200 group"
            >
              <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest">View Store</span>
              <ExternalLink className="w-3 h-3 opacity-50" />
            </button>

            <div className="w-px h-6 bg-gray-100 mx-2"></div>

            <button className="p-2.5 relative bg-gray-50 hover:bg-gray-100 rounded-xl transition-all text-gray-500">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-primary-purple rounded-full border-2 border-white text-[8px] font-bold text-white flex items-center justify-center">3</span>
            </button>
            
            <div className="flex items-center gap-3 pl-6 border-l border-gray-100 group cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-primary-purple font-bold text-sm border-2 border-white shadow-sm">
                A
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-gray-800 uppercase leading-none mb-1">Admin</p>
                <p className="text-[9px] text-yellow-600 font-bold uppercase opacity-80">Master Store</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </header>

        <main className="p-8 flex-1">
          {/* Main Content Sections based on Active Tab */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'dashboard' && (
              <>
                {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl border border-gold-primary/10 shadow-sm relative overflow-hidden mb-10">
              <div className="relative z-10">
                <h1 className="text-3xl font-black text-text-primary luxury-serif mb-2">
                  Welcome back, <span className="text-primary-purple">Admin</span>
                </h1>
                <p className="text-text-muted text-sm font-medium">
                  Here's what's happening with <span className="text-gold-primary font-bold">Rang and Craft</span> today.
                </p>
              </div>
              <div className="flex items-center gap-3 relative z-10">
                <div className="bg-gray-50/50 backdrop-blur-sm px-6 py-3 rounded-2xl border border-gray-100 flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Current Date</p>
                    <p className="text-sm font-bold text-gray-800">
                      {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary-purple shadow-sm border border-gray-100">
                    <PieChart className="w-5 h-5" />
                  </div>
                </div>
              </div>
              {/* Decorative background element */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gold-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
              {stats.map((stat) => (
                <div 
                  key={stat.name} 
                  className="bg-white p-6 rounded-3xl border border-gray-50 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div className={`w-12 h-12 rounded-2xl ${stat.color} ${stat.iconColor} flex items-center justify-center shadow-sm`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                      <ArrowUp className="w-3 h-3" />
                      {stat.change}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.name}</p>
                    <p className="text-3xl font-bold text-gray-800 tracking-tight">{stat.value}</p>
                  </div>

                  <div className="w-full h-1 bg-gray-50 rounded-full overflow-hidden mt-6">
                    <div className={`h-full ${stat.barColor} w-2/3 opacity-40 group-hover:w-full transition-all duration-1000`}></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Dashboard Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Orders Table */}
              <div className="lg:col-span-2 bg-white border border-gray-50 rounded-3xl shadow-sm overflow-hidden flex flex-col">
                <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-primary-purple">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest">RECENT ACTIVITY</h3>
                  </div>
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-yellow-600 hover:text-primary-purple transition-all tracking-widest uppercase flex items-center gap-1"
                  >
                    ALL ORDERS <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="overflow-x-auto flex-1">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50/50">
                        <th className="px-8 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">ORDER ID</th>
                        <th className="px-8 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">CUSTOMER</th>
                        <th className="px-8 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">PRODUCT</th>
                        <th className="px-8 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">AMOUNT</th>
                        <th className="px-8 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {recentOrders.length > 0 ? recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-8 py-5 whitespace-nowrap text-xs font-semibold text-gray-600">
                            {order.orderNumber}
                          </td>
                          <td className="px-8 py-5 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 text-[10px] font-bold">
                                {order.customer.split(' ').map((n: string) => n[0]).join('')}
                              </div>
                              <span className="text-xs text-gray-700 font-semibold">{order.customer}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5 whitespace-nowrap text-xs text-gray-500">
                            {order.product}
                          </td>
                          <td className="px-8 py-5 whitespace-nowrap text-xs text-gray-800 font-bold tabular-nums">
                            {order.amount}
                          </td>
                          <td className="px-8 py-5 whitespace-nowrap">
                            <span className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-full ${
                              order.status === 'Paid' || order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600' :
                              order.status === 'Processing' ? 'bg-yellow-50 text-yellow-600' :
                              order.status === 'Shipped' ? 'bg-blue-50 text-blue-600' :
                              'bg-gray-50 text-gray-400'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={5} className="px-8 py-20 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <div className="w-32 h-32 mb-6 opacity-20 relative">
                                <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M20 30 L50 15 L80 30 L80 70 L50 85 L20 70 Z" />
                                  <path d="M20 30 L50 45 L80 30" />
                                  <path d="M50 45 L50 85" />
                                  <circle cx="50" cy="50" r="10" className="animate-pulse" />
                                </svg>
                              </div>
                              <p className="text-gray-400 text-xs font-semibold tracking-widest uppercase mb-2">Once you receive orders, they will appear here.</p>
                              <button onClick={() => setActiveTab('orders')} className="mt-4 px-6 py-2.5 bg-primary-purple/5 text-primary-purple rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-primary-purple hover:text-white transition-all">
                                View All Orders
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 border-t border-gray-50 text-center">
                  <button onClick={() => setActiveTab('orders')} className="text-primary-purple text-xs font-bold hover:underline flex items-center justify-center gap-2 mx-auto">
                    View All Orders <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-8">
                <div className="bg-white border border-gray-50 rounded-3xl shadow-sm p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <TrendingUp className="w-5 h-5 text-gray-800" />
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest">QUICK ACTIONS</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <button 
                      onClick={() => setShowAddProduct(true)}
                      className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 hover:bg-white hover:shadow-md transition-all group border border-transparent hover:border-purple-100"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-100/50 flex items-center justify-center text-purple-600">
                          <Plus className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-gray-800">Add Product</p>
                          <p className="text-[10px] text-gray-400">Create a new luxury item</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary-purple group-hover:translate-x-1 transition-all" />
                    </button>

                    <button 
                      onClick={() => setActiveTab('content')}
                      className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 hover:bg-white hover:shadow-md transition-all group border border-transparent hover:border-yellow-100"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-yellow-100/50 flex items-center justify-center text-yellow-600">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-gray-800">Manage Banners</p>
                          <p className="text-[10px] text-gray-400">Update store promotions</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-yellow-600 group-hover:translate-x-1 transition-all" />
                    </button>

                    <button 
                      onClick={() => setActiveTab('settings')}
                      className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 hover:bg-white hover:shadow-md transition-all group border border-transparent hover:border-blue-100"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-100/50 flex items-center justify-center text-blue-600">
                          <Settings className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-gray-800">Store Settings</p>
                          <p className="text-[10px] text-gray-400">Configure your platform</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </button>
                  </div>
                </div>

                {/* Storage Status */}
                <div className="bg-white border border-gray-50 rounded-3xl shadow-sm p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Package className="w-5 h-5 text-gray-800" />
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest">STORAGE STATUS</h3>
                  </div>
                  
                  <div className="w-full h-3 bg-gray-50 rounded-full overflow-hidden mb-3">
                    <div className="w-3/4 h-full bg-yellow-500 rounded-full shadow-sm"></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-800">75% of 5GB used</p>
                    <p className="text-[10px] font-bold text-gray-400">3.75 GB / 5 GB</p>
                  </div>
                </div>
              </div>
            </div>
            </>
          )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
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
                      <tr key={(product as any).id} className="hover:bg-white/[0.02] transition-all duration-300 group">
                        <td className="px-10 py-6 whitespace-nowrap">
                          <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 overflow-hidden border border-gold-primary/10 shadow-sm relative group-hover:scale-105 transition-transform duration-500">
                              <img src={getImageUrl(product.image)} alt="" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-text-primary tracking-wide">{product.name}</span>
                              <span className="text-[10px] text-text-muted font-bold tracking-widest uppercase mt-0.5">ID: {String((product as any)._id || product.id).substring(0,8)}</span>
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
                            <span className={`text-2xl font-black luxury-serif ${((product as any).stock || 0) <= 5 ? 'text-primary-purple' : 'text-text-primary'}`}>
                              {(product as any).stock || 0}
                            </span>
                            <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                              <div 
                                className={`h-full bg-gradient-to-r ${((product as any).stock || 0) <= 5 ? 'from-red-600 to-red-400' : 'from-gold-primary to-gold-light'} transition-all duration-1000`} 
                                style={{ width: `${Math.min(((product as any).stock || 0) * 10, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-6 whitespace-nowrap">
                          {((product as any).stock || 0) > 5 ? (
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
                            onClick={() => navigate(`/admin/product/${(product as any)._id || product.id}/edit`)}
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
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between bg-white p-10 rounded-[3rem] border border-gold-primary/10 shadow-sm gap-8 relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-3xl font-black text-text-primary luxury-serif tracking-widest uppercase mb-2">Master Catalog</h2>
                <div className="flex items-center gap-4">
                  <span className="text-[11px] text-text-muted uppercase tracking-[0.3em] font-black">Collection Total: <span className="text-primary-purple">{state.products.length}</span></span>
                  <div className="w-2 h-2 bg-gold-primary rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-6 relative z-10">
                <div className="relative group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-gold-primary transition-all duration-300" />
                  <input
                    type="text"
                    placeholder="Filter products..."
                    className="bg-white/5 border border-gold-primary/5 rounded-[2rem] py-3.5 pl-14 pr-8 text-[11px] font-black uppercase tracking-widest focus:ring-4 focus:ring-gold-primary/10 focus:bg-white w-80 transition-all outline-none"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                  />
                </div>
                <button 
                  onClick={() => setShowAddProduct(true)}
                  className="bg-white text-white px-8 py-4 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] hover:bg-gold-primary transition-all duration-500 shadow-xl shadow-luxury-dark/20 flex items-center gap-3"
                >
                  <Plus className="w-4 h-4" /> New Acquisition
                </button>
              </div>
              <div className="absolute -right-10 -top-10 w-64 h-64 bg-gold-primary/5 rounded-full blur-[80px]"></div>
            </div>

            {showAddProduct && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <ProductForm />
                <div className="flex justify-center mt-6">
                  <button 
                    onClick={() => setShowAddProduct(false)}
                    className="text-[10px] font-black text-text-muted uppercase tracking-widest hover:text-primary-purple transition-colors"
                  >
                    Cancel Addition
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white border border-gold-primary/10 rounded-[3rem] overflow-hidden shadow-sm">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-white/5">
                      <th className="px-10 py-6 text-left text-[11px] font-black text-text-muted uppercase tracking-[0.3em]">Acquisition Detail</th>
                      <th className="px-10 py-6 text-left text-[11px] font-black text-text-muted uppercase tracking-[0.3em]">Classification</th>
                      <th className="px-10 py-6 text-left text-[11px] font-black text-text-muted uppercase tracking-[0.3em]">Valuation</th>
                      <th className="px-10 py-6 text-left text-[11px] font-black text-text-muted uppercase tracking-[0.3em]">Status</th>
                      <th className="px-10 py-6 text-right text-[11px] font-black text-text-muted uppercase tracking-[0.3em]">Management</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold-primary/5">
                    {state.products.filter(p => !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.category.toLowerCase().includes(productSearch.toLowerCase())).map((product, i) => (
                      <tr 
                        key={(product as any)._id || product.id || i}
                        className={`hover:bg-white/[0.02] transition-all duration-500 group cursor-move ${dragOverProductIndex === i ? 'border-t-2 border-gold-primary' : ''}`}
                        draggable
                        onDragStart={() => setDraggedProductIndex(i)}
                        onDragEnter={(e) => handleDragEnterProduct(e, i)}
                        onDragOver={handleDragOverProduct}
                        onDragEnd={handleDragEndProduct}
                      >
                        <td className="px-10 py-6 whitespace-nowrap">
                          <div className="flex items-center gap-6">
                            <div className="relative group/img">
                              <img
                                className="h-20 w-16 rounded-2xl object-cover border border-gold-primary/10 shadow-lg group-hover:scale-105 transition-all duration-700"
                                src={getImageUrl(product.image)}
                                alt={product.name}
                              />
                              <div className="absolute inset-0 ring-1 ring-inset ring-white/20 rounded-2xl"></div>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-text-primary tracking-wide group-hover:text-primary-purple transition-colors">{product.name}</span>
                              <div className="flex gap-1.5 mt-2">
                                {product.sizes?.map(s => (
                                  <span key={s} className="text-[8px] px-2 py-1 bg-gold-primary/5 border border-gold-primary/10 rounded-md text-gold-primary font-black uppercase tracking-tighter">{s}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-6 whitespace-nowrap">
                          <span className="text-[10px] font-black text-gold-primary uppercase tracking-[0.2em] bg-gold-primary/5 px-3 py-1.5 rounded-lg border border-gold-primary/10">{product.category}</span>
                        </td>
                        <td className="px-10 py-6 whitespace-nowrap">
                          <span className="text-lg font-black text-text-primary luxury-serif tabular-nums">₹{product.price.toLocaleString()}</span>
                        </td>
                        <td className="px-10 py-6 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-sm ${
                            product.soldOut 
                              ? 'bg-red-50 text-red-700 border border-red-100' 
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${product.soldOut ? 'bg-red-600' : 'bg-emerald-600'} ${!product.soldOut && 'animate-pulse'}`}></span>
                            {product.soldOut ? 'Sold Out' : 'Active'}
                          </span>
                        </td>
                        <td className="px-10 py-6 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-3 transition-all">
                            <button
                              onClick={() => navigate(`/admin/product/${(product as any)._id || product.id}/edit`)}
                              className="p-3 bg-white border border-gold-primary/10 rounded-2xl text-text-muted hover:text-gold-primary hover:border-gold-primary/30 transition-all shadow-sm hover:shadow-xl hover:-translate-y-1"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={async () => {
                                if (window.confirm('Exclue this item from catalog?')) {
                                  try {
                                    const productAny = product as any;
                                    const res = await fetch(`${API_ENDPOINTS.PRODUCTS}/${productAny._id || product.id}`, { method: 'DELETE' });
                                    if (res.ok) dispatch({ type: 'REMOVE_PRODUCT', payload: productAny._id || product.id });
                                  } catch (e) {
                                    console.error(e);
                                  }
                                }
                              }}
                              className="p-3 bg-white border border-gold-primary/10 rounded-2xl text-text-muted hover:text-primary-purple hover:border-primary-purple/30 transition-all shadow-sm hover:shadow-xl hover:-translate-y-1"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
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
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className="bg-white border border-gold-primary/10 p-8 rounded-3xl shadow-sm relative overflow-hidden group">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-primary-purple/10 rounded-2xl flex items-center justify-center text-primary-purple">
                    <Video className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-text-primary tracking-widest uppercase">Video Showcase</h3>
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Main Storefront Reels</p>
                  </div>
                </div>
                <div className="relative z-10 bg-white/10 p-4 rounded-2xl border border-gold-primary/5">
                  <VideoManager />
                </div>
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary-purple/5 rounded-full blur-2xl group-hover:bg-primary-purple/10 transition-colors"></div>
              </div>

              <div className="bg-white border border-gold-primary/10 p-8 rounded-3xl shadow-sm relative overflow-hidden group">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gold-primary/10 rounded-2xl flex items-center justify-center text-gold-primary">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-text-primary tracking-widest uppercase">Banners & Tags</h3>
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Promotions & Labels</p>
                  </div>
                </div>
                <div className="relative z-10 bg-white/10 p-4 rounded-2xl border border-gold-primary/5">
                  <BannerManager />
                </div>
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-gold-primary/5 rounded-full blur-2xl group-hover:bg-gold-primary/10 transition-colors"></div>
              </div>
            </div>

            <div className="bg-white border border-gold-primary/10 p-8 rounded-3xl shadow-sm relative overflow-hidden group">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-600">
                  <Tag className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-text-primary tracking-widest uppercase">Discount Coupons</h3>
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Manage promo codes</p>
                </div>
              </div>
              <div className="relative z-10 bg-white/10 p-6 rounded-2xl border border-gold-primary/5">
                <CouponManager />
              </div>
              <div className="absolute -right-8 -top-8 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-colors"></div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
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
                  <thead className="bg-white/40 border-b border-gold-primary/10">
                    <tr>
                      <th className="px-8 py-5 text-left text-[10px] font-black text-text-muted uppercase tracking-widest">Order Details</th>
                      <th className="px-8 py-5 text-left text-[10px] font-black text-text-muted uppercase tracking-widest">Customer</th>
                      <th className="px-8 py-5 text-left text-[10px] font-black text-text-muted uppercase tracking-widest">Items</th>
                      <th className="px-8 py-5 text-left text-[10px] font-black text-text-muted uppercase tracking-widest">Payment</th>
                      <th className="px-8 py-5 text-left text-[10px] font-black text-text-muted uppercase tracking-widest">Status</th>
                      <th className="px-8 py-5 text-left text-[10px] font-black text-text-muted uppercase tracking-widest">Shipping (Shipmozo)</th>
                      <th className="px-8 py-5 text-right text-[10px] font-black text-text-muted uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold-primary/5">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-white/10 transition-all duration-200 group">
                        <td className="px-8 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-text-primary tabular-nums">
                              {order.orderNumber || (order._id ? `GUL-${order._id.substring(0, 6).toUpperCase()}` : 'N/A')}
                            </span>
                            <span className="text-[10px] text-text-muted font-medium">
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-text-primary">
                              {order.shippingAddress?.name || order.user?.name || 'Guest'}
                            </span>
                            <span className="text-[10px] text-text-muted">{order.shippingAddress?.phone}</span>
                          </div>
                        </td>
                        <td className="px-8 py-4 whitespace-nowrap">
                          <div className="flex flex-col max-w-[200px]">
                            <span className="text-xs text-text-secondary truncate font-medium">
                              {order.items?.map((it: any) => it.name).join(', ')}
                            </span>
                            <span className="text-[10px] text-text-muted">{order.items?.length || 0} item(s)</span>
                          </div>
                        </td>
                        <td className="px-8 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-text-primary luxury-serif">₹{order.totalAmount?.toLocaleString()}</span>
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
                        <td className="px-8 py-4 whitespace-nowrap">
                          {order.awbNumber ? (
                            <div className="flex flex-col gap-1">
                              <span className="text-xs font-bold text-text-primary">AWB: {order.awbNumber}</span>
                              <span className="text-[10px] text-text-muted">{order.courierName}</span>
                              <div className="flex gap-2 mt-1">
                                {order.labelPdf && (
                                  <a href={order.labelPdf} target="_blank" rel="noreferrer" className="text-[9px] font-bold uppercase text-primary-purple hover:underline border border-primary-purple/20 px-2 py-0.5 rounded">Label</a>
                                )}
                                {order.trackingUrl && (
                                  <a href={order.trackingUrl} target="_blank" rel="noreferrer" className="text-[9px] font-bold uppercase text-blue-600 hover:underline border border-blue-600/20 px-2 py-0.5 rounded">Track</a>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-text-muted italic">Not generated</span>
                          )}
                        </td>
                        <td className="px-8 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-3">
                            <select 
                              value={order.status}
                              onChange={async (e) => {
                                try {
                                  const res = await fetch(`${API_ENDPOINTS.ORDERS.BASE}/${order._id}/status`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ status: e.target.value })
                                  });
                                  if (res.ok) {
                                    const updated = await res.json();
                                    dispatch({ type: 'UPDATE_ORDER', payload: updated });
                                  }
                                } catch (err) {
                                  console.error(err);
                                }
                              }}
                              className="text-[10px] bg-white/5 border border-gold-primary/10 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-gold-primary/10 font-black uppercase tracking-[0.2em] cursor-pointer hover:bg-white transition-all"
                            >
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                            <button className="p-3 bg-white border border-gold-primary/10 rounded-xl text-text-muted hover:text-gold-primary transition-all">
                              <Eye className="w-4 h-4" />
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
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <div className="space-y-10">
            <div className="bg-white p-12 rounded-[3.5rem] border border-gold-primary/10 shadow-sm relative overflow-hidden group">
              <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-white text-gold-primary rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl group-hover:rotate-12 transition-transform duration-700">
                  <Users className="w-10 h-10" />
                </div>
                <h2 className="text-4xl font-black text-text-primary luxury-serif tracking-[0.1em] uppercase mb-4">Elite Clientele</h2>
                <p className="text-sm text-text-muted font-bold tracking-widest uppercase mb-8 opacity-60">Customer Relationship Intelligence</p>
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-gold-primary/5 border border-gold-primary/20 rounded-2xl text-[11px] font-black text-gold-primary uppercase tracking-[0.3em]">
                  <span className="w-2 h-2 bg-gold-primary rounded-full animate-pulse"></span>
                  Architecture Under Refinement
                </div>
              </div>
              
              {/* Refined Background Elements */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.05),transparent)] pointer-events-none"></div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary-purple/[0.02] rounded-full blur-[120px]"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold-primary/[0.02] rounded-full blur-[120px]"></div>
            </div>
          </div>
        )}

          </div>
        </main>
      </div>

      {/* Edit Product Modal - Rendered at top level */}
      <EditProductModal />
    </div>
  );
};

export default Admin;
