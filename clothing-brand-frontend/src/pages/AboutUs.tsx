import React from 'react';
import { useSEO } from '../utils/useSEO';
import { ShieldCheck, Globe, Award, Lock, RefreshCcw } from 'lucide-react';

const AboutUs = () => {
  useSEO({
    title: 'Our Story - RANG AND CRAFT Jaipur',
    description: 'Experience the regal legacy of RANG AND CRAFT. Handcrafted elegance from the heart of Jaipur since 2005.',
    keywords: 'about us, brand story, clothing heritage, craftsmanship, RANG AND CRAFT Jaipur, luxury ethnic wear',
    url: 'https://rangandcraft.store/about-us',
    type: 'website'
  });

  return (
    <div className="about-page" style={{ backgroundColor: '#FDFBFD', color: '#1a1a1a' }}>
      {/* Hero Section */}
      <section className="about-hero" style={{ 
        position: 'relative', 
        padding: '120px 20px', 
        backgroundColor: '#2D0A4E', 
        color: '#fff', 
        textAlign: 'center',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(212,175,55,0.2) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
        
        <div className="container" style={{ position: 'relative', maxWidth: '900px', margin: '0 auto' }}>
          <span style={{ color: '#D4AF37', letterSpacing: '6px', fontWeight: '800', fontSize: '0.75rem', textTransform: 'uppercase', display: 'block', marginBottom: '20px' }}>ESTABLISHED 2005</span>
          <h1 className="font-serif" style={{ fontSize: '4.5rem', marginBottom: '30px', lineHeight: '1' }}>The Soul of <br /><i style={{ color: '#D4AF37' }}>Rang and Craft</i></h1>
          <p style={{ fontSize: '1.25rem', opacity: 0.8, lineHeight: '1.8', maxWidth: '700px', margin: '0 auto' }}>
            Where ancient Jaipur artistry meets contemporary silhouettes. We don't just create apparel; we weave heirlooms for your most precious moments.
          </p>
        </div>
      </section>

      {/* Our Heritage Section */}
      <section style={{ padding: '100px 20px' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '80px', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ 
              width: '100%', 
              height: '600px', 
              borderRadius: '20px', 
              overflow: 'hidden',
              boxShadow: '0 30px 60px rgba(0,0,0,0.1)'
            }}>
              <img 
                src="/images/bridal-edit.png" 
                alt="Jaipur Heritage" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ 
              position: 'absolute', 
              bottom: '-30px', 
              right: '-30px', 
              backgroundColor: '#fff', 
              padding: '40px', 
              borderRadius: '20px', 
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              maxWidth: '250px'
            }}>
              <h3 className="font-serif" style={{ color: '#2D0A4E', fontSize: '1.5rem', marginBottom: '10px' }}>21 Years</h3>
              <p style={{ color: '#666', fontSize: '0.85rem', lineHeight: '1.5' }}>Of preserving the intricate Zari and Gota Patti traditions of Rajasthan.</p>
            </div>
          </div>

          <div>
            <span className="small-gold-tag">OUR HERITAGE</span>
            <h2 className="font-serif" style={{ fontSize: '3rem', color: '#2D0A4E', marginBottom: '30px' }}>Born in the <br /> Pink City</h2>
            <p style={{ color: '#444', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '25px' }}>
              Rang and Craft was born amidst the vibrant hues and architectural splendor of Jaipur. Inspired by the "Rang and Craft" (Rose) that characterizes the city's palette, our journey began with a vision to bring royal Rajputana aesthetics to the modern woman.
            </p>
            <p style={{ color: '#444', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '35px' }}>
              Every stitch in a Rang and Craft garment is a tribute to the master craftsmen of Rajasthan, whose hands carry the legacy of centuries. We pride ourselves on being a bridge between tradition and the future.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
               <div>
                  <h4 style={{ fontWeight: '800', color: '#2D0A4E', marginBottom: '10px' }}>100% Handcrafted</h4>
                  <p style={{ fontSize: '0.85rem', color: '#666' }}>Meticulously detailed by master artisans in our Jaipur atelier.</p>
               </div>
               <div>
                  <h4 style={{ fontWeight: '800', color: '#2D0A4E', marginBottom: '10px' }}>Ethical Fashion</h4>
                  <p style={{ fontSize: '0.85rem', color: '#666' }}>Fair wages and sustainable practices at every stage of creation.</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ backgroundColor: '#fff', padding: '80px 0', borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', textAlign: 'center', maxWidth: '1200px', margin: '0 auto' }}>
          <StatItem number="100K+" label="Happy Patrons" />
          <StatItem number="2000+" label="Unique Designs" />
          <StatItem number="50+" label="Global Stores" />
          <StatItem number="21" label="Years of Legacy" />
        </div>
      </section>

      {/* Values Section */}
      <section style={{ padding: '100px 20px', backgroundColor: '#F8F5FF' }}>
        <div className="container text-center" style={{ marginBottom: '60px', maxWidth: '1200px', margin: '0 auto 60px' }}>
          <span className="small-gold-tag">THE GUL ETHOS</span>
          <h2 className="font-serif" style={{ fontSize: '3rem', color: '#2D0A4E' }}>What We Stand For</h2>
        </div>
        
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', maxWidth: '1200px', margin: '0 auto' }}>
          <ValueCard 
            icon={<Award size={32} />} 
            title="Premium Quality" 
            desc="We use only the finest silks, linens, and hand-woven fabrics, ensuring every piece feels as good as it looks."
          />
          <ValueCard 
            icon={<ShieldCheck size={32} />} 
            title="Authentic Artistry" 
            desc="From Zardosi to Bandhani, we preserve the authentic techniques of Indian craftsmanship without compromise."
          />
          <ValueCard 
            icon={<Globe size={32} />} 
            title="Modern Heritage" 
            desc="Designing for the global woman who respects her roots but embraces contemporary fashion sensibilities."
          />
        </div>
      </section>

      {/* Trust Bar Footer */}
      <section style={{ backgroundColor: '#fff', borderTop: '1px solid #eee', padding: '80px 20px' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px' }}>
              <TrustItem icon={<ShieldCheck size={28} />} title="PREMIUM QUALITY" sub="Finest fabrics & craftsmanship" />
              <TrustItem icon={<Lock size={28} />} title="SECURE PAYMENTS" sub="100% secure & trusted" />
              <TrustItem icon={<RefreshCcw size={28} />} title="EASY RETURNS" sub="Hassle-free returns" />
              <TrustItem icon={<Globe size={28} />} title="WORLDWIDE SHIPPING" sub="Delivered across the globe" />
          </div>
        </div>
      </section>
      
      <style>{`
        @media (max-width: 768px) {
          .about-hero h1 {
            font-size: 2.8rem !important;
          }
          .about-hero {
            padding: 80px 20px !important;
          }
        }
      `}</style>
    </div>
  );
};

const StatItem = ({ number, label }: { number: string, label: string }) => (
  <div>
    <h3 className="font-serif" style={{ fontSize: '3rem', color: '#2D0A4E', marginBottom: '5px' }}>{number}</h3>
    <p style={{ color: '#D4AF37', fontWeight: '700', letterSpacing: '2px', fontSize: '0.7rem', textTransform: 'uppercase' }}>{label}</p>
  </div>
);

const ValueCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '20px', border: '1px solid #f0f0f0', transition: 'all 0.3s' }}>
    <div style={{ color: '#D4AF37', marginBottom: '25px' }}>{icon}</div>
    <h4 className="font-serif" style={{ fontSize: '1.5rem', color: '#2D0A4E', marginBottom: '15px' }}>{title}</h4>
    <p style={{ color: '#666', lineHeight: '1.8', fontSize: '0.95rem' }}>{desc}</p>
  </div>
);

const TrustItem = ({ icon, title, sub }: { icon: React.ReactNode, title: string, sub: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
    <div style={{ color: '#2D0A4E', opacity: 0.8 }}>{icon}</div>
    <div style={{ textAlign: 'left' }}>
      <h5 style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '1px', color: '#2D0A4E', marginBottom: '2px' }}>{title}</h5>
      <p style={{ fontSize: '0.65rem', color: '#888' }}>{sub}</p>
    </div>
  </div>
);

export default AboutUs;
