import { Link } from 'react-router-dom';
import { Award, Gem, HandHeart, Leaf, Scissors, Sparkles } from 'lucide-react';
import Seo from '../components/Seo';
import { InfoHero } from '../components/InfoPage';
import { responsiveImage } from '../utils/mediaHelper';

const FOUNDED = 2005;

const PILLARS = [
  { icon: Award, title: 'Quality first', text: 'Breathable cottons and clean finishing, checked by hand before every piece leaves our studio.' },
  { icon: Gem, title: 'Authentic artistry', text: 'Prints and patterns rooted in Jaipur’s craft traditions, made with the artisans who keep them alive.' },
  { icon: Sparkles, title: 'Modern heritage', text: 'Silhouettes for the man who respects his roots and dresses for today, from weekday to wedding.' },
];

const AboutUs = () => {
  const years = new Date().getFullYear() - FOUNDED;
  const photo = responsiveImage('/images/heritage-edit-men.jpg', '(max-width: 900px) 100vw, 50vw');

  return (
    <>
      <Seo
        title="About Us"
        description="Rang and Craft brings Jaipur’s printing and tailoring heritage to modern menswear: kurtas, shirts and co-ords made in the Pink City since 2005."
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
            <div className="rc-story__frame">
              <img {...photo} alt="Model wearing a printed Rang and Craft kurta in Jaipur" loading="lazy" decoding="async" width={1200} height={1500} />
            </div>
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
              <div><Scissors size={22} strokeWidth={1.4} aria-hidden /><strong>100% handcrafted</strong><span>Cut, stitched and finished in our Jaipur atelier.</span></div>
              <div><Leaf size={22} strokeWidth={1.4} aria-hidden /><strong>Breathable fabrics</strong><span>Soft cottons made for Indian summers.</span></div>
              <div><HandHeart size={22} strokeWidth={1.4} aria-hidden /><strong>Ethical making</strong><span>Fair wages for every artisan we work with.</span></div>
            </div>
          </div>
        </div>
      </section>

      <div className="rc-figures" role="list">
        <div className="rc-figure" role="listitem"><strong>1 lakh+</strong><span>Happy customers</span></div>
        <div className="rc-figure" role="listitem"><strong>2000+</strong><span>Unique designs</span></div>
        <div className="rc-figure" role="listitem"><strong>50+</strong><span>Stores worldwide</span></div>
        <div className="rc-figure" role="listitem"><strong>{years}</strong><span>Years of legacy</span></div>
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
              <p>Printed kurtas, half sleeve shirts and co-ord sets, with free shipping on orders above ₹1499.</p>
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
