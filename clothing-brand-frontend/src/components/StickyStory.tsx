import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Look } from '../lib/media';
import { productId } from '../lib/format';
import { responsiveImage } from '../utils/mediaHelper';

const STEPS = [
  { title: 'Designed in Jaipur', text: 'Every collection begins in the Pink City — its colours, arches and centuries of craft shape each print and silhouette.' },
  { title: 'Printed by hand', text: 'Each print is stamped onto breathable cotton with carved wooden blocks, so small variations make every piece your own.' },
  { title: 'Made to be worn', text: 'Soft fabrics, considered fits and honest prices — pieces that earn their place in your everyday wardrobe.' },
];

/** Pinned photo that changes as each chapter of text scrolls past. Photos are close-ups from the catalogue. */
const StickyStory = ({ looks }: { looks: Look[] }) => {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  // The current chapter is the last one whose heading has passed 60% of the
  // viewport, so the final chapter still activates near the end of the section.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.6;
      let current = 0;
      refs.current.forEach((el, i) => { if (el && el.getBoundingClientRect().top < line) current = i; });
      setActive(current);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const current = looks.length ? looks[active % looks.length] : undefined;

  return (
    <div className="rc-sticky-story">
      <div className="rc-sticky-story__media">
        {looks.map((l, i) => (
          <img key={l.src} {...responsiveImage(l.src, '(max-width: 900px) 100vw, 50vw', 960)} alt="" className={i === active % looks.length ? 'is-current' : ''} loading="lazy" />
        ))}
        {current && (
          <Link to={`/product/${productId(current.product)}`} className="rc-sticky-story__tag">
            {current.product.name}
          </Link>
        )}
        <span className="rc-sticky-story__counter" aria-hidden>0{active + 1} <i>/</i> 0{STEPS.length}</span>
      </div>
      <div>
        {STEPS.map((s, i) => (
          <div key={s.title} ref={(el) => { refs.current[i] = el; }} data-step={i} className={`rc-step${i === active ? ' is-active' : ''}`}>
            <span className="rc-step__num">0{i + 1}</span>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StickyStory;
