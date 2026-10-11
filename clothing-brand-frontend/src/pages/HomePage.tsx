import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Gem, RefreshCcw, ShieldCheck, Truck } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import ProductRail from '../components/ProductRail';
import CategoryList from '../components/CategoryList';
import StickyStory from '../components/StickyStory';
import NewsletterForm from '../components/NewsletterForm';
import SplitText from '../components/SplitText';
import Seo from '../components/Seo';
import { Stars } from '../components/StarRating';
import HomeHero from '../components/HomeHero';
import { categoriesOf, isSoldOut, sortProducts } from '../lib/catalog';
import { productId } from '../lib/format';
import { pickLooks, spotlightOf, useSlides } from '../lib/media';
import { offerFor } from '../lib/offers';
import { useLatestReviews } from '../lib/useLatestReviews';
import { responsiveImage } from '../utils/mediaHelper';

const VALUES = [
  { icon: Truck, title: 'Free shipping', text: 'On orders above ₹1499' },
  { icon: RefreshCcw, title: '7-day size exchange', text: 'On unworn pieces with tags' },
  { icon: ShieldCheck, title: 'Secure payments', text: 'UPI, cards & netbanking' },
  { icon: Gem, title: 'Made in Jaipur', text: 'Hand block printed cotton' },
];

const MARQUEE = ['Short Kurtas', 'Half Sleeve Shirts', 'Full Sleeve Shirts', 'Block Prints', 'Everyday', 'Jaipur'];

const STATEMENT = 'Menswear rooted in the *block-printing* craft of Jaipur — breathable fabrics, honest prices and a quiet *confidence* you can wear every single day.';

const Statement = () => {
  const words = STATEMENT.split(' ');
  return (
    <p className="rc-statement" data-highlight="">
      {words.map((w, i) => {
        const em = w.includes('*');
        return <span key={i} className={`rc-hl-word${em ? ' is-em' : ''}`}>{w.replace(/\*/g, '')}{i < words.length - 1 ? ' ' : ''}</span>;
      })}
    </p>
  );
};

const QuoteCarousel = ({ quotes }: { quotes: { _id: string; comment: string; userName: string; rating: number; product?: string }[] }) => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (quotes.length < 2) return;
    const t = window.setInterval(() => setIndex((i) => (i + 1) % quotes.length), 6500);
    return () => window.clearInterval(t);
  }, [quotes.length]);
  const q = quotes[index];
  return (
    <div className="rc-bigquote" aria-live="polite">
      <Stars value={q.rating} size={18} />
      <blockquote key={q._id}>“{q.comment.length > 200 ? `${q.comment.slice(0, 197)}…` : q.comment}”</blockquote>
      <p className="rc-muted" style={{ letterSpacing: '0.08em' }}><strong style={{ color: 'var(--rc-ink)', fontWeight: 500 }}>{q.userName}</strong>{q.product ? ` · ${q.product}` : ''}</p>
      {quotes.length > 1 && (
        <div className="rc-bigquote__dots">
          {quotes.map((x, i) => <button key={x._id} type="button" className={i === index ? 'is-active' : ''} onClick={() => setIndex(i)} aria-label={`Show review ${i + 1}`} />)}
        </div>
      )}
    </div>
  );
};

const HomePage = () => {
  const { state } = useAppContext();
  const loading = state.productsStatus !== 'ready' && state.productsStatus !== 'error';
  const visible = useMemo(() => state.products.filter((p) => p.showOnHomepage !== false), [state.products]);

  const newArrivals = useMemo(() => sortProducts(visible, 'featured').filter((p) => !isSoldOut(p)).slice(0, 10), [visible]);
  const categories = useMemo(() => categoriesOf(state.products).slice(0, 6), [state.products]);

  // All imagery comes from the admin's hero slides or the catalogue itself.
  const slides = useSlides();
  const media = useMemo(() => {
    const hero = pickLooks(state.products, 3);
    const spotlight = spotlightOf(state.products);
    const story = pickLooks(state.products, 3, { shot: 'detail', salt: 3, exclude: hero });
    const lookbook = pickLooks(state.products, 4, { shot: 1, salt: 5, exclude: [...hero, ...story] });
    return { hero, spotlight, story, lookbook };
  }, [state.products]);
  const spot = media.spotlight;
  const spotOffer = spot ? offerFor(spot.category) : null;
  const shareImage = slides?.[0]?.image || media.hero[0]?.src;
  const { data: reviewData } = useLatestReviews(8);
  const quotes = (reviewData?.reviews ?? [])
    .filter((r) => r.rating >= 4)
    .slice(0, 5)
    .map((r) => ({ _id: r._id, comment: r.comment, userName: r.userName, rating: r.rating, product: r.productId?.name }));

  return (
    <>
      <Seo
        title="Rang and Craft | Men's Kurtas & Shirts from Jaipur"
        description="Shop men's hand block printed cotton short kurtas and half & full sleeve shirts from Jaipur. Free shipping above ₹1499, 7-day size exchange."
        path="/"
        image={shareImage}
      />

      {/* ---------- Hero ---------- */}
      <HomeHero slides={slides} looks={media.hero} />

      {/* ---------- Marquee ---------- */}
      <div className="rc-marquee" aria-hidden>
        <div className="rc-marquee__track">
          {[...MARQUEE, ...MARQUEE, ...MARQUEE].map((w, i) => <span key={i}>{w}</span>)}
        </div>
      </div>

      {/* ---------- Statement ---------- */}
      <section className="rc-section">
        <div className="rc-container rc-intro">
          <div className="rc-intro__meta">
            <span className="rc-eyebrow">Our philosophy</span>
            <p>From the Pink City to your wardrobe — clothes designed to be lived in.</p>
            <Link to="/about" className="rc-link">Our story <ArrowRight size={14} /></Link>
          </div>
          <div>
            <Statement />
            <div className="rc-stats">
              {VALUES.slice(0, 3).map(({ icon: Icon, title, text }, i) => (
                <div key={title} data-reveal="up" style={{ '--d': `${i * 120}ms` } as React.CSSProperties}>
                  <Icon size={24} strokeWidth={1.3} color="var(--rc-gold)" style={{ marginBottom: 12 }} />
                  <strong>{title}</strong>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- New arrivals rail ---------- */}
      <section className="rc-section rc-section--tint rc-cv">
        <div className="rc-container">
          <div className="rc-section-head">
            <div>
              <span className="rc-eyebrow">Just landed</span>
              <SplitText className="rc-h2" text="New this *season*" />
            </div>
            <Link to="/shop?sort=newest" className="rc-link">Shop new in <ArrowRight size={14} /></Link>
          </div>
          {state.productsStatus === 'error' ? (
            <div className="rc-alert rc-alert--info">We couldn’t load the collection right now. Please refresh the page in a moment.</div>
          ) : (
            <ProductRail products={newArrivals} loading={loading} label="New arrivals" />
          )}
        </div>
      </section>

      {/* ---------- Category index ---------- */}
      {categories.length > 0 && (
        <section className="rc-section">
          <div className="rc-container">
            <div className="rc-section-head">
              <div>
                <span className="rc-eyebrow">Shop by category</span>
                <SplitText className="rc-h2" text="Find your *fit*" />
              </div>
              <Link to="/shop" className="rc-link">View everything <ArrowRight size={14} /></Link>
            </div>
            <CategoryList categories={categories} />
          </div>
        </section>
      )}

      {/* ---------- Category spotlight (changes daily) ---------- */}
      {spot && (
        <section className="rc-section rc-dark rc-cv">
          <div className="rc-container rc-edit">
            <Link to={`/product/${productId(spot.look.product)}`} className="rc-edit__media" data-reveal="mask" data-cursor="View" aria-label={`View ${spot.look.product.name}`}>
              <div className="rc-plx" data-parallax="0.08">
                <img {...responsiveImage(spot.look.src, '(max-width: 900px) 100vw, 50vw', 960)} alt={spot.look.product.name} loading="lazy" />
              </div>
              <span className="rc-edit__tag">{spot.look.product.name}</span>
            </Link>
            <div>
              <span className="rc-eyebrow">In focus · {spot.count} piece{spot.count === 1 ? '' : 's'}</span>
              <SplitText key={spot.category} className="rc-h1" text={spot.category.replace(/(\S+)$/, '*$1*')} />
              <p className="rc-lead" style={{ marginTop: 18 }} data-reveal="up">
                Hand block printed on breathable cotton in our Jaipur studio, ready to ship across India.
                {spotOffer && <><br /><span className="rc-edit__offer">{spotOffer.label}</span></>}
              </p>
              {spot.picks.length > 0 && (
                <div className="rc-edit__products">
                  {spot.picks.map((p) => <ProductCard key={productId(p)} product={p} />)}
                </div>
              )}
              <Link to={`/shop?category=${encodeURIComponent(spot.category)}`} className="rc-btn rc-btn--gold rc-btn--lg" data-magnetic="" style={{ marginTop: spot.picks.length ? 0 : 28 }}>
                Shop {spot.category.toLowerCase()}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ---------- Sticky story ---------- */}
      <section className="rc-section rc-cv">
        <div className="rc-container">
          <div className="rc-section-head">
            <div>
              <span className="rc-eyebrow">The craft</span>
              <SplitText className="rc-h2" text="Made with *intent*" />
            </div>
          </div>
          <StickyStory looks={media.story} />
        </div>
      </section>

      {/* ---------- Reviews ---------- */}
      {quotes.length > 0 && (
        <section className="rc-section rc-section--tint rc-cv">
          <div className="rc-container">
            <div className="rc-section-head rc-section-head--center">
              <span className="rc-eyebrow">Customer love</span>
              {reviewData && reviewData.totalReviews > 0 && (
                <span className="rc-rating" style={{ marginTop: 6 }}>
                  {reviewData.averageRating.toFixed(1)} average from {reviewData.totalReviews} review{reviewData.totalReviews === 1 ? '' : 's'}
                </span>
              )}
            </div>
            <QuoteCarousel quotes={quotes} />
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <Link to="/reviews" className="rc-link">Read all reviews <ArrowRight size={14} /></Link>
            </div>
          </div>
        </section>
      )}

      {/* ---------- Lookbook ---------- */}
      {media.lookbook.length >= 2 && (
        <section className="rc-section rc-cv">
          <div className="rc-container">
            <div className="rc-section-head">
              <div>
                <span className="rc-eyebrow">Lookbook</span>
                <SplitText className="rc-h2" text="Seen in the *Pink City*" />
              </div>
              <Link to="/gallery" className="rc-link">Open the lookbook <ArrowRight size={14} /></Link>
            </div>
            <div className="rc-lookbook">
              {media.lookbook.map(({ src, product }, i) => (
                <Link key={src} to={`/product/${productId(product)}`} data-reveal="mask" data-cursor="View" style={{ '--d': `${i * 120}ms` } as React.CSSProperties}>
                  <img {...responsiveImage(src, '(max-width: 1100px) 50vw, 25vw')} alt={product.name} loading="lazy" />
                  <span className="rc-lookbook__cap">{product.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Values + newsletter ---------- */}
      <section className="rc-section">
        <div className="rc-container">
          <div className="rc-band" data-reveal="up">
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
