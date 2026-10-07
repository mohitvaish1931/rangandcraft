import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import { hasFinePointer, prefersReducedMotion, scrollToTop, setLenis } from '../lib/motion';

/**
 * Site-wide motion engine:
 *  - Lenis smooth scrolling (desktop, motion allowed)
 *  - [data-reveal]  → gets .is-in when scrolled into view
 *  - [data-parallax="0.2"] → translates with scroll via --py
 *  - [data-highlight] → words light up as the block scrolls past (--hl)
 *  - [data-magnetic] → buttons drift toward the pointer
 */
const MotionProvider = () => {
  const { pathname } = useLocation();

  // Smooth scrolling.
  useEffect(() => {
    if (prefersReducedMotion() || !hasFinePointer()) return;
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, autoRaf: true, anchors: { offset: -140 } });
    setLenis(lenis);
    document.documentElement.classList.add('rc-smooth');
    return () => {
      lenis.destroy();
      setLenis(null);
      document.documentElement.classList.remove('rc-smooth');
    };
  }, []);

  useEffect(() => { scrollToTop(); }, [pathname]);

  // Reveals, parallax and highlights.
  useEffect(() => {
    const reduced = prefersReducedMotion();
    const revealIO = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in', 'revealed'); revealIO.unobserve(e.target); }
      }),
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
    );

    const active = new Set<HTMLElement>();
    const trackIO = new IntersectionObserver(
      (entries) => entries.forEach((e) => (e.isIntersecting ? active.add(e.target as HTMLElement) : active.delete(e.target as HTMLElement))),
      { rootMargin: '20% 0px 20% 0px' }
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
        document.querySelectorAll('[data-parallax], [data-highlight]').forEach((el) => {
          if (seen.has(el)) return;
          seen.add(el);
          trackIO.observe(el);
        });
      }
    };

    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      active.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (el.dataset.parallax) {
          const speed = parseFloat(el.dataset.parallax) || 0.15;
          const offset = (r.top + r.height / 2 - vh / 2) * -speed;
          el.style.setProperty('--py', `${offset.toFixed(1)}px`);
        }
        if (el.dataset.highlight !== undefined) {
          const progress = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
          el.style.setProperty('--hl', progress.toFixed(3));
          const words = el.querySelectorAll<HTMLElement>('.rc-hl-word');
          const lit = Math.round(progress * words.length);
          words.forEach((w, i) => w.classList.toggle('is-lit', i < lit));
        }
      });
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };

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
    };
  }, []);

  // Magnetic buttons.
  useEffect(() => {
    if (prefersReducedMotion() || !hasFinePointer()) return;
    let current: HTMLElement | null = null;
    const onMove = (e: PointerEvent) => {
      const el = (e.target as Element).closest<HTMLElement>('[data-magnetic]');
      if (current && current !== el) { current.style.transform = ''; current = null; }
      if (!el) return;
      current = el;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) * 0.25;
      const y = (e.clientY - (r.top + r.height / 2)) * 0.35;
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    };
    const onLeave = () => { if (current) { current.style.transform = ''; current = null; } };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return null;
};

export default MotionProvider;
