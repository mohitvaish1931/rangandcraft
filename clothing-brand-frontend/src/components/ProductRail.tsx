import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Product } from '../context/AppContext';
import ProductCard, { ProductCardSkeleton } from './ProductCard';
import { productId } from '../lib/format';

const DRAG_THRESHOLD = 6;

/** Horizontally scrolling product row with drag, arrows and a progress bar. */
const ProductRail = ({ products, loading = false, label }: { products: Product[]; loading?: boolean; label: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const drag = useRef<{ id: number; x: number; left: number; moved: boolean } | null>(null);
  // Set when a drag ends, so the click that follows it doesn't open a product.
  const swallowClick = useRef(false);

  // The progress bar is written straight to the DOM; React only re-renders when an arrow enables or disables.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = el.scrollWidth - el.clientWidth;
      const size = el.scrollWidth ? el.clientWidth / el.scrollWidth : 1;
      const start = max > 0 ? (el.scrollLeft / max) * (1 - size) : 0;
      if (barRef.current) {
        barRef.current.style.width = `${size * 100}%`;
        barRef.current.style.transform = `translateX(${(start / Math.max(size, 0.0001)) * 100}%)`;
      }
      setAtStart(el.scrollLeft < 4);
      setAtEnd(el.scrollLeft > max - 4);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { cancelAnimationFrame(frame); el.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, [products.length]);

  const page = (dir: number) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: 'smooth' });

  // Mouse drag only; touch and trackpads scroll natively.
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || !ref.current) return;
    drag.current = { id: e.pointerId, x: e.clientX, left: ref.current.scrollLeft, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    const el = ref.current;
    if (!d || !el) return;
    const dx = e.clientX - d.x;
    if (!d.moved) {
      if (Math.abs(dx) < DRAG_THRESHOLD) return; // a click with a shaky hand is still a click
      d.moved = true;
      el.classList.add('is-dragging');
      el.setPointerCapture(d.id);
    }
    el.scrollLeft = d.left - dx;
  };
  const endDrag = () => {
    const d = drag.current;
    drag.current = null;
    if (!d?.moved) return;
    ref.current?.classList.remove('is-dragging');
    swallowClick.current = true;
    window.setTimeout(() => { swallowClick.current = false; }, 0);
  };

  return (
    <div>
      <div
        ref={ref}
        className="rc-rail"
        role="region"
        aria-label={label}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={(e) => { if (swallowClick.current) { e.preventDefault(); e.stopPropagation(); } }}
        onDragStart={(e) => e.preventDefault()}
      >
        {loading && products.length === 0
          ? Array.from({ length: 5 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : products.map((p, i) => <ProductCard key={productId(p)} product={p} priority={i < 3} />)}
      </div>
      <div className="rc-rail-ui">
        <div className="rc-rail-ui__bar" aria-hidden>
          <span ref={barRef} />
        </div>
        <button type="button" className="rc-icon-btn" onClick={() => page(-1)} disabled={atStart} aria-label="Scroll left"><ArrowLeft size={18} /></button>
        <button type="button" className="rc-icon-btn" onClick={() => page(1)} disabled={atEnd} aria-label="Scroll right"><ArrowRight size={18} /></button>
      </div>
    </div>
  );
};

export default ProductRail;
