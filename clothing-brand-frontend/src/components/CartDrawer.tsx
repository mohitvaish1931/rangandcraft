import { useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, X } from 'lucide-react';
import { cartCount, cartSubtotal, useAppContext } from '../context/AppContext';
import { formatPrice } from '../lib/format';
import CartLine from './CartLine';
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
  const subtotal = cartSubtotal(state.cart);
  const savings = state.cart.reduce((sum, i) => sum + Math.max(0, (i.originalPrice || i.price) - i.price) * i.quantity, 0);

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
              <div className="rc-progress" style={{ marginTop: 16 }}>
                ✦ Free shipping on this order{savings > 0 && <> · You’re saving <strong>{formatPrice(savings)}</strong></>}
              </div>
              {state.cart.map((item) => <CartLine key={item.key} item={item} onNavigate={close} />)}
            </div>
            <div className="rc-drawer__foot">
              <div className="rc-summary-row" style={{ fontSize: 17 }}>
                <span>Subtotal</span>
                <strong style={{ fontWeight: 500 }}>{formatPrice(subtotal)}</strong>
              </div>
              <p className="rc-muted" style={{ fontSize: 13, marginBottom: 14 }}>Taxes included. Coupons can be applied at checkout.</p>
              <button type="button" className="rc-btn rc-btn--block rc-btn--lg" onClick={() => { close(); navigate('/checkout'); }}>
                Checkout · {formatPrice(subtotal)}
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
