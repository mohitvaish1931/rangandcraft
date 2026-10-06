import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Product } from '../context/AppContext';
import ProductCard, { ProductCardSkeleton } from './ProductCard';
import { productId } from '../lib/format';

/** Horizontally scrolling product row with drag, arrows and a progress bar. */
const ProductRail = ({ products, loading = false, label }: { products: Product[]; loading?: boolean; label: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState({ start: 0, size: 1, atStart: true, atEnd: false });
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      const size = el.scrollWidth ? el.clientWidth / el.scrollWidth : 1;
      setProgress({ start: max > 0 ? (el.scrollLeft / max) * (1 - size) : 0, size, atStart: el.scrollLeft < 4, atEnd: el.scrollLeft > max - 4 });
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { el.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, [products.length]);

  const page = (dir: number) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: 'smooth' });

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || !ref.current) return;
    drag.current = { x: e.clientX, left: ref.current.scrollLeft, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || !ref.current) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 5) {
      d.moved = true;
      ref.current.classList.add('is-dragging');
    }
    ref.current.scrollLeft = d.left - dx;
  };
  const endDrag = () => {
    ref.current?.classList.remove('is-dragging');
    drag.current = null;
  };

  return (
    <div>
      <div
        ref={ref}
        className="rc-rail"
        role="region"
        aria-label={label}
        data-cursor="Drag"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onClickCapture={(e) => { if (drag.current?.moved) e.preventDefault(); }}
        onDragStart={(e) => e.preventDefault()}
      >
        {loading && products.length === 0
          ? Array.from({ length: 5 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : products.map((p, i) => <ProductCard key={productId(p)} product={p} priority={i < 3} />)}
      </div>
      <div className="rc-rail-ui">
        <div className="rc-rail-ui__bar" aria-hidden>
          <span style={{ width: `${progress.size * 100}%`, transform: `translateX(${(progress.start / Math.max(progress.size, 0.0001)) * 100}%)` }} />
        </div>
        <button type="button" className="rc-icon-btn" onClick={() => page(-1)} disabled={progress.atStart} aria-label="Scroll left"><ArrowLeft size={18} /></button>
        <button type="button" className="rc-icon-btn" onClick={() => page(1)} disabled={progress.atEnd} aria-label="Scroll right"><ArrowRight size={18} /></button>
      </div>
    </div>
  );
};

export default ProductRail;
