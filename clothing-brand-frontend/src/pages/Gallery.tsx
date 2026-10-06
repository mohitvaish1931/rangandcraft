import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import Seo from '../components/Seo';
import { getImageUrl } from '../utils/mediaHelper';

const EDITORIAL = [
  '/images/hero-banner.webp',
  '/images/kurta-men.jpg',
  '/images/suits-men.jpg',
  '/images/indowestern-men.jpg',
  '/images/tops-men.jpg',
  '/images/saree-men.jpg',
  '/images/heritage-edit-men.jpg',
  '/images/clothing_rack_hero.webp',
];

const Gallery = () => {
  const { state } = useAppContext();
  const [open, setOpen] = useState<number | null>(null);

  const images = useMemo(() => {
    const productImages = state.products.flatMap((p) => p.images?.length ? p.images.slice(0, 2) : [p.image]).filter(Boolean);
    return [...new Set([...EDITORIAL, ...productImages])].slice(0, 36);
  }, [state.products]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight') setOpen((i) => (i! + 1) % images.length);
      if (e.key === 'ArrowLeft') setOpen((i) => (i! - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, images.length]);

  return (
    <>
      <Seo title="Gallery" description="A look at Rang and Craft menswear, crafted in Jaipur." path="/gallery" />
      <header className="rc-page-head">
        <div className="rc-container">
          <span className="rc-eyebrow">Lookbook</span>
          <h1 className="rc-h1">Gallery</h1>
          <p className="rc-lead">Moments, textures and colours from our Jaipur collections.</p>
        </div>
      </header>
      <div className="rc-container rc-section" style={{ paddingTop: 40 }}>
        <div style={{ columns: '3 260px', columnGap: 16 }}>
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setOpen(i)}
              style={{ display: 'block', width: '100%', marginBottom: 16, padding: 0, border: 0, borderRadius: 12, overflow: 'hidden', cursor: 'zoom-in', breakInside: 'avoid', background: 'var(--rc-sand)' }}
              aria-label={`Open image ${i + 1}`}
            >
              <img src={getImageUrl(src, 600)} alt="" loading="lazy" style={{ width: '100%', display: 'block' }} />
            </button>
          ))}
        </div>
      </div>

      {open !== null && (
        <div className="rc-modal" role="dialog" aria-modal="true" aria-label="Image viewer" onClick={() => setOpen(null)} style={{ background: 'rgba(10,9,8,0.92)' }}>
          <img src={getImageUrl(images[open], 1400)} alt="" style={{ maxWidth: '92vw', maxHeight: '88vh', objectFit: 'contain', borderRadius: 8 }} onClick={(e) => e.stopPropagation()} />
          <button type="button" className="rc-icon-btn" style={{ position: 'fixed', top: 16, right: 16, color: '#fff' }} onClick={() => setOpen(null)} aria-label="Close"><X size={24} /></button>
          <button type="button" className="rc-icon-btn" style={{ position: 'fixed', left: 12, top: '50%', color: '#fff' }} onClick={(e) => { e.stopPropagation(); setOpen((open - 1 + images.length) % images.length); }} aria-label="Previous"><ChevronLeft size={28} /></button>
          <button type="button" className="rc-icon-btn" style={{ position: 'fixed', right: 12, top: '50%', color: '#fff' }} onClick={(e) => { e.stopPropagation(); setOpen((open + 1) % images.length); }} aria-label="Next"><ChevronRight size={28} /></button>
        </div>
      )}
    </>
  );
};

export default Gallery;
