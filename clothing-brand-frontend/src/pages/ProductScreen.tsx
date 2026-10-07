import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CalendarClock, Check, ChevronLeft, ChevronRight, Heart, Minus, Plus, RefreshCcw, Ruler, Share2, ShieldCheck, Truck, X } from 'lucide-react';
import { MAX_LINE_QUANTITY, useAppContext, type Product } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import ProductReviews from '../components/ProductReviews';
import Seo from '../components/Seo';
import { Stars } from '../components/StarRating';
import { API_ENDPOINTS } from '../utils/api';
import { getImageUrl, handleImageError, responsiveImage } from '../utils/mediaHelper';
import { discountPercent, formatPrice, productId } from '../lib/format';
import { isSoldOut } from '../lib/catalog';
import { useToast } from '../lib/toast';
import { whatsappLink } from '../lib/brand';
import NotFound from './NotFound';
import Lightbox from '../components/Lightbox';
import { flyToBag } from '../lib/flyToBag';
import { scrollToElement, useMediaQuery, useScrollLock } from '../lib/motion';
import { deliveryWindow } from '../lib/delivery';
import { getRecentlyViewed, rememberViewed } from '../lib/recentlyViewed';

const SIZE_CHART = [
  { size: 'S', chest: 36, waist: 32, hip: 38 },
  { size: 'M', chest: 38, waist: 34, hip: 40 },
  { size: 'L', chest: 40, waist: 36, hip: 42 },
  { size: 'XL', chest: 42, waist: 38, hip: 44 },
  { size: 'XXL', chest: 44, waist: 40, hip: 46 },
  { size: '4XL', chest: 48, waist: 44, hip: 50 },
  { size: '5XL', chest: 50, waist: 46, hip: 52 },
];

const Gallery = ({ images, name, onOpen }: { images: string[]; name: string; onOpen: (index: number) => void }) => {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const touchX = useRef<number | null>(null);
  const count = images.length;
  const go = (delta: number) => setIndex((i) => (i + delta + count) % count);

  return (
    <div className="rc-gallery">
      {count > 1 && (
        <div className="rc-gallery__thumbs">
          {images.map((img, i) => (
            <button key={img + i} type="button" className={i === index ? 'is-active' : ''} onClick={() => setIndex(i)} aria-label={`Show image ${i + 1}`}>
              <img src={getImageUrl(img, 160)} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
      <div>
        <div
          className={`rc-gallery__main${zoom ? ' is-zoomed' : ''}`}
          onClick={(e) => {
            if (window.matchMedia('(hover: none)').matches) { onOpen(index); return; }
            const r = e.currentTarget.getBoundingClientRect();
            setZoom(zoom ? null : { x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
          }}
          onMouseMove={(e) => {
            if (!zoom) return;
            const r = e.currentTarget.getBoundingClientRect();
            setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
          }}
          onMouseLeave={() => setZoom(null)}
          onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
            touchX.current = null;
          }}
        >
          <img
            {...responsiveImage(images[index], '100vw', 1080)}
            alt={`${name} — image ${index + 1} of ${count}`}
            fetchPriority={index === 0 ? 'high' : 'auto'}
            onError={handleImageError}
            style={zoom ? { transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
          />
          {count > 1 && (
            <>
              <button type="button" className="rc-icon-btn rc-gallery__nav rc-gallery__nav--prev" onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="Previous image"><ChevronLeft size={20} /></button>
              <button type="button" className="rc-icon-btn rc-gallery__nav rc-gallery__nav--next" onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="Next image"><ChevronRight size={20} /></button>
            </>
          )}
        </div>
        {count > 1 && (
          <div className="rc-gallery__dots">
            {images.map((_, i) => (
              <button key={i} type="button" className={i === index ? 'is-active' : ''} onClick={() => setIndex(i)} aria-label={`Show image ${i + 1}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const SizeGuide = ({ onClose }: { onClose: () => void }) => {
  useScrollLock(true);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="rc-modal" role="dialog" aria-modal="true" aria-labelledby="size-guide-title" onClick={onClose} data-lenis-prevent>
      <div className="rc-modal__panel" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="rc-icon-btn rc-modal__close" onClick={onClose} aria-label="Close size guide"><X size={20} /></button>
        <span className="rc-eyebrow">Fit guide</span>
        <h2 id="size-guide-title" className="rc-h3" style={{ marginTop: 8 }}>Size chart (inches)</h2>
        <table className="rc-size-table">
          <thead><tr><th>Size</th><th>Chest</th><th>Waist</th><th>Hip</th></tr></thead>
          <tbody>
            {SIZE_CHART.map((r) => (
              <tr key={r.size}><td><strong>{r.size}</strong></td><td>{r.chest}</td><td>{r.waist}</td><td>{r.hip}</td></tr>
            ))}
          </tbody>
        </table>
        <p className="rc-muted" style={{ fontSize: 13, marginTop: 16 }}>
          These are garment measurements. We recommend choosing a size about 2 inches larger than your body chest measurement for a comfortable fit.
          Still unsure? <a href={whatsappLink('Hi! I need help choosing a size.')} target="_blank" rel="noopener noreferrer">Ask us on WhatsApp</a>.
        </p>
      </div>
    </div>
  );
};

const ProductDetail = ({ id }: { id: string }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const { state, dispatch } = useAppContext();

  const cached = state.products.find((p) => productId(p) === id);
  const [product, setProduct] = useState<Product | null>(cached ?? null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing' | 'error'>(cached ? 'ready' : 'loading');
  const [chosenSize, setSize] = useState('');
  const [chosenColor, setColor] = useState('');
  const [qty, setQty] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [added, setAdded] = useState(false);
  const buyRef = useRef<HTMLDivElement>(null);
  const firstImageRef = useRef<HTMLButtonElement>(null);
  const isDesktop = useMediaQuery('(min-width: 901px)');
  // Read before this product is recorded, so it never lists itself.
  const [recentIds] = useState(getRecentlyViewed);

  useEffect(() => {
    let alive = true;
    fetch(`${API_ENDPOINTS.PRODUCTS}/${id}`)
      .then(async (res) => {
        if (!alive) return;
        if (res.status === 404) { setStatus('missing'); return; }
        if (!res.ok) throw new Error();
        const data = await res.json();
        setProduct({ ...data, id: data._id });
        setStatus('ready');
        rememberViewed(String(data._id));
      })
      .catch(() => alive && setStatus((s) => (s === 'ready' ? s : 'error')));
    return () => { alive = false; };
  }, [id]);

  useEffect(() => {
    const el = buyRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setStickyVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, [status]);

  const related = useMemo(() => {
    if (!product) return [];
    return state.products
      .filter((p) => productId(p) !== id && p.category === product.category && !isSoldOut(p))
      .slice(0, 4);
  }, [state.products, product, id]);

  const recent = useMemo(() => {
    const byId = new Map(state.products.map((p) => [productId(p), p]));
    const relatedIds = new Set(related.map(productId));
    return recentIds
      .filter((rid) => rid !== id && !relatedIds.has(rid))
      .map((rid) => byId.get(rid))
      .filter((p): p is Product => Boolean(p))
      .slice(0, 4);
  }, [state.products, recentIds, related, id]);

  const share = async () => {
    const url = `${window.location.origin}/product/${id}`;
    const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
    if (nav.share) {
      try { await nav.share({ title: product?.name, text: `${product?.name} from Rang and Craft`, url }); } catch { /* dismissed */ }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied');
    } catch {
      window.open(whatsappLink(`${product?.name}: ${url}`), '_blank', 'noopener');
    }
  };

  if (status === 'missing') return <NotFound />;

  if (!product) {
    return (
      <div className="rc-container" style={{ paddingBlock: 40 }}>
        {status === 'error' ? (
          <div className="rc-empty">
            <h1 className="rc-h3">We couldn’t load this product</h1>
            <p>Please check your connection and try again.</p>
            <button type="button" className="rc-btn" onClick={() => window.location.reload()}>Try again</button>
          </div>
        ) : (
          <div className="rc-pdp" aria-busy="true">
            <div className="rc-skeleton" style={{ aspectRatio: '4 / 5', borderRadius: 'var(--rc-radius-lg)' }} />
            <div style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
              <div className="rc-skeleton" style={{ height: 14, width: '30%' }} />
              <div className="rc-skeleton" style={{ height: 44, width: '80%' }} />
              <div className="rc-skeleton" style={{ height: 28, width: '25%' }} />
              <div className="rc-skeleton" style={{ height: 120 }} />
              <div className="rc-skeleton" style={{ height: 56 }} />
            </div>
          </div>
        )}
      </div>
    );
  }

  // A single available option is selected automatically.
  const size = chosenSize || (product.sizes?.length === 1 ? product.sizes[0] : '');
  const color = chosenColor || (product.colors?.length === 1 ? product.colors[0] : '');
  const images = [...new Set([product.image, ...(product.images || [])].filter(Boolean))];
  const soldOut = isSoldOut(product);
  const off = discountPercent(product.price, product.originalPrice);
  const stock = product.countInStock ?? MAX_LINE_QUANTITY;
  const maxQty = Math.max(1, Math.min(MAX_LINE_QUANTITY, stock));
  const needsSize = (product.sizes?.length ?? 0) > 0;
  const rating = product.rating || product.averageRating || 0;
  const reviewCount = product.numReviews || product.reviewCount || 0;
  const wished = state.wishlist.some((w) => productId(w) === id);
  const specs = (product.specifications || []).map((s, i) => {
    const [label, ...rest] = s.split(':');
    return rest.length ? [label.trim(), rest.join(':').trim()] : [`Detail ${i + 1}`, s];
  });

  const addToBag = (buyNow = false) => {
    if (needsSize && !size) {
      setSizeError(true);
      scrollToElement(document.getElementById('size-options'));
      toast.error('Please select a size first.');
      return;
    }
    dispatch({ type: 'ADD_TO_CART', payload: { product, quantity: qty, selectedSize: size, selectedColor: color, openDrawer: false } });
    if (buyNow) {
      navigate('/checkout');
      return;
    }
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
    const from = isDesktop ? firstImageRef.current : document.querySelector('.rc-gallery__main');
    flyToBag(getImageUrl(product.image, 400), from).then(() => dispatch({ type: 'TOGGLE_CART', payload: true }));
  };

  const canonical = `https://rangandcraft.store/product/${id}`;
  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: images.map((i) => (i.startsWith('http') ? i : `https://rangandcraft.store${i}`)),
    description: product.description,
    sku: id,
    category: product.category,
    brand: { '@type': 'Brand', name: 'Rang and Craft' },
    ...(reviewCount > 0 ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: rating, reviewCount } } : {}),
    offers: {
      '@type': 'Offer',
      url: canonical,
      priceCurrency: 'INR',
      price: product.price,
      itemCondition: 'https://schema.org/NewCondition',
      availability: soldOut ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
    },
  };

  return (
    <div className="rc-page--pdp">
      <Seo
        title={product.name}
        description={(product.description || `${product.name} by Rang and Craft.`).slice(0, 155)}
        path={`/product/${id}`}
        image={product.image}
        type="product"
        jsonLd={jsonLd}
      />

      <div className="rc-container" style={{ paddingBlock: '20px clamp(48px, 7vw, 88px)' }}>
        <ol className="rc-crumbs" aria-label="Breadcrumb" style={{ marginBottom: 20 }}>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/shop">Shop</Link></li>
          {product.category && <li><Link to={`/shop?category=${encodeURIComponent(product.category)}`}>{product.category}</Link></li>}
          <li aria-current="page" style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{product.name}</li>
        </ol>

        <div className="rc-pdp rc-pdp--stack">
          <div>
            {isDesktop ? (
            <div className="rc-stack">
              {images.map((img, i) => (
                <button key={img + i} ref={i === 0 ? firstImageRef : undefined} type="button" onClick={() => setLightbox(i)} data-cursor="Zoom" aria-label={`View image ${i + 1} full screen`} data-reveal={i === 0 ? undefined : 'fade'}>
                  <img {...responsiveImage(img, i === 0 ? '60vw' : '30vw', i === 0 ? 1280 : 720)} alt={i === 0 ? product.name : ''} loading={i < 2 ? 'eager' : 'lazy'} fetchPriority={i === 0 ? 'high' : 'auto'} onError={handleImageError} />
                </button>
              ))}
            </div>
            ) : (
            <div className="rc-pdp-mobile-gallery">
              <Gallery images={images.length ? images : ['']} name={product.name} onOpen={setLightbox} />
            </div>
            )}
          </div>

          <div className="rc-pdp__info">
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <span className="rc-eyebrow">{product.category}</span>
                <button type="button" className="rc-icon-btn" onClick={share} aria-label="Share this product" data-cursor="Share">
                  <Share2 size={18} strokeWidth={1.6} />
                </button>
              </div>
              <h1 className="rc-pdp__title" style={{ marginTop: 6 }}>{product.name}</h1>
              {reviewCount > 0 && (
                <a href="#reviews" className="rc-rating" style={{ marginTop: 10, textDecoration: 'none' }}>
                  <Stars value={rating} /> {rating.toFixed(1)} · {reviewCount} review{reviewCount === 1 ? '' : 's'}
                </a>
              )}
            </div>

            <div>
              <div className="rc-pdp__price">
                <span className="rc-price__now">{formatPrice(product.price)}</span>
                {off > 0 && (
                  <>
                    <span className="rc-price__was">MRP {formatPrice(product.originalPrice)}</span>
                    <span className="rc-tag rc-tag--sale">Save {off}%</span>
                  </>
                )}
              </div>
              <p className="rc-pdp__tax" style={{ marginTop: 6 }}>Inclusive of all taxes · Free shipping above ₹1499</p>
            </div>

            {soldOut ? (
              <div className="rc-alert rc-alert--info" style={{ flexDirection: 'column' }}>
                <strong>This piece is currently sold out.</strong>
                <span>Message us and we’ll let you know when it’s back.</span>
                <a className="rc-btn rc-btn--sm" style={{ marginTop: 8, alignSelf: 'flex-start' }} href={whatsappLink(`Hi! Please let me know when "${product.name}" is back in stock.`)} target="_blank" rel="noopener noreferrer">Notify me on WhatsApp</a>
              </div>
            ) : (
              <>
                {needsSize && (
                  <div className={`rc-option${sizeError ? ' has-error' : ''}`} id="size-options">
                    <div className="rc-option__head">
                      <span>Size: <strong>{size || 'Select a size'}</strong></span>
                      <button type="button" className="rc-link" style={{ fontSize: 12 }} onClick={() => setShowGuide(true)}><Ruler size={14} /> Size guide</button>
                    </div>
                    <div className="rc-swatches" role="radiogroup" aria-label="Size">
                      {product.sizes!.map((s) => (
                        <button key={s} type="button" role="radio" aria-checked={size === s} className={`rc-swatch${size === s ? ' is-active' : ''}`} onClick={() => { setSize(s); setSizeError(false); }}>
                          {s}
                        </button>
                      ))}
                    </div>
                    {sizeError && <p className="rc-field-error" style={{ marginTop: 8 }}>Please choose your size.</p>}
                  </div>
                )}

                {(product.colors?.length ?? 0) > 0 && (
                  <div className="rc-option">
                    <div className="rc-option__head"><span>Colour: <strong>{color || 'Select'}</strong></span></div>
                    <div className="rc-swatches" role="radiogroup" aria-label="Colour">
                      {product.colors!.map((c) => (
                        <button key={c} type="button" role="radio" aria-checked={color === c} className={`rc-swatch${color === c ? ' is-active' : ''}`} onClick={() => setColor(c)}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {stock > 0 && stock <= 5 && <span className="rc-stock-note">Only {stock} left — order soon</span>}

                <div ref={buyRef} style={{ display: 'grid', gap: 12 }}>
                  <div className="rc-buy-row">
                    <div className="rc-qty" role="group" aria-label="Quantity">
                      <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Decrease quantity"><Minus size={16} /></button>
                      <span aria-live="polite">{qty}</span>
                      <button type="button" onClick={() => setQty((q) => Math.min(maxQty, q + 1))} disabled={qty >= maxQty} aria-label="Increase quantity"><Plus size={16} /></button>
                    </div>
                    <button type="button" className={`rc-btn rc-btn--lg${added ? ' is-added' : ''}`} onClick={() => addToBag(false)} data-magnetic="">
                      {added ? <><Check size={18} className="rc-btn__check" /> Added</> : 'Add to bag'}
                    </button>
                    <button
                      type="button"
                      className={`rc-icon-btn rc-card__wish${wished ? ' is-active' : ''}`}
                      style={{ position: 'static', border: '1px solid var(--rc-line-strong)', width: 56, height: 56, borderRadius: 'var(--rc-radius-sm)' }}
                      onClick={() => dispatch(wished ? { type: 'REMOVE_FROM_WISHLIST', payload: id } : { type: 'ADD_TO_WISHLIST', payload: product })}
                      aria-pressed={wished}
                      aria-label={wished ? 'Remove from wishlist' : 'Save to wishlist'}
                    >
                      <Heart size={20} strokeWidth={1.6} />
                    </button>
                  </div>
                  <button type="button" className="rc-btn rc-btn--gold rc-btn--lg rc-btn--block" onClick={() => addToBag(true)}>Buy it now</button>
                </div>
              </>
            )}

            {!soldOut && (
              <p className="rc-delivery">
                <CalendarClock size={18} strokeWidth={1.5} aria-hidden />
                <span>Order today for delivery between <strong>{deliveryWindow().label}</strong></span>
              </p>
            )}

            <div className="rc-perks">
              <div className="rc-perk"><Truck size={20} strokeWidth={1.4} />Free shipping above ₹1499</div>
              <div className="rc-perk"><RefreshCcw size={20} strokeWidth={1.4} />7-day size exchange</div>
              <div className="rc-perk"><ShieldCheck size={20} strokeWidth={1.4} />Secure payments</div>
            </div>

            <div className="rc-accordion">
              <details open>
                <summary>Description <Plus size={18} /></summary>
                <div className="rc-accordion__body" style={{ whiteSpace: 'pre-line' }}>{product.description || 'Crafted in Jaipur.'}</div>
              </details>
              <details>
                <summary>Details & fabric <Plus size={18} /></summary>
                <div className="rc-accordion__body">
                  <table className="rc-spec-table">
                    <tbody>
                      <tr><td>Category</td><td>{product.category}</td></tr>
                      {(product.materials?.length ?? 0) > 0 && <tr><td>Fabric</td><td>{product.materials!.join(', ')}</td></tr>}
                      {specs.map(([label, value]) => <tr key={label + value}><td>{label}</td><td>{value}</td></tr>)}
                      {product.weight && <tr><td>Weight</td><td>{product.weight}</td></tr>}
                    </tbody>
                  </table>
                </div>
              </details>
              <details>
                <summary>Care <Plus size={18} /></summary>
                <div className="rc-accordion__body">
                  {(product.careInstructions?.length ?? 0) > 0 ? (
                    <ul className="rc-bullets">{product.careInstructions!.map((c) => <li key={c}>{c}</li>)}</ul>
                  ) : (
                    <p>Gentle hand wash in cold water with mild detergent, dry in shade and iron on the reverse to keep prints vibrant. <Link to="/care-guide">Full care guide</Link>.</p>
                  )}
                </div>
              </details>
              <details>
                <summary>Shipping & exchanges <Plus size={18} /></summary>
                <div className="rc-accordion__body">
                  <p>Shipping is free on orders of ₹1499 and above, and a flat ₹70 below that. Orders are dispatched within 2–3 working days and delivered in 4–8 working days. Wrong size? We offer a 7-day size exchange on unworn pieces with original tags attached.</p>
                  <p style={{ marginTop: 8 }}><Link to="/shipping-policy">Shipping policy</Link> · <Link to="/refund-policy">Exchanges & refunds</Link></p>
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>

      <section id="reviews" className="rc-section rc-section--tint">
        <div className="rc-container">
          <ProductReviews productId={id} productName={product.name} />
        </div>
      </section>

      {related.length > 0 && (
        <section className="rc-section">
          <div className="rc-container">
            <div className="rc-section-head">
              <div><span className="rc-eyebrow">You may also like</span><h2 className="rc-h2">More from {product.category}</h2></div>
            </div>
            <div className="rc-grid">{related.map((p) => <ProductCard key={productId(p)} product={p} />)}</div>
          </div>
        </section>
      )}

      {recent.length > 0 && (
        <section className="rc-section rc-section--tint">
          <div className="rc-container">
            <div className="rc-section-head">
              <div><span className="rc-eyebrow">Pick up where you left off</span><h2 className="rc-h2">Recently viewed</h2></div>
            </div>
            <div className="rc-grid">{recent.map((p) => <ProductCard key={productId(p)} product={p} />)}</div>
          </div>
        </section>
      )}

      {!soldOut && (
        <div className={`rc-sticky-buy${stickyVisible ? ' is-visible' : ''}`} aria-hidden={!stickyVisible}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</div>
            <strong style={{ fontWeight: 500 }}>{formatPrice(product.price)}</strong>
          </div>
          <button type="button" className="rc-btn" onClick={() => addToBag(false)} tabIndex={stickyVisible ? 0 : -1}>
            {needsSize && !size ? 'Select size' : 'Add to bag'}
          </button>
        </div>
      )}

      {showGuide && <SizeGuide onClose={() => setShowGuide(false)} />}
      {lightbox !== null && <Lightbox images={images} start={lightbox} alt={product.name} onClose={() => setLightbox(null)} />}
    </div>
  );
};

// Keyed by id so every selection resets when moving between products.
const ProductScreen = () => {
  const { id = '' } = useParams();
  return <ProductDetail key={id} id={id} />;
};

export default ProductScreen;
