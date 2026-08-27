import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../utils/mediaHelper';
import './Hero.css';

interface HeroProps {
  products?: any[];
}

const Hero = ({ products = [] }: HeroProps) => {
  const [current, setCurrent] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Dynamic slides from database collections with array checks
  const list = Array.isArray(products) ? products : [];
  const suitsProduct = list.find(p => p.category === 'Long Kurtas');
  const kurtaProduct = list.find(p => p.category === 'Short Kurtas');
  const topsProduct = list.find(p => p.category === 'Half Sleeves Shirts');

  const slides = [
    suitsProduct ? {
      type: 'image',
      src: suitsProduct.image,
      title: suitsProduct.name,
      subtitle: suitsProduct.description,
      btnPrimary: 'SHOP LONG KURTAS',
      btnOutline: 'OUR STORY',
      link: `/product/${suitsProduct._id}`
    } : null,
    topsProduct || kurtaProduct ? {
      type: 'image',
      src: topsProduct?.image || kurtaProduct?.image,
      title: topsProduct ? topsProduct.name : (kurtaProduct ? kurtaProduct.name : ''),
      subtitle: topsProduct ? topsProduct.description : (kurtaProduct ? kurtaProduct.description : ''),
      btnPrimary: 'EXPLORE STYLES',
      btnOutline: 'SHOP ALL',
      link: topsProduct ? `/product/${topsProduct._id}` : `/product/${kurtaProduct?._id}`
    } : null
  ].filter(Boolean) as any[];

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch(err => console.log('Autoplay blocked', err));
    }
  }, [current]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 7000); // 7 seconds per slide
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <section className="hero">
      <div className="hero-slider">
        {slides.map((slide, idx) => (
          <div key={idx} className={`hero-slide ${idx === current ? 'active' : ''}`}>
            {slide.type === 'video' ? (
              <video 
                ref={idx === current ? videoRef : null}
                src={slide.src} 
                className="hero-media hero-video" 
                autoPlay 
                loop 
                muted={true}
                playsInline
              />
            ) : (
              <img 
                src={getImageUrl(slide.src, 1920)} 
                alt={slide.title} 
                className="hero-media hero-image" 
                fetchPriority={idx === 0 ? "high" : "auto"}
                loading={idx === 0 ? "eager" : "lazy"}
              />
            )}
            <div className="hero-overlay"></div>
            <div className="hero-content">
              <span className="hero-gold-tag animate-item">THE LUXURY EDIT</span>
              <h1 className="hero-title font-serif animate-item">
                <span className="title-bold">{slide.title.split(' ')[0]}</span>{' '}
                <span className="title-italic font-serif" style={{color: 'var(--gold-primary)'}}>
                  {slide.title.split(' ').slice(1).join(' ')}
                </span>
              </h1>
              <p className="hero-subtitle animate-item" style={{ maxWidth: '800px', margin: '0 auto 45px', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {slide.subtitle}
              </p>
              <div className="hero-actions animate-item">
                <Link to={slide.link} className="hero-btn hero-btn-primary">{slide.btnPrimary}</Link>
                <Link to="/about" className="hero-btn hero-btn-outline">{slide.btnOutline}</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Slider dots */}
      <div className="hero-dots">
        {slides.map((_, idx) => (
          <button 
            key={idx} 
            className={`hero-dot ${idx === current ? 'active' : ''}`}
            onClick={() => setCurrent(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;
