import { useEffect, useRef, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { getLenis } from '../lib/motion';

const R = 22;
const C = 2 * Math.PI * R;

const BackToTop = () => {
  const [visible, setVisible] = useState(false);
  const ring = useRef<SVGCircleElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      setVisible(window.scrollY > 700);
      if (ring.current) ring.current.style.strokeDashoffset = String(C * (1 - p));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(frame); };
  }, []);

  const toTop = () => {
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, { duration: 1.4 });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button type="button" className={`rc-totop${visible ? ' is-visible' : ''}`} onClick={toTop} aria-label="Back to top" tabIndex={visible ? 0 : -1}>
      <svg viewBox="0 0 50 50" className="rc-totop__svg" aria-hidden>
        <circle cx="25" cy="25" r={R} className="rc-totop__track" />
        <circle ref={ring} cx="25" cy="25" r={R} className="rc-totop__ring" style={{ strokeDasharray: C, strokeDashoffset: C }} />
      </svg>
      <ArrowUp size={16} />
    </button>
  );
};

export default BackToTop;
