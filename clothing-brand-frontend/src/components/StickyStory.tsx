import { useEffect, useRef, useState } from 'react';
import { responsiveImage } from '../utils/mediaHelper';

const STEPS = [
  { title: 'Designed in Jaipur', text: 'Every collection begins in the Pink City — its colours, arches and centuries of craft shape each print and silhouette.', image: '/images/heritage-edit-men.jpg' },
  { title: 'Chosen for comfort', text: 'Breathable fabrics that keep you cool through long Indian summers, and still look sharp at the evening’s celebration.', image: '/images/kurta-men.jpg' },
  { title: 'Made to last', text: 'Considered details and timeless quality, so every piece earns its place in your wardrobe — season after season.', image: '/images/suits-men.jpg' },
];

/** Pinned image that changes as each chapter of text scrolls past. */
const StickyStory = () => {
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

  return (
    <div className="rc-sticky-story">
      <div className="rc-sticky-story__media">
        {STEPS.map((s, i) => <img key={s.image} {...responsiveImage(s.image, '(max-width: 900px) 100vw, 50vw')} alt="" className={i === active ? 'is-current' : ''} loading="lazy" />)}
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
