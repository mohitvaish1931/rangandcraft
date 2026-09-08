import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import Categories from '../components/Categories';
import { Helmet } from 'react-helmet-async';
import { API_ENDPOINTS } from '../utils/api';
import { getImageUrl } from '../utils/mediaHelper';
import './HomePage.css';

const ProductCard = ({ product }: { product: any }) => {
  const discount = product.originalPrice > product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  return (
    <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{ position: 'relative' }}>
        {discount > 0 && (
          <span style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: '#295454', color: '#fff', padding: '4px 8px', fontSize: '12px', fontWeight: 600, zIndex: 2 }}>
            {discount}% OFF
          </span>
        )}
        <img 
          src={getImageUrl(product.image, 400)} 
          alt={product.name} 
          style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover', marginBottom: '15px' }} 
        />
        <h3 style={{ fontSize: '14px', fontWeight: 500, margin: '0 0 5px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'Inter, sans-serif' }}>
          {product.name}
        </h3>
        <p style={{ fontSize: '15px', fontWeight: 600, margin: 0, color: '#111' }}>
          ₹{product.price} <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '13px', fontWeight: 400, marginLeft: '5px' }}>₹{product.originalPrice}</span>
        </p>
      </div>
    </Link>
  );
};

const HomePage = () => {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.PRODUCTS);
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : data.products || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
  }, []);

  const list = Array.isArray(products) ? products : [];
  const featured = list.slice(0, 5);
  const bestSellers = list.slice(5, 10).length > 0 ? list.slice(5, 10) : list.slice(0, 5);

  return (
    <div className="homepage">
      <Helmet>
        <title>Rang and Craft - Men's Kurtas & Shirts Online</title>
      </Helmet>
      
      <Hero />
      <Categories />

      <section style={{ padding: '60px 20px', maxWidth: '1400px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '32px', textAlign: 'center', marginBottom: '40px', fontWeight: 400, fontFamily: 'serif' }}>Featured collection</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '30px' }}>
          {featured.map(p => <ProductCard key={p._id} product={p} />)}
        </div>
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Link to="/shop" style={{ display: 'inline-block', border: '1px solid #111', padding: '12px 40px', textDecoration: 'none', color: '#111', fontSize: '14px', letterSpacing: '1px' }}>View all</Link>
        </div>
      </section>

      <section style={{ padding: '60px 20px', maxWidth: '1400px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '32px', textAlign: 'center', marginBottom: '40px', fontWeight: 400, fontFamily: 'serif' }}>Best Sellers</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '30px' }}>
          {bestSellers.map(p => <ProductCard key={p._id} product={p} />)}
        </div>
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Link to="/shop?tag=Best Sellers" style={{ display: 'inline-block', border: '1px solid #111', padding: '12px 40px', textDecoration: 'none', color: '#111', fontSize: '14px', letterSpacing: '1px' }}>View all</Link>
        </div>
      </section>

      {/* NEW Choose Your Fit Section */}
      <section className="choose-your-fit-wrapper jaipur-bg-pattern" style={{ width: '100%', backgroundColor: '#fdfbf7', padding: '80px 0', margin: '40px 0' }}>
<div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px', position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px', position: 'relative' }}>
          <div style={{ color: '#c48f56', fontSize: '24px', marginBottom: '5px' }}>❁</div>
          <h2 style={{ fontSize: '38px', fontWeight: 400, fontFamily: 'serif', color: '#111', margin: '0 0 10px 0' }}>Choose Your Fit</h2>
          <p style={{ color: '#c48f56', letterSpacing: '4px', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>Tradition For Every Occasion</p>
          <div className="explore-all-link" style={{ position: 'absolute', right: 0, top: '20px' }}>
            <Link to="/shop" style={{ color: '#c48f56', fontSize: '12px', letterSpacing: '2px', textDecoration: 'none', textTransform: 'uppercase', fontWeight: 600 }}>Explore All →</Link>
          </div>
        </div>

        <div className="fit-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '30px' }}>
          {/* Left floating text */}
          <div className="floating-text hidden-mobile" style={{ width: '150px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ color: '#c48f56', fontSize: '20px' }}>✧</div>
            <div>
              <h4 style={{ color: '#c48f56', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '10px' }}>Dress<br/>The Legacy</h4>
              <p style={{ fontSize: '12px', color: '#666', lineHeight: 1.6 }}>From timeless traditions to everyday elegance, find a style that feels truly you.</p>
            </div>
          </div>

          {/* Center 2 Images */}
          <div className="fit-images" style={{ display: 'flex', gap: '20px', flex: 1, maxWidth: '900px' }}>
            {/* Formal Collection */}
            <div className="fit-card" style={{ flex: 1, height: '450px', position: 'relative', overflow: 'hidden' }}>
              <img src="/images/suits-men.jpg" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div className="fit-card-content" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)', padding: '40px', display: 'flex', flexDirection: 'column' }}>
                 <h3 className="fit-card-title" style={{ color: '#e8c9a3', fontSize: '32px', fontFamily: 'serif', fontWeight: 400, lineHeight: 1.2, marginBottom: '15px' }}>Formal<br/>Collection</h3>
                 <div style={{ width: '30px', height: '1px', backgroundColor: '#e8c9a3', marginBottom: '20px' }}></div>
                 <p style={{ color: '#fff', fontSize: '13px', lineHeight: 1.5, maxWidth: '200px', marginBottom: '30px', opacity: 0.9 }}>For weddings, festivals and life's special moments.</p>
                 <Link to="/shop?category=Suits" style={{ backgroundColor: '#e8c9a3', color: '#111', padding: '10px 20px', display: 'inline-block', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textDecoration: 'none', alignSelf: 'flex-start' }}>SHOP NOW →</Link>
                 <div style={{ marginTop: 'auto', color: '#ccc', fontSize: '11px', letterSpacing: '1px' }}>
                   Kurtas | Sherwanis | Indo-Western | Accessories
                 </div>
              </div>
            </div>

            {/* Casual Collection */}
            <div className="fit-card" style={{ flex: 1, height: '450px', position: 'relative', overflow: 'hidden' }}>
              <img src="/images/kurta-men.jpg" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div className="fit-card-content" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)', padding: '40px', display: 'flex', flexDirection: 'column' }}>
                 <h3 className="fit-card-title" style={{ color: '#e8c9a3', fontSize: '32px', fontFamily: 'serif', fontWeight: 400, lineHeight: 1.2, marginBottom: '15px' }}>Casual<br/>Collection</h3>
                 <div style={{ width: '30px', height: '1px', backgroundColor: '#e8c9a3', marginBottom: '20px' }}></div>
                 <p style={{ color: '#fff', fontSize: '13px', lineHeight: 1.5, maxWidth: '200px', marginBottom: '30px', opacity: 0.9 }}>Everyday comfort with a touch of tradition.</p>
                 <Link to="/shop?category=Short Kurtas" style={{ backgroundColor: '#e8c9a3', color: '#111', padding: '10px 20px', display: 'inline-block', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textDecoration: 'none', alignSelf: 'flex-start' }}>SHOP NOW →</Link>
                 <div style={{ marginTop: 'auto', color: '#ccc', fontSize: '11px', letterSpacing: '1px' }}>
                   Kurtas | Shirts | Co-ords | Everyday Essentials
                 </div>
              </div>
            </div>
          </div>

          {/* Right floating text */}
          <div className="floating-text hidden-mobile" style={{ width: '150px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ color: '#c48f56', fontSize: '20px' }}>✧</div>
            <div>
              <h4 style={{ color: '#c48f56', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700, marginBottom: '10px' }}>Comfort<br/>Meets Culture</h4>
              <p style={{ fontSize: '12px', color: '#666', lineHeight: 1.6 }}>Simple. Refined. Always in style.</p>
            </div>
          </div>
        </div>
      </div>
      </section>

      {/* Trust Badges Bar */}
      <div style={{ borderTop: '1px solid #eaeaea', borderBottom: '1px solid #eaeaea', padding: '30px 20px', maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
         {[
           { icon: '🚐', title: 'Free Shipping', desc: 'On all prepaid orders' },
           { icon: '🛡️', title: 'Secure Payments', desc: '100% safe & trusted' },
           { icon: '📦', title: 'Easy Returns', desc: 'Hassle-free within 7 days' },
           { icon: '🎧', title: 'Dedicated Support', desc: "We're here to help" },
         ].map((b, i) => (
           <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
             <div style={{ width: '45px', height: '45px', borderRadius: '50%', border: '1px solid #d1bfae', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>{b.icon}</div>
             <div>
               <div style={{ fontSize: '15px', fontWeight: 600, color: '#333' }}>{b.title}</div>
               <div style={{ fontSize: '12px', color: '#888' }}>{b.desc}</div>
             </div>
           </div>
         ))}
      </div>

      {/* Our Story & Values */}
      <section className="story-values-wrapper jaipur-bg-pattern" style={{ width: '100%', backgroundColor: '#fdfbf7', padding: '80px 0', margin: '80px 0' }}>
<div className="story-values-section" style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '60px', padding: '0 20px' }}>
        
        {/* Story */}
        <div style={{ flex: '1 1 500px', display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 250px' }}>
            <h2 style={{ fontSize: '32px', fontFamily: 'serif', fontWeight: 400, color: '#111', marginBottom: '20px' }}>Our Story</h2>
            <div style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: '#888', fontWeight: 700, marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '10px', display: 'inline-block' }}>Crafting Style, Comfort & Heritage</div>
            <p style={{ fontSize: '14px', color: '#555', lineHeight: 1.8, marginBottom: '30px' }}>Rang and Craft was born from a passion for timeless fashion. We blend tradition with modern trends, creating breathable, stylish, and meaningful clothing for today's generation while keeping our rich heritage alive.</p>
            <Link to="/about" style={{ display: 'inline-block', backgroundColor: '#1a3c34', color: '#fff', padding: '12px 25px', fontSize: '12px', fontWeight: 600, letterSpacing: '2px', textDecoration: 'none' }}>OUR JOURNEY →</Link>
          </div>
          {/* Collage */}
          <div style={{ flex: '1 1 250px', position: 'relative', height: '300px' }}>
            <img src="/images/clothing_rack_hero.png" style={{ position: 'absolute', top: 0, left: 0, width: '60%', height: '80%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', top: '10%', right: '10%', width: '60%', height: '90%', backgroundColor: '#1a3c34' }}></div>
            <div style={{ position: 'absolute', top: '25%', right: '15%', width: '50%', height: '60%', backgroundColor: '#fcf6eb', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>
              <span style={{ color: '#c48f56', fontSize: '12px', letterSpacing: '2px', lineHeight: 1.5, fontWeight: 600 }}>MORE<br/>THAN<br/>FASHION</span>
              <div style={{ color: '#c48f56', fontSize: '18px', marginTop: '10px' }}>❁</div>
            </div>
          </div>
        </div>

        {/* Values */}
        <div style={{ flex: '1 1 500px', display: 'flex', gap: '30px', flexWrap: 'wrap-reverse' }}>
          <div style={{ flex: '1 1 250px' }}>
            <h2 style={{ fontSize: '32px', fontFamily: 'serif', fontWeight: 400, color: '#111', marginBottom: '20px' }}>Our Values</h2>
            <div style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: '#888', fontWeight: 700, marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '10px', display: 'inline-block' }}>Style With Purpose</div>
            <p style={{ fontSize: '14px', color: '#555', lineHeight: 1.8, marginBottom: '30px' }}>We stand for quality, authenticity, and innovation. We craft stylish, comfortable clothing while embracing sustainability and ensuring a positive impact on our artisans, communities, and the environment.</p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '5px' }}>🌱</div>
                <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#c48f56' }}>Sustainability</div>
                <div style={{ fontSize: '10px', color: '#888' }}>A Greener Tomorrow</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '5px' }}>👥</div>
                <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#c48f56' }}>Empowering Artisans</div>
                <div style={{ fontSize: '10px', color: '#888' }}>People First</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '5px' }}>💎</div>
                <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#c48f56' }}>Timeless Quality</div>
                <div style={{ fontSize: '10px', color: '#888' }}>Built to Last</div>
              </div>
            </div>
          </div>
          <div style={{ flex: '1 1 200px', position: 'relative', height: '300px' }}>
            <img src="/images/heritage-edit-men.jpg" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
              <h4 style={{ color: '#e8c9a3', fontFamily: 'serif', fontSize: '18px', fontStyle: 'italic', fontWeight: 300, lineHeight: 1.4 }}>Preserving Tradition,<br/>Designing a Brighter Tomorrow</h4>
            </div>
          </div>
        </div>
        
      </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '32px', marginBottom: '50px', fontWeight: 400, fontFamily: 'serif' }}>What Our Customers Say</h2>
        <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px', maxWidth: '1200px', margin: '0 auto', scrollbarWidth: 'none' }}>
           {[
             { title: 'Fabulous', body: 'They are good at print quality and material. Very nice short kurtas, really loved it.', name: 'Rahul' },
             { title: 'Good fitting', body: 'Good Fit, nice colour accuracy. The pattern on the kurta is amazing. Highly recommend!', name: 'Vikram' },
             { title: 'Amazing pick', body: 'This cloth is so beautiful, comfortable, and stylish. The quality is top notch, I really prefer it.', name: 'Amit' },
             { title: 'Super colour and fabric', body: 'Fabric is super quality and breathable clothes. I bought two and will buy more.', name: 'Sanjay' }
           ].map((rev, i) => (
             <div key={i} style={{ minWidth: '320px', flex: '1', padding: '40px 30px', border: '1px solid rgba(0,0,0,0.08)', backgroundColor: '#fff', textAlign: 'left' }}>
               <div style={{ color: '#c48f56', marginBottom: '15px', fontSize: '20px' }}>★★★★★</div>
               <h4 style={{ fontWeight: 600, marginBottom: '10px', fontSize: '18px' }}>{rev.title}</h4>
               <p style={{ color: '#666', fontSize: '15px', marginBottom: '25px', lineHeight: 1.6 }}>"{rev.body}"</p>
               <span style={{ fontSize: '13px', color: '#295454', textTransform: 'uppercase', fontWeight: 600 }}>- {rev.name}</span>
             </div>
           ))}
        </div>
      </section>

    </div>
  );
};

export default HomePage;
