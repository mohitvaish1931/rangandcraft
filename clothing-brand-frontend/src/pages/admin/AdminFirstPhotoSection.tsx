import { useState } from 'react';
import { ImageIcon, Star, ImagePlus } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { API_ENDPOINTS } from '../../utils/api';
import { getImageUrl } from '../../utils/mediaHelper';

const AdminFirstPhotoSection = () => {
  const { state, dispatch } = useAppContext();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // We rely on state.products from context
  const products = state.products || [];

  const handleMakeFirst = async (productId: string, imageIndex: number, currentImages: string[]) => {
    if (imageIndex === 0) return; // Already first

    setLoadingId(productId);
    try {
      // Reorder images
      const newImages = [...currentImages];
      const selectedImage = newImages.splice(imageIndex, 1)[0];
      newImages.unshift(selectedImage);

      const fd = new FormData();
      fd.append('existing_images', JSON.stringify(newImages));

      const res = await fetch(`${API_ENDPOINTS.PRODUCTS}/${productId}`, {
        method: 'PUT',
        body: fd
      });

      if (!res.ok) throw new Error('Update failed');
      const updatedProduct = await res.json();
      
      dispatch({ type: 'UPDATE_PRODUCT', payload: updatedProduct });
      
    } catch (err) {
      console.error(err);
      alert('❌ Failed to update the first photo. Please try again.');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">First Photo Selector</h1>
            <p className="text-xs text-gray-500 font-medium">Choose the primary photo for your products</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm space-y-8">
        {products.length === 0 ? (
          <div className="text-center text-gray-400 py-10">No products found.</div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {products.map((product) => {
              const images = product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []);
              if (images.length <= 1) return null; // Skip products with 1 or 0 images

              return (
                <div key={product._id || product.id} className="border border-gray-100 rounded-2xl p-6 bg-gray-50/30">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-800">{product.name}</h2>
                    <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-full uppercase tracking-wider">{product.category}</span>
                  </div>
                  
                  <div className="flex overflow-x-auto gap-4 pb-4 custom-scrollbar">
                    {images.map((img: string, idx: number) => {
                      const isFirst = idx === 0;
                      const isLoading = loadingId === (product._id || product.id);

                      return (
                        <div key={idx} className={`relative flex-shrink-0 w-48 h-64 rounded-xl overflow-hidden border-2 transition-all ${isFirst ? 'border-purple-500 shadow-md scale-[1.02]' : 'border-transparent hover:border-purple-200'}`}>
                          <img src={getImageUrl(img)} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                          
                          {isFirst && (
                            <div className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
                              <Star className="w-3 h-3 fill-current" /> PRIMARY
                            </div>
                          )}

                          {!isFirst && (
                            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                              <button 
                                onClick={() => handleMakeFirst(product._id || String(product.id), idx, images)}
                                disabled={isLoading}
                                className="bg-white text-purple-700 font-bold text-xs px-4 py-2 rounded-lg shadow-lg hover:scale-105 transition-transform flex items-center gap-2 disabled:opacity-50"
                              >
                                <ImagePlus className="w-4 h-4" />
                                {isLoading ? 'Saving...' : 'Make First'}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFirstPhotoSection;
