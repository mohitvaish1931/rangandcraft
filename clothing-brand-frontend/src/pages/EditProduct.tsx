import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { API_ENDPOINTS } from '../utils/api';

const SUBCATEGORIES: Record<string, string[]> = {
  'Short Kurtas': ['Daily Wear', 'Festive', 'Hand-embroidered', 'Printed'],
  Suits: ['Anarkali', 'Straight Cut', 'Sharara', 'Palazzo Set', 'Gown Style']
};

const EditProduct = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  
  const [form, setForm] = useState<any>({
    name: '',
    category: '',
    subcategory: '',
    price: 0,
    originalPrice: '',
    description: '',
    dimensions: '',
    weight: '',
    materials: '',
    specifications: '',
    soldOut: false,
    images: [],
    videos: [],
    stock: 0,
    sizes: '',
    shapes: '',
    colors: '',
    careInstructions: '',
    displayOrder: 0
  });
  
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [videoUrls, setVideoUrls] = useState<string[]>(['', '']);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Find product in state
    const product = state.products.find(p => (p as any)._id === id || String(p.id) === id);
    if (product) {
      const productAny = product as any;
      setForm({
        id: product.id || productAny._id,
        name: product.name || '',
        category: product.category || '',
        subcategory: product.subcategory || '',
        price: product.price || 0,
        originalPrice: product.originalPrice || '',
        description: product.description || '',
        dimensions: product.dimensions || '',
        weight: product.weight || '',
        materials: (() => {
          let mats = productAny.materials;
          if (typeof mats === 'string' && mats.startsWith('[')) {
            try { mats = JSON.parse(mats); } catch (e) { /* ignore */ }
          }
          return Array.isArray(mats) ? mats.join('\n') : (mats || '');
        })(),
        specifications: (() => {
          let specs = productAny.specifications;
          if (typeof specs === 'string' && specs.startsWith('[')) {
            try { specs = JSON.parse(specs); } catch (e) { /* ignore */ }
          }
          return Array.isArray(specs) ? specs.join('\n') : (specs || '');
        })(),
        soldOut: productAny.soldOut || false,
        images: product.images || [],
        videos: productAny.videos || [],
        stock: productAny.stock || 0,
        sizes: (() => {
          let s = productAny.sizes;
          if (typeof s === 'string' && s.startsWith('[')) {
            try { s = JSON.parse(s); } catch (e) { /* ignore */ }
          }
          return Array.isArray(s) ? s.join(', ') : (s || '');
        })(),
        shapes: (() => {
          let s = productAny.shapes;
          if (typeof s === 'string' && s.startsWith('[')) {
            try { s = JSON.parse(s); } catch (e) { /* ignore */ }
          }
          return Array.isArray(s) ? s.join(', ') : (s || '');
        })(),
        colors: (() => {
          let c = productAny.colors;
          if (typeof c === 'string' && c.startsWith('[')) {
            try { c = JSON.parse(c); } catch (e) { /* ignore */ }
          }
          return Array.isArray(c) ? c.join(', ') : (c || '');
        })(),
        careInstructions: (() => {
          let ci = productAny.careInstructions;
          if (typeof ci === 'string' && ci.startsWith('[')) {
            try { ci = JSON.parse(ci); } catch (e) { /* ignore */ }
          }
          return Array.isArray(ci) ? ci.join('\n') : (ci || '');
        })(),
        displayOrder: productAny.displayOrder || 0
      });
      setVideoUrls((productAny.videos && productAny.videos.length > 0) ? productAny.videos : ['', '']);
    }
  }, [id, state.products]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = Array.from(e.target.files || []);
    setImageFiles(files);
    const previews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setVideoFiles(files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const fd = new FormData();
      
      // Add form fields
      Object.keys(form).forEach(k => {
        if (form[k] !== undefined && form[k] !== null && 
            k !== 'images' && k !== 'image' && k !== 'videos' && 
            k !== 'specifications' && k !== 'materials' && 
            k !== 'sizes' && k !== 'shapes' && k !== 'colors') {
          fd.append(k, form[k]);
        }
      });
      
      // Handle specifications array
      if (form.specifications) {
        let specsArray = [];
        if (Array.isArray(form.specifications)) {
          specsArray = form.specifications;
        } else if (typeof form.specifications === 'string') {
          specsArray = form.specifications.split('\n').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
        }
        fd.append('specifications', JSON.stringify(specsArray));
      }

      // Handle materials array
      if (form.materials) {
        let matsArray = [];
        if (Array.isArray(form.materials)) {
          matsArray = form.materials;
        } else if (typeof form.materials === 'string') {
          matsArray = form.materials.split('\n').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
        }
        fd.append('materials', JSON.stringify(matsArray));
      }

      // Handle sizes array
      if (form.sizes) {
        let sizesArray: string[] = [];
        if (Array.isArray(form.sizes)) {
          sizesArray = form.sizes;
        } else if (typeof form.sizes === 'string') {
          sizesArray = [...new Set(form.sizes.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0))] as string[];
        }
        fd.append('sizes', JSON.stringify(sizesArray));
      }

      // Handle shapes array
      if (form.shapes) {
        let shapesArray: string[] = [];
        if (Array.isArray(form.shapes)) {
          shapesArray = form.shapes;
        } else if (typeof form.shapes === 'string') {
          shapesArray = [...new Set(form.shapes.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0))] as string[];
        }
        fd.append('shapes', JSON.stringify(shapesArray));
      }

      // Handle colors array
      if (form.colors) {
        let colorsArray: string[] = [];
        if (Array.isArray(form.colors)) {
          colorsArray = form.colors;
        } else if (typeof form.colors === 'string') {
          colorsArray = [...new Set(form.colors.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0))] as string[];
        }
        fd.append('colors', JSON.stringify(colorsArray));
      }

      // Handle careInstructions array
      if (form.careInstructions) {
        let careArray = [];
        if (Array.isArray(form.careInstructions)) {
          careArray = form.careInstructions;
        } else if (typeof form.careInstructions === 'string') {
          careArray = form.careInstructions.split('\n').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
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
      if (imageFiles.length > 0) {
        imageFiles.forEach(file => {
          fd.append('image', file);
        });
      }
      
      const url = `${API_ENDPOINTS.PRODUCTS}/${form.id}`;
      const res = await fetch(url, { method: 'PUT', body: fd });
      
      if (!res.ok) throw new Error('Update failed');
      
      const updated = await res.json();
      dispatch({ type: 'UPDATE_PRODUCT', payload: updated });
      setSuccess('✅ Product updated successfully!');
      
      setTimeout(() => {
        navigate('/admin');
      }, 1500);
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update product');
      
      // Fallback: update locally
      const updated = {
        ...form,
        id: form.id,
        name: form.name,
        category: form.category,
        price: Number(form.price) || 0,
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        description: form.description || ''
      };
      dispatch({ type: 'UPDATE_PRODUCT', payload: updated });
      setSuccess('✅ Product updated locally!');
      
      setTimeout(() => {
        navigate('/admin');
      }, 1500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center space-x-2 text-gold-primary hover:text-primary-purple transition-all mb-6 font-bold tracking-widest text-xs uppercase"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>BACK TO ADMIN</span>
          </button>
          <h1 className="text-4xl font-black text-text-primary luxury-serif tracking-widest uppercase">
            Edit Product
          </h1>
          <div className="w-16 h-1 bg-primary-purple mt-4 mb-2"></div>
          <p className="text-text-secondary font-medium italic">{form.name || 'Loading...'}</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-teal-luxury/20 border border-teal-luxury/50 rounded-lg text-teal-luxury">
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white border border-gold-primary/20 p-8 md:p-12 rounded-2xl shadow-sm space-y-8">
          
          {/* Basic Info */}
          <div>
            <h3 className="text-sm font-black text-text-primary tracking-widest uppercase mb-6 flex items-center">
              <span className="w-8 h-px bg-gold-primary/30 mr-3"></span>
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Product Name</label>
                <input
                  type="text"
                  value={form.name || ''}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary placeholder-text-muted/40 focus:ring-2 focus:ring-primary-purple/20 outline-none transition-all"
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Category</label>
                <select
                  value={form.category || ''}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary focus:ring-2 focus:ring-primary-purple/20 outline-none transition-all"
                >
                  <option value="">Select category</option>
                  <option value="Short Kurtas">Short Kurtas</option>
                  <option value="Suits">Suits</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Display Order (Numbering)</label>
                <input
                  type="number"
                  value={form.displayOrder || 0}
                  onChange={e => setForm({ ...form, displayOrder: parseInt(e.target.value, 10) || 0 })}
                  className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary placeholder-text-muted/40 focus:ring-2 focus:ring-primary-purple/20 outline-none transition-all"
                  placeholder="0"
                />
              </div>
              {form.category && SUBCATEGORIES[form.category]?.length > 0 && (
                <div>
                  <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Subcategory</label>
                  <select 
                    value={form.subcategory || ''} 
                    onChange={e => setForm({ ...form, subcategory: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary focus:ring-2 focus:ring-primary-purple/20 outline-none transition-all"
                  >
                    <option value="">Select subcategory</option>
                    {SUBCATEGORIES[form.category].map(sub => (
                      <option key={sub} value={sub.toLowerCase().replace(/\s+/g, '-')}>{sub}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div>
            <h3 className="text-sm font-black text-text-primary tracking-widest uppercase mb-6 flex items-center">
              <span className="w-8 h-px bg-gold-primary/30 mr-3"></span>
              Pricing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Current Price (₹)</label>
                <input
                  type="number"
                  value={form.price || 0}
                  onChange={e => setForm({ ...form, price: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary placeholder-text-muted/40 focus:ring-2 focus:ring-primary-purple/20 outline-none transition-all"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Original Price (₹)</label>
                <input
                  type="number"
                  value={form.originalPrice || ''}
                  onChange={e => setForm({ ...form, originalPrice: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary placeholder-text-muted/40 focus:ring-2 focus:ring-primary-purple/20 outline-none transition-all"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Available Stock</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={form.stock === 0 ? '0' : (form.stock || '')}
                  onChange={e => {
                    const val = e.target.value;
                    if (val === '' || /^\d+$/.test(val)) {
                      setForm({ ...form, stock: val === '' ? '' : parseInt(val, 10) });
                    }
                  }}
                  className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary focus:ring-2 focus:ring-primary-purple/20 outline-none transition-all"
                  placeholder="Enter stock quantity"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Sizes (Comma separated)</label>
                <input
                  type="text"
                  value={form.sizes || ''}
                  onChange={e => setForm({ ...form, sizes: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary placeholder-text-muted/40 focus:ring-2 focus:ring-primary-purple/20 outline-none transition-all"
                  placeholder="5, 6, 7"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Shapes (Comma separated)</label>
                <input
                  type="text"
                  value={form.shapes || ''}
                  onChange={e => setForm({ ...form, shapes: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary placeholder-text-muted/40 focus:ring-2 focus:ring-primary-purple/20 outline-none transition-all"
                  placeholder="Heart, Round, Oval"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Colors (Comma separated)</label>
                <input
                  type="text"
                  value={form.colors || ''}
                  onChange={e => setForm({ ...form, colors: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary placeholder-text-muted/40 focus:ring-2 focus:ring-primary-purple/20 outline-none transition-all"
                  placeholder="Gold, Rose Gold, Silver"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Description</label>
            <textarea
              value={form.description || ''}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={5}
              className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary placeholder-text-muted/40 focus:ring-2 focus:ring-primary-purple/20 outline-none transition-all"
              placeholder="Enter product description"
            />
          </div>

          {/* New Fields: Dimensions & Weight */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Dimensions</label>
              <input
                type="text"
                value={form.dimensions || ''}
                onChange={e => setForm({ ...form, dimensions: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary placeholder-text-muted/40 focus:ring-2 focus:ring-primary-purple/20 outline-none transition-all"
                placeholder="Length x Width x Height"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Weight</label>
              <input
                type="text"
                value={form.weight || ''}
                onChange={e => setForm({ ...form, weight: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary placeholder-text-muted/40 focus:ring-2 focus:ring-primary-purple/20 outline-none transition-all"
                placeholder="e.g. 50g"
              />
            </div>
          </div>

          {/* Specifications & Materials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Materials (One per line)</label>
              <textarea
                value={form.materials || ''}
                onChange={e => setForm({ ...form, materials: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary placeholder-text-muted/40 focus:ring-2 focus:ring-primary-purple/20 outline-none transition-all"
                placeholder="Premium Silk&#10;18k Gold Finish"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Specifications (One per line)</label>
              <textarea
                value={form.specifications || ''}
                onChange={e => setForm({ ...form, specifications: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary placeholder-text-muted/40 focus:ring-2 focus:ring-primary-purple/20 outline-none transition-all"
                placeholder="18k Gold Finish&#10;Waterproof&#10;Hypoallergenic"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Care Instructions (One per line)</label>
              <textarea
                value={form.careInstructions || ''}
                onChange={e => setForm({ ...form, careInstructions: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary placeholder-text-muted/40 focus:ring-2 focus:ring-primary-purple/20 outline-none transition-all"
                placeholder="Waterproof and Sweatproof&#10;Chlorine and Sea water safe"
              />
            </div>
          </div>

          {/* Images */}
          <div>
            <h3 className="text-sm font-black text-text-primary luxury-serif tracking-widest uppercase mb-6 flex items-center">
              <span className="w-8 h-px bg-gold-primary/30 mr-3"></span>
              Images
            </h3>
            {form.images && form.images.length > 0 && (
              <div className="mb-6 bg-white/5 p-4 rounded-xl border border-gold-primary/10">
                <p className="text-[10px] font-bold text-text-muted mb-3 uppercase tracking-widest">Current Images</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {form.images.map((img: string, idx: number) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gold-primary/20 bg-white shadow-sm">
                      <img src={img} alt={`Current ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Upload New Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary placeholder-text-muted/40 focus:ring-2 focus:ring-primary-purple/20 outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-gold-primary/20 file:text-gold-primary hover:file:bg-gold-primary/30"
            />
          
            {previewImages.length > 0 && (
              <div className="mt-6">
                <p className="text-[10px] font-bold text-text-muted mb-3 uppercase tracking-widest">New Images Preview ({previewImages.length})</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {previewImages.map((preview, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gold-primary/20 bg-white shadow-sm">
                      <img src={preview} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Videos */}
          <div>
            <h3 className="text-sm font-black text-text-primary tracking-widest uppercase mb-6 flex items-center">
              <span className="w-8 h-px bg-gold-primary/30 mr-3"></span>
              Videos
            </h3>
            {form.videos && form.videos.length > 0 && (
              <div className="mb-6 bg-white/5 p-4 rounded-xl border border-gold-primary/10">
                <p className="text-[10px] font-bold text-text-muted mb-3 uppercase tracking-widest">Current Videos</p>
                <div className="space-y-2">
                  {form.videos.map((vid: string, idx: number) => (
                    <div key={idx} className="flex items-center space-x-2 text-gold-primary">
                      <span className="text-xs">✦</span>
                      <p className="text-[10px] font-medium truncate">{vid}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Upload Video Files</label>
                <input
                  type="file"
                  multiple
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary placeholder-text-muted/40 focus:ring-2 focus:ring-primary-purple/20 outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-gold-primary/20 file:text-gold-primary hover:file:bg-gold-primary/30"
                />
              </div>
              <div className="space-y-4">
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Or Add Video URLs</label>
                <input
                  type="text"
                  placeholder="Video 1 URL"
                  value={videoUrls[0] || ''}
                  onChange={(e) => {
                    const newUrls = [...videoUrls];
                    newUrls[0] = e.target.value;
                    setVideoUrls(newUrls);
                  }}
                  className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary placeholder-text-muted/40 focus:ring-2 focus:ring-primary-purple/20 outline-none transition-all"
                />
                <input
                  type="text"
                  placeholder="Video 2 URL (optional)"
                  value={videoUrls[1] || ''}
                  onChange={(e) => {
                    const newUrls = [...videoUrls];
                    newUrls[1] = e.target.value;
                    setVideoUrls(newUrls);
                  }}
                  className="w-full px-4 py-3 bg-white/10 border border-gold-primary/10 rounded-xl text-text-primary placeholder-text-muted/40 focus:ring-2 focus:ring-primary-purple/20 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between py-6 border-t border-gold-primary/10">
            <label className="flex items-center space-x-3 text-text-primary cursor-pointer group">
              <input
                type="checkbox"
                checked={!!form.soldOut}
                onChange={e => setForm({ ...form, soldOut: e.target.checked })}
                className="w-5 h-5 rounded border-gold-primary/30 text-primary-purple focus:ring-primary-purple/20 transition-all cursor-pointer"
              />
              <span className="text-[10px] font-black tracking-widest uppercase group-hover:text-primary-purple transition-colors">Mark as Sold Out</span>
            </label>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="px-8 py-3 bg-white text-text-primary rounded-xl border border-gold-primary/20 hover:bg-white/5 transition-all text-[10px] font-black uppercase tracking-widest"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-3 btn-premium-gold text-luxury-dark rounded-xl hover:shadow-glow-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed text-[10px] font-black uppercase tracking-widest"
              >
                {isLoading ? '⏳ Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
