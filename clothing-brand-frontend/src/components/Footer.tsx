import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { categoriesOf } from '../lib/catalog';
import { SUPPORT_EMAIL, SUPPORT_PHONE, WHATSAPP_URL } from '../lib/brand';
import WhatsAppIcon from './WhatsAppIcon';
import logoImg from '../assets/logo.png';

const Footer = () => {
  const { state } = useAppContext();
  const categories = useMemo(() => categoriesOf(state.products).slice(0, 5), [state.products]);

  return (
    <footer className="rc-footer">
      <div className="rc-container">
        <div className="rc-footer__grid">
          <div className="rc-footer__brand">
            <img src={logoImg} alt="Rang and Craft" loading="lazy" />
            <p>Menswear rooted in the royal legacy of Jaipur — breathable printed cotton, honest prices, made to be worn every day.</p>
            <div className="rc-footer__contact">
              <a href={`tel:${SUPPORT_PHONE.replace(/\s/g, '')}`}><Phone size={16} /> {SUPPORT_PHONE}</a>
              <a href={`mailto:${SUPPORT_EMAIL}`}><Mail size={16} /> {SUPPORT_EMAIL}</a>
              <span style={{ display: 'inline-flex', gap: 10, alignItems: 'center' }}><MapPin size={16} /> Jaipur, Rajasthan, India</span>
            </div>
            <div className="rc-footer__social">
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp">
                <WhatsAppIcon width={18} height={18} />
              </a>
              <a href={`mailto:${SUPPORT_EMAIL}`} aria-label="Email us"><Mail size={18} /></a>
            </div>
          </div>

          <div>
            <h4>Shop</h4>
            <ul>
              <li><Link to="/shop">All products</Link></li>
              <li><Link to="/shop?sort=newest">New in</Link></li>
              <li><Link to="/shop?sale=1">Sale</Link></li>
              {categories.map((c) => (
                <li key={c.name}><Link to={`/shop?category=${encodeURIComponent(c.name)}`}>{c.name}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Help</h4>
            <ul>
              <li><Link to="/track-order">Track your order</Link></li>
              <li><Link to="/shipping-policy">Shipping</Link></li>
              <li><Link to="/refund-policy">Exchanges & refunds</Link></li>
              <li><Link to="/care-guide">Fabric care</Link></li>
              <li><Link to="/faq">FAQs</Link></li>
              <li><Link to="/contact">Contact us</Link></li>
            </ul>
          </div>

          <div>
            <h4>Rang and Craft</h4>
            <ul>
              <li><Link to="/about">Our story</Link></li>
              <li><Link to="/gallery">Gallery</Link></li>
              <li><Link to="/reviews">Customer reviews</Link></li>
              <li><Link to="/contact?subject=wholesale">Wholesale & franchise</Link></li>
              <li><Link to="/profile">My account</Link></li>
            </ul>
          </div>
        </div>

        <div className="rc-footer__bottom">
          <span>© {new Date().getFullYear()} Rang and Craft, Jaipur. All rights reserved.</span>
          <nav aria-label="Legal">
            <Link to="/privacy-policy">Privacy</Link>
            <Link to="/terms-conditions">Terms</Link>
            <Link to="/accessibility">Accessibility</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
