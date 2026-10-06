import { useState } from 'react';
import { Star } from 'lucide-react';

export const Stars = ({ value, size = 14 }: { value: number; size?: number }) => (
  <span className="rc-stars" role="img" aria-label={`${value.toFixed(1)} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star key={i} size={size} strokeWidth={1.5} fill={i <= Math.round(value) ? 'currentColor' : 'none'} />
    ))}
  </span>
);

export const StarInput = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div className="rc-star-input" role="radiogroup" aria-label="Your rating">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={value === i}
          aria-label={`${i} star${i > 1 ? 's' : ''}`}
          className={i <= shown ? 'is-on' : ''}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
        >
          <Star size={26} strokeWidth={1.5} fill={i <= shown ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  );
};
