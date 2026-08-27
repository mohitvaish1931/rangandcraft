import { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import Categories from '../components/Categories';
import FeaturedTabs from '../components/FeaturedTabs';
import TrustBadges from '../components/TrustBadges';
import { Helmet } from 'react-helmet-async';
import { API_ENDPOINTS } from '../utils/api';
import './HomePage.css';

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
  const shortKurtas = list.filter(p => p.category === 'Short Kurtas');
  const longKurtas = list.filter(p => p.category === 'Long Kurtas');

  return (
    <div className="homepage">
      <Helmet>
        <title>Rang and Craft - Where Heritage Meets Style</title>
      </Helmet>
      
      <Hero />
      
      <FeaturedTabs shortKurtas={shortKurtas} longKurtas={longKurtas} />

      {/* Flash Sale and Newly Launched */}
      <section style={{ display: 'flex', gap: '20px', padding: '0 20px', marginBottom: '60px' }}>
        <div style={{ flex: 1, position: 'relative', height: '400px', overflow: 'hidden' }}>
          <img src="/images/indowestern-men.jpg" alt="Flash Sale" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <h2 style={{ color: '#fff', fontSize: '3rem', fontWeight: 700, letterSpacing: '2px', textShadow: '2px 2px 8px rgba(0,0,0,0.5)' }}>FLASH SALE</h2>
          </div>
        </div>
        <div style={{ flex: 1, position: 'relative', height: '400px', overflow: 'hidden' }}>
          <img src="/images/saree-men.jpg" alt="Newly Launched" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <h2 style={{ color: '#fff', fontSize: '3rem', fontWeight: 700, letterSpacing: '2px', textShadow: '2px 2px 8px rgba(0,0,0,0.5)', textAlign: 'center', lineHeight: 1.1 }}>NEWLY<br/>LAUNCHED</h2>
          </div>
        </div>
      </section>

      {/* Timeless Elegance */}
      <section style={{ backgroundColor: '#131b2c', color: '#fff', padding: '80px 20px', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '20px', left: '20px', color: '#888', fontSize: '11px', letterSpacing: '1px' }}>
          TRUSTED BY 1L+ CUSTOMERS
        </div>
        <div style={{ maxWidth: '800px', margin: '0 auto', zIndex: 1, position: 'relative' }}>
          <h2 style={{ fontSize: '5rem', fontFamily: 'serif', margin: '0 0 10px 0', fontWeight: 400, color: '#f3e1c6' }}>Timeless elegance</h2>
          <p style={{ fontSize: '1.2rem', color: '#aaa', margin: '0 0 50px 0' }}>Traditional clocks are honestly timeless, no cap!</p>
          <button style={{ backgroundColor: 'transparent', color: '#fff', border: 'none', fontSize: '1.2rem', letterSpacing: '2px', cursor: 'pointer' }}>
            BUY NOW
          </button>
        </div>
        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '40%', backgroundImage: 'url(/images/suits-men.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.5 }}></div>
      </section>

      <Categories />
      
      <TrustBadges />

    </div>
  );
};

export default HomePage;
