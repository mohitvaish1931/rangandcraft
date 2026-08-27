import { Link } from 'react-router-dom';

const Categories = () => {
  const categoriesList = [
    { name: 'LUXE', image: '/images/suits-men.jpg' },
    { name: 'SHORT KURTA', image: '/images/kurta-men.jpg' },
    { name: 'HALF SLEEVES SHIRT', image: '/images/tops-men.jpg' },
    { name: 'LINEN PANTS', image: '/images/kurta-men.jpg' },
    { name: 'FULL SLEEVES SHIRT', image: '/images/saree-men.jpg' },
    { name: 'LONG KURTA', image: '/images/indowestern-men.jpg' },
    { name: 'NEHRU JACKETS', image: '/images/clothing_rack_hero.png' },
  ];

  return (
    <section style={{ padding: '60px 0', textAlign: 'center' }}>
      <h2 style={{ fontSize: '1.8rem', marginBottom: '40px', letterSpacing: '4px', fontWeight: 300, color: '#333' }}>
        SHOP ALL COLLECTION
      </h2>
      <div style={{ display: 'flex', width: '100%', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {categoriesList.map((cat, index) => (
          <Link to={`/shop`} key={index} style={{ flex: '1', minWidth: '14.28%', aspectRatio: '4/5', position: 'relative', display: 'block', overflow: 'hidden', borderRight: '2px solid white' }}>
            <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 40%)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '30px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ color: '#fff', fontSize: '14px', fontWeight: 400, letterSpacing: '1px' }}>{cat.name}</span>
                <div style={{ width: '20px', height: '2px', backgroundColor: '#fff', marginTop: '5px' }}></div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default Categories;
