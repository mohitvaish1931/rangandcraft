import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import Categories from '../components/Categories';
import TrustBadges from '../components/TrustBadges';
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
        setProducts(data.products || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
  }, []);

  const list = Array.isArray(products) ? products : [];
  const featured = list.slice(0, 10);
  const bestSellers = list.slice(10, 20).length > 0 ? list.slice(10, 20) : list.slice(0, 10);

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

      {/* Choose Your Fit */}
      <section style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '32px', marginBottom: '40px', fontWeight: 400, fontFamily: 'serif' }}>Choose Your Fit</h2>
        <div style={{ display: 'flex', gap: '20px', maxWidth: '1200px', margin: '0 auto', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 400px', position: 'relative', height: '450px', overflow: 'hidden' }}>
            <img src="/images/suits-men.jpg" alt="Formal Collection" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <h3 style={{ color: '#fff', fontSize: '36px', marginBottom: '20px', fontFamily: 'serif' }}>Formal Collection</h3>
              <Link to="/shop?category=Suits" style={{ backgroundColor: '#fff', color: '#111', padding: '12px 40px', textDecoration: 'none', fontWeight: 500, fontSize: '14px', letterSpacing: '1px' }}>Shop</Link>
            </div>
          </div>
          <div style={{ flex: '1 1 400px', position: 'relative', height: '450px', overflow: 'hidden' }}>
            <img src="/images/kurta-men.jpg" alt="Casual Collection" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <h3 style={{ color: '#fff', fontSize: '36px', marginBottom: '20px', fontFamily: 'serif' }}>Casual</h3>
              <Link to="/shop?category=Short Kurtas" style={{ backgroundColor: '#fff', color: '#111', padding: '12px 40px', textDecoration: 'none', fontWeight: 500, fontSize: '14px', letterSpacing: '1px' }}>Shop</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story & Values */}
      <section style={{ display: 'flex', flexWrap: 'wrap', maxWidth: '1200px', margin: '60px auto', gap: '30px', padding: '0 20px' }}>
        <div style={{ flex: '1 1 300px', textAlign: 'center', padding: '60px 40px', border: '1px solid rgba(41, 84, 84, 0.2)', backgroundColor: 'transparent' }}>
          <h2 style={{ fontSize: '28px', marginBottom: '15px', fontFamily: 'serif' }}>Our Story</h2>
          <h3 style={{ fontSize: '16px', color: '#295454', marginBottom: '25px', fontWeight: 600, letterSpacing: '1px' }}>Crafting Style, Comfort & Heritage</h3>
          <p style={{ color: '#555', lineHeight: 1.8, fontSize: '15px' }}>Rang and Craft was born from a passion for timeless fashion. We blend tradition with modern trends, creating breathable, stylish, and comfortable clothing.</p>
        </div>
        <div style={{ flex: '1 1 300px', textAlign: 'center', padding: '60px 40px', border: '1px solid rgba(41, 84, 84, 0.2)', backgroundColor: 'transparent' }}>
          <h2 style={{ fontSize: '28px', marginBottom: '15px', fontFamily: 'serif' }}>Our Values</h2>
          <h3 style={{ fontSize: '16px', color: '#295454', marginBottom: '25px', fontWeight: 600, letterSpacing: '1px' }}>Style with Purpose</h3>
          <p style={{ color: '#555', lineHeight: 1.8, fontSize: '15px' }}>We stand for quality, authenticity, and innovation. We craft stylish, comfortable clothing while embracing sustainability and ensuring customer satisfaction in every piece.</p>
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
             <div key={i} style={{ minWidth: '320px', flex: '1', padding: '40px 30px', border: '1px solid rgba(0,0,0,0.08)', backgroundColor: 'transparent', textAlign: 'left' }}>
               <div style={{ color: '#c48f56', marginBottom: '15px', fontSize: '20px' }}>★★★★★</div>
               <h4 style={{ fontWeight: 600, marginBottom: '10px', fontSize: '18px' }}>{rev.title}</h4>
               <p style={{ color: '#666', fontSize: '15px', marginBottom: '25px', lineHeight: 1.6 }}>"{rev.body}"</p>
               <span style={{ fontSize: '13px', color: '#295454', textTransform: 'uppercase', fontWeight: 600 }}>- {rev.name}</span>
             </div>
           ))}
        </div>
      </section>

      <TrustBadges />

    </div>
  );
};

export default HomePage;
