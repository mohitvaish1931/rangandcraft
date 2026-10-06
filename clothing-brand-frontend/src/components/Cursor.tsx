import { useEffect, useRef, useState } from 'react';
import { hasFinePointer, prefersReducedMotion } from '../lib/motion';

/**
 * A soft follower that appears with a label ("View", "Drag", "Zoom") over
 * elements marked with data-cursor. The native cursor stays everywhere else.
 */
const Cursor = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled] = useState(() => hasFinePointer() && !prefersReducedMotion());
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current!;
    document.documentElement.classList.add('rc-has-cursor');
    let x = -100, y = -100, tx = -100, ty = -100, frame = 0;

    const loop = () => {
      x += (tx - x) * 0.2;
      y += (ty - y) * 0.2;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      frame = requestAnimationFrame(loop);
    };
    const onMove = (e: PointerEvent) => {
      tx = e.clientX; ty = e.clientY;
      const zone = (e.target as Element).closest<HTMLElement>('[data-cursor]');
      setLabel(zone?.dataset.cursor ?? '');
    };
    const onLeave = () => setLabel('');
    frame = requestAnimationFrame(loop);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(frame);
      document.documentElement.classList.remove('rc-has-cursor');
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div ref={ref} className={`rc-cursor${label ? ' is-active' : ''}`} aria-hidden>
      <span>{label}</span>
    </div>
  );
};

export default Cursor;
