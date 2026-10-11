import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Award, Gem, HandHeart, Leaf, Scissors, Sparkles } from 'lucide-react';
import Seo from '../components/Seo';
import { InfoHero } from '../components/InfoPage';
import { useAppContext } from '../context/AppContext';
import { productId } from '../lib/format';
import { pickLooks } from '../lib/media';
import { responsiveImage } from '../utils/mediaHelper';

const FOUNDED = 2005;

const PILLARS = [
  { icon: Award, title: 'Quality first', text: 'Breathable cottons and clean finishing, checked by hand before every piece leaves our studio.' },
  { icon: Gem, title: 'Authentic artistry', text: 'Prints and patterns rooted in Jaipur’s craft traditions, made with the artisans who keep them alive.' },
  { icon: Sparkles, title: 'Modern heritage', text: 'Silhouettes for the man who respects his roots and dresses for today, from weekday to wedding.' },
];

const AboutUs = () => {
  const years = new Date().getFullYear() - FOUNDED;
  const { state } = useAppContext();
  const [look] = useMemo(() => pickLooks(state.products, 1, { shot: 1, salt: 11 }), [state.products]);

  return (
    <>
      <Seo
        title="About Us"
        description="Rang and Craft brings Jaipur’s block-printing heritage to modern menswear: hand block printed cotton short kurtas and shirts from our studio in Jaipur."
        path="/about"
      />
      <InfoHero
        eyebrow={`Since ${FOUNDED} · Jaipur`}
        title={<>The soul of <em>Rang and Craft</em></>}
        intro="Where Jaipur’s artistry meets contemporary silhouettes. We don’t just make clothes; we make the pieces you reach for on the days that matter."
      >
        <div className="rc-info-hero__actions">
          <Link to="/shop" className="rc-btn">Shop the collection</Link>
          <Link to="/contact" className="rc-btn rc-btn--outline">Visit our studio</Link>
        </div>
      </InfoHero>

      <section className="rc-section">
        <div className="rc-container rc-story">
          <div className="rc-story__media" data-reveal="mask">
            {look ? (
              <Link to={`/product/${productId(look.product)}`} className="rc-story__frame" style={{ display: 'block' }} data-cursor="View">
                <img {...responsiveImage(look.src, '(max-width: 900px) 100vw, 50vw', 960)} alt={look.product.name} loading="lazy" decoding="async" width={1200} height={1500} />
              </Link>
            ) : (
              <div className="rc-story__frame rc-skeleton" style={{ aspectRatio: '4 / 5' }} aria-hidden />
            )}
            <div className="rc-story__stamp">
              <strong>{years} years</strong>
              of printing, cutting and stitching in the Pink City.
            </div>
          </div>
          <div>
            <span className="rc-eyebrow" data-reveal="fade">Our heritage</span>
            <h2 className="rc-h2" style={{ marginTop: 10 }} data-reveal="up">Born in the Pink City</h2>
            <p className="rc-lead" style={{ marginTop: 18 }} data-reveal="up">
              Rang and Craft began in {FOUNDED} amid the colour and architecture of Jaipur, with a simple idea: bring the city’s
              craft to everyday menswear, without the fuss or the markup.
            </p>
            <p className="rc-lead" style={{ marginTop: 14 }} data-reveal="up">
              Every piece is a tribute to the craftspeople of Rajasthan, whose hands carry a legacy of centuries. Our job is to be
              the bridge between that tradition and the way you dress today.
            </p>
            <div className="rc-story__points">
              <div><Scissors size={22} strokeWidth={1.4} aria-hidden /><strong>Hand block printed</strong><span>Printed by hand with wooden blocks, then cut and stitched in Jaipur.</span></div>
              <div><Leaf size={22} strokeWidth={1.4} aria-hidden /><strong>Breathable fabrics</strong><span>Soft cottons made for Indian summers.</span></div>
              <div><HandHeart size={22} strokeWidth={1.4} aria-hidden /><strong>Ethical making</strong><span>Fair wages for every artisan we work with.</span></div>
            </div>
          </div>
        </div>
      </section>

      <div className="rc-figures" role="list">
        <div className="rc-figure" role="listitem"><strong>1</strong><span>Studio, in Jaipur</span></div>
        <div className="rc-figure" role="listitem"><strong>100%</strong><span>Cotton fabrics</span></div>
        <div className="rc-figure" role="listitem"><strong>S–3XL</strong><span>Size range</span></div>
        <div className="rc-figure" role="listitem"><strong>7 days</strong><span>Size exchange</span></div>
      </div>

      <section className="rc-section rc-section--tint">
        <div className="rc-container">
          <div className="rc-section-head rc-section-head--center">
            <span className="rc-eyebrow">The Rang and Craft ethos</span>
            <h2 className="rc-h2">What we stand for</h2>
          </div>
          <div className="rc-pillars">
            {PILLARS.map(({ icon: Icon, title, text }) => (
              <article className="rc-pillar" key={title} data-reveal="up">
                <Icon size={30} strokeWidth={1.3} aria-hidden />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="rc-section">
        <div className="rc-container">
          <div className="rc-band" data-reveal="up">
            <div>
              <span className="rc-eyebrow">Made in Jaipur, for you</span>
              <h2 className="rc-h2" style={{ marginTop: 10 }}>Find your next favourite</h2>
              <p>Hand block printed short kurtas and half &amp; full sleeve shirts, with free shipping on orders above ₹1499.</p>
            </div>
            <div className="rc-help__actions">
              <Link to="/shop" className="rc-btn rc-btn--light">Shop now</Link>
              <Link to="/reviews" className="rc-btn rc-btn--ghost-light">Read reviews</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutUs;
