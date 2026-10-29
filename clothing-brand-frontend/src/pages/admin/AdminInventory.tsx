import { useMemo, useState, type KeyboardEvent } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { AlertTriangle, Boxes, IndianRupee, Minus, PackageCheck, PackageX, Plus } from 'lucide-react';
import { useAppContext, type Product } from '../../context/AppContext';
import { API_ENDPOINTS, fetchJSON } from '../../utils/api';
import { availableSizes, isSoldOut } from '../../lib/catalog';
import { errorMessage, productId } from '../../lib/format';
import { inr, inrShort } from '../../lib/adminFormat';
import { useToast } from '../../lib/toast';
import { getImageUrl } from '../../utils/mediaHelper';
import { Badge, Card, EmptyState, PageHeader, SearchBox, SkeletonRows, Stat, Tabs, type Tone } from '../../components/admin/ui';
import '../../styles/admin-products.css';

type FilterKey = 'all' | 'low' | 'sold-out';

const LOW = 3;
const stockOf = (p: Product) => p.countInStock ?? p.stock ?? 0;
const isLow = (p: Product) => !isSoldOut(p) && stockOf(p) <= LOW;

const FILTERS: { key: FilterKey; label: string; test: (p: Product) => boolean }[] = [
  { key: 'all', label: 'All', test: () => true },
  { key: 'low', label: 'Low stock', test: isLow },
  { key: 'sold-out', label: 'Sold out', test: isSoldOut },
];

const statusOf = (p: Product): { label: string; tone: Tone } => {
  if (p.soldOut && stockOf(p) > 0) return { label: 'Marked sold out', tone: 'danger' };
  if (isSoldOut(p)) return { label: 'Sold out', tone: 'danger' };
  if (isLow(p)) return { label: 'Low stock', tone: 'warning' };
  return { label: 'In stock', tone: 'success' };
};

const AdminInventory = () => {
  const { state, dispatch } = useAppContext();
  const toast = useToast();
  const { refreshSummary } = useOutletContext<{ refreshSummary?: () => void }>() ?? {};
  const [filter, setFilter] = useState<FilterKey>('all');
  const [query, setQuery] = useState('');

  const products = state.products;
  const loading = state.productsStatus === 'idle' || state.productsStatus === 'loading';

  const summary = useMemo(() => {
    const inStock = products.filter((p) => !isSoldOut(p));
    return {
      inStock: inStock.length,
      units: inStock.reduce((s, p) => s + stockOf(p), 0),
      value: inStock.reduce((s, p) => s + stockOf(p) * (p.price || 0), 0),
      counts: Object.fromEntries(FILTERS.map((f) => [f.key, products.filter(f.test).length])) as Record<FilterKey, number>,
    };
  }, [products]);

  const visible = useMemo(() => {
    const f = FILTERS.find((x) => x.key === filter)!;
    const q = query.trim().toLowerCase();
    return products.filter(f.test).filter((p) => !q || [p.name, p.category].some((v) => String(v || '').toLowerCase().includes(q)));
  }, [products, filter, query]);

  /** Saves a new stock count. Only `stock` is sent, so every other field stays as it is. */
  const saveStock = async (p: Product, stock: number) => {
    const fd = new FormData();
    fd.append('stock', String(stock));
    try {
      const updated = await fetchJSON<Product>(`${API_ENDPOINTS.PRODUCTS}/${productId(p)}`, { method: 'PUT', body: fd });
      dispatch({ type: 'UPDATE_PRODUCT', payload: updated });
      refreshSummary?.();
      toast.success(`${p.name}: ${stock} in stock`);
      return true;
    } catch (err) {
      toast.error(errorMessage(err));
      return false;
    }
  };

  const { counts } = summary;

  return (
    <>
      <PageHeader
        title="Inventory"
        description={loading ? 'Loading stock…' : `${summary.inStock} in stock · ${counts.low} low · ${counts['sold-out']} sold out`}
        actions={<Link to="/admin/products" className="ad-btn ad-btn--secondary"><Boxes aria-hidden /> All products</Link>}
      />

      <div className="ad-grid ad-grid--stats" style={{ marginBottom: 20 }}>
        <Stat label="Units in stock" value={loading ? '—' : summary.units.toLocaleString('en-IN')} icon={Boxes} meta={`across ${summary.inStock} products`} />
        <Stat label="Stock value" value={loading ? '—' : inrShort(summary.value)} icon={IndianRupee} tone="gold" meta="at selling price" />
        <Stat label="Low stock" value={loading ? '—' : counts.low} icon={AlertTriangle} tone="gold" meta={`${LOW} or fewer left`} />
        <Stat label="Sold out" value={loading ? '—' : counts['sold-out']} icon={PackageX} meta="can’t be ordered" />
      </div>

      <div className="ad-toolbar">
        <Tabs label="Filter stock" value={filter} onChange={setFilter} items={FILTERS.map((f) => ({ key: f.key, label: f.label, count: counts[f.key] }))} />
        <div className="ad-toolbar__grow" />
        <SearchBox value={query} onChange={setQuery} placeholder="Search products" label="Search inventory" />
      </div>

      <Card flush>
        {loading ? <SkeletonRows rows={6} /> : visible.length === 0 ? (
          <EmptyState
            icon={filter === 'all' && !query ? Boxes : PackageCheck}
            title={query ? 'No matching products' : filter === 'low' ? 'Nothing is running low' : filter === 'sold-out' ? 'Nothing is sold out' : 'No products yet'}
            text={query ? 'Try a different name or category.' : filter === 'all' ? 'Add products to start tracking stock.' : 'Everything has enough stock right now.'}
            action={filter === 'all' && !query ? <Link to="/admin/products/add" className="ad-btn"><Plus aria-hidden /> Add product</Link> : undefined}
          />
        ) : (
          <div className="ad-table-wrap">
            <table className="ad-table ad-table--stack ad-products-table">
              <thead>
                <tr><th>Product</th><th>Category</th><th>Stock level</th><th>Status</th><th className="num">Update stock</th></tr>
              </thead>
              <tbody>
                {visible.map((p) => <StockRow key={`${productId(p)}:${stockOf(p)}`} product={p} onSave={saveStock} />)}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
};

const StockRow = ({ product: p, onSave }: { product: Product; onSave: (p: Product, stock: number) => Promise<boolean> }) => {
  const current = stockOf(p);
  const [draft, setDraft] = useState(String(current));
  const [saving, setSaving] = useState(false);
  const id = productId(p);
  const st = statusOf(p);
  const out = isSoldOut(p);
  const valid = /^\d+$/.test(draft.trim());
  const changed = valid && Number(draft) !== current;

  const step = (by: number) => setDraft((d) => String(Math.max(0, (Number(d) || 0) + by)));

  const save = async () => {
    if (!changed || saving) return;
    setSaving(true);
    const ok = await onSave(p, Number(draft));
    if (!ok) setSaving(false);
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); save(); }
    if (e.key === 'Escape') setDraft(String(current));
  };

  return (
    <tr>
      <td className="is-primary">
        <Link to={`/admin/products/${id}/edit`} className="ad-cell-main">
          <img src={getImageUrl(p.images?.[0] || p.image, 100)} alt="" loading="lazy" />
          <span style={{ minWidth: 0 }}>
            <strong>{p.name}</strong>
            <span>{inr(p.price)}{availableSizes(p.sizes).length ? ` · ${availableSizes(p.sizes).join(', ')}` : ''}</span>
          </span>
        </Link>
      </td>
      <td data-label="Category" className="muted">{p.category || '—'}</td>
      <td data-label="Stock level">
        <span className="ad-products-stock" style={{ justifyContent: 'flex-start' }}>
          <span className="ad-meter" aria-hidden>
            <span className={out ? 'is-out' : current <= LOW ? 'is-low' : ''} style={{ width: `${out ? 100 : Math.min(100, Math.max(6, (current / 20) * 100))}%` }} />
          </span>
          <span className="tabular">{current} left</span>
        </span>
      </td>
      <td data-label="Status"><Badge tone={st.tone}>{st.label}</Badge></td>
      <td data-label="Update stock" className="num">
        <div className="ad-products-stepper">
          <button type="button" className="ad-icon-btn" onClick={() => step(-1)} disabled={saving || Number(draft) <= 0} aria-label={`One less ${p.name}`}><Minus aria-hidden /></button>
          <input
            className="ad-input"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKey}
            disabled={saving}
            aria-label={`Stock for ${p.name}`}
            aria-invalid={!valid}
          />
          <button type="button" className="ad-icon-btn" onClick={() => step(1)} disabled={saving} aria-label={`One more ${p.name}`}><Plus aria-hidden /></button>
          <button type="button" className="ad-btn ad-btn--sm" onClick={save} hidden={!changed && !saving} disabled={saving}>
            {saving ? <span className="ad-spinner" /> : 'Save'}
          </button>
        </div>
      </td>
    </tr>
  );
};

export default AdminInventory;
