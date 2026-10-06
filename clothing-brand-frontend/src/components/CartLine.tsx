import { Link } from 'react-router-dom';
import { Minus, Plus } from 'lucide-react';
import { useAppContext, type CartItem } from '../context/AppContext';
import { formatPrice } from '../lib/format';
import { getImageUrl, handleImageError } from '../utils/mediaHelper';

const CartLine = ({ item, onNavigate }: { item: CartItem; onNavigate?: () => void }) => {
  const { dispatch } = useAppContext();
  const setQty = (quantity: number) => dispatch({ type: 'UPDATE_CART_QUANTITY', payload: { key: item.key, quantity } });
  const variant = [item.selectedSize && `Size ${item.selectedSize}`, item.selectedColor].filter(Boolean).join(' · ');

  return (
    <div className="rc-line">
      <Link to={`/product/${item.productId}`} className="rc-line__img" onClick={onNavigate}>
        <img src={getImageUrl(item.image, 200)} alt={item.name} loading="lazy" onError={handleImageError} />
      </Link>
      <div>
        <Link to={`/product/${item.productId}`} className="rc-line__name" onClick={onNavigate}>{item.name}</Link>
        <div className="rc-line__meta">{variant || item.category}</div>
        <div className="rc-qty rc-qty--sm" role="group" aria-label={`Quantity for ${item.name}`}>
          <button type="button" onClick={() => setQty(item.quantity - 1)} disabled={item.quantity <= 1} aria-label="Decrease quantity">
            <Minus size={14} />
          </button>
          <span aria-live="polite">{item.quantity}</span>
          <button type="button" onClick={() => setQty(item.quantity + 1)} disabled={item.quantity >= item.maxQuantity} aria-label="Increase quantity">
            <Plus size={14} />
          </button>
        </div>
      </div>
      <div className="rc-line__right">
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 500 }}>{formatPrice(item.price * item.quantity)}</div>
          {item.originalPrice && item.originalPrice > item.price && (
            <div className="rc-price__was">{formatPrice(item.originalPrice * item.quantity)}</div>
          )}
        </div>
        <button type="button" className="rc-line__remove" onClick={() => dispatch({ type: 'REMOVE_FROM_CART', payload: item.key })}>
          Remove
        </button>
      </div>
    </div>
  );
};

export default CartLine;
