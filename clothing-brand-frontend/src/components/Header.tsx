import { useState, useEffect, useRef } from 'react';
import { Search, ShoppingBag, User, Menu, X, Phone, Truck, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { API_ENDPOINTS } from '../utils/api';
import { getImageUrl } from '../utils/mediaHelper';
import logoImg from '../assets/logo.png';
import './Header.css';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const { state } = useAppContext();
  const { user, cart } = state;

  const announcements = [
    "ON PREPAID ORDERS",
    "ANY 2 SHORT KURTAS @ FLAT ₹1499✨",
    "ANY 2 HALF SLEEVES @ FLAT ₹1499✨",
    "1 LAKH+ HAPPY CUSTOMERS ❤️",
    "EXTRA 10% OFF ON PREPAID ORDERS"
  ];
  const [announcementIdx, setAnnouncementIdx] = useState(0);
  const [fadeProp, setFadeProp] = useState('fade-in');

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeProp('fade-out');
      const timeout = setTimeout(() => {
        setAnnouncementIdx((prev) => (prev + 1) % announcements.length);
        setFadeProp('fade-in');
      }, 500);
      return () => clearTimeout(timeout);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.trim().length > 1) {
        try {
          const res = await fetch(`${API_ENDPOINTS.PRODUCTS}?keyword=${searchTerm}`);
          const data = await res.json();
          setSuggestions(Array.isArray(data) ? data.slice(0, 4) : []);
          setShowSuggestions(true);
        } catch (error) {
          console.error("Suggestions failed", error);
        }
      } else {
        setShowSuggestions(false);
        setSuggestions([]);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    if(searchTerm.trim()) {
      navigate(`/shop?keyword=${searchTerm}`);
    } else {
      navigate(`/shop`);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Determine if sticky nav should activate
      setIsScrolled(currentScrollY > 150);
      
      // Show/Hide sticky header based on scroll direction
      if (currentScrollY > lastScrollY.current && currentScrollY > 200) {
        setShowHeader(false); // scrolling down
      } else {
        setShowHeader(true); // scrolling up
      }
      
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Short Kurtas', path: '/shop?category=Short%20Kurtas' },
    { name: 'Long Kurtas', path: '/shop?category=Long%20Kurtas' },
    { name: 'Half Sleeves Shirts', path: '/shop?category=Half Sleeves Shirts' },
    { name: 'Full Sleeves Shirts', path: '/shop?category=Full%20Sleeves%20Shirts' },
    { name: 'Track Order', path: '/track-order', icon: <Truck size={14} /> },
    { name: 'Contact Us', path: '/contact', icon: <Phone size={14} /> }
  ];

  return (
    <>
      {/* Main Header (Scrolls away) */}
      <header className={`header-main ${isScrolled ? 'header-hidden' : ''}`}>
        <div className="header-top-bar" style={{ backgroundColor: '#1a3c34', color: 'white', overflow: 'hidden', whiteSpace: 'nowrap', padding: '8px 0' }}>
          <div style={{ display: 'inline-block', animation: 'marquee 25s linear infinite', fontSize: '0.75rem', fontWeight: 500, letterSpacing: '1px' }}>
            <span style={{marginRight: '50px'}}>ON PREPAID ORDERS</span>
            <span style={{marginRight: '50px'}}>ANY 2 SHORT KURTAS @ FLAT ₹1499✨</span>
            <span style={{marginRight: '50px'}}>ANY 2 HALF SLEEVES @ FLAT ₹1499✨</span>
            <span style={{marginRight: '50px'}}>1 LAKH+ HAPPY CUSTOMERS ❤️</span>
            <span style={{marginRight: '50px'}}>EXTRA 10% OFF ON PREPAID ORDERS</span>
            <span style={{marginRight: '50px'}}>ON PREPAID ORDERS</span>
            <span style={{marginRight: '50px'}}>ANY 2 SHORT KURTAS @ FLAT ₹1499✨</span>
            <span style={{marginRight: '50px'}}>ANY 2 HALF SLEEVES @ FLAT ₹1499✨</span>
          </div>
        </div>
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
        
        <div className="header-main-middle">
          <div className="container header-grid">
            {/* Left: Logo */}
            <div className="header-left">
              <Link to="/" className="main-logo">
                <img src={logoImg} alt="Rang and Craft Logo" className="logo-img" />
              </Link>
            </div>

            <button 
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>

            {/* Center: Search */}
            <div className="header-center">
              <form onSubmit={submitSearch} className="search-form">
                <input 
                  type="text" 
                  placeholder="SEARCH..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => { if(searchTerm.length > 1) setShowSuggestions(true); }}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="search-input"
                />
                <button type="submit" className="search-btn">
                  <Search size={16} />
                </button>
              </form>
              {showSuggestions && suggestions.length > 0 && (
                <div className="search-dropdown" onMouseDown={(e) => e.preventDefault()}>
                  {suggestions.map(item => (
                    <Link 
                      key={item._id} 
                      to={`/product/${item._id}`} 
                      className="suggestion-item"
                      onClick={() => {
                        setShowSuggestions(false);
                        setSearchTerm('');
                      }}
                    >
                      <img src={getImageUrl(item.image)} alt={item.name} />
                      <div>
                        <p className="suggestion-name">{item.name}</p>
                        <span className="suggestion-cat">{item.category}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Icons */}
            <div className="header-right">
              <div className="currency-selector" style={{display: 'flex', alignItems: 'center', fontSize: '0.85rem', color: '#666', marginRight: '15px', cursor: 'pointer'}}>
                <img src="https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg" alt="India" style={{width: '16px', marginRight: '5px'}}/>
                Indian Rupee 
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft: '2px'}}><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
              {/* Mobile Search Toggle Icon */}
              <button 
                type="button" 
                className="header-icon-link mobile-search-toggle"
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                title="Toggle Search"
              >
                <Search size={20} />
              </button>

              <Link to={user ? "/profile" : "/login"} className="header-icon-link">
                <User size={20} />
              </Link>
              {user && user.isAdmin && (
                <Link to="/admin" className="header-icon-link" title="Admin Panel" style={{ color: '#6B21A8' }}>
                  <ShieldCheck size={20} />
                </Link>
              )}
              <Link to="/cart" className="header-icon-link cart-link">
                <ShoppingBag size={20} />
                {cart.length > 0 && <span className="cart-badge">{cart.reduce((acc, item) => acc + item.quantity, 0)}</span>}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search Bar Row (slides down) */}
      <div className={`mobile-search-bar-row ${mobileSearchOpen ? 'open' : ''}`}>
        <div className="container" style={{ position: 'relative' }}>
          <form onSubmit={submitSearch} className="mobile-search-form">
            <input 
              type="text" 
              placeholder="SEARCH THE STORE..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => { if(searchTerm.length > 1) setShowSuggestions(true); }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="mobile-search-input"
            />
            <button type="submit" className="mobile-search-btn">
              <Search size={18} />
            </button>
            <button 
              type="button" 
              className="mobile-search-close"
              onClick={() => {
                setMobileSearchOpen(false);
                setSearchTerm('');
              }}
            >
              <X size={18} />
            </button>
          </form>
          
          {showSuggestions && suggestions.length > 0 && (
            <div className="mobile-search-dropdown" onMouseDown={(e) => e.preventDefault()}>
              {suggestions.map(item => (
                <Link 
                  key={item._id} 
                  to={`/product/${item._id}`} 
                  className="suggestion-item"
                  onClick={() => {
                    setShowSuggestions(false);
                    setMobileSearchOpen(false);
                    setSearchTerm('');
                  }}
                >
                  <img src={getImageUrl(item.image)} alt={item.name} />
                  <div>
                    <p className="suggestion-name">{item.name}</p>
                    <span className="suggestion-cat">{item.category}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navigation (Becomes Sticky) */}
      <nav className={`header-nav ${isScrolled ? 'nav-sticky' : ''} ${isScrolled && !showHeader ? 'nav-hidden' : ''}`}>
        <div className="container nav-container">
          {isScrolled && (
            <Link to="/" className="mini-logo">
                <img src={logoImg} alt="Rang and Craft Logo" className="logo-img-mini" />
            </Link>
          )}
          
          <ul className="nav-list">
            {navLinks.map((link, idx) => (
              <li key={idx}>
                <Link to={link.path} className="nav-link">
                  {link.icon && <span className="nav-icon">{link.icon}</span>}
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>

          {isScrolled && (
            <div className="nav-icons-mini">
              <Link to="/cart" className="nav-icon-link">
                <ShoppingBag size={18} />
                {cart.length > 0 && <span className="cart-badge-mini">{cart.reduce((acc, item) => acc + item.quantity, 0)}</span>}
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-nav-overlay ${mobileMenuOpen ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}></div>
      <div className={`mobile-nav-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-header">
           <img src={logoImg} alt="Rang and Craft Logo" className="logo-img-mobile" />
           <button onClick={() => setMobileMenuOpen(false)}><X size={24} /></button>
        </div>
        <ul className="mobile-nav-list">
          {navLinks.map((link, idx) => (
            <li key={idx} onClick={() => setMobileMenuOpen(false)}>
              <Link to={link.path} className="mobile-nav-link">
                {link.icon}
                <span>{link.name}</span>
              </Link>
            </li>
          ))}
          {user && user.isAdmin && (
            <li onClick={() => setMobileMenuOpen(false)}>
              <Link to="/admin" className="mobile-nav-link" style={{ color: '#6B21A8', fontWeight: 700 }}>
                <ShieldCheck size={20} />
                <span>Admin Panel</span>
              </Link>
            </li>
          )}
          <li onClick={() => setMobileMenuOpen(false)}>
            <Link to={user ? "/profile" : "/login"} className="mobile-nav-link">
              <User size={20} />
              <span>{user ? 'My Profile' : 'Login / Register'}</span>
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Header;
