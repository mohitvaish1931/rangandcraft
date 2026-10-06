import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useAppContext, type Product } from '../context/AppContext';
import { getImageUrl, handleImageError } from '../utils/mediaHelper';
import { discountPercent, formatPrice, productId } from '../lib/format';
import { isSoldOut } from '../lib/catalog';
import { Stars } from './StarRating';

interface Props {
  product: Product;
  priority?: boolean;
}

const ProductCard = ({ product, priority = false }: Props) => {
  const { state, dispatch } = useAppContext();
  const id = productId(product);
  const href = `/product/${id}`;
  const off = discountPercent(product.price, product.originalPrice);
  const soldOut = isSoldOut(product);
  const altImage = product.images?.find((img) => img && img !== product.image);
  const wished = state.wishlist.some((w) => productId(w) === id);
  const rating = product.rating || product.averageRating || 0;
  const reviews = product.numReviews || product.reviewCount || 0;

  const toggleWish = () => {
    dispatch(wished ? { type: 'REMOVE_FROM_WISHLIST', payload: id } : { type: 'ADD_TO_WISHLIST', payload: product });
  };

  return (
    <article className={`rc-card${soldOut ? ' is-soldout' : ''}`}>
      <div className="rc-card__frame">
        <Link to={href} className="rc-card__media" aria-label={product.name} tabIndex={-1}>
          <img
            src={getImageUrl(product.image, 600)}
            alt={product.name}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            onError={handleImageError}
          />
          {altImage && <img className="rc-card__alt" src={getImageUrl(altImage, 600)} alt="" loading="lazy" decoding="async" aria-hidden />}
        </Link>
        <div className="rc-card__badges">
          {soldOut ? <span className="rc-tag rc-tag--dark">Sold out</span> : off > 0 && <span className="rc-tag rc-tag--sale">{off}% off</span>}
          {product.isBOGO && !soldOut && <span className="rc-tag">Buy 1 Get 1</span>}
        </div>
        <button
          type="button"
          className={`rc-icon-btn rc-card__wish${wished ? ' is-active' : ''}`}
          onClick={toggleWish}
          aria-pressed={wished}
          aria-label={wished ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
        >
          <Heart size={18} strokeWidth={1.6} />
        </button>
        {!soldOut && (
          <div className="rc-card__quick">
            <Link to={href} className="rc-btn rc-btn--light rc-btn--sm rc-btn--block">Choose size</Link>
          </div>
        )}
      </div>
      <div className="rc-card__body">
        <span className="rc-card__cat">{product.category}</span>
        <Link to={href} className="rc-card__name">{product.name}</Link>
        <div className="rc-price">
          <span className="rc-price__now">{formatPrice(product.price)}</span>
          {off > 0 && <span className="rc-price__was">{formatPrice(product.originalPrice)}</span>}
        </div>
        {reviews > 0 && (
          <span className="rc-rating"><Stars value={rating} size={12} /> ({reviews})</span>
        )}
      </div>
    </article>
  );
};

export const ProductCardSkeleton = () => (
  <div className="rc-card" aria-hidden>
    <div className="rc-skeleton" style={{ aspectRatio: '4 / 5', borderRadius: 'var(--rc-radius)' }} />
    <div className="rc-card__body">
      <div className="rc-skeleton" style={{ height: 10, width: '40%' }} />
      <div className="rc-skeleton" style={{ height: 14, width: '85%', marginTop: 6 }} />
      <div className="rc-skeleton" style={{ height: 14, width: '30%', marginTop: 6 }} />
    </div>
  </div>
);

export default ProductCard;
