import { Link } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero" style={{ height: '80vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/images/hero-banner.png)', backgroundSize: 'cover', backgroundPosition: 'center', zIndex: -1 }}></div>
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: -1 }}></div>
      <div className="hero-content" style={{ textAlign: 'center', color: '#fff', zIndex: 1 }}>
        <h1 className="hero-title" style={{ fontSize: '4rem', fontWeight: 'bold', letterSpacing: '2px', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
          GET ANY 2 SHORT KURTA @ 1499
        </h1>
        <div style={{ marginTop: '30px' }}>
          <button style={{ 
            width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.8)', 
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' 
          }} onClick={() => window.scrollBy({top: 600, behavior: 'smooth'})}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
