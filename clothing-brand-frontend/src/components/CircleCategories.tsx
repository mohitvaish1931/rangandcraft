import { Link } from 'react-router-dom';
import { getImageUrl } from '../utils/mediaHelper';
import './CircleCategories.css';

interface CircleCategoriesProps {
  products?: any[];
}

const CircleCategories = ({ products = [] }: CircleCategoriesProps) => {
  const categoriesList = [
    {
      name: 'Short Kurtas',
      path: '/shop?category=Short%20Kurtas',
      label: 'Short Kurtas',
      defaultImg: '/images/kurta-category.png'
    },
    {
      name: 'Long Kurtas',
      path: '/shop?category=Long%20Kurtas',
      label: 'Long Kurtas',
      defaultImg: '/images/suits-category.png'
    },

    {
      name: 'Half Sleeves Shirts',
      path: '/shop?category=Half Sleeves Shirts',
      label: 'Half Sleeves Shirts',
      defaultImg: '/images/indowestern-category.png'
    },
    {
      name: 'Full Sleeves Shirts',
      path: '/shop?category=Full%20Sleeves%20Shirts',
      label: 'Full Sleeves Shirts',
      defaultImg: '/images/bridal-edit.png'
    }
  ];

  return (
    <div className="circle-categories-wrapper">
      <div className="circle-categories-container scroll-hidden">
        {categoriesList.map((cat, index) => {
          const list = Array.isArray(products) ? products : [];
          const matched = list.find((p) => p.category === cat.name);
          if (!matched) return null; // Only show category if a product exists
          const imgSrc = getImageUrl(matched.image, 300); // Smaller for circles
          
          return (
            <Link to={cat.path} key={index} className="circle-category-item">
              <div className="circle-image-ring">
                <div className="circle-image-inner">
                  <img src={imgSrc} alt={cat.label} loading="lazy" />
                </div>
              </div>
              <span className="circle-category-label">{cat.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default CircleCategories;
