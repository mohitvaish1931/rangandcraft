import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3, Boxes, ChevronRight, ExternalLink, Images, Inbox, LayoutDashboard, LineChart, LogOut, Megaphone,
  Menu, Package, PieChart, Search, Settings, ShieldCheck, ShoppingBag, Star, Tag, UserRound, Users, UsersRound,
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { API_ENDPOINTS, fetchJSON } from '../../utils/api';
import CommandPalette, { type PaletteLink } from '../../components/admin/CommandPalette';
import { initials } from '../../lib/adminFormat';
import '../../styles/admin.css';

interface Summary { toShip: number; pendingReviews: number; newMessages: number; lowStock: number }
type CountKey = keyof Summary;

const NAV: { title: string; items: { to: string; label: string; icon: PaletteLink['icon']; end?: boolean; count?: CountKey }[] }[] = [
  { title: 'Overview', items: [{ to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true }] },
  {
    title: 'Sell',
    items: [
      { to: '/admin/orders', label: 'Orders', icon: Package, count: 'toShip' },
      { to: '/admin/products', label: 'Products', icon: ShoppingBag },
      { to: '/admin/inventory', label: 'Inventory', icon: Boxes, count: 'lowStock' },
      { to: '/admin/first-photo', label: 'Product photos', icon: Images },
      { to: '/admin/customers', label: 'Customers', icon: Users },
    ],
  },
  {
    title: 'Engage',
    items: [
      { to: '/admin/reviews', label: 'Reviews', icon: Star, count: 'pendingReviews' },
      { to: '/admin/inbox', label: 'Inbox', icon: Inbox, count: 'newMessages' },
      { to: '/admin/promotions', label: 'Coupons', icon: Tag },
      { to: '/admin/banners', label: 'Announcements', icon: Megaphone },
    ],
  },
  {
    title: 'Insights',
    items: [
      { to: '/admin/reports/sales', label: 'Sales', icon: BarChart3 },
      { to: '/admin/reports/products', label: 'Product performance', icon: PieChart },
      { to: '/admin/reports/customers', label: 'Customer insights', icon: LineChart },
    ],
  },
  {
    title: 'Settings',
    items: [
      { to: '/admin/settings', label: 'Store status', icon: Settings },
      { to: '/admin/users', label: 'Users & roles', icon: UsersRound },
    ],
  },
];

const LINKS: PaletteLink[] = NAV.flatMap((g) => g.items.map((i) => ({ to: i.to, label: i.label, icon: i.icon, group: g.title })))
  .concat([{ to: '/admin/products/add', label: 'Add product', icon: ShoppingBag, group: 'Sell' }]);

const titleFor = (path: string) => {
  if (path.startsWith('/admin/products/add')) return 'Add product';
  if (/\/admin\/products\/[^/]+\/edit/.test(path)) return 'Edit product';
  const match = [...LINKS].sort((a, b) => b.to.length - a.to.length).find((l) => path === l.to || path.startsWith(`${l.to}/`));
  return match?.label ?? 'Dashboard';
};

const STORE_URL = typeof window !== 'undefined' ? window.location.origin : '/';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, dispatch } = useAppContext();
  const user = state.user;
  const [navOpen, setNavOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const isAdmin = Boolean(user?.isAdmin);

  useEffect(() => {
    if (!user) navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`, { replace: true });
  }, [user, navigate, location.pathname]);

  // Badge counts refresh on every page change and once a minute.
  const loadSummary = useCallback(() => {
    fetchJSON<Summary>(API_ENDPOINTS.ADMIN_SUMMARY).then(setSummary).catch(() => {});
  }, []);
  useEffect(() => {
    if (!isAdmin) return;
    loadSummary();
    const t = window.setInterval(loadSummary, 60_000);
    return () => window.clearInterval(t);
  }, [isAdmin, loadSummary, location.pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPaletteOpen((o) => !o); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => { if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [menuOpen]);

  const title = titleFor(location.pathname);
  useEffect(() => { document.title = `${title} · Admin · Rang and Craft`; }, [title]);

  if (!user) return null;

  if (!isAdmin) {
    return (
      <div className="ad" style={{ display: 'grid', placeItems: 'center', padding: 24 }}>
        <div className="ad-card" style={{ maxWidth: 420, textAlign: 'center' }}>
          <div className="ad-empty">
            <span className="ad-empty__icon"><ShieldCheck aria-hidden /></span>
            <strong>Admin access required</strong>
            <p>You’re signed in as {user.email}, which isn’t an admin account.</p>
            <Link to="/" className="ad-btn">Back to the store</Link>
          </div>
        </div>
      </div>
    );
  }

  const logout = () => { dispatch({ type: 'LOGOUT' }); navigate('/login'); };
  const closeNav = () => setNavOpen(false);

  return (
    <div className="ad">
      <div className="ad-shell">
        {navOpen && <div className="ad-overlay" onClick={closeNav} aria-hidden style={{ zIndex: 55 }} />}
        <aside className={`ad-side${navOpen ? ' is-open' : ''}`} aria-label="Admin navigation">
          <Link to="/admin" className="ad-side__brand" onClick={closeNav}>
            <img src="/icon-192.png" alt="" width={34} height={34} />
            <div><strong>Rang &amp; Craft</strong><span>Admin</span></div>
          </Link>
          <nav className="ad-side__nav">
            {NAV.map((group) => (
              <div className="ad-side__group" key={group.title}>
                <div className="ad-side__label">{group.title}</div>
                {group.items.map((item) => {
                  const count = item.count && summary ? summary[item.count] : 0;
                  return (
                    <NavLink key={item.to} to={item.to} end={item.end} className="ad-side__link" onClick={closeNav}>
                      <item.icon aria-hidden />
                      <span>{item.label}</span>
                      {count > 0 && <span className="ad-side__count" aria-label={`${count} need attention`}>{count}</span>}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </nav>
          <div className="ad-side__foot">
            <a href={STORE_URL} target="_blank" rel="noreferrer" className="ad-side__store">
              <span className="dot" aria-hidden />
              <span style={{ flex: 1 }}>View live store</span>
              <ExternalLink aria-hidden />
            </a>
          </div>
        </aside>

        <div className="ad-main">
          <header className="ad-top">
            <button type="button" className="ad-icon-btn ad-top__menu" onClick={() => setNavOpen(true)} aria-label="Open navigation"><Menu aria-hidden /></button>
            <div className="ad-crumbs">
              <span>Admin</span>
              <ChevronRight aria-hidden />
              <strong>{title}</strong>
            </div>
            <div className="ad-top__spacer" />
            <button type="button" className="ad-search-btn" onClick={() => setPaletteOpen(true)} aria-label="Search (Ctrl K)">
              <Search aria-hidden />
              <span>Search orders, products…</span>
              <kbd>Ctrl K</kbd>
            </button>
            <div className="ad-user" ref={menuRef}>
              <button type="button" className="ad-user__btn" onClick={() => setMenuOpen((o) => !o)} aria-haspopup="menu" aria-expanded={menuOpen}>
                <span className="ad-avatar">{initials(user.name)}</span>
                <span className="ad-user__name"><strong>{user.name}</strong><span>Administrator</span></span>
              </button>
              {menuOpen && (
                <div className="ad-menu" role="menu">
                  <div style={{ padding: '8px 10px 10px', fontSize: 12.5, color: 'var(--ad-muted)' }}>Signed in as<br /><strong style={{ color: 'var(--ad-ink)', fontWeight: 500 }}>{user.email}</strong></div>
                  <hr />
                  <a href={STORE_URL} target="_blank" rel="noreferrer" role="menuitem"><ExternalLink aria-hidden /> View store</a>
                  <Link to="/profile" role="menuitem" onClick={() => setMenuOpen(false)}><UserRound aria-hidden /> My account</Link>
                  <hr />
                  <button type="button" role="menuitem" className="is-danger" onClick={logout}><LogOut aria-hidden /> Log out</button>
                </div>
              )}
            </div>
          </header>

          <div className="ad-content" key={location.pathname}>
            <Outlet context={{ refreshSummary: loadSummary }} />
          </div>
        </div>
      </div>
      {paletteOpen && <CommandPalette links={LINKS} onClose={() => setPaletteOpen(false)} />}
    </div>
  );
};

export default AdminLayout;
