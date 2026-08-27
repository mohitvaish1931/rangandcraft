import { Link } from 'react-router-dom';
import logoImg from '../assets/logo.png';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-purple">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <div className="flex items-center" style={{marginBottom: '20px'}}>
              <img src={logoImg} alt="Rang and Craft Logo" style={{ height: '60px', width: '220px', objectFit: 'cover', objectPosition: 'center', mixBlendMode: 'multiply' }} />
            </div>
            <p className="footer-desc-purple">
              Experience the royal legacy of Jaipur with our exquisite handcrafted ethnic wear for men.
            </p>
            <div className="social-links-purple">
              {['facebook', 'instagram', 'twitter', 'youtube'].map((platform) => (
                <a href={`https://${platform}.com`} key={platform} target="_blank" rel="noreferrer">
                  <span className="capitalize">{platform[0]}</span>
                </a>
              ))}
            </div>
          </div>
          
          <div className="footer-col">
            <h4 className="footer-heading-purple">Collections</h4>
            <ul className="footer-links-purple">
              <li><Link to="/shop?category=Short%20Kurtas">Short Kurtas</Link></li>
              <li><Link to="/shop?category=Suits">Designer Suits</Link></li>
              <li><Link to="/shop?category=Half Sleeves Shirts">Half Sleeves Shirts & Tunics</Link></li>
              <li><Link to="/shop?category=Three%20Piece%20Tops">Three Piece Half Sleeves Shirts</Link></li>
              <li><Link to="/shop">All Collections</Link></li>
              <li><Link to="/shop?keyword=New">New Arrivals</Link></li>
            </ul>
          </div>
          
          <div className="footer-col">
            <h4 className="footer-heading-purple">Concierge</h4>
            <ul className="footer-links-purple">
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/track-order">Track Your Order</Link></li>
              <li><Link to="/shipping-policy">Shipping Policy</Link></li>
              <li><Link to="/refund-policy">Returns & Refunds</Link></li>
              <li><Link to="/faq">FAQs</Link></li>
            </ul>
          </div>
          
          <div className="footer-col">
            <h4 className="footer-heading-purple">Join Our World</h4>
            <p className="footer-desc-purple" style={{marginBottom: '15px'}}>
              Stay updated with our latest releases and exclusive styling tips.
            </p>
            <form className="newsletter-form-purple">
              <input type="email" placeholder="Enter your email" className="newsletter-input-purple" />
              <button type="submit" className="btn-purple-submit">Join Now</button>
            </form>
          </div>
        </div>
        
        <div className="footer-bottom-purple">
          <p>&copy; {new Date().getFullYear()} RANG AND CRAFT JAIPUR. Handcrafted with Love.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
