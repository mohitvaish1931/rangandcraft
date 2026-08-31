import { Helmet } from 'react-helmet-async';

const Gallery = () => {
  const images = [
    '/images/kurta-men.jpg',
    '/images/suits-men.jpg',
    '/images/indowestern-men.jpg',
    '/images/saree-men.jpg',
    '/images/tops-men.jpg',
    '/images/hero-banner.png',
    '/images/clothing_rack_hero.png',
    '/images/store-locator.png'
  ];

  return (
    <div style={{ backgroundColor: '#F9F9F9', minHeight: '100vh', padding: '60px 20px', textAlign: 'center' }}>
      <Helmet>
        <title>Our Gallery - Rang and Craft</title>
      </Helmet>
      <h1 style={{ fontSize: '3rem', color: '#295454', fontFamily: 'serif', marginBottom: '10px' }}>Our Gallery</h1>
      <p style={{ color: '#666', marginBottom: '50px' }}>Glimpses of our premium ethnic wear collection</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {images.map((img, idx) => (
          <div key={idx} style={{ position: 'relative', overflow: 'hidden', aspectRatio: '4/5', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
            <img src={img} alt={`Gallery image ${idx+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }} 
                 onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'} 
                 onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;
