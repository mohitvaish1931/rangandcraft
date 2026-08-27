import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { API_ENDPOINTS } from '../utils/api';
import { getImageUrl } from '../utils/mediaHelper';
import './ProductStyles.css';

const ProductListPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const keyword = queryParams.get('keyword') || '';
  const category = queryParams.get('category') || '';

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let url = API_ENDPOINTS.PRODUCTS;
        if (category) {
          url += `?category=${encodeURIComponent(category)}`;
        } else if (keyword) {
          url += `?keyword=${encodeURIComponent(keyword)}`;
        }
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setProducts(data);
        setLoading(false);
      } catch (err: any) {
        console.error('Fetch error:', err);
        setError(err.message || 'Failed to load products. Please try again.');
        setLoading(false);
      }
    };

    fetchProducts();
  }, [keyword, category]);

  return (
    <div className="shop-page" style={{ backgroundColor: '#f9f9f9', minHeight: '100vh', paddingBottom: '100px' }}>
      {/* Category Header */}
      <section style={{ backgroundColor: '#295454', color: '#fff', padding: '100px 20px', textAlign: 'center', marginBottom: '60px' }}>
         <div className="container">
            <span style={{ color: '#c48f56', letterSpacing: '4px', fontWeight: '800', fontSize: '0.7rem', textTransform: 'uppercase', display: 'block', marginBottom: '20px' }}>CURATED SELECTION</span>
            <h1 className="font-serif" style={{ fontSize: '3.5rem', marginBottom: '20px' }}>
               {category ? category : (keyword ? `Search: "${keyword}"` : 'Shop The Collection')}
            </h1>
            <p style={{ fontSize: '1.1rem', opacity: 0.8, maxWidth: '600px', margin: '0 auto' }}>
               Experience the finest Jaipur craftsmanship, meticulously curated for the modern connoisseur.
            </p>
         </div>
      </section>

      <div className="container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
             <div className="loader-spinner" style={{ border: '3px solid #f3f3f3', borderTop: '3px solid #295454', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
             <p style={{ marginTop: '20px', color: '#666', fontFamily: 'serif' }}>Curating your collection...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '100px 20px', backgroundColor: '#FFF5F5', borderRadius: '24px', border: '1px solid #FED7D7' }}>
            <p style={{ color: '#C53030', fontWeight: '600' }}>{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
             <h2 className="font-serif" style={{ fontSize: '2rem', color: '#295454', marginBottom: '20px' }}>No treasures found.</h2>
             <p style={{ color: '#666', marginBottom: '30px' }}>Try a different search term or explore our full collection.</p>
             <Link to="/shop" style={{ padding: '15px 30px', backgroundColor: '#295454', color: '#fff', textDecoration: 'none', borderRadius: '12px', fontWeight: '800', letterSpacing: '1px' }}>VIEW ALL PRODUCTS</Link>
          </div>
        ) : (
          <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '40px' }}>
            {products.map((product, idx) => {
              const discount = product.originalPrice && product.price && product.originalPrice > product.price 
                ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
                : 0;

              return (
                <div key={product._id} className={`luxury-product-card reveal-on-scroll delay-${(idx % 4) * 100}`}>
                  <Link to={`/product/${product._id}`} style={{ textDecoration: 'none' }}>
                    <div className="luxury-img-wrapper">
                      <img src={getImageUrl(product.image, 600)} alt={product.name} className="primary-img" loading="lazy" />
                      {product.images && product.images.length > 1 && (
                        <img src={getImageUrl(product.images[1], 600)} alt={`${product.name} alternate`} className="secondary-img" loading="lazy" />
                      )}
                      {product.isNew && (
                        <span className="new-arrival-tag">NEW ARRIVAL</span>
                      )}
                      {discount > 0 && (
                        <div className="discount-badge">{discount}% OFF</div>
                      )}
                    </div>
                    <div className="luxury-card-details">
                      <h3 className="font-serif luxury-name">{product.name}</h3>
                      <div className="luxury-price-row">
                         <div style={{ display: 'flex', flexDirection: 'column' }}>
                           {discount > 0 && (
                             <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.9rem' }}>
                               ₹{product.originalPrice.toLocaleString('en-IN')}
                             </span>
                           )}
                           <span className="luxury-price">₹{product.price.toLocaleString('en-IN')}</span>
                         </div>
                         <span className="luxury-atelier">JAIPUR ATELIER</span>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .hover-zoom:hover {
          transform: scale(1.08);
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .shop-page h1 {
            font-size: 2.2rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductListPage;
