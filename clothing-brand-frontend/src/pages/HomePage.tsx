import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Gem, Leaf, RefreshCcw, ShieldCheck, Truck, Users } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';
import NewsletterForm from '../components/NewsletterForm';
import Seo from '../components/Seo';
import { Stars } from '../components/StarRating';
import { categoriesOf, isOnSale, isSoldOut, sortProducts } from '../lib/catalog';
import { FALLBACK_IMAGES } from '../lib/brand';
import { productId } from '../lib/format';
import { getImageUrl } from '../utils/mediaHelper';
import { useLatestReviews } from '../lib/useLatestReviews';

const VALUES = [
  { icon: Truck, title: 'Free shipping', text: 'On all prepaid orders' },
  { icon: RefreshCcw, title: '7-day exchange', text: 'Hassle-free size swaps' },
  { icon: ShieldCheck, title: 'Secure payments', text: 'UPI, cards & netbanking' },
  { icon: Gem, title: 'Crafted in Jaipur', text: 'Rooted in heritage' },
];

const ProductRow = ({ products, loading }: { products: ReturnType<typeof sortProducts>; loading: boolean }) => (
  <div className="rc-grid">
    {loading && products.length === 0
      ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
      : products.map((p, i) => <ProductCard key={productId(p)} product={p} priority={i < 4} />)}
  </div>
);

const HomePage = () => {
  const { state } = useAppContext();
  const loading = state.productsStatus !== 'ready' && state.productsStatus !== 'error';
  const visible = useMemo(() => state.products.filter((p) => p.showOnHomepage !== false), [state.products]);

  const newArrivals = useMemo(() => sortProducts(visible, 'featured').filter((p) => !isSoldOut(p)).slice(0, 8), [visible]);
  const onSale = useMemo(() => {
    const shown = new Set(newArrivals.map(productId));
    return sortProducts(visible.filter((p) => isOnSale(p) && !isSoldOut(p) && !shown.has(productId(p))), 'discount').slice(0, 4);
  }, [visible, newArrivals]);
  const categories = useMemo(() => categoriesOf(state.products).slice(0, 8), [state.products]);
  const { data: reviewData } = useLatestReviews(6);
  const reviews = reviewData?.reviews.filter((r) => r.rating >= 4).slice(0, 3) ?? [];

  return (
    <>
      <Seo
        title="Rang and Craft | Men's Kurtas & Shirts from Jaipur"
        description="Shop men's printed cotton kurtas, half sleeve shirts and co-ord sets, crafted in Jaipur. Breathable fabrics, honest prices, free shipping on prepaid orders."
        path="/"
      />

      <section className="rc-hero">
        <div className="rc-hero__media">
          <img src="/images/hero-banner.webp" alt="" fetchPriority="high" />
        </div>
        <div className="rc-container">
          <div className="rc-hero__content">
            <span className="rc-eyebrow rc-rise rc-rise--1">The Jaipur Edit</span>
            <h1 className="rc-hero__title rc-rise rc-rise--2">
              Jaipur prints.<br /><em>Everyday ease.</em>
            </h1>
            <p className="rc-hero__text rc-rise rc-rise--3">
              Breathable printed cotton kurtas and shirts, designed and crafted in Jaipur.
              <br /><span className="rc-hero__offer">Any 2 short kurtas for ₹1499</span>
            </p>
            <div className="rc-hero__actions rc-rise rc-rise--4">
              <Link to="/shop" className="rc-btn rc-btn--light rc-btn--lg">Shop the collection</Link>
              <Link to="/shop?sort=newest" className="rc-btn rc-btn--ghost-light rc-btn--lg">New arrivals</Link>
            </div>
          </div>
        </div>
      </section>

      <div className="rc-values" role="list">
        {VALUES.map(({ icon: Icon, title, text }) => (
          <div className="rc-value" key={title} role="listitem">
            <Icon size={26} strokeWidth={1.3} aria-hidden />
            <div><strong>{title}</strong><span>{text}</span></div>
          </div>
        ))}
      </div>

      {categories.length > 0 && (
        <section className="rc-section">
          <div className="rc-container">
            <div className="rc-section-head">
              <div>
                <span className="rc-eyebrow">Shop by category</span>
                <h2 className="rc-h2">Find your fit</h2>
              </div>
              <Link to="/shop" className="rc-link">View all <ArrowRight size={14} /></Link>
            </div>
            <div className="rc-cat-rail">
              {categories.map((c, i) => (
                <Link key={c.name} to={`/shop?category=${encodeURIComponent(c.name)}`} className="rc-cat">
                  <img src={c.image ? getImageUrl(c.image, 500) : FALLBACK_IMAGES[i % FALLBACK_IMAGES.length]} alt="" loading="lazy" />
                  <span className="rc-cat__label">{c.name} <ArrowRight size={18} /></span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="rc-section rc-section--tint">
        <div className="rc-container">
          <div className="rc-section-head">
            <div>
              <span className="rc-eyebrow">Just landed</span>
              <h2 className="rc-h2">New this season</h2>
            </div>
            <Link to="/shop?sort=newest" className="rc-link">Shop new in <ArrowRight size={14} /></Link>
          </div>
          {state.productsStatus === 'error' ? (
            <div className="rc-alert rc-alert--info">We couldn’t load the collection right now. Please refresh the page in a moment.</div>
          ) : (
            <ProductRow products={newArrivals} loading={loading} />
          )}
        </div>
      </section>

      <section className="rc-section">
        <div className="rc-container rc-split">
          <Link to="/shop?category=Suits" className="rc-feature">
            <img src="/images/suits-men.jpg" alt="" loading="lazy" />
            <div className="rc-feature__body">
              <span className="rc-eyebrow">Occasion wear</span>
              <h3 className="rc-feature__title">The Festive<br />Collection</h3>
              <p className="rc-feature__text">Bandhgalas, suits and long kurtas for weddings, pujas and every celebration in between.</p>
              <span className="rc-btn rc-btn--light">Explore festive</span>
            </div>
          </Link>
          <Link to="/shop?category=Short%20Kurtas" className="rc-feature">
            <img src="/images/kurta-men.jpg" alt="" loading="lazy" />
            <div className="rc-feature__body">
              <span className="rc-eyebrow">Everyday ease</span>
              <h3 className="rc-feature__title">Short Kurtas<br />& Shirts</h3>
              <p className="rc-feature__text">Light, breathable printed cotton — made for long Indian summers.</p>
              <span className="rc-btn rc-btn--light">Shop everyday</span>
            </div>
          </Link>
        </div>
      </section>

      {onSale.length > 0 && (
        <section className="rc-section" style={{ paddingTop: 0 }}>
          <div className="rc-container">
            <div className="rc-section-head">
              <div>
                <span className="rc-eyebrow">Limited time</span>
                <h2 className="rc-h2">Best value picks</h2>
              </div>
              <Link to="/shop?sale=1" className="rc-link">Shop the sale <ArrowRight size={14} /></Link>
            </div>
            <ProductRow products={onSale} loading={false} />
          </div>
        </section>
      )}

      <section className="rc-section rc-section--tint">
        <div className="rc-container rc-story">
          <div className="rc-story__media">
            <img src="/images/heritage-edit-men.jpg" alt="A Rang and Craft kurta photographed in Jaipur" loading="lazy" />
            <div className="rc-story__stamp">
              <strong>Jaipur</strong>
              Designed and crafted in the Pink City
            </div>
          </div>
          <div>
            <span className="rc-eyebrow">Our story</span>
            <h2 className="rc-h2" style={{ margin: '12px 0 18px' }}>Craft you can feel, made for the way you live</h2>
            <p className="rc-lead">
              Rang and Craft was born in Jaipur from a passion for timeless fashion. We blend tradition with modern trends,
              creating breathable, stylish and meaningful clothing for today’s generation while keeping our rich heritage alive.
            </p>
            <div className="rc-story__points">
              <div><Leaf size={22} strokeWidth={1.4} /><strong>Breathable fabrics</strong><span>Comfortable all day</span></div>
              <div><Users size={22} strokeWidth={1.4} /><strong>Artisan made</strong><span>Empowering local craftspeople</span></div>
              <div><BadgeCheck size={22} strokeWidth={1.4} /><strong>Timeless quality</strong><span>Built to last</span></div>
            </div>
            <Link to="/about" className="rc-btn rc-btn--outline">Read our story</Link>
          </div>
        </div>
      </section>

      {reviews.length > 0 && (
        <section className="rc-section">
          <div className="rc-container">
            <div className="rc-section-head rc-section-head--center">
              <span className="rc-eyebrow">Customer love</span>
              <h2 className="rc-h2">Worn and loved</h2>
              {reviewData && reviewData.totalReviews > 0 && (
                <span className="rc-rating" style={{ marginTop: 10 }}>
                  <Stars value={reviewData.averageRating} size={16} /> {reviewData.averageRating.toFixed(1)} from {reviewData.totalReviews} review{reviewData.totalReviews === 1 ? '' : 's'}
                </span>
              )}
            </div>
            <div className="rc-quotes">
              {reviews.map((r) => (
                <figure className="rc-quote" key={r._id}>
                  <Stars value={r.rating} />
                  <blockquote>“{r.comment.length > 180 ? `${r.comment.slice(0, 177)}…` : r.comment}”</blockquote>
                  <figcaption>
                    <strong>{r.userName}</strong>
                    {r.productId?.name && <> · on <Link to={`/product/${r.productId._id}`}>{r.productId.name}</Link></>}
                  </figcaption>
                </figure>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <Link to="/reviews" className="rc-link">Read all reviews <ArrowRight size={14} /></Link>
            </div>
          </div>
        </section>
      )}

      <section className="rc-section" style={{ paddingTop: reviews.length > 0 ? 0 : undefined }}>
        <div className="rc-container">
          <div className="rc-band">
            <div>
              <span className="rc-eyebrow">The Rang and Craft letter</span>
              <h2 className="rc-h2" style={{ marginTop: 10 }}>New prints, first.</h2>
              <p>Be the first to hear about new drops, restocks and members-only offers. No spam, ever.</p>
            </div>
            <NewsletterForm source="home" />
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
