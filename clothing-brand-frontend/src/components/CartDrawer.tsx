import { useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, X } from 'lucide-react';
import { cartCount, useAppContext } from '../context/AppContext';
import { formatPrice } from '../lib/format';
import CartLine from './CartLine';
import BagPerks from './BagPerks';
import { estimateBag } from '../lib/offers';
import { isSoldOut } from '../lib/catalog';
import { getImageUrl } from '../utils/mediaHelper';
import { productId } from '../lib/format';
import { useScrollLock } from '../lib/motion';

const CartDrawer = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const open = state.isCartOpen;
  const closeRef = useRef<HTMLButtonElement>(null);
  const close = () => dispatch({ type: 'TOGGLE_CART', payload: false });

  useScrollLock(open);
  useEffect(() => {
    if (open) window.setTimeout(() => closeRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => { dispatch({ type: 'TOGGLE_CART', payload: false }); }, [location.pathname, dispatch]);

  const count = cartCount(state.cart);
  const estimate = estimateBag(state.cart);

  // A few pieces to complete the look: first ones that finish a bundle, then other favourites.
  const inBag = new Set(state.cart.map((i) => i.productId));
  const candidates = state.products.filter((p) => !inBag.has(productId(p)) && !isSoldOut(p));
  const suggestions = state.cart.length > 0 && state.cart.length <= 2
    ? [
        ...candidates.filter((p) => estimate.nudge && p.category === estimate.nudge.category),
        ...candidates.filter((p) => !estimate.nudge || p.category !== estimate.nudge.category),
      ].slice(0, 3)
    : [];

  return (
    <>
      <div className={`rc-overlay${open ? ' is-open' : ''}`} onClick={close} aria-hidden />
      <aside className={`rc-drawer rc-drawer--right${open ? ' is-open' : ''}`} data-lenis-prevent role="dialog" aria-modal="true" aria-label="Shopping bag" aria-hidden={!open}>
        <div className="rc-drawer__head">
          <span className="rc-drawer__title">Your bag {count > 0 && <span className="rc-muted" style={{ fontSize: '1rem' }}>({count})</span>}</span>
          <button ref={closeRef} type="button" className="rc-icon-btn" onClick={close} aria-label="Close bag">
            <X size={22} />
          </button>
        </div>

        {state.cart.length === 0 ? (
          <div className="rc-drawer__body">
            <div className="rc-empty">
              <ShoppingBag size={40} strokeWidth={1.2} />
              <h3 className="rc-h3">Your bag is empty</h3>
              <p>Kurtas and shirts crafted in Jaipur are waiting for you.</p>
              <Link to="/shop" className="rc-btn" onClick={close}>Start shopping</Link>
            </div>
          </div>
        ) : (
          <>
            <div className="rc-drawer__body">
              <BagPerks estimate={estimate} onNavigate={close} />
              {state.cart.map((item) => <CartLine key={item.key} item={item} onNavigate={close} />)}
              {suggestions.length > 0 && (
                <div className="rc-pair">
                  <p className="rc-pair__title">{estimate.nudge ? 'Complete your bundle' : 'Complete the look'}</p>
                  {suggestions.map((p) => (
                    <Link key={productId(p)} to={`/product/${productId(p)}`} className="rc-pair__item" onClick={close}>
                      <img src={getImageUrl(p.image, 120)} alt="" loading="lazy" />
                      <span className="rc-pair__name">{p.name}</span>
                      <span className="rc-pair__price">{formatPrice(p.price)}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <div className="rc-drawer__foot">
              {estimate.offerDiscount > 0 && (
                <div className="rc-summary-row rc-summary-row--discount" style={{ fontSize: 14 }}>
                  <span>Bundle offer</span><span>−{formatPrice(estimate.offerDiscount)}</span>
                </div>
              )}
              <div className="rc-summary-row" style={{ fontSize: 14 }}>
                <span>Shipping</span>
                <span>{estimate.shippingPrice ? formatPrice(estimate.shippingPrice) : 'Free'}</span>
              </div>
              <div className="rc-summary-row" style={{ fontSize: 17 }}>
                <span>Total</span>
                <strong style={{ fontWeight: 500 }}>{formatPrice(estimate.total)}</strong>
              </div>
              <p className="rc-muted" style={{ fontSize: 13, marginBottom: 14 }}>Taxes included. Coupons can be applied at checkout.</p>
              <button type="button" className="rc-btn rc-btn--block rc-btn--lg" onClick={() => { close(); navigate('/checkout'); }}>
                Checkout · {formatPrice(estimate.total)}
              </button>
              <Link to="/cart" className="rc-btn rc-btn--outline rc-btn--block" style={{ marginTop: 10 }} onClick={close}>View bag</Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
};

export default CartDrawer;
