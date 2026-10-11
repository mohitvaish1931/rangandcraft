import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { prefersReducedMotion, scrollToTop } from '../lib/motion';

/**
 * Site-wide motion engine, kept off the scroll path so scrolling stays on the
 * browser's own (compositor) thread and every click lands where it's aimed:
 *  - [data-reveal]    → gets .is-in once scrolled into view
 *  - [data-highlight] → words light up as the block scrolls past
 * Parallax is pure CSS (scroll-driven animations), see .rc-plx in motion.css.
 */
const MotionProvider = () => {
  const { pathname } = useLocation();

  useEffect(() => { scrollToTop(); }, [pathname]);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    if (!reduced) document.documentElement.classList.add('rc-motion');

    const revealIO = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in', 'revealed'); revealIO.unobserve(e.target); }
      }),
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
    );

    const active = new Set<HTMLElement>();
    const trackIO = new IntersectionObserver(
      (entries) => entries.forEach((e) => (e.isIntersecting ? active.add(e.target as HTMLElement) : active.delete(e.target as HTMLElement))),
      { rootMargin: '10% 0px 10% 0px' }
    );

    const seen = new WeakSet<Element>();
    const scan = () => {
      document.querySelectorAll('[data-reveal]:not(.is-in), .reveal-on-scroll:not(.revealed)').forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        if (reduced) el.classList.add('is-in', 'revealed');
        else revealIO.observe(el);
      });
      if (!reduced) {
        document.querySelectorAll('[data-highlight]').forEach((el) => {
          if (seen.has(el)) return;
          seen.add(el);
          trackIO.observe(el);
        });
      }
    };

    // Only the highlighted statement needs per-frame work, and only while it's on screen.
    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      active.forEach((el) => {
        const r = el.getBoundingClientRect();
        const progress = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
        const words = el.querySelectorAll<HTMLElement>('.rc-hl-word');
        const lit = Math.round(progress * words.length);
        words.forEach((w, i) => w.classList.toggle('is-lit', i < lit));
      });
    };
    const onScroll = () => { if (!frame && active.size) frame = requestAnimationFrame(update); };

    scan();
    update();
    // Batch DOM changes (route renders produce many mutations) into one scan.
    let scanTimer = 0;
    const mo = new MutationObserver(() => {
      if (scanTimer) return;
      scanTimer = window.setTimeout(() => { scanTimer = 0; scan(); onScroll(); }, 150);
    });
    mo.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      revealIO.disconnect();
      trackIO.disconnect();
      mo.disconnect();
      window.clearTimeout(scanTimer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
      document.documentElement.classList.remove('rc-motion');
    };
  }, []);

  return null;
};

export default MotionProvider;
