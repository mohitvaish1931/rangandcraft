import { Link } from 'react-router-dom';
import { getImageUrl } from '../utils/mediaHelper';
import './Categories.css';

interface CategoriesProps {
  products?: any[];
}

const Categories = ({ products = [] }: CategoriesProps) => {
  const categoriesList = [
    { name: 'LUXE', path: '/shop?category=Luxe' },
    { name: 'SHORT KURTA', path: '/shop?category=Short%20Kurtas' },
    { name: 'HALF SLEEVES SHIRT', path: '/shop?category=Half%20Sleeves%20Shirts' },
    { name: 'LINEN PANTS', path: '/shop?category=Linen%20Pants' },
    { name: 'FULL SLEEVES SHIRT', path: '/shop?category=Full%20Sleeves%20Shirts' },
    { name: 'LONG KURTA', path: '/shop?category=Long%20Kurtas' },
    { name: 'NEHRU JACKETS', path: '/shop?category=Nehru%20Jackets' },
  ];

  return (
    <section className="section shop-all-collection-section" style={{padding: '20px 0 60px 0', textAlign: 'center'}}>
      <h2 className="title" style={{fontSize: '2rem', marginBottom: '40px', letterSpacing: '2px', fontWeight: 400}}>SHOP ALL COLLECTION</h2>
      <div className="container">
        <div style={{display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '20px', scrollbarWidth: 'none'}}>
          {categoriesList.map((cat, index) => {
            const list = Array.isArray(products) ? products : [];
            let matched = list.find((p) => p.category?.toUpperCase() === cat.name.toUpperCase());
            if (!matched && cat.name === 'SHORT KURTA') matched = list.find((p) => p.category === 'Short Kurtas');
            if (!matched && cat.name === 'LONG KURTA') matched = list.find((p) => p.category === 'Long Kurtas');
            if (!matched && cat.name === 'HALF SLEEVES SHIRT') matched = list.find((p) => p.category === 'Half Sleeves Shirts');
            if (!matched && cat.name === 'FULL SLEEVES SHIRT') matched = list.find((p) => p.category === 'Full Sleeves Shirts');
            
            // Fallback image if product not found so UI still matches
            const imageSrc = matched ? getImageUrl(matched.image, 600) : '/images/kurta-category.png';

            return (
              <Link to={cat.path} key={index} className="collection-cat-card" style={{minWidth: '200px', height: '300px', position: 'relative', overflow: 'hidden', flex: '0 0 auto', display: 'block'}}>
                <img src={imageSrc} alt={cat.name} style={{width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease'}} className="hover-scale" />
                <div style={{position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <span style={{color: '#fff', fontSize: '1rem', fontWeight: 500, letterSpacing: '1px'}}>{cat.name}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      <style>{`
        .hover-scale:hover { transform: scale(1.05); }
      `}</style>
    </section>
  );
};

export default Categories;
