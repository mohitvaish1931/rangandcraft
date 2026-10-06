import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import Seo from '../components/Seo';
import { productId } from '../lib/format';

const WishlistScreen = () => {
  const { state } = useAppContext();
  // Prefer live catalogue data so prices and stock are current.
  const items = state.wishlist.map((w) => state.products.find((p) => productId(p) === productId(w)) ?? w);

  return (
    <>
      <Seo title="Wishlist" noindex />
      <header className="rc-page-head">
        <div className="rc-container">
          <span className="rc-eyebrow">Saved for later</span>
          <h1 className="rc-h1">Your wishlist</h1>
        </div>
      </header>
      <div className="rc-container rc-section" style={{ paddingTop: 40 }}>
        {items.length === 0 ? (
          <div className="rc-empty">
            <Heart size={44} strokeWidth={1.2} />
            <h2 className="rc-h3">Nothing saved yet</h2>
            <p>Tap the heart on any piece to save it here for later.</p>
            <Link to="/shop" className="rc-btn">Discover the collection</Link>
          </div>
        ) : (
          <div className="rc-grid">{items.map((p) => <ProductCard key={productId(p)} product={p} />)}</div>
        )}
      </div>
    </>
  );
};

export default WishlistScreen;
