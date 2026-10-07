import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { getImageUrl, responsiveImage } from '../utils/mediaHelper';
import { FALLBACK_IMAGES } from '../lib/brand';

interface Category { name: string; count: number; image?: string }

/** Large editorial category index; an image follows the pointer on hover. */
const CategoryList = ({ categories }: { categories: Category[] }) => {
  const floatRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState<number | null>(null);
  const images = categories.map((c, i) => (c.image ? getImageUrl(c.image, 480) : responsiveImage(FALLBACK_IMAGES[i % FALLBACK_IMAGES.length]).src.replace('.webp', '-640.webp')));

  const onMove = (e: React.MouseEvent) => {
    if (floatRef.current) {
      floatRef.current.style.left = `${e.clientX}px`;
      floatRef.current.style.top = `${e.clientY}px`;
    }
  };

  return (
    <div className="rc-catlist" onMouseMove={onMove} onMouseLeave={() => setCurrent(null)}>
      {categories.map((c, i) => (
        <Link
          key={c.name}
          to={`/shop?category=${encodeURIComponent(c.name)}`}
          className="rc-catlist__row"
          onMouseEnter={() => setCurrent(i)}
          data-reveal="up"
          style={{ '--d': `${i * 80}ms` } as React.CSSProperties}
        >
          <span className="rc-catlist__idx">{String(i + 1).padStart(2, '0')}</span>
          <span className="rc-catlist__name">{c.name}</span>
          <span className="rc-catlist__count">{c.count} piece{c.count === 1 ? '' : 's'}</span>
          <ArrowUpRight size={28} strokeWidth={1.2} />
        </Link>
      ))}
      <div ref={floatRef} className={`rc-catlist__float${current !== null ? ' is-visible' : ''}`} aria-hidden>
        {images.map((src, i) => <img key={src + i} src={src} alt="" className={i === current ? 'is-current' : ''} loading="lazy" />)}
      </div>
    </div>
  );
};

export default CategoryList;
