import { Link } from 'react-router-dom';
import { getImageUrl } from '../utils/mediaHelper';
import './Categories.css';

interface CategoriesProps {
  products?: any[];
}

const Categories = ({ products = [] }: CategoriesProps) => {
  return (
    <section className="section categories-masonry-section" style={{padding: '0'}}>
      <div className="categories-masonry-dual">
        
        {(() => {
          const categoriesList = [
            {
              name: 'Short Kurtas',
              path: '/shop?category=Short%20Kurtas',
              tag: 'THE ETHNIC EDIT',
              title: 'Short Kurtas',
              desc: 'Timeless craftsmanship meets modern silhouettes.'
            },
            {
              name: 'Long Kurtas',
              path: '/shop?category=Long%20Kurtas',
              tag: 'DESIGNER FAVORITES',
              title: 'Long Kurtas',
              desc: 'Regal elegance for every precious occasion.'
            },
            {
              name: 'Half Sleeves Shirts',
              path: '/shop?category=Half%20Sleeves%20Shirts',
              tag: 'CASUAL CHIC',
              title: 'Half Sleeves Shirts',
              desc: 'Charming everyday comfort in breathable cotton.'
            }
          ];

          return categoriesList.map((cat, index) => {
            const list = Array.isArray(products) ? products : [];
            const matched = list.find((p) => p.category === cat.name);
            if (!matched) return null;
            
            return (
              <Link to={cat.path} key={index} className={`cat-card-purple reveal-on-scroll delay-${index * 100}`}>
                <img src={getImageUrl(matched.image, 800)} alt={cat.name} className="cat-bg-img" loading="lazy" />
                <div className="cat-overlay-purple"></div>
                <div className="cat-text-content-purple">
                  <span className="cat-tag-purple">{cat.tag}</span>
                  <h3 className="cat-title-purple font-serif">{cat.title}</h3>
                  <p className="cat-desc-purple">{cat.desc}</p>
                  <span className="cat-link-purple">EXPLORE COLLECTION</span>
                </div>
              </Link>
            );
          });
        })()}

      </div>
    </section>
  );
};

export default Categories;
