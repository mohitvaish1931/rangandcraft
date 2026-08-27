

const Hero = () => {
  return (
    <section style={{ height: '85vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/images/hero-banner.png)', backgroundSize: 'cover', backgroundPosition: 'center 20%', zIndex: -1 }}></div>
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: -1 }}></div>
      <div style={{ textAlign: 'center', color: '#fff', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '100px' }}>
        <h1 style={{ fontSize: '5rem', fontWeight: 700, letterSpacing: '2px', margin: 0 }}>
          GET ANY 2 SHORT KURTA @ 1499
        </h1>
        <div style={{ marginTop: '50px' }}>
          <button style={{ 
            width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#fff', 
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
          }} onClick={() => window.scrollBy({top: 800, behavior: 'smooth'})}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
