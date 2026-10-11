import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import Seo from '../components/Seo';
import { categoriesOf } from '../lib/catalog';
import { productId } from '../lib/format';
import { allLooks } from '../lib/media';
import { useScrollLock } from '../lib/motion';
import { responsiveImage } from '../utils/mediaHelper';

const PAGE = 24;

const Gallery = () => {
  const { state } = useAppContext();
  const [category, setCategory] = useState('');
  const [shown, setShown] = useState(PAGE);
  const [open, setOpen] = useState<number | null>(null);
  const loading = state.productsStatus === 'idle' || state.productsStatus === 'loading';

  const categories = useMemo(() => categoriesOf(state.products), [state.products]);
  const looks = useMemo(
    () => allLooks(category ? state.products.filter((p) => p.category === category) : state.products),
    [state.products, category],
  );
  const visible = looks.slice(0, shown);
  const current = open !== null ? looks[open] : null;
  useScrollLock(open !== null);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight') setOpen((i) => (i! + 1) % looks.length);
      if (e.key === 'ArrowLeft') setOpen((i) => (i! - 1 + looks.length) % looks.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, looks.length]);

  const choose = (c: string) => {
    setCategory(c);
    setShown(PAGE);
  };

  return (
    <>
      <Seo
        title="Lookbook"
        description="Every Rang and Craft piece, photographed in Jaipur: hand block printed cotton short kurtas and shirts for men."
        path="/gallery"
        image={looks[0]?.src}
      />
      <header className="rc-page-head">
        <div className="rc-container">
          <span className="rc-eyebrow">Lookbook</span>
          <h1 className="rc-h1">Gallery</h1>
          <p className="rc-lead">Every piece in the collection, photographed in Jaipur. Tap a photo to see it up close.</p>
        </div>
      </header>

      <div className="rc-container rc-section" style={{ paddingTop: 32 }}>
        {categories.length > 1 && (
          <div className="rc-chips" role="group" aria-label="Filter by category">
            <button type="button" className={`rc-chip${category === '' ? ' is-active' : ''}`} aria-pressed={category === ''} onClick={() => choose('')}>
              All <span>{state.products.reduce((n, p) => n + (p.images?.length || (p.image ? 1 : 0)), 0)}</span>
            </button>
            {categories.map((c) => (
              <button key={c.name} type="button" className={`rc-chip${category === c.name ? ' is-active' : ''}`} aria-pressed={category === c.name} onClick={() => choose(c.name)}>
                {c.name}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="rc-gallery-grid" aria-busy="true" aria-label="Loading photos">
            {Array.from({ length: 9 }, (_, i) => <span key={i} className="rc-skeleton rc-gallery-grid__skel" />)}
          </div>
        ) : looks.length === 0 ? (
          <p className="rc-muted">New photos are on their way. <Link to="/shop" className="rc-link">Shop the collection <ArrowRight size={14} /></Link></p>
        ) : (
          <>
            <div className="rc-gallery-grid">
              {visible.map((l, i) => (
                <button key={`${l.src}-${i}`} type="button" className="rc-gallery-grid__item" onClick={() => setOpen(i)} aria-label={`Open photo of ${l.product.name}`}>
                  <img {...responsiveImage(l.src, '(max-width: 640px) 50vw, 33vw', 600)} alt={l.product.name} loading="lazy" decoding="async" />
                  <span className="rc-gallery-grid__cap">{l.product.name}</span>
                </button>
              ))}
            </div>
            {shown < looks.length && (
              <div style={{ textAlign: 'center', marginTop: 32 }}>
                <button type="button" className="rc-btn rc-btn--outline rc-btn--lg" onClick={() => setShown((n) => n + PAGE)}>
                  Show more photos <span className="rc-muted" style={{ marginLeft: 6 }}>({looks.length - shown} more)</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {current && open !== null && (
        <div className="rc-lightbox" role="dialog" aria-modal="true" aria-label={current.product.name} onClick={() => setOpen(null)} data-lenis-prevent>
          <img key={current.src} src={responsiveImage(current.src, '100vw', 1600).src} alt={current.product.name} onClick={(e) => e.stopPropagation()} />
          <div className="rc-lightbox__caption" onClick={(e) => e.stopPropagation()}>
            <span>{current.product.name}</span>
            <Link to={`/product/${productId(current.product)}`} className="rc-btn rc-btn--light">View product</Link>
          </div>
          <div className="rc-lightbox__count">{open + 1} / {looks.length}</div>
          <button type="button" className="rc-icon-btn rc-lightbox__close" onClick={() => setOpen(null)} aria-label="Close"><X size={24} /></button>
          {looks.length > 1 && (
            <>
              <button type="button" className="rc-icon-btn rc-lightbox__nav rc-lightbox__nav--prev" onClick={(e) => { e.stopPropagation(); setOpen((open - 1 + looks.length) % looks.length); }} aria-label="Previous photo"><ChevronLeft size={28} /></button>
              <button type="button" className="rc-icon-btn rc-lightbox__nav rc-lightbox__nav--next" onClick={(e) => { e.stopPropagation(); setOpen((open + 1) % looks.length); }} aria-label="Next photo"><ChevronRight size={28} /></button>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default Gallery;
