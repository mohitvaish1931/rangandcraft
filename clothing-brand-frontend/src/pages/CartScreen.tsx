import { useEffect } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Lock, ShoppingBag } from 'lucide-react';
import { cartCount, cartSubtotal, useAppContext } from '../context/AppContext';
import CartLine from '../components/CartLine';
import Seo from '../components/Seo';
import { formatPrice } from '../lib/format';
import { API_ENDPOINTS } from '../utils/api';

const CartScreen = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const { id } = useParams();
  const [params] = useSearchParams();

  // Support old "/cart/:id?qty=&size=" links by adding the item, then cleaning the URL.
  useEffect(() => {
    if (!id) return;
    fetch(`${API_ENDPOINTS.PRODUCTS}/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((product) => {
        if (product) {
          dispatch({
            type: 'ADD_TO_CART',
            payload: {
              product: { ...product, id: product._id },
              quantity: Number(params.get('qty')) || 1,
              selectedSize: params.get('size') || '',
              selectedColor: params.get('color') || '',
            },
          });
          dispatch({ type: 'TOGGLE_CART', payload: false });
        }
      })
      .finally(() => navigate('/cart', { replace: true }));
  }, [id, params, dispatch, navigate]);

  const count = cartCount(state.cart);
  const subtotal = cartSubtotal(state.cart);
  const mrp = state.cart.reduce((sum, i) => sum + (i.originalPrice && i.originalPrice > i.price ? i.originalPrice : i.price) * i.quantity, 0);

  return (
    <>
      <Seo title="Your Bag" noindex />
      <header className="rc-page-head">
        <div className="rc-container">
          <h1 className="rc-h1">Your bag {count > 0 && <span className="rc-muted" style={{ fontSize: '0.5em' }}>({count} item{count === 1 ? '' : 's'})</span>}</h1>
        </div>
      </header>

      <div className="rc-container rc-section" style={{ paddingTop: 40 }}>
        {state.cart.length === 0 ? (
          <div className="rc-empty">
            <ShoppingBag size={48} strokeWidth={1.2} />
            <h2 className="rc-h3">Your bag is empty</h2>
            <p>Looks like you haven’t added anything yet. Our latest kurtas and shirts are a good place to start.</p>
            <Link to="/shop" className="rc-btn">Continue shopping</Link>
          </div>
        ) : (
          <div className="rc-checkout">
            <div className="rc-panel">
              {state.cart.map((item) => <CartLine key={item.key} item={item} />)}
            </div>
            <aside className="rc-summary">
              <div className="rc-panel">
                <h2 className="rc-panel__title">Order summary</h2>
                <div className="rc-summary-row"><span>MRP total</span><span>{formatPrice(mrp)}</span></div>
                {mrp > subtotal && <div className="rc-summary-row rc-summary-row--discount"><span>Discount on MRP</span><span>−{formatPrice(mrp - subtotal)}</span></div>}
                <div className="rc-summary-row"><span>Shipping</span><span style={{ color: 'var(--rc-success)' }}>Free</span></div>
                <div className="rc-summary-row rc-summary-row--total"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                <p className="rc-muted" style={{ fontSize: 13, margin: '8px 0 18px' }}>Inclusive of all taxes. Have a coupon? Apply it at checkout.</p>
                <button type="button" className="rc-btn rc-btn--block rc-btn--lg" onClick={() => navigate('/checkout')}>
                  <Lock size={16} /> Checkout securely
                </button>
                <Link to="/shop" className="rc-btn rc-btn--outline rc-btn--block" style={{ marginTop: 10 }}>Continue shopping</Link>
              </div>
            </aside>
          </div>
        )}
      </div>
    </>
  );
};

export default CartScreen;
