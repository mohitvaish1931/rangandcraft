import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, Lock, ShieldCheck, ShoppingBag, Tag, Truck, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { estimateBag, FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from '../lib/offers';
import Seo from '../components/Seo';
import { API_ENDPOINTS, postJSON } from '../utils/api';
import { errorMessage, formatPrice } from '../lib/format';
import { fetchQuote, getPaymentConfig, loadRazorpay, toOrderItems, type Quote, type ShippingAddress } from '../lib/checkout';
import { getImageUrl } from '../utils/mediaHelper';
import { useToast } from '../lib/toast';
import { whatsappLink } from '../lib/brand';

const ADDRESS_KEY = 'rc_address';

const emptyAddress: ShippingAddress = { name: '', email: '', phoneNumber: '', address: '', city: '', postalCode: '', country: 'India' };

const readSavedAddress = (): ShippingAddress => {
  try {
    return { ...emptyAddress, ...JSON.parse(localStorage.getItem(ADDRESS_KEY) || '{}') };
  } catch {
    return emptyAddress;
  }
};

type Errors = Partial<Record<keyof ShippingAddress, string>>;

const validate = (a: ShippingAddress): Errors => {
  const e: Errors = {};
  if (!a.name.trim()) e.name = 'Please enter your full name';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email.trim())) e.email = 'Please enter a valid email';
  if (!/^[6-9]\d{9}$/.test(a.phoneNumber.replace(/\D/g, '').slice(-10))) e.phoneNumber = 'Please enter a valid 10-digit mobile number';
  if (a.address.trim().length < 8) e.address = 'Please enter your full address (house no., street, area)';
  if (!a.city.trim()) e.city = 'Please enter your city';
  if (!/^[1-9]\d{5}$/.test(a.postalCode.trim())) e.postalCode = 'Please enter a valid 6-digit pincode';
  return e;
};

interface RazorpayResponse { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }
type RazorpayCtor = new (options: Record<string, unknown>) => { open: () => void; on: (event: string, cb: (r: { error?: { description?: string } }) => void) => void };

const CheckoutScreen = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const toast = useToast();

  const [address, setAddress] = useState<ShippingAddress>(() => {
    const saved = readSavedAddress();
    return { ...saved, name: saved.name || state.user?.name || '', email: saved.email || state.user?.email || '', phoneNumber: saved.phoneNumber || state.user?.phone || '' };
  });
  const [errors, setErrors] = useState<Errors>({});
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState<string | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteError, setQuoteError] = useState('');
  const [placing, setPlacing] = useState(false);
  const [applying, setApplying] = useState(false);

  const cartSignature = useMemo(() => JSON.stringify(toOrderItems(state.cart)), [state.cart]);

  // The server is the source of truth for prices, discounts and stock.
  useEffect(() => {
    if (state.cart.length === 0) return;
    let alive = true;
    fetchQuote(state.cart, coupon)
      .then((q) => {
        if (!alive) return;
        setQuote(q);
        setQuoteError('');
        if (coupon && q.couponError) {
          toast.error(q.couponError);
          setCoupon(null);
        }
      })
      .catch((err) => alive && setQuoteError(errorMessage(err)));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartSignature, coupon]);

  const applyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setApplying(true);
    try {
      const q = await fetchQuote(state.cart, code);
      if (q.couponError || !q.couponCode) {
        toast.error(q.couponError || 'This coupon cannot be applied.');
      } else {
        setCoupon(q.couponCode);
        setQuote(q);
        setCouponInput('');
        toast.success(`Coupon ${q.couponCode} applied — you save ${formatPrice(q.discountAmount)}`);
      }
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setApplying(false);
    }
  };

  const onField = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress((a) => ({ ...a, [name]: value }));
    if (errors[name as keyof ShippingAddress]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const finish = (orderId: string, order: unknown) => {
    dispatch({ type: 'CLEAR_CART' });
    navigate(`/order-success/${orderId}`, { replace: true, state: { order } });
  };

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate(address);
    setErrors(found);
    if (Object.keys(found).length) {
      document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }

    const cleanAddress = { ...address, phoneNumber: address.phoneNumber.replace(/\D/g, '').slice(-10) };
    try { localStorage.setItem(ADDRESS_KEY, JSON.stringify(cleanAddress)); } catch { /* ignore */ }

    setPlacing(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const order = await postJSON<any>(API_ENDPOINTS.ORDERS.BASE, {
        orderItems: toOrderItems(state.cart),
        shippingAddress: cleanAddress,
        couponCode: coupon,
      });

      if (order.totalPrice === 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = await postJSON<any>(API_ENDPOINTS.PAYMENT.BYPASS, { mongo_order_id: order._id });
        finish(order._id, res.order);
        return;
      }

      const config = await getPaymentConfig();
      if (!config.enabled) throw new Error('Online payments are temporarily unavailable. Please message us on WhatsApp to complete your order.');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rzpOrder = await postJSON<any>(API_ENDPOINTS.PAYMENT.CREATE, { orderId: order._id });

      const verify = async (response: RazorpayResponse) => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const result = await postJSON<any>(API_ENDPOINTS.PAYMENT.VERIFY, { ...response, mongo_order_id: order._id });
          finish(order._id, result.order);
        } catch (err) {
          setPlacing(false);
          toast.error(`${errorMessage(err)} If money was deducted, please contact us with order ${String(order._id).slice(-8).toUpperCase()}.`);
        }
      };

      if (rzpOrder.mock) {
        await verify({ razorpay_order_id: rzpOrder.id, razorpay_payment_id: `mock_${Date.now()}`, razorpay_signature: 'mock' });
        return;
      }

      if (!(await loadRazorpay())) throw new Error('Could not load the payment window. Please check your connection and try again.');

      const Razorpay = (window as unknown as { Razorpay: RazorpayCtor }).Razorpay;
      const checkout = new Razorpay({
        key: config.keyId,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        order_id: rzpOrder.id,
        name: 'Rang and Craft',
        description: `Order ${String(order._id).slice(-8).toUpperCase()}`,
        image: `${window.location.origin}/images/logo.png`,
        prefill: { name: cleanAddress.name, email: cleanAddress.email, contact: cleanAddress.phoneNumber },
        notes: { order_id: order._id },
        theme: { color: '#1f4645' },
        handler: verify,
        modal: {
          ondismiss: () => {
            setPlacing(false);
            toast.show('Payment was cancelled. Your bag is saved — you can try again any time.');
          },
        },
      });
      checkout.on('payment.failed', (r) => {
        toast.error(r.error?.description || 'Payment failed. No money was taken — please try again.');
      });
      checkout.open();
    } catch (err) {
      setPlacing(false);
      toast.error(errorMessage(err));
    }
  };

  if (state.cart.length === 0) {
    return (
      <div className="rc-container rc-section">
        <Seo title="Checkout" noindex />
        <div className="rc-empty">
          <ShoppingBag size={48} strokeWidth={1.2} />
          <h1 className="rc-h3">Your bag is empty</h1>
          <p>Add something you love and come back to check out.</p>
          <Link to="/shop" className="rc-btn">Shop the collection</Link>
        </div>
      </div>
    );
  }

  const estimate = estimateBag(state.cart);
  const total = quote?.totalPrice ?? estimate.total;
  const offerDiscount = quote?.offerDiscount ?? estimate.offerDiscount;
  const shippingPrice = quote?.shippingPrice ?? estimate.shippingPrice;

  const field = (name: keyof ShippingAddress, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}, span2 = false) => (
    <div className={`rc-field${span2 ? ' rc-span-2' : ''}`}>
      <label className="rc-label" htmlFor={`co-${name}`}>{label}</label>
      <input
        id={`co-${name}`}
        name={name}
        className="rc-input"
        value={address[name]}
        onChange={onField}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={errors[name] ? `co-${name}-err` : undefined}
        {...props}
      />
      {errors[name] && <span id={`co-${name}-err`} className="rc-field-error">{errors[name]}</span>}
    </div>
  );

  return (
    <>
      <Seo title="Checkout" noindex />
      <div className="rc-container" style={{ paddingBlock: 'clamp(28px, 4vw, 48px) clamp(56px, 8vw, 96px)' }}>
        <div className="rc-steps" aria-label="Checkout progress">
          <Link to="/cart">Bag</Link><span>›</span><span className="is-active">Details & payment</span><span>›</span><span>Confirmation</span>
        </div>

        <form className="rc-checkout" onSubmit={placeOrder} noValidate>
          <div>
            <section className="rc-panel">
              <h2 className="rc-panel__title"><span className="rc-step-num">1</span> Contact</h2>
              <div className="rc-form-grid">
                {field('name', 'Full name', { autoComplete: 'name', required: true }, true)}
                {field('email', 'Email', { type: 'email', autoComplete: 'email', required: true })}
                {field('phoneNumber', 'Mobile number', { type: 'tel', autoComplete: 'tel', inputMode: 'numeric', placeholder: '10-digit mobile', required: true })}
              </div>
              {!state.user && (
                <p className="rc-muted" style={{ fontSize: 14, marginTop: 14 }}>
                  Have an account? <Link to="/login?redirect=/checkout">Sign in</Link> to see your orders later.
                </p>
              )}
            </section>

            <section className="rc-panel">
              <h2 className="rc-panel__title"><span className="rc-step-num">2</span> Delivery address</h2>
              <div className="rc-form-grid">
                {field('address', 'Address', { autoComplete: 'street-address', placeholder: 'House no., building, street, area', required: true }, true)}
                {field('city', 'City', { autoComplete: 'address-level2', required: true })}
                {field('postalCode', 'Pincode', { autoComplete: 'postal-code', inputMode: 'numeric', maxLength: 6, required: true })}
              </div>
              <div className="rc-alert rc-alert--info" style={{ marginTop: 16 }}>
                <Truck size={18} /> Free shipping on orders of {formatPrice(FREE_SHIPPING_THRESHOLD)} and above ({formatPrice(SHIPPING_FEE)} below). Orders are usually dispatched within 2–3 working days and delivered in 4–8 working days.
              </div>
            </section>

            <section className="rc-panel">
              <h2 className="rc-panel__title"><span className="rc-step-num">3</span> Payment</h2>
              <p className="rc-muted" style={{ marginBottom: 18 }}>
                Pay securely with UPI, cards, netbanking or wallets via Razorpay. You’ll be asked to confirm the payment in the next step.
              </p>
              {quoteError && <div className="rc-alert rc-alert--error" role="alert" style={{ marginBottom: 16 }}>{quoteError}</div>}
              <button type="submit" className="rc-btn rc-btn--block rc-btn--lg" disabled={placing || Boolean(quoteError)}>
                {placing ? <><span className="rc-spinner" /> Processing…</> : <><Lock size={16} /> Pay {formatPrice(total)}</>}
              </button>
              <div className="rc-trust-row">
                <span><ShieldCheck size={14} /> 256-bit SSL secured</span>
                <span><Lock size={14} /> Payments by Razorpay</span>
              </div>
              <p className="rc-muted" style={{ fontSize: 13, textAlign: 'center', marginTop: 14 }}>
                Need help? <a href={whatsappLink('Hi! I need help placing my order.')} target="_blank" rel="noopener noreferrer">Chat with us on WhatsApp</a>
              </p>
            </section>
          </div>

          <aside className="rc-summary">
            <div className="rc-panel">
              <button type="button" className="rc-summary__toggle" aria-expanded={summaryOpen} aria-controls="co-summary" onClick={() => setSummaryOpen((o) => !o)}>
                <span>{summaryOpen ? 'Hide' : 'Show'} order summary <ChevronDown size={16} aria-hidden /></span>
                <strong>{formatPrice(total)}</strong>
              </button>
              <h2 className="rc-panel__title rc-summary__title">Order summary</h2>
              <div id="co-summary" className={`rc-summary__body${summaryOpen ? ' is-open' : ''}`}>
              {state.cart.map((item) => (
                <div className="rc-line" key={item.key}>
                  <div className="rc-thumb-qty">
                    <span className="rc-line__img"><img src={getImageUrl(item.image, 160)} alt="" /></span>
                    <b>{item.quantity}</b>
                  </div>
                  <div>
                    <div className="rc-line__name">{item.name}</div>
                    <div className="rc-line__meta">{[item.selectedSize && `Size ${item.selectedSize}`, item.selectedColor].filter(Boolean).join(' · ')}</div>
                  </div>
                  <div>{formatPrice(item.price * item.quantity)}</div>
                </div>
              ))}

              <div style={{ margin: '12px 0 16px' }}>
                {coupon ? (
                  <div className="rc-alert rc-alert--success" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Tag size={16} /> <strong>{coupon}</strong> applied</span>
                    <button type="button" className="rc-icon-btn" style={{ width: 32, height: 32 }} onClick={() => setCoupon(null)} aria-label="Remove coupon"><X size={16} /></button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <label htmlFor="co-coupon" className="rc-sr-only">Coupon code</label>
                    <input
                      id="co-coupon"
                      className="rc-input"
                      placeholder="Coupon code"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => { if (e.key === 'Enter') applyCoupon(e); }}
                      style={{ textTransform: 'uppercase', minHeight: 46 }}
                    />
                    <button type="button" className="rc-btn rc-btn--outline" style={{ minHeight: 46 }} onClick={applyCoupon} disabled={applying || !couponInput.trim()}>
                      {applying ? <span className="rc-spinner" /> : 'Apply'}
                    </button>
                  </div>
                )}
              </div>

              <div className="rc-summary-row"><span>Subtotal</span><span>{formatPrice(quote?.itemsPrice ?? estimate.itemsPrice)}</span></div>
              {offerDiscount > 0 && (
                <div className="rc-summary-row rc-summary-row--discount"><span>Bundle offer</span><span>−{formatPrice(offerDiscount)}</span></div>
              )}
              {(quote?.discountAmount ?? 0) > 0 && (
                <div className="rc-summary-row rc-summary-row--discount"><span>Coupon discount</span><span>−{formatPrice(quote!.discountAmount)}</span></div>
              )}
              <div className="rc-summary-row">
                <span>Shipping</span>
                {shippingPrice > 0
                  ? <span>{formatPrice(shippingPrice)}</span>
                  : <span style={{ color: 'var(--rc-success)' }}>Free</span>}
              </div>
              <div className="rc-summary-row rc-summary-row--total"><span>Total</span><span>{formatPrice(total)}</span></div>
              <p className="rc-muted" style={{ fontSize: 12, marginTop: 6 }}>Inclusive of all taxes</p>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </>
  );
};

export default CheckoutScreen;
