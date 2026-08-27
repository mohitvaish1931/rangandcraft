import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import Categories from '../components/Categories';
import CircleCategories from '../components/CircleCategories';
import { Helmet } from 'react-helmet-async';
import { API_ENDPOINTS } from '../utils/api';
import { getImageUrl } from '../utils/mediaHelper';
import './HomePage.css';

const HomePage = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let data;
        // Check if prefetch promise exists on window
        // @ts-ignore
        if (window.__INITIAL_PRODUCTS_PROMISE__) {
          // @ts-ignore
          data = await window.__INITIAL_PRODUCTS_PROMISE__;
          // @ts-ignore
          window.__INITIAL_PRODUCTS_PROMISE__ = null; // Clear it so it's not reused on re-renders
        } 
        
        if (!data) {
          const res = await fetch(API_ENDPOINTS.PRODUCTS);
          data = await res.json();
        }

        if (Array.isArray(data)) {
          setProducts(data);
          setError(null);
        } else {
          setProducts([]);
        }
      } catch (e) {
        console.error('Failed to grab products', e);
        setProducts([]);
        setError('Our server is currently starting up. Please refresh the page in a few seconds.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const homepageProducts = products.filter(p => p.showOnHomepage !== false);

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#FDFBFD', padding: '20px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-serif, serif)', color: '#C53030', marginBottom: '15px' }}>Store is waking up</h2>
        <p style={{ color: '#666', marginBottom: '30px', maxWidth: '400px', lineHeight: '1.6' }}>{error}</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary">Refresh Page</button>
      </div>
    );
  }

  // Sort by createdAt descending to show latest arrivals
  const newArrivals = [...homepageProducts]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 8);

  const shortKurtas = homepageProducts
    .filter(p => p.category === 'Short Kurtas')
    .slice(0, 8);

  const longKurtas = homepageProducts
    .filter(p => p.category === 'Long Kurtas')
    .slice(0, 8);

  const halfSleeves = homepageProducts
    .filter(p => p.category === 'Half Sleeves Shirts')
    .slice(0, 8);


  const fullSleeves = homepageProducts
    .filter(p => p.category === 'Full Sleeves Shirts')
    .slice(0, 8);

  const TrustBadges = () => (
    <div className="trust-badges-section" style={{ padding: '60px 0', borderTop: '1px solid #eaeaea', borderBottom: '1px solid #eaeaea', margin: '40px 0' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', color: '#1a3c34' }}>
            {"★★★★★".split('').map((star, i) => <span key={i} style={{ fontSize: '24px' }}>{star}</span>)}
          </div>
          <span style={{ color: '#666', fontSize: '14px' }}>836 reviews</span>
        </div>
        
        <div style={{ display: 'flex', gap: '30px' }}>
          {['Verified Reviews', 'Highest Ranked', 'Top 5% Store', 'Top 5% Trending'].map((text, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '80px', textAlign: 'center' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '2px solid #1a3c34', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#1a3c34" strokeWidth="2"><path d="M12 2l3 6 6 1-4 4 1 6-6-3-6 3 1-6-4-4 6-1z"></path></svg>
              </div>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#666', fontWeight: 600 }}>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
const CarouselSection = ({ tag, titleLight, titleItalic, subtext, items, viewAllLink = '/shop' }: any) => (
    <section className="carousel-section container section">
      <div className="carousel-header flex justify-between items-center reveal-on-scroll" style={{marginBottom: '40px'}}>
        <div>
          <span className="small-gold-tag">{tag}</span>
          <h2 className="title" style={{fontSize: '2.5rem'}}><span style={{fontWeight: 700}}>{titleLight}</span> <i className="font-serif" style={{color: 'var(--primary-purple)'}}>{titleItalic}</i></h2>
          {subtext && <p className="subtext mt-2 text-gray-500 font-serif">{subtext}</p>}
        </div>
        <Link to={viewAllLink} className="view-all-link">VIEW ALL</Link>
      </div>
      
      <div className="products-carousel-grid">
        {items.map((product: any, idx: number) => {
          const discount = product.originalPrice && product.price && product.originalPrice > product.price 
            ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
            : 0;

          return (
            <div key={product._id} className={`carousel-product-card reveal-on-scroll delay-${(idx % 4) * 100}`}>
              <Link to={`/product/${product._id}`}>
                <div className="carousel-img-wrapper">
                  <img src={getImageUrl(product.image, 600)} alt={product.name} className="primary-img" loading="lazy" />
                  {product.images && product.images.length > 1 && (
                    <img src={getImageUrl(product.images[1], 600)} alt={`${product.name} alternate`} className="secondary-img" loading="lazy" />
                  )}
                  {discount > 0 && (
                    <div className="discount-badge">{discount}% OFF</div>
                  )}
                </div>
              </Link>
            <div className="carousel-product-details">
              <Link to={`/product/${product._id}`}><h3 className="cp-name">{product.name}</h3></Link>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {discount > 0 && (
                  <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.9rem', fontWeight: 500 }}>
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
                <p className="cp-price" style={{ marginTop: 0 }}>₹{product.price.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
        );
      })}
      </div>
    </section>
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#FDFBFD' }}>
        <div style={{ border: '3px solid #f3f3f3', borderTop: '3px solid var(--primary-purple, #2D0A4E)', borderRadius: '50%', width: '50px', height: '50px', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
        <p style={{ marginTop: '20px', color: '#666', fontFamily: 'var(--font-serif, serif)', letterSpacing: '1px' }}>Loading Collection...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="homepage-wrapper">
      {/* @ts-ignore */}
      <Helmet>
        <title>Rang and Craft | Premium Men's Ethnic & Casual Wear</title>
        <meta name="description" content="Shop the latest trends in men's ethnic and casual wear at Rang and Craft. Explore our wide collection of Kurtas, Half Sleeves Shirts, Co-ord sets, and more with premium quality." />
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Rang and Craft",
              "url": "https://rangandcraft.store",
              "logo": "https://rangandcraft.store/favicon.svg",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+91-9351325459",
                "contactType": "customer service"
              },
              "sameAs": [
                "https://www.facebook.com/rangandcraft",
                "https://www.instagram.com/rangandcraft"
              ]
            }
          `}
        </script>
      </Helmet>
      <CircleCategories products={homepageProducts} />
      
      <Hero products={homepageProducts} />
      
      <div style={{marginTop: '45px'}}></div>
      
      <div className="container text-center" style={{marginBottom: '40px'}}>
        <span className="small-gold-tag text-center" style={{display: 'inline-block'}}>CURATED FOR YOU</span>
      </div>
      <Categories products={homepageProducts} />

      <section className="container section" style={{ display: 'flex', gap: '20px', padding: '40px 20px' }}>
        <div style={{ flex: 1, position: 'relative', height: '350px', overflow: 'hidden' }}>
          <img src="/images/indowestern-category.png" alt="Flash Sale" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <h2 style={{ color: '#fff', fontSize: '3rem', fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>FLASH SALE</h2>
          </div>
        </div>
        <div style={{ flex: 1, position: 'relative', height: '350px', overflow: 'hidden' }}>
          <img src="/images/saree-category.png" alt="Newly Launched" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <h2 style={{ color: '#fff', fontSize: '3rem', fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0,0,0,0.5)', textAlign: 'center' }}>NEWLY<br/>LAUNCHED</h2>
          </div>
        </div>
      </section>

      <CarouselSection 
        tag="JUST IN" 
        titleLight="NEW" 
        titleItalic="ARRIVALS" 
        subtext="Handpicked for this season"
        items={newArrivals}
        viewAllLink="/shop"
      />

      <section className="timeless-elegance-section reveal-on-scroll" style={{ backgroundColor: '#0f172a', padding: '100px 20px', textAlign: 'center', color: '#fff', position: 'relative', overflow: 'hidden', minHeight: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', top: '20px', left: '20px', color: '#ccc', fontSize: '1.2rem', letterSpacing: '1px' }}>
          TRUSTED BY 1L+ CUSTOMERS
        </div>
        <h2 className="title" style={{ fontSize: '4rem', fontWeight: 600, color: '#fef3c7', marginBottom: '20px' }}>Timeless elegance</h2>
        <p style={{ fontSize: '1.5rem', color: '#d1d5db', marginBottom: '40px' }}>Traditional clocks are honestly timeless, no cap!</p>
        <button className="btn" style={{ backgroundColor: '#1a3c34', color: '#fff', padding: '15px 40px', fontSize: '1.2rem', borderRadius: '5px' }}>BUY NOW</button>
      </section>

      <CarouselSection 
        tag="FEATURED COLLECTION" 
        titleLight="SHORT" 
        titleItalic="KURTAS" 
        subtext="LONG KURTAS" 
        items={shortKurtas} 
        viewAllLink="/shop?category=Short%20Kurtas"
      />

      <TrustBadges />

      <CarouselSection 
        tag="TOP CATEGORY" 
        titleLight="LONG" 
        titleItalic="KURTAS" 
        items={longKurtas} 
        viewAllLink="/shop?category=Long%20Kurtas"
      />


      <CarouselSection 
        tag="DAILY CHIC" 
        titleLight="HALF SLEEVES" 
        titleItalic="SHIRTS" 
        items={halfSleeves} 
        viewAllLink="/shop?category=Half Sleeves Shirts"
      />

      <CarouselSection 
        tag="ELEGANT FLOW" 
        titleLight="FULL SLEEVES" 
        titleItalic="SHIRTS" 
        items={fullSleeves} 
        viewAllLink="/shop?category=Full%20Sleeves%20Shirts"
      />



      <section className="store-locator-banner reveal-on-scroll" style={{backgroundImage: 'url(/images/store-locator.png)'}}>
        <div className="store-locator-overlay" style={{backgroundColor: 'rgba(26, 60, 52, 0.7)'}}>
          <div className="store-locator-content text-center">
            <h2 className="title font-serif" style={{color: '#fff', fontSize: '3.5rem', marginBottom: '20px'}}>Find Your Perfect Look, <i style={{color: 'var(--gold-primary)'}}>In-Store</i></h2>
            <p style={{color: '#ddd', fontSize: '1.2rem', marginBottom: '30px'}}>Discover elegance firsthand at our exclusive boutique showrooms in Jaipur.</p>
            <button className="btn btn-primary" style={{padding: '15px 40px', backgroundColor: '#fff', color: 'var(--primary-purple)'}}>FIND YOUR NEAREST STORE</button>
          </div>
        </div>
      </section>

      <section className="worn-with-love container section reveal-on-scroll">
        <h2 className="title text-center font-serif" style={{fontSize: '3rem', margin: '40px 0'}}>Worn with <i style={{color: 'var(--primary-purple)'}}>Love</i></h2>
        <div className="social-proof-grid">
           {homepageProducts.slice(0, 4).map((product, i) => (
             <div className={`social-card reveal-on-scroll delay-${i * 100}`} key={i}>
                <img src={getImageUrl(product.image, 600)} alt="Social Proof" loading="lazy" />
                <div className="social-hover">Instagram ♥ 1.2k</div>
             </div>
           ))}
        </div>
      </section>

      <section className="featured-in text-center section" style={{backgroundColor: '#f8f8f8'}}>
        <span className="small-gold-tag">FEATURED IN</span>
        <div className="featured-logos flex justify-center items-center" style={{gap: '60px', marginTop: '30px', opacity: 0.6, filter: 'grayscale(100%)'}}>
          <h3 className="font-serif text-xl">VOGUE</h3>
          <h3 className="font-serif text-xl">ELLE</h3>
          <h3 className="font-serif text-xl">COSMOPOLITAN</h3>
          <h3 className="font-serif text-xl">FEMINA</h3>
        </div>
      </section>

      <section className="testimonials text-center section container reveal-on-scroll" style={{padding: '80px 0'}}>
        <h2 className="title font-serif" style={{fontSize: '2.5rem', marginBottom: '40px'}}>What Our <i style={{color: 'var(--primary-purple)'}}>Patrons Say</i></h2>
        <div style={{maxWidth: '800px', margin: '0 auto'}}>
           <p className="font-serif italic" style={{fontSize: '1.5rem', lineHeight: '1.8', color: '#444'}}>
             "The craftsmanship is unparalleled. I wore a RANG AND CRAFT kurta set for my wedding and it made me feel like royalty. Every thread is intricately woven with magic."
           </p>
           <p style={{marginTop: '20px', letterSpacing: '2px', fontWeight: 'bold'}}>- RAHUL SHARMA</p>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
