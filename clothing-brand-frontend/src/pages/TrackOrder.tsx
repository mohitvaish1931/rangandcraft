import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ExternalLink, PackageSearch, Search } from 'lucide-react';
import Seo from '../components/Seo';
import { HelpBand, InfoHero } from '../components/InfoPage';
import { useAppContext } from '../context/AppContext';
import { API_ENDPOINTS, postJSON } from '../utils/api';
import { errorMessage, formatDate, formatPrice } from '../lib/format';
import { getImageUrl } from '../utils/mediaHelper';

interface TrackedOrder {
  _id: string;
  orderNumber: string;
  status: string;
  paymentStatus?: string;
  isPaid?: boolean;
  createdAt: string;
  totalAmount: number;
  shippingAddress: { name: string; address: string; city: string; pincode: string };
  items: { product?: string; name: string; quantity: number; price: number; image?: string; size?: string }[];
  courierName?: string;
  awbNumber?: string;
  trackingUrl?: string;
}

const STEPS = ['Placed', 'Processing', 'Shipped', 'Delivered'];
const stepIndex = (o: TrackedOrder) => {
  if (o.status === 'Delivered') return 3;
  if (o.status === 'Shipped') return 2;
  if (o.isPaid || o.status === 'Processing') return 1;
  return 0;
};
const statusLabel = (o: TrackedOrder) => (o.status === 'Pending' && !o.isPaid ? 'Awaiting payment' : o.status);
const statusNote = (o: TrackedOrder) => {
  switch (o.status) {
    case 'Delivered': return 'Your order has been delivered. We hope you love it!';
    case 'Shipped': return 'Your parcel is on its way. Delivery usually takes 4–8 working days from dispatch.';
    case 'Cancelled': return 'This order was cancelled. If you were charged, the amount is refunded to your original payment method. Message us if you have any questions.';
    default: return o.isPaid
      ? 'We’re preparing your order. It’s usually dispatched within 2–3 working days.'
      : 'We haven’t received payment for this order yet. If money was debited, message us and we’ll sort it out.';
  }
};

const TrackOrder = () => {
  const [params] = useSearchParams();
  const { state } = useAppContext();
  const [orderNumber, setOrderNumber] = useState(params.get('order') ?? '');
  const [email, setEmail] = useState(params.get('email') ?? state.user?.email ?? '');
  const [loading, setLoading] = useState(Boolean(params.get('order') && params.get('email')));
  const [error, setError] = useState('');
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const lookup = useCallback((num: string, mail: string) =>
    postJSON<{ order: TrackedOrder }>(API_ENDPOINTS.ORDERS.TRACK, { orderNumber: num.trim(), email: mail.trim() })
      .then((data) => {
        setOrder(data.order);
        setError('');
        requestAnimationFrame(() => resultRef.current?.focus({ preventScroll: true }));
      })
      .catch((err) => {
        setOrder(null);
        setError(errorMessage(err, 'We could not find an order with those details.'));
      })
      .finally(() => setLoading(false)), []);

  // Links from order emails carry ?order=…&email=… so the result shows straight away.
  useEffect(() => {
    const num = params.get('order');
    const mail = params.get('email');
    if (num && mail) void lookup(num, mail);
  }, [params, lookup]);

  const track = (num: string, mail: string) => {
    setLoading(true);
    setError('');
    void lookup(num, mail);
  };

  const cancelled = order?.status === 'Cancelled';
  const current = order ? stepIndex(order) : 0;

  return (
    <>
      <Seo title="Track Your Order" description="Check the status of your Rang and Craft order with your order number and email." path="/track-order" />
      <InfoHero
        eyebrow="Customer care"
        title={<>Track your <em>order</em></>}
        intro="Enter your order number and the email you used at checkout."
      />

      <section className="rc-section">
        <div className="rc-container">
          <div className="rc-track">
            <form
              className="rc-panel"
              onSubmit={(e) => { e.preventDefault(); track(orderNumber, email); }}
              noValidate
            >
              <h2 className="rc-panel__title">Find your order</h2>
              <div className="rc-field">
                <label className="rc-label" htmlFor="track-order">Order number</label>
                <input
                  id="track-order"
                  className="rc-input"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="e.g. #A1B2C3D4"
                  autoComplete="off"
                  required
                />
              </div>
              <div className="rc-field" style={{ marginTop: 16 }}>
                <label className="rc-label" htmlFor="track-email">Email address</label>
                <input
                  id="track-email"
                  className="rc-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
              {error && <div className="rc-alert rc-alert--error" role="alert" style={{ marginTop: 16 }}>{error}</div>}
              <button type="submit" className="rc-btn rc-btn--block rc-btn--lg" style={{ marginTop: 20 }} disabled={loading || !orderNumber.trim() || !email.trim()}>
                {loading ? <><span className="rc-spinner" /> Searching…</> : <><Search size={16} /> Track order</>}
              </button>
              <p className="rc-muted" style={{ fontSize: 13, marginTop: 14 }}>
                Your order number is in your confirmation{state.user ? <>, and all your orders are in <Link to="/profile" className="rc-link">your account</Link></> : ''}.
              </p>
            </form>

            <div ref={resultRef} tabIndex={-1} aria-live="polite" style={{ outline: 'none' }}>
              {order ? (
                <article className="rc-panel rc-track__result">
                  <h2 className="rc-panel__title">
                    <span>Order #{order.orderNumber}</span>
                    <span className={`rc-status rc-status--${order.status}`}>{statusLabel(order)}</span>
                  </h2>
                  {!cancelled && (
                    <div className="rc-timeline" aria-label={`Order progress: ${STEPS[current]}`}>
                      {STEPS.map((s, i) => <div key={s} className={i <= current ? 'is-done' : ''}>{s}</div>)}
                    </div>
                  )}
                  <p className="rc-muted" style={{ fontSize: 14, marginTop: 10 }}>{statusNote(order)}</p>

                  {(order.courierName || order.awbNumber) && (
                    <div className="rc-alert rc-alert--info" style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>
                        {order.courierName && <>Shipped with <strong>{order.courierName}</strong></>}
                        {order.awbNumber && <> · AWB <strong>{order.awbNumber}</strong></>}
                      </span>
                      {order.trackingUrl && (
                        <a href={order.trackingUrl} target="_blank" rel="noreferrer" className="rc-btn rc-btn--sm">
                          Track with courier <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  )}

                  <div className="rc-track__items">
                    {order.items.map((item, i) => (
                      <div className="rc-track__item" key={i}>
                        <img src={getImageUrl(item.image, 120)} alt="" loading="lazy" />
                        <div>
                          {item.product ? <Link to={`/product/${item.product}`} className="rc-line__name">{item.name}</Link> : <span className="rc-line__name">{item.name}</span>}
                          <div className="rc-line__meta">Qty {item.quantity}{item.size ? ` · Size ${item.size}` : ''}</div>
                        </div>
                        <div>{formatPrice(item.price * item.quantity)}</div>
                      </div>
                    ))}
                  </div>

                  <dl className="rc-track__facts">
                    <div><dt>Placed on</dt><dd>{formatDate(order.createdAt)}</dd></div>
                    <div><dt>Order total</dt><dd>{formatPrice(order.totalAmount)}</dd></div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <dt>Delivering to</dt>
                      <dd>{order.shippingAddress.name}, {order.shippingAddress.address}, {order.shippingAddress.city} – {order.shippingAddress.pincode}</dd>
                    </div>
                  </dl>
                </article>
              ) : (
                <div className="rc-track__empty">
                  <PackageSearch size={44} strokeWidth={1.2} aria-hidden />
                  <p style={{ color: 'var(--rc-ink)', fontWeight: 500 }}>Your order status will appear here</p>
                  <p style={{ fontSize: 14, maxWidth: '36ch' }}>Orders are dispatched within 2–3 working days and delivered in 4–8 working days.</p>
                </div>
              )}
            </div>
          </div>

          <HelpBand
            title="Can’t find your order?"
            text="Message us with your name and phone number and we’ll look it up for you."
            message="Hi Rang and Craft! I need help tracking my order."
          />
        </div>
      </section>
    </>
  );
};

export default TrackOrder;
