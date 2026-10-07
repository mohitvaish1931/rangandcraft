import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import Seo from '../components/Seo';
import { productId } from '../lib/format';
import { isSoldOut } from '../lib/catalog';

const WishlistScreen = () => {
  const { state } = useAppContext();
  // Prefer live catalogue data so prices and stock are current.
  const suggestions = [...state.products]
    .filter((p) => !isSoldOut(p))
    .sort((a, b) => (b.reviewCount ?? b.numReviews ?? 0) - (a.reviewCount ?? a.numReviews ?? 0))
    .slice(0, 4);
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
        {items.length === 0 && (
          <div className="rc-empty">
            <Heart size={44} strokeWidth={1.2} />
            <h2 className="rc-h3">Nothing saved yet</h2>
            <p>Tap the heart on any piece to save it here for later.</p>
            <Link to="/shop" className="rc-btn">Discover the collection</Link>
          </div>
        )}
        {items.length === 0 && suggestions.length > 0 && (
          <div style={{ marginTop: 'clamp(40px, 6vw, 72px)' }}>
            <div className="rc-section-head">
              <div><span className="rc-eyebrow">A good place to start</span><h2 className="rc-h2">Customer favourites</h2></div>
              <Link to="/shop" className="rc-link">Shop all</Link>
            </div>
            <div className="rc-grid">{suggestions.map((p) => <ProductCard key={productId(p)} product={p} />)}</div>
          </div>
        )}
        {items.length > 0 && (
          <div className="rc-grid">{items.map((p) => <ProductCard key={productId(p)} product={p} />)}</div>
        )}
      </div>
    </>
  );
};

export default WishlistScreen;
