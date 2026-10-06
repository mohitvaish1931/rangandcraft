import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, ShoppingBag, User } from 'lucide-react';
import { cartCount, useAppContext } from '../context/AppContext';

const MobileBottomNav = () => {
  const { pathname } = useLocation();
  const { state, dispatch } = useAppContext();
  const count = cartCount(state.cart);
  const accountPath = state.user ? '/profile' : '/login';

  return (
    <nav className="rc-bottom-nav" aria-label="Quick navigation">
      <Link to="/" className={pathname === '/' ? 'is-active' : ''}><Home size={20} strokeWidth={1.5} />Home</Link>
      <Link to="/shop" className={pathname.startsWith('/shop') ? 'is-active' : ''}><LayoutGrid size={20} strokeWidth={1.5} />Shop</Link>
      <button type="button" onClick={() => dispatch({ type: 'TOGGLE_CART', payload: true })} className={state.isCartOpen ? 'is-active' : ''} aria-label={`Bag, ${count} items`}>
        <ShoppingBag size={20} strokeWidth={1.5} />Bag
        {count > 0 && <span className="rc-badge-count">{count}</span>}
      </button>
      <Link to={accountPath} className={['/profile', '/login', '/register'].includes(pathname) ? 'is-active' : ''}><User size={20} strokeWidth={1.5} />Account</Link>
    </nav>
  );
};

export default MobileBottomNav;
