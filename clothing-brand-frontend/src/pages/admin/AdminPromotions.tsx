import { useEffect, useMemo, useRef, useState } from 'react';
import { Copy, Info, Plus, Shuffle, Tag, Trash2 } from 'lucide-react';
import { useAppContext, type Coupon, type Product } from '../../context/AppContext';
import { API_ENDPOINTS, apiCall, fetchJSON, postJSON } from '../../utils/api';
import { errorMessage, productId as idOf } from '../../lib/format';
import { useToast } from '../../lib/toast';
import { Badge, Card, EmptyState, Field, PageHeader, SkeletonRows, Switch, Tabs, type Tone } from '../../components/admin/ui';
import '../../styles/admin-insights.css';

type AppliesTo = 'all' | 'category' | 'product';
type Filter = 'all' | 'active' | 'paused' | 'ended';
type CouponState = { key: 'active' | 'paused' | 'expired' | 'used-up'; label: string; tone: Tone };

const newCode = () => `RC${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
const DAY = 86_400_000;

const couponState = (c: Coupon, now: number): CouponState => {
  if (c.expiresAt && new Date(c.expiresAt).getTime() < now) return { key: 'expired', label: 'Expired', tone: 'danger' };
  if (c.usageLimit && (c.used || 0) >= c.usageLimit) return { key: 'used-up', label: 'Used up', tone: 'gold' };
  if (!c.active) return { key: 'paused', label: 'Paused', tone: 'neutral' };
  return { key: 'active', label: 'Active', tone: 'success' };
};

/** The coupon list arrives with the product populated; a freshly saved coupon has just its id. */
const couponProduct = (c: Coupon, products: Product[]) => {
  const raw = c.productId as unknown;
  if (!raw) return null;
  if (typeof raw === 'object') {
    const p = raw as { _id?: string; name?: string };
    return { id: String(p._id ?? ''), name: p.name || products.find((x) => idOf(x) === String(p._id))?.name || 'A product' };
  }
  const id = String(raw);
  return { id, name: products.find((x) => idOf(x) === id)?.name || 'A product no longer in the shop' };
};

const appliesText = (c: Coupon, products: Product[]) => {
  const p = couponProduct(c, products);
  if (p) return p.name;
  if (c.applicableCategories?.length) return c.applicableCategories.join(', ');
  return 'Everything';
};

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const AdminPromotions = () => {
  const { state, dispatch } = useAppContext();
  const toast = useToast();
  const [loaded, setLoaded] = useState(false);
  const [now] = useState(() => Date.now());
  const [filter, setFilter] = useState<Filter>('all');
  const [busy, setBusy] = useState<string | null>(null);
  const codeRef = useRef<HTMLInputElement>(null);

  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('10');
  const [appliesTo, setAppliesTo] = useState<AppliesTo>('all');
  const [category, setCategory] = useState('');
  const [productId, setProductId] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [saving, setSaving] = useState(false);
  const [tried, setTried] = useState(false);

  useEffect(() => {
    fetchJSON<Coupon[]>(API_ENDPOINTS.COUPONS)
      .then((list) => { dispatch({ type: 'SET_COUPONS', payload: Array.isArray(list) ? list : [] }); setLoaded(true); })
      .catch((err) => { toast.error(errorMessage(err, 'Couldn’t load coupons')); setLoaded(true); });
  }, [dispatch, toast]);

  const categories = useMemo(
    () => [...new Set(state.products.map((p) => p.category).filter(Boolean))].sort(),
    [state.products],
  );
  const products = useMemo(() => [...state.products].sort((a, b) => a.name.localeCompare(b.name)), [state.products]);

  const coupons = state.coupons;
  const withState = coupons.map((c) => ({ c, s: couponState(c, now) }));
  const counts = {
    all: coupons.length,
    active: withState.filter((x) => x.s.key === 'active').length,
    paused: withState.filter((x) => x.s.key === 'paused').length,
    ended: withState.filter((x) => x.s.key === 'expired' || x.s.key === 'used-up').length,
  };
  const visible = withState.filter(({ s }) => filter === 'all'
    || (filter === 'ended' ? s.key === 'expired' || s.key === 'used-up' : s.key === filter));

  // Validation (shown after the first submit attempt).
  const cleanCode = code.trim().toUpperCase();
  const pct = Number(discount);
  const errors = {
    code: !cleanCode ? 'Enter a code or press Generate'
      : !/^[A-Z0-9_-]{3,20}$/.test(cleanCode) ? 'Use 3–20 letters or numbers, no spaces'
        : coupons.some((c) => c.code === cleanCode) ? 'You already have a coupon with this code' : '',
    discount: !discount || !Number.isFinite(pct) || pct <= 0 || pct > 100 ? 'Enter a percentage between 1 and 100' : '',
    category: appliesTo === 'category' && !category ? 'Choose a category' : '',
    product: appliesTo === 'product' && !productId ? 'Choose a product' : '',
    limit: usageLimit && (!Number.isInteger(Number(usageLimit)) || Number(usageLimit) < 1) ? 'Enter a whole number, or leave empty' : '',
  };
  const invalid = Object.values(errors).some(Boolean);
  const show = (k: keyof typeof errors) => (tried ? errors[k] || undefined : undefined);
  const today = new Date(now).toLocaleDateString('en-CA');

  const reset = () => {
    setCode(''); setDiscount('10'); setAppliesTo('all'); setCategory(''); setProductId(''); setExpiresAt(''); setUsageLimit(''); setTried(false);
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (invalid) return;
    setSaving(true);
    const payload = {
      code: cleanCode,
      discountPercent: pct,
      active: true,
      productId: appliesTo === 'product' ? productId : null,
      applicableCategories: appliesTo === 'category' ? [category] : [],
      // Valid until the end of the chosen day in the shop's time zone.
      expiresAt: expiresAt === '' ? null : new Date(`${expiresAt}T23:59:59`).toISOString(),
      usageLimit: usageLimit === '' ? null : Number(usageLimit),
      used: 0,
    };
    try {
      const created = await postJSON<Coupon>(API_ENDPOINTS.COUPONS, payload);
      dispatch({ type: 'ADD_COUPON', payload: created });
      toast.success(`Coupon ${created.code} is live`);
      reset();
    } catch (err) {
      toast.error(errorMessage(err, 'Couldn’t create the coupon'));
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (c: Coupon) => {
    setBusy(c.code);
    try {
      const updated = await postJSON<Coupon>(`${API_ENDPOINTS.COUPONS}/${encodeURIComponent(c.code)}`, { active: !c.active }, 'PUT');
      dispatch({ type: 'UPDATE_COUPON', payload: { ...c, ...updated, productId: c.productId } });
      toast.success(updated.active ? `${c.code} can be used again` : `${c.code} is paused`);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const remove = async (c: Coupon) => {
    if (!window.confirm(`Delete coupon ${c.code}? Customers won’t be able to use it any more. This can’t be undone.`)) return;
    setBusy(c.code);
    try {
      await apiCall(`${API_ENDPOINTS.COUPONS}/${encodeURIComponent(c.code)}`, { method: 'DELETE' });
      dispatch({ type: 'REMOVE_COUPON', payload: c.code });
      toast.success(`${c.code} deleted`);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); toast.success(`${text} copied`); } catch { toast.error('Couldn’t copy. Select the code instead.'); }
  };

  const goToForm = () => {
    codeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    codeRef.current?.focus({ preventScroll: true });
  };

  return (
    <>
      <PageHeader
        title="Coupons"
        description={loaded ? `${counts.active} active · ${coupons.length} in total` : 'Discount codes customers type at checkout.'}
        actions={<button type="button" className="ad-btn" onClick={goToForm}><Plus aria-hidden /> Create coupon</button>}
      />

      <div className="ad-alert ad-alert--info" style={{ marginBottom: 20 }}>
        <Info aria-hidden />
        <span>
          Coupons can’t be combined with the automatic “any 2 for ₹1499” bundle offers. Items that already got the bundle price
          aren’t discounted again; the coupon only applies to the other items in the bag.
        </span>
      </div>

      <div className="ad-grid ad-grid--main">
        <div className="ad-stack">
          {coupons.length > 0 && (
            <div style={{ display: 'flex', minWidth: 0 }}>
            <Tabs
              label="Filter coupons"
              value={filter}
              onChange={setFilter}
              items={[
                { key: 'all', label: 'All', count: counts.all },
                { key: 'active', label: 'Active', count: counts.active },
                { key: 'paused', label: 'Paused', count: counts.paused },
                { key: 'ended', label: 'Ended', count: counts.ended },
              ]}
            />
            </div>
          )}

          {!loaded && coupons.length === 0 ? (
            <Card flush><SkeletonRows rows={3} /></Card>
          ) : visible.length === 0 ? (
            <Card flush>
              <EmptyState
                icon={Tag}
                title={coupons.length ? 'No coupons here' : 'No coupons yet'}
                text={coupons.length ? 'Try a different filter.' : 'Create a code like DIWALI10 and share it on Instagram or WhatsApp. Customers enter it at checkout.'}
                action={coupons.length ? undefined : <button type="button" className="ad-btn" onClick={goToForm}><Plus aria-hidden /> Create coupon</button>}
              />
            </Card>
          ) : (
            <div className="ad-insights-coupons">
              {visible.map(({ c, s }) => {
                const used = c.used || 0;
                const share = c.usageLimit ? Math.min(1, used / c.usageLimit) : 0;
                const daysLeft = c.expiresAt ? Math.ceil((new Date(c.expiresAt).getTime() - now) / DAY) : null;
                return (
                  <article key={c.code} className={`ad-coupon ad-insights-coupon${s.key === 'active' ? '' : ' is-off'}`}>
                    <div className="ad-insights-coupon__top">
                      <span className="ad-insights-coupon__code">
                        <span className="ad-coupon__code">{c.code}</span>
                        <button type="button" className="ad-icon-btn" onClick={() => copy(c.code)} aria-label={`Copy ${c.code}`}><Copy aria-hidden /></button>
                      </span>
                      <Badge tone={s.tone}>{s.label}</Badge>
                    </div>
                    <div className="ad-coupon__value">{c.discountPercent}% off</div>
                    <dl>
                      <div><dt>Applies to</dt><dd title={appliesText(c, state.products)}>{appliesText(c, state.products)}</dd></div>
                      {c.maxPriceThreshold != null && <div><dt>Items up to</dt><dd>₹{c.maxPriceThreshold.toLocaleString('en-IN')}</dd></div>}
                      <div>
                        <dt>Ends</dt>
                        <dd>
                          {c.expiresAt ? fmtDate(c.expiresAt) : 'No end date'}
                          {daysLeft !== null && daysLeft > 0 && daysLeft <= 7 && <span style={{ fontWeight: 400, color: 'var(--ad-muted)' }}> · {daysLeft} day{daysLeft === 1 ? '' : 's'} left</span>}
                        </dd>
                      </div>
                      <div>
                        <dt>Uses</dt>
                        <dd className="tabular">{c.usageLimit ? `${used} / ${c.usageLimit}` : `${used} · no limit`}</dd>
                      </div>
                    </dl>
                    {c.usageLimit ? (
                      <div className="ad-meter" role="meter" aria-label={`${used} of ${c.usageLimit} uses`} aria-valuemin={0} aria-valuemax={c.usageLimit} aria-valuenow={used}>
                        <span className={share >= 1 ? 'is-out' : share >= 0.8 ? 'is-low' : ''} style={{ width: `${Math.max(share * 100, used ? 4 : 0)}%` }} />
                      </div>
                    ) : null}
                    <div className="ad-insights-coupon__foot">
                      <Switch checked={c.active} onChange={() => { if (busy !== c.code) void toggle(c); }} label={c.active ? 'On' : 'Off'} />
                      {busy === c.code && <span className="ad-spinner" aria-label="Saving" />}
                      <button type="button" className="ad-icon-btn is-danger" onClick={() => remove(c)} disabled={busy === c.code} aria-label={`Delete ${c.code}`}><Trash2 aria-hidden /></button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <div className="ad-insights-sticky">
          <Card title="Create a coupon" description="Customers type this code at checkout.">
            <form onSubmit={create} noValidate>
              <Field label="Code" htmlFor="coupon-code" error={show('code')} hint="Short and easy to type, like DIWALI10. Letters and numbers only.">
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    ref={codeRef}
                    id="coupon-code"
                    className="ad-input"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                    placeholder="DIWALI10"
                    maxLength={20}
                    autoComplete="off"
                    style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', letterSpacing: '0.06em' }}
                  />
                  <button type="button" className="ad-btn ad-btn--secondary" style={{ flexShrink: 0 }} onClick={() => setCode(newCode())}><Shuffle aria-hidden /> Generate</button>
                </div>
              </Field>

              <Field label="Discount" htmlFor="coupon-discount" error={show('discount')} hint="Taken off the item price. Shipping is not discounted.">
                <div className="ad-input-group">
                  <span>%</span>
                  <input id="coupon-discount" className="ad-input" type="number" inputMode="numeric" min={1} max={100} value={discount} onChange={(e) => setDiscount(e.target.value)} />
                </div>
              </Field>

              <Field label="Applies to" htmlFor="coupon-applies" hint={appliesTo === 'all' ? 'Works on every item in the shop.' : appliesTo === 'category' ? 'Only items in this category get the discount.' : 'Only this product gets the discount.'}>
                <select id="coupon-applies" className="ad-select" value={appliesTo} onChange={(e) => setAppliesTo(e.target.value as AppliesTo)}>
                  <option value="all">All products</option>
                  <option value="category">One category</option>
                  <option value="product">One product</option>
                </select>
              </Field>

              {appliesTo === 'category' && (
                <Field label="Category" htmlFor="coupon-category" error={show('category')}>
                  <select id="coupon-category" className="ad-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="">Choose a category…</option>
                    {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </Field>
              )}

              {appliesTo === 'product' && (
                <Field label="Product" htmlFor="coupon-product" error={show('product')}>
                  <select id="coupon-product" className="ad-select" value={productId} onChange={(e) => setProductId(e.target.value)}>
                    <option value="">Choose a product…</option>
                    {products.map((p) => <option key={idOf(p)} value={idOf(p)}>{p.name}</option>)}
                  </select>
                </Field>
              )}

              <div className="ad-form-grid" style={{ marginTop: 16 }}>
                <Field label="Last day" htmlFor="coupon-expiry" optional hint="Leave empty to keep it running.">
                  <input id="coupon-expiry" className="ad-input" type="date" min={today} value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
                </Field>
                <Field label="Total uses" htmlFor="coupon-limit" optional error={show('limit')} hint="Empty means unlimited.">
                  <input id="coupon-limit" className="ad-input" type="number" inputMode="numeric" min={1} step={1} value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} placeholder="Unlimited" />
                </Field>
              </div>

              <button type="submit" className="ad-btn ad-btn--block" style={{ marginTop: 20 }} disabled={saving}>
                {saving ? <span className="ad-spinner" /> : <Plus aria-hidden />} {saving ? 'Creating…' : 'Create coupon'}
              </button>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AdminPromotions;
