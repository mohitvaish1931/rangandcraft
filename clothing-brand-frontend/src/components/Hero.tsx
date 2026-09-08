import { Link } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero-section" style={{ height: '85vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {/* Background Image with Zoom Effect */}
      <div className="hero-bg" style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/images/hero-banner.png)', backgroundSize: 'cover', backgroundPosition: 'center 20%', zIndex: -2 }}></div>
      
      {/* Gradient Overlay for better readability */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.7) 100%)', zIndex: -1 }}></div>
      
      {/* Content */}
      <div className="hero-content" style={{ textAlign: 'center', color: '#fff', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 20px', maxWidth: '900px', marginTop: '40px' }}>
        
        <span style={{ fontSize: '13px', letterSpacing: '6px', textTransform: 'uppercase', marginBottom: '20px', color: '#e8c9a3', fontWeight: 600 }} className="fade-in-up delay-1">
          THE ROYAL JAIPUR COLLECTION
        </span>
        
        <h1 style={{ fontSize: 'clamp(3rem, 6vw, 5.5rem)', fontFamily: 'serif', fontWeight: 400, margin: '0 0 20px 0', lineHeight: 1.1, textShadow: '0 4px 20px rgba(0,0,0,0.5)' }} className="fade-in-up delay-2">
          Elevate Your Style
        </h1>
        
        <p style={{ fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', fontWeight: 300, marginBottom: '40px', letterSpacing: '1px', opacity: 0.9, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }} className="fade-in-up delay-3">
          Get Any 2 Premium Short Kurtas <span style={{ fontWeight: 700, color: '#e8c9a3' }}>@ ₹1499</span>
        </p>
        
        <div className="fade-in-up delay-4" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/shop?category=Short Kurtas" className="hero-btn primary-btn" style={{ padding: '16px 45px', backgroundColor: '#295454', color: '#fff', textDecoration: 'none', fontSize: '14px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', transition: 'all 0.3s ease', border: '1px solid #295454' }}>
            Shop The Offer
          </Link>
          <Link to="/shop" className="hero-btn secondary-btn" style={{ padding: '16px 45px', backgroundColor: 'transparent', color: '#fff', textDecoration: 'none', fontSize: '14px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', transition: 'all 0.3s ease', border: '1px solid #fff' }}>
            Explore All
          </Link>
        </div>
        
      </div>

      {/* Decorative Scroll Down Element */}
      <div style={{ position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.7 }} className="fade-in-up delay-5 hidden-mobile">
         <span style={{ fontSize: '10px', letterSpacing: '3px', marginBottom: '15px', textTransform: 'uppercase' }}>Scroll to discover</span>
         <div className="scroll-indicator" style={{ width: '1px', height: '60px', backgroundColor: 'rgba(255,255,255,0.2)', position: 'relative', overflow: 'hidden' }}>
            <div className="scroll-dot" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '50%', backgroundColor: '#fff', animation: 'scrollDown 2s infinite ease-in-out' }}></div>
         </div>
      </div>
    </section>
  );
};

export default Hero;
