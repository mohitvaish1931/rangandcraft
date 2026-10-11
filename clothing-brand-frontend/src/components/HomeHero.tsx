import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import SplitText from './SplitText';
import type { Look, Slide } from '../lib/media';
import { useMediaQuery } from '../lib/motion';
import { croppedImage, responsiveImage } from '../utils/mediaHelper';
import logoImg from '../assets/logo.png';

const DEFAULT_COPY = {
  eyebrow: 'The Jaipur Edit',
  title: 'Jaipur prints,\n*everyday ease.*',
  text: 'Hand block printed cotton kurtas and shirts, made in Jaipur.',
  offer: 'Any 2 short kurtas for ₹1499',
};
const SLIDE_MS = 7000;

const CtaLink = ({ to, className, children }: { to: string; className: string; children: React.ReactNode }) =>
  /^https:\/\//i.test(to)
    ? <a href={to} className={className} target="_blank" rel="noopener noreferrer">{children}</a>
    : <Link to={to} className={className}>{children}</Link>;

interface Props {
  /** Admin hero slides; null while they load. */
  slides: Slide[] | null;
  /** Product photos used when there are no slides. */
  looks: Look[];
}

/**
 * Homepage hero. Shows the admin's slides as a crossfading slideshow; without
 * slides it builds a three-photo collage from the catalogue (one photo on
 * phones). Copy falls back to the defaults whenever a slide leaves it blank.
 */
const HomeHero = ({ slides, looks }: Props) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  // Autoplay only stops when nobody can see it (scrolled away or tab hidden) or a
  // keyboard user is inside it; hovering never freezes it.
  const [onScreen, setOnScreen] = useState(true);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const tabVisible = useSyncExternalStore(
    (cb) => { document.addEventListener('visibilitychange', cb); return () => document.removeEventListener('visibilitychange', cb); },
    () => document.visibilityState === 'visible',
    () => true,
  );
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const list = slides ?? [];
  const count = list.length;
  const slide = count ? list[index % count] : undefined;
  const paused = !onScreen || !tabVisible || keyboardFocus;

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || count < 2) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, [count]);

  useEffect(() => {
    if (count < 2 || paused || reduceMotion) return;
    const t = window.setTimeout(() => setIndex((i) => (i + 1) % count), SLIDE_MS);
    return () => window.clearTimeout(t);
  }, [count, index, paused, reduceMotion]);

  const copy = {
    eyebrow: slide?.eyebrow || DEFAULT_COPY.eyebrow,
    title: slide?.title || DEFAULT_COPY.title,
    text: slide ? slide.text || '' : DEFAULT_COPY.text,
    offer: slide ? '' : DEFAULT_COPY.offer,
  };
  const cta = { label: slide?.ctaLabel || 'Shop the collection', to: slide?.ctaLink || '/shop' };

  return (
    <section
      ref={sectionRef}
      className="rc-hero rc-hero--home"
      aria-roledescription={count > 1 ? 'carousel' : undefined}
      aria-label="Featured"
      onFocus={(e) => setKeyboardFocus(e.target.matches(':focus-visible'))}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setKeyboardFocus(false); }}
    >
      <div className="rc-hero__media">
        <div className="rc-plx">
          {count > 0 ? (
            list.map((s, i) => (
              <picture key={s._id} className={`rc-hero__slide${i === index % count ? ' is-current' : ''}`}>
                <source media="(max-width: 640px)" {...croppedImage(s.image, '4:5')} />
                <img
                  {...responsiveImage(s.image, '100vw', 1920)}
                  alt=""
                  fetchPriority={i === 0 ? 'high' : 'auto'}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                />
              </picture>
            ))
          ) : (
            slides !== null && looks.length > 0 && (
              <div className={`rc-hero__frames rc-hero__frames--${Math.min(looks.length, 3)}`}>
                {looks.slice(0, 3).map((l, i) => (
                  <div className="rc-hero__frame" key={l.src} style={{ '--i': i } as React.CSSProperties}>
                    <img
                      {...responsiveImage(l.src, '(max-width: 900px) 100vw, 34vw', 960)}
                      alt=""
                      fetchPriority={i === 0 ? 'high' : 'auto'}
                      decoding="async"
                    />
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
      <span className="rc-hero__side" aria-hidden>Rang &amp; Craft — Jaipur, Rajasthan</span>
      <div className="rc-container rc-hero__layout">
        <div key={slide?._id ?? 'default'} className="rc-hero__copy">
          <span className="rc-eyebrow rc-rise rc-rise--1">{copy.eyebrow}</span>
          <SplitText as="h1" className="rc-hero__title" text={copy.title} delay={150} soft />
        </div>
        <div className="rc-hero__foot">
          <div>
            {(copy.text || copy.offer) && (
              <p className="rc-hero__text rc-rise rc-rise--3" key={`t-${slide?._id ?? 'default'}`}>
                {copy.text}
                {copy.offer && <><br /><span className="rc-hero__offer">{copy.offer}</span></>}
              </p>
            )}
            <div className="rc-hero__actions rc-rise rc-rise--4">
              <CtaLink to={cta.to} className="rc-btn rc-btn--light rc-btn--lg">{cta.label}</CtaLink>
              <Link to="/shop?sort=newest" className="rc-btn rc-btn--ghost-light rc-btn--lg">New arrivals</Link>
            </div>
          </div>
          <div className="rc-hero__aside rc-rise rc-rise--4">
            {count > 1 ? (
              <div className="rc-hero__dots" role="group" aria-label="Choose slide">
                {list.map((s, i) => (
                  <button
                    key={s._id}
                    type="button"
                    className={i === index % count ? 'is-active' : ''}
                    aria-label={`Show slide ${i + 1} of ${count}`}
                    aria-current={i === index % count}
                    onClick={() => setIndex(i)}
                    style={{ '--slide-ms': `${SLIDE_MS}ms` } as React.CSSProperties}
                    data-paused={paused || reduceMotion ? '' : undefined}
                  />
                ))}
              </div>
            ) : (
              <div className="rc-scroll-cue" aria-hidden><i />Scroll</div>
            )}
            <div className="rc-badge-spin" aria-hidden>
              <svg viewBox="0 0 132 132">
                <defs><path id="rc-circle" d="M66,66 m-54,0 a54,54 0 1,1 108,0 a54,54 0 1,1 -108,0" /></defs>
                <text><textPath href="#rc-circle">Rang &amp; Craft • Made in Jaipur • Printed by hand •</textPath></text>
              </svg>
              <img src={logoImg} alt="" width={38} height={37} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeHero;
