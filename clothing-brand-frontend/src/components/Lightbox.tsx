import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getImageUrl } from '../utils/mediaHelper';
import { useScrollLock } from '../lib/motion';

interface Props { images: string[]; start: number; onClose: () => void; alt?: string }

const Lightbox = ({ images, start, onClose, alt = '' }: Props) => {
  const [index, setIndex] = useState(start);
  const count = images.length;
  const go = (d: number) => setIndex((i) => (i + d + count) % count);
  useScrollLock(true);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % count);
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + count) % count);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, count]);

  return (
    <div className="rc-lightbox" role="dialog" aria-modal="true" aria-label="Image viewer" onClick={onClose} data-lenis-prevent>
      <img key={index} src={getImageUrl(images[index], 1600)} alt={alt} onClick={(e) => e.stopPropagation()} />
      <div className="rc-lightbox__count">{index + 1} / {count}</div>
      <button type="button" className="rc-icon-btn rc-lightbox__close" onClick={onClose} aria-label="Close"><X size={24} /></button>
      {count > 1 && (
        <>
          <button type="button" className="rc-icon-btn rc-lightbox__nav rc-lightbox__nav--prev" onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="Previous image"><ChevronLeft size={28} /></button>
          <button type="button" className="rc-icon-btn rc-lightbox__nav rc-lightbox__nav--next" onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="Next image"><ChevronRight size={28} /></button>
        </>
      )}
    </div>
  );
};

export default Lightbox;
