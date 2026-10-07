import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PackageSearch, Search, SlidersHorizontal, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';
import Seo from '../components/Seo';
import { categoriesOf, hasAnySize, inPriceRanges, isOnSale, isSoldOut, matchesQuery, PRICE_RANGES, sizesOf, SORT_OPTIONS, sortProducts, type SortKey } from '../lib/catalog';
import { useScrollLock } from '../lib/motion';
import { productId } from '../lib/format';

const PAGE_SIZE = 24;

const ProductListPage = () => {
  const { state } = useAppContext();
  const [params, setParams] = useSearchParams();

  const category = params.get('category') || '';
  const query = params.get('q') || params.get('keyword') || '';
  const legacyTag = (params.get('tag') || '').toLowerCase();
  const saleOnly = params.get('sale') === '1' || legacyTag.includes('sale');
  const inStockOnly = params.get('instock') === '1';
  const list = (key: string) => (params.get(key) || '').split(',').map((v) => v.trim()).filter(Boolean);
  const sizes = list('size');
  const prices = list('price').filter((v) => PRICE_RANGES.some((r) => r.value === v));
  const [filtersOpen, setFiltersOpen] = useState(false);
  const sort = (SORT_OPTIONS.some((o) => o.value === params.get('sort')) ? params.get('sort') : 'featured') as SortKey;

  // Local search box text; re-synced whenever the URL query changes elsewhere.
  const [draft, setDraft] = useState(query);
  const [syncedQuery, setSyncedQuery] = useState(query);
  if (syncedQuery !== query) {
    setSyncedQuery(query);
    setDraft(query);
  }

  // "Load more" count resets whenever the filters change.
  const filterKey = [category, query, saleOnly, sort, inStockOnly, sizes.join(), prices.join()].join('|');
  const [paging, setPaging] = useState({ key: filterKey, count: PAGE_SIZE });
  const visibleCount = paging.key === filterKey ? paging.count : PAGE_SIZE;
  const showMore = () => setPaging({ key: filterKey, count: visibleCount + PAGE_SIZE });

  const update = useCallback((changes: Record<string, string | null>) => {
    setParams((current) => {
      const next = new URLSearchParams(current);
      Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
      next.delete('tag');
      return next;
    }, { replace: true });
  }, [setParams]);

  // Debounce typing into the URL so results update as you type.
  useEffect(() => {
    if (draft === query) return;
    const t = window.setTimeout(() => update({ q: draft.trim() || null, keyword: null }), 250);
    return () => window.clearTimeout(t);
  }, [draft, query, update]);

  const categories = useMemo(() => categoriesOf(state.products), [state.products]);
  const allSizes = useMemo(() => sizesOf(state.products), [state.products]);

  const results = sortProducts(
    state.products.filter((p) =>
      (!category || p.category === category) &&
      (!saleOnly || isOnSale(p)) &&
      (!inStockOnly || !isSoldOut(p)) &&
      hasAnySize(p, sizes) &&
      inPriceRanges(p, prices) &&
      matchesQuery(p, query)),
    sort,
  );

  const toggleIn = (key: 'size' | 'price', values: string[], value: string) => {
    const next = values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
    update({ [key]: next.length ? next.join(',') : null });
  };
  const panelFilters = sizes.length + prices.length + Number(inStockOnly) + Number(saleOnly);

  const loading = state.productsStatus === 'loading' || state.productsStatus === 'idle';
  const title = category || (saleOnly ? 'Sale' : query ? `Results for “${query}”` : sort === 'newest' ? 'New Arrivals' : 'Shop All');
  const hasFilters = Boolean(category || query || saleOnly || inStockOnly || sizes.length || prices.length);

  return (
    <>
      <Seo
        title={category ? `${category} for Men` : saleOnly ? 'Sale' : 'Shop Men’s Kurtas & Shirts'}
        description={`Browse ${category ? category.toLowerCase() : 'men’s kurtas, shirts and co-ord sets'} from Rang and Craft, crafted in Jaipur. Free shipping above ₹1499.`}
        path={category ? `/shop?category=${encodeURIComponent(category)}` : '/shop'}
      />

      <header className="rc-page-head">
        <div className="rc-container">
          <ol className="rc-crumbs" aria-label="Breadcrumb">
            <li><Link to="/">Home</Link></li>
            <li>{category ? <Link to="/shop">Shop</Link> : 'Shop'}</li>
            {category && <li aria-current="page">{category}</li>}
          </ol>
          <h1 className="rc-h1">{title}</h1>
          <p className="rc-lead">
            {saleOnly
              ? 'Our best prices on favourite prints — while stocks last.'
              : 'Breathable kurtas, shirts and sets, crafted in Jaipur for every day and every occasion.'}
          </p>
        </div>
      </header>

      <div className="rc-toolbar">
        <div className="rc-container">
          <div className="rc-toolbar__row rc-toolbar__row--wrap">
            <div className="rc-toolbar__chips" role="group" aria-label="Filter by category">
              <button type="button" className={`rc-chip${!category && !saleOnly ? ' is-active' : ''}`} onClick={() => update({ category: null, sale: null })}>All</button>
              <button type="button" className={`rc-chip${saleOnly ? ' is-active' : ''}`} onClick={() => update({ sale: saleOnly ? null : '1' })}>Sale</button>
              {categories.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  className={`rc-chip${category === c.name ? ' is-active' : ''}`}
                  onClick={() => update({ category: category === c.name ? null : c.name })}
                  aria-pressed={category === c.name}
                >
                  {c.name}
                </button>
              ))}
            </div>
            <div className="rc-toolbar__controls">
              <div className="rc-toolbar__search">
                <Search size={16} aria-hidden />
                <label htmlFor="shop-search" className="rc-sr-only">Search products</label>
                <input id="shop-search" className="rc-input" type="search" placeholder="Search" value={draft} onChange={(e) => setDraft(e.target.value)} />
              </div>
              <button type="button" className={`rc-filter-btn${panelFilters ? ' is-active' : ''}`} onClick={() => setFiltersOpen(true)} aria-haspopup="dialog">
                <SlidersHorizontal size={16} aria-hidden /> Filters{panelFilters > 0 && <span className="rc-filter-btn__count">{panelFilters}</span>}
              </button>
              <label htmlFor="shop-sort" className="rc-sr-only">Sort by</label>
              <select id="shop-sort" className="rc-select" value={sort} onChange={(e) => update({ sort: e.target.value === 'featured' ? null : e.target.value })}>
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      <section className="rc-container" style={{ paddingBottom: 'clamp(56px, 8vw, 100px)' }}>
        {state.productsStatus === 'error' ? (
          <div className="rc-empty">
            <PackageSearch size={44} strokeWidth={1.2} />
            <h2 className="rc-h3">We couldn’t load the collection</h2>
            <p>Please check your connection and try again.</p>
            <button type="button" className="rc-btn" onClick={() => window.location.reload()}>Try again</button>
          </div>
        ) : loading ? (
          <div className="rc-grid">{Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}</div>
        ) : results.length === 0 ? (
          <div className="rc-empty">
            <PackageSearch size={44} strokeWidth={1.2} />
            <h2 className="rc-h3">Nothing matches just yet</h2>
            <p>Try a different search or clear your filters to see the full collection.</p>
            <button type="button" className="rc-btn" onClick={() => setParams({}, { replace: true })}>Clear filters</button>
          </div>
        ) : (
          <>
            <div className="rc-result-meta">
              <span aria-live="polite">{results.length} {results.length === 1 ? 'piece' : 'pieces'}</span>
              <span style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                {sizes.map((sz) => (
                  <button key={sz} type="button" className="rc-chip is-active" style={{ minHeight: 32 }} onClick={() => toggleIn('size', sizes, sz)} aria-label={`Remove size ${sz} filter`}>
                    Size {sz} <X size={13} />
                  </button>
                ))}
                {prices.map((pr) => (
                  <button key={pr} type="button" className="rc-chip is-active" style={{ minHeight: 32 }} onClick={() => toggleIn('price', prices, pr)} aria-label={`Remove price filter ${PRICE_RANGES.find((r) => r.value === pr)?.label}`}>
                    {PRICE_RANGES.find((r) => r.value === pr)?.label} <X size={13} />
                  </button>
                ))}
                {inStockOnly && (
                  <button type="button" className="rc-chip is-active" style={{ minHeight: 32 }} onClick={() => update({ instock: null })} aria-label="Remove in stock filter">
                    In stock <X size={13} />
                  </button>
                )}
                {hasFilters && (
                  <button type="button" className="rc-chip" style={{ minHeight: 32 }} onClick={() => { setDraft(''); setParams({}, { replace: true }); }}>
                    <X size={14} /> Clear all
                  </button>
                )}
              </span>
            </div>
            <div className="rc-grid">
              {results.slice(0, visibleCount).map((p, i) => <ProductCard key={productId(p)} product={p} priority={i < 4} />)}
            </div>
            {visibleCount < results.length && (
              <div style={{ textAlign: 'center', marginTop: 48 }}>
                <p className="rc-muted" style={{ fontSize: 14, marginBottom: 14 }}>Showing {visibleCount} of {results.length}</p>
                <button type="button" className="rc-btn rc-btn--outline" onClick={showMore}>Load more</button>
              </div>
            )}
          </>
        )}
      </section>

      <FilterDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        resultCount={results.length}
        sizes={allSizes}
        selectedSizes={sizes}
        selectedPrices={prices}
        inStockOnly={inStockOnly}
        saleOnly={saleOnly}
        onToggleSize={(v) => toggleIn('size', sizes, v)}
        onTogglePrice={(v) => toggleIn('price', prices, v)}
        onInStock={(on) => update({ instock: on ? '1' : null })}
        onSale={(on) => update({ sale: on ? '1' : null })}
        onClear={() => update({ size: null, price: null, instock: null, sale: null })}
      />
    </>
  );
};

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  resultCount: number;
  sizes: string[];
  selectedSizes: string[];
  selectedPrices: string[];
  inStockOnly: boolean;
  saleOnly: boolean;
  onToggleSize: (size: string) => void;
  onTogglePrice: (range: string) => void;
  onInStock: (on: boolean) => void;
  onSale: (on: boolean) => void;
  onClear: () => void;
}

const FilterDrawer = (props: FilterDrawerProps) => {
  const { open, onClose, resultCount, sizes, selectedSizes, selectedPrices } = props;
  const closeRef = useRef<HTMLButtonElement>(null);
  useScrollLock(open);
  useEffect(() => {
    if (!open) return;
    window.setTimeout(() => closeRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <>
      <div className={`rc-overlay${open ? ' is-open' : ''}`} onClick={onClose} aria-hidden />
      <aside className={`rc-drawer rc-drawer--right${open ? ' is-open' : ''}`} data-lenis-prevent role="dialog" aria-modal="true" aria-label="Filters" aria-hidden={!open}>
        <div className="rc-drawer__head">
          <span className="rc-drawer__title">Filters</span>
          <button ref={closeRef} type="button" className="rc-icon-btn" onClick={onClose} aria-label="Close filters"><X size={22} /></button>
        </div>
        <div className="rc-drawer__body">
          {sizes.length > 0 && (
            <fieldset className="rc-filter-group">
              <legend>Size</legend>
              <div className="rc-swatches">
                {sizes.map((s) => (
                  <button key={s} type="button" className={`rc-swatch${selectedSizes.includes(s) ? ' is-active' : ''}`} aria-pressed={selectedSizes.includes(s)} onClick={() => props.onToggleSize(s)}>{s}</button>
                ))}
              </div>
            </fieldset>
          )}
          <fieldset className="rc-filter-group">
            <legend>Price</legend>
            {PRICE_RANGES.map((r) => (
              <label key={r.value} className="rc-check">
                <input type="checkbox" checked={selectedPrices.includes(r.value)} onChange={() => props.onTogglePrice(r.value)} />
                <span>{r.label}</span>
              </label>
            ))}
          </fieldset>
          <fieldset className="rc-filter-group">
            <legend>Availability</legend>
            <label className="rc-check">
              <input type="checkbox" checked={props.inStockOnly} onChange={(e) => props.onInStock(e.target.checked)} />
              <span>In stock only</span>
            </label>
            <label className="rc-check">
              <input type="checkbox" checked={props.saleOnly} onChange={(e) => props.onSale(e.target.checked)} />
              <span>On sale</span>
            </label>
          </fieldset>
        </div>
        <div className="rc-drawer__foot" style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="rc-btn rc-btn--outline" onClick={props.onClear}>Clear</button>
          <button type="button" className="rc-btn" style={{ flex: 1 }} onClick={onClose}>
            Show {resultCount} {resultCount === 1 ? 'piece' : 'pieces'}
          </button>
        </div>
      </aside>
    </>
  );
};

export default ProductListPage;
