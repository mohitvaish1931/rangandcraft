import { useMemo, useState, type DragEvent } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowDown, ArrowDownUp, ArrowUp, Check, ExternalLink, GripVertical, Pencil, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useAppContext, type Product } from '../../context/AppContext';
import { API_ENDPOINTS, postJSON } from '../../utils/api';
import { availableSizes, categoriesOf, isSoldOut } from '../../lib/catalog';
import { errorMessage, productId } from '../../lib/format';
import { inr } from '../../lib/adminFormat';
import { useToast } from '../../lib/toast';
import { getImageUrl } from '../../utils/mediaHelper';
import { Badge, Card, EmptyState, PageHeader, SearchBox, SkeletonRows, Tabs, type Tone } from '../../components/admin/ui';
import '../../styles/admin-products.css';

type FilterKey = 'all' | 'active' | 'low' | 'sold-out' | 'off-home';

const LOW = 3;
const stockOf = (p: Product) => p.countInStock ?? p.stock ?? 0;
const isLow = (p: Product) => !isSoldOut(p) && stockOf(p) <= LOW;

const FILTERS: { key: FilterKey; label: string; test: (p: Product) => boolean }[] = [
  { key: 'all', label: 'All', test: () => true },
  { key: 'active', label: 'Active', test: (p) => !isSoldOut(p) },
  { key: 'low', label: 'Low stock', test: isLow },
  { key: 'sold-out', label: 'Sold out', test: isSoldOut },
  { key: 'off-home', label: 'Not on homepage', test: (p) => p.showOnHomepage === false },
];

const statusOf = (p: Product): { label: string; tone: Tone } => {
  if (isSoldOut(p)) return { label: 'Sold out', tone: 'danger' };
  if (isLow(p)) return { label: 'Low stock', tone: 'warning' };
  return { label: 'Active', tone: 'success' };
};

const AdminProducts = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const toast = useToast();
  const { refreshSummary } = useOutletContext<{ refreshSummary?: () => void }>() ?? {};
  const [filter, setFilter] = useState<FilterKey>('all');
  const [category, setCategory] = useState('');
  const [query, setQuery] = useState('');
  const [reordering, setReordering] = useState(false);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const products = state.products;
  const loading = state.productsStatus === 'idle' || state.productsStatus === 'loading';

  const counts = useMemo(
    () => Object.fromEntries(FILTERS.map((f) => [f.key, products.filter(f.test).length])) as Record<FilterKey, number>,
    [products],
  );
  const categories = useMemo(() => categoriesOf(products), [products]);

  const visible = useMemo(() => {
    if (reordering) return products;
    const f = FILTERS.find((x) => x.key === filter)!;
    const q = query.trim().toLowerCase();
    return products.filter(f.test)
      .filter((p) => !category || p.category === category)
      .filter((p) => !q || [p.name, p.category, ...(p.colors || [])].some((v) => String(v || '').toLowerCase().includes(q)));
  }, [products, filter, category, query, reordering]);

  const remove = async (p: Product) => {
    const id = productId(p);
    if (!window.confirm(`Delete “${p.name}”? This removes it from the shop and can’t be undone.`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`${API_ENDPOINTS.PRODUCTS}/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.message || 'Couldn’t delete the product.');
      }
      dispatch({ type: 'REMOVE_PRODUCT', payload: id });
      refreshSummary?.();
      toast.success(`“${p.name}” deleted`);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setDeleting(null);
    }
  };

  /** Moves a product to a new position and saves the shop order. */
  const move = async (from: number, to: number) => {
    if (from === to || to < 0 || to >= products.length) return;
    const previous = products;
    const next = [...products];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    dispatch({ type: 'SET_PRODUCTS', payload: next });
    try {
      await postJSON(`${API_ENDPOINTS.PRODUCTS}/reorder`, { products: next.map((p, idx) => ({ id: p._id || p.id, displayOrder: idx })) });
    } catch (err) {
      dispatch({ type: 'SET_PRODUCTS', payload: previous });
      toast.error(`Couldn’t save the new order. ${errorMessage(err)}`);
    }
  };

  const onDragEnd = () => {
    if (dragFrom !== null && dragOver !== null) move(dragFrom, dragOver);
    setDragFrom(null);
    setDragOver(null);
  };

  const clearFilters = () => { setFilter('all'); setCategory(''); setQuery(''); };
  const filtered = filter !== 'all' || category || query;

  return (
    <>
      <PageHeader
        title="Products"
        description={loading ? 'Loading products…' : `${products.length} product${products.length === 1 ? '' : 's'} · ${counts['sold-out']} sold out · ${counts.low} low on stock`}
        actions={reordering ? (
          <button type="button" className="ad-btn" onClick={() => setReordering(false)}><Check aria-hidden /> Done</button>
        ) : (
          <>
            <button type="button" className="ad-btn ad-btn--secondary" onClick={() => setReordering(true)} disabled={products.length < 2}>
              <ArrowDownUp aria-hidden /> Reorder
            </button>
            <Link to="/admin/products/add" className="ad-btn"><Plus aria-hidden /> Add product</Link>
          </>
        )}
      />

      {reordering ? (
        <div className="ad-alert ad-alert--info ad-products-notice">
          <ArrowDownUp aria-hidden />
          <span>Drag products, or use the arrows, to set the order they appear in the shop. Each change saves straight away.</span>
        </div>
      ) : (
        <div className="ad-toolbar">
          <Tabs label="Filter products" value={filter} onChange={setFilter} items={FILTERS.filter((f) => f.key !== 'off-home' || counts['off-home'] > 0 || filter === 'off-home').map((f) => ({ key: f.key, label: f.label, count: counts[f.key] }))} />
          <div className="ad-toolbar__grow" />
          <label className="rc-sr-only" htmlFor="products-category">Category</label>
          <select id="products-category" className="ad-select ad-products-filter" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {categories.map((c) => <option key={c.name} value={c.name}>{c.name} ({c.count})</option>)}
          </select>
          <SearchBox value={query} onChange={setQuery} placeholder="Search products" label="Search products" />
        </div>
      )}

      <Card flush>
        {loading ? <SkeletonRows rows={6} /> : visible.length === 0 ? (
          products.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title="Add your first product"
              text="Products you add appear in the shop straight away."
              action={<Link to="/admin/products/add" className="ad-btn"><Plus aria-hidden /> Add product</Link>}
            />
          ) : (
            <EmptyState
              icon={ShoppingBag}
              title="No matching products"
              text="Try a different search, category or tab."
              action={filtered ? <button type="button" className="ad-btn ad-btn--secondary" onClick={clearFilters}>Clear filters</button> : undefined}
            />
          )
        ) : (
          <div className="ad-table-wrap">
            <table className="ad-table ad-table--stack ad-products-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th className="num">Price</th>
                  <th className="num">Stock</th>
                  <th>Status</th>
                  <th className="actions"><span className="rc-sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {visible.map((p, idx) => {
                  const id = productId(p);
                  const stock = stockOf(p);
                  const st = statusOf(p);
                  const out = isSoldOut(p);
                  const sizes = availableSizes(p.sizes);
                  const sub = [sizes.length ? sizes.join(', ') : '', p.colors?.length ? `${p.colors.length} colour${p.colors.length === 1 ? '' : 's'}` : ''].filter(Boolean).join(' · ');
                  const dragProps = reordering ? {
                    draggable: true,
                    onDragStart: (e: DragEvent) => { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', id); setDragFrom(idx); },
                    onDragEnter: (e: DragEvent) => { e.preventDefault(); setDragOver(idx); },
                    onDragOver: (e: DragEvent) => e.preventDefault(),
                    onDragEnd,
                  } : {};
                  const rowClass = reordering
                    ? `${dragFrom === idx ? 'ad-products-dragging' : ''}${dragOver === idx && dragFrom !== idx ? ' ad-products-drop' : ''}`
                    : 'is-clickable';
                  return (
                    <tr key={id} className={rowClass} onClick={reordering ? undefined : () => navigate(`/admin/products/${id}/edit`)} {...dragProps}>
                      <td className="is-primary">
                        <div className="ad-cell-main">
                          {reordering && <span className="ad-products-grip" aria-hidden><GripVertical /></span>}
                          <img src={getImageUrl(p.images?.[0] || p.image, 100)} alt="" loading="lazy" />
                          <span style={{ minWidth: 0 }}>
                            {reordering ? <strong>{p.name}</strong> : (
                              <Link to={`/admin/products/${id}/edit`} onClick={(e) => e.stopPropagation()}><strong>{p.name}</strong></Link>
                            )}
                            <span>{sub || `ID ${id.slice(-6)}`}</span>
                          </span>
                        </div>
                      </td>
                      <td data-label="Category" className="muted">{p.category || '—'}</td>
                      <td data-label="Price" className="num">
                        <span className="ad-products-price">
                          <span style={{ fontWeight: 500 }}>{inr(p.price)}</span>
                          {p.originalPrice && p.originalPrice > p.price ? <s>{inr(p.originalPrice)}</s> : null}
                        </span>
                      </td>
                      <td data-label="Stock" className="num">
                        <span className="ad-products-stock">
                          <span className="ad-meter" aria-hidden>
                            <span className={out ? 'is-out' : stock <= LOW ? 'is-low' : ''} style={{ width: `${out ? 100 : Math.min(100, Math.max(6, (stock / 20) * 100))}%` }} />
                          </span>
                          <b>{stock}</b>
                        </span>
                      </td>
                      <td data-label="Status">
                        <span className="ad-products-flags">
                          <Badge tone={st.tone}>{st.label}</Badge>
                          {p.isBOGO && <Badge tone="gold" plain>Buy 1 Get 1</Badge>}
                        </span>
                      </td>
                      <td className="actions" onClick={(e) => e.stopPropagation()}>
                        {reordering ? (
                          <>
                            <button type="button" className="ad-icon-btn" onClick={() => move(idx, idx - 1)} disabled={idx === 0} aria-label={`Move ${p.name} up`}><ArrowUp aria-hidden /></button>
                            <button type="button" className="ad-icon-btn" onClick={() => move(idx, idx + 1)} disabled={idx === visible.length - 1} aria-label={`Move ${p.name} down`}><ArrowDown aria-hidden /></button>
                          </>
                        ) : (
                          <>
                            <a className="ad-icon-btn" href={`/product/${id}`} target="_blank" rel="noreferrer" aria-label={`View ${p.name} on the store`} title="View on store"><ExternalLink aria-hidden /></a>
                            <Link className="ad-icon-btn" to={`/admin/products/${id}/edit`} aria-label={`Edit ${p.name}`} title="Edit"><Pencil aria-hidden /></Link>
                            <button type="button" className="ad-icon-btn is-danger" onClick={() => remove(p)} disabled={deleting === id} aria-label={`Delete ${p.name}`} title="Delete">
                              {deleting === id ? <span className="ad-spinner" /> : <Trash2 aria-hidden />}
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
};

export default AdminProducts;
