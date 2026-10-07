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
import { categoriesOf, isOnSale, isSoldOut, sortProducts } from '../lib/catalog';
import { productId } from '../lib/format';
import { useLatestReviews } from '../lib/useLatestReviews';
import { responsiveImage } from '../utils/mediaHelper';
import logoImg from '../assets/logo.png';

const VALUES = [
  { icon: Truck, title: 'Free shipping', text: 'On orders above ₹1499' },
  { icon: RefreshCcw, title: '7-day exchange', text: 'Hassle-free size swaps' },
  { icon: ShieldCheck, title: 'Secure payments', text: 'UPI, cards & netbanking' },
  { icon: Gem, title: 'Crafted in Jaipur', text: 'Rooted in heritage' },
];

const MARQUEE = ['Kurtas', 'Shirts', 'Co-ords', 'Festive', 'Everyday', 'Jaipur'];

const STATEMENT = 'Menswear rooted in the *royal* legacy of Jaipur — breathable fabrics, honest prices and a quiet *confidence* you can wear every single day.';

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
  const editPicks = useMemo(() => {
    const pool = visible.filter((p) => !isSoldOut(p));
    const festive = pool.filter((p) => /suit|festive|bandhgala|sherwani|jacket/i.test(`${p.category} ${p.name}`));
    const picks = festive.length >= 2 ? festive : sortProducts(pool.filter(isOnSale), 'discount');
    return picks.slice(0, 2);
  }, [visible]);
  const categories = useMemo(() => categoriesOf(state.products).slice(0, 6), [state.products]);
  const { data: reviewData } = useLatestReviews(8);
  const quotes = (reviewData?.reviews ?? [])
    .filter((r) => r.rating >= 4)
    .slice(0, 5)
    .map((r) => ({ _id: r._id, comment: r.comment, userName: r.userName, rating: r.rating, product: r.productId?.name }));

  return (
    <>
      <Seo
        title="Rang and Craft | Men's Kurtas & Shirts from Jaipur"
        description="Shop men's printed cotton kurtas, half sleeve shirts and co-ord sets, crafted in Jaipur. Breathable fabrics, honest prices, free shipping above ₹1499."
        path="/"
      />

      {/* ---------- Hero ---------- */}
      <section className="rc-hero rc-hero--home">
        <div className="rc-hero__media">
          <div className="rc-plx" data-parallax="0.18">
            <img {...responsiveImage('/images/hero-banner.png')} alt="" fetchPriority="high" decoding="async" />
          </div>
        </div>
        <span className="rc-hero__side" aria-hidden>Rang &amp; Craft — Jaipur, Rajasthan</span>
        <div className="rc-container rc-hero__layout">
          <span className="rc-eyebrow rc-rise rc-rise--1">The Jaipur Edit</span>
          <SplitText as="h1" className="rc-hero__title" text={'Jaipur prints,\n*everyday ease.*'} delay={150} soft />
          <div className="rc-hero__foot">
            <div>
              <p className="rc-hero__text rc-rise rc-rise--3">
                Breathable printed cotton kurtas and shirts, designed and crafted in Jaipur.
                <br /><span className="rc-hero__offer">Any 2 short kurtas for ₹1499</span>
              </p>
              <div className="rc-hero__actions rc-rise rc-rise--4">
                <Link to="/shop" className="rc-btn rc-btn--light rc-btn--lg" data-magnetic="">Shop the collection</Link>
                <Link to="/shop?sort=newest" className="rc-btn rc-btn--ghost-light rc-btn--lg" data-magnetic="">New arrivals</Link>
              </div>
            </div>
            <div className="rc-hero__aside rc-rise rc-rise--4">
              <div className="rc-scroll-cue" aria-hidden><i />Scroll</div>
              <div className="rc-badge-spin" aria-hidden>
                <svg viewBox="0 0 132 132">
                  <defs><path id="rc-circle" d="M66,66 m-54,0 a54,54 0 1,1 108,0 a54,54 0 1,1 -108,0" /></defs>
                  <text><textPath href="#rc-circle">Rang &amp; Craft • Crafted in Jaipur • Since day one •</textPath></text>
                </svg>
                <img src={logoImg} alt="" width={38} height={37} />
              </div>
            </div>
          </div>
        </div>
      </section>

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

      {/* ---------- Dark festive edit ---------- */}
      <section className="rc-section rc-dark rc-cv">
        <div className="rc-container rc-edit">
          <div className="rc-edit__media" data-reveal="mask">
            <div className="rc-plx" data-parallax="0.08">
              <img {...responsiveImage('/images/suits-men.jpg', '(max-width: 900px) 100vw, 50vw')} alt="Festive wear from Rang and Craft" loading="lazy" />
            </div>
          </div>
          <div>
            <span className="rc-eyebrow">The festive edit</span>
            <SplitText className="rc-h1" text={'Dressed for\nevery *celebration*'} />
            <p className="rc-lead" style={{ marginTop: 18 }} data-reveal="up">
              Bandhgalas, suits and long kurtas for weddings, pujas and the evenings you’ll remember.
            </p>
            {editPicks.length > 0 && (
              <div className="rc-edit__products">
                {editPicks.map((p) => <ProductCard key={productId(p)} product={p} />)}
              </div>
            )}
            <Link to="/shop?category=Suits" className="rc-btn rc-btn--gold rc-btn--lg" data-magnetic="" style={{ marginTop: editPicks.length ? 0 : 28 }}>Explore festive</Link>
          </div>
        </div>
      </section>

      {/* ---------- Sticky story ---------- */}
      <section className="rc-section rc-cv">
        <div className="rc-container">
          <div className="rc-section-head">
            <div>
              <span className="rc-eyebrow">The craft</span>
              <SplitText className="rc-h2" text="Made with *intent*" />
            </div>
          </div>
          <StickyStory />
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
            {['/images/indowestern-men.jpg', '/images/tops-men.jpg', '/images/saree-men.jpg', '/images/clothing_rack_hero.png'].map((src, i) => (
              <Link key={src} to="/gallery" data-reveal="mask" data-cursor="View" style={{ '--d': `${i * 120}ms` } as React.CSSProperties} aria-label="Open the lookbook">
                <img {...responsiveImage(src, '(max-width: 1100px) 50vw, 25vw')} alt="" loading="lazy" />
              </Link>
            ))}
          </div>
        </div>
      </section>

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
