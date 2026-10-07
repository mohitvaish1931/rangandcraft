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

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.step)); }),
      { rootMargin: '-45% 0px -45% 0px' }
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="rc-sticky-story">
      <div className="rc-sticky-story__media">
        {STEPS.map((s, i) => <img key={s.image} {...responsiveImage(s.image, '(max-width: 900px) 100vw, 50vw')} alt="" className={i === active ? 'is-current' : ''} loading="lazy" />)}
        <span className="rc-sticky-story__counter">0{active + 1} / 0{STEPS.length}</span>
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
