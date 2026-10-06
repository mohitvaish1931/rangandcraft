import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, LayoutDashboard, LogOut, Package, UserRound } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import Seo from '../components/Seo';
import PasswordInput from '../components/PasswordInput';
import { API_ENDPOINTS, fetchJSON, postJSON } from '../utils/api';
import { errorMessage, formatDate, formatPrice, shortOrderId } from '../lib/format';
import { getImageUrl } from '../utils/mediaHelper';
import { toSessionUser } from '../lib/session';
import { useToast } from '../lib/toast';

interface OrderItem { name: string; qty: number; price: number; image: string; selectedSize?: string; product: string }
interface Order {
  _id: string;
  createdAt: string;
  totalPrice: number;
  status: string;
  isPaid: boolean;
  orderItems: OrderItem[];
  awbNumber?: string;
  courierName?: string;
  trackingUrl?: string;
}

const STEPS = ['Placed', 'Processing', 'Shipped', 'Delivered'];
const stepIndex = (o: Order) => {
  if (o.status === 'Delivered') return 3;
  if (o.status === 'Shipped') return 2;
  if (o.isPaid || o.status === 'Processing') return 1;
  return 0;
};

const statusLabel = (o: Order) => (o.status === 'Pending' && !o.isPaid ? 'Awaiting payment' : o.status || 'Processing');

const OrdersTab = () => {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchJSON<Order[]>(API_ENDPOINTS.ORDERS.MINE).then(setOrders).catch((err) => setError(errorMessage(err)));
  }, []);

  if (error) return <div className="rc-alert rc-alert--error">{error}</div>;
  if (!orders) return <div style={{ display: 'grid', gap: 16 }}>{[0, 1].map((i) => <div key={i} className="rc-skeleton" style={{ height: 160, borderRadius: 18 }} />)}</div>;
  if (orders.length === 0) {
    return (
      <div className="rc-empty rc-panel">
        <Package size={44} strokeWidth={1.2} />
        <h2 className="rc-h3">No orders yet</h2>
        <p>When you place an order, you’ll be able to follow it here.</p>
        <Link to="/shop" className="rc-btn">Start shopping</Link>
      </div>
    );
  }

  return (
    <div>
      {orders.map((o) => {
        const cancelled = o.status === 'Cancelled';
        const current = stepIndex(o);
        return (
          <article className="rc-order" key={o._id}>
            <div className="rc-order__head">
              <div><span>Order</span><strong>{shortOrderId(o._id)}</strong></div>
              <div><span>Placed on</span><strong>{formatDate(o.createdAt)}</strong></div>
              <div><span>Total</span><strong>{formatPrice(o.totalPrice)}</strong></div>
              <div><span>Status</span><span className={`rc-status rc-status--${o.status}`}>{statusLabel(o)}</span></div>
            </div>
            <div className="rc-order__body">
              {!cancelled && o.isPaid && (
                <div className="rc-timeline" aria-label={`Order progress: ${STEPS[current]}`}>
                  {STEPS.map((s, i) => <div key={s} className={i <= current ? 'is-done' : ''}>{s}</div>)}
                </div>
              )}
              {o.orderItems.map((item, i) => (
                <div className="rc-line" key={i} style={{ gridTemplateColumns: '56px minmax(0,1fr) auto' }}>
                  <Link to={`/product/${item.product}`} className="rc-line__img"><img src={getImageUrl(item.image, 120)} alt="" /></Link>
                  <div>
                    <Link to={`/product/${item.product}`} className="rc-line__name">{item.name}</Link>
                    <div className="rc-line__meta">Qty {item.qty}{item.selectedSize ? ` · Size ${item.selectedSize}` : ''}</div>
                  </div>
                  <div>{formatPrice(item.price * item.qty)}</div>
                </div>
              ))}
              {o.awbNumber && (
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', paddingTop: 12, fontSize: 14 }}>
                  <span>{o.courierName} · AWB <strong>{o.awbNumber}</strong></span>
                  {o.trackingUrl && <a className="rc-btn rc-btn--sm rc-btn--outline" href={o.trackingUrl} target="_blank" rel="noopener noreferrer">Track shipment</a>}
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
};

const DetailsTab = () => {
  const { state, dispatch } = useAppContext();
  const toast = useToast();
  const user = state.user!;
  const [form, setForm] = useState({ name: user.name, phone: user.phone || '', password: '' });
  const [saving, setSaving] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = await postJSON<any>(API_ENDPOINTS.PROFILE, { name: form.name, phone: form.phone, ...(form.password ? { password: form.password } : {}) }, 'PUT');
      dispatch({ type: 'SET_USER', payload: toSessionUser(data) });
      setForm((f) => ({ ...f, password: '' }));
      toast.success('Your details have been updated.');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="rc-panel" onSubmit={save} style={{ display: 'grid', gap: 16, maxWidth: 560 }}>
      <h2 className="rc-panel__title">Your details</h2>
      <div className="rc-field">
        <label className="rc-label" htmlFor="pf-name">Full name</label>
        <input id="pf-name" className="rc-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </div>
      <div className="rc-field">
        <label className="rc-label" htmlFor="pf-email">Email</label>
        <input id="pf-email" className="rc-input" value={user.email} disabled />
      </div>
      <div className="rc-field">
        <label className="rc-label" htmlFor="pf-phone">Mobile number</label>
        <input id="pf-phone" className="rc-input" type="tel" inputMode="numeric" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      </div>
      <div className="rc-field">
        <label className="rc-label" htmlFor="pf-password">New password <span className="rc-muted">(optional)</span></label>
        <PasswordInput id="pf-password" autoComplete="new-password" minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      </div>
      <button type="submit" className="rc-btn" disabled={saving} style={{ justifySelf: 'start' }}>{saving ? <span className="rc-spinner" /> : 'Save changes'}</button>
    </form>
  );
};

const ProfileScreen = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const toast = useToast();
  const [tab, setTab] = useState<'orders' | 'details'>('orders');
  const user = state.user;

  useEffect(() => {
    if (!user) navigate('/login?redirect=/profile', { replace: true });
  }, [user, navigate]);

  if (!user) return null;

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    toast.show('You have been signed out.');
    navigate('/');
  };

  return (
    <>
      <Seo title="My account" noindex />
      <header className="rc-page-head">
        <div className="rc-container" style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
          <div className="rc-avatar" aria-hidden>{user.name.charAt(0).toUpperCase()}</div>
          <div>
            <span className="rc-eyebrow">My account</span>
            <h1 className="rc-h2" style={{ marginTop: 6 }}>Hello, {user.name.split(' ')[0]}</h1>
          </div>
        </div>
      </header>
      <div className="rc-container rc-section" style={{ paddingTop: 40 }}>
        <div className="rc-account">
          <nav className="rc-account__nav" aria-label="Account">
            <button type="button" className={tab === 'orders' ? 'is-active' : ''} onClick={() => setTab('orders')}><Package size={18} /> Orders</button>
            <button type="button" className={tab === 'details' ? 'is-active' : ''} onClick={() => setTab('details')}><UserRound size={18} /> Your details</button>
            <Link to="/wishlist"><Heart size={18} /> Wishlist</Link>
            {user.isAdmin && <Link to="/admin"><LayoutDashboard size={18} /> Admin panel</Link>}
            <button type="button" onClick={logout}><LogOut size={18} /> Sign out</button>
          </nav>
          <div>{tab === 'orders' ? <OrdersTab /> : <DetailsTab />}</div>
        </div>
      </div>
    </>
  );
};

export default ProfileScreen;
