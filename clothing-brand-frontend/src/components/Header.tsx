import { Search, ShoppingBag, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import logoImg from '../assets/logo.png';

const Header = () => {
  
  
  const { state } = useAppContext();
  const { cart } = state;

  const navLinks = [
    { name: 'HOME', path: '/' },
    { name: 'SHOP MEN', path: '/shop' },
    { name: 'FLASH SALE', path: '/shop?tag=Flash%20Sale' },
    { name: 'RETURN/EXCHANGE', path: '/refund-policy' },
    { name: 'CRAFTS', path: '/shop?tag=Crafts' },
    { name: 'ABOUT', path: '/about' },
    { name: 'OUR GALLERY', path: '/gallery' },
    { name: 'REVIEWS', path: '/reviews' },
    { name: 'CONTACT', path: '/contact' },
    { name: 'WHOLESALE/FRANCHISE', path: '/contact?subject=wholesale' },
  ];

  return (
    <>
      {/* Top Marquee */}
      <div style={{ backgroundColor: '#295454', color: '#fff', padding: '10px 0', fontSize: '11px', letterSpacing: '1px', fontWeight: 500, overflow: 'hidden', whiteSpace: 'nowrap' }}>
        <div style={{ display: 'inline-block', animation: 'marquee 30s linear infinite' }}>
          <span style={{ marginRight: '80px' }}>ON PREPAID ORDERS</span>
          <span style={{ marginRight: '80px' }}>ANY 2 SHORT KURTAS @ FLAT ₹1499✨</span>
          <span style={{ marginRight: '80px' }}>ANY 2 HALF SLEEVES @ FLAT ₹1499✨</span>
          <span style={{ marginRight: '80px' }}>1 LAKH+ HAPPY CUSTOMERS ❤️</span>
          <span style={{ marginRight: '80px' }}>EXTRA 10% OFF ON PREPAID ORDERS</span>
          {/* Duplicate for seamless loop */}
          <span style={{ marginRight: '80px' }}>ON PREPAID ORDERS</span>
          <span style={{ marginRight: '80px' }}>ANY 2 SHORT KURTAS @ FLAT ₹1499✨</span>
          <span style={{ marginRight: '80px' }}>ANY 2 HALF SLEEVES @ FLAT ₹1499✨</span>
        </div>
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      {/* Main Header */}
      <header style={{ backgroundColor: '#fff', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ flex: 1 }}></div>
            
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <Link to="/">
                <img src={logoImg} alt="Rang and Craft Logo" style={{ height: '80px', objectFit: 'contain' }} />
              </Link>
            </div>

            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px', color: '#555', cursor: 'pointer' }}>
                <img src="https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg" alt="India" style={{width: '16px', marginRight: '5px'}}/>
                Indian Rupee 
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginLeft: '2px'}}><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
              
              <Link to="/profile" style={{ color: '#333' }}><User size={20} strokeWidth={1.5} /></Link>
              <Link to="/shop" style={{ color: '#333' }}><Search size={20} strokeWidth={1.5} /></Link>
              <Link to="/cart" style={{ color: '#333', position: 'relative' }}>
                <ShoppingBag size={20} strokeWidth={1.5} />
                {cart.length > 0 && <span style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#295454', color: 'white', fontSize: '10px', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cart.length}</span>}
              </Link>
            </div>
          </div>

          <nav>
            <ul style={{ display: 'flex', gap: '30px', listStyle: 'none', margin: 0, padding: 0 }}>
              {navLinks.map((link, idx) => (
                <li key={idx}>
                  <Link to={link.path} style={{ textDecoration: 'none', color: '#555', fontSize: '12px', letterSpacing: '1px', fontWeight: 500 }}>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
    </>
  );
};

export default Header;
