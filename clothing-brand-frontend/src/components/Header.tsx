import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown, Heart, Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { cartCount, useAppContext } from '../context/AppContext';
import { categoriesOf, matchesQuery } from '../lib/catalog';
import { formatPrice, productId } from '../lib/format';
import { getImageUrl } from '../utils/mediaHelper';
import { ANNOUNCEMENTS, FALLBACK_IMAGES } from '../lib/brand';
import { useScrollLock } from '../lib/motion';
import logoImg from '../assets/logo.png';

const NAV_LINKS = [
  { name: 'Shop', path: '/shop', mega: true },
  { name: 'New In', path: '/shop?sort=newest' },
  { name: 'Sale', path: '/shop?sale=1', sale: true },
  { name: 'Our Story', path: '/about' },
  { name: 'Reviews', path: '/reviews' },
  { name: 'Track Order', path: '/track-order' },
  { name: 'Contact', path: '/contact' },
];

const MegaMenu = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { state } = useAppContext();
  const categories = useMemo(() => categoriesOf(state.products).slice(0, 7), [state.products]);
  return (
    <div className={`rc-mega${open ? ' is-open' : ''}`} aria-hidden={!open}>
      <div className="rc-container rc-mega__grid">
        <div>
          <h5>Categories</h5>
          <ul>
            {categories.map((c) => (
              <li key={c.name}>
                <Link to={`/shop?category=${encodeURIComponent(c.name)}`} onClick={onClose} tabIndex={open ? 0 : -1}>
                  {c.name} <small>{c.count}</small>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h5>Discover</h5>
          <ul>
            <li><Link to="/shop" onClick={onClose} tabIndex={open ? 0 : -1}>Shop all</Link></li>
            <li><Link to="/shop?sort=newest" onClick={onClose} tabIndex={open ? 0 : -1}>New arrivals</Link></li>
            <li><Link to="/shop?sale=1" onClick={onClose} tabIndex={open ? 0 : -1}>Sale</Link></li>
            <li><Link to="/gallery" onClick={onClose} tabIndex={open ? 0 : -1}>Lookbook</Link></li>
          </ul>
        </div>
        <Link to="/shop?category=Suits" className="rc-mega__tile" onClick={onClose} tabIndex={open ? 0 : -1}>
          <img src={FALLBACK_IMAGES[3]} alt="" loading="lazy" />
          <span>Festive edit</span>
        </Link>
        <Link to="/shop?sort=newest" className="rc-mega__tile" onClick={onClose} tabIndex={open ? 0 : -1}>
          <img src={FALLBACK_IMAGES[0]} alt="" loading="lazy" />
          <span>New this season</span>
        </Link>
      </div>
    </div>
  );
};

const SearchPanel = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { state } = useAppContext();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) window.setTimeout(() => inputRef.current?.focus(), 80);
  }, [open]);

  const hits = useMemo(
    () => (query.trim().length < 2 ? [] : state.products.filter((p) => matchesQuery(p, query)).slice(0, 6)),
    [query, state.products]
  );
  const popular = useMemo(() => categoriesOf(state.products).slice(0, 6), [state.products]);

  const close = () => { setQuery(''); onClose(); };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
    close();
  };

  return (
    <>
      <div className={`rc-overlay${open ? ' is-open' : ''}`} onClick={close} aria-hidden />
      <div className={`rc-search${open ? ' is-open' : ''}`} data-lenis-prevent role="dialog" aria-modal="true" aria-label="Search products" aria-hidden={!open}>
        <div className="rc-container">
          <form className="rc-search__form" onSubmit={submit} role="search">
            <Search size={24} strokeWidth={1.4} aria-hidden />
            <label htmlFor="rc-search-input" className="rc-sr-only">Search</label>
            <input
              id="rc-search-input"
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search kurtas, shirts, prints…"
              autoComplete="off"
              tabIndex={open ? 0 : -1}
            />
            <button type="button" className="rc-icon-btn" onClick={close} aria-label="Close search" tabIndex={open ? 0 : -1}>
              <X size={22} />
            </button>
          </form>

          {query.trim().length >= 2 ? (
            hits.length > 0 ? (
              <>
                <div className="rc-search__results">
                  {hits.map((p) => (
                    <Link key={productId(p)} to={`/product/${productId(p)}`} className="rc-search__hit" onClick={close}>
                      <img src={getImageUrl(p.image, 120)} alt="" loading="lazy" />
                      <span>
                        <span style={{ display: 'block', fontSize: 15 }}>{p.name}</span>
                        <span className="rc-muted" style={{ fontSize: 14 }}>{formatPrice(p.price)}</span>
                      </span>
                    </Link>
                  ))}
                </div>
                <button type="submit" className="rc-link" style={{ marginTop: 20 }} onClick={submit}>
                  See all results for “{query.trim()}” <ArrowRight size={14} />
                </button>
              </>
            ) : (
              <p className="rc-muted" style={{ marginTop: 20 }}>No pieces match “{query.trim()}”. Try “kurta” or a colour like “indigo”.</p>
            )
          ) : (
            popular.length > 0 && (
              <div style={{ marginTop: 22 }}>
                <span className="rc-eyebrow">Popular</span>
                <div className="rc-search__chips">
                  {popular.map((c) => (
                    <Link key={c.name} to={`/shop?category=${encodeURIComponent(c.name)}`} className="rc-chip" onClick={close} tabIndex={open ? 0 : -1}>
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
};

const Header = () => {
  const { state, dispatch } = useAppContext();
  const location = useLocation();
  const here = location.pathname + location.search;
  // The menu is open only for the page it was opened on, so navigating closes it.
  const [menuOpenAt, setMenuOpenAt] = useState<string | null>(null);
  const menuOpen = menuOpenAt === here;
  const setMenuOpen = (open: boolean) => setMenuOpenAt(open ? here : null);
  const [scrolled, setScrolled] = useState(false);
  const [megaAt, setMegaAt] = useState<string | null>(null);
  const megaOpen = megaAt === here;
  const megaTimer = useRef<number | undefined>(undefined);
  const openMega = () => { window.clearTimeout(megaTimer.current); setMegaAt(here); };
  const closeMega = () => { megaTimer.current = window.setTimeout(() => setMegaAt(null), 120); };
  const count = cartCount(state.cart);
  const searchOpen = state.isSearchOpen;
  const overlay = location.pathname === '/' && !scrolled && !megaOpen && !searchOpen;

  useScrollLock(menuOpen || searchOpen);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menus on navigation and with Escape.
  useEffect(() => {
    dispatch({ type: 'TOGGLE_SEARCH', payload: false });
  }, [here, dispatch]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpenAt(null);
        setMegaAt(null);
        dispatch({ type: 'TOGGLE_SEARCH', payload: false });
        dispatch({ type: 'TOGGLE_CART', payload: false });
      }
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement))) {
        e.preventDefault();
        dispatch({ type: 'TOGGLE_SEARCH', payload: true });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dispatch]);

  const isActive = (path: string) => {
    const [p, q] = path.split('?');
    if (q) return location.pathname === p && location.search.includes(q);
    return location.pathname === p && (p !== '/shop' || !/sort=newest|sale=1/.test(location.search));
  };

  const loop = [...ANNOUNCEMENTS, ...ANNOUNCEMENTS];

  return (
    <>
      <div className="rc-announce" aria-label="Store announcements">
        <div className="rc-announce__track">
          {loop.map((text, i) => <span key={i} aria-hidden={i >= ANNOUNCEMENTS.length}>{text}</span>)}
        </div>
      </div>

      <header className={`rc-header${scrolled ? ' is-scrolled' : ''}${overlay ? ' is-overlay' : ''}`} onMouseLeave={closeMega}>
        <div className="rc-container">
          <div className="rc-header__bar">
            <div className="rc-header__left">
              <button type="button" className="rc-icon-btn rc-header__menu-btn" aria-label="Open menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}>
                <Menu size={22} strokeWidth={1.5} />
              </button>
              <button type="button" className="rc-icon-btn" aria-label="Search" onClick={() => dispatch({ type: 'TOGGLE_SEARCH', payload: true })}>
                <Search size={20} strokeWidth={1.5} />
              </button>
            </div>

            <Link to="/" className="rc-logo" aria-label="Rang and Craft — home">
              <img src={logoImg} alt="" width={58} height={56} />
              <span className="rc-logo__word">Rang &amp; Craft<small>Jaipur</small></span>
            </Link>

            <div className="rc-header__right">
              <Link to={state.user ? (state.user.isAdmin ? '/admin' : '/profile') : '/login'} className="rc-icon-btn rc-header__hide-mobile" aria-label={state.user ? 'My account' : 'Sign in'}>
                <User size={20} strokeWidth={1.5} />
              </Link>
              <Link to="/wishlist" className="rc-icon-btn" aria-label={`Wishlist, ${state.wishlist.length} items`}>
                <Heart size={20} strokeWidth={1.5} />
                {state.wishlist.length > 0 && <span className="rc-badge-count">{state.wishlist.length}</span>}
              </Link>
              <button type="button" className="rc-icon-btn" data-bag-target aria-label={`Shopping bag, ${count} items`} onClick={() => dispatch({ type: 'TOGGLE_CART', payload: true })}>
                <ShoppingBag size={20} strokeWidth={1.5} />
                {count > 0 && <span className="rc-badge-count">{count}</span>}
              </button>
            </div>
          </div>
        </div>
        <nav className="rc-nav" aria-label="Main">
          {NAV_LINKS.map((link) => link.mega ? (
            <div key={link.path} className="rc-nav__item" onMouseEnter={openMega} onFocus={openMega}>
              <NavLink to={link.path} className={() => (isActive(link.path) ? 'active' : '')}>{link.name}</NavLink>
              <button type="button" className="rc-nav__trigger" aria-label="Show shop menu" aria-expanded={megaOpen} onClick={() => (megaOpen ? setMegaAt(null) : openMega())} style={{ marginLeft: 4 }}>
                <ChevronDown size={14} />
              </button>
            </div>
          ) : (
            <NavLink key={link.path} to={link.path} className={() => `${isActive(link.path) ? 'active' : ''}${link.sale ? ' is-sale' : ''}`} onMouseEnter={closeMega}>
              {link.name}
            </NavLink>
          ))}
        </nav>
        <div onMouseEnter={openMega}>
          <MegaMenu open={megaOpen} onClose={() => setMegaAt(null)} />
        </div>
      </header>

      <SearchPanel open={searchOpen} onClose={() => dispatch({ type: 'TOGGLE_SEARCH', payload: false })} />

      <div className={`rc-overlay${menuOpen ? ' is-open' : ''}`} onClick={() => setMenuOpen(false)} aria-hidden />
      <aside className={`rc-drawer rc-drawer--left${menuOpen ? ' is-open' : ''}`} data-lenis-prevent aria-label="Menu" aria-hidden={!menuOpen}>
        <div className="rc-drawer__head">
          <img src={logoImg} alt="Rang and Craft" style={{ height: 40 }} />
          <button type="button" className="rc-icon-btn" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
            <X size={22} />
          </button>
        </div>
        <div className="rc-drawer__body">
          <nav className="rc-mobile-nav" aria-label="Mobile">
            <Link to="/">Home</Link>
            {NAV_LINKS.map((link) => (
              <Link key={link.path} to={link.path} className={link.sale ? 'is-sale' : ''}>
                {link.name} <ArrowRight size={16} strokeWidth={1.4} />
              </Link>
            ))}
            <div className="rc-mobile-nav__secondary">
              <Link to={state.user ? '/profile' : '/login'}>{state.user ? `My account (${state.user.name.split(' ')[0]})` : 'Sign in / Create account'}</Link>
              <Link to="/wishlist">Wishlist</Link>
              <Link to="/contact?subject=wholesale">Wholesale & franchise</Link>
              <Link to="/faq">Help & FAQs</Link>
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Header;
