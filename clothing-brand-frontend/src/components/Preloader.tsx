import { useEffect, useState } from 'react';
import { hasFinePointer, prefersReducedMotion } from '../lib/motion';
import logoImg from '../assets/logo.png';

const KEY = 'rc_intro_seen';

const shouldShow = () => {
  try {
    return hasFinePointer() && !prefersReducedMotion() && !sessionStorage.getItem(KEY) && !window.location.pathname.startsWith('/admin');
  } catch {
    return false;
  }
};

/** A short brand intro, shown once per browser session on desktop (never on phones, where speed matters most). */
const Preloader = () => {
  const [phase, setPhase] = useState<'in' | 'out' | 'done'>(() => (shouldShow() ? 'in' : 'done'));

  useEffect(() => {
    if (phase === 'done') {
      document.documentElement.classList.remove('rc-is-loading');
      return;
    }
    document.documentElement.classList.add('rc-is-loading');
    try { sessionStorage.setItem(KEY, '1'); } catch { /* ignore */ }
    const out = window.setTimeout(() => setPhase('out'), 950);
    const done = window.setTimeout(() => setPhase('done'), 1750);
    return () => { window.clearTimeout(out); window.clearTimeout(done); };
  }, [phase]);

  if (phase === 'done') return null;
  return (
    <div className={`rc-preloader${phase === 'out' ? ' is-out' : ''}`} aria-hidden>
      <div className="rc-preloader__inner">
        <img src={logoImg} alt="" width={74} height={72} />
        <div className="rc-preloader__word">
          {'Rang & Craft'.split('').map((c, i) => (
            <span key={i} style={{ '--i': i } as React.CSSProperties}>{c === ' ' ? ' ' : c}</span>
          ))}
        </div>
        <div className="rc-preloader__bar"><span /></div>
      </div>
    </div>
  );
};

export default Preloader;
